/**
 * AVG DOWN IDX — UI Module
 * DOM manipulation, rendering, event handling
 */

import { getBrokers, getBrokerById } from './brokers.js';
import { formatRupiah, formatNumber, parseFormattedNumber, formatPercent, autoFormatInput, autoFormatDecimalInput, formatDate, generateId } from './utils.js';
import { calculateAverage, simulateProfitLoss, simulateAtPrice } from './calculator.js';
import { createDonutChart, createBarChart, createLineChart, destroyCharts } from './charts.js';
import { saveCalculation, getHistory, deleteHistoryItem, clearHistory, saveSettings, getSettings } from './storage.js';
import { showToast, exportPNG, copyToClipboard, shareWhatsApp, exportPDF } from './export.js';

// State
let currentMode = 'down'; // 'down' or 'up'
let purchaseStepCount = 1;
const MAX_STEPS = 10;
let lastCalcResult = null;
let lastSimResults = null;

/**
 * Initialize broker select dropdown
 */
function initBrokerSelect() {
  const select = document.getElementById('broker-select');
  if (!select) return;

  const brokers = getBrokers();
  select.innerHTML = '';

  brokers.forEach(broker => {
    const option = document.createElement('option');
    option.value = broker.id;
    option.textContent = broker.name;
    select.appendChild(option);
  });

  // Set last used broker
  const settings = getSettings();
  if (settings.lastBroker) {
    select.value = settings.lastBroker;
  }

  updateFeeBadges();
}

/**
 * Update fee badges display based on selected broker
 */
function updateFeeBadges() {
  const select = document.getElementById('broker-select');
  const buyBadge = document.getElementById('fee-buy-badge');
  const sellBadge = document.getElementById('fee-sell-badge');
  const customRow = document.getElementById('custom-fee-row');

  if (!select) return;

  const broker = getBrokerById(select.value);
  if (!broker) return;

  if (broker.id === 'custom') {
    if (customRow) customRow.classList.add('visible');
    // Use custom values from inputs
    const customBuy = document.getElementById('custom-buy-fee');
    const customSell = document.getElementById('custom-sell-fee');
    if (buyBadge) buyBadge.textContent = `Beli: ${customBuy ? customBuy.value : '0.15'}%`;
    if (sellBadge) sellBadge.textContent = `Jual: ${customSell ? customSell.value : '0.25'}%`;
  } else {
    if (customRow) customRow.classList.remove('visible');
    if (buyBadge) buyBadge.textContent = `Beli: ${broker.buyFee}%`;
    if (sellBadge) sellBadge.textContent = `Jual: ${broker.sellFee}%`;
  }
}

/**
 * Get current broker fees (handles custom broker)
 * @returns {Object} { buyFee, sellFee, name, id }
 */
function getCurrentBrokerFees() {
  const select = document.getElementById('broker-select');
  const broker = getBrokerById(select.value);

  if (broker.id === 'custom') {
    const customBuy = parseFloat(document.getElementById('custom-buy-fee')?.value || '0.15');
    const customSell = parseFloat(document.getElementById('custom-sell-fee')?.value || '0.25');
    return {
      id: 'custom',
      name: 'Custom',
      buyFee: isNaN(customBuy) ? 0.15 : customBuy,
      sellFee: isNaN(customSell) ? 0.25 : customSell
    };
  }

  return {
    id: broker.id,
    name: broker.name,
    buyFee: broker.buyFee,
    sellFee: broker.sellFee
  };
}

/**
 * Update modal preview for a given price/lots pair
 * Shows live calculation: price × lots × 100 (lembar)
 * @param {string} priceId - ID of price input
 * @param {string} lotsId - ID of lots input
 * @param {string} previewValueId - ID of preview value element
 * @param {string} previewContainerId - ID of preview container element
 */
