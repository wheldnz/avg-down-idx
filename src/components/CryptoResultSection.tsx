import React, { useEffect, useRef } from 'react';
import { Copy, Camera, FileText, MessageCircle } from 'lucide-react';
import { CryptoCalcResult, CryptoSimulationResult } from '../utils/calculator';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { exportPNG } from '../utils/export';
import { copyCryptoToClipboard, exportCryptoPDF, shareCryptoWhatsApp } from '../utils/cryptoExport';

interface CryptoResultSectionProps {
  calcResult: CryptoCalcResult;
  simResults: CryptoSimulationResult[];
  coinCode: string;
  mode: 'down' | 'up';
  onToast: (msg: string, type: string) => void;
}

export const CryptoResultSection: React.FC<CryptoResultSectionProps> = ({ calcResult, simResults, coinCode, mode, onToast }) => {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calcResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [calcResult]);

  if (!calcResult) return null;

  return (
    <div className="card result-card animate-fade-in-up premium-card" id="crypto-result-card" ref={resultRef}>
      <div className="result-hero premium-gradient" id="result-hero">
        <div className="result-hero-content">
          <div className="result-label text-glow">Average Baru {coinCode && `(${coinCode})`}</div>
          <div className="result-value glow" id="res-avg-price">{formatRupiah(calcResult.averagePriceExact)}</div>
          <div className="result-sub">
            <span className="badge premium-badge" id="res-broker-badge">{calcResult.broker.name || 'Custom'}</span>
          </div>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-item premium-glass">
          <div className="result-item-label">Total Koin</div>
          <div className="result-item-value" id="res-total-coins">{formatNumber(calcResult.totalCoins)} Koin</div>
        </div>
        <div className="result-item premium-glass">
          <div className="result-item-label">Total Modal (inc. Fee)</div>
          <div className="result-item-value text-gold" id="res-total-modal">{formatRupiah(calcResult.totalModal)}</div>
        </div>
        <div className="result-item premium-glass" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
          <div className="result-item-label">BEP (Break Even)</div>
          <div className="result-item-value text-gold" id="res-bep">{formatRupiah(calcResult.bepExact)}</div>
        </div>
      </div>
      
      <div style={{ padding: '0 1rem 1.5rem 1rem' }}>
        <div className="action-grid mt-4">
          <button className="btn btn-secondary action-btn" onClick={() => copyCryptoToClipboard(calcResult, simResults, coinCode, mode, onToast)}>
            <Copy size={16} /> Salin
          </button>
          <button className="btn btn-secondary action-btn" onClick={() => exportPNG('crypto-result-card', document.documentElement.getAttribute('data-theme') === 'dark', onToast)}>
            <Camera size={16} /> Gambar
          </button>
          <button className="btn btn-secondary action-btn" onClick={() => exportCryptoPDF(calcResult, simResults, coinCode, mode, onToast)}>
            <FileText size={16} /> PDF
          </button>
          <button className="btn btn-secondary action-btn" onClick={() => shareCryptoWhatsApp(calcResult, simResults, coinCode, mode, onToast)}>
            <MessageCircle size={16} /> WA
          </button>
        </div>
      </div>
    </div>
  );
};
