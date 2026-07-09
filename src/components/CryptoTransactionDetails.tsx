import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CryptoCalcResult } from '../utils/calculator';
import { formatNumber, formatRupiah } from '../utils/formatters';

interface CryptoTransactionDetailsProps {
  calcResult: CryptoCalcResult;
}

export const CryptoTransactionDetails: React.FC<CryptoTransactionDetailsProps> = ({ calcResult }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!calcResult) return null;

  return (
    <div className="card animate-fade-in-up mt-4">
      <div 
        className="card-header" 
        style={{ cursor: 'pointer', borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none', paddingBottom: isExpanded ? '1rem' : '0' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="card-header-icon" style={{ background: 'rgba(255, 193, 7, 0.1)', color: 'var(--gold)' }}>📋</div>
          <div>
            <div className="card-header-title" style={{ fontSize: '1rem' }}>Detail Transaksi</div>
          </div>
        </div>
        <div>
          {isExpanded ? <ChevronUp size={20} className="text-secondary" /> : <ChevronDown size={20} className="text-secondary" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="transaction-details mt-4">
          <div className="transaction-item">
            <div className="transaction-header">
              <span className="transaction-badge badge-current">Awal</span>
              <span className="transaction-price">{formatRupiah(calcResult.currentDetail.price)}</span>
            </div>
            <div className="transaction-body">
              <div className="transaction-stat">
                <span className="stat-label">Jumlah</span>
                <span className="stat-value">{formatNumber(calcResult.currentDetail.coins)} Koin</span>
              </div>
              <div className="transaction-stat">
                <span className="stat-label">Total Beli</span>
                <span className="stat-value">{formatRupiah(calcResult.currentDetail.transactionValue)}</span>
              </div>
              <div className="transaction-stat">
                <span className="stat-label">Fee ({calcResult.broker.buyFee}%)</span>
                <span className="stat-value text-danger">{formatRupiah(calcResult.currentDetail.brokerFee)}</span>
              </div>
              <div className="transaction-stat highlight">
                <span className="stat-label">Modal Keluar</span>
                <span className="stat-value">{formatRupiah(calcResult.currentDetail.totalOutflow)}</span>
              </div>
            </div>
          </div>
          
          {calcResult.purchaseDetails.map((detail, index) => (
            <div className="transaction-item" key={index}>
              <div className="transaction-header">
                <span className="transaction-badge badge-purchase">Beli #{index + 1}</span>
                <span className="transaction-price">{formatRupiah(detail.price)}</span>
              </div>
              <div className="transaction-body">
                <div className="transaction-stat">
                  <span className="stat-label">Jumlah</span>
                  <span className="stat-value">{formatNumber(detail.coins)} Koin</span>
                </div>
                <div className="transaction-stat">
                  <span className="stat-label">Total Beli</span>
                  <span className="stat-value">{formatRupiah(detail.transactionValue)}</span>
                </div>
                <div className="transaction-stat">
                  <span className="stat-label">Fee ({calcResult.broker.buyFee}%)</span>
                  <span className="stat-value text-danger">{formatRupiah(detail.brokerFee)}</span>
                </div>
                <div className="transaction-stat highlight">
                  <span className="stat-label">Modal Keluar</span>
                  <span className="stat-value">{formatRupiah(detail.totalOutflow)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
