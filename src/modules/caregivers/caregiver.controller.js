const jwt = require('jsonwebtoken');
const Caregiver = require('./caregiver.model');
const logger = require('../../utils/logger');

/**
 * Generate JWT token for a caregiver
 */
const generateToken = (caregiverId) => {
  return jwt.sign(
    { id: caregiverId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

/**
 * POST /api/caregivers/signup
 * Create a new caregiver account
 */
const signup = async (req, res) => {
  try {
    const { name, email, passkey } = req.body;

    // Check if caregiver already exists
    const existingCaregiver = await Caregiver.findOne({ email });
    if (existingCaregiver) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new caregiver (password is hashed in model pre-save hook)
    const caregiver = await Caregiver.create({
      name,
      email,
      passkey
    });

    // Generate JWT token
    const token = generateToken(caregiver._id);

    logger.info(`New caregiver registered: ${caregiver.email}`);

    res.status(201).json({
      success: true,
      message: 'Caregiver registered successfully',
      data: {
        caregiver,
        token
      }
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating caregiver',
      error: error.message
    });
  }
};

/**
 * POST /api/caregivers/login
 * Authenticate caregiver and return JWT
 */
const login = async (req, res) => {
  try {
    const { email, passkey } = req.body;

    // Find caregiver by email (include passkey for comparison)
    const caregiver = await Caregiver.findOne({ email }).select('+passkey');

    if (!caregiver) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await caregiver.comparePassword(passkey);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(caregiver._id);

    logger.info(`Caregiver logged in: ${caregiver.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        caregiver,
        token
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

/**
 * GET /api/caregivers/me
 * Get current caregiver profile (requires auth)
 */
const getProfile = async (req, res) => {
  try {
    // req.caregiver is set by auth middleware
    res.status(200).json({
      success: true,
      data: {
        caregiver: req.caregiver
      }
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile
};
