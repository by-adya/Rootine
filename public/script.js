// public/script.js
// ----------------------------------------------------------------------------
// rootine. — Application Controller
// Directly matches the visual design: Compact Calendar with status dots,
// Today's Progress ring with garden scene, and Daily/Weekly habit cards.
// ----------------------------------------------------------------------------

(function () {
  'use strict';

  const Dates = window.Rootine.Dates;
  const Streaks = window.Rootine.Streaks;
  const Progress = window.Rootine.Progress;
  const Calendar = window.Rootine.Calendar;
  const Icons = window.Rootine.Icons;
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
    modalSelectedIcon: document.getElementById('modal-selected-icon'),

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
    }, 4000);
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

    // Render Circular Progress Ring (size: 96px, stroke: 8px)
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
  // Card 3: Daily Habits Column
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

      const row = document.createElement('div');
      row.className = 'habit-row-item';

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

      // Custom icon styling classes
      const iconKey = habit.icon || 'book';
      const iconClass = `icon-${iconKey}`;
      const iconSvg = Icons.getIcon(iconKey);

      row.innerHTML = `
        <div class="habit-left-combo">
          <div class="streak-ring-unit">
            <span class="streak-top-num">${streakCount > 0 ? streakCount : ''}</span>
            <div class="ring-icon-box ${iconClass}">
              ${iconSvg}
            </div>
          </div>

          <div class="habit-info-block">
            <span class="habit-name-txt">${escapeHtml(habit.name)}</span>
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
  }

  // --------------------------------------------------------------------------
  // Card 4: Weekly Habits Column
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

      const row = document.createElement('div');
      row.className = 'habit-row-item';

      const dueDays = Array.isArray(habit.dueDays) ? habit.dueDays : [6];
      const dueDaysText = dueDays.map((d) => dayShortNames[d]).join(', ');

      const iconKey = habit.icon || 'sprout';
      const iconClass = `icon-${iconKey}`;
      const iconSvg = Icons.getIcon(iconKey);

      row.innerHTML = `
        <div class="habit-left-combo">
          <div class="streak-ring-unit">
            <div class="ring-icon-box ${iconClass}">
              ${iconSvg}
            </div>
          </div>

          <div class="habit-info-block">
            <span class="habit-name-txt">${escapeHtml(habit.name)}</span>
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
  }

  // ==========================================================================
  // 5. API ACTIONS (TOGGLE, CREATE, UPDATE, DELETE)
  // ==========================================================================
  async function handleToggleHabit(habitId, dateStr) {
    try {
      const updated = await Storage.toggleHabitDate(habitId, dateStr);
      const idx = state.habits.findIndex((h) => h._id === habitId);
      if (idx !== -1) {
        state.habits[idx] = updated;
      }
      renderAll();
    } catch (e) {
      console.error('Error toggling habit:', e);
      showAlert('Could not update habit status.', 'error');
    }
  }

  // Pre-seed sample habits matching the user's mockup if database is empty
  async function seedMockupHabitsIfEmpty() {
    if (state.habits.length > 0) return;

    const sampleHabits = [
      {
        name: 'Read',
        type: 'daily',
        icon: 'book',
        completedDates: [
          Dates.addDays(state.todayDate, -3),
          Dates.addDays(state.todayDate, -2),
          Dates.addDays(state.todayDate, -1),
          state.todayDate,
        ],
      },
      {
        name: 'Workout',
        type: 'daily',
        icon: 'dumbbell',
        completedDates: [
          Dates.addDays(state.todayDate, -3),
          Dates.addDays(state.todayDate, -2),
          state.todayDate,
        ],
      },
      {
        name: 'Journal',
        type: 'daily',
        icon: 'journal',
        completedDates: [
          Dates.addDays(state.todayDate, -3),
          Dates.addDays(state.todayDate, -2),
        ],
      },
      {
        name: 'Drink Water',
        type: 'daily',
        icon: 'water',
        completedDates: [
          Dates.addDays(state.todayDate, -4),
          Dates.addDays(state.todayDate, -3),
          Dates.addDays(state.todayDate, -2),
          Dates.addDays(state.todayDate, -1),
          state.todayDate,
        ],
      },
      {
        name: 'Deep Clean Room',
        type: 'weekly',
        icon: 'clean',
        dueDays: [6], // Saturday
        completedDates: [],
      },
      {
        name: 'Meal Prep',
        type: 'weekly',
        icon: 'meal',
        dueDays: [0], // Sunday
        completedDates: [state.todayDate],
      },
      {
        name: 'Plan Next Week',
        type: 'weekly',
        icon: 'plan',
        dueDays: [0], // Sunday
        completedDates: [],
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
  // 6. MODAL: ADD / EDIT HABIT
  // ==========================================================================
  function openHabitModal(habitToEdit = null, defaultType = 'daily') {
    dom.habitModal.classList.remove('hidden');
    dom.modalNameError.classList.add('hidden');
    dom.modalDaysError.classList.add('hidden');

    // Populate Icon Picker
    const availableIcons = Icons.getAvailableHabitIcons();
    dom.iconPickerGrid.innerHTML = '';
    const selectedIcon = habitToEdit ? habitToEdit.icon || 'book' : 'book';
    dom.modalSelectedIcon.value = selectedIcon;

    availableIcons.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `icon-pick-btn ${item.id === selectedIcon ? 'selected' : ''}`;
      btn.innerHTML = Icons.getIcon(item.id);
      btn.title = item.label;
      btn.addEventListener('click', () => {
        dom.iconPickerGrid.querySelectorAll('.icon-pick-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        dom.modalSelectedIcon.value = item.id;
      });
      dom.iconPickerGrid.appendChild(btn);
    });

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
      dom.modalTitle.textContent = 'New Habit';
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
    const icon = dom.modalSelectedIcon.value || 'book';

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
        const updated = await Storage.updateHabit(id, { name, description, type, icon, dueDays });
        const idx = state.habits.findIndex((h) => h._id === id);
        if (idx !== -1) state.habits[idx] = updated;
        showAlert(`"${name}" updated.`);
      } else {
        const created = await Storage.createHabit({ name, description, type, icon, dueDays });
        state.habits.push(created);
        showAlert(`"${name}" added to Rootine! 🌱`);
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
