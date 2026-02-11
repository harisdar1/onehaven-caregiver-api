const express = require('express');
const router = express.Router();
const memberController = require('./member.controller');
const validate = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const { createMemberSchema, updateMemberSchema } = require('../../validators/member.validator');

/**
 * Protected Member Routes
 * Base path: /api/protected-members
 * All routes require authentication
 */

// POST /api/protected-members - Create new protected member
router.post('/', auth, validate(createMemberSchema), memberController.create);

// GET /api/protected-members - Get all members for authenticated caregiver
router.get('/', auth, memberController.getAll);

// PATCH /api/protected-members/:id - Update a protected member
router.patch('/:id', auth, validate(updateMemberSchema), memberController.update);

// DELETE /api/protected-members/:id - Delete a protected member
router.delete('/:id', auth, memberController.remove);

module.exports = router;