function updateModalPreview(priceId, lotsId, previewValueId, previewContainerId) {
  const priceEl = document.getElementById(priceId);
  const lotsEl = document.getElementById(lotsId);
  const previewValue = document.getElementById(previewValueId);
  const previewContainer = document.getElementById(previewContainerId);

  if (!priceEl || !lotsEl || !previewValue) return;

  const price = parseFormattedNumber(priceEl.value);
  const lots = parseFormattedNumber(lotsEl.value);

  if (price > 0 && lots > 0) {
    const shares = lots * 100;
    const modal = price * shares;
    previewValue.textContent = formatRupiah(modal);
    if (previewContainer) previewContainer.classList.add('has-value');
  } else {
    previewValue.textContent = 'Rp 0';
    if (previewContainer) previewContainer.classList.remove('has-value');
  }
}

/**
 * Update all modal previews (current position + all purchase steps)
 */
function updateAllPreviews() {
  // Current position
  updateModalPreview('avg-price', 'avg-lots', 'modal-preview-current-value', 'modal-preview-current');

  // All purchase steps
  for (let i = 1; i <= purchaseStepCount; i++) {
    updateModalPreview(`buy-price-${i}`, `buy-lots-${i}`, `modal-preview-step-${i}-value`, `modal-preview-step-${i}`);
  }
}

/**
 * Add a new purchase step
 */
function addPurchaseStep() {
  if (purchaseStepCount >= MAX_STEPS) {
    showToast(`Maksimum ${MAX_STEPS} pembelian`, 'error');
    return;
  }

  purchaseStepCount++;
  const container = document.getElementById('purchase-steps');
  const stepIndex = purchaseStepCount;

  const stepEl = document.createElement('div');
  stepEl.className = 'purchase-step animate-fade-in-up';
  stepEl.id = `purchase-step-${stepIndex}`;
  stepEl.innerHTML = `
    <div class="step-label">
      <span class="step-number">${stepIndex}</span>
      <span class="step-text">Pembelian #${stepIndex}</span>
    </div>
    <button type="button" class="btn btn-danger-text purchase-step-remove" onclick="window.avgApp.removePurchaseStep(${stepIndex})" aria-label="Hapus pembelian #${stepIndex}">
      ✕
    </button>
    <div class="input-row">
      <div class="input-group">
        <label class="input-label" for="buy-price-${stepIndex}">Harga Beli</label>
        <input type="text" id="buy-price-${stepIndex}" class="input-field number-input" inputmode="numeric" placeholder="0" autocomplete="off">
      </div>
      <div class="input-group">
        <label class="input-label" for="buy-lots-${stepIndex}">Jumlah Lot</label>
        <input type="text" id="buy-lots-${stepIndex}" class="input-field number-input" inputmode="numeric" placeholder="0" autocomplete="off">
      </div>
    </div>
    <div class="modal-preview" id="modal-preview-step-${stepIndex}">
      <span class="modal-preview-icon">💰</span>
      <span class="modal-preview-text">Modal: <strong id="modal-preview-step-${stepIndex}-value">Rp 0</strong></span>
    </div>
  `;

  container.appendChild(stepEl);

  // Add auto-format and preview update to new inputs
  stepEl.querySelectorAll('.number-input').forEach(input => {
    input.addEventListener('input', () => {
      autoFormatInput(input);
      updateModalPreview(`buy-price-${stepIndex}`, `buy-lots-${stepIndex}`, `modal-preview-step-${stepIndex}-value`, `modal-preview-step-${stepIndex}`);
    });
  });

  updateAddButtonState();
}

/**
 * Remove a purchase step
 * @param {number} stepIndex - Step number to remove
 */
function removePurchaseStep(stepIndex) {
  const stepEl = document.getElementById(`purchase-step-${stepIndex}`);
  if (stepEl) {
    stepEl.style.animation = 'fadeIn 0.3s ease reverse forwards';
    setTimeout(() => {
      stepEl.remove();
      purchaseStepCount--;
      renumberPurchaseSteps();
      updateAddButtonState();
    }, 250);
  }
}

/**
 * Renumber remaining purchase steps after removal
 */
