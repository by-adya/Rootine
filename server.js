// server.js
// ----------------------------------------------------------------------------
// Main entry point for the Habit Garden application.
// This file initializes Express, connects to MongoDB via Mongoose,
// registers API routes, serves static frontend files, and starts the server.
// ----------------------------------------------------------------------------

// Load environment variables from .env file into process.env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Fix for Windows / ISP DNS: Use Google Public DNS for resolving MongoDB SRV records
// This resolves the common "querySrv EBADRESP" or "querySrv ECONNREFUSED" error
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Import habit routes
const habitRoutes = require('./routes/habits');

// Initialize Express application
const app = express();

// Use PORT from environment variables (provided by hosting services) or default to 3000
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Parse incoming JSON payloads in request bodies (req.body)
app.use(express.json());

// Parse incoming URL-encoded form data (if needed)
app.use(express.urlencoded({ extended: true }));

// Serve all static files (HTML, CSS, JS, images) from the 'public' directory
// This allows the full-stack app to run from a single URL (e.g. http://localhost:3000)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn(
    '\n⚠️  WARNING: MONGODB_URI is not defined in your environment variables!\n' +
    '   Please create a .env file (copy .env.example) and add your MongoDB Atlas connection string.\n'
  );
} else {
  // Connect to MongoDB using Mongoose
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('🌱 Connected successfully to MongoDB Atlas.');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      console.error(
        '   Tip: Ensure your MongoDB Atlas cluster is running, network access allows your IP, ' +
        'and your username/password in .env are correct.'
      );
    });
}

// ============================================================================
// API ROUTES
// ============================================================================

// All habit-related endpoints will be prefixed with /api/habits
app.use('/api/habits', habitRoutes);

// Fallback route for unknown API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🌿 Habit Garden is blooming at http://localhost:${PORT}`);
});

module.exports = app;
