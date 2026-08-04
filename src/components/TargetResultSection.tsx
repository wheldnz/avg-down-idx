import React, { useEffect, useRef, useState } from 'react';
import { TargetCalcResult, simulateAtPrice, SimulationResult } from '../utils/calculator';
import { formatNumber, formatRupiah, formatPercent } from '../utils/formatters';

interface TargetResultSectionProps {
  calcResult: TargetCalcResult;
  stockCode: string;
}

export const TargetResultSection: React.FC<TargetResultSectionProps> = ({ calcResult, stockCode }) => {
  const resultRef = useRef<HTMLDivElement>(null);
  const [targetSellPrice, setTargetSellPrice] = useState<number>(0);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const syntheticCalcResult = React.useMemo(() => {
    if (!calcResult || !calcResult.isValid) return null;

    const totalShares = calcResult.totalNewShares;
    const totalLots = calcResult.totalNewLots;
    const totalModal = calcResult.totalNewCapital;
    const averagePrice = calcResult.finalAverage;
    const averagePriceExact = calcResult.finalAverageExact;
    const bepExact = totalModal / (totalShares * (1 - calcResult.broker.sellFee / 100));
    const bep = Math.ceil(bepExact);

    return {
      currentDetail: calcResult.currentDetail,
      purchaseDetails: [calcResult.newPurchaseDetail],
      averagePrice,
      averagePriceExact,
      totalLots,
      totalShares,
      totalModal,
      totalFee: calcResult.currentDetail.brokerFee + calcResult.newPurchaseDetail.brokerFee,
      totalValueNoFee: calcResult.currentDetail.transactionValue + calcResult.newPurchaseDetail.transactionValue,
      bep,
      bepExact,
      broker: calcResult.broker
    };
  }, [calcResult]);

  useEffect(() => {
    if (calcResult && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [calcResult]);

  useEffect(() => {
    if (syntheticCalcResult) {
      setTargetSellPrice(syntheticCalcResult.bepExact);
    }
  }, [syntheticCalcResult]);

  useEffect(() => {
    if (syntheticCalcResult && targetSellPrice > 0) {
      setSimResult(simulateAtPrice(syntheticCalcResult, targetSellPrice));
    }
  }, [syntheticCalcResult, targetSellPrice]);

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

  const minPrice = syntheticCalcResult ? Math.floor(syntheticCalcResult.averagePrice * 0.5) : 0;
  const maxPrice = syntheticCalcResult ? Math.ceil(syntheticCalcResult.averagePrice * 2) : 0;
  const profitLossClass = simResult?.isProfit ? 'success' : simResult?.isLoss ? 'danger' : 'warning';
  const profitLossLabel = simResult?.isProfit ? 'Profit' : simResult?.isLoss ? 'Loss' : 'Break Even';

  return (
    <>
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

      {syntheticCalcResult && simResult && (
        <div className="card animate-fade-in-up mt-4" id="target-simulation-card">
          <div className="card-header">
            <div className="card-header-icon gold">🎯</div>
            <div>
              <div className="card-header-title">Simulasi Profit / Loss pada Target Price</div>
              <div className="card-header-subtitle">Geser slider untuk melihat potensi hasil penjualan setelah average tercapai</div>
            </div>
          </div>
          
          <div className="simulation-slider-container">
            <div className="slider-header">
              <span>Target Harga Jual: <strong className="gold">{formatRupiah(Math.round(targetSellPrice))}</strong></span>
              <span className={`badge bg-${profitLossClass}`}>
                {formatPercent(simResult.priceChangePercent)}
              </span>
            </div>
            <input 
              type="range" 
              className="slider"
              min={minPrice} 
              max={maxPrice} 
              step={1} 
              value={targetSellPrice}
              onChange={(e) => setTargetSellPrice(Number(e.target.value))}
            />
            <div className="slider-labels">
              <span>{formatRupiah(minPrice)}</span>
              <span>{formatRupiah(syntheticCalcResult.averagePrice)} (Avg Target)</span>
              <span>{formatRupiah(maxPrice)}</span>
            </div>
          </div>
          
          <div className="simulation-result-box">
            <div className="sim-grid">
              <div className="sim-item">
                <div className="sim-label">Nilai Penjualan</div>
                <div className="sim-value">{formatRupiah(simResult.sellValue)}</div>
              </div>
              <div className="sim-item">
                <div className="sim-label">Fee Jual ({syntheticCalcResult.broker.sellFee}%)</div>
                <div className="sim-value text-danger">{formatRupiah(simResult.sellFee)}</div>
              </div>
              <div className="sim-item">
                <div className="sim-label">Nilai Bersih Diterima</div>
                <div className="sim-value">{formatRupiah(simResult.netSellValue)}</div>
              </div>
            </div>
            
            <div className="sim-final">
              <div className="sim-final-label">Potensi {profitLossLabel}</div>
              <div className={`sim-final-value text-${profitLossClass}`}>
                {formatRupiah(simResult.profitLoss)}
              </div>
              <div className={`sim-final-percent text-${profitLossClass}`}>
                {formatPercent(simResult.profitLossPercent)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
