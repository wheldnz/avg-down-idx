import { formatRupiah, formatNumber } from './formatters';
import { CryptoCalcResult, CryptoSimulationResult } from './calculator';
import { jsPDF } from 'jspdf';

export function buildCryptoTextSummary(calcResult: CryptoCalcResult, simResults: CryptoSimulationResult[], coinCode: string, mode: string): string {
  const modeLabel = mode === 'up' ? 'Average Up' : 'Average Down';
  const coin = coinCode ? ` (${coinCode})` : '';
  
  let text = `[ ${modeLabel} CRYPTO${coin} ]\n`;
  text += `━━━━━━━━━━━━━━━\n`;
  text += `Avg Lama: ${formatRupiah(calcResult.currentDetail.price)} × ${formatNumber(calcResult.currentDetail.coins)} Koin\n`;
  
  calcResult.purchaseDetails.forEach((d, i) => {
    text += `Beli #${i + 1}: ${formatRupiah(d.price)} × ${formatNumber(d.coins)} Koin\n`;
  });
  
  text += `━━━━━━━━━━━━━━━\n`;
  text += `Average Baru: ${formatRupiah(calcResult.averagePriceExact)}\n`;
  text += `Total: ${formatNumber(calcResult.totalCoins)} Koin\n`;
  text += `Total Modal: ${formatRupiah(calcResult.totalModal)}\n`;
  text += `BEP: ${formatRupiah(calcResult.bepExact)}\n`;
  text += `Exchange: ${calcResult.broker.name || '-'}\n`;
  text += `━━━━━━━━━━━━━━━\n`;
  text += `Simulasi:\n`;
  
  simResults.forEach(s => {
    const symbol = s.isProfit ? '+' : s.isLoss ? '-' : '~';
    text += `${symbol} ${s.label}: ${formatRupiah(s.profitLoss)}\n`;
  });

  text += `━━━━━━━━━━━━━━━\n`;
  text += `Powered by Avg Down IDX`;
  
  return text;
}

export async function copyCryptoToClipboard(calcResult: CryptoCalcResult, simResults: CryptoSimulationResult[], coinCode: string, mode: string, onToast: (msg: string, type: string) => void): Promise<void> {
  const text = buildCryptoTextSummary(calcResult, simResults, coinCode, mode);
  
  try {
    await navigator.clipboard.writeText(text);
    onToast('Berhasil disalin ke clipboard! 📋', 'success');
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    onToast('Berhasil disalin ke clipboard! 📋', 'success');
  }
}

export function shareCryptoWhatsApp(calcResult: CryptoCalcResult, simResults: CryptoSimulationResult[], coinCode: string, mode: string, onToast: (msg: string, type: string) => void): void {
  const text = buildCryptoTextSummary(calcResult, simResults, coinCode, mode);
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
  onToast('Membuka WhatsApp...', 'info');
}

export function exportCryptoPDF(calcResult: CryptoCalcResult, simResults: CryptoSimulationResult[], coinCode: string, mode: string, onToast: (msg: string, type: string) => void): void {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const modeLabel = mode === 'up' ? 'Average Up' : 'Average Down';
    const coin = coinCode || '-';
    
    // Header
    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 193, 7);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${modeLabel} CRYPTO`, 15, 18);
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(`Koin/Token: ${coin}`, 15, 28);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 15, 34);
    
    let y = 52;
    
    // Result
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Hasil Kalkulasi', 15, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const results = [
      ['Average Baru', formatRupiah(calcResult.averagePriceExact)],
      ['Total Koin', `${formatNumber(calcResult.totalCoins)} Koin`],
      ['Total Modal', formatRupiah(calcResult.totalModal)],
      ['Total Fee', formatRupiah(calcResult.totalFee)],
      ['BEP', formatRupiah(calcResult.bepExact)],
    ];
    
    results.forEach(([label, value]) => {
      doc.setTextColor(100, 100, 100);
      doc.text(label, 15, y);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 100, y);
      doc.setFont('helvetica', 'normal');
      y += 7;
    });
    
    y += 5;
    
    // Simulation table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Simulasi Profit/Loss', 15, y);
    y += 8;
    
    // Table header
    doc.setFillColor(250, 250, 247);
    doc.rect(15, y - 4, 180, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Target', 17, y);
    doc.text('Harga', 70, y);
    doc.text('Profit/Loss', 120, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    simResults.forEach(s => {
      if (s.isProfit) {
        doc.setTextColor(0, 150, 50);
      } else if (s.isLoss) {
        doc.setTextColor(200, 20, 50);
      } else {
        doc.setTextColor(100, 100, 100);
      }
      doc.text(s.label || '', 17, y);
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
    
    doc.save(`avg-down-idx-${coin}-${Date.now()}.pdf`);
    onToast('PDF berhasil dibuat! 📄', 'success');
  } catch (err) {
    console.error('Export PDF error:', err);
    onToast('Gagal membuat PDF', 'error');
  }
}
