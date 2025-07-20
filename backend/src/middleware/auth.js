const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
    });
  }
};

// Verify refresh token
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Refresh token verification failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Refresh token verification failed',
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Specific role authorizations
const authorizeStudent = authorize('student');
const authorizeArtisan = authorize('artisan');
const authorizeEmployer = authorize('employer');
const authorizeAdmin = authorize('admin');
const authorizeStudentOrArtisan = authorize('student', 'artisan');
const authorizeArtisanOrEmployer = authorize('artisan', 'employer');

// Optional authentication (for public routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without user
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive && !user.isLocked) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Check if user owns the resource or is admin
const authorizeResourceOwner = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user._id.toString() !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this resource',
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  authorize,
  authorizeStudent,
  authorizeArtisan,
  authorizeEmployer,
  authorizeAdmin,
  authorizeStudentOrArtisan,
  authorizeArtisanOrEmployer,
  optionalAuth,
  authorizeResourceOwner,
}; 