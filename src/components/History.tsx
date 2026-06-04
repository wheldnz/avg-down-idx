import React from 'react';
import { History as HistoryIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { HistoryItem } from '../utils/storage';
import { formatRupiah, formatDate } from '../utils/formatters';

interface HistoryProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onLoad, onDelete, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="card animate-fade-in-up" id="history-card">
      <div className="card-header">
        <div className="card-header-icon gold"><HistoryIcon size={24} /></div>
        <div>
          <div className="card-header-title">Riwayat Kalkulasi</div>
          <div className="card-header-subtitle">Data kalkulasi terakhir Anda</div>
        </div>
      </div>
      
      <div className="history-list" id="history-list">
        {history.map(item => (
          <div key={item.id} className="history-item">
            <div className="history-item-header">
              <span className="history-item-title flex items-center gap-1">
                {item.mode === 'up' ? <><ArrowUp size={14}/> Average Up</> : <><ArrowDown size={14}/> Average Down</>} {item.stockCode ? `(${item.stockCode})` : ''}
              </span>
              <span className="history-item-date">{formatDate(item.timestamp)}</span>
            </div>
            <div className="history-item-details">
              <span>Avg Baru: <strong>{formatRupiah(item.result.averagePrice)}</strong></span>
              <span>Modal: <strong>{formatRupiah(item.result.totalModal)}</strong></span>
            </div>
            <div className="history-item-actions">
              <button className="btn btn-secondary history-btn-load" onClick={() => onLoad(item)}>
                Muat Ulang
              </button>
              <button className="btn btn-danger-text history-btn-delete" onClick={() => onDelete(item.id)}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="btn btn-danger-text" id="btn-clear-history" onClick={onClear}>
          Hapus Semua Riwayat
        </button>
      </div>
    </div>
  );
};
