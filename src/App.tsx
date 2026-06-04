import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { Header } from './components/Header';
import { ModeToggle } from './components/ModeToggle';
import { InputForm } from './components/InputForm';
import { ResultSection } from './components/ResultSection';
import { ChartsSection } from './components/ChartsSection';
import { TransactionDetails } from './components/TransactionDetails';
import { Simulation } from './components/Simulation';
import { History } from './components/History';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { InputFormData } from './types';
import { calculateAverage, simulateProfitLoss, CalcResult, SimulationResult } from './utils/calculator';
import { getBrokerById } from './utils/brokers';
import { parseFormattedNumber } from './utils/formatters';
import { getSettings, saveSettings, getHistory, saveCalculation, deleteHistoryItem, clearHistory as clearStorageHistory, HistoryItem } from './utils/storage';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<'down' | 'up'>('down');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  
  const [formData, setFormData] = useState<InputFormData>({
    stockCode: '',
    brokerId: 'stockbit',
    customBuyFee: '0.15',
    customSellFee: '0.25',
    currentPrice: '',
    currentLots: '',
    purchases: []
  });

  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [simResults, setSimResults] = useState<SimulationResult[]>([]);

  const { toasts, showToast } = useToast();

  useEffect(() => {
    const settings = getSettings();
    setTheme(settings.theme || 'light');
    if (settings.lastBroker) {
      setFormData(prev => ({ ...prev, brokerId: settings.lastBroker }));
    }
    setHistoryItems(getHistory());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveSettings({ theme: newTheme });
  };

  const handleCalculate = () => {
    // Validate inputs
    const currentPrice = parseFormattedNumber(formData.currentPrice);
    const currentLots = parseFormattedNumber(formData.currentLots);
    
    if (currentPrice <= 0 || currentLots <= 0) {
      showToast('Harga dan jumlah lot saat ini harus diisi', 'error');
      return;
    }

    const purchases = formData.purchases.map(p => ({
      price: parseFormattedNumber(p.price),
      lots: parseFormattedNumber(p.lots)
    })).filter(p => p.price > 0 && p.lots > 0);

    if (purchases.length === 0) {
      showToast('Minimal satu data pembelian (harga & lot) harus diisi', 'error');
      return;
    }

    const broker = getBrokerById(formData.brokerId);
    let brokerData = broker!;
    
    if (formData.brokerId === 'custom') {
      const bFee = parseFloat(formData.customBuyFee.replace(',', '.'));
      const sFee = parseFloat(formData.customSellFee.replace(',', '.'));
      if (isNaN(bFee) || isNaN(sFee)) {
        showToast('Fee broker tidak valid', 'error');
        return;
      }
      brokerData = { ...brokerData, buyFee: bFee, sellFee: sFee };
    }

    // Save broker preference
    saveSettings({ lastBroker: formData.brokerId });

    // Calculate
    const result = calculateAverage({ price: currentPrice, lots: currentLots }, purchases, brokerData);
    setCalcResult(result);
    
    // Simulate Profit Loss
    const simRes = simulateProfitLoss(result);
    setSimResults(simRes);

    // Save to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      stockCode: formData.stockCode,
      mode,
      broker: brokerData,
      positions: [
        { label: 'Awal', price: currentPrice, lots: currentLots },
        ...purchases.map((p, i) => ({ label: `Beli #${i + 1}`, price: p.price, lots: p.lots }))
      ],
      result: {
        averagePrice: result.averagePrice,
        totalLots: result.totalLots,
        totalShares: result.totalShares,
        totalModal: result.totalModal,
        bep: result.bep
      }
    };

    saveCalculation(historyItem);
    setHistoryItems(getHistory());
    showToast('Kalkulasi berhasil!', 'success');
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setMode(item.mode as 'down' | 'up');
    setFormData(prev => ({
      ...prev,
      stockCode: item.stockCode || '',
      brokerId: item.broker.id,
      customBuyFee: item.broker.id === 'custom' ? item.broker.buyFee.toString() : prev.customBuyFee,
      customSellFee: item.broker.id === 'custom' ? item.broker.sellFee.toString() : prev.customSellFee,
      currentPrice: item.positions[0].price.toString(),
      currentLots: item.positions[0].lots.toString(),
      purchases: item.positions.slice(1).map(p => ({
        id: Math.random().toString(),
        price: p.price.toString(),
        lots: p.lots.toString()
      }))
    }));
    showToast('Data riwayat dimuat', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    if (confirm('Yakin ingin menghapus semua riwayat?')) {
      clearStorageHistory();
      setHistoryItems([]);
      showToast('Riwayat dihapus', 'success');
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    deleteHistoryItem(id);
    setHistoryItems(getHistory());
  };

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="main-content">
        <ModeToggle mode={mode} onModeChange={setMode} />
        
        <div className="container">
          <div className="app-grid">
            <div className="grid-left">
              <InputForm 
                mode={mode} 
                formData={formData} 
                setFormData={setFormData} 
                onCalculate={handleCalculate} 
              />
            </div>
            
            <div className="grid-right">
              {calcResult ? (
                <div id="results-container">
                  <ResultSection 
                    calcResult={calcResult} 
                    simResults={simResults} 
                    stockCode={formData.stockCode} 
                    mode={mode} 
                    onToast={showToast} 
                  />
                  <ChartsSection 
                    calcResult={calcResult} 
                    simResults={simResults} 
                    theme={theme} 
                  />
                  <TransactionDetails 
                    calcResult={calcResult} 
                  />
                  <Simulation 
                    calcResult={calcResult} 
                  />
                </div>
              ) : (
                <div className="empty-state" id="empty-state">
                  <div className="empty-state-icon"><Lightbulb size={48} className="gold-text" /></div>
                  <h3>Belum Ada Kalkulasi</h3>
                  <p>Silakan isi data posisi saham Anda dan tambahkan pembelian baru, lalu klik "Hitung Average".</p>
                </div>
              )}
              
              <History 
                history={historyItems} 
                onLoad={loadHistoryItem} 
                onDelete={handleDeleteHistoryItem} 
                onClear={handleClearHistory} 
              />
            </div>
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} />
    </>
  );
}

export default App;
