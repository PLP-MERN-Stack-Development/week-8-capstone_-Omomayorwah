const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, authorizeResourceOwner } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const { uploadToS3, uploadToCloudinary } = require('../utils/fileUpload');

const router = express.Router();

// Validation middleware
const validateProfileUpdate = [
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('profile.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Please select a valid gender'),
  body('profile.address.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('profile.address.state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State is required'),
];

const validatePreferencesUpdate = [
  body('preferences.language')
    .optional()
    .isIn(['en', 'ha', 'yo', 'ig', 'pidgin'])
    .withMessage('Please select a valid language'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be a boolean'),
  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be a boolean'),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be a boolean'),
];

// Multer setup for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profile: user.profile,
          preferences: user.preferences,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { profile } = req.body;
    
    // Update only provided fields
    const updateData = {};
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined) {
          updateData[`profile.${key}`] = profile[key];
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profile: user.profile,
          preferences: user.preferences,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        },
      },
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

// @route   PUT /api/users/profile-image
// @desc    Upload profile image
// @access  Private
router.put('/profile-image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }
    let imageUrl;
    if (process.env.AWS_S3_BUCKET) {
      imageUrl = await uploadToS3(req.file, req.user._id, 'profile-images');
    } else if (process.env.CLOUDINARY_CLOUD_NAME) {
      imageUrl = await uploadToCloudinary(req.file, req.user._id, 'profile-images');
    } else {
      return res.status(500).json({ success: false, message: 'No file storage configured' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'profile.imageUrl': imageUrl } },
      { new: true, runValidators: true }
    );
    logger.info(`Profile image updated for user: ${user.email}`);
    res.json({ success: true, message: 'Profile image uploaded', data: { imageUrl } });
  } catch (error) {
    logger.error('Error uploading profile image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile image' });
  }
});

// @route   GET /api/users/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    
    res.json({
      success: true,
      data: {
        preferences: user.preferences,
      },
    });
  } catch (error) {
    logger.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user preferences',
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticateToken, validatePreferencesUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { preferences } = req.body;
    
    // Update only provided fields
    const updateData = {};
    if (preferences) {
      Object.keys(preferences).forEach(key => {
        if (preferences[key] !== undefined) {
          updateData[`preferences.${key}`] = preferences[key];
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    logger.info(`Preferences updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences,
      },
    });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Soft delete - mark as inactive instead of actually deleting
    user.isActive = false;
    await user.save();

    logger.info(`Account deactivated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only or own profile)
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
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
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private (Admin)
router.put('/:id/role', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const allowedRoles = ['student', 'artisan', 'employer', 'admin'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing role',
      });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      },
    });
  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users (admin only)
// @access  Private
router.get('/search', authenticateToken, async (req, res) => {
  try {
    // Only admin can search users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { q, role, city, state, limit = 20, page = 1 } = req.query;
    
    const query = { isActive: true };
    
    if (q) {
      query.$or = [
        { 'profile.firstName': { $regex: q, $options: 'i' } },
        { 'profile.lastName': { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (city) {
      query['profile.address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      query['profile.address.state'] = { $regex: state, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password -loginAttempts -lockUntil -verificationCode -verificationCodeExpires')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
    });
  }
});

module.exports = router; 