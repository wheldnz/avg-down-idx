import React, { useEffect, useRef } from 'react';
import { Copy, Camera, FileText, MessageCircle } from 'lucide-react';
import { CalcResult } from '../utils/calculator';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { exportPNG, exportPDF, copyToClipboard, shareWhatsApp } from '../utils/export';

interface ResultSectionProps {
  calcResult: CalcResult;
  simResults: any[];
  stockCode: string;
  mode: 'down' | 'up';
  onToast: (msg: string, type: string) => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ calcResult, simResults, stockCode, mode, onToast }) => {
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto scroll to result when calcResult changes
  useEffect(() => {
    if (calcResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [calcResult]);

  if (!calcResult) return null;

  return (
    <div className="card result-card animate-fade-in-up premium-card" id="result-card" ref={resultRef}>
      <div className="result-hero premium-gradient" id="result-hero">
        <div className="result-label text-glow">Average Baru</div>
        <div className="result-value glow" id="res-avg-price">{formatRupiah(calcResult.averagePrice)}</div>
        <div className="result-sub">
          <span className="badge premium-badge" id="res-broker-badge">{calcResult.broker.name || 'Custom'}</span>
        </div>
      </div>
      
      <div className="result-grid mt-4">
        <div className="result-item premium-glass">
          <div className="result-item-label">Total Lot</div>
          <div className="result-item-value" id="res-total-lots">{formatNumber(calcResult.totalLots)}</div>
          <div className="result-item-sub" id="res-total-shares">{formatNumber(calcResult.totalShares)} Lbr</div>
        </div>
        <div className="result-item premium-glass">
          <div className="result-item-label">Total Modal (inc. Fee)</div>
          <div className="result-item-value" id="res-total-modal">{formatRupiah(calcResult.totalModal)}</div>
        </div>
        <div className="result-item premium-glass">
          <div className="result-item-label">BEP (Break Even)</div>
          <div className="result-item-value text-gold" id="res-bep">{formatRupiah(calcResult.bep)}</div>
        </div>
      </div>
      
      <div className="action-grid mt-4">
        <button className="btn btn-secondary action-btn" onClick={() => copyToClipboard(calcResult, simResults, stockCode, mode, onToast)}>
          <Copy size={16} /> Salin
        </button>
        <button className="btn btn-secondary action-btn" onClick={() => exportPNG('result-card', document.documentElement.getAttribute('data-theme') === 'dark', onToast)}>
          <Camera size={16} /> Gambar
        </button>
        <button className="btn btn-secondary action-btn" onClick={() => exportPDF(calcResult, simResults, stockCode, mode, onToast)}>
          <FileText size={16} /> PDF
        </button>
        <button className="btn btn-secondary action-btn" onClick={() => shareWhatsApp(calcResult, simResults, stockCode, mode, onToast)}>
          <MessageCircle size={16} /> WA
        </button>
      </div>
    </div>
  );
};