function renumberPurchaseSteps() {
  const container = document.getElementById('purchase-steps');
  const steps = container.querySelectorAll('.purchase-step');
  
  steps.forEach((step, i) => {
    const idx = i + 1;
    step.id = `purchase-step-${idx}`;
    const numberEl = step.querySelector('.step-number');
    const textEl = step.querySelector('.step-text');
    if (numberEl) numberEl.textContent = idx;
    if (textEl) textEl.textContent = `Pembelian #${idx}`;
    
    // Update input IDs and labels
    const inputs = step.querySelectorAll('.input-field');
    const labels = step.querySelectorAll('.input-label');
    if (inputs[0]) inputs[0].id = `buy-price-${idx}`;
    if (inputs[1]) inputs[1].id = `buy-lots-${idx}`;
    if (labels[0]) labels[0].setAttribute('for', `buy-price-${idx}`);
    if (labels[1]) labels[1].setAttribute('for', `buy-lots-${idx}`);
    
    // Update remove button
    const removeBtn = step.querySelector('.purchase-step-remove');
    if (removeBtn) {
      removeBtn.setAttribute('onclick', `window.avgApp.removePurchaseStep(${idx})`);
      removeBtn.setAttribute('aria-label', `Hapus pembelian #${idx}`);
    }
  });
  
  purchaseStepCount = steps.length;
}

/**
 * Update add button state (disable when max reached)
 */
function updateAddButtonState() {
  const addBtn = document.getElementById('btn-add-step');
  if (addBtn) {
    addBtn.disabled = purchaseStepCount >= MAX_STEPS;
    if (purchaseStepCount >= MAX_STEPS) {
      addBtn.textContent = `Maksimum ${MAX_STEPS} pembelian tercapai`;
    } else {
      addBtn.textContent = `+ Tambah Pembelian (${purchaseStepCount}/${MAX_STEPS})`;
    }
  }
}

/**
 * Collect all form inputs and validate
 * @returns {Object|null} Validated inputs or null if invalid
 */
function collectInputs() {
  const stockCode = document.getElementById('stock-code')?.value.trim().toUpperCase() || '';
  const broker = getCurrentBrokerFees();

  // Current position
  const avgPriceRaw = document.getElementById('avg-price')?.value;
  const avgLotsRaw = document.getElementById('avg-lots')?.value;
  const avgPrice = parseFormattedNumber(avgPriceRaw);
  const avgLots = parseFormattedNumber(avgLotsRaw);

  if (!avgPrice || avgPrice <= 0) {
    showToast('Masukkan harga rata-rata saat ini', 'error');
    document.getElementById('avg-price')?.focus();
    return null;
  }
  if (!avgLots || avgLots <= 0) {
    showToast('Masukkan jumlah lot saat ini', 'error');
    document.getElementById('avg-lots')?.focus();
    return null;
  }

  // Purchases
  const purchases = [];
  for (let i = 1; i <= purchaseStepCount; i++) {
    const priceEl = document.getElementById(`buy-price-${i}`);
    const lotsEl = document.getElementById(`buy-lots-${i}`);
    if (!priceEl || !lotsEl) continue;

    const price = parseFormattedNumber(priceEl.value);
    const lots = parseFormattedNumber(lotsEl.value);

    if (!price || price <= 0) {
      showToast(`Masukkan harga beli #${i}`, 'error');
      priceEl.focus();
      return null;
    }
    if (!lots || lots <= 0) {
      showToast(`Masukkan jumlah lot beli #${i}`, 'error');
      lotsEl.focus();
      return null;
    }

    purchases.push({ price, lots: Math.round(lots) });
  }

  if (purchases.length === 0) {
    showToast('Tambahkan minimal 1 pembelian baru', 'error');
    return null;
  }

  return {
    stockCode,
    broker,
    currentPosition: { price: avgPrice, lots: Math.round(avgLots) },
    purchases
  };
}

/**
 * Perform calculation and render results
 */
