import { Broker } from './brokers';

const STORAGE_KEYS = {
  history: 'avgdown_history',
  settings: 'avgdown_settings'
};

const MAX_HISTORY = 50;

export interface HistoryItemPosition {
  label: string;
  price: number;
  lots: number;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  stockCode: string;
  mode: string;
  broker: Broker;
  positions: HistoryItemPosition[];
  result: {
    averagePrice: number;
    totalLots: number;
    totalShares: number;
    totalModal: number;
    bep: number;
  };
}

export interface Settings {
  theme: 'light' | 'dark';
  lastBroker: string;
  version: string;
}

export function saveCalculation(data: HistoryItem): void {
  const history = getHistory();
  history.unshift(data);
  
  if (history.length > MAX_HISTORY) {
    history.splice(MAX_HISTORY);
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.history);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Failed to read history:', e);
    return [];
  }
}

export function getHistoryById(id: string): HistoryItem | null {
  const history = getHistory();
  return history.find(item => item.id === id) || null;
}

export function deleteHistoryItem(id: string): void {
  const history = getHistory().filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save history:', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.history);
  } catch (e) {
    console.warn('Failed to clear history:', e);
  }
}

export function saveSettings(settings: Partial<Settings>): void {
  try {
    const current = getSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(merged));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export function getSettings(): Settings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.settings);
    return data ? JSON.parse(data) : {
      theme: 'light',
      lastBroker: 'stockbit',
      version: '1.0.0'
    };
  } catch (e) {
    return { theme: 'light', lastBroker: 'stockbit', version: '1.0.0' };
  }
}
