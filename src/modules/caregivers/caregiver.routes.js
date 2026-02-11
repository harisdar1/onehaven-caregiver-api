const express = require('express');
const router = express.Router();
const caregiverController = require('./caregiver.controller');
const validate = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const { signupSchema, loginSchema } = require('../../validators/caregiver.validator');

/**
 * @swagger
 * /api/caregivers/signup:
 *   post:
 *     summary: Register a new caregiver
 *     tags: [Caregivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, passkey]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Smith
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               passkey:
 *                 type: string
 *                 example: SecurePass123
 *     responses:
 *       201:
 *         description: Caregiver registered successfully
 *       400:
 *         description: Validation error or email already exists
 */
router.post('/signup', authLimiter, validate(signupSchema), caregiverController.signup);

/**
 * @swagger
 * /api/caregivers/login:
 *   post:
 *     summary: Login caregiver
 *     tags: [Caregivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, passkey]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               passkey:
 *                 type: string
 *                 example: SecurePass123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, validate(loginSchema), caregiverController.login);

/**
 * @swagger
 * /api/caregivers/me:
 *   get:
 *     summary: Get current caregiver profile
 *     tags: [Caregivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caregiver profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caregiver'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, caregiverController.getProfile);

module.exports = router;
