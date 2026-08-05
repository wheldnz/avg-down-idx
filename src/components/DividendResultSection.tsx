import React, { useEffect, useRef, useState } from 'react';
import { Copy, Camera, MessageCircle, Check, Award } from 'lucide-react';
import { DividendCalcResult } from '../utils/calculator';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { exportPNG } from '../utils/export';

interface DividendResultSectionProps {
  calcResult: DividendCalcResult;
  stockCode?: string;
  onToast: (message: string, type: any) => void;
}

export const DividendResultSection: React.FC<DividendResultSectionProps> = ({
  calcResult,
  stockCode,
  onToast
}) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (calcResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [calcResult]);

  if (!calcResult) return null;

  const stockText = stockCode ? `(${stockCode})` : '';

  const summaryText = `
📊 *HASIL KALKULASI DIVIDEN ${stockCode ? stockCode.toUpperCase() : ''}* 📊
━━━━━━━━━━━━━━━━━━━━━
• Kepemilikan: ${formatNumber(calcResult.totalLots)} Lot (${formatNumber(calcResult.totalShares)} lembar)
• Dividen / Lembar (DPS): ${formatRupiah(calcResult.dps)}
• Gross Dividen: ${formatRupiah(calcResult.grossDividend)}
${calcResult.taxAmount > 0 ? `• Pajak PPh (${calcResult.taxPercent}%): -${formatRupiah(calcResult.taxAmount)}\n` : ''}
💰 *NET DIVIDEN BERSIH: ${formatRupiah(calcResult.netDividend)}*
${calcResult.dividendYield > 0 ? `📈 Dividend Yield: ${calcResult.dividendYield.toFixed(2)}%\n` : ''}
${calcResult.adjustedAverage > 0 ? `📉 Avg Buy Efektif: ${formatRupiah(calcResult.averagePrice)} ➔ ${formatRupiah(calcResult.adjustedAverage)}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━
Powered by Avg Down IDX
`.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      onToast('Rincian dividen disalin ke clipboard! 📋', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      const textarea = document.createElement('textarea');
      textarea.value = summaryText;
      textarea.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      setCopied(true);
      onToast('Rincian dividen disalin ke clipboard! 📋', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(url, '_blank');
    onToast('Membuka WhatsApp...', 'info');
  };

  const handleExportPNG = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    exportPNG('dividend-result-card', isDark, onToast);
  };

  return (
    <div className="card result-card animate-fade-in-up premium-card" id="dividend-result-card" ref={resultRef}>
      {/* Hero Header with Emerald/Green Gradient Accent */}
      <div 
        className="result-hero"
        style={{
          background: 'linear-gradient(135deg, #1b3823 0%, #0d2315 50%, #162a1c 100%)',
          borderBottom: '1px solid rgba(76, 175, 80, 0.3)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="result-hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="result-label text-glow flex items-center justify-center gap-1.5" style={{ color: '#A5D6A7' }}>
            <Award size={18} /> Net Dividen Diterima {stockText}
          </div>
          <div 
            className="result-value glow" 
            style={{ 
              color: '#4CAF50', 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              textShadow: '0 0 25px rgba(76, 175, 80, 0.5)',
              margin: '0.5rem 0'
            }}
          >
            {formatRupiah(calcResult.netDividend)}
          </div>
          <div className="result-sub flex items-center justify-center gap-2 flex-wrap mt-2">
            <span className="badge" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#81C784', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
              {formatNumber(calcResult.totalLots)} Lot ({formatNumber(calcResult.totalShares)} Lbr)
            </span>
            {calcResult.dividendYield > 0 && (
              <span className="badge" style={{ background: 'rgba(255, 193, 7, 0.2)', color: '#FFD54F', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                Yield: {calcResult.dividendYield.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Result Grid */}
      <div className="result-grid" style={{ padding: '1.25rem 1rem' }}>
        <div className="result-item premium-glass">
          <div className="result-item-label">Gross Dividen</div>
          <div className="result-item-value">{formatRupiah(calcResult.grossDividend)}</div>
          <div className="result-item-sub">DPS {formatRupiah(calcResult.dps)} / lembar</div>
        </div>

        <div className="result-item premium-glass">
          <div className="result-item-label">Potongan Pajak PPh ({calcResult.taxPercent}%)</div>
          <div className="result-item-value text-danger">
            {calcResult.taxAmount > 0 ? `-${formatRupiah(calcResult.taxAmount)}` : 'Rp 0'}
          </div>
          <div className="result-item-sub">
            {calcResult.taxPercent === 0 ? 'Bebas PPh (WPO DN)' : 'Potongan PPh Final'}
          </div>
        </div>

        {calcResult.adjustedAverage > 0 && (
          <>
            <div className="result-item premium-glass" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <div className="result-item-label">Average Beli Efektif Baru (Setelah Dividen)</div>
              <div className="result-item-value text-success" style={{ fontSize: '1.6rem' }}>
                {formatRupiah(calcResult.averagePrice)} ➔ {formatRupiah(calcResult.adjustedAverage)}
              </div>
              <div className="result-item-sub text-gold">
                *(Harga modal rata-rata efektif berkurang Rp {formatRupiah(calcResult.netDividend / calcResult.totalShares)}/lembar)
              </div>
            </div>

            <div className="result-item premium-glass" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
              <div className="result-item-label">Modal Efektif Terkini</div>
              <div className="result-item-value text-gold">{formatRupiah(calcResult.effectiveCapital)}</div>
              <div className="result-item-sub">*(Total modal awal dikurangi hasil bersih dividen)</div>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '0 1rem 1.5rem 1rem' }}>
        <div className="action-grid mt-2">
          <button className="btn btn-secondary action-btn" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Tersalin' : 'Salin'}
          </button>
          <button className="btn btn-secondary action-btn" onClick={handleExportPNG}>
            <Camera size={16} /> Gambar
          </button>
          <button className="btn btn-secondary action-btn" onClick={handleWhatsAppShare}>
            <MessageCircle size={16} /> WA
          </button>
        </div>
      </div>
    </div>
  );
};
