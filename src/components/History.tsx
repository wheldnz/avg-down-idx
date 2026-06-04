import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
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
        <div className="card-header-icon gold">🕰️</div>
        <div>
          <div className="card-header-title">Riwayat Kalkulasi</div>
          <div className="card-header-subtitle">Data kalkulasi terakhir Anda</div>
        </div>
      </div>
      
      <div className="history-list" id="history-list">
        {history.map(item => (
          <div key={item.id} className="history-item premium-glass mb-3">
            <div className="history-item-header">
              <span className="history-item-title flex items-center gap-1 font-semibold text-primary">
                {item.mode === 'up' ? <><ArrowUp size={14} className="text-success"/> Average Up</> : <><ArrowDown size={14} className="text-danger"/> Average Down</>} {item.stockCode ? `(${item.stockCode})` : ''}
              </span>
              <span className="history-item-date text-xs text-tertiary">{formatDate(item.timestamp)}</span>
            </div>
            <div className="history-item-body">
              <div className="history-stat">
                <span className="history-stat-label">Avg Baru</span>
                <span className="history-stat-value">{formatRupiah(item.result.averagePrice)}</span>
              </div>
              <div className="history-stat">
                <span className="history-stat-label">Modal</span>
                <span className="history-stat-value text-gold">{formatRupiah(item.result.totalModal)}</span>
              </div>
            </div>
            <div className="history-item-actions flex gap-2">
              <button className="btn btn-primary btn-sm flex-1" onClick={() => onLoad(item)}>
                Muat Ulang
              </button>
              <button className="btn btn-outline btn-sm flex-1" onClick={() => onDelete(item.id)}>
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
