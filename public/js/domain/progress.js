// public/js/domain/progress.js
// ----------------------------------------------------------------------------
// Rootine - Progress Calculation Engine
// Provides three distinct, accurate completion progress levels:
// 1. Overall Progress (for selected date)
// 2. Daily Habits Progress (for selected date)
// 3. Weekly Habits Progress (for the week containing selected date)
// ----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    const Dates = require('./dates');
    module.exports = factory(Dates);
  } else {
    root.Rootine = root.Rootine || {};
    root.Rootine.Progress = factory(root.Rootine.Dates);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Dates) {
  'use strict';

  /**
   * Determines if a habit is scheduled/due on a given date string.
   * @param {Object} habit
   * @param {string} dateStr - "YYYY-MM-DD"
   * @returns {boolean}
   */
  function isHabitDueOnDate(habit, dateStr) {
    if (!habit || habit.archivedAt) return false;
    if (habit.type === 'daily') return true;

    // Weekly habit: check if this day of week is configured
    const dayOfWeek = Dates.getDayOfWeek(dateStr);
    const dueDays = Array.isArray(habit.dueDays) ? habit.dueDays : [1];
    return dueDays.includes(dayOfWeek);
  }

  /**
   * Level A: Overall Progress for the selected date.
   * Denominator is all active habits due on that date.
   * @param {Array<Object>} habits
   * @param {string} selectedDateStr
   * @returns {{ total: number, completed: number, percent: number }}
   */
  function calculateOverallProgress(habits, selectedDateStr) {
    const activeHabits = (habits || []).filter((h) => !h.archivedAt);
    const dueHabits = activeHabits.filter((h) => isHabitDueOnDate(h, selectedDateStr));

    if (dueHabits.length === 0) {
      return { total: 0, completed: 0, percent: 0 };
    }

    const completed = dueHabits.filter(
      (h) => Array.isArray(h.completedDates) && h.completedDates.includes(selectedDateStr)
    ).length;

    const percent = Math.round((completed / dueHabits.length) * 100);

    return {
      total: dueHabits.length,
      completed,
      percent,
    };
  }

  /**
   * Level B: Daily Habits Progress for the selected date.
   * Evaluates active daily habits only.
   * @param {Array<Object>} habits
   * @param {string} selectedDateStr
   * @returns {{ total: number, completed: number, percent: number }}
   */
  function calculateDailyProgress(habits, selectedDateStr) {
    const dailyHabits = (habits || []).filter(
      (h) => !h.archivedAt && h.type === 'daily'
    );

    if (dailyHabits.length === 0) {
      return { total: 0, completed: 0, percent: 0 };
    }

    const completed = dailyHabits.filter(
      (h) => Array.isArray(h.completedDates) && h.completedDates.includes(selectedDateStr)
    ).length;

    const percent = Math.round((completed / dailyHabits.length) * 100);

    return {
      total: dailyHabits.length,
      completed,
      percent,
    };
  }

  /**
   * Level C: Weekly Habits Progress against their actual configured schedule
   * for the week containing referenceDateStr (Monday through Sunday).
   *
   * Each scheduled day in the week counts as one required occurrence.
   * For example, a weekly habit due Mon/Wed/Fri has 3 required occurrences.
   *
   * @param {Array<Object>} habits
   * @param {string} referenceDateStr
   * @returns {{ total: number, completed: number, percent: number }}
   */
  function calculateWeeklyProgress(habits, referenceDateStr) {
    const weeklyHabits = (habits || []).filter(
      (h) => !h.archivedAt && h.type === 'weekly'
    );

    if (weeklyHabits.length === 0) {
      return { total: 0, completed: 0, percent: 0 };
    }

    const weekDays = Dates.getWeekRange(referenceDateStr);
    let totalRequired = 0;
    let completedOccurrences = 0;

    weeklyHabits.forEach((habit) => {
      const completedSet = new Set(habit.completedDates || []);

      weekDays.forEach((dateStr) => {
        if (isHabitDueOnDate(habit, dateStr)) {
          totalRequired++;
          if (completedSet.has(dateStr)) {
            completedOccurrences++;
          }
        }
      });
    });

    if (totalRequired === 0) {
      return { total: 0, completed: 0, percent: 0 };
    }

    const percent = Math.round((completedOccurrences / totalRequired) * 100);

    return {
      total: totalRequired,
      completed: completedOccurrences,
      percent,
    };
  }

  /**
   * Checks if a weekly habit is completely satisfied for the week
   * containing referenceDateStr (completed on EVERY configured due day).
   * @param {Object} habit
   * @param {string} referenceDateStr
   * @returns {boolean}
   */
  function isWeeklyHabitSatisfiedForWeek(habit, referenceDateStr) {
    if (!habit || habit.type !== 'weekly') return false;
    const weekDays = Dates.getWeekRange(referenceDateStr);
    const completedSet = new Set(habit.completedDates || []);

    const dueDatesThisWeek = weekDays.filter((dateStr) => isHabitDueOnDate(habit, dateStr));
    if (dueDatesThisWeek.length === 0) return true;

    return dueDatesThisWeek.every((dateStr) => completedSet.has(dateStr));
  }

  return {
    isHabitDueOnDate,
    calculateOverallProgress,
    calculateDailyProgress,
    calculateWeeklyProgress,
    isWeeklyHabitSatisfiedForWeek,
  };
});
