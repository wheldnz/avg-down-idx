import React from 'react';
import { PieChart } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { CalcResult, SimulationResult } from '../utils/calculator';
import { formatNumber, formatRupiah } from '../utils/formatters';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

interface ChartsSectionProps {
  calcResult: CalcResult;
  simResults: SimulationResult[];
  theme: 'light' | 'dark';
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ calcResult, simResults, theme }) => {
  if (!calcResult) return null;

  const textColor = theme === 'dark' ? '#EAEAEA' : '#454545';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Format data for composition chart (Doughnut)
  const labels = ['Posisi Awal', ...calcResult.purchaseDetails.map((_, i) => `Beli #${i + 1}`)];
  const dataValues = [
    calcResult.currentDetail.lots,
    ...calcResult.purchaseDetails.map(d => d.lots)
  ];
  
  const compositionData = {
    labels,
    datasets: [{
      data: dataValues,
      backgroundColor: [
        '#FFC107',
        '#FF9800',
        '#FF5722',
        '#F44336',
        '#E91E63',
        '#9C27B0',
        '#673AB7',
        '#3F51B5',
        '#2196F3',
        '#03A9F4',
        '#00BCD4'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: textColor, font: { family: "'Inter', sans-serif", size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((val / total) * 100);
            return ` ${formatNumber(val)} Lot (${percentage}%)`;
          }
        }
      }
    }
  };

  // Format data for Profit/Loss chart (Bar)
  const simLabels = simResults.map(s => s.label);
  const simDataValues = simResults.map(s => s.profitLoss);
  const simColors = simResults.map(s => s.isProfit ? '#4CAF50' : s.isLoss ? '#F44336' : '#9E9E9E');

  const plData = {
    labels: simLabels,
    datasets: [{
      label: 'Profit/Loss (Rp)',
      data: simDataValues,
      backgroundColor: simColors,
      borderRadius: 4
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${formatRupiah(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          callback: (value: any) => {
            if (value === 0) return '0';
            const abs = Math.abs(value);
            if (abs >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (abs >= 1000) return (value / 1000).toFixed(0) + 'K';
            return value;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor, maxRotation: 45, minRotation: 45 }
      }
    }
  };

  // Format data for Average Journey chart (Line)
  const journeyLabels = ['Awal', ...calcResult.purchaseDetails.map((_, i) => `+#${i + 1}`)];
  let currentShares = calcResult.currentDetail.shares;
  let currentValue = calcResult.currentDetail.transactionValue;
  const journeyDataValues = [calcResult.currentDetail.price];

  calcResult.purchaseDetails.forEach(p => {
    currentShares += p.shares;
    currentValue += p.transactionValue;
    journeyDataValues.push(Math.round(currentValue / currentShares));
  });

  const journeyData = {
    labels: journeyLabels,
    datasets: [{
      label: 'Average Price',
      data: journeyDataValues,
      borderColor: '#FFC107',
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#1A1A2E',
      pointBorderColor: '#FFC107',
      pointBorderWidth: 2,
      pointRadius: 4,
      fill: true,
      tension: 0.3
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${formatRupiah(context.raw)}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      x: {
        grid: { display: false },
        ticks: { color: textColor }
      }
    }
  };

  return (
    <div className="card animate-fade-in-up" id="charts-card">
      <div className="card-header">
        <div className="card-header-icon gold"><PieChart size={24} /></div>
        <div>
          <div className="card-header-title">Visualisasi Data</div>
          <div className="card-header-subtitle">Grafik analisis komposisi dan proyeksi</div>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="chart-box">
          <div className="chart-title">Komposisi Lot</div>
          <div className="chart-wrapper">
            <Doughnut data={compositionData} options={donutOptions} />
          </div>
        </div>
        
        <div className="chart-box">
          <div className="chart-title">Perjalanan Average</div>
          <div className="chart-wrapper">
            <Line data={journeyData} options={lineOptions} />
          </div>
        </div>
        
        <div className="chart-box full-width">
          <div className="chart-title">Proyeksi Profit & Loss</div>
          <div className="chart-wrapper">
            <Bar data={plData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};
