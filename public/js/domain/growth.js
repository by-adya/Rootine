// public/js/domain/growth.js
// ----------------------------------------------------------------------------
// Rootine - Living Habit Growth Engine
// Every habit begins as a seed (Stage 1). As users consistently complete
// their habits, their individual plants grow through 6 distinct botanical stages.
//
// Key Principle: Plant growth represents cumulative consistency and nurturing.
// Streaks represent consecutive days. A missed day can break a streak, but
// DOES NOT destroy or reset the plant back to a seed!
// ----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.Rootine = root.Rootine || {};
    root.Rootine.Growth = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // 6 Defined Botanical Growth Stages
  const STAGES = {
    1: {
      stage: 1,
      id: 'seed',
      name: 'Seed',
      subtitle: 'Planted seed in fertile soil',
      minCompletions: 0,
    },
    2: {
      stage: 2,
      id: 'germinating',
      name: 'Germinating Seed',
      subtitle: 'Seed splitting, tiny green shoot emerging',
      minCompletions: 1,
    },
    3: {
      stage: 3,
      id: 'sprout',
      name: 'Sprout',
      subtitle: 'Young stem with two tender leaves',
      minCompletions: 3,
    },
    4: {
      stage: 4,
      id: 'growing',
      name: 'Growing Plant',
      subtitle: 'Strong stem branching with several leaves',
      minCompletions: 7,
    },
    5: {
      stage: 5,
      id: 'mature',
      name: 'Mature Plant',
      subtitle: 'Lush, thriving botanical silhouette',
      minCompletions: 14,
    },
    6: {
      stage: 6,
      id: 'bloom',
      name: 'Bloom',
      subtitle: 'Flourishing plant in full flower bloom',
      minCompletions: 22,
    },
  };

  /**
   * Deterministically calculates a habit's botanical growth stage based on
   * historical completed occurrences.
   *
   * @param {Object} habit
   * @param {string[]} [habit.completedDates]
   * @returns {Object} Stage metadata: { stage, id, name, subtitle, totalCompletions, nextThreshold, progressToNext }
   */
  function calculateGrowthStage(habit) {
    if (!habit) {
      return { ...STAGES[1], totalCompletions: 0, nextThreshold: 1, progressToNext: 0 };
    }

    const completedDates = Array.isArray(habit.completedDates) ? habit.completedDates : [];
    // Ensure unique dates only
    const uniqueCompletions = new Set(completedDates).size;

    let currentStageNum = 1;

    if (uniqueCompletions >= STAGES[6].minCompletions) {
      currentStageNum = 6;
    } else if (uniqueCompletions >= STAGES[5].minCompletions) {
      currentStageNum = 5;
    } else if (uniqueCompletions >= STAGES[4].minCompletions) {
      currentStageNum = 4;
    } else if (uniqueCompletions >= STAGES[3].minCompletions) {
      currentStageNum = 3;
    } else if (uniqueCompletions >= STAGES[2].minCompletions) {
      currentStageNum = 2;
    } else {
      currentStageNum = 1;
    }

    const currentStage = STAGES[currentStageNum];
    const nextStage = STAGES[currentStageNum + 1] || null;

    let progressToNext = 100;
    let nextThreshold = currentStage.minCompletions;

    if (nextStage) {
      nextThreshold = nextStage.minCompletions;
      const span = nextStage.minCompletions - currentStage.minCompletions;
      const progressInSpan = uniqueCompletions - currentStage.minCompletions;
      progressToNext = Math.min(100, Math.round((progressInSpan / span) * 100));
    }

    return {
      ...currentStage,
      totalCompletions: uniqueCompletions,
      nextThreshold,
      progressToNext,
    };
  }

  return {
    STAGES,
    calculateGrowthStage,
  };
});
