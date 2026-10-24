// tests/domain.test.js
// ----------------------------------------------------------------------------
// Rootine - Comprehensive Domain Unit Test Suite
// Tests deterministic streaks, living plant growth stages, 7-day rolling windows,
// weekly schedules, overall progress formulas, leap years, and calendar edge cases.
// Runs using Node's native test runner (node --test).
// ----------------------------------------------------------------------------

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const Dates = require('../public/js/domain/dates');
const Streaks = require('../public/js/domain/streaks');
const Growth = require('../public/js/domain/growth');
const Progress = require('../public/js/domain/progress');
const Calendar = require('../public/js/domain/calendar');

describe('Plant Growth Engine (Every Habit Starts as a Seed 🌱)', () => {
  it('starts a new habit at Stage 1: Seed with 0 completions', () => {
    const newHabit = { name: 'Read', completedDates: [] };
    const growth = Growth.calculateGrowthStage(newHabit);
    assert.strictEqual(growth.stage, 1);
    assert.strictEqual(growth.id, 'seed');
    assert.strictEqual(growth.totalCompletions, 0);
  });

  it('advances to Stage 2: Germinating Seed upon initial completions', () => {
    const habit = { name: 'Read', completedDates: ['2026-10-24'] };
    const growth = Growth.calculateGrowthStage(habit);
    assert.strictEqual(growth.stage, 2);
    assert.strictEqual(growth.id, 'germinating');
    assert.strictEqual(growth.totalCompletions, 1);
  });

  it('advances to Stage 3: Sprout at 3 completions', () => {
    const habit = { name: 'Read', completedDates: ['2026-10-20', '2026-10-22', '2026-10-24'] };
    const growth = Growth.calculateGrowthStage(habit);
    assert.strictEqual(growth.stage, 3);
    assert.strictEqual(growth.id, 'sprout');
  });

  it('advances to Stage 4: Growing Plant at 7 completions', () => {
    const dates = [];
    for (let i = 0; i < 7; i++) dates.push(`2026-10-${String(10 + i).padStart(2, '0')}`);
    const habit = { name: 'Workout', completedDates: dates };
    const growth = Growth.calculateGrowthStage(habit);
    assert.strictEqual(growth.stage, 4);
    assert.strictEqual(growth.id, 'growing');
  });

  it('advances to Stage 5: Mature Plant at 14 completions', () => {
    const dates = [];
    for (let i = 0; i < 14; i++) dates.push(`2026-10-${String(1 + i).padStart(2, '0')}`);
    const habit = { name: 'Journal', completedDates: dates };
    const growth = Growth.calculateGrowthStage(habit);
    assert.strictEqual(growth.stage, 5);
    assert.strictEqual(growth.id, 'mature');
  });

  it('advances to Stage 6: Bloom at 22+ completions', () => {
    const dates = [];
    for (let i = 0; i < 25; i++) dates.push(`2026-09-${String(1 + i).padStart(2, '0')}`);
    const habit = { name: 'Drink Water', completedDates: dates };
    const growth = Growth.calculateGrowthStage(habit);
    assert.strictEqual(growth.stage, 6);
    assert.strictEqual(growth.id, 'bloom');
  });

  it('CRITICAL: A missed day breaks streak but DOES NOT destroy accumulated plant growth', () => {
    // Habit completed 15 times in the past, but missed yesterday and today
    const dates = [];
    for (let i = 1; i <= 15; i++) dates.push(`2026-09-${String(i).padStart(2, '0')}`);
    const habit = { type: 'daily', name: 'Read', completedDates: dates };

    // Today is 2026-10-24 (past completions were in September, so streak is broken)
    const streak = Streaks.calculateDailyStreak(habit, '2026-10-24');
    const growth = Growth.calculateGrowthStage(habit);

    assert.strictEqual(streak, 0, 'Streak should reset to 0 after missed days');
    assert.strictEqual(growth.stage, 5, 'Plant growth stage should remain at Stage 5: Mature');
  });
});

