// public/js/components/plant-stages.js
// ----------------------------------------------------------------------------
// Rootine - Botanical Plant Stage Vector Illustrations
// 6 distinct, handcrafted SVG illustrations representing a habit's journey:
// Stage 1: Seed
// Stage 2: Germinating Seed
// Stage 3: Sprout
// Stage 4: Growing Plant
// Stage 5: Mature Plant
// Stage 6: Bloom (Flower)
// ----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.Rootine = root.Rootine || {};
    root.Rootine.PlantStages = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Returns inline SVG markup for a given plant stage number (1 to 6).
   * @param {number} stage - 1 to 6
   * @param {string} [className='plant-stage-svg']
   * @returns {string} SVG HTML string
   */
  function getPlantStageSvg(stage, className = 'plant-stage-svg') {
    const stageNum = Math.min(6, Math.max(1, Number(stage) || 1));

    switch (stageNum) {
      // ----------------------------------------------------------------------
      // STAGE 1: SEED (Small seed resting in soil bed)
      // ----------------------------------------------------------------------
      case 1:
        return `
          <svg class="${className} stage-seed" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plant Stage 1: Seed">
            <!-- Soil Bed Base -->
            <path d="M7 27 Q 18 24 29 27 Q 31 30 26 31 Q 18 32 10 31 Q 5 30 7 27 Z" fill="#806854" opacity="0.85"/>
            <path d="M9 28 Q 18 26 27 28 Q 25 30 18 30.5 Q 11 30 9 28 Z" fill="#5c4736"/>
            <!-- Single Seed -->
            <ellipse cx="18" cy="24.5" rx="3.5" ry="4.5" transform="rotate(-15 18 24.5)" fill="#c49b6b" stroke="#6b533b" stroke-width="1.2"/>
            <path d="M17.5 21 Q 18.5 24 17.5 27" stroke="#ebd2ab" stroke-width="0.8" stroke-linecap="round"/>
          </svg>
        `;

      // ----------------------------------------------------------------------
      // STAGE 2: GERMINATING SEED (Seed splits, tiny green shoot emerges)
      // ----------------------------------------------------------------------
      case 2:
        return `
          <svg class="${className} stage-germinating" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plant Stage 2: Germinating Seed">
            <!-- Soil Bed Base -->
            <path d="M7 27 Q 18 24 29 27 Q 31 30 26 31 Q 18 32 10 31 Q 5 30 7 27 Z" fill="#806854" opacity="0.85"/>
            <!-- Split Seed Halves -->
            <ellipse cx="15.5" cy="25" rx="3" ry="3.8" transform="rotate(-30 15.5 25)" fill="#b88f61" stroke="#5c4736" stroke-width="1"/>
            <ellipse cx="20.5" cy="25.5" rx="2.8" ry="3.8" transform="rotate(25 20.5 25.5)" fill="#9e774c" stroke="#5c4736" stroke-width="1"/>
            <!-- Emerging Green Shoot -->
            <path d="M17.5 23 Q 17.5 17 19.5 15" stroke="#496a42" stroke-width="2" stroke-linecap="round"/>
            <path d="M19.5 15 C 22 13 23 15 20 16.5 Z" fill="#6f9872"/>
          </svg>
        `;

      // ----------------------------------------------------------------------
      // STAGE 3: SPROUT (Stem rising with two tender leaves)
      // ----------------------------------------------------------------------
      case 3:
        return `
          <svg class="${className} stage-sprout" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plant Stage 3: Sprout">
            <!-- Soil Bed Base -->
            <path d="M8 28 Q 18 25 28 28 Q 30 30 26 31 Q 18 32 10 31 Q 6 30 8 28 Z" fill="#755e4b" opacity="0.85"/>
            <!-- Tender Stem -->
            <path d="M18 27 V 16 Q 18 12 18 11" stroke="#496a42" stroke-width="2.2" stroke-linecap="round"/>
            <!-- Left Leaf -->
            <path d="M18 16 C 11 12 10 18 18 17 Z" fill="#6f9872" stroke="#3b5935" stroke-width="0.8"/>
            <!-- Right Leaf -->
            <path d="M18 13 C 25 9 26 15 18 14 Z" fill="#8baea4" stroke="#3b5935" stroke-width="0.8"/>
          </svg>
        `;

      // ----------------------------------------------------------------------
      // STAGE 4: GROWING PLANT (Strong stem branching with 4 leaves)
      // ----------------------------------------------------------------------
      case 4:
        return `
          <svg class="${className} stage-growing" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plant Stage 4: Growing Plant">
            <!-- Soil Bed Base -->
            <path d="M8 28 Q 18 25 28 28 Q 30 30 26 31 Q 18 32 10 31 Q 6 30 8 28 Z" fill="#755e4b" opacity="0.85"/>
            <!-- Main Stem -->
            <path d="M18 27 Q 17.5 18 18 8" stroke="#3b5935" stroke-width="2.2" stroke-linecap="round"/>
            <!-- Lower Left Leaf -->
            <path d="M18 20 C 10 16 11 23 18 21 Z" fill="#5a7f5a" stroke="#2d4529" stroke-width="0.7"/>
            <!-- Lower Right Leaf -->
            <path d="M18 17 C 26 13 25 20 18 18 Z" fill="#6f9872" stroke="#2d4529" stroke-width="0.7"/>
            <!-- Upper Left Leaf -->
            <path d="M18 13 C 11 9 13 15 18 13.5 Z" fill="#7fa687" stroke="#2d4529" stroke-width="0.7"/>
            <!-- Top Sprout Leaf -->
            <path d="M18 8 C 22 4 23 9 18 8.5 Z" fill="#8baea4" stroke="#2d4529" stroke-width="0.7"/>
          </svg>
        `;

      // ----------------------------------------------------------------------
      // STAGE 5: MATURE PLANT (Lush foliage with multiple branching leaves)
      // ----------------------------------------------------------------------
      case 5:
        return `
          <svg class="${className} stage-mature" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plant Stage 5: Mature Plant">
            <!-- Soil Bed Base -->
            <path d="M7 28 Q 18 25 29 28 Q 31 30 27 31 Q 18 32 9 31 Q 5 30 7 28 Z" fill="#695341" opacity="0.85"/>
            <!-- Central Trunk/Stem -->
            <path d="M18 28 Q 18 18 18 7" stroke="#344e30" stroke-width="2.4" stroke-linecap="round"/>
            <!-- Foliage Leaves Cluster -->
            <path d="M18 22 C 8 18 9 25 18 23 Z" fill="#436340" stroke="#263b23" stroke-width="0.7"/>
            <path d="M18 19 C 28 15 27 22 18 20 Z" fill="#52764f" stroke="#263b23" stroke-width="0.7"/>
            <path d="M18 15 C 9 10 11 17 18 16 Z" fill="#5f865c" stroke="#263b23" stroke-width="0.7"/>
            <path d="M18 12 C 27 8 26 14 18 13 Z" fill="#6d9569" stroke="#263b23" stroke-width="0.7"/>
            <path d="M18 8 C 12 3 13 9 18 8.5 Z" fill="#7fa687" stroke="#263b23" stroke-width="0.7"/>
            <path d="M18 7 C 22 2 24 7 18 7 Z" fill="#8cb394" stroke="#263b23" stroke-width="0.7"/>
          </svg>
        `;

      // ----------------------------------------------------------------------
      // STAGE 6: BLOOM (Lush plant topped with a delicate flower bloom)
      // ----------------------------------------------------------------------
      case 6:
      default:
        return `
          <svg class="${className} stage-bloom" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Plant Stage 6: Bloom">
            <!-- Soil Bed Base -->
            <path d="M7 28 Q 18 25 29 28 Q 31 30 27 31 Q 18 32 9 31 Q 5 30 7 28 Z" fill="#695341" opacity="0.85"/>
            <!-- Sturdy Stem -->
            <path d="M18 28 Q 18 19 18 11" stroke="#344e30" stroke-width="2.4" stroke-linecap="round"/>
            <!-- Side Foliage -->
            <path d="M18 21 C 8 18 9 24 18 22 Z" fill="#496a42" stroke="#263b23" stroke-width="0.6"/>
            <path d="M18 18 C 28 15 27 21 18 19 Z" fill="#577c50" stroke="#263b23" stroke-width="0.6"/>
            <path d="M18 14 C 10 11 12 17 18 15 Z" fill="#678d5f" stroke="#263b23" stroke-width="0.6"/>
            <!-- Flower Bloom Petals (Muted Botanical Rose) -->
            <circle cx="18" cy="8.5" r="3.6" fill="#e89d9d"/>
            <circle cx="14.8" cy="8.5" r="3.2" fill="#f4b5b5"/>
            <circle cx="21.2" cy="8.5" r="3.2" fill="#f4b5b5"/>
            <circle cx="18" cy="5.3" r="3.2" fill="#f4b5b5"/>
            <circle cx="18" cy="11.7" r="3.2" fill="#f4b5b5"/>
            <!-- Golden Flower Core -->
            <circle cx="18" cy="8.5" r="1.8" fill="#e0a34c"/>
          </svg>
        `;
    }
  }

  return {
    getPlantStageSvg,
  };
});
