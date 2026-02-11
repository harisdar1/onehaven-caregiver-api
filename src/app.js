// Load environment variables first
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { initializeSocketEvents } = require('./socket/events');

// Import routes
const caregiverRoutes = require('./modules/caregivers/caregiver.routes');
const memberRoutes = require('./modules/protected-members/member.routes');

// Initialize Express app
const app = express();

// Create HTTP server (needed for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (configure for production)
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// Initialize socket event handlers
initializeSocketEvents(io);

// ===================
// Middleware
// ===================

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Simple CORS middleware (allow all origins for development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ===================
// Routes
// ===================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OneHaven Caregiver API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/protected-members', memberRoutes);

// ===================
// Error Handling
// ===================

// 404 handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ===================
// Start Server
// ===================

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`WebSocket ready for connections`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = { app, server, io };
