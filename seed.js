/**
 * Seed Script - Execution Harness
 *
 * This script demonstrates the API functionality:
 * 1. Creates a sample caregiver
 * 2. Adds 3 protected members concurrently
 * 3. Logs real-time events as they occur
 *
 * Usage: npm run seed (make sure the server is running first)
 */

const { io } = require('socket.io-client');

// Configuration
const API_URL = 'http://localhost:3000';
const SOCKET_URL = 'http://localhost:3000';

// Helper function to format timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

// Helper function to log events in the required format
const logEvent = (eventName, data) => {
  console.log(`[${getTimestamp()}] EVENT: ${eventName} — ${JSON.stringify(data)}`);
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  return response.json();
};

// Sample data
const sampleCaregiver = {
  name: 'John Smith',
  email: `caregiver_${Date.now()}@example.com`, // Unique email
  passkey: 'SecurePass123'
};

const sampleMembers = [
  {
    firstName: 'Emma',
    lastName: 'Smith',
    relationship: 'Daughter',
    birthYear: 2015,
    status: 'active'
  },
  {
    firstName: 'James',
    lastName: 'Smith',
    relationship: 'Son',
    birthYear: 2018,
    status: 'active'
  },
  {
    firstName: 'Margaret',
    lastName: 'Smith',
    relationship: 'Mother',
    birthYear: 1955,
    status: 'active'
  }
];

// Main seed function
const runSeed = async () => {
  console.log('\nStarting seed script...\n');

  // Connect to WebSocket to listen for events
  console.log('Connecting to WebSocket...');

  const socket = io(SOCKET_URL);

  // Set up event listeners BEFORE making API calls
  socket.on('connect', () => {
    console.log(`Connected (${socket.id})\n`);
  });

  socket.on('member_added', (data) => {
    logEvent('member_added', data);
  });

  socket.on('member_updated', (data) => {
    logEvent('member_updated', data);
  });

  socket.on('member_deleted', (data) => {
    logEvent('member_deleted', data);
  });

  // Wait for socket connection
  await new Promise((resolve) => {
    socket.on('connect', resolve);
  });

  try {
    // Create a sample caregiver
    console.log('Creating caregiver...');

    const signupResult = await apiRequest('/api/caregivers/signup', {
      method: 'POST',
      body: JSON.stringify(sampleCaregiver)
    });

    if (!signupResult.success) {
      throw new Error(`Signup failed: ${signupResult.message}`);
    }

    let { token, caregiver } = signupResult.data;
    console.log(`Caregiver created: ${caregiver._id}`);

    // If no token (email confirmation required), login instead
    if (!token) {
      console.log('Logging in to get token...');
      const loginResult = await apiRequest('/api/caregivers/login', {
        method: 'POST',
        body: JSON.stringify({
          email: sampleCaregiver.email,
          passkey: sampleCaregiver.passkey
        })
      });

      if (!loginResult.success) {
        throw new Error(`Login failed: ${loginResult.message}`);
      }
      token = loginResult.data.token;
    }
    console.log('');

    // Add 3 protected members concurrently
    console.log('Adding 3 protected members concurrently...\n');

    // Use Promise.all to send all requests at the same time
    const memberPromises = sampleMembers.map((member) =>
      apiRequest('/api/protected-members', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(member)
      })
    );

    // Execute all requests concurrently
    const memberResults = await Promise.all(memberPromises);

    // Log results
    console.log('\nMembers created:');
    memberResults.forEach((result, index) => {
      if (result.success) {
        const m = result.data.member;
        console.log(`  ${m.firstName} ${m.lastName} (${m.relationship})`);
      } else {
        console.log(`  Failed: ${result.message}`);
        if (result.errors) {
          result.errors.forEach(err => console.log(`    ${err.field}: ${err.message}`));
        }
      }
    });

    // Wait a moment for all events to be received
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demonstrate update
    console.log('\nUpdating first member status...');
    const firstMemberId = memberResults[0].data.member._id;

    await apiRequest(`/api/protected-members/${firstMemberId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'inactive' })
    });
    console.log('Member updated');

    // Wait for event
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Summary
    console.log('\nDone!');
    console.log(`Caregiver: ${caregiver._id}`);
    console.log(`Members: ${memberResults.filter(r => r.success).length} created`);
    console.log(`Token: ${token.substring(0, 30)}...\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Disconnect socket
    socket.disconnect();
    process.exit(0);
  }
};

// Run the seed
runSeed();
