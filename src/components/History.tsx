import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Calculator, Target, DollarSign } from 'lucide-react';
import { HistoryItem, HistoryType } from '../utils/storage';
import { formatRupiah, formatDate, formatNumber } from '../utils/formatters';

interface HistoryProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const History: React.FC<HistoryProps> = ({ history, onLoad, onDelete, onClear }) => {
  const [activeTab, setActiveTab] = useState<HistoryType>('regular');

  if (history.length === 0) return null;

  const filteredHistory = history.filter(item => (item.type || 'regular') === activeTab);

  return (
    <div className="card animate-fade-in-up mt-4" id="history-card">
      <div className="card-header">
        <div className="card-header-icon gold">🕰️</div>
        <div>
          <div className="card-header-title">Riwayat Kalkulasi</div>
          <div className="card-header-subtitle">Daftar riwayat berdasarkan kategori kalkulator</div>
        </div>
      </div>

      <div className="flex gap-2 my-3 border-b border-border pb-2 overflow-x-auto">
        <button
          className={`btn btn-sm ${activeTab === 'regular' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('regular')}
        >
          <Calculator size={14} className="mr-1 inline" /> Kalkulator Standar ({history.filter(i => (i.type || 'regular') === 'regular').length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'target' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('target')}
        >
          <Target size={14} className="mr-1 inline" /> Target Average ({history.filter(i => i.type === 'target').length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'dividend' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('dividend')}
        >
          <DollarSign size={14} className="mr-1 inline" /> Dividen ({history.filter(i => i.type === 'dividend').length})
        </button>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-6 text-tertiary text-sm">
          Belum ada riwayat untuk kategori ini.
        </div>
      ) : (
        <div className="history-list" id="history-list">
          {filteredHistory.map(item => (
            <div key={item.id} className="history-item premium-glass mb-3">
              <div className="history-item-header">
                <span className="history-item-title flex items-center gap-1 font-semibold text-primary">
                  {item.type === 'target' ? (
                    <><Target size={14} className="text-gold" /> Target Avg {item.stockCode ? `(${item.stockCode})` : ''}</>
                  ) : item.type === 'dividend' ? (
                    <><DollarSign size={14} className="text-success" /> Dividen {item.stockCode ? `(${item.stockCode})` : ''}</>
                  ) : (
                    <>
                      {item.mode === 'up' ? <><ArrowUp size={14} className="text-success"/> Average Up</> : <><ArrowDown size={14} className="text-danger"/> Average Down</>}
                      {item.stockCode ? ` (${item.stockCode})` : ''}
                    </>
                  )}
                </span>
                <span className="history-item-date text-xs text-tertiary">{formatDate(item.timestamp)}</span>
              </div>

              <div className="history-item-body">
                {item.type === 'target' && item.targetDetails ? (
                  <>
                    <div className="history-stat">
                      <span className="history-stat-label">Target Avg</span>
                      <span className="history-stat-value">{formatRupiah(item.targetDetails.targetAverage)}</span>
                    </div>
                    <div className="history-stat">
                      <span className="history-stat-label">Butuh Beli</span>
                      <span className="history-stat-value text-gold">{formatNumber(item.targetDetails.requiredLots)} Lot</span>
                    </div>
                    <div className="history-stat">
                      <span className="history-stat-label">Modal Butuh</span>
                      <span className="history-stat-value">{formatRupiah(item.targetDetails.requiredCapital)}</span>
                    </div>
                  </>
                ) : item.type === 'dividend' && item.dividendDetails ? (
                  <>
                    <div className="history-stat">
                      <span className="history-stat-label">Total Dividen</span>
                      <span className="history-stat-value text-success">{formatRupiah(item.dividendDetails.netDividend)}</span>
                    </div>
                    <div className="history-stat">
                      <span className="history-stat-label">Yield</span>
                      <span className="history-stat-value text-gold">{item.dividendDetails.dividendYield.toFixed(2)}%</span>
                    </div>
                    <div className="history-stat">
                      <span className="history-stat-label">Avg Efektif</span>
                      <span className="history-stat-value">{formatRupiah(item.dividendDetails.adjustedAverage)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="history-stat">
                      <span className="history-stat-label">Avg Baru</span>
                      <span className="history-stat-value">{formatRupiah(item.regularResult?.averagePrice || item.result?.averagePrice || 0)}</span>
                    </div>
                    <div className="history-stat">
                      <span className="history-stat-label">Modal</span>
                      <span className="history-stat-value text-gold">{formatRupiah(item.regularResult?.totalModal || item.result?.totalModal || 0)}</span>
                    </div>
                  </>
                )}
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
      )}

      <div className="mt-4 text-center">
        <button className="btn btn-danger-text" id="btn-clear-history" onClick={onClear}>
          Hapus Semua Riwayat
        </button>
      </div>
    </div>
  );
};