function calculate() {
  const inputs = collectInputs();
  if (!inputs) return;

  // Save last broker preference
  saveSettings({ lastBroker: inputs.broker.id });

  // Calculate
  const calcResult = calculateAverage(
    inputs.currentPosition,
    inputs.purchases,
    inputs.broker
  );

  // Simulate
  const simResults = simulateProfitLoss(calcResult);

  // Store for export
  lastCalcResult = calcResult;
  lastSimResults = simResults;

  // Render results
  renderResults(calcResult, inputs.stockCode);
  renderTransactionDetails(calcResult);
  renderSimulationTable(simResults);
  renderTargetSlider(calcResult);

  // Charts
  destroyCharts();
  setTimeout(() => {
    createDonutChart('donut-chart', calcResult);
    createBarChart('bar-chart', calcResult);
    createLineChart('line-chart', simResults);
  }, 100);

  // Show results
  document.getElementById('result-section')?.classList.add('visible');

  // Scroll to results
  setTimeout(() => {
    document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);

  // Save to history
  const historyItem = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    stockCode: inputs.stockCode,
    mode: currentMode,
    broker: inputs.broker,
    positions: [
      { label: 'Posisi Lama', price: inputs.currentPosition.price, lots: inputs.currentPosition.lots },
      ...inputs.purchases.map((p, i) => ({ label: `Beli #${i + 1}`, price: p.price, lots: p.lots }))
    ],
    result: {
      averagePrice: calcResult.averagePrice,
      totalLots: calcResult.totalLots,
      totalShares: calcResult.totalShares,
      totalModal: calcResult.totalModal,
      bep: calcResult.bep
    }
  };
  saveCalculation(historyItem);
  renderHistory();

  showToast('Kalkulasi berhasil! ✨', 'success');
}

/**
 * Render main result card
 */
function renderResults(calcResult, stockCode) {
  const modeLabel = currentMode === 'up' ? 'AVERAGE UP' : 'AVERAGE DOWN';
  
  document.getElementById('result-mode-label').textContent = modeLabel;
  document.getElementById('result-stock-code').textContent = stockCode || '-';
  document.getElementById('result-broker-name').textContent = calcResult.broker.name || '-';
  document.getElementById('result-avg-price').textContent = `Rp ${formatNumber(calcResult.averagePrice)}`;
  document.getElementById('result-total-lots').textContent = `${formatNumber(calcResult.totalLots)} Lot (${formatNumber(calcResult.totalShares)} Lbr)`;
  document.getElementById('result-total-modal').textContent = formatRupiah(calcResult.totalModal);
  document.getElementById('result-bep').textContent = `Rp ${formatNumber(calcResult.bep)}`;
}

/**
 * Render transaction details table
 */
function renderTransactionDetails(calcResult) {
  const tbody = document.getElementById('detail-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  // Current position
  const addRow = (label, modal, fee, total) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${label}</td>
      <td>${formatRupiah(total)}</td>
    `;
    tbody.appendChild(tr);
  };

  addRow(
    `Posisi Lama (${formatNumber(calcResult.currentDetail.lots)} Lot × Rp ${formatNumber(calcResult.currentDetail.price)})`,
    calcResult.currentDetail.transactionValue,
    calcResult.currentDetail.brokerFee,
    calcResult.currentDetail.totalOutflow
  );

  calcResult.purchaseDetails.forEach((d, i) => {
    addRow(
      `Beli #${i + 1} (${formatNumber(d.lots)} Lot × Rp ${formatNumber(d.price)})`,
      d.transactionValue,
      d.brokerFee,
      d.totalOutflow
    );
  });

  // Fee row
  const feeRow = document.createElement('tr');
  feeRow.innerHTML = `
    <td>Total Fee Broker</td>
    <td>${formatRupiah(calcResult.totalFee)}</td>
  `;
  tbody.appendChild(feeRow);

  // Total row
  const totalRow = document.createElement('tr');
  totalRow.className = 'total';
  totalRow.innerHTML = `
    <td>Total Modal Keluar</td>
    <td>${formatRupiah(calcResult.totalModal)}</td>
  `;
  tbody.appendChild(totalRow);
}

