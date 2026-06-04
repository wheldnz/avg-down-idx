import React, { useEffect, useRef } from 'react';
import { TargetCalcResult } from '../utils/calculator';
import { formatNumber, formatRupiah } from '../utils/formatters';

interface TargetResultSectionProps {
  calcResult: TargetCalcResult;
  stockCode: string;
  mode: 'down' | 'up';
}

export const TargetResultSection: React.FC<TargetResultSectionProps> = ({ calcResult, stockCode }) => {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calcResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [calcResult]);

  if (!calcResult) return null;

  if (!calcResult.isValid) {
    return (
      <div className="card result-card animate-fade-in-up" id="target-result-card" ref={resultRef}>
        <div className="card-header">
          <div className="card-header-icon gold">⚠️</div>
          <div>
            <div className="card-header-title text-danger">Target Tidak Valid</div>
          </div>
        </div>
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p>{calcResult.errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card result-card animate-fade-in-up premium-card" id="target-result-card" ref={resultRef}>
      <div className="result-hero premium-gradient">
        <div className="result-hero-content">
          <div className="result-label text-glow">Kebutuhan Lot {stockCode && `(${stockCode})`}</div>
          <div className="result-value glow text-success">{formatNumber(calcResult.requiredLots)}</div>
          <div className="result-sub">
            <span className="badge premium-badge">Lot Tambahan</span>
          </div>
        </div>
      </div>
      
      <div className="result-grid">
        <div className="result-item premium-glass" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
          <div className="result-item-label">Modal Tambahan (inc. Fee)</div>
          <div className="result-item-value text-gold" style={{ fontSize: '2rem' }}>
            {formatRupiah(calcResult.requiredCapital)}
          </div>
        </div>
        
        <div className="result-item premium-glass">
          <div className="result-item-label">Total Lot Akhir</div>
          <div className="result-item-value">{formatNumber(calcResult.totalNewLots)}</div>
        </div>
        
        <div className="result-item premium-glass">
          <div className="result-item-label">Total Modal Akhir</div>
          <div className="result-item-value">{formatRupiah(calcResult.totalNewCapital)}</div>
        </div>
        
        <div className="result-item premium-glass" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
          <div className="result-item-label">Simulasi Hasil Average</div>
          <div className="result-item-value text-gold">{formatRupiah(calcResult.finalAverage)}</div>
          <div className="result-item-sub">*(Mendekati Target Karena Pembulatan Lot)</div>
        </div>
      </div>
    </div>
  );
};
