/**
 * AVG DOWN IDX — Calculator Engine
 * Pure calculation functions — no side effects, no DOM manipulation
 * Reference: REFERENCE.md for formulas and test cases
 */

/**
 * Default simulation percentages
 */
const SIM_PERCENTAGES = [
  { label: "CL -20%", value: -20 },
  { label: "CL -15%", value: -15 },
  { label: "CL -10%", value: -10 },
  { label: "CL -7%",  value: -7  },
  { label: "CL -5%",  value: -5  },
  { label: "CL -3%",  value: -3  },
  { label: "CL -2%",  value: -2  },
  { label: "TP +2%",  value: 2   },
  { label: "TP +3%",  value: 3   },
  { label: "TP +5%",  value: 5   },
  { label: "TP +7%",  value: 7   },
  { label: "TP +10%", value: 10  },
  { label: "TP +15%", value: 15  },
  { label: "TP +20%", value: 20  },
];

/**
 * Calculate transaction detail for a single buy
 * @param {number} price - Price per share (Rp)
 * @param {number} lots - Number of lots (1 lot = 100 shares)
 * @param {number} buyFeePercent - Broker buy fee (%)
 * @returns {Object} Transaction detail
 */
function calculateTransaction(price, lots, buyFeePercent) {
  const shares = lots * 100;
  const transactionValue = price * shares;
  const brokerFee = transactionValue * (buyFeePercent / 100);
  const totalOutflow = transactionValue + brokerFee;

  return {
    price,
    lots,
    shares,
    transactionValue,
    brokerFee,
    totalOutflow
  };
}

/**
 * Calculate new average price and all related values
 * @param {Object} currentPosition - { price: number, lots: number }
 * @param {Array} newPurchases - [{ price: number, lots: number }, ...]
 * @param {Object} broker - { buyFee: number, sellFee: number }
 * @returns {Object} Complete calculation result
 */
function calculateAverage(currentPosition, newPurchases, broker) {
  // Current position detail
  const currentDetail = calculateTransaction(
    currentPosition.price,
    currentPosition.lots,
    broker.buyFee
  );

  // New purchases details
  const purchaseDetails = newPurchases.map(p =>
    calculateTransaction(p.price, p.lots, broker.buyFee)
  );

  // Totals
  const totalLots = currentPosition.lots + newPurchases.reduce((sum, p) => sum + p.lots, 0);
  const totalShares = totalLots * 100;

  // Average price (WITHOUT fee — standard practice)
  const totalValueNoFee = currentDetail.transactionValue +
    purchaseDetails.reduce((sum, d) => sum + d.transactionValue, 0);
  const averagePrice = totalValueNoFee / totalShares;

  // Total modal (WITH fee — all outflows)
  const totalModal = currentDetail.totalOutflow +
    purchaseDetails.reduce((sum, d) => sum + d.totalOutflow, 0);

  // Total fees
  const totalFee = currentDetail.brokerFee +
    purchaseDetails.reduce((sum, d) => sum + d.brokerFee, 0);

  // BEP (Break Even Price) — must cover sell fee too
  // BEP × totalShares × (1 - sellFee/100) = totalModal
  const bep = totalModal / (totalShares * (1 - broker.sellFee / 100));

  return {
    currentDetail,
    purchaseDetails,
    averagePrice: Math.round(averagePrice),
    averagePriceExact: averagePrice,
    totalLots,
    totalShares,
    totalModal,
    totalFee,
    totalValueNoFee,
    bep: Math.ceil(bep),
    bepExact: bep,
    broker: { ...broker }
  };
}

/**
 * Simulate profit/loss at various target prices
 * @param {Object} calcResult - Result from calculateAverage()
 * @param {number[]} [customPercentages] - Optional custom percentage array
 * @returns {Array} Array of simulation results
 */
function simulateProfitLoss(calcResult, customPercentages) {
  const percentages = customPercentages || SIM_PERCENTAGES.map(p => p.value);
  const labels = customPercentages
    ? customPercentages.map(p => p > 0 ? `TP +${p}%` : `CL ${p}%`)
    : SIM_PERCENTAGES.map(p => p.label);

  return percentages.map((pct, i) => {
    const targetPrice = Math.round(calcResult.averagePriceExact * (1 + pct / 100));
    const sellValue = targetPrice * calcResult.totalShares;
    const sellFee = sellValue * (calcResult.broker.sellFee / 100);
    const netSellValue = sellValue - sellFee;
    const profitLoss = netSellValue - calcResult.totalModal;
    const profitLossPercent = (profitLoss / calcResult.totalModal) * 100;

    return {
      label: labels[i],
      percentage: pct,
      targetPrice,
      sellValue,
      sellFee,
      netSellValue,
      profitLoss,
      profitLossPercent,
      isProfit: profitLoss > 0,
      isLoss: profitLoss < 0
    };
  });
}

/**
 * Simulate at a specific target price
 * @param {Object} calcResult - Result from calculateAverage()
 * @param {number} targetPrice - Target sell price
 * @returns {Object} Simulation result
 */
function simulateAtPrice(calcResult, targetPrice) {
  const sellValue = targetPrice * calcResult.totalShares;
  const sellFee = sellValue * (calcResult.broker.sellFee / 100);
  const netSellValue = sellValue - sellFee;
  const profitLoss = netSellValue - calcResult.totalModal;
  const profitLossPercent = (profitLoss / calcResult.totalModal) * 100;
  const priceChangePercent = ((targetPrice - calcResult.averagePriceExact) / calcResult.averagePriceExact) * 100;

  return {
    targetPrice,
    sellValue,
    sellFee,
    netSellValue,
    profitLoss,
    profitLossPercent,
    priceChangePercent,
    isProfit: profitLoss > 0,
    isLoss: profitLoss < 0
  };
}

export {
  SIM_PERCENTAGES,
  calculateTransaction,
  calculateAverage,
  simulateProfitLoss,
  simulateAtPrice
};