describe('Dates Domain Logic', () => {
  it('formats local dates consistently without UTC offset shifts', () => {
    const d = new Date(2026, 9, 24); // Month is 0-indexed: 9 = October
    assert.strictEqual(Dates.formatLocalDateKey(d), '2026-10-24');
  });

  it('adds and subtracts days correctly across month and year boundaries', () => {
    assert.strictEqual(Dates.addDays('2026-10-24', 1), '2026-10-25');
    assert.strictEqual(Dates.addDays('2026-10-31', 1), '2026-11-01');
    assert.strictEqual(Dates.addDays('2026-12-31', 1), '2027-01-01');
    assert.strictEqual(Dates.addDays('2026-01-01', -1), '2025-12-31');
  });

  it('correctly handles leap years', () => {
    assert.strictEqual(Dates.addDays('2024-02-28', 1), '2024-02-29'); // 2024 is leap year
    assert.strictEqual(Dates.addDays('2026-02-28', 1), '2026-03-01'); // 2026 is non-leap
  });

  it('returns standard ISO Monday-Sunday week range', () => {
    const week = Dates.getWeekRange('2026-10-24'); // Saturday
    assert.strictEqual(week.length, 7);
    assert.strictEqual(week[0], '2026-10-19'); // Monday
    assert.strictEqual(week[5], '2026-10-24'); // Saturday
    assert.strictEqual(week[6], '2026-10-25'); // Sunday
  });
});

describe('Streak Calculation Engine', () => {
  it('calculates consecutive daily completions up to reference date', () => {
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24'],
    };
    const streak = Streaks.calculateDailyStreak(habit, '2026-10-24');
    assert.strictEqual(streak, 4);
  });

  it('preserves yesterday streak when current day is incomplete', () => {
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-21', '2026-10-22', '2026-10-23'],
    };
    const streak = Streaks.calculateDailyStreak(habit, '2026-10-24');
    assert.strictEqual(streak, 3);
  });

  it('breaks streak when a required day in the past was missed', () => {
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-20', '2026-10-21', '2026-10-23', '2026-10-24'],
    };
    const streak = Streaks.calculateDailyStreak(habit, '2026-10-24');
    assert.strictEqual(streak, 2);
  });

  it('CRITICAL: Weekly habits must NEVER have streaks (always returns 0)', () => {
    const weeklyHabit = {
      type: 'weekly',
      dueDays: [1, 3, 5],
      completedDates: ['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24'],
    };
    const streak = Streaks.calculateDailyStreak(weeklyHabit, '2026-10-24');
    assert.strictEqual(streak, 0);
  });

  it('calculates 7-day rolling completion ratio accurately', () => {
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-18', '2026-10-19', '2026-10-21', '2026-10-22', '2026-10-24'],
    };
    const rolling = Streaks.getRollingCompletionRatio(habit, '2026-10-24', 7);
    assert.strictEqual(rolling.completed, 5);
    assert.strictEqual(rolling.total, 7);
    assert.strictEqual(Math.round(rolling.ratio * 100), 71);
  });
});

describe('Progress Engine', () => {
  const mockHabits = [
    { id: 'h1', type: 'daily', completedDates: ['2026-10-24'], archivedAt: null },
    { id: 'h2', type: 'daily', completedDates: [], archivedAt: null },
    { id: 'h3', type: 'weekly', dueDays: [6], completedDates: ['2026-10-24'], archivedAt: null },
    { id: 'h4', type: 'weekly', dueDays: [1, 3], completedDates: [], archivedAt: null },
    { id: 'h5', type: 'daily', completedDates: ['2026-10-24'], archivedAt: new Date() },
  ];

  it('calculates overall progress strictly for habits due on selected date', () => {
    const overall = Progress.calculateOverallProgress(mockHabits, '2026-10-24');
    assert.strictEqual(overall.total, 3);
    assert.strictEqual(overall.completed, 2);
    assert.strictEqual(overall.percent, 67);
  });

  it('calculates weekly progress against configured multi-day occurrences', () => {
    const weeklyHabits = [
      {
        type: 'weekly',
        dueDays: [1, 3, 5],
        completedDates: ['2026-10-19', '2026-10-21'],
        archivedAt: null,
      },
      {
        type: 'weekly',
        dueDays: [6],
        completedDates: ['2026-10-24'],
        archivedAt: null,
      },
    ];

    const weekly = Progress.calculateWeeklyProgress(weeklyHabits, '2026-10-24');
    assert.strictEqual(weekly.total, 4);
    assert.strictEqual(weekly.completed, 3);
    assert.strictEqual(weekly.percent, 75);
  });
});
