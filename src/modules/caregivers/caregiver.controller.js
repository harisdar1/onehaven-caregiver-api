const supabase = require('../../config/supabase');
const Caregiver = require('./caregiver.model');
const logger = require('../../utils/logger');

/**
 * POST /api/caregivers/signup
 * Create a new caregiver using Supabase Auth
 */
const signup = async (req, res) => {
  try {
    const { name, email, passkey } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: passkey
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // Create caregiver profile in MongoDB
    const caregiver = await Caregiver.create({
      supabaseId: authData.user.id,
      name,
      email
    });

    logger.info(`New caregiver registered: ${email}`);

    // Note: If email confirmation is enabled in Supabase, session will be null
    // User will need to confirm email and then login
    const token = authData.session?.access_token || null;

    res.status(201).json({
      success: true,
      message: token ? 'Caregiver registered successfully' : 'Caregiver registered. Please check email to confirm.',
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
 * Authenticate caregiver using Supabase Auth
 */
const login = async (req, res) => {
  try {
    const { email, passkey } = req.body;

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: passkey
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get caregiver profile from MongoDB
    const caregiver = await Caregiver.findOne({ supabaseId: authData.user.id });

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'Caregiver profile not found'
      });
    }

    logger.info(`Caregiver logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        caregiver,
        token: authData.session.access_token
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
