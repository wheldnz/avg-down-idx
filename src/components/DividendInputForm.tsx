import React from 'react';
import { DollarSign, RotateCcw, Award } from 'lucide-react';
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
    <div className="card animate-fade-in-up">
      <div className="card-header">
        <div className="card-header-icon gold">
          <Award size={20} />
        </div>
        <div>
          <div className="card-header-title">Kalkulator Dividen & Yield</div>
          <div className="card-header-subtitle">Hitung potensi pendapatan dividen dan penyesuaian modal</div>
        </div>
      </div>

      <div className="form-group mt-4">
        <label className="form-label">Kode Saham (Opsional)</label>
        <input
          type="text"
          className="form-control text-uppercase"
          placeholder="Contoh: BBCA, TLKM, UNVR"
          value={formData.stockCode}
          onChange={e => handleChange('stockCode', e.target.value.toUpperCase())}
          maxLength={6}
        />
      </div>

      <div className="grid-2-cols">
        <div className="form-group">
          <label className="form-label">Jumlah Lot Saham <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            placeholder="Contoh: 100"
            value={formData.currentLots}
            onChange={e => handleChange('currentLots', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Dividen per Lembar (DPS) <span className="text-danger">*</span></label>
          <div className="input-group">
            <span className="input-prefix">Rp</span>
            <input
              type="text"
              className="form-control"
              placeholder="Contoh: 350"
              value={formData.dps}
              onChange={e => handleChange('dps', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid-2-cols">
        <div className="form-group">
          <label className="form-label">Harga Rata-Rata Beli (Average)</label>
          <div className="input-group">
            <span className="input-prefix">Rp</span>
            <input
              type="text"
              className="form-control"
              placeholder="Contoh: 8500"
              value={formData.currentPrice}
              onChange={e => handleChange('currentPrice', e.target.value)}
            />
          </div>
          <span className="form-help">Diperlukan untuk menghitung Dividend Yield %</span>
        </div>

        <div className="form-group">
          <label className="form-label">Pajak Dividen (PPh)</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="0"
              value={formData.taxPercent}
              onChange={e => handleChange('taxPercent', e.target.value)}
            />
            <span className="input-suffix">%</span>
          </div>
          <span className="form-help">0% (WPO Dalam Negeri) / 10% jika kena PPh</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="btn btn-primary flex-1" onClick={onCalculate}>
          <DollarSign size={18} /> Hitung Dividen
        </button>
        <button className="btn btn-outline" onClick={onReset} title="Reset Form">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};
