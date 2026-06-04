import React from 'react';
import { CalcResult } from '../utils/calculator';
import { formatNumber, formatRupiah } from '../utils/formatters';

interface TransactionDetailsProps {
  calcResult: CalcResult;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ calcResult }) => {
  if (!calcResult) return null;

  return (
    <div className="card animate-fade-in-up" id="details-card">
      <div className="card-header">
        <div className="card-header-icon gold">📑</div>
        <div>
          <div className="card-header-title">Rincian Transaksi</div>
          <div className="card-header-subtitle">Detail nilai transaksi dan fee broker</div>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table" id="details-table">
          <thead>
            <tr>
              <th>Tahap</th>
              <th>Harga</th>
              <th>Lot (Lbr)</th>
              <th className="text-right">Nilai (Rp)</th>
              <th className="text-right">Fee (Rp)</th>
              <th className="text-right">Total (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Posisi Awal</td>
              <td>{formatRupiah(calcResult.currentDetail.price)}</td>
              <td>{formatNumber(calcResult.currentDetail.lots)} ({formatNumber(calcResult.currentDetail.shares)})</td>
              <td className="text-right">{formatRupiah(calcResult.currentDetail.transactionValue)}</td>
              <td className="text-right text-danger">{formatRupiah(calcResult.currentDetail.brokerFee)}</td>
              <td className="text-right bold">{formatRupiah(calcResult.currentDetail.totalOutflow)}</td>
            </tr>
            {calcResult.purchaseDetails.map((p, i) => (
              <tr key={i}>
                <td>Beli #{i + 1}</td>
                <td>{formatRupiah(p.price)}</td>
                <td>{formatNumber(p.lots)} ({formatNumber(p.shares)})</td>
                <td className="text-right">{formatRupiah(p.transactionValue)}</td>
                <td className="text-right text-danger">{formatRupiah(p.brokerFee)}</td>
                <td className="text-right bold">{formatRupiah(p.totalOutflow)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}><strong>TOTAL KESELURUHAN</strong></td>
              <td><strong>{formatNumber(calcResult.totalLots)} ({formatNumber(calcResult.totalShares)})</strong></td>
              <td className="text-right"><strong>{formatRupiah(calcResult.totalValueNoFee)}</strong></td>
              <td className="text-right text-danger"><strong>{formatRupiah(calcResult.totalFee)}</strong></td>
              <td className="text-right gold bold"><strong>{formatRupiah(calcResult.totalModal)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
