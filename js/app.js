/**
 * AVG DOWN IDX — Main Application
 * Entry point, initialization, event listeners
 */

import {
  initBrokerSelect,
  updateFeeBadges,
  addPurchaseStep,
  removePurchaseStep,
  calculate,
  renderHistory,
  loadHistory,
  deleteHistory,
  clearHistory,
  toggleTheme,
  initTheme,
  setMode,
  handleExportPNG,
  handleExportPDF,
  handleCopyClipboard,
  handleShareWhatsApp,
  autoFormatInput,
  autoFormatDecimalInput,
  updateAllPreviews
} from './ui.js';

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();

  // Initialize broker select
  initBrokerSelect();

  // Add first purchase step
  addPurchaseStep();

  // Render history
  renderHistory();

  // ── Event Listeners ──

  // Broker select change
  document.getElementById('broker-select')?.addEventListener('change', updateFeeBadges);

  // Custom fee inputs
  document.getElementById('custom-buy-fee')?.addEventListener('input', function () {
    autoFormatDecimalInput(this);
    updateFeeBadges();
  });
  document.getElementById('custom-sell-fee')?.addEventListener('input', function () {
    autoFormatDecimalInput(this);
    updateFeeBadges();
  });

  // Auto-format number inputs + trigger preview updates
  document.querySelectorAll('.number-input').forEach(input => {
    input.addEventListener('input', () => {
      autoFormatInput(input);
      updateAllPreviews();
    });
  });

  // Stock code input — auto uppercase
  document.getElementById('stock-code')?.addEventListener('input', function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
  });

  // Calculate button
  document.getElementById('btn-calculate')?.addEventListener('click', calculate);

  // Add purchase step button
  document.getElementById('btn-add-step')?.addEventListener('click', addPurchaseStep);

  // Mode toggle buttons
  document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Export buttons
  document.getElementById('btn-export-png')?.addEventListener('click', handleExportPNG);
  document.getElementById('btn-export-pdf')?.addEventListener('click', handleExportPDF);
  document.getElementById('btn-copy')?.addEventListener('click', handleCopyClipboard);
  document.getElementById('btn-whatsapp')?.addEventListener('click', handleShareWhatsApp);

  // Clear history
  document.getElementById('btn-clear-history')?.addEventListener('click', clearHistory);

  // Enter key to calculate
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
      calculate();
    }
  });

  // Expose functions for inline event handlers
  window.avgApp = {
    removePurchaseStep,
    loadHistory,
    deleteHistory
  };

  console.log('🚀 Avg Down IDX initialized');
});
