import { Broker } from './brokers';

export const SIM_PERCENTAGES = [
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

export interface Position {
  price: number;
  lots: number;
}

export interface TransactionDetail {
  price: number;
  lots: number;
  shares: number;
  transactionValue: number;
  brokerFee: number;
  totalOutflow: number;
}

export interface CalcResult {
  currentDetail: TransactionDetail;
  purchaseDetails: TransactionDetail[];
  averagePrice: number;
  averagePriceExact: number;
  totalLots: number;
  totalShares: number;
  totalModal: number;
  totalFee: number;
  totalValueNoFee: number;
  bep: number;
  bepExact: number;
  broker: Broker;
}

export interface SimulationResult {
  label?: string;
  percentage?: number;
  targetPrice: number;
  sellValue: number;
  sellFee: number;
  netSellValue: number;
  profitLoss: number;
  profitLossPercent: number;
  priceChangePercent?: number;
  isProfit: boolean;
  isLoss: boolean;
}

export function calculateTransaction(price: number, lots: number, buyFeePercent: number): TransactionDetail {
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

export function calculateAverage(currentPosition: Position, newPurchases: Position[], broker: Broker): CalcResult {
  const currentDetail = calculateTransaction(
    currentPosition.price,
    currentPosition.lots,
    broker.buyFee
  );

  const purchaseDetails = newPurchases.map(p =>
    calculateTransaction(p.price, p.lots, broker.buyFee)
  );

  const totalLots = currentPosition.lots + newPurchases.reduce((sum, p) => sum + p.lots, 0);
  const totalShares = totalLots * 100;

  const totalValueNoFee = currentDetail.transactionValue +
    purchaseDetails.reduce((sum, d) => sum + d.transactionValue, 0);
  const averagePrice = totalValueNoFee / totalShares;

  const totalModal = currentDetail.totalOutflow +
    purchaseDetails.reduce((sum, d) => sum + d.totalOutflow, 0);

  const totalFee = currentDetail.brokerFee +
    purchaseDetails.reduce((sum, d) => sum + d.brokerFee, 0);

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

export function simulateProfitLoss(calcResult: CalcResult, customPercentages?: number[]): SimulationResult[] {
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

export function simulateAtPrice(calcResult: CalcResult, targetPrice: number): SimulationResult {
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

export interface TargetCalcResult {
  requiredLots: number;
  requiredShares: number;
  requiredCapital: number;
  requiredFee: number;
  totalNewLots: number;
  totalNewShares: number;
  totalNewCapital: number;
  finalAverage: number;
  finalAverageExact: number;
  currentDetail: TransactionDetail;
  newPurchaseDetail: TransactionDetail;
  broker: Broker;
  isValid: boolean;
  errorMessage?: string;
}

export function calculateTargetAverage(
  currentPosition: Position, 
  targetAverage: number, 
  newPrice: number, 
  broker: Broker,
  mode: 'up' | 'down'
): TargetCalcResult {
  const P1 = currentPosition.price;
  const L1 = currentPosition.lots;
  const T = targetAverage;
  const P2 = newPrice;
  
  const currentDetail = calculateTransaction(P1, L1, broker.buyFee);
  
  let isValid = true;
  let errorMessage = '';
  
  if (mode === 'down') {
    if (T >= P1) {
      isValid = false;
      errorMessage = 'Target Average harus lebih rendah dari Harga Saat Ini.';
    } else if (T <= P2) {
      isValid = false;
      errorMessage = 'Target Average harus lebih tinggi dari Harga Beli Baru.';
    }
  } else {
    if (T <= P1) {
      isValid = false;
      errorMessage = 'Target Average harus lebih tinggi dari Harga Saat Ini.';
    } else if (T >= P2) {
      isValid = false;
      errorMessage = 'Target Average harus lebih rendah dari Harga Beli Baru.';
    }
  }
  
  let requiredLots = 0;
  if (isValid) {
    requiredLots = Math.ceil(Math.abs(L1 * (P1 - T) / (T - P2)));
  }
  
  const newPurchaseDetail = calculateTransaction(P2, requiredLots, broker.buyFee);
  
  const totalValueNoFee = currentDetail.transactionValue + newPurchaseDetail.transactionValue;
  const totalShares = currentDetail.shares + newPurchaseDetail.shares;
  const finalAverageExact = totalShares > 0 ? totalValueNoFee / totalShares : 0;
  const totalNewCapital = currentDetail.totalOutflow + newPurchaseDetail.totalOutflow;

  return {
    requiredLots,
    requiredShares: newPurchaseDetail.shares,
    requiredCapital: newPurchaseDetail.totalOutflow,
    requiredFee: newPurchaseDetail.brokerFee,
    totalNewLots: L1 + requiredLots,
    totalNewShares: totalShares,
    totalNewCapital,
    finalAverage: Math.round(finalAverageExact),
    finalAverageExact,
    currentDetail,
    newPurchaseDetail,
    broker: { ...broker },
    isValid,
    errorMessage
  };
}
