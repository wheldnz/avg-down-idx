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

export interface CryptoPurchaseStepData {
  id: string;
  price: string;
  coins: string;
}

export interface CryptoInputFormData {
  coinCode: string;
  brokerId: string;
  customBuyFee: string;
  customSellFee: string;
  currentPrice: string;
  currentCoins: string;
  purchases: CryptoPurchaseStepData[];
}
