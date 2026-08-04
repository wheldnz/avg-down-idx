export interface PurchaseStepData {
  id: string;
  price: string;
  lots: string;
}

export interface InputFormData {
  stockCode: string;
  brokerId: string;
  customBuyFee: string;
  customSellFee: string;
  currentPrice: string;
  currentLots: string;
  purchases: PurchaseStepData[];
}

export interface DividendInputFormData {
  stockCode: string;
  currentPrice: string; // optional, or average price
  currentLots: string;
  dps: string; // Dividend Per Share
  taxPercent: string; // default 0% for domestic WPO, or 10%
}
