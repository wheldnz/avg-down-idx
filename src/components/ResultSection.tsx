import React from 'react';
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
  if (!calcResult) return null;

  return (
    <div className="card result-card animate-fade-in-up" id="result-card">
      <div className="result-hero" id="result-hero">
        <div className="result-label">Average Baru</div>
        <div className="result-value" id="res-avg-price">{formatRupiah(calcResult.averagePrice)}</div>
        <div className="result-sub">
          <span className="badge" id="res-broker-badge">{calcResult.broker.name || 'Custom'}</span>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-item">
          <div className="result-item-label">Total Lot</div>
          <div className="result-item-value" id="res-total-lots">{formatNumber(calcResult.totalLots)}</div>
          <div className="result-item-sub" id="res-total-shares">{formatNumber(calcResult.totalShares)} Lbr</div>
        </div>
        <div className="result-item">
          <div className="result-item-label">Total Modal (inc. Fee)</div>
          <div className="result-item-value" id="res-total-modal">{formatRupiah(calcResult.totalModal)}</div>
        </div>
        <div className="result-item">
          <div className="result-item-label">BEP (Break Even)</div>
          <div className="result-item-value" id="res-bep">{formatRupiah(calcResult.bep)}</div>
        </div>
      </div>
      
      <div className="action-grid mt-4">
        <button className="btn btn-secondary" onClick={() => copyToClipboard(calcResult, simResults, stockCode, mode, onToast)}>
          📋 Salin
        </button>
        <button className="btn btn-secondary" onClick={() => exportPNG('result-card', document.documentElement.getAttribute('data-theme') === 'dark', onToast)}>
          📸 Gambar
        </button>
        <button className="btn btn-secondary" onClick={() => exportPDF(calcResult, simResults, stockCode, mode, onToast)}>
          📄 PDF
        </button>
        <button className="btn btn-secondary" onClick={() => shareWhatsApp(calcResult, simResults, stockCode, mode, onToast)}>
          💬 WA
        </button>
      </div>
    </div>
  );
};
