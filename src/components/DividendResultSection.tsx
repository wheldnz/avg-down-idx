import React from 'react';
import { Award, Copy, Check, MessageSquare } from 'lucide-react';
import { DividendCalcResult } from '../utils/calculator';
import { formatRupiah, formatNumber } from '../utils/formatters';

interface DividendResultSectionProps {
  calcResult: DividendCalcResult;
  stockCode?: string;
  onToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const DividendResultSection: React.FC<DividendResultSectionProps> = ({
  calcResult,
  stockCode,
  onToast
}) => {
  const [copied, setCopied] = React.useState(false);

  const titleText = stockCode ? `Saham ${stockCode}` : 'Saham Anda';

  const copyText = `
📊 *HASIL KALKULASI DIVIDEN* 📊
${stockCode ? `Saham: ${stockCode}\n` : ''}--------------------------------
• Jumlah Kepemilikan: ${formatNumber(calcResult.totalLots)} Lot (${formatNumber(calcResult.totalShares)} lembar)
• Dividen per Lembar: ${formatRupiah(calcResult.dps)}
• Gross Dividen: ${formatRupiah(calcResult.grossDividend)}
${calcResult.taxAmount > 0 ? `• Pajak PPh (${calcResult.taxPercent}%): ${formatRupiah(calcResult.taxAmount)}\n` : ''}
💰 *TOTAL DIVIDEN BERSIH: ${formatRupiah(calcResult.netDividend)}*
${calcResult.dividendYield > 0 ? `📈 Dividend Yield: ${calcResult.dividendYield.toFixed(2)}%\n` : ''}
${calcResult.adjustedAverage > 0 ? `📉 Average Efektif Baru: ${formatRupiah(calcResult.averagePrice)} ➔ ${formatRupiah(calcResult.adjustedAverage)}\n` : ''}
--------------------------------
Kalkulasi via AVG DOWN App
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    onToast('Rincian dividen disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(copyText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="card animate-fade-in-up" id="dividend-results-card">
      <div className="card-header">
        <div className="card-header-icon gold">
          <Award size={20} />
        </div>
        <div>
          <div className="card-header-title">Hasil Kalkulasi Dividen {titleText}</div>
          <div className="card-header-subtitle">Ringkasan pendapatan dividen dan penyesuaian modal</div>
        </div>
      </div>

      <div className="result-main-grid mt-4">
        <div className="result-main-card success">
          <div className="result-main-label">Total Dividen Diterima (Bersih)</div>
          <div className="result-main-value text-success">{formatRupiah(calcResult.netDividend)}</div>
          <div className="result-main-sub text-tertiary">
            Dari {formatNumber(calcResult.totalLots)} Lot ({formatNumber(calcResult.totalShares)} Lembar)
          </div>
        </div>

        {calcResult.dividendYield > 0 && (
          <div className="result-main-card gold">
            <div className="result-main-label">Dividend Yield</div>
            <div className="result-main-value text-gold">{calcResult.dividendYield.toFixed(2)}%</div>
            <div className="result-main-sub text-tertiary">
              Berdasarkan Avg Buy {formatRupiah(calcResult.averagePrice)}
            </div>
          </div>
        )}
      </div>

      <div className="grid-2-cols mt-4">
        <div className="stat-box">
          <span className="stat-label">Gross Dividen (Sebelum Pajak)</span>
          <span className="stat-value">{formatRupiah(calcResult.grossDividend)}</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Potongan Pajak PPh ({calcResult.taxPercent}%)</span>
          <span className="stat-value text-danger">{formatRupiah(calcResult.taxAmount)}</span>
        </div>

        {calcResult.adjustedAverage > 0 && (
          <>
            <div className="stat-box highlight">
              <span className="stat-label">Penyesuaian Average (Efektif Baru)</span>
              <span className="stat-value text-success">{formatRupiah(calcResult.adjustedAverage)}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Modal Efektif Terkini</span>
              <span className="stat-value">{formatRupiah(calcResult.effectiveCapital)}</span>
            </div>
          </>
        )}
      </div>

      <div className="action-buttons mt-4 flex gap-2">
        <button className="btn btn-outline flex-1" onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? ' Tersalin' : ' Salin Ringkasan'}
        </button>
        <button className="btn btn-success flex-1" onClick={handleWhatsAppShare}>
          <MessageSquare size={16} /> WhatsApp
        </button>
      </div>
    </div>
  );
};
