import { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { Header } from './components/Header';
import { ModeToggle } from './components/ModeToggle';
import { CalcTypeToggle } from './components/CalcTypeToggle';
import { InputForm } from './components/InputForm';
import { ResultSection } from './components/ResultSection';
import { ChartsSection } from './components/ChartsSection';
import { TransactionDetails } from './components/TransactionDetails';
import { Simulation } from './components/Simulation';
import { History } from './components/History';
import { TargetInputForm, TargetFormData } from './components/TargetInputForm';
import { TargetResultSection } from './components/TargetResultSection';
import { RightIssueInputForm, RightIssueFormData } from './components/RightIssueInputForm';
import { RightIssueResultSection } from './components/RightIssueResultSection';
import { CryptoInputForm } from './components/CryptoInputForm';
import { CryptoResultSection } from './components/CryptoResultSection';
import { CryptoChartsSection } from './components/CryptoChartsSection';
import { CryptoTransactionDetails } from './components/CryptoTransactionDetails';
import { CryptoSimulation } from './components/CryptoSimulation';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { InputFormData, CryptoInputFormData } from './types';
import { calculateAverage, simulateProfitLoss, calculateTargetAverage, calculateRightIssue, calculateCryptoAverage, simulateCryptoProfitLoss, CalcResult, SimulationResult, TargetCalcResult, RightIssueResult, CryptoCalcResult, CryptoSimulationResult } from './utils/calculator';
import { getBrokerById, getCryptoBrokerById } from './utils/brokers';
import { parseFormattedNumber } from './utils/formatters';
import { getSettings, saveSettings, getHistory, saveCalculation, deleteHistoryItem, clearHistory as clearStorageHistory, HistoryItem } from './utils/storage';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mode, setMode] = useState<'down' | 'up'>('down');
  const [calcType, setCalcType] = useState<'regular' | 'target' | 'right-issue' | 'crypto'>('regular');
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

  const [targetFormData, setTargetFormData] = useState<TargetFormData>({
    stockCode: '',
    brokerId: 'stockbit',
    customBuyFee: '0.15',
    customSellFee: '0.25',
    currentPrice: '',
    currentLots: '',
    targetAverage: '',
    newPurchasePrice: ''
  });

  const [rightIssueFormData, setRightIssueFormData] = useState<RightIssueFormData>({
    stockCode: '',
    oldRatio: '',
    newRatio: '',
    cumPrice: '',
    exercisePrice: '',
    currentPrice: '',
    currentLots: ''
  });

  const [cryptoFormData, setCryptoFormData] = useState<CryptoInputFormData>({
    coinCode: '',
    brokerId: 'tokocrypto',
    customBuyFee: '0.10',
    customSellFee: '0.10',
    currentPrice: '',
    currentCoins: '',
    purchases: []
  });

  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [simResults, setSimResults] = useState<SimulationResult[]>([]);
  const [targetCalcResult, setTargetCalcResult] = useState<TargetCalcResult | null>(null);
  const [rightIssueResult, setRightIssueResult] = useState<RightIssueResult | null>(null);
  const [cryptoCalcResult, setCryptoCalcResult] = useState<CryptoCalcResult | null>(null);
  const [cryptoSimResults, setCryptoSimResults] = useState<CryptoSimulationResult[]>([]);

  const { toasts, showToast } = useToast();

  useEffect(() => {
    const settings = getSettings();
    setTheme(settings.theme || 'light');
    if (settings.lastBroker) {
      setFormData(prev => ({ ...prev, brokerId: settings.lastBroker }));
      setTargetFormData(prev => ({ ...prev, brokerId: settings.lastBroker }));
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

  const handleCalculateRegular = () => {
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

    saveSettings({ lastBroker: formData.brokerId });

    const result = calculateAverage({ price: currentPrice, lots: currentLots }, purchases, brokerData);
    setCalcResult(result);
    
    const simRes = simulateProfitLoss(result);
    setSimResults(simRes);

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

  const handleCalculateTarget = () => {
    const currentPrice = parseFormattedNumber(targetFormData.currentPrice);
    const currentLots = parseFormattedNumber(targetFormData.currentLots);
    const targetAvg = parseFormattedNumber(targetFormData.targetAverage);
    const newPrice = parseFormattedNumber(targetFormData.newPurchasePrice);

    if (currentPrice <= 0 || currentLots <= 0 || targetAvg <= 0 || newPrice <= 0) {
      showToast('Semua field harga dan lot harus diisi lebih dari 0', 'error');
      return;
    }

    const broker = getBrokerById(targetFormData.brokerId);
    let brokerData = broker!;
    
    if (targetFormData.brokerId === 'custom') {
      const bFee = parseFloat(targetFormData.customBuyFee.replace(',', '.'));
      const sFee = parseFloat(targetFormData.customSellFee.replace(',', '.'));
      if (isNaN(bFee) || isNaN(sFee)) {
        showToast('Fee broker tidak valid', 'error');
        return;
      }
      brokerData = { ...brokerData, buyFee: bFee, sellFee: sFee };
    }

    saveSettings({ lastBroker: targetFormData.brokerId });

    const result = calculateTargetAverage(
      { price: currentPrice, lots: currentLots },
      targetAvg,
      newPrice,
      brokerData,
      mode
    );

    setTargetCalcResult(result);
    if (result.isValid) {
      showToast('Kalkulasi target berhasil!', 'success');
    } else {
      showToast('Kalkulasi tidak valid', 'error');
    }
  };

  const handleCalculateRightIssue = () => {
    const oldR = parseFormattedNumber(rightIssueFormData.oldRatio);
    const newR = parseFormattedNumber(rightIssueFormData.newRatio);
    const cumP = parseFormattedNumber(rightIssueFormData.cumPrice);
    const excP = parseFormattedNumber(rightIssueFormData.exercisePrice);
    const curP = parseFormattedNumber(rightIssueFormData.currentPrice);
    const curL = parseFormattedNumber(rightIssueFormData.currentLots);

    if (!oldR || !newR || !cumP || !excP) {
      showToast('Rasio dan Harga wajib diisi', 'error');
      return;
    }

    const res = calculateRightIssue(oldR, newR, cumP, excP, curL, curP);
    setRightIssueResult(res);
    showToast('Kalkulasi Right Issue berhasil!', 'success');
  };

  const handleResetRegular = () => {
    setFormData(prev => ({
      ...prev,
      stockCode: '',
      currentPrice: '',
      currentLots: '',
      purchases: []
    }));
    setCalcResult(null);
    setSimResults([]);
    showToast('Form direset', 'info');
  };

  const handleResetTarget = () => {
    setTargetFormData(prev => ({
      ...prev,
      stockCode: '',
      currentPrice: '',
      currentLots: '',
      targetAverage: '',
      newPurchasePrice: ''
    }));
    setTargetCalcResult(null);
    showToast('Form direset', 'info');
  };

  const handleResetRightIssue = () => {
    setRightIssueFormData(prev => ({
      ...prev,
      stockCode: '',
      oldRatio: '',
      newRatio: '',
      cumPrice: '',
      exercisePrice: '',
      currentPrice: '',
      currentLots: ''
    }));
    setRightIssueResult(null);
    showToast('Form direset', 'info');
  };

  const handleCalculateCrypto = () => {
    const currentPrice = parseFloat(cryptoFormData.currentPrice.replace(/,/g, '.')) || 0;
    const currentCoins = parseFloat(cryptoFormData.currentCoins.replace(/,/g, '.')) || 0;
    
    if (currentPrice <= 0 || currentCoins <= 0) {
      showToast('Harga dan jumlah koin saat ini harus diisi', 'error');
      return;
    }

    const purchases = cryptoFormData.purchases.map(p => ({
      price: parseFloat(p.price.replace(/,/g, '.')) || 0,
      coins: parseFloat(p.coins.replace(/,/g, '.')) || 0
    })).filter(p => p.price > 0 && p.coins > 0);

    if (purchases.length === 0) {
      showToast('Minimal satu data pembelian (harga & koin) harus diisi', 'error');
      return;
    }

    const broker = getCryptoBrokerById(cryptoFormData.brokerId);
    let brokerData = broker!;
    
    if (cryptoFormData.brokerId === 'custom_crypto') {
      const bFee = parseFloat(cryptoFormData.customBuyFee.replace(',', '.'));
      const sFee = parseFloat(cryptoFormData.customSellFee.replace(',', '.'));
      if (isNaN(bFee) || isNaN(sFee)) {
        showToast('Fee broker tidak valid', 'error');
        return;
      }
      brokerData = { ...brokerData, buyFee: bFee, sellFee: sFee };
    }

    const result = calculateCryptoAverage({ price: currentPrice, coins: currentCoins }, purchases, brokerData);
    setCryptoCalcResult(result);
    
    const simRes = simulateCryptoProfitLoss(result);
    setCryptoSimResults(simRes);

    showToast('Kalkulasi Crypto berhasil!', 'success');
  };

  const handleResetCrypto = () => {
    setCryptoFormData(prev => ({
      ...prev,
      coinCode: '',
      currentPrice: '',
      currentCoins: '',
      purchases: []
    }));
    setCryptoCalcResult(null);
    setCryptoSimResults([]);
    showToast('Form direset', 'info');
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCalcType('regular');
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
        <CalcTypeToggle calcType={calcType} onTypeChange={setCalcType} />
        {calcType !== 'right-issue' && (
          <ModeToggle mode={mode} onModeChange={setMode} />
        )}
        
        <div className="container mt-4">
          <div className="app-grid">
            <div className="col-lg-5">
              {calcType === 'regular' && (
                <InputForm 
                  mode={mode} 
                  formData={formData} 
                  setFormData={setFormData} 
                  onCalculate={handleCalculateRegular} 
                  onReset={handleResetRegular}
                />
              )}
              {calcType === 'target' && (
                <TargetInputForm 
                  mode={mode} 
                  formData={targetFormData} 
                  setFormData={setTargetFormData} 
                  onCalculate={handleCalculateTarget} 
                  onReset={handleResetTarget}
                />
              )}
              {calcType === 'right-issue' && (
                <RightIssueInputForm 
                  formData={rightIssueFormData} 
                  setFormData={setRightIssueFormData} 
                  onCalculate={handleCalculateRightIssue} 
                  onReset={handleResetRightIssue}
                />
              )}
              {calcType === 'crypto' && (
                <CryptoInputForm 
                  mode={mode} 
                  formData={cryptoFormData} 
                  setFormData={setCryptoFormData} 
                  onCalculate={handleCalculateCrypto} 
                  onReset={handleResetCrypto}
                />
              )}
            </div>
            
            <div className="col-lg-7">
              {calcType === 'regular' ? (
                calcResult ? (
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
                )
              ) : calcType === 'target' ? (
                targetCalcResult ? (
                  <div id="target-results-container">
                    <TargetResultSection 
                      calcResult={targetCalcResult} 
                      stockCode={targetFormData.stockCode}
                    />
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">🎯</div>
                    <h3>Belum Ada Hasil Kalkulasi</h3>
                    <p>Silakan isi form target average di samping dan klik tombol <strong>Hitung Kebutuhan Modal</strong></p>
                  </div>
                )
              ) : calcType === 'right-issue' ? (
                rightIssueResult ? (
                  <div id="ri-results-container">
                    <RightIssueResultSection 
                      calcResult={rightIssueResult} 
                      stockCode={rightIssueFormData.stockCode}
                      hasPortfolio={parseFormattedNumber(rightIssueFormData.currentLots) > 0}
                    />
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">💼</div>
                    <h3>Belum Ada Hasil Kalkulasi</h3>
                    <p>Silakan isi rasio dan harga di form samping lalu klik tombol <strong>Hitung Right Issue</strong></p>
                  </div>
                )
              ) : (
                cryptoCalcResult ? (
                  <div id="crypto-results-container">
                    <CryptoResultSection 
                      calcResult={cryptoCalcResult} 
                      simResults={cryptoSimResults} 
                      coinCode={cryptoFormData.coinCode} 
                      mode={mode} 
                      onToast={showToast} 
                    />
                    <CryptoChartsSection 
                      calcResult={cryptoCalcResult} 
                      simResults={cryptoSimResults} 
                      theme={theme} 
                    />
                    <CryptoTransactionDetails 
                      calcResult={cryptoCalcResult} 
                    />
                    <CryptoSimulation 
                      calcResult={cryptoCalcResult} 
                    />
                  </div>
                ) : (
                  <div className="empty-state" id="empty-state">
                    <div className="empty-state-icon"><Lightbulb size={48} className="gold-text" /></div>
                    <h3>Belum Ada Kalkulasi Crypto</h3>
                    <p>Silakan isi data posisi aset Crypto Anda dan tambahkan pembelian baru, lalu klik "Hitung Average".</p>
                  </div>
                )
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
