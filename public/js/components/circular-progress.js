// public/js/components/circular-progress.js
// ----------------------------------------------------------------------------
// Rootine - Reusable Circular Progress Ring Component
// Generates accessible SVG progress rings for:
// 1. Overall Dashboard Progress (large)
// 2. Daily & Weekly Section Progress (medium)
// 3. Signature Daily Habit Icon Rings (wrapping around habit icons with centered streak number)
// ----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.Rootine = root.Rootine || {};
    root.Rootine.CircularProgress = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Generates a reusable SVG circular progress ring HTML string.
   *
   * @param {Object} options
   * @param {number} options.size - Diameter in px (e.g. 120 for overall, 44 for habit icon)
   * @param {number} options.strokeWidth - Stroke width in px (e.g. 8 or 3)
   * @param {number} options.percent - 0 to 100
   * @param {string} options.centerHtml - HTML to render in the center
   * @param {string} options.ariaLabel - Accessible description
   * @param {string} [options.className] - Extra CSS classes
   * @returns {string} HTML string
   */
  function renderCircularRing({
    size = 64,
    strokeWidth = 5,
    percent = 0,
    centerHtml = '',
    ariaLabel = 'Progress ring',
    className = '',
  }) {
    const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

    return `
      <div class="circular-progress-wrap ${className}" style="width: ${size}px; height: ${size}px;" role="progressbar" aria-valuenow="${clampedPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="${ariaLabel}">
        <svg class="circular-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle
            class="progress-track-circle"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke-width="${strokeWidth}"
          />
          <circle
            class="progress-fill-circle"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${strokeDashoffset}"
            stroke-linecap="round"
            transform="rotate(-90 ${size / 2} ${size / 2})"
          />
        </svg>
        <div class="progress-center-content">
          ${centerHtml}
        </div>
      </div>
    `;
  }

  /**
   * Signature Habit Icon Ring (CRITICAL REQUIREMENT from Section 6).
   *
   * Structure:
   *              [streak number]  <-- Centered discreetly above the ring
   *           [circular SVG ring]  <-- 7-day rolling completion ring
   *             [habit icon]      <-- Centered inside
   *
   * Weekly habits do NOT show streak number or progress ring.
   *
   * @param {Object} options
   * @param {string} options.iconSvg - Inner SVG icon
   * @param {number} options.streakCount - Current consecutive day streak
   * @param {number} options.rollingRatio - 0 to 1 rolling 7-day ratio
   * @param {boolean} options.isWeekly - True if weekly habit (disables streak & ring)
   * @param {boolean} options.isCompleted - Completed on selected date
   * @returns {string} HTML string
   */
  function renderHabitIconComponent({
    iconSvg,
    streakCount = 0,
    rollingRatio = 0,
    isWeekly = false,
    isCompleted = false,
  }) {
    if (isWeekly) {
      // Weekly habit: regular icon without streak number or progress ring
      return `
        <div class="habit-icon-unit weekly-unit ${isCompleted ? 'completed' : ''}">
          <div class="habit-icon-circle">
            ${iconSvg}
          </div>
        </div>
      `;
    }

    // Daily habit: streak number above circular SVG ring
    const percent = Math.round(rollingRatio * 100);
    const size = 42;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return `
      <div class="habit-icon-unit daily-unit ${isCompleted ? 'completed' : ''}">
        <span class="habit-streak-number" title="${streakCount} day streak" aria-label="${streakCount} day streak">
          ${streakCount > 0 ? streakCount : '0'}
        </span>
        <div class="circular-progress-wrap habit-ring-wrap" style="width: ${size}px; height: ${size}px;" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="${percent}% 7-day completion">
          <svg class="circular-svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle
              class="progress-track-circle"
              cx="${size / 2}"
              cy="${size / 2}"
              r="${radius}"
              stroke-width="${strokeWidth}"
            />
            <circle
              class="progress-fill-circle ${percent > 0 ? 'active' : ''}"
              cx="${size / 2}"
              cy="${size / 2}"
              r="${radius}"
              stroke-width="${strokeWidth}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${strokeDashoffset}"
              stroke-linecap="round"
              transform="rotate(-90 ${size / 2} ${size / 2})"
            />
          </svg>
          <div class="progress-center-content">
            <div class="habit-center-icon">
              ${iconSvg}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderCircularRing,
    renderHabitIconComponent,
  };
});
