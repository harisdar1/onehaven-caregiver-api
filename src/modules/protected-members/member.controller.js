const ProtectedMember = require('./member.model');
const logger = require('../../utils/logger');

/**
 * Get Socket.io instance from app
 */
const getIO = (req) => req.app.get('io');

/**
 * POST /api/protected-members
 * Create a new protected member (requires auth)
 */
const create = async (req, res) => {
  try {
    const { firstName, lastName, relationship, birthYear, status } = req.body;
    const caregiverId = req.caregiver._id;

    // Create new protected member
    const member = await ProtectedMember.create({
      caregiverId,
      firstName,
      lastName,
      relationship,
      birthYear,
      status: status || 'active'
    });

    // Emit real-time event
    const io = getIO(req);
    if (io) {
      io.emit('member_added', {
        caregiverId: caregiverId.toString(),
        memberId: member._id.toString()
      });
    }

    // Log the event
    logger.logEvent('member_added', {
      caregiverId: caregiverId.toString(),
      memberId: member._id.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Protected member created successfully',
      data: { member }
    });
  } catch (error) {
    logger.error(`Create member error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating protected member',
      error: error.message
    });
  }
};

/**
 * GET /api/protected-members
 * Get all protected members for authenticated caregiver
 */
const getAll = async (req, res) => {
  try {
    const caregiverId = req.caregiver._id;

    // Find all members belonging to this caregiver
    const members = await ProtectedMember.find({ caregiverId })
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: members.length,
      data: { members }
    });
  } catch (error) {
    logger.error(`Get members error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching protected members',
      error: error.message
    });
  }
};

/**
 * PATCH /api/protected-members/:id
 * Update a protected member (requires auth)
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const caregiverId = req.caregiver._id;
    const updateData = req.body;

    // Find member and ensure it belongs to the authenticated caregiver
    const member = await ProtectedMember.findOne({
      _id: id,
      caregiverId: caregiverId
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Protected member not found or access denied'
      });
    }

    // Update the member
    const updatedMember = await ProtectedMember.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    // Emit real-time event
    const io = getIO(req);
    if (io) {
      io.emit('member_updated', {
        caregiverId: caregiverId.toString(),
        memberId: updatedMember._id.toString()
      });
    }

    // Log the event
    logger.logEvent('member_updated', {
      caregiverId: caregiverId.toString(),
      memberId: updatedMember._id.toString()
    });

    res.status(200).json({
      success: true,
      message: 'Protected member updated successfully',
      data: { member: updatedMember }
    });
  } catch (error) {
    logger.error(`Update member error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating protected member',
      error: error.message
    });
  }
};

/**
 * DELETE /api/protected-members/:id
 * Delete a protected member (requires auth)
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const caregiverId = req.caregiver._id;

    // Find member and ensure it belongs to the authenticated caregiver
    const member = await ProtectedMember.findOne({
      _id: id,
      caregiverId: caregiverId
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Protected member not found or access denied'
      });
    }

    // Delete the member
    await ProtectedMember.findByIdAndDelete(id);

    // Emit real-time event
    const io = getIO(req);
    if (io) {
      io.emit('member_deleted', {
        caregiverId: caregiverId.toString(),
        memberId: id
      });
    }

    // Log the event
    logger.logEvent('member_deleted', {
      caregiverId: caregiverId.toString(),
      memberId: id
    });

    res.status(200).json({
      success: true,
      message: 'Protected member deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete member error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting protected member',
      error: error.message
    });
  }
};

module.exports = {
  create,
  getAll,
  update,
  remove
};
