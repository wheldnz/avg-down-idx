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
