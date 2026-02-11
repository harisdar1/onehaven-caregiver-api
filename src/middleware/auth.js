const jwt = require('jsonwebtoken');
const Caregiver = require('../modules/caregivers/caregiver.model');

/**
 * Auth middleware - protects routes that require authentication
 * Verifies JWT token and attaches caregiver to request
 */
const auth = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // 2. Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find caregiver in database
    const caregiver = await Caregiver.findById(decoded.id);

    if (!caregiver) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Caregiver not found.'
      });
    }

    // 5. Attach caregiver to request object
    req.caregiver = caregiver;

    // 6. Continue to next middleware/controller
    next();
  } catch (error) {
    // Token is invalid or expired
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    // Unknown error
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

module.exports = auth;
