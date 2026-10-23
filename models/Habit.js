// models/Habit.js
// ----------------------------------------------------------------------------
// This file defines the Mongoose Schema and Model for a Habit.
// In MongoDB, documents are stored in JSON-like structures. Mongoose allows us
// to define a rigid blueprint (Schema) so our data stays consistent.
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');

// Define the Habit Schema structure
const habitSchema = new mongoose.Schema({
  // The descriptive title of the habit (e.g., "Read 20 pages")
  name: {
    type: String,
    required: [true, 'Please provide a habit name.'],
    trim: true, // Automatically removes leading and trailing whitespace
  },
  // The timestamp when this habit was initially created
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // An array of date strings formatted as "YYYY-MM-DD" representing days
  // when this habit was marked as completed (e.g., ["2026-10-23", "2026-10-24"])
  completedDates: {
    type: [String],
    default: [],
  },
});

// Create and export the Habit model based on the schema
// Mongoose creates a collection named 'habits' in MongoDB automatically.
module.exports = mongoose.model('Habit', habitSchema);
