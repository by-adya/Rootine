// public/script.js
// ----------------------------------------------------------------------------
// Habit Garden - Frontend Client Logic
// This script runs in the user's browser, handling DOM manipulation,
// event listeners, and communication with the backend Express API via fetch().
// ----------------------------------------------------------------------------

// ============================================================================
// 1. DOM ELEMENT REFERENCES
// ============================================================================
const currentDateEl = document.getElementById('current-date');
const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const inputErrorEl = document.getElementById('input-error');
const addBtn = document.getElementById('add-btn');

const habitsList = document.getElementById('habits-list');
const habitsCountBadge = document.getElementById('habits-count-badge');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const alertBanner = document.getElementById('alert-banner');

const progressCountEl = document.getElementById('progress-count');
const progressPercentEl = document.getElementById('progress-percent');
const progressFillEl = document.getElementById('progress-fill');
const progressQuoteEl = document.getElementById('progress-quote');

// ============================================================================
// 2. APPLICATION STATE
// ============================================================================
// Array storing habits fetched from the database
let habits = [];

// Store a reference to clear alert timeouts
let alertTimeoutId = null;

// ============================================================================
// 3. DATE UTILITIES
// ============================================================================

/**
 * Returns today's date formatted as a standardized "YYYY-MM-DD" string
 * using local system time so the date matches the user's current day.
 */
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats and displays a human-friendly date in the header
 * (e.g. "Friday, October 24, 2026").
 */
function displayHeaderDate() {
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  currentDateEl.textContent = new Date().toLocaleDateString(undefined, options);
}

// ============================================================================
// 4. UI FEEDBACK HELPERS (ALERTS & MESSAGES)
// ============================================================================

/**
 * Displays a friendly notification banner at the top of the app.
 * @param {string} message - Message text to display.
 * @param {'error' | 'success'} type - Alert style type.
 */
function showAlert(message, type = 'error') {
  // Clear any existing timer so the alert stays visible for the full duration
  if (alertTimeoutId) {
    clearTimeout(alertTimeoutId);
  }

  alertBanner.textContent = message;
  alertBanner.className = `alert-banner alert-${type}`;
  alertBanner.classList.remove('hidden');

  // Automatically hide the alert after 4 seconds
  alertTimeoutId = setTimeout(() => {
    alertBanner.classList.add('hidden');
    alertTimeoutId = null;
  }, 4000);
}

/**
 * Clears the inline input validation error.
 */
function clearInputError() {
  inputErrorEl.textContent = '';
  inputErrorEl.classList.add('hidden');
  habitInput.classList.remove('has-error');
}

/**
 * Displays an inline error right under the input field.
 * @param {string} message
 */
function showInputError(message) {
  inputErrorEl.textContent = message;
  inputErrorEl.classList.remove('hidden');
  habitInput.classList.add('has-error');
}

// ============================================================================
// 5. PROGRESS CALCULATION & RENDERING
// ============================================================================

/**
 * Calculates how many habits are completed for today and updates
 * the progress bar, percentage, and motivational text.
 */
function updateProgress() {
  const todayStr = getTodayString();
  const total = habits.length;

  if (total === 0) {
    progressCountEl.textContent = '0 of 0 done';
    progressPercentEl.textContent = '0%';
    progressFillEl.style.width = '0%';
    progressQuoteEl.textContent = 'Plant a habit above to start your daily garden 🌱';
    return;
  }

  // Count how many habits include today's date in their completedDates array
  const completed = habits.filter((habit) =>
    habit.completedDates && habit.completedDates.includes(todayStr)
  ).length;

  const percentage = Math.round((completed / total) * 100);

  // Update progress texts
  progressCountEl.textContent = `${completed} of ${total} done`;
  progressPercentEl.textContent = `${percentage}%`;
  progressFillEl.style.width = `${percentage}%`;

  // Provide encouraging contextual messages based on completion rate
  if (percentage === 0) {
    progressQuoteEl.textContent = 'Every journey begins with a single seed 🌱';
  } else if (percentage < 50) {
    progressQuoteEl.textContent = 'Great start! Keep watering your habits 🌿';
  } else if (percentage < 100) {
    progressQuoteEl.textContent = 'More than halfway there! Almost in full bloom 🌻';
  } else {
    progressQuoteEl.textContent = 'All habits completed! Your garden is blooming! 🌸';
  }
}

// ============================================================================
// 6. HABITS RENDERING
// ============================================================================

/**
 * Renders the list of habits from the habits array into the DOM.
 */
