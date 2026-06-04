export interface Broker {
  id: string;
  name: string;
  buyFee: number;
  sellFee: number;
  description: string;
}

export const BROKERS: Broker[] = [
  {
    id: "stockbit",
    name: "Stockbit",
    buyFee: 0.15,
    sellFee: 0.25,
    description: "PT Stockbit Sekuritas"
  },
  {
    id: "ajaib",
    name: "Ajaib",
    buyFee: 0.15,
    sellFee: 0.25,
    description: "PT Ajaib Sekuritas Asia"
  },
  {
    id: "mirae",
    name: "Mirae Asset (Neo HOTS)",
    buyFee: 0.15,
    sellFee: 0.25,
    description: "PT Mirae Asset Sekuritas Indonesia"
  },
  {
    id: "kisi",
    name: "Kiwoom Sekuritas (KISI)",
    buyFee: 0.15,
    sellFee: 0.25,
    description: "PT Kiwoom Sekuritas Indonesia"
  },
  {
    id: "kb_valbury",
    name: "KB Valbury Sekuritas",
    buyFee: 0.15,
    sellFee: 0.25,
    description: "PT KB Valbury Sekuritas"
  },
  {
    id: "bni",
    name: "BNI Sekuritas (BIONS)",
    buyFee: 0.17,
    sellFee: 0.27,
    description: "PT BNI Sekuritas"
  },
  {
    id: "mandiri",
    name: "Mandiri Sekuritas (MOST)",
    buyFee: 0.18,
    sellFee: 0.28,
    description: "PT Mandiri Sekuritas"
  },
  {
    id: "phillip",
    name: "Phillip Sekuritas (POEMS)",
    buyFee: 0.18,
    sellFee: 0.28,
    description: "PT Phillip Sekuritas Indonesia"
  },
  {
    id: "ipot",
    name: "IPOT (Indo Premier)",
    buyFee: 0.19,
    sellFee: 0.29,
    description: "PT Indo Premier Sekuritas"
  },
  {
    id: "bri_danareksa",
    name: "BRI Danareksa Sekuritas",
    buyFee: 0.17,
    sellFee: 0.27,
    description: "PT BRI Danareksa Sekuritas"
  },
  {
    id: "mnc",
    name: "MNC Sekuritas (MotionTrade)",
    buyFee: 0.18,
    sellFee: 0.28,
    description: "PT MNC Sekuritas"
  },
  {
    id: "cgs_cimb",
    name: "CGS International Sekuritas",
    buyFee: 0.18,
    sellFee: 0.28,
    description: "PT CGS International Sekuritas Indonesia"
  },
  {
    id: "sinarmas",
    name: "Sinarmas Sekuritas (SimInvest)",
    buyFee: 0.18,
    sellFee: 0.28,
    description: "PT Sinarmas Sekuritas"
  },
  {
    id: "trimegah",
    name: "Trimegah Sekuritas",
    buyFee: 0.18,
    sellFee: 0.28,
    description: "PT Trimegah Sekuritas Indonesia Tbk"
  },
  {
    id: "panin",
    name: "Panin Sekuritas (POST)",
    buyFee: 0.19,
    sellFee: 0.29,
    description: "PT Panin Sekuritas Tbk"
  },
  {
    id: "rhb",
    name: "RHB Sekuritas",
    buyFee: 0.18,
    sellFee: 0.28,
    description: "PT RHB Sekuritas Indonesia"
  },
  {
    id: "bahana",
    name: "Bahana Sekuritas",
    buyFee: 0.17,
    sellFee: 0.27,
    description: "PT Bahana Sekuritas"
  },
  {
    id: "pluang",
    name: "Pluang",
    buyFee: 0.15,
    sellFee: 0.25,
    description: "PT Pluang Maju Sekuritas"
  },
  {
    id: "custom",
    name: "Custom (Atur Sendiri)",
    buyFee: 0.15,
    sellFee: 0.25,
    description: "Fee broker custom"
  }
];

export function getBrokers(): Broker[] {
  return BROKERS;
}

export function getBrokerById(id: string): Broker | undefined {
  return BROKERS.find(b => b.id === id);
}
