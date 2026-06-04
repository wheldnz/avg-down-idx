import React, { useState, useEffect } from 'react';
import { CalcResult, SimulationResult, simulateAtPrice } from '../utils/calculator';
import { formatRupiah, formatPercent } from '../utils/formatters';

interface SimulationProps {
  calcResult: CalcResult;
}

export const Simulation: React.FC<SimulationProps> = ({ calcResult }) => {
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    if (calcResult) {
      setTargetPrice(calcResult.bepExact); // Start at BEP
    }
  }, [calcResult]);

  useEffect(() => {
    if (calcResult && targetPrice > 0) {
      setSimResult(simulateAtPrice(calcResult, targetPrice));
    }
  }, [calcResult, targetPrice]);

  if (!calcResult || !simResult) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetPrice(Number(e.target.value));
  };

  const minPrice = Math.floor(calcResult.averagePrice * 0.5);
  const maxPrice = Math.ceil(calcResult.averagePrice * 2);

  const profitLossClass = simResult.isProfit ? 'success' : simResult.isLoss ? 'danger' : 'warning';
  const profitLossLabel = simResult.isProfit ? 'Profit' : simResult.isLoss ? 'Loss' : 'Break Even';

  return (
    <div className="card animate-fade-in-up" id="simulation-card">
      <div className="card-header">
        <div className="card-header-icon gold">🎯</div>
        <div>
          <div className="card-header-title">Simulasi Target Harga</div>
          <div className="card-header-subtitle">Geser slider untuk melihat potensi profit/loss</div>
        </div>
      </div>
      
      <div className="simulation-slider-container">
        <div className="slider-header">
          <span>Target Jual: <strong className="gold" id="sim-target-price">{formatRupiah(Math.round(targetPrice))}</strong></span>
          <span className={`badge bg-${profitLossClass}`} id="sim-target-percent">
            {formatPercent(simResult.priceChangePercent)}
          </span>
        </div>
        <input 
          type="range" 
          id="sim-price-slider" 
          className="slider"
          min={minPrice} 
          max={maxPrice} 
          step={1} 
          value={targetPrice}
          onChange={handleSliderChange}
        />
        <div className="slider-labels">
          <span>{formatRupiah(minPrice)}</span>
          <span>{formatRupiah(calcResult.averagePrice)} (Avg)</span>
          <span>{formatRupiah(maxPrice)}</span>
        </div>
      </div>
      
      <div className="simulation-result-box">
        <div className="sim-grid">
          <div className="sim-item">
            <div className="sim-label">Nilai Penjualan</div>
            <div className="sim-value" id="sim-sell-value">{formatRupiah(simResult.sellValue)}</div>
          </div>
          <div className="sim-item">
            <div className="sim-label">Fee Jual ({calcResult.broker.sellFee}%)</div>
            <div className="sim-value text-danger" id="sim-sell-fee">{formatRupiah(simResult.sellFee)}</div>
          </div>
          <div className="sim-item">
            <div className="sim-label">Nilai Bersih</div>
            <div className="sim-value" id="sim-net-value">{formatRupiah(simResult.netSellValue)}</div>
          </div>
        </div>
        
        <div className="sim-final">
          <div className="sim-final-label">Potensi {profitLossLabel}</div>
          <div className={`sim-final-value text-${profitLossClass}`} id="sim-pl-value">
            {formatRupiah(simResult.profitLoss)}
          </div>
          <div className={`sim-final-percent text-${profitLossClass}`} id="sim-pl-percent">
            {formatPercent(simResult.profitLossPercent)}
          </div>
        </div>
      </div>
    </div>
  );
};
