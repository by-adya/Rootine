// public/js/domain/streaks.js
// ----------------------------------------------------------------------------
// Rootine - Pure Streak & History Engine
// Computes deterministic daily habit streaks and 7-day rolling completion rings.
// CRITICAL RULE: Weekly habits NEVER have streaks or streak rings.
// ----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    const Dates = require('./dates');
    module.exports = factory(Dates);
  } else {
    root.Rootine = root.Rootine || {};
    root.Rootine.Streaks = factory(root.Rootine.Dates);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Dates) {
  'use strict';

  /**
   * Calculates the consecutive daily streak for a daily habit.
   * If the habit is weekly, returns 0 (weekly habits strictly have no streaks).
   *
   * Streak Rules:
   * 1. If completed on referenceDateStr, streak is 1 + consecutive previous days.
   * 2. If NOT completed on referenceDateStr, check yesterday. If yesterday was
   *    completed, yesterday's streak is preserved (the day is still in progress).
   * 3. If neither referenceDateStr nor yesterday is completed, streak is 0.
   *
   * @param {Object} habit
   * @param {string} referenceDateStr - "YYYY-MM-DD"
   * @returns {number} Current streak count
   */
  function calculateDailyStreak(habit, referenceDateStr) {
    if (!habit || habit.type === 'weekly') {
      return 0; // Weekly habits never have streaks
    }

    const completedSet = new Set(habit.completedDates || []);

    if (completedSet.size === 0) {
      return 0;
    }

    let currentCheckDate = referenceDateStr;
    let streak = 0;

    // Check if reference date is completed
    if (completedSet.has(currentCheckDate)) {
      streak = 1;
      currentCheckDate = Dates.addDays(currentCheckDate, -1);
      while (completedSet.has(currentCheckDate)) {
        streak += 1;
        currentCheckDate = Dates.addDays(currentCheckDate, -1);
      }
      return streak;
    }

    // Reference date is NOT completed: check if yesterday was completed
    const yesterday = Dates.addDays(referenceDateStr, -1);
    if (completedSet.has(yesterday)) {
      streak = 1;
      currentCheckDate = Dates.addDays(yesterday, -1);
      while (completedSet.has(currentCheckDate)) {
        streak += 1;
        currentCheckDate = Dates.addDays(currentCheckDate, -1);
      }
      return streak;
    }

    // Yesterday was also missed: streak is broken
    return 0;
  }

  /**
   * Calculates the rolling completion ratio over a given window of days
   * (defaults to the last 7 calendar days up to and including referenceDateStr).
   * Used for the circular SVG progress ring wrapping around the habit icon.
   *
   * @param {Object} habit
   * @param {string} referenceDateStr - "YYYY-MM-DD"
   * @param {number} windowDays - Defaults to 7
   * @returns {{ completed: number, total: number, ratio: number }}
   */
  function getRollingCompletionRatio(habit, referenceDateStr, windowDays = 7) {
    if (!habit || habit.type === 'weekly') {
      return { completed: 0, total: windowDays, ratio: 0 };
    }

    const completedSet = new Set(habit.completedDates || []);
    let completedCount = 0;

    for (let i = 0; i < windowDays; i++) {
      const dateToCheck = Dates.addDays(referenceDateStr, -i);
      if (completedSet.has(dateToCheck)) {
        completedCount++;
      }
    }

    return {
      completed: completedCount,
      total: windowDays,
      ratio: windowDays > 0 ? completedCount / windowDays : 0,
    };
  }

  /**
   * Returns an array of the last 7 days history for a daily habit.
   * Ordered chronologically from 6 days ago up to referenceDateStr.
   * @param {Object} habit
   * @param {string} referenceDateStr
   * @returns {Array<{ date: string, dayInitial: string, isCompleted: boolean, isSelected: boolean }>}
   */
  function getDailySevenDayHistory(habit, referenceDateStr) {
    const completedSet = new Set((habit && habit.completedDates) || []);
    const history = [];
    const dayInitials = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let i = 6; i >= 0; i--) {
      const d = Dates.addDays(referenceDateStr, -i);
      const dayNum = Dates.getDayOfWeek(d);
      history.push({
        date: d,
        dayInitial: dayInitials[dayNum],
        isCompleted: completedSet.has(d),
        isSelected: d === referenceDateStr,
      });
    }

    return history;
  }

  return {
    calculateDailyStreak,
    getRollingCompletionRatio,
    getDailySevenDayHistory,
  };
});
