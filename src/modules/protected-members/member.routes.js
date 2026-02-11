const express = require('express');
const router = express.Router();
const memberController = require('./member.controller');
const validate = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const { createMemberSchema, updateMemberSchema } = require('../../validators/member.validator');

/**
 * @swagger
 * /api/protected-members:
 *   post:
 *     summary: Create a new protected member
 *     tags: [Protected Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, relationship, birthYear]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Emma
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               relationship:
 *                 type: string
 *                 example: Daughter
 *               birthYear:
 *                 type: integer
 *                 example: 2015
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: Protected member created
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, validate(createMemberSchema), memberController.create);

/**
 * @swagger
 * /api/protected-members:
 *   get:
 *     summary: Get all protected members for authenticated caregiver
 *     tags: [Protected Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of protected members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProtectedMember'
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, memberController.getAll);

/**
 * @swagger
 * /api/protected-members/{id}:
 *   patch:
 *     summary: Update a protected member
 *     tags: [Protected Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Protected member ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               relationship:
 *                 type: string
 *               birthYear:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Protected member updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.patch('/:id', auth, validate(updateMemberSchema), memberController.update);

/**
 * @swagger
 * /api/protected-members/{id}:
 *   delete:
 *     summary: Delete a protected member
 *     tags: [Protected Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Protected member ID
 *     responses:
 *       200:
 *         description: Protected member deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.delete('/:id', auth, memberController.remove);

module.exports = router;
