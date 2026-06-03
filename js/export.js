/**
 * AVG DOWN IDX — Export Module
 * PNG, PDF, Clipboard, WhatsApp share
 */

import { formatRupiah, formatNumber, formatPercent } from './utils.js';

/**
 * Show toast notification
 * @param {string} message - Message to show
 * @param {string} type - Toast type: 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Export result section as PNG image
 * @param {string} elementId - ID of element to capture
 */
async function exportPNG(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    showToast('Elemen tidak ditemukan', 'error');
    return;
  }

  try {
    showToast('Membuat gambar...', 'info');
    
    // Wait for html2canvas to load
    if (typeof html2canvas === 'undefined') {
      showToast('Library html2canvas belum dimuat', 'error');
      return;
    }

    const canvas = await html2canvas(element, {
      backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0F0F14' : '#FAFAF7',
      scale: 2,
      useCORS: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    const link = document.createElement('a');
    link.download = `avg-down-idx-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast('Gambar berhasil disimpan! 📸', 'success');
  } catch (err) {
    console.error('Export PNG error:', err);
    showToast('Gagal membuat gambar', 'error');
  }
}

/**
 * Build text summary for clipboard/WhatsApp
 * @param {Object} calcResult - Calculation result
 * @param {Array} simResults - Simulation results
 * @param {string} stockCode - Stock code
 * @param {string} mode - 'down' or 'up'
 * @returns {string} Text summary
 */
function buildTextSummary(calcResult, simResults, stockCode, mode) {
  const modeLabel = mode === 'up' ? 'Average Up' : 'Average Down';
  const stock = stockCode ? ` (${stockCode})` : '';
  
  let text = `📊 *${modeLabel} IDX*${stock}\n`;
  text += `━━━━━━━━━━━━━━━\n`;
  text += `Avg Lama: ${formatRupiah(calcResult.currentDetail.price)} × ${formatNumber(calcResult.currentDetail.lots)} Lot\n`;
  
  calcResult.purchaseDetails.forEach((d, i) => {
    text += `Beli #${i + 1}: ${formatRupiah(d.price)} × ${formatNumber(d.lots)} Lot\n`;
  });
  
  text += `━━━━━━━━━━━━━━━\n`;
  text += `✅ *Average Baru: ${formatRupiah(calcResult.averagePrice)}*\n`;
  text += `📦 Total: ${formatNumber(calcResult.totalLots)} Lot (${formatNumber(calcResult.totalShares)} Lbr)\n`;
  text += `💰 Total Modal: ${formatRupiah(calcResult.totalModal)}\n`;
  text += `📍 BEP: ${formatRupiah(calcResult.bep)}\n`;
  text += `🏢 Broker: ${calcResult.broker.name || '-'}\n`;
  text += `━━━━━━━━━━━━━━━\n`;
  text += `📈 *Simulasi:*\n`;
  
  simResults.forEach(s => {
    const emoji = s.isProfit ? '🟢' : s.isLoss ? '🔴' : '🟡';
    text += `${emoji} ${s.label}: ${formatRupiah(s.profitLoss)}\n`;
  });

  text += `━━━━━━━━━━━━━━━\n`;
  text += `_Powered by Avg Down IDX_`;
  
  return text;
}

/**
 * Copy calculation summary to clipboard
 * @param {Object} calcResult - Calculation result
 * @param {Array} simResults - Simulation results
 * @param {string} stockCode - Stock code
 * @param {string} mode - 'down' or 'up'
 */
async function copyToClipboard(calcResult, simResults, stockCode, mode) {
  const text = buildTextSummary(calcResult, simResults, stockCode, mode);
  
  try {
    await navigator.clipboard.writeText(text);
    showToast('Berhasil disalin ke clipboard! 📋', 'success');
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showToast('Berhasil disalin ke clipboard! 📋', 'success');
  }
}

/**
 * Share via WhatsApp
 * @param {Object} calcResult - Calculation result
 * @param {Array} simResults - Simulation results
 * @param {string} stockCode - Stock code
 * @param {string} mode - 'down' or 'up'
 */
function shareWhatsApp(calcResult, simResults, stockCode, mode) {
  const text = buildTextSummary(calcResult, simResults, stockCode, mode);
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
  showToast('Membuka WhatsApp...', 'info');
}

/**
 * Export as PDF report
 * @param {Object} calcResult - Calculation result
 * @param {Array} simResults - Simulation results
 * @param {string} stockCode - Stock code
 * @param {string} mode - 'down' or 'up'
 */
function exportPDF(calcResult, simResults, stockCode, mode) {
  try {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      showToast('Library jsPDF belum dimuat', 'error');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const modeLabel = mode === 'up' ? 'Average Up' : 'Average Down';
    const stock = stockCode || '-';
    
    // Header
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 193, 7);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(`${modeLabel} IDX`, 15, 18);
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(`Kode Saham: ${stock}`, 15, 28);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 15, 34);
    
    let y = 52;
    
    // Result
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Hasil Kalkulasi', 15, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const results = [
      ['Average Baru', formatRupiah(calcResult.averagePrice)],
      ['Total Lot', `${formatNumber(calcResult.totalLots)} Lot (${formatNumber(calcResult.totalShares)} Lbr)`],
      ['Total Modal', formatRupiah(calcResult.totalModal)],
      ['Total Fee', formatRupiah(calcResult.totalFee)],
      ['BEP', formatRupiah(calcResult.bep)],
    ];
    
    results.forEach(([label, value]) => {
      doc.setTextColor(100, 100, 100);
      doc.text(label, 15, y);
      doc.setTextColor(40, 40, 40);
      doc.setFont(undefined, 'bold');
      doc.text(value, 100, y);
      doc.setFont(undefined, 'normal');
      y += 7;
    });
    
    y += 5;
    
    // Simulation table
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Simulasi Profit/Loss', 15, y);
    y += 8;
    
    // Table header
    doc.setFillColor(250, 250, 247);
    doc.rect(15, y - 4, 180, 8, 'F');
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Target', 17, y);
    doc.text('Harga', 70, y);
    doc.text('Profit/Loss', 120, y);
    y += 8;
    
    doc.setFont(undefined, 'normal');
    simResults.forEach(s => {
      if (s.isProfit) {
        doc.setTextColor(0, 150, 50);
      } else if (s.isLoss) {
        doc.setTextColor(200, 20, 50);
      } else {
        doc.setTextColor(100, 100, 100);
      }
      doc.text(s.label, 17, y);
      doc.text(formatRupiah(s.targetPrice), 70, y);
      doc.text(formatRupiah(s.profitLoss), 120, y);
      y += 6;
      
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    
    // Footer
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Powered by Avg Down IDX', 105, y, { align: 'center' });
    
    doc.save(`avg-down-idx-${stock}-${Date.now()}.pdf`);
    showToast('PDF berhasil dibuat! 📄', 'success');
  } catch (err) {
    console.error('Export PDF error:', err);
    showToast('Gagal membuat PDF', 'error');
  }
}

export {
  showToast,
  exportPNG,
  copyToClipboard,
  shareWhatsApp,
  exportPDF
};