function renderHabits() {
  // Update the count badge
  habitsCountBadge.textContent = `${habits.length} ${
    habits.length === 1 ? 'habit' : 'habits'
  }`;

  // If there are no habits, show the empty state and hide the list
  if (habits.length === 0) {
    loadingState.classList.add('hidden');
    emptyState.classList.remove('hidden');
    habitsList.classList.add('hidden');
    updateProgress();
    return;
  }

  // Habits exist: hide loading and empty states, show the list
  loadingState.classList.add('hidden');
  emptyState.classList.add('hidden');
  habitsList.classList.remove('hidden');

  // Clear current list items before repopulating
  habitsList.innerHTML = '';

  const todayStr = getTodayString();

  // Create an <li> item for each habit
  habits.forEach((habit) => {
    const isDoneToday = habit.completedDates && habit.completedDates.includes(todayStr);

    const li = document.createElement('li');
    li.className = `habit-item ${isDoneToday ? 'completed' : ''}`;
    li.dataset.id = habit._id;

    // Left section: Checkbox, Habit name & Created date
    const habitMain = document.createElement('div');
    habitMain.className = 'habit-main';

    // Accessible checkbox container
    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'checkbox-container';
    checkboxLabel.setAttribute('aria-label', `Mark "${habit.name}" as done for today`);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isDoneToday;

    // Event: Toggle completed status on checkbox change
    checkbox.addEventListener('change', () => toggleHabit(habit._id));

    const customCheckboxSpan = document.createElement('span');
    customCheckboxSpan.className = 'custom-checkbox';

    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(customCheckboxSpan);

    // Habit text details
    const habitInfo = document.createElement('div');
    habitInfo.className = 'habit-info';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'habit-name';
    nameSpan.textContent = habit.name;

    const metaSpan = document.createElement('span');
    metaSpan.className = 'habit-meta';
    const createdDate = new Date(habit.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    metaSpan.textContent = `Planted on ${createdDate}`;

    habitInfo.appendChild(nameSpan);
    habitInfo.appendChild(metaSpan);

    habitMain.appendChild(checkboxLabel);
    habitMain.appendChild(habitInfo);

    // Right section: Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.setAttribute('aria-label', `Delete habit "${habit.name}"`);
    deleteBtn.innerHTML = '✕ Delete';

    // Event: Delete habit
    deleteBtn.addEventListener('click', () => deleteHabit(habit._id, habit.name));

    // Assemble the list item
    li.appendChild(habitMain);
    li.appendChild(deleteBtn);

    habitsList.appendChild(li);
  });

  // Re-calculate progress
  updateProgress();
}

// ============================================================================
// 7. API CALLS (FETCH, CREATE, TOGGLE, DELETE)
// ============================================================================

/**
 * GET /api/habits
 * Fetches all habits from the database and updates state.
 */
async function fetchHabits() {
  loadingState.classList.remove('hidden');
  emptyState.classList.add('hidden');
  habitsList.classList.add('hidden');

  try {
    const response = await fetch('/api/habits');

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    habits = data;
    renderHabits();
  } catch (error) {
    console.error('Error fetching habits:', error);
    loadingState.classList.add('hidden');
    showAlert(
      'Unable to connect to the Habit Garden database. Please check your connection or server.',
      'error'
    );
  }
}

/**
 * POST /api/habits
 * Adds a new habit to the database.
 */
async function addHabit(name) {
  addBtn.disabled = true;
  addBtn.textContent = 'Planting...';

  try {
    const response = await fetch('/api/habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend validation error message
      throw new Error(data.message || 'Failed to add habit.');
    }

    // Add new habit to the beginning of our local list
    habits.unshift(data);
    renderHabits();

    // Reset input
    habitInput.value = '';
    clearInputError();

    showAlert(`"${name}" was planted in your garden! 🌱`, 'success');
  } catch (error) {
    console.error('Error adding habit:', error);
    showAlert(error.message, 'error');
  } finally {
    addBtn.disabled = false;
    addBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">+</span><span>Add Habit</span>';
  }
}

/**
 * PATCH /api/habits/:id/toggle
 * Toggles a habit's completion status for today's date.
 */
async function toggleHabit(id) {
  const todayStr = getTodayString();

  try {
    const response = await fetch(`/api/habits/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: todayStr }),
    });

    const updatedHabit = await response.json();

    if (!response.ok) {
      throw new Error(updatedHabit.message || 'Failed to update habit status.');
    }

    // Update the local habit object in our array
    const habitIndex = habits.findIndex((h) => h._id === id);
    if (habitIndex !== -1) {
      habits[habitIndex] = updatedHabit;
      renderHabits();
    }
  } catch (error) {
    console.error('Error toggling habit:', error);
    showAlert('Could not save completion status. Please try again.', 'error');
    // Refresh to restore accurate state
    renderHabits();
  }
}

/**
 * DELETE /api/habits/:id
 * Deletes a habit from the database after confirmation.
 */
async function deleteHabit(id, name) {
  const confirmed = window.confirm(
    `Are you sure you want to remove "${name}" from your garden?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/habits/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete habit.');
    }

    // Remove habit from local array
    habits = habits.filter((h) => h._id !== id);
    renderHabits();

    showAlert('Habit removed from your garden.', 'success');
  } catch (error) {
    console.error('Error deleting habit:', error);
    showAlert('Could not delete habit. Please try again.', 'error');
  }
}

// ============================================================================
// 8. FORM SUBMISSION & EVENT LISTENERS
// ============================================================================

// Form submit listener for adding habits
habitForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const habitName = habitInput.value.trim();

  // Client-side validation: check for empty input
  if (!habitName) {
    showInputError('Please type a habit name before adding.');
    habitInput.focus();
    return;
  }

  clearInputError();
  addHabit(habitName);
});

// Clear error message when user starts typing
habitInput.addEventListener('input', () => {
  if (habitInput.value.trim().length > 0) {
    clearInputError();
  }
});

// ============================================================================
// 9. INITIALIZATION
// ============================================================================
// When the DOM content has loaded, display the date and fetch habits
document.addEventListener('DOMContentLoaded', () => {
  displayHeaderDate();
  fetchHabits();
});
