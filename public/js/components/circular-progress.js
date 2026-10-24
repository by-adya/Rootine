// public/js/components/circular-progress.js
// ----------------------------------------------------------------------------
// Rootine - Circular Progress & Living Plant Habit Ring Component
// Implements exact visual specifications:
// 1. Overall Dashboard Progress Ring (large, thick forest green stroke with cream track)
// 2. Daily Habits Living Plant Ring with streak number placed directly on top
// 3. Weekly Habits Living Plant Frame (strictly without streaks or streak rings)
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
   */
  function renderCircularRing({
    size = 98,
    strokeWidth = 8,
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
   * Signature Habit Plant Ring (CRITICAL REQUIREMENT from Section 3, 4 & 5).
   *
   * For DAILY habits:
   *              [streak number]  <-- Centered discreetly above the ring
   *           [circular SVG ring]  <-- 7-day rolling completion ratio
   *             [living plant]    <-- Centered inside (Seed -> Sprout -> Bloom)
   *
   * For WEEKLY habits:
   *           [decorative frame]   <-- Subtle circular frame
   *             [living plant]    <-- Centered inside
   *           *STRICTLY NO streak number and NO streak rings*
   *
   * @param {Object} options
   * @param {string} options.plantSvg - Living plant SVG for the habit's growth stage
   * @param {number} [options.streakCount=0] - Current consecutive-day streak
   * @param {number} [options.rollingRatio=0] - Rolling 7-day completion ratio (0 to 1)
   * @param {boolean} [options.isWeekly=false] - True for weekly habits
   * @param {boolean} [options.isCompleted=false] - True if completed on selected date
   * @param {number} [options.growthStage=1] - 1 to 6
   * @returns {string} HTML string
   */
  function renderHabitIconComponent({
    plantSvg,
    streakCount = 0,
    rollingRatio = 0,
    isWeekly = false,
    isCompleted = false,
    growthStage = 1,
  }) {
    if (isWeekly) {
      // Weekly habit: living plant in decorative cream frame without streak or ring
      return `
        <div class="streak-ring-unit weekly-habit-unit ${isCompleted ? 'completed' : ''}" title="Growth Stage ${growthStage}">
          <div class="weekly-plant-frame">
            ${plantSvg}
          </div>
        </div>
      `;
    }

    // Daily habit: streak number on top + 7-day rolling circular ring + living plant in center
    const percent = Math.min(100, Math.max(0, Math.round(rollingRatio * 100)));
    const size = 42;
    const strokeWidth = 2.8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return `
      <div class="streak-ring-unit daily-habit-unit ${isCompleted ? 'completed' : ''}" title="Stage ${growthStage} • ${streakCount} day streak">
        <span class="streak-top-num" aria-label="${streakCount} day streak">${streakCount > 0 ? streakCount : '0'}</span>
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
            <div class="plant-icon-frame">
              ${plantSvg}
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
