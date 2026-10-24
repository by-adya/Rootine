// routes/habits.js
// ----------------------------------------------------------------------------
// Rootine - Habit API Endpoints
// Comprehensive REST routes supporting daily/weekly schedules, archiving,
// date-based completion toggling, and updates.
// ----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// ============================================================================
// ROUTE 1: GET /api/habits
// Description: Retrieve habits. Defaults to active (unarchived) habits.
// Query Params: ?includeArchived=true
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.includeArchived !== 'true') {
      filter.archivedAt = null;
    }

    const habits = await Habit.find(filter).sort({ createdAt: 1 });
    res.status(200).json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error.message);
    res.status(500).json({
      message: 'Failed to fetch habits from database. Please try again.',
    });
  }
});

// ============================================================================
// ROUTE 2: POST /api/habits
// Description: Create a new habit (daily or weekly)
// Body: { name, description, type, icon, dueDays }
// ============================================================================
router.post('/', async (req, res) => {
  try {
    const { name, description, type, icon, dueDays } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Habit name is required and cannot be empty.',
      });
    }

    const habitType = type === 'weekly' ? 'weekly' : 'daily';
    let validDueDays = [0, 1, 2, 3, 4, 5, 6];

    if (habitType === 'weekly' && Array.isArray(dueDays) && dueDays.length > 0) {
      // Normalize due days to valid 0-6 integers
      validDueDays = [...new Set(dueDays.map(Number).filter((d) => d >= 0 && d <= 6))];
      if (validDueDays.length === 0) validDueDays = [1]; // fallback to Monday
    }

    const newHabit = new Habit({
      name: name.trim(),
      description: description ? description.trim() : '',
      type: habitType,
      icon: icon || 'sprout',
      dueDays: validDueDays,
    });

    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (error) {
    console.error('Error creating habit:', error.message);
    res.status(500).json({
      message: 'Failed to create habit. Please check your data and try again.',
    });
  }
});

// ============================================================================
// ROUTE 3: PUT /api/habits/:id
// Description: Update an existing habit's details
// Body: { name, description, type, icon, dueDays }
// ============================================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, icon, dueDays } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Habit name is required.',
      });
    }

    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found.' });
    }

    habit.name = name.trim();
    if (description !== undefined) habit.description = description.trim();
    if (type) habit.type = type === 'weekly' ? 'weekly' : 'daily';
    if (icon) habit.icon = icon;

    if (habit.type === 'weekly' && Array.isArray(dueDays) && dueDays.length > 0) {
      habit.dueDays = [...new Set(dueDays.map(Number).filter((d) => d >= 0 && d <= 6))];
    } else if (habit.type === 'daily') {
      habit.dueDays = [0, 1, 2, 3, 4, 5, 6];
    }

    const updatedHabit = await habit.save();
    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error('Error updating habit:', error.message);
    res.status(500).json({ message: 'Failed to update habit.' });
  }
});

// ============================================================================
// ROUTE 4: PATCH /api/habits/:id/toggle
// Description: Toggle completion status for a specific date (YYYY-MM-DD).
// Prevents duplicate dates and handles exact date records.
// Body: { date: "YYYY-MM-DD" }
// ============================================================================
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: 'A valid date in YYYY-MM-DD format is required.',
      });
    }

    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found.' });
    }

    const dateIndex = habit.completedDates.indexOf(date);

    if (dateIndex > -1) {
      // Remove date (untoggle)
      habit.completedDates.splice(dateIndex, 1);
    } else {
      // Add date without duplicates
      habit.completedDates.push(date);
      habit.completedDates = [...new Set(habit.completedDates)];
    }

    const updatedHabit = await habit.save();
    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error('Error toggling habit status:', error.message);
    res.status(500).json({ message: 'Failed to toggle completion status.' });
  }
});

// ============================================================================
// ROUTE 5: PATCH /api/habits/:id/archive
// Description: Archive or restore a habit without destroying historical records
// Body: { archive: boolean }
// ============================================================================
router.patch('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const shouldArchive = req.body.archive !== false;

    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found.' });
    }

    habit.archivedAt = shouldArchive ? new Date() : null;
    const updatedHabit = await habit.save();
    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error('Error archiving habit:', error.message);
    res.status(500).json({ message: 'Failed to update archive status.' });
  }
});

// ============================================================================
// ROUTE 6: DELETE /api/habits/:id
// Description: Permanently delete a habit by its MongoDB _id
// ============================================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHabit = await Habit.findByIdAndDelete(id);

    if (!deletedHabit) {
      return res.status(404).json({ message: 'Habit not found.' });
    }

    res.status(200).json({
      message: 'Habit deleted successfully.',
      id: id,
    });
  } catch (error) {
    console.error('Error deleting habit:', error.message);
    res.status(500).json({ message: 'Failed to delete habit.' });
  }
});

module.exports = router;
