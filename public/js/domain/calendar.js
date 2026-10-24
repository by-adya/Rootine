// public/js/domain/calendar.js
// ----------------------------------------------------------------------------
// Rootine - Monthly Calendar Engine
// Computes calendar month grids with correct weekday alignment, leap years,
// and date status derivation based on real saved completion records.
// ----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    const Dates = require('./dates');
    const Progress = require('./progress');
    module.exports = factory(Dates, Progress);
  } else {
    root.Rootine = root.Rootine || {};
    root.Rootine.Calendar = factory(root.Rootine.Dates, root.Rootine.Progress);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Dates, Progress) {
  'use strict';

  /**
   * Generates a 35-day or 42-day calendar grid for a given year and month (0-indexed).
   * Week starts on Monday.
   *
   * @param {number} year - e.g. 2026
   * @param {number} month - 0 for Jan, 11 for Dec
   * @param {Array<Object>} habits
   * @param {string} selectedDateStr - "YYYY-MM-DD"
   * @param {string} todayStr - "YYYY-MM-DD"
   * @returns {Array<Object>} Array of day cell objects
   */
  function generateMonthGrid(year, month, habits, selectedDateStr, todayStr) {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Days in current month
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Day of week of the 1st (0 = Sun, 1 = Mon ... 6 = Sat)
    const startDayOfWeek = firstDayOfMonth.getDay();
    // Monday-based offset: Mon(1)->0, Tue(2)->1, ..., Sun(0)->6
    const leadDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Previous month total days
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const cells = [];

    // 1. Fill leading days from previous month
    for (let i = leadDays - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = Dates.formatLocalDateKey(prevDate);
      cells.push(createDayCell(dateStr, dayNum, false, habits, selectedDateStr, todayStr));
    }

    // 2. Fill days of current month
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const curDate = new Date(year, month, dayNum);
      const dateStr = Dates.formatLocalDateKey(curDate);
      cells.push(createDayCell(dateStr, dayNum, true, habits, selectedDateStr, todayStr));
    }

    // 3. Fill trailing days from next month up to complete rows (multiple of 7: 35 or 42)
    const totalSlots = cells.length > 35 ? 42 : 35;
    const trailingDaysNeeded = totalSlots - cells.length;

    for (let dayNum = 1; dayNum <= trailingDaysNeeded; dayNum++) {
      const nextDate = new Date(year, month + 1, dayNum);
      const dateStr = Dates.formatLocalDateKey(nextDate);
      cells.push(createDayCell(dateStr, dayNum, false, habits, selectedDateStr, todayStr));
    }

    return cells;
  }

  /**
   * Constructs an individual calendar day cell with verified status.
   */
  function createDayCell(dateStr, dayNumber, isCurrentMonth, habits, selectedDateStr, todayStr) {
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDateStr;
    const isFuture = dateStr > todayStr;

    // Evaluate real completion metrics on this date
    const progress = Progress.calculateOverallProgress(habits, dateStr);

    let status = 'empty'; // 'empty' | 'completed' | 'partial' | 'none' | 'future'

    if (isFuture) {
      status = 'future';
    } else if (progress.total === 0) {
      status = 'empty';
    } else if (progress.completed === progress.total) {
      status = 'completed';
    } else if (progress.completed > 0) {
      status = 'partial';
    } else {
      status = 'none';
    }

    return {
      dateStr,
      dayNumber,
      isCurrentMonth,
      isToday,
      isSelected,
      isFuture,
      status,
      percent: progress.percent,
      completedCount: progress.completed,
      totalCount: progress.total,
    };
  }

  return {
    generateMonthGrid,
    createDayCell,
  };
});
