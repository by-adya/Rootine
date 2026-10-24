// public/js/storage/storage.js
// ----------------------------------------------------------------------------
// Rootine - Centralized Data Persistence Module
// Interfaces with the Express REST API (/api/habits) with automatic local
// caching and offline fallback resilience.
// ----------------------------------------------------------------------------

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else {
    root.Rootine = root.Rootine || {};
    root.Rootine.Storage = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'rootine_habits_cache_v2';
  const API_BASE = '/api/habits';

  /**
   * Reads cached habits from localStorage.
   * @returns {Array<Object>}
   */
  function getCachedHabits() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Could not parse local habits cache:', e);
      return [];
    }
  }

  /**
   * Saves habits to localStorage cache.
   * @param {Array<Object>} habits
   */
  function setCachedHabits(habits) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (e) {
      console.warn('Could not write habits to localStorage:', e);
    }
  }

  /**
   * Fetches habits from API. If network/DB fails, falls back to cache gracefully.
   * @param {boolean} includeArchived
   * @returns {Promise<{ habits: Array<Object>, isOffline: boolean }>}
   */
  async function fetchHabits(includeArchived = false) {
    try {
      const url = `${API_BASE}?includeArchived=${includeArchived}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const habits = await res.json();
      setCachedHabits(habits);
      return { habits, isOffline: false };
    } catch (err) {
      console.warn('Backend API unavailable. Using local offline cache:', err.message);
      const habits = getCachedHabits();
      const filtered = includeArchived ? habits : habits.filter((h) => !h.archivedAt);
      return { habits: filtered, isOffline: true };
    }
  }

  /**
   * Creates a new habit.
   * @param {Object} habitData - { name, description, type, icon, dueDays }
   * @returns {Promise<Object>}
   */
  async function createHabit(habitData) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create habit');
      }

      const newHabit = await res.json();
      // Update cache
      const cached = getCachedHabits();
      cached.push(newHabit);
      setCachedHabits(cached);
      return newHabit;
    } catch (err) {
      // Local fallback
      console.warn('Offline create habit fallback:', err.message);
      const localHabit = {
        _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: habitData.name.trim(),
        description: (habitData.description || '').trim(),
        type: habitData.type || 'daily',
        icon: habitData.icon || 'sprout',
        dueDays: Array.isArray(habitData.dueDays) ? habitData.dueDays : [0, 1, 2, 3, 4, 5, 6],
        completedDates: [],
        archivedAt: null,
        createdAt: new Date().toISOString(),
      };
      const cached = getCachedHabits();
      cached.push(localHabit);
      setCachedHabits(cached);
      return localHabit;
    }
  }

  /**
   * Updates an existing habit's configuration.
   * @param {string} id
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async function updateHabit(id, updates) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update habit');
      }

      const updated = await res.json();
      const cached = getCachedHabits().map((h) => (h._id === id ? updated : h));
      setCachedHabits(cached);
      return updated;
    } catch (err) {
      console.warn('Offline update habit fallback:', err.message);
      const cached = getCachedHabits();
      const idx = cached.findIndex((h) => h._id === id);
      if (idx !== -1) {
        cached[idx] = { ...cached[idx], ...updates, updatedAt: new Date().toISOString() };
        setCachedHabits(cached);
        return cached[idx];
      }
      throw err;
    }
  }

  /**
   * Toggles completion for a given date ("YYYY-MM-DD").
   * @param {string} id
   * @param {string} dateStr
   * @returns {Promise<Object>}
   */
  async function toggleHabitDate(id, dateStr) {
    try {
      const res = await fetch(`${API_BASE}/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to toggle habit date');
      }

      const updated = await res.json();
      const cached = getCachedHabits().map((h) => (h._id === id ? updated : h));
      setCachedHabits(cached);
      return updated;
    } catch (err) {
      console.warn('Offline toggle date fallback:', err.message);
      const cached = getCachedHabits();
      const idx = cached.findIndex((h) => h._id === id);
      if (idx !== -1) {
        const habit = cached[idx];
        const dates = new Set(habit.completedDates || []);
        if (dates.has(dateStr)) {
          dates.delete(dateStr);
        } else {
          dates.add(dateStr);
        }
        habit.completedDates = Array.from(dates);
        setCachedHabits(cached);
        return habit;
      }
      throw err;
    }
  }

  /**
   * Archives or unarchives a habit.
   * @param {string} id
   * @param {boolean} shouldArchive
   * @returns {Promise<Object>}
   */
  async function archiveHabit(id, shouldArchive = true) {
    try {
      const res = await fetch(`${API_BASE}/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive: shouldArchive }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to archive habit');
      }

      const updated = await res.json();
      const cached = getCachedHabits().map((h) => (h._id === id ? updated : h));
      setCachedHabits(cached);
      return updated;
    } catch (err) {
      console.warn('Offline archive habit fallback:', err.message);
      const cached = getCachedHabits();
      const idx = cached.findIndex((h) => h._id === id);
      if (idx !== -1) {
        cached[idx].archivedAt = shouldArchive ? new Date().toISOString() : null;
        setCachedHabits(cached);
        return cached[idx];
      }
      throw err;
    }
  }

  /**
   * Permanently deletes a habit.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async function deleteHabit(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete habit');
      }
      const cached = getCachedHabits().filter((h) => h._id !== id);
      setCachedHabits(cached);
      return true;
    } catch (err) {
      console.warn('Offline delete habit fallback:', err.message);
      const cached = getCachedHabits().filter((h) => h._id !== id);
      setCachedHabits(cached);
      return true;
    }
  }

  return {
    fetchHabits,
    createHabit,
    updateHabit,
    toggleHabitDate,
    archiveHabit,
    deleteHabit,
  };
});
