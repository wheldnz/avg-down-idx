import React, { useEffect, useRef } from 'react';
import { RightIssueResult } from '../utils/calculator';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RightIssueResultSectionProps {
  calcResult: RightIssueResult;
  stockCode: string;
  hasPortfolio: boolean;
}

export const RightIssueResultSection: React.FC<RightIssueResultSectionProps> = ({ calcResult, stockCode, hasPortfolio }) => {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calcResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [calcResult]);

  if (!calcResult) return null;

  return (
    <div className="card result-card animate-fade-in-up" id="ri-result-card" ref={resultRef}>
      <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div className="card-header-title text-gold" style={{ fontSize: '1.25rem' }}>
            Hasil Right Issue {stockCode && `untuk ${stockCode}`}
          </div>
        </div>
      </div>

      <div className="result-main text-center mb-6">
        <div className="result-label" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Harga Teoritis (Ex-Right)</div>
        <div className="result-value text-gold" style={{ fontSize: '2.5rem' }}>
          Rp {formatNumber(calcResult.theoreticalPrice)}
        </div>
        <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Ini adalah estimasi harga saham pada saat pembukaan pasar di hari Ex-Date.
        </p>
      </div>

      {hasPortfolio && (
        <>
          <div className="divider-dashed"></div>
          <div className="card-header-title text-center mb-4">Simulasi Portofolio Anda</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            
            {/* Scenario: TEBUS */}
            <div className="result-stat-box" style={{ background: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#22c55e', fontWeight: 'bold' }}>
                <CheckCircle size={18} /> Jika Tebus Right
              </div>
              
              <div className="mb-3">
                <div className="result-label" style={{ fontSize: '0.75rem' }}>Hak HMETD Didapat</div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{formatNumber(calcResult.rightsLots)} Lot</div>
              </div>
              
              <div className="mb-3">
                <div className="result-label" style={{ fontSize: '0.75rem' }}>Modal Tebus Diperlukan</div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{formatRupiah(calcResult.requiredCapital)}</div>
              </div>
              
              <div className="mb-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="result-label" style={{ fontSize: '0.75rem' }}>Average Baru</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--gold-500)' }}>Rp {formatNumber(calcResult.newAveragePrice)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total {formatNumber(calcResult.newTotalLots)} Lot</div>
              </div>
            </div>

            {/* Scenario: TIDAK TEBUS */}
            <div className="result-stat-box" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ef4444', fontWeight: 'bold' }}>
                <AlertTriangle size={18} /> Jika Tidak Tebus
              </div>
              
              <div className="mb-3">
                <div className="result-label" style={{ fontSize: '0.75rem' }}>Hak HMETD</div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#ef4444' }}>Hangus</div>
              </div>
              
              <div className="mb-3">
                <div className="result-label" style={{ fontSize: '0.75rem' }}>Potensi Dilusi (Floating Loss)</div>
                <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#ef4444' }}>
                  {calcResult.portfolioLossIfNotExercised > 0 ? formatRupiah(calcResult.portfolioLossIfNotExercised) : 'Rp 0'}
                </div>
              </div>

              <div className="mb-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="result-label" style={{ fontSize: '0.75rem' }}>Average Tetap</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  <Info size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Jika harga pasar turun ke Harga Teoritis, nilai portofolio Anda akan turun (dilusi).
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
