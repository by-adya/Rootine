// public/script.js
// ----------------------------------------------------------------------------
// rootine. — Application Controller with Living Habit Growth Engine 🌱
// Matches exact visual reference:
// - Left sidebar with botanical branch and brand inscription
// - Compact monthly calendar with status indicators
// - Today's Progress ring with living botanical garden bed
// - Daily habits with living plant icons, streak numbers on top, and 7-day mini dots
// - Weekly habits with living plant icons and scheduled due-day tags (strictly no streaks)
// ----------------------------------------------------------------------------

(function () {
  'use strict';

  const Dates = window.Rootine.Dates;
  const Streaks = window.Rootine.Streaks;
  const Growth = window.Rootine.Growth;
  const Progress = window.Rootine.Progress;
  const Calendar = window.Rootine.Calendar;
  const PlantStages = window.Rootine.PlantStages;
  const CircularProgress = window.Rootine.CircularProgress;
  const Storage = window.Rootine.Storage;

  // ==========================================================================
  // 1. APPLICATION STATE
  // ==========================================================================
  const state = {
    habits: [],
    selectedDate: Dates.formatLocalDateKey(new Date()),
    todayDate: Dates.formatLocalDateKey(new Date()),
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(),
    recentlyAdvancedHabitId: null,
    alertTimer: null,
  };

  // ==========================================================================
  // 2. DOM REFERENCES
  // ==========================================================================
  const dom = {
    headerDateDisplay: document.getElementById('header-date-display'),
    prevDateBtn: document.getElementById('prev-date-btn'),
    nextDateBtn: document.getElementById('next-date-btn'),
    alertBanner: document.getElementById('alert-banner'),

    // Top Card 1: Calendar
    calMonthTitle: document.getElementById('cal-month-title'),
    calPrevBtn: document.getElementById('cal-prev-btn'),
    calNextBtn: document.getElementById('cal-next-btn'),
    calDaysGrid: document.getElementById('cal-days-grid'),

    // Top Card 2: Progress
    progressRingMount: document.getElementById('progress-ring-mount'),
    gardenQuote: document.getElementById('garden-quote'),

    // Bottom Card 1: Daily Habits
    dailySubtitle: document.getElementById('daily-subtitle'),
    dailyHabitsContainer: document.getElementById('daily-habits-container'),

    // Bottom Card 2: Weekly Habits
    weeklySubtitle: document.getElementById('weekly-subtitle'),
    weeklyHabitsContainer: document.getElementById('weekly-habits-container'),

    // Modal
    habitModal: document.getElementById('habit-modal'),
    modalTitle: document.getElementById('modal-title'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    habitDialogForm: document.getElementById('habit-dialog-form'),
    modalHabitId: document.getElementById('modal-habit-id'),
    modalHabitName: document.getElementById('modal-habit-name'),
    modalNameError: document.getElementById('modal-name-error'),
    modalHabitDesc: document.getElementById('modal-habit-desc'),
    typeRadios: document.querySelectorAll('input[name="habit-type"]'),
    weeklyDaysGroup: document.getElementById('weekly-days-group'),
    modalDaysError: document.getElementById('modal-days-error'),
    dayPills: document.querySelectorAll('.day-pill'),
    iconPickerGrid: document.getElementById('icon-picker-grid'),

    // Confirm Modal
    confirmModal: document.getElementById('confirm-modal'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
    confirmOkBtn: document.getElementById('confirm-ok-btn'),
  };

  // ==========================================================================
  // 3. UI FEEDBACK HELPERS
  // ==========================================================================
  function showAlert(message, type = 'success') {
    if (state.alertTimer) clearTimeout(state.alertTimer);
    dom.alertBanner.textContent = message;
    dom.alertBanner.className = `alert-banner alert-${type}`;
    dom.alertBanner.classList.remove('hidden');

    state.alertTimer = setTimeout(() => {
      dom.alertBanner.classList.add('hidden');
      state.alertTimer = null;
    }, 4500);
  }

  // ==========================================================================
  // 4. MAIN DASHBOARD RENDERER
  // ==========================================================================
  function renderAll() {
    renderHeaderDate();
    renderCompactCalendar();
    renderTodayProgress();
    renderDailyHabits();
    renderWeeklyHabits();
  }

  // --------------------------------------------------------------------------
  // Header Date
  // --------------------------------------------------------------------------
  function renderHeaderDate() {
    const d = Dates.parseLocalDateKey(state.selectedDate);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    dom.headerDateDisplay.textContent = d.toLocaleDateString('en-US', options);
  }

  // --------------------------------------------------------------------------
  // Card 1: Compact Calendar with Status Dots
  // --------------------------------------------------------------------------
  function renderCompactCalendar() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    dom.calMonthTitle.textContent = `${monthNames[state.calendarMonth]} ${state.calendarYear}`;

    const cells = Calendar.generateMonthGrid(
      state.calendarYear,
      state.calendarMonth,
      state.habits,
      state.selectedDate,
      state.todayDate
    );

    dom.calDaysGrid.innerHTML = '';

    cells.forEach((cell) => {
      const cellEl = document.createElement('div');
      cellEl.className = `cal-day-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${cell.isSelected ? 'is-selected' : ''}`;
      cellEl.setAttribute('role', 'button');
      cellEl.setAttribute('tabindex', '0');
      cellEl.setAttribute('aria-label', `${cell.dateStr}: ${cell.status}`);

      // Status dot determination
      let dotClass = 'dot-none';
      if (cell.status === 'completed') {
        dotClass = 'dot-all';
      } else if (cell.status === 'partial') {
        dotClass = 'dot-some';
      }

      cellEl.innerHTML = `
        <span class="cal-num">${cell.dayNumber}</span>
        <span class="cal-dot ${dotClass}" aria-hidden="true"></span>
      `;

      cellEl.addEventListener('click', () => {
        state.selectedDate = cell.dateStr;
        renderAll();
      });

      dom.calDaysGrid.appendChild(cellEl);
    });
  }

  // --------------------------------------------------------------------------
  // Card 2: Today's Progress Ring
  // --------------------------------------------------------------------------
  function renderTodayProgress() {
    const overall = Progress.calculateOverallProgress(state.habits, state.selectedDate);

    // Render Circular Progress Ring (size: 98px, stroke: 8px)
    dom.progressRingMount.innerHTML = CircularProgress.renderCircularRing({
      size: 98,
      strokeWidth: 8,
      percent: overall.percent,
      ariaLabel: `Overall progress: ${overall.percent}%`,
      centerHtml: `
        <span class="ring-percent-big">${overall.percent}%</span>
        <span class="ring-fraction-small">${overall.completed} of ${overall.total}</span>
      `,
    });

    // Motivational quote
    if (overall.percent === 0) {
      dom.gardenQuote.innerHTML = `Every journey begins with a single seed. <span aria-hidden="true">🌱</span>`;
    } else if (overall.percent < 100) {
      dom.gardenQuote.innerHTML = `You're growing steadily! <span aria-hidden="true">🌱</span>`;
    } else {
      dom.gardenQuote.innerHTML = `Full bloom achieved today! <span aria-hidden="true">🌸</span>`;
    }
  }

  // --------------------------------------------------------------------------
  // Card 3: Daily Habits Column (Living Plant Icons & Streaks on Top)
  // --------------------------------------------------------------------------
  function renderDailyHabits() {
    const dailyHabits = state.habits.filter((h) => !h.archivedAt && h.type === 'daily');
    dom.dailySubtitle.textContent = `${dailyHabits.length} habits • Complete each day`;

    dom.dailyHabitsContainer.innerHTML = '';

    if (dailyHabits.length === 0) {
      dom.dailyHabitsContainer.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.88rem;">
          No daily habits yet. Click <strong>+ Add Habit</strong> above!
        </div>
      `;
      return;
    }

    // Get current week's days (Mon through Sun) for the 7 mini dots
    const weekDays = Dates.getWeekRange(state.selectedDate);
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    dailyHabits.forEach((habit) => {
      const isCompleted = Array.isArray(habit.completedDates) && habit.completedDates.includes(state.selectedDate);
      const streakCount = Streaks.calculateDailyStreak(habit, state.selectedDate);
      const rolling = Streaks.getRollingCompletionRatio(habit, state.selectedDate, 7);

      // Living Habit Growth Stage (Every habit starts as a seed 🌱)
      const growth = Growth.calculateGrowthStage(habit);
      const plantSvg = PlantStages.getPlantStageSvg(growth.stage);

      const row = document.createElement('div');
      row.className = 'habit-row-item';

      // Check if this habit recently advanced a stage to trigger pulse animation
      const isJustGrown = state.recentlyAdvancedHabitId === habit._id;

      // Circular Ring Unit with plant icon in center and streak number centered on top
      const iconUnitHtml = CircularProgress.renderHabitIconComponent({
        plantSvg,
        streakCount,
        rollingRatio: rolling.ratio,
        isWeekly: false,
        isCompleted,
        growthStage: growth.stage,
      });

      // Mon-Sun mini dots
      const completedSet = new Set(habit.completedDates || []);
      const miniDotsHtml = weekDays
        .map((dateStr, idx) => {
          const isDone = completedSet.has(dateStr);
          return `
            <div class="mini-day-group">
              <span class="day-lbl">${dayLabels[idx]}</span>
              <span class="day-dot ${isDone ? 'is-done' : ''}" title="${dayLabels[idx]}: ${isDone ? 'Completed' : 'Not completed'}"></span>
            </div>
          `;
        })
        .join('');

      row.innerHTML = `
        <div class="habit-left-combo">
          <div class="${isJustGrown ? 'plant-growing-pulse' : ''}">
            ${iconUnitHtml}
          </div>

          <div class="habit-info-block">
            <span class="habit-name-txt" title="Stage ${growth.stage}: ${growth.name} (${growth.totalCompletions} completions)">
              ${escapeHtml(habit.name)}
            </span>
            <div class="daily-week-dots">
              ${miniDotsHtml}
            </div>
          </div>
        </div>

        <div class="habit-actions-right">
          <button
            type="button"
            class="btn-round-check ${isCompleted ? 'is-checked' : ''}"
            aria-label="Toggle ${escapeHtml(habit.name)}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button type="button" class="btn-three-dots btn-habit-menu" aria-label="Menu for ${escapeHtml(habit.name)}">⋮</button>
        </div>
      `;

      // Check button toggle
      row.querySelector('.btn-round-check').addEventListener('click', () => {
        handleToggleHabit(habit._id, state.selectedDate);
      });

      // 3-dots edit menu
      row.querySelector('.btn-habit-menu').addEventListener('click', () => {
        openHabitModal(habit);
      });

      dom.dailyHabitsContainer.appendChild(row);
    });

    // Reset pulse animation flag after rendering
    state.recentlyAdvancedHabitId = null;
  }

  // --------------------------------------------------------------------------
  // Card 4: Weekly Habits Column (Living Plant Icons, Strictly NO Streaks)
  // --------------------------------------------------------------------------
  function renderWeeklyHabits() {
    const weeklyHabits = state.habits.filter((h) => !h.archivedAt && h.type === 'weekly');
    dom.weeklySubtitle.textContent = `${weeklyHabits.length} habits • Complete on selected days`;

    dom.weeklyHabitsContainer.innerHTML = '';

    if (weeklyHabits.length === 0) {
      dom.weeklyHabitsContainer.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.88rem;">
          No weekly habits yet. Click <strong>+ Add Habit</strong> above!
        </div>
      `;
      return;
    }

    const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    weeklyHabits.forEach((habit) => {
      const isCompleted = Array.isArray(habit.completedDates) && habit.completedDates.includes(state.selectedDate);

      // Living Habit Growth Stage (Weekly plants grow from their scheduled occurrences)
      const growth = Growth.calculateGrowthStage(habit);
      const plantSvg = PlantStages.getPlantStageSvg(growth.stage);

      const row = document.createElement('div');
      row.className = 'habit-row-item';

      const dueDays = Array.isArray(habit.dueDays) ? habit.dueDays : [6];
      const dueDaysText = dueDays.map((d) => dayShortNames[d]).join(', ');

      // Weekly habit unit (strictly NO streak number, NO streak ring)
      const iconUnitHtml = CircularProgress.renderHabitIconComponent({
        plantSvg,
        isWeekly: true,
        isCompleted,
        growthStage: growth.stage,
      });

      const isJustGrown = state.recentlyAdvancedHabitId === habit._id;

      row.innerHTML = `
        <div class="habit-left-combo">
          <div class="${isJustGrown ? 'plant-growing-pulse' : ''}">
            ${iconUnitHtml}
          </div>

          <div class="habit-info-block">
            <span class="habit-name-txt" title="Stage ${growth.stage}: ${growth.name} (${growth.totalCompletions} completions)">
              ${escapeHtml(habit.name)}
            </span>
            <div class="weekly-schedule-tag">
              <span class="weekly-day-pill">${dueDaysText}</span>
              <div class="weekly-dot-track">
                <span class="weekly-dot-step ${isCompleted ? 'is-done' : ''}"></span>
                <span class="weekly-dot-step"></span>
                <span class="weekly-dot-step"></span>
                <span class="weekly-dot-step"></span>
                <span class="weekly-dot-step"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="habit-actions-right">
          <button
            type="button"
            class="btn-round-check ${isCompleted ? 'is-checked' : ''}"
            aria-label="Toggle ${escapeHtml(habit.name)}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button type="button" class="btn-three-dots btn-habit-menu" aria-label="Menu for ${escapeHtml(habit.name)}">⋮</button>
        </div>
      `;

      // Check button toggle
      row.querySelector('.btn-round-check').addEventListener('click', () => {
        handleToggleHabit(habit._id, state.selectedDate);
      });

      // 3-dots edit menu
      row.querySelector('.btn-habit-menu').addEventListener('click', () => {
        openHabitModal(habit);
      });

      dom.weeklyHabitsContainer.appendChild(row);
    });

    state.recentlyAdvancedHabitId = null;
  }

  // ==========================================================================
  // 5. API ACTIONS (TOGGLE, CREATE, UPDATE, DELETE)
  // ==========================================================================
  async function handleToggleHabit(habitId, dateStr) {
    try {
      const habit = state.habits.find((h) => h._id === habitId);
      const oldGrowth = habit ? Growth.calculateGrowthStage(habit) : null;

      const updated = await Storage.toggleHabitDate(habitId, dateStr);
      const idx = state.habits.findIndex((h) => h._id === habitId);
      if (idx !== -1) {
        state.habits[idx] = updated;
      }

      // Check if the plant grew to a new stage!
      if (oldGrowth) {
        const newGrowth = Growth.calculateGrowthStage(updated);
        if (newGrowth.stage > oldGrowth.stage) {
          state.recentlyAdvancedHabitId = habitId;
          showAlert(`🌱 "${updated.name}" sprouted to Stage ${newGrowth.stage}: ${newGrowth.name}!`);
        }
      }

      renderAll();
    } catch (e) {
      console.error('Error toggling habit:', e);
      showAlert('Could not update habit status.', 'error');
    }
  }

  // Sample habits matching reference mockup, with realistic completion history
  async function seedMockupHabitsIfEmpty() {
    if (state.habits.length > 0) return;

    // Helper to generate an array of past completion dates
    const makeCompletions = (count, recentDays) => {
      const dates = [];
      // Lifetime historical completions for growth stages
      for (let i = 0; i < count; i++) {
        dates.push(Dates.addDays(state.todayDate, -(i + 3)));
      }
      // Recent days for streak and 7-day ring
      if (Array.isArray(recentDays)) {
        recentDays.forEach((offset) => {
          dates.push(Dates.addDays(state.todayDate, offset));
        });
      }
      return [...new Set(dates)];
    };

    const sampleHabits = [
      {
        name: 'Read',
        type: 'daily',
        // 18 completions -> Stage 5 (Mature Plant), 4-day streak (days -3, -2, -1, 0)
        completedDates: makeCompletions(14, [-3, -2, -1, 0]),
      },
      {
        name: 'Workout',
        type: 'daily',
        // 10 completions -> Stage 4 (Growing Plant), 4-day streak (days -3, -2, -1, 0)
        completedDates: makeCompletions(6, [-3, -2, -1, 0]),
      },
      {
        name: 'Journal',
        type: 'daily',
        // 5 completions -> Stage 3 (Sprout), 2-day streak (days -3, -2)
        completedDates: makeCompletions(3, [-3, -2]),
      },
      {
        name: 'Drink Water',
        type: 'daily',
        // 30 completions -> Stage 6 (Bloom 🌸!), 19-day streak
        completedDates: makeCompletions(26, [-4, -3, -2, -1, 0]),
      },
      {
        name: 'Deep Clean Room',
        type: 'weekly',
        dueDays: [6], // Saturday
        // 2 completions -> Stage 2 (Germinating seed)
        completedDates: makeCompletions(2, []),
      },
      {
        name: 'Meal Prep',
        type: 'weekly',
        dueDays: [0], // Sunday
        // 8 completions -> Stage 4 (Growing plant)
        completedDates: makeCompletions(7, [0]),
      },
      {
        name: 'Plan Next Week',
        type: 'weekly',
        dueDays: [0], // Sunday
        // 1 completion -> Stage 2 (Germinating seed)
        completedDates: makeCompletions(1, []),
      },
    ];

    for (const h of sampleHabits) {
      try {
        const created = await Storage.createHabit(h);
        state.habits.push(created);
      } catch (e) {
        console.warn('Could not auto-seed habit:', e);
      }
    }
    renderAll();
  }

  // ==========================================================================
  // 6. MODAL: ADD / EDIT HABIT (Every habit starts as a seed Stage 1 🌱)
  // ==========================================================================
  function openHabitModal(habitToEdit = null, defaultType = 'daily') {
    dom.habitModal.classList.remove('hidden');
    dom.modalNameError.classList.add('hidden');
    dom.modalDaysError.classList.add('hidden');

    if (habitToEdit) {
      dom.modalTitle.textContent = 'Edit Habit';
      dom.modalHabitId.value = habitToEdit._id;
      dom.modalHabitName.value = habitToEdit.name;
      dom.modalHabitDesc.value = habitToEdit.description || '';

      const habitType = habitToEdit.type || 'daily';
      dom.typeRadios.forEach((r) => (r.checked = r.value === habitType));
      toggleWeeklyDays(habitType === 'weekly');

      const dueDays = Array.isArray(habitToEdit.dueDays) ? habitToEdit.dueDays : [6];
      dom.dayPills.forEach((p) => {
        p.classList.toggle('selected', dueDays.includes(Number(p.dataset.day)));
      });
    } else {
      dom.modalTitle.textContent = 'Plant New Habit 🌱';
      dom.modalHabitId.value = '';
      dom.modalHabitName.value = '';
      dom.modalHabitDesc.value = '';

      dom.typeRadios.forEach((r) => (r.checked = r.value === defaultType));
      toggleWeeklyDays(defaultType === 'weekly');

      dom.dayPills.forEach((p) => {
        p.classList.toggle('selected', [0, 6].includes(Number(p.dataset.day)));
      });
    }

    dom.modalHabitName.focus();
  }

  function closeHabitModal() {
    dom.habitModal.classList.add('hidden');
  }

  function toggleWeeklyDays(isWeekly) {
    if (isWeekly) {
      dom.weeklyDaysGroup.classList.remove('hidden');
    } else {
      dom.weeklyDaysGroup.classList.add('hidden');
    }
  }

  async function handleModalSubmit(e) {
    e.preventDefault();

    const name = dom.modalHabitName.value.trim();
    const description = dom.modalHabitDesc.value.trim();
    const id = dom.modalHabitId.value;
    const type = document.querySelector('input[name="habit-type"]:checked').value;

    if (!name) {
      dom.modalNameError.textContent = 'Habit name is required.';
      dom.modalNameError.classList.remove('hidden');
      return;
    }

    let dueDays = [0, 1, 2, 3, 4, 5, 6];
    if (type === 'weekly') {
      const selected = Array.from(dom.dayPills).filter((p) => p.classList.contains('selected'));
      if (selected.length === 0) {
        dom.modalDaysError.classList.remove('hidden');
        return;
      }
      dueDays = selected.map((p) => Number(p.dataset.day));
    }

    try {
      if (id) {
        // Edit existing habit (preserves plant growth stage and completions)
        const updated = await Storage.updateHabit(id, { name, description, type, dueDays });
        const idx = state.habits.findIndex((h) => h._id === id);
        if (idx !== -1) state.habits[idx] = updated;
        showAlert(`"${name}" updated.`);
      } else {
        // Create new habit — starts at Stage 1: Seed 🌱
        const created = await Storage.createHabit({
          name,
          description,
          type,
          dueDays,
          completedDates: [],
        });
        state.habits.push(created);
        showAlert(`"${name}" planted as a new seed! 🌱`);
      }
      closeHabitModal();
      renderAll();
    } catch (err) {
      dom.modalNameError.textContent = err.message || 'Failed to save habit.';
      dom.modalNameError.classList.remove('hidden');
    }
  }

  // ==========================================================================
  // 7. UTILITY HELPERS & EVENT LISTENERS
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupEvents() {
    // Top Date Arrows
    dom.prevDateBtn.addEventListener('click', () => {
      state.selectedDate = Dates.addDays(state.selectedDate, -1);
      renderAll();
    });
    dom.nextDateBtn.addEventListener('click', () => {
      state.selectedDate = Dates.addDays(state.selectedDate, 1);
      renderAll();
    });

    // Calendar Month Arrows
    dom.calPrevBtn.addEventListener('click', () => {
      state.calendarMonth -= 1;
      if (state.calendarMonth < 0) {
        state.calendarMonth = 11;
        state.calendarYear -= 1;
      }
      renderCompactCalendar();
    });
    dom.calNextBtn.addEventListener('click', () => {
      state.calendarMonth += 1;
      if (state.calendarMonth > 11) {
        state.calendarMonth = 0;
        state.calendarYear += 1;
      }
      renderCompactCalendar();
    });

    // Add Habit Buttons
    document.querySelector('.open-add-daily-btn').addEventListener('click', () => {
      openHabitModal(null, 'daily');
    });
    document.querySelector('.open-add-weekly-btn').addEventListener('click', () => {
      openHabitModal(null, 'weekly');
    });

    // Modal Events
    dom.closeModalBtn.addEventListener('click', closeHabitModal);
    dom.modalCancelBtn.addEventListener('click', closeHabitModal);
    dom.habitDialogForm.addEventListener('submit', handleModalSubmit);

    dom.typeRadios.forEach((r) => {
      r.addEventListener('change', () => toggleWeeklyDays(r.value === 'weekly'));
    });

    dom.dayPills.forEach((p) => {
      p.addEventListener('click', () => {
        p.classList.toggle('selected');
        dom.modalDaysError.classList.add('hidden');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeHabitModal();
    });
  }

  // ==========================================================================
  // 8. INITIAL LOAD
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', async () => {
    setupEvents();
    try {
      const { habits } = await Storage.fetchHabits(true);
      state.habits = habits || [];
    } catch (e) {
      console.warn('Using local habit cache:', e);
    }
    await seedMockupHabitsIfEmpty();
    renderAll();
  });
})();
