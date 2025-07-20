const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

// Generate access token
const generateAccessToken = (userId) => {
  try {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  try {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

// Generate both tokens
const generateTokens = (userId) => {
  try {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error('Error generating tokens:', error);
    throw new Error('Failed to generate tokens');
  }
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('Error verifying access token:', error);
    throw error;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    logger.error('Error verifying refresh token:', error);
    throw error;
  }
};

// Generate verification token for email/phone verification
const generateVerificationToken = (userId, type = 'email') => {
  try {
    const payload = {
      userId,
      type,
      purpose: 'verification',
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  } catch (error) {
    logger.error('Error generating verification token:', error);
    throw new Error('Failed to generate verification token');
  }
};

// Generate password reset token
const generatePasswordResetToken = (userId) => {
  try {
    const payload = {
      userId,
      purpose: 'password_reset',
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  } catch (error) {
    logger.error('Error generating password reset token:', error);
    throw new Error('Failed to generate password reset token');
  }
};

// Generate random verification code (for SMS)
const generateVerificationCode = (length = 6) => {
  try {
    return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  } catch (error) {
    logger.error('Error generating verification code:', error);
    throw new Error('Failed to generate verification code');
  }
};

// Decode token without verification (for getting payload)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Error decoding token:', error);
    throw error;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    logger.error('Error getting token expiration:', error);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    return expiration ? expiration < new Date() : true;
  } catch (error) {
    logger.error('Error checking token expiration:', error);
    return true;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  generateVerificationCode,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
}; 