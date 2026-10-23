// routes/habits.js
// ----------------------------------------------------------------------------
// This file defines the API endpoints for habit operations (CRUD).
// Express Router lets us organize endpoints cleanly by resource.
// All routes in this file are prefixed with /api/habits in server.js.
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// ============================================================================
// ROUTE 1: GET /api/habits
// Description: Retrieve all habits from the database
// ============================================================================
router.get('/', async (req, res) => {
  try {
    // Find all habits in MongoDB and sort them with the newest created first
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.status(200).json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error.message);
    res.status(500).json({
      message: 'Failed to fetch habits from the database. Please try again.',
    });
  }
});

// ============================================================================
// ROUTE 2: POST /api/habits
// Description: Create a new habit
// Expected Request Body: { name: "Exercise for 20 minutes" }
// ============================================================================
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    // Validate that a habit name was provided and is not just spaces
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Habit name is required and cannot be empty.',
      });
    }

    // Create a new Habit document with trimmed name
    const newHabit = new Habit({
      name: name.trim(),
    });

    // Save the new habit to MongoDB
    const savedHabit = await newHabit.save();

    // Respond with 201 (Created) and the saved habit document
    res.status(201).json(savedHabit);
  } catch (error) {
    console.error('Error creating habit:', error.message);
    res.status(500).json({
      message: 'Failed to create habit. Please check your data and try again.',
    });
  }
});

// ============================================================================
// ROUTE 3: DELETE /api/habits/:id
// Description: Delete a habit by its MongoDB _id
// ============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Attempt to find and remove the habit by ID
    const deletedHabit = await Habit.findByIdAndDelete(id);

    // If no document was found with that ID, return a 404 (Not Found)
    if (!deletedHabit) {
      return res.status(404).json({
        message: 'Habit not found or may have already been deleted.',
      });
    }

    res.status(200).json({
      message: 'Habit deleted successfully.',
      id: id,
    });
  } catch (error) {
    console.error('Error deleting habit:', error.message);
    res.status(500).json({
      message: 'Failed to delete habit. Please verify the habit ID.',
    });
  }
});

// ============================================================================
// ROUTE 4: PATCH /api/habits/:id/toggle
// Description: Toggle completion status for a specific date (YYYY-MM-DD).
// If the date is already in completedDates, remove it (mark not done).
// If the date is not in completedDates, add it (mark done).
// Expected Request Body: { date: "2026-10-23" }
// ============================================================================
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    // Validate date parameter
    if (!date) {
      return res.status(400).json({
        message: 'A valid date (YYYY-MM-DD) is required to toggle completion.',
      });
    }

    // Locate the habit in MongoDB
    const habit = await Habit.findById(id);

    // If habit doesn't exist, return 404
    if (!habit) {
      return res.status(404).json({
        message: 'Habit not found.',
      });
    }

    // Check if the given date is already marked as completed
    const dateIndex = habit.completedDates.indexOf(date);

    if (dateIndex > -1) {
      // Date is present -> remove it (untoggle)
      habit.completedDates.splice(dateIndex, 1);
    } else {
      // Date is not present -> add it (toggle on)
      habit.completedDates.push(date);
    }

    // Save changes back to MongoDB
    const updatedHabit = await habit.save();

    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error('Error toggling habit status:', error.message);
    res.status(500).json({
      message: 'Failed to toggle habit completion status.',
    });
  }
});

module.exports = router;