/**
 * Render simulation table
 */
function renderSimulationTable(simResults) {
  const tbody = document.getElementById('sim-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  simResults.forEach(s => {
    const tr = document.createElement('tr');
    tr.className = s.isProfit ? 'sim-row-profit' : s.isLoss ? 'sim-row-loss' : '';
    tr.innerHTML = `
      <td><span class="sim-label">${s.label}</span></td>
      <td>Rp ${formatNumber(s.targetPrice)}</td>
      <td>${s.isProfit ? '+' : ''}${formatRupiah(s.profitLoss)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Render target price slider
 */
function renderTargetSlider(calcResult) {
  const slider = document.getElementById('target-slider');
  const valueDisplay = document.getElementById('target-slider-value');
  const resultDisplay = document.getElementById('target-slider-result');
  
  if (!slider || !valueDisplay || !resultDisplay) return;

  const minPrice = Math.max(1, Math.round(calcResult.averagePrice * 0.5));
  const maxPrice = Math.round(calcResult.averagePrice * 2);
  const defaultPrice = calcResult.averagePrice;

  slider.min = minPrice;
  slider.max = maxPrice;
  slider.value = defaultPrice;

  const updateSliderResult = (price) => {
    valueDisplay.textContent = `Rp ${formatNumber(price)}`;
    const sim = simulateAtPrice(calcResult, price);
    const profitClass = sim.isProfit ? 'text-success' : sim.isLoss ? 'text-danger' : 'text-warning';
    const prefix = sim.isProfit ? '+' : '';
    resultDisplay.innerHTML = `<span class="${profitClass}">${prefix}${formatRupiah(sim.profitLoss)} (${formatPercent(sim.profitLossPercent)})</span>`;
  };

  updateSliderResult(defaultPrice);

  slider.oninput = () => {
    updateSliderResult(parseInt(slider.value));
  };
}

/**
 * Render history list
 */
function renderHistory() {
  const container = document.getElementById('history-list');
  if (!container) return;

  const history = getHistory();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">📭</div>
        <p>Belum ada riwayat perhitungan</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  history.slice(0, 20).forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="history-item-icon">${item.stockCode ? item.stockCode.substring(0, 2) : '📊'}</div>
      <div class="history-item-info" onclick="window.avgApp.loadHistory('${item.id}')">
        <div class="history-item-title">${item.stockCode || 'Tanpa Kode'} — ${item.mode === 'up' ? 'Avg Up' : 'Avg Down'}</div>
        <div class="history-item-meta">${formatDate(item.timestamp)} • ${item.broker?.name || '-'}</div>
      </div>
      <div class="history-item-avg">Rp ${formatNumber(item.result?.averagePrice || 0)}</div>
      <button class="history-item-delete" onclick="window.avgApp.deleteHistory('${item.id}')" aria-label="Hapus riwayat">✕</button>
    `;
    container.appendChild(div);
  });
}

/**
 * Load history item into form
 */
