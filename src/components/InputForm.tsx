import React from 'react';
import { Pin, Wallet, Zap, X } from 'lucide-react';
import { getBrokers, getBrokerById } from '../utils/brokers';
import { formatNumber, parseFormattedNumber, formatRupiah } from '../utils/formatters';
import { InputFormData, PurchaseStepData } from '../types';

interface InputFormProps {
  mode: 'down' | 'up';
  formData: InputFormData;
  setFormData: React.Dispatch<React.SetStateAction<InputFormData>>;
  onCalculate: () => void;
  onReset: () => void;
}

export const InputForm: React.FC<InputFormProps> = ({ mode, formData, setFormData, onCalculate, onReset }) => {
  const brokers = getBrokers();
  const MAX_STEPS = 10;
  
  const currentBroker = getBrokerById(formData.brokerId);
  const isCustom = formData.brokerId === 'custom';

  const buyFee = isCustom ? formData.customBuyFee : (currentBroker?.buyFee.toString() || '0.15');
  const sellFee = isCustom ? formData.customSellFee : (currentBroker?.sellFee.toString() || '0.25');

  const handleStockCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4);
    setFormData(prev => ({ ...prev, stockCode: val }));
  };

  const handleNumberInput = (field: keyof InputFormData, value: string) => {
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

  const handlePurchaseInput = (id: string, field: keyof PurchaseStepData, value: string) => {
    const rawValue = value.replace(/\./g, '').replace(/[^\d]/g, '');
    let formatted = '';
    if (rawValue !== '') {
      const num = parseInt(rawValue, 10);
      if (!isNaN(num)) formatted = formatNumber(num);
    }
    setFormData(prev => ({
      ...prev,
      purchases: prev.purchases.map(p => p.id === id ? { ...p, [field]: formatted } : p)
    }));
  };

  const handleDecimalInput = (field: 'customBuyFee' | 'customSellFee', value: string) => {
    let val = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    if (parts[1] && parts[1].length > 2) val = parts[0] + '.' + parts[1].substring(0, 2);
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const addPurchaseStep = () => {
    if (formData.purchases.length >= MAX_STEPS) return;
    setFormData(prev => ({
      ...prev,
      purchases: [...prev.purchases, { id: Date.now().toString(), price: '', lots: '' }]
    }));
  };

  const removePurchaseStep = (id: string) => {
    setFormData(prev => ({
      ...prev,
      purchases: prev.purchases.filter(p => p.id !== id)
    }));
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
    <div className="card animate-fade-in-up" id="input-card">
      <div className="card-header">
        <div className="card-header-icon gold">📝</div>
        <div>
          <div className="card-header-title" id="mode-title">
            {mode === 'up' ? 'Average Up' : 'Average Down'}
          </div>
          <div className="card-header-subtitle">Masukkan data transaksi saham</div>
        </div>
      </div>

      <div className="input-group full-width mb-4">
        <label className="input-label" htmlFor="stock-code">Kode Saham (Opsional)</label>
        <input 
          type="text" 
          id="stock-code" 
          className="input-field stock-code-input" 
          placeholder="BBCA" 
          maxLength={4} 
          autoComplete="off"
          value={formData.stockCode}
          onChange={handleStockCodeChange}
        />
      </div>

      <div className="input-group full-width mb-2">
        <label className="input-label" htmlFor="broker-select">Pilih Broker</label>
        <div className="select-wrapper">
          <select 
            id="broker-select" 
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
      
      <div className="fee-badges" id="fee-badges">
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
        <div className="custom-fee-row visible" id="custom-fee-row">
          <div className="input-group">
            <label className="input-label" htmlFor="custom-buy-fee">Fee Beli (%)</label>
            <input 
              type="text" 
              id="custom-buy-fee" 
              className="input-field" 
              inputMode="decimal" 
              autoComplete="off"
              value={formData.customBuyFee}
              onChange={(e) => handleDecimalInput('customBuyFee', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="custom-sell-fee">Fee Jual (%)</label>
            <input 
              type="text" 
              id="custom-sell-fee" 
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
          <label className="input-label" htmlFor="avg-price">Harga Rata-Rata</label>
          <input 
            type="text" 
            id="avg-price" 
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
          <label className="input-label" htmlFor="avg-lots">Jumlah Lot</label>
          <input 
            type="text" 
            id="avg-lots" 
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

      <div id="purchase-steps" className="purchase-steps">
        {formData.purchases.map((step, index) => {
          const stepNum = index + 1;
          const preview = getModalPreview(step.price, step.lots);
          const hasValue = parseFormattedNumber(step.price) > 0 && parseFormattedNumber(step.lots) > 0;

          return (
            <div key={step.id} className="purchase-step animate-fade-in-up">
              <div className="step-label">
                <span className="step-number">{stepNum}</span>
                <span className="step-text">Pembelian #{stepNum}</span>
              </div>
              <button 
                type="button" 
                className="btn btn-danger-text purchase-step-remove" 
                onClick={() => removePurchaseStep(step.id)}
                aria-label={`Hapus pembelian #${stepNum}`}
              >
                <X size={16} />
              </button>
              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Harga Beli</label>
                  <input 
                    type="text" 
                    className="input-field number-input" 
                    inputMode="numeric" 
                    placeholder="0" 
                    autoComplete="off"
                    value={step.price}
                    onChange={(e) => handlePurchaseInput(step.id, 'price', e.target.value)}
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
                    value={step.lots}
                    onChange={(e) => handlePurchaseInput(step.id, 'lots', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                  />
                </div>
              </div>
              <div className={`modal-preview ${hasValue ? 'has-value' : ''}`}>
                <span className="modal-preview-icon"><Wallet size={16} /></span>
                <span className="modal-preview-text">Modal: <strong>{preview}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <button 
        type="button" 
        className="btn-add-step" 
        onClick={addPurchaseStep}
        disabled={formData.purchases.length >= MAX_STEPS}
      >
        {formData.purchases.length >= MAX_STEPS 
          ? `Maksimum ${MAX_STEPS} pembelian tercapai` 
          : `+ Tambah Pembelian (${formData.purchases.length}/${MAX_STEPS})`}
      </button>

      <div className="divider"></div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={onCalculate}>
          <Zap size={18} style={{ marginRight: '8px' }} /> Hitung Average
        </button>
        <button type="button" className="btn" style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }} onClick={onReset} aria-label="Reset form">
          Reset
        </button>
      </div>
    </div>
  );
};
