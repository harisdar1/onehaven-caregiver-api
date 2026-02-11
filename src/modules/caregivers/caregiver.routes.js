const express = require('express');
const router = express.Router();
const caregiverController = require('./caregiver.controller');
const validate = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const { signupSchema, loginSchema } = require('../../validators/caregiver.validator');

/**
 * Caregiver Routes
 * Base path: /api/caregivers
 */

// POST /api/caregivers/signup - Create new caregiver (public)
router.post('/signup', validate(signupSchema), caregiverController.signup);

// POST /api/caregivers/login - Authenticate caregiver (public)
router.post('/login', validate(loginSchema), caregiverController.login);

// GET /api/caregivers/me - Get current caregiver profile (protected)
router.get('/me', auth, caregiverController.getProfile);

module.exports = router;
