/**
 * AVG DOWN IDX — Storage Module
 * localStorage operations for history and settings
 */

const STORAGE_KEYS = {
  history: 'avgdown_history',
  settings: 'avgdown_settings'
};

const MAX_HISTORY = 50;

/**
 * Save a calculation to history
 * @param {Object} data - Calculation data to save
 */
function saveCalculation(data) {
  const history = getHistory();
  history.unshift(data);
  
  // Keep max items
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

/**
 * Get all history items
 * @returns {Array} History items array
 */
function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.history);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Failed to read history:', e);
    return [];
  }
}

/**
 * Get a single history item by ID
 * @param {string} id - History item ID
 * @returns {Object|null} History item or null
 */
function getHistoryById(id) {
  const history = getHistory();
  return history.find(item => item.id === id) || null;
}

/**
 * Delete a single history item
 * @param {string} id - History item ID
 */
function deleteHistoryItem(id) {
  const history = getHistory().filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save history:', e);
  }
}

/**
 * Clear all history
 */
function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.history);
  } catch (e) {
    console.warn('Failed to clear history:', e);
  }
}

/**
 * Save settings
 * @param {Object} settings - Settings object
 */
function saveSettings(settings) {
  try {
    const current = getSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(merged));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

/**
 * Get settings
 * @returns {Object} Settings object
 */
function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.settings);
    return data ? JSON.parse(data) : {
      theme: 'light',
      lastBroker: 'stockbit',
      version: '1.0.0'
    };
  } catch (e) {
    return { theme: 'light', lastBroker: 'stockbit', version: '1.0.0' };
  }
}

export {
  saveCalculation,
  getHistory,
  getHistoryById,
  deleteHistoryItem,
  clearHistory,
  saveSettings,
  getSettings
};
