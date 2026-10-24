// tests/domain.test.js
// ----------------------------------------------------------------------------
// Rootine - Comprehensive Domain Unit Test Suite
// Tests deterministic streaks, rolling 7-day windows, weekly schedules,
// overall progress formulas, leap years, and calendar edge cases.
// Runs using Node's native test runner (node --test).
// ----------------------------------------------------------------------------

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const Dates = require('../public/js/domain/dates');
const Streaks = require('../public/js/domain/streaks');
const Progress = require('../public/js/domain/progress');
const Calendar = require('../public/js/domain/calendar');

describe('Dates Domain Logic', () => {
  it('formats local dates consistently without UTC offset shifts', () => {
    const d = new Date(2026, 9, 24); // Month is 0-indexed: 9 = October
    assert.strictEqual(Dates.formatLocalDateKey(d), '2026-10-24');
  });

  it('parses local date key accurately', () => {
    const d = Dates.parseLocalDateKey('2026-10-24');
    assert.strictEqual(d.getFullYear(), 2026);
    assert.strictEqual(d.getMonth(), 9);
    assert.strictEqual(d.getDate(), 24);
  });

  it('adds and subtracts days correctly across month and year boundaries', () => {
    assert.strictEqual(Dates.addDays('2026-10-24', 1), '2026-10-25');
    assert.strictEqual(Dates.addDays('2026-10-31', 1), '2026-11-01');
    assert.strictEqual(Dates.addDays('2026-12-31', 1), '2027-01-01');
    assert.strictEqual(Dates.addDays('2026-01-01', -1), '2025-12-31');
  });

  it('correctly handles leap years', () => {
    assert.strictEqual(Dates.addDays('2024-02-28', 1), '2024-02-29'); // 2024 is leap year
    assert.strictEqual(Dates.addDays('2024-02-29', 1), '2024-03-01');
    assert.strictEqual(Dates.addDays('2026-02-28', 1), '2026-03-01'); // 2026 is non-leap
  });

  it('returns standard ISO Monday-Sunday week range', () => {
    // 2026-10-24 is a Saturday
    const week = Dates.getWeekRange('2026-10-24');
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
    // Today is 2026-10-24 and not completed yet, but 21, 22, 23 were completed
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-21', '2026-10-22', '2026-10-23'],
    };
    const streak = Streaks.calculateDailyStreak(habit, '2026-10-24');
    assert.strictEqual(streak, 3);
  });

  it('breaks streak when a required day in the past was missed', () => {
    // Missed 2026-10-22
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-20', '2026-10-21', '2026-10-23', '2026-10-24'],
    };
    const streak = Streaks.calculateDailyStreak(habit, '2026-10-24');
    assert.strictEqual(streak, 2); // only 23 and 24
  });

  it('resets streak to 0 if both today and yesterday were missed', () => {
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-20', '2026-10-21'],
    };
    const streak = Streaks.calculateDailyStreak(habit, '2026-10-24');
    assert.strictEqual(streak, 0);
  });

  it('starts streak at 1 if completed today after a missed day', () => {
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-20', '2026-10-24'],
    };
    const streak = Streaks.calculateDailyStreak(habit, '2026-10-24');
    assert.strictEqual(streak, 1);
  });

  it('handles duplicate completion dates without inflating streak', () => {
    const habit = {
      type: 'daily',
      completedDates: ['2026-10-23', '2026-10-24', '2026-10-24', '2026-10-24'],
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
      // Completed 5 of the last 7 days: 18, 19, 21, 22, 24
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
    {
      id: 'h1',
      type: 'daily',
      completedDates: ['2026-10-24'],
      archivedAt: null,
    },
    {
      id: 'h2',
      type: 'daily',
      completedDates: [],
      archivedAt: null,
    },
    {
      id: 'h3',
      type: 'weekly',
      dueDays: [6], // Saturday (2026-10-24 is Saturday)
      completedDates: ['2026-10-24'],
      archivedAt: null,
    },
    {
      id: 'h4',
      type: 'weekly',
      dueDays: [1, 3], // Mon, Wed -> NOT due on Saturday
      completedDates: [],
      archivedAt: null,
    },
    {
      id: 'h5',
      type: 'daily',
      completedDates: ['2026-10-24'],
      archivedAt: new Date(), // Archived -> must be excluded!
    },
  ];

  it('calculates overall progress strictly for habits due on selected date', () => {
    // On Saturday 2026-10-24:
    // h1 is daily (due, completed)
    // h2 is daily (due, not completed)
    // h3 is weekly due Sat (due, completed)
    // h4 is weekly due Mon/Wed (not due)
    // h5 is archived (excluded)
    // Eligible: h1, h2, h3 = 3 habits. Completed: h1, h3 = 2 habits.
    const overall = Progress.calculateOverallProgress(mockHabits, '2026-10-24');
    assert.strictEqual(overall.total, 3);
    assert.strictEqual(overall.completed, 2);
    assert.strictEqual(overall.percent, 67);
  });

  it('calculates daily progress independently', () => {
    // Active daily habits: h1, h2 (total: 2). Completed today: h1 (1).
    const daily = Progress.calculateDailyProgress(mockHabits, '2026-10-24');
    assert.strictEqual(daily.total, 2);
    assert.strictEqual(daily.completed, 1);
    assert.strictEqual(daily.percent, 50);
  });

  it('calculates weekly progress against configured multi-day occurrences', () => {
    const weeklyHabits = [
      {
        type: 'weekly',
        dueDays: [1, 3, 5], // 3 occurrences in the week
        // Monday: 2026-10-19, Wednesday: 2026-10-21, Friday: 2026-10-23
        completedDates: ['2026-10-19', '2026-10-21'], // 2 of 3 completed
        archivedAt: null,
      },
      {
        type: 'weekly',
        dueDays: [6], // 1 occurrence in the week (Saturday: 2026-10-24)
        completedDates: ['2026-10-24'], // 1 of 1 completed
        archivedAt: null,
      },
    ];

    // Total required occurrences: 3 + 1 = 4. Completed: 2 + 1 = 3.
    const weekly = Progress.calculateWeeklyProgress(weeklyHabits, '2026-10-24');
    assert.strictEqual(weekly.total, 4);
    assert.strictEqual(weekly.completed, 3);
    assert.strictEqual(weekly.percent, 75);
  });

  it('evaluates weekly habit satisfaction rule strictly', () => {
    const multiDayHabit = {
      type: 'weekly',
      dueDays: [1, 3, 5],
      completedDates: ['2026-10-19', '2026-10-21'], // Missed Friday 2026-10-23
    };
    assert.strictEqual(Progress.isWeeklyHabitSatisfiedForWeek(multiDayHabit, '2026-10-24'), false);

    multiDayHabit.completedDates.push('2026-10-23');
    assert.strictEqual(Progress.isWeeklyHabitSatisfiedForWeek(multiDayHabit, '2026-10-24'), true);
  });

  it('handles zero eligible habits without division by zero', () => {
    const emptyProgress = Progress.calculateOverallProgress([], '2026-10-24');
    assert.strictEqual(emptyProgress.total, 0);
    assert.strictEqual(emptyProgress.percent, 0);
  });
});

describe('Calendar Engine', () => {
  it('generates a complete 35 or 42 slot month grid aligned to Monday', () => {
    // October 2026
    const grid = Calendar.generateMonthGrid(2026, 9, [], '2026-10-24', '2026-10-24');
    assert.strictEqual(grid.length % 7, 0);
    // Oct 1, 2026 is a Thursday -> 3 leading days from September (Mon 28, Tue 29, Wed 30)
    assert.strictEqual(grid[0].dayNumber, 28);
    assert.strictEqual(grid[0].isCurrentMonth, false);
    assert.strictEqual(grid[3].dayNumber, 1);
    assert.strictEqual(grid[3].isCurrentMonth, true);
  });

  it('never marks future dates as missed', () => {
    const today = '2026-10-24';
    const cell = Calendar.createDayCell('2026-10-28', 28, true, [], '2026-10-24', today);
    assert.strictEqual(cell.isFuture, true);
    assert.strictEqual(cell.status, 'future');
  });
});
