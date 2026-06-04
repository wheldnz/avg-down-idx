import React from 'react';
import { Target, Zap, Wallet, Pin } from 'lucide-react';
import { getBrokers, getBrokerById } from '../utils/brokers';
import { formatNumber, parseFormattedNumber, formatRupiah } from '../utils/formatters';

export interface TargetFormData {
  stockCode: string;
  brokerId: string;
  customBuyFee: string;
  customSellFee: string;
  currentPrice: string;
  currentLots: string;
  targetAverage: string;
  newPurchasePrice: string;
}

interface TargetInputFormProps {
  mode: 'down' | 'up';
  formData: TargetFormData;
  setFormData: React.Dispatch<React.SetStateAction<TargetFormData>>;
  onCalculate: () => void;
}

export const TargetInputForm: React.FC<TargetInputFormProps> = ({ mode, formData, setFormData, onCalculate }) => {
  const brokers = getBrokers();
  
  const currentBroker = getBrokerById(formData.brokerId);
  const isCustom = formData.brokerId === 'custom';

  const buyFee = isCustom ? formData.customBuyFee : (currentBroker?.buyFee.toString() || '0.15');
  const sellFee = isCustom ? formData.customSellFee : (currentBroker?.sellFee.toString() || '0.25');

  const handleStockCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
    setFormData(prev => ({ ...prev, stockCode: val }));
  };

  const handleNumberInput = (field: keyof TargetFormData, value: string) => {
    const rawValue = value.replace(/\./g, '').replace(/[^\d]/g, '');
    if (rawValue === '') {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }
    const num = parseInt(rawValue, 10);
    if (!isNaN(num)) {
      setFormData(prev => ({ ...prev, [field]: formatNumber(num) }));
    }
  };

  const handleDecimalInput = (field: 'customBuyFee' | 'customSellFee', value: string) => {
    let val = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    if (parts[1] && parts[1].length > 2) val = parts[0] + '.' + parts[1].substring(0, 2);
    setFormData(prev => ({ ...prev, [field]: val }));
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
    <div className="card animate-fade-in-up" id="target-input-card">
      <div className="card-header">
        <div className="card-header-icon gold">🎯</div>
        <div>
          <div className="card-header-title" id="mode-title">
            Kalkulator Target Average {mode === 'up' ? 'Up' : 'Down'}
          </div>
          <div className="card-header-subtitle">Hitung modal untuk capai target average</div>
        </div>
      </div>

      <div className="input-group full-width mb-4">
        <label className="input-label" htmlFor="t-stock-code">Kode Saham (Opsional)</label>
        <input 
          type="text" 
          id="t-stock-code" 
          className="input-field stock-code-input" 
          placeholder="BBCA" 
          maxLength={4} 
          autoComplete="off"
          value={formData.stockCode}
          onChange={handleStockCodeChange}
        />
      </div>

      <div className="input-group full-width mb-2">
        <label className="input-label" htmlFor="t-broker-select">Pilih Broker</label>
        <div className="select-wrapper">
          <select 
            id="t-broker-select" 
            className="select-field"
            value={formData.brokerId}
            onChange={(e) => setFormData(prev => ({ ...prev, brokerId: e.target.value }))}
          >
            {brokers.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="fee-badges">
        <span className="fee-badge">
          <span className="fee-badge-label">Fee</span>
          <span>Beli: {buyFee}%</span>
        </span>
        <span className="fee-badge">
          <span className="fee-badge-label">Fee</span>
          <span>Jual: {sellFee}%</span>
        </span>
      </div>

      {isCustom && (
        <div className="custom-fee-row visible">
          <div className="input-group">
            <label className="input-label">Fee Beli (%)</label>
            <input 
              type="text" 
              className="input-field" 
              inputMode="decimal" 
              autoComplete="off"
              value={formData.customBuyFee}
              onChange={(e) => handleDecimalInput('customBuyFee', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Fee Jual (%)</label>
            <input 
              type="text" 
              className="input-field" 
              inputMode="decimal" 
              autoComplete="off"
              value={formData.customSellFee}
              onChange={(e) => handleDecimalInput('customSellFee', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="divider"></div>

      <div className="step-label">
        <span className="step-number"><Pin size={16} /></span>
        <span className="step-text">Posisi Saat Ini</span>
      </div>
      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Harga Rata-Rata</label>
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
          <label className="input-label">Jumlah Lot</label>
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
        <span className="modal-preview-text">Modal: <strong>{currentPreview}</strong></span>
      </div>

      <div className="divider-dashed"></div>

      <div className="step-label">
        <span className="step-number"><Target size={16} /></span>
        <span className="step-text">Skenario Target</span>
      </div>
      
      <div className="input-row mb-4">
        <div className="input-group full-width">
          <label className="input-label">Target Average Harga</label>
          <input 
            type="text" 
            className="input-field number-input text-gold" 
            style={{ fontWeight: 'bold' }}
            inputMode="numeric" 
            placeholder="0" 
            autoComplete="off"
            value={formData.targetAverage}
            onChange={(e) => handleNumberInput('targetAverage', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
          />
        </div>
      </div>

      <div className="input-row">
        <div className="input-group full-width">
          <label className="input-label">Rencana Harga Beli Baru</label>
          <input 
            type="text" 
            className="input-field number-input" 
            inputMode="numeric" 
            placeholder="0" 
            autoComplete="off"
            value={formData.newPurchasePrice}
            onChange={(e) => handleNumberInput('newPurchasePrice', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
          />
        </div>
      </div>

      <div className="divider"></div>

      <button type="button" className="btn btn-primary" onClick={onCalculate}>
        <Zap size={18} style={{ marginRight: '8px' }} /> Hitung Kebutuhan Modal
      </button>
    </div>
  );
};