function loadHistory(id) {
  const history = getHistory();
  const item = history.find(h => h.id === id);
  if (!item) return;

  // Set mode
  if (item.mode) {
    currentMode = item.mode;
    updateModeToggle();
  }

  // Set broker
  const brokerSelect = document.getElementById('broker-select');
  if (brokerSelect && item.broker) {
    brokerSelect.value = item.broker.id;
    updateFeeBadges();
    
    if (item.broker.id === 'custom') {
      const customBuy = document.getElementById('custom-buy-fee');
      const customSell = document.getElementById('custom-sell-fee');
      if (customBuy) customBuy.value = item.broker.buyFee;
      if (customSell) customSell.value = item.broker.sellFee;
    }
  }

  // Set stock code
  const stockInput = document.getElementById('stock-code');
  if (stockInput) stockInput.value = item.stockCode || '';

  // Set current position
  if (item.positions && item.positions.length > 0) {
    const pos = item.positions[0];
    document.getElementById('avg-price').value = formatNumber(pos.price);
    document.getElementById('avg-lots').value = formatNumber(pos.lots);
  }

  // Set purchases - reset and recreate
  const container = document.getElementById('purchase-steps');
  container.innerHTML = '';
  purchaseStepCount = 0;

  const purchases = item.positions.slice(1);
  purchases.forEach((p, i) => {
    addPurchaseStep();
    const priceEl = document.getElementById(`buy-price-${i + 1}`);
    const lotsEl = document.getElementById(`buy-lots-${i + 1}`);
    if (priceEl) priceEl.value = formatNumber(p.price);
    if (lotsEl) lotsEl.value = formatNumber(p.lots);
  });

  // If no purchases, add one empty step
  if (purchases.length === 0) {
    addPurchaseStep();
  }

  showToast('Riwayat dimuat! 📂', 'info');

  // Scroll to top
  document.querySelector('.header')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete a history item
 */
function deleteHistoryHandler(id) {
  deleteHistoryItem(id);
  renderHistory();
  showToast('Riwayat dihapus', 'info');
}

/**
 * Clear all history
 */
function clearHistoryHandler() {
  if (getHistory().length === 0) return;
  clearHistory();
  renderHistory();
  showToast('Semua riwayat dihapus', 'info');
}

/**
 * Toggle dark/light mode
 */
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  saveSettings({ theme: next });

  // Update toggle icon
  const thumb = document.querySelector('.theme-toggle-thumb');
  if (thumb) {
    thumb.textContent = next === 'dark' ? '🌙' : '☀️';
  }

  // Recreate charts with new theme colors
  if (lastCalcResult && lastSimResults) {
    destroyCharts();
    setTimeout(() => {
      createDonutChart('donut-chart', lastCalcResult);
      createBarChart('bar-chart', lastCalcResult);
      createLineChart('line-chart', lastSimResults);
    }, 100);
  }
}

/**
 * Initialize theme from settings
 */
function initTheme() {
  const settings = getSettings();
  const theme = settings.theme || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  
  const thumb = document.querySelector('.theme-toggle-thumb');
  if (thumb) {
    thumb.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

/**
 * Toggle between Avg Down and Avg Up mode
 */
function setMode(mode) {
  currentMode = mode;
  updateModeToggle();
}

function updateModeToggle() {
  document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === currentMode);
  });

  const modeTitle = document.getElementById('mode-title');
  if (modeTitle) {
    modeTitle.textContent = currentMode === 'up' ? 'Average Up' : 'Average Down';
  }
}

/**
 * Export handlers
 */
function handleExportPNG() {
  exportPNG('result-capture-area');
}

function handleExportPDF() {
  if (!lastCalcResult || !lastSimResults) {
    showToast('Lakukan kalkulasi terlebih dahulu', 'error');
    return;
  }
  const stockCode = document.getElementById('stock-code')?.value?.trim()?.toUpperCase() || '';
  exportPDF(lastCalcResult, lastSimResults, stockCode, currentMode);
}

function handleCopyClipboard() {
  if (!lastCalcResult || !lastSimResults) {
    showToast('Lakukan kalkulasi terlebih dahulu', 'error');
    return;
  }
  const stockCode = document.getElementById('stock-code')?.value?.trim()?.toUpperCase() || '';
  copyToClipboard(lastCalcResult, lastSimResults, stockCode, currentMode);
}

function handleShareWhatsApp() {
  if (!lastCalcResult || !lastSimResults) {
    showToast('Lakukan kalkulasi terlebih dahulu', 'error');
    return;
  }
  const stockCode = document.getElementById('stock-code')?.value?.trim()?.toUpperCase() || '';
  shareWhatsApp(lastCalcResult, lastSimResults, stockCode, currentMode);
}

export {
  initBrokerSelect,
  updateFeeBadges,
  addPurchaseStep,
  removePurchaseStep,
  calculate,
  renderHistory,
  loadHistory,
  deleteHistoryHandler as deleteHistory,
  clearHistoryHandler as clearHistory,
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
};
