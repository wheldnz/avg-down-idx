import React from 'react';
import { Pin, Wallet, Zap, X } from 'lucide-react';
import { getCryptoBrokers, getCryptoBrokerById } from '../utils/brokers';
import { formatRupiah } from '../utils/formatters';
import { CryptoInputFormData, CryptoPurchaseStepData } from '../types';

interface CryptoInputFormProps {
  mode: 'down' | 'up';
  formData: CryptoInputFormData;
  setFormData: React.Dispatch<React.SetStateAction<CryptoInputFormData>>;
  onCalculate: () => void;
  onReset: () => void;
}

export const CryptoInputForm: React.FC<CryptoInputFormProps> = ({ mode, formData, setFormData, onCalculate, onReset }) => {
  const brokers = getCryptoBrokers();
  const MAX_STEPS = 10;
  
  const currentBroker = getCryptoBrokerById(formData.brokerId);
  const isCustom = formData.brokerId === 'custom_crypto';

  const buyFee = isCustom ? formData.customBuyFee : (currentBroker?.buyFee.toString() || '0.10');
  const sellFee = isCustom ? formData.customSellFee : (currentBroker?.sellFee.toString() || '0.10');

  const handleCoinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').substring(0, 10);
    setFormData(prev => ({ ...prev, coinCode: val }));
  };

  const handleDecimalInputForState = (field: keyof CryptoInputFormData, value: string) => {
    let val = value.replace(/[^\d.,]/g, '').replace(',', '.');
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handlePurchaseDecimalInput = (id: string, field: keyof CryptoPurchaseStepData, value: string) => {
    let val = value.replace(/[^\d.,]/g, '').replace(',', '.');
    setFormData(prev => ({
      ...prev,
      purchases: prev.purchases.map(p => p.id === id ? { ...p, [field]: val } : p)
    }));
  };

  const handleFeeDecimalInput = (field: 'customBuyFee' | 'customSellFee', value: string) => {
    let val = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const parts = val.split('.');
    if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
    if (parts[1] && parts[1].length > 4) val = parts[0] + '.' + parts[1].substring(0, 4);
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const addPurchaseStep = () => {
    if (formData.purchases.length >= MAX_STEPS) return;
    setFormData(prev => ({
      ...prev,
      purchases: [...prev.purchases, { id: Date.now().toString(), price: '', coins: '' }]
    }));
  };

  const removePurchaseStep = (id: string) => {
    setFormData(prev => ({
      ...prev,
      purchases: prev.purchases.filter(p => p.id !== id)
    }));
  };

  const getModalPreview = (priceStr: string, coinsStr: string) => {
    const price = parseFloat(priceStr) || 0;
    const coins = parseFloat(coinsStr) || 0;
    if (price > 0 && coins > 0) {
      return formatRupiah(price * coins);
    }
    return 'Rp 0';
  };

  const currentPreview = getModalPreview(formData.currentPrice, formData.currentCoins);
  const currentHasValue = (parseFloat(formData.currentPrice) || 0) > 0 && (parseFloat(formData.currentCoins) || 0) > 0;

  return (
    <div className="card animate-fade-in-up" id="input-card">
      <div className="card-header">
        <div className="card-header-icon gold">₿</div>
        <div>
          <div className="card-header-title" id="mode-title">
            {mode === 'up' ? 'Average Up (Crypto)' : 'Average Down (Crypto)'}
          </div>
          <div className="card-header-subtitle">Masukkan data aset Crypto Anda</div>
        </div>
      </div>

      <div className="input-group full-width mb-4">
        <label className="input-label" htmlFor="coin-code">Koin / Token (Opsional)</label>
        <input 
          type="text" 
          id="coin-code" 
          className="input-field stock-code-input" 
          placeholder="BTC" 
          maxLength={10} 
          autoComplete="off"
          value={formData.coinCode}
          onChange={handleCoinCodeChange}
        />
      </div>

      <div className="input-group full-width mb-2">
        <label className="input-label" htmlFor="broker-select">Pilih Exchange</label>
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
              onChange={(e) => handleFeeDecimalInput('customBuyFee', e.target.value)}
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
              onChange={(e) => handleFeeDecimalInput('customSellFee', e.target.value)}
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
          <label className="input-label" htmlFor="avg-price">Harga Rata-Rata (Rp)</label>
          <input 
            type="text" 
            id="avg-price" 
            className="input-field number-input" 
            inputMode="decimal" 
            placeholder="0" 
            autoComplete="off"
            value={formData.currentPrice}
            onChange={(e) => handleDecimalInputForState('currentPrice', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
          />
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="avg-coins">Jumlah Koin</label>
          <input 
            type="text" 
            id="avg-coins" 
            className="input-field number-input" 
            inputMode="decimal" 
            placeholder="0" 
            autoComplete="off"
            value={formData.currentCoins}
            onChange={(e) => handleDecimalInputForState('currentCoins', e.target.value)}
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
          const preview = getModalPreview(step.price, step.coins);
          const hasValue = (parseFloat(step.price) || 0) > 0 && (parseFloat(step.coins) || 0) > 0;

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
                  <label className="input-label">Harga Beli (Rp)</label>
                  <input 
                    type="text" 
                    className="input-field number-input" 
                    inputMode="decimal" 
                    placeholder="0" 
                    autoComplete="off"
                    value={step.price}
                    onChange={(e) => handlePurchaseDecimalInput(step.id, 'price', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onCalculate()}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Jumlah Koin</label>
                  <input 
                    type="text" 
                    className="input-field number-input" 
                    inputMode="decimal" 
                    placeholder="0" 
                    autoComplete="off"
                    value={step.coins}
                    onChange={(e) => handlePurchaseDecimalInput(step.id, 'coins', e.target.value)}
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
