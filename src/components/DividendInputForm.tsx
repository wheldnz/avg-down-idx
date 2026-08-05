import React from 'react';
import { Award, DollarSign, RotateCcw, Info } from 'lucide-react';
import { DividendInputFormData } from '../types';

interface DividendInputFormProps {
  formData: DividendInputFormData;
  setFormData: React.Dispatch<React.SetStateAction<DividendInputFormData>>;
  onCalculate: () => void;
  onReset: () => void;
}

export const DividendInputForm: React.FC<DividendInputFormProps> = ({
  formData,
  setFormData,
  onCalculate,
  onReset
}) => {
  const handleChange = (field: keyof DividendInputFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="card animate-fade-in-up premium-card">
      <div className="card-header">
        <div 
          className="card-header-icon"
          style={{
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(255, 193, 7, 0.2))',
            color: '#4CAF50',
            border: '1px solid rgba(76, 175, 80, 0.3)'
          }}
        >
          <Award size={22} />
        </div>
        <div>
          <div className="card-header-title">Kalkulator Dividen & Yield</div>
          <div className="card-header-subtitle">Hitung estimasi penerimaan dividen & BEP efektif baru</div>
        </div>
      </div>

      <div 
        className="p-3 mb-4 rounded-lg flex items-start gap-2 text-xs"
        style={{
          background: 'rgba(76, 175, 80, 0.08)',
          border: '1px solid rgba(76, 175, 80, 0.2)',
          color: 'var(--text-secondary)'
        }}
      >
        <Info size={16} className="text-success flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-primary">Bebas Pajak PPh 0%:</strong> Dividen tunai bagi WPO Dalam Negeri bebas pajak selama diinvestasikan kembali di Indonesia (sesuai UU HPP).
        </div>
      </div>

      <div className="form-group mb-3">
        <label className="input-label">Kode Saham (Opsional)</label>
        <input
          type="text"
          className="input-field text-uppercase"
          placeholder="Contoh: BBCA, TLKM, UNVR"
          value={formData.stockCode}
          onChange={e => handleChange('stockCode', e.target.value.toUpperCase())}
          maxLength={6}
        />
      </div>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Jumlah Kepemilikan (Lot) <span className="text-danger">*</span></label>
          <input
            type="text"
            className="input-field"
            placeholder="Contoh: 100"
            value={formData.currentLots}
            onChange={e => handleChange('currentLots', e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Dividen / Lembar (DPS) <span className="text-danger">*</span></label>
          <input
            type="text"
            className="input-field"
            placeholder="Rp per lembar"
            value={formData.dps}
            onChange={e => handleChange('dps', e.target.value)}
          />
        </div>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Average Beli saat Ini</label>
          <input
            type="text"
            className="input-field"
            placeholder="Rp harga rata-rata"
            value={formData.currentPrice}
            onChange={e => handleChange('currentPrice', e.target.value)}
          />
          <span className="input-hint">Dipakai menghitung Dividend Yield & Average baru</span>
        </div>

        <div className="input-group">
          <label className="input-label">Pajak Dividen (PPh %)</label>
          <input
            type="text"
            className="input-field"
            placeholder="0"
            value={formData.taxPercent}
            onChange={e => handleChange('taxPercent', e.target.value)}
          />
          <span className="input-hint">Isi 0% (WPO DN) atau 10%</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          className="btn btn-primary flex-1 py-3 font-bold" 
          onClick={onCalculate}
          style={{
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            borderColor: '#388E3C',
            boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)'
          }}
        >
          <DollarSign size={18} /> Hitung Dividen
        </button>
        <button className="btn btn-outline px-3" onClick={onReset} title="Reset Form">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};
