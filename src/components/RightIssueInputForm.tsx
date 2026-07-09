import React from 'react';
import { Briefcase, Zap, Wallet, Pin } from 'lucide-react';
import { parseFormattedNumber, formatRupiah, formatInputNumber } from '../utils/formatters';

export interface RightIssueFormData {
  stockCode: string;
  oldRatio: string;
  newRatio: string;
  cumPrice: string;
  exercisePrice: string;
  currentPrice: string;
  currentLots: string;
}

interface RightIssueInputFormProps {
  formData: RightIssueFormData;
  setFormData: React.Dispatch<React.SetStateAction<RightIssueFormData>>;
  onCalculate: () => void;
  onReset: () => void;
}

export const RightIssueInputForm: React.FC<RightIssueInputFormProps> = ({ formData, setFormData, onCalculate, onReset }) => {
  const handleStockCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
    setFormData(prev => ({ ...prev, stockCode: val }));
  };

  const handleNumberInput = (field: keyof RightIssueFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: formatInputNumber(value) }));
  };

  const getModalPreview = (priceStr: string, lotsStr: string) => {
    const price = parseFormattedNumber(priceStr);
    const lots = parseFormattedNumber(lotsStr);
    if (price > 0 && lots > 0) {
      return formatRupiah(price * lots * 100);
    }
    return 'Rp 0';
  };

  const currentPreview = getModalPreview(formData.currentPrice, formData.currentLots);
  const currentHasValue = parseFormattedNumber(formData.currentPrice) > 0 && parseFormattedNumber(formData.currentLots) > 0;

  return (
    <div className="card animate-fade-in-up" id="ri-input-card">
      <div className="card-header">
        <div className="card-header-icon gold"><Briefcase size={24} /></div>
        <div>
          <div className="card-header-title" id="mode-title">
            Kalkulator Right Issue
          </div>
          <div className="card-header-subtitle">Hitung Harga Teoritis & Simulasi HMETD</div>
        </div>
      </div>

      <div className="input-group full-width mb-4">
        <label className="input-label" htmlFor="ri-stock-code">Kode Saham (Opsional)</label>
        <input 
          type="text" 
          id="ri-stock-code" 
          className="input-field stock-code-input" 
          placeholder="BBRI" 
          maxLength={4} 
          autoComplete="off"
          value={formData.stockCode}
          onChange={handleStockCodeChange}
        />
      </div>

      <div className="step-label">
        <span className="step-number">1</span>
        <span className="step-text">Detail Right Issue (HMETD)</span>
      </div>
      
      <div className="input-row mb-2">
        <div className="input-group">
          <label className="input-label">Rasio Saham Lama</label>
          <input 
            type="text" 
            className="input-field number-input" 
            inputMode="numeric" 
            placeholder="Contoh: 10" 
            autoComplete="off"
            value={formData.oldRatio}
            onChange={(e) => handleNumberInput('oldRatio', e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Rasio HMETD (Baru)</label>
          <input 
            type="text" 
            className="input-field number-input" 
            inputMode="numeric" 
            placeholder="Contoh: 3" 
            autoComplete="off"
            value={formData.newRatio}
            onChange={(e) => handleNumberInput('newRatio', e.target.value)}
          />
        </div>
      </div>

      <div className="input-row mb-4">
        <div className="input-group">
          <label className="input-label">Harga Cum Date</label>
          <input 
            type="text" 
            className="input-field number-input" 
            inputMode="numeric" 
            placeholder="0" 
            autoComplete="off"
            value={formData.cumPrice}
            onChange={(e) => handleNumberInput('cumPrice', e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Harga Tebus / Pelaksanaan</label>
          <input 
            type="text" 
            className="input-field number-input" 
            inputMode="numeric" 
            placeholder="0" 
            autoComplete="off"
            value={formData.exercisePrice}
            onChange={(e) => handleNumberInput('exercisePrice', e.target.value)}
          />
        </div>
      </div>

      <div className="divider-dashed"></div>

      <div className="step-label">
        <span className="step-number"><Pin size={16} /></span>
        <span className="step-text">Posisi Saat Ini (Opsional untuk Portofolio)</span>
      </div>
      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Harga Rata-Rata (Avg)</label>
          <input 
            type="text" 
            className="input-field number-input" 
            inputMode="numeric" 
            placeholder="0" 
            autoComplete="off"
            value={formData.currentPrice}
            onChange={(e) => handleNumberInput('currentPrice', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Jumlah Lot Saat Ini</label>
          <input 
            type="text" 
            className="input-field number-input" 
            inputMode="numeric" 
            placeholder="0" 
            autoComplete="off"
            value={formData.currentLots}
            onChange={(e) => handleNumberInput('currentLots', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
          />
        </div>
      </div>
      <div className={`modal-preview ${currentHasValue ? 'has-value' : ''}`}>
        <span className="modal-preview-icon"><Wallet size={16} /></span>
        <span className="modal-preview-text">Modal Saat Ini: <strong>{currentPreview}</strong></span>
      </div>

      <div className="divider"></div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={onCalculate}>
          <Zap size={18} style={{ marginRight: '8px' }} /> Hitung Right Issue
        </button>
        <button type="button" className="btn" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }} onClick={onReset} aria-label="Reset form">
          Reset
        </button>
      </div>
    </div>
  );
};
