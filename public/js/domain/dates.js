// public/js/domain/dates.js
// ----------------------------------------------------------------------------
// Rootine - Pure Date Utility Module
// Handles timezone-safe local date math using standardized "YYYY-MM-DD" keys.
// Universal module: runs in Node.js test runners and directly in browsers.
// ----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.Rootine = root.Rootine || {};
    root.Rootine.Dates = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Formats a local Date object into "YYYY-MM-DD" string.
   * Uses local year, month, and day to avoid UTC conversion shifts.
   * @param {Date} date
   * @returns {string} "YYYY-MM-DD"
   */
  function formatLocalDateKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parses a "YYYY-MM-DD" string into a Date object at local midnight (00:00:00).
   * @param {string} dateStr
   * @returns {Date}
   */
  function parseLocalDateKey(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') {
      return new Date();
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  /**
   * Adds or subtracts days from a "YYYY-MM-DD" string.
   * @param {string} dateStr
   * @param {number} days
   * @returns {string} "YYYY-MM-DD"
   */
  function addDays(dateStr, days) {
    const d = parseLocalDateKey(dateStr);
    d.setDate(d.getDate() + days);
    return formatLocalDateKey(d);
  }

  /**
   * Returns the day of the week as an integer (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
   * @param {string} dateStr
   * @returns {number} 0-6
   */
  function getDayOfWeek(dateStr) {
    return parseLocalDateKey(dateStr).getDay();
  }

  /**
   * Returns the number of days between two "YYYY-MM-DD" dates (dateStrB - dateStrA).
   * @param {string} dateStrA
   * @param {string} dateStrB
   * @returns {number}
   */
  function getDaysBetween(dateStrA, dateStrB) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const a = parseLocalDateKey(dateStrA);
    const b = parseLocalDateKey(dateStrB);
    return Math.round((b.getTime() - a.getTime()) / msPerDay);
  }

  /**
   * Returns array of 7 "YYYY-MM-DD" strings for the week containing dateStr.
   * Week starts on Monday (ISO standard).
   * @param {string} dateStr
   * @returns {string[]}
   */
  function getWeekRange(dateStr) {
    const target = parseLocalDateKey(dateStr);
    const day = target.getDay(); // 0 is Sunday, 1 is Monday
    // Distance from Monday: Sunday (0) is 6 days after Monday; Monday (1) is 0 days after Monday
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(target);
    monday.setDate(target.getDate() + diffToMonday);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(formatLocalDateKey(d));
    }
    return weekDays;
  }

  /**
   * Checks if dateStr is strictly in the future compared to referenceDateStr.
   * @param {string} dateStr
   * @param {string} referenceDateStr
   * @returns {boolean}
   */
  function isFutureDate(dateStr, referenceDateStr) {
    return dateStr > referenceDateStr;
  }

  /**
   * Returns friendly human-readable format, e.g. "Friday, Oct 24, 2026".
   * @param {string} dateStr
   * @returns {string}
   */
  function formatHumanDate(dateStr) {
    const d = parseLocalDateKey(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return {
    formatLocalDateKey,
    parseLocalDateKey,
    addDays,
    getDayOfWeek,
    getDaysBetween,
    getWeekRange,
    isFutureDate,
    formatHumanDate,
  };
});
