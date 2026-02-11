const winston = require('winston');

// Custom format for event logging
const eventFormat = winston.format.printf(({ level, message, timestamp, event, data }) => {
  if (event) {
    // Format for real-time events (member_added, member_updated, etc.)
    return `[${timestamp}] EVENT: ${event} — ${JSON.stringify(data)}`;
  }
  // Standard log format - handle objects
  const msg = typeof message === 'object' ? JSON.stringify(message) : message;
  return `[${timestamp}] ${level.toUpperCase()}: ${msg}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    eventFormat
  ),
  transports: [
    // Log to console
    new winston.transports.Console(),
    // Log to file (optional - good for production)
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Helper function to log real-time events
logger.logEvent = (eventName, data) => {
  logger.info({ event: eventName, data });
};

module.exports = logger;
