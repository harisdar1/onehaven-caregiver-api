const supabase = require('../config/supabase');
const Caregiver = require('../modules/caregivers/caregiver.model');

/**
 * Auth middleware - protects routes that require authentication
 * Verifies Supabase token and attaches caregiver to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find caregiver in MongoDB by Supabase ID
    const caregiver = await Caregiver.findOne({ supabaseId: user.id });

    if (!caregiver) {
      return res.status(401).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    // Attach caregiver to request
    req.caregiver = caregiver;
    req.supabaseUser = user;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = auth;
