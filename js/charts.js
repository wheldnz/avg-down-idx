/**
 * AVG DOWN IDX — Charts Module
 * Chart.js integration for visualizations
 */

let donutChart = null;
let barChart = null;
let lineChart = null;

/**
 * Destroy all existing charts
 */
function destroyCharts() {
  if (donutChart) { donutChart.destroy(); donutChart = null; }
  if (barChart) { barChart.destroy(); barChart = null; }
  if (lineChart) { lineChart.destroy(); lineChart = null; }
}

/**
 * Get Chart.js default configuration
 */
function getChartDefaults() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    textColor: isDark ? '#A0A0B8' : '#757575',
    gridColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    bgColors: [
      '#FFC107', '#FFD54F', '#FFE082', '#FFECB3',
      '#FF9800', '#FFB74D', '#FFCC80', '#FFE0B2',
      '#795548', '#A1887F'
    ]
  };
}

/**
 * Create donut chart showing modal composition
 * @param {string} canvasId - Canvas element ID
 * @param {Object} calcResult - Calculation result
 */
function createDonutChart(canvasId, calcResult) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const defaults = getChartDefaults();

  const labels = ['Posisi Lama'];
  const data = [calcResult.currentDetail.totalOutflow];
  
  calcResult.purchaseDetails.forEach((d, i) => {
    labels.push(`Beli #${i + 1}`);
    data.push(d.totalOutflow);
  });

  if (donutChart) donutChart.destroy();

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: defaults.bgColors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1E1E2A' : '#FFFFFF',
        hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: defaults.textColor,
            font: { family: "'Inter', sans-serif", size: 11 },
            padding: 12,
            usePointStyle: true,
            pointStyleWidth: 8
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { family: "'Inter', sans-serif", size: 12 },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((val / total) * 100).toFixed(1);
              const formatted = 'Rp ' + Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return ` ${formatted} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Create bar chart comparing prices
 * @param {string} canvasId - Canvas element ID
 * @param {Object} calcResult - Calculation result
 */
function createBarChart(canvasId, calcResult) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const defaults = getChartDefaults();

  const labels = ['Avg Lama'];
  const data = [calcResult.currentDetail.price];
  const colors = ['#FFECB3'];

  calcResult.purchaseDetails.forEach((d, i) => {
    labels.push(`Beli #${i + 1}`);
    data.push(d.price);
    colors.push('#FFD54F');
  });

  labels.push('Avg Baru');
  data.push(calcResult.averagePrice);
  colors.push('#FFC107');

  labels.push('BEP');
  data.push(calcResult.bep);
  colors.push('#FF9800');

  if (barChart) barChart.destroy();

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { family: "'Inter', sans-serif", size: 12 },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return ' Rp ' + context.raw.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: defaults.textColor, font: { size: 10, family: "'Inter', sans-serif" } },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: defaults.textColor,
            font: { size: 10, family: "'JetBrains Mono', monospace" },
            callback: function(val) { return 'Rp ' + val; }
          },
          grid: { color: defaults.gridColor }
        }
      }
    }
  });
}

/**
 * Create line chart for profit/loss simulation
 * @param {string} canvasId - Canvas element ID
 * @param {Array} simResults - Simulation results array
 */
function createLineChart(canvasId, simResults) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const defaults = getChartDefaults();

  const labels = simResults.map(s => s.label);
  const data = simResults.map(s => Math.round(s.profitLoss));
  const colors = simResults.map(s => s.isProfit ? '#00C853' : s.isLoss ? '#FF1744' : '#FF9100');

  if (lineChart) lineChart.destroy();

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors,
        pointBorderColor: colors,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleFont: { family: "'Inter', sans-serif", size: 12 },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const prefix = val >= 0 ? '+' : '';
              const formatted = Math.abs(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              return ` ${prefix}Rp ${formatted}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: defaults.textColor,
            font: { size: 9, family: "'Inter', sans-serif" },
            maxRotation: 45,
            minRotation: 45
          },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: defaults.textColor,
            font: { size: 10, family: "'JetBrains Mono', monospace" },
            callback: function(val) {
              if (val === 0) return '0';
              const prefix = val >= 0 ? '+' : '-';
              const abs = Math.abs(val);
              if (abs >= 1000000) return prefix + (abs / 1000000).toFixed(1) + 'jt';
              if (abs >= 1000) return prefix + (abs / 1000).toFixed(0) + 'rb';
              return prefix + abs;
            }
          },
          grid: { color: defaults.gridColor }
        }
      }
    }
  });
}

export {
  destroyCharts,
  createDonutChart,
  createBarChart,
  createLineChart
};
