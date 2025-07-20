const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateTokens, generateVerificationToken, generatePasswordResetToken } = require('../utils/jwt');
const { authenticateToken, authenticateRefreshToken } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken'); // Added missing import for jwt
const axios = require('axios');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('phone')
    .matches(/^(\+234|234|0)?[789][01]\d{8}$/)
    .withMessage('Please enter a valid Nigerian phone number'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role')
    .isIn(['student', 'artisan', 'employer'])
    .withMessage('Invalid role selected'),
  body('profile.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('profile.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('profile.dateOfBirth')
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('profile.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Please select a valid gender'),
  body('profile.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('profile.address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
];

const validateLogin = [
  body('emailOrPhone')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      email,
      phone,
      password,
      role,
      profile,
      preferences = {},
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmailOrPhone(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists',
      });
    }

    // Create user
    const user = new User({
      email,
      phone,
      password,
      role,
      profile,
      preferences,
    });

    await user.save();

    // Generate verification tokens
    const emailVerificationToken = generateVerificationToken(user._id, 'email');
    const phoneVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in user document (you might want to use Redis for this)
    user.verificationCode = phoneVerificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send verification emails/SMS
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      await sendVerificationEmail(user.email, emailVerificationToken, user.profile.firstName);
    }

    if (process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
      await sendSMS(user.phone, `Your LernBase verification code is: ${phoneVerificationCode}. Valid for 10 minutes.`);
    }

    // n8n onboarding automation
    if (process.env.N8N_ONBOARDING_WEBHOOK_URL) {
      axios.post(process.env.N8N_ONBOARDING_WEBHOOK_URL, {
        userId: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
      }).catch(err => {
        logger.error('Failed to trigger n8n onboarding workflow:', err.message);
      });
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    logger.info(`New user registered: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profile: user.profile,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        },
        tokens,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { emailOrPhone, password } = req.body;

    // Find user by email or phone
    const user = await User.findByEmailOrPhone(emailOrPhone).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const tokens = generateTokens(user._id);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profile: user.profile,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        },
        tokens,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', authenticateRefreshToken, async (req, res) => {
  try {
    const tokens = generateTokens(req.user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success response
    logger.info(`User logged out: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.purpose !== 'verification' || decoded.type !== 'email') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    user.emailVerified = true;
    user.isVerified = user.phoneVerified; // User is verified if both email and phone are verified
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Email verification failed',
    });
  }
});

// @route   POST /api/auth/verify-phone
// @desc    Verify phone number
// @access  Public
router.post('/verify-phone', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and verification code are required',
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if verification code is valid and not expired
    if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
      });
    }

    user.phoneVerified = true;
    user.isVerified = user.emailVerified; // User is verified if both email and phone are verified
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    logger.info(`Phone verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    logger.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Phone verification failed',
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    }

    const resetToken = generatePasswordResetToken(user._id);

    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      await sendPasswordResetEmail(user.email, resetToken, user.profile.firstName);
    }

    logger.info(`Password reset requested for: ${user.email}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update password
    user.password = password;
    await user.save();

    logger.info(`Password reset for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(400).json({
      success: false,
      message: 'Password reset failed',
    });
  }
});

module.exports = router; 