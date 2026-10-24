// models/Habit.js
// ----------------------------------------------------------------------------
// Rootine - Habit Data Model
// Blueprint for habits supporting both Daily and Weekly tracking modes,
// custom icons, schedules, archiving, and historical completion records.
// ----------------------------------------------------------------------------

const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  // The name/title of the habit (e.g., "Read 20 pages")
  name: {
    type: String,
    required: [true, 'Please provide a habit name.'],
    trim: true,
  },
  // Optional brief description or intention
  description: {
    type: String,
    trim: true,
    default: '',
  },
  // Type of habit: 'daily' (everyday tracking) or 'weekly' (specific days)
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily',
  },
  // Identifier of the botanical/activity icon (e.g. 'book', 'water', 'dumbbell')
  icon: {
    type: String,
    default: 'sprout',
  },
  // For weekly habits: array of days of week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  // When a habit is daily, this defaults to all days [0, 1, 2, 3, 4, 5, 6].
  dueDays: {
    type: [Number],
    default: [0, 1, 2, 3, 4, 5, 6],
  },
  // Array of date strings formatted as "YYYY-MM-DD" representing dates completed
  completedDates: {
    type: [String],
    default: [],
  },
  // Soft deletion/archiving timestamp (null if active)
  archivedAt: {
    type: Date,
    default: null,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
habitSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Habit', habitSchema);
