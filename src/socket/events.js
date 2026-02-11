const logger = require('../utils/logger');

/**
 * Initialize Socket.io event handlers
 * @param {Object} io - Socket.io server instance
 */
const initializeSocketEvents = (io) => {
  // Handle new client connections
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Client can join a room specific to their caregiver ID
    // This allows targeted events (optional enhancement)
    socket.on('join_room', (caregiverId) => {
      socket.join(caregiverId);
      logger.info(`Client ${socket.id} joined room: ${caregiverId}`);
    });

    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} - Reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}: ${error.message}`);
    });
  });

  // Middleware to log all emitted events (for debugging)
  io.use((socket, next) => {
    // Log incoming events
    const originalEmit = socket.emit;
    socket.emit = function(event, ...args) {
      if (!['connect', 'disconnect', 'error'].includes(event)) {
        logger.info(`Socket event emitted: ${event}`);
      }
      return originalEmit.apply(socket, [event, ...args]);
    };
    next();
  });

  logger.info('Socket.io initialized and ready for connections');
};

/**
 * Event types used in the application
 * These are emitted from the member controller
 */
const SOCKET_EVENTS = {
  MEMBER_ADDED: 'member_added',
  MEMBER_UPDATED: 'member_updated',
  MEMBER_DELETED: 'member_deleted'
};

module.exports = {
  initializeSocketEvents,
  SOCKET_EVENTS
};
