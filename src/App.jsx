import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TickerBar } from './components/TickerBar';
import { RFQDesk } from './components/RFQDesk';
import { P2PBoard } from './components/P2PBoard';
import { VaultStation } from './components/VaultStation';
import { DeskOperatorConsole } from './components/DeskOperatorConsole';
import { TradeHistoryView } from './components/TradeHistoryView';
import { AdminPanel } from './components/AdminPanel';
import { RFQSettlementModal } from './components/RFQSettlementModal';
import { TradeSlipModal } from './components/TradeSlipModal';
import { LiveBrokerChat } from './components/LiveBrokerChat';
import { AdminLoginModal } from './components/AdminLoginModal';
import { apiService } from './services/apiService';
import { 
  USER_WALLET_BALANCES, 
  INITIAL_TRADE_HISTORY,
  DEFAULT_ADMIN_PRICING
} from './data/mockData';
import { CheckCircle2, Info, X, Lock, KeyRound, ShieldAlert } from 'lucide-react';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('rfq'); // 'rfq', 'p2p', 'vault', 'history', 'admin'
  const [isDeskMode, setIsDeskMode] = useState(false);
  const [deskSpreadBps, setDeskSpreadBps] = useState(14);
  const [walletBalance, setWalletBalance] = useState(USER_WALLET_BALANCES);
  const [trades, setTrades] = useState(INITIAL_TRADE_HISTORY);

  // Admin authentication state
  const [adminSession, setAdminSession] = useState(() => apiService.getAdminSession());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => apiService.getAdminSession().isAuthenticated);
  const [adminUser, setAdminUser] = useState(() => apiService.getAdminSession().user);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCloudflareConnected, setIsCloudflareConnected] = useState(false);

  // Theme state with localStorage persistence ('dark' or 'light')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('valence_theme');
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to load saved theme', e);
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('valence_theme', theme);
    } catch (e) {
      console.error('Failed to persist theme', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Admin pricing state with localStorage persistence
  const [adminPricing, setAdminPricing] = useState(() => {
    try {
      const saved = localStorage.getItem('valence_admin_pricing');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved admin pricing', e);
    }
    return DEFAULT_ADMIN_PRICING;
  });

  const handleUpdateAdminPricing = (newPricing, note) => {
    setAdminPricing(newPricing);
    try {
      localStorage.setItem('valence_admin_pricing', JSON.stringify(newPricing));
    } catch (e) {
      console.error('Failed to persist admin pricing', e);
    }
    addToast(note || `USDT INR Prices Updated: BUY ₹${newPricing.buyPriceInr.toFixed(2)} | SELL ₹${newPricing.sellPriceInr.toFixed(2)}`, 'success');
  };

  const handleResetAdminPricing = () => {
    setAdminPricing(DEFAULT_ADMIN_PRICING);
    try {
      localStorage.setItem('valence_admin_pricing', JSON.stringify(DEFAULT_ADMIN_PRICING));
    } catch (e) {
      console.error('Failed to reset admin pricing', e);
    }
    addToast('Reset to standard benchmark prices (BUY ₹90.25 / SELL ₹88.80)', 'info');
  };

  // On startup: check for Cloudflare D1 SQL synced pricing
  useEffect(() => {
    apiService.fetchPricing().then(res => {
      if (res.success && res.pricing) {
        setAdminPricing(res.pricing);
        setIsCloudflareConnected(Boolean(res.isCloudflareConnected));
      }
    });
  }, []);

  // Admin access router & login handlers
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setIsDeskMode(false);
      setActiveTab('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (user, isD1Connected) => {
    setIsAdminAuthenticated(true);
    setAdminUser(user);
    setIsCloudflareConnected(Boolean(isD1Connected));
    setIsDeskMode(false);
    setActiveTab('admin');
    addToast(`Admin ${user.username} authenticated! Access granted to pricing engine.`, 'success');
  };

  const handleAdminLogout = () => {
    apiService.logout();
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    if (activeTab === 'admin') {
      setActiveTab('rfq');
    }
    addToast('Admin session terminated. Returned to client OTC view.', 'info');
  };

  // Active Modals
  const [activeSettlementTrade, setActiveSettlementTrade] = useState(null);
  const [activeTradeSlip, setActiveTradeSlip] = useState(null);
  const [isBrokerChatOpen, setIsBrokerChatOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Execute RFQ trade trigger
  const handleExecuteTrade = (tradeData) => {
    setActiveSettlementTrade(tradeData);
  };

  // Trade finalized
  const handleCompleteTrade = (completedTrade) => {
    const isBuy = completedTrade.side === 'BUY' || completedTrade.side === 'BUY_USDT';
    const netUsdt = completedTrade.amountUsdt || completedTrade.usdtAmount || 0;
    const netId = completedTrade.network?.id || 'trc20';

    // Update wallet balances
    setWalletBalance(prev => {
      const currentNetBal = prev.breakdown[netId] || 0;
      const newNetBal = isBuy ? currentNetBal + netUsdt : Math.max(0, currentNetBal - netUsdt);
      const newTotal = isBuy ? prev.totalUsdt + netUsdt : Math.max(0, prev.totalUsdt - netUsdt);

      return {
        ...prev,
        totalUsdt: newTotal,
        breakdown: {
          ...prev.breakdown,
          [netId]: newNetBal
        },
        fiatEquivUsd: newTotal * 1.0002
      };
    });

    // Add to trades list
    const newTradeRecord = {
      id: completedTrade.id || completedTrade.quoteId || `OTC-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: completedTrade.side === 'BUY' || completedTrade.side === 'BUY_USDT' ? 'BUY' : 'SELL',
      side: completedTrade.side,
      amountUsdt: netUsdt,
      fiatAmount: completedTrade.fiatAmount,
      fiatCode: completedTrade.currency?.code || completedTrade.fiatCode || 'USD',
      network: completedTrade.network?.name || completedTrade.network || 'TRON (TRC-20)',
      rate: completedTrade.rate,
      counterparty: completedTrade.counterparty || 'Valence Institutional Prime Desk',
      status: 'COMPLETED',
      txHash: completedTrade.txHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      escrowId: `ESC-${Math.floor(1000 + Math.random() * 9000)}-VAULT`,
      feeUsdt: completedTrade.deskFeeUsdt || 0
    };

    setTrades(prev => [newTradeRecord, ...prev]);
    addToast(`Trade ${newTradeRecord.id} successfully settled and confirmed on-chain!`, 'success');
  };

  // Deposit simulation
  const handleDepositSimulate = (networkId, amount) => {
    setWalletBalance(prev => {
      const cur = prev.breakdown[networkId] || 0;
      const newTot = prev.totalUsdt + amount;
      return {
        ...prev,
        totalUsdt: newTot,
        breakdown: {
          ...prev.breakdown,
          [networkId]: cur + amount
        },
        fiatEquivUsd: newTot * 1.0002
      };
    });
    addToast(`Deposited +${amount.toLocaleString()} USDT on ${networkId.toUpperCase()}!`, 'success');
  };

  // Withdrawal simulation
  const handleWithdrawSimulate = (networkId, amount) => {
    setWalletBalance(prev => {
      const cur = prev.breakdown[networkId] || 0;
      const newTot = Math.max(0, prev.totalUsdt - amount);
      return {
        ...prev,
        totalUsdt: newTot,
        breakdown: {
          ...prev.breakdown,
          [networkId]: Math.max(0, cur - amount)
        },
        fiatEquivUsd: newTot * 1.0002
      };
    });
    addToast(`Disbursed -${amount.toLocaleString()} USDT on ${networkId.toUpperCase()}!`, 'info');
  };

  // Approve RFQ in Desk Console
  const handleApproveDeskRFQ = (rfq) => {
    addToast(`Desk Operator approved RFQ ${rfq.id} for ${rfq.client}!`, 'success');
  };

  return (
    <div className="app-layout">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDeskMode={isDeskMode}
        setIsDeskMode={setIsDeskMode}
        walletBalance={walletBalance}
        onOpenBrokerChat={() => setIsBrokerChatOpen(true)}
        onOpenTradeHistory={() => setActiveTab('history')}
        adminPricing={adminPricing}
        theme={theme}
        toggleTheme={toggleTheme}
        isAdminAuthenticated={isAdminAuthenticated}
        adminUser={adminUser}
        onOpenAdmin={handleOpenAdmin}
        onAdminLogout={handleAdminLogout}
      />

      {/* Streaming Live Rate Ticker */}
      <TickerBar deskSpreadBps={deskSpreadBps} adminPricing={adminPricing} />

      {/* Main Content Area */}
      <main className="main-content-wrapper">
        {isDeskMode ? (
          /* Desk Operator / Liquidity Provider Console */
          <DeskOperatorConsole
            deskSpreadBps={deskSpreadBps}
            setDeskSpreadBps={setDeskSpreadBps}
            onApproveRFQ={handleApproveDeskRFQ}
            adminPricing={adminPricing}
            onOpenAdmin={handleOpenAdmin}
          />
        ) : (
          /* Client Views */
          <>
            {activeTab === 'rfq' && (
              <RFQDesk
                deskSpreadBps={deskSpreadBps}
                onExecuteTrade={handleExecuteTrade}
                walletBalance={walletBalance}
                adminPricing={adminPricing}
                onOpenAdmin={handleOpenAdmin}
              />
            )}

            {activeTab === 'p2p' && (
              <P2PBoard
                onTradeComplete={handleCompleteTrade}
                adminPricing={adminPricing}
                onOpenAdmin={handleOpenAdmin}
              />
            )}

            {activeTab === 'vault' && (
              <VaultStation
                walletBalance={walletBalance}
                onDepositSimulate={handleDepositSimulate}
                onWithdrawSimulate={handleWithdrawSimulate}
              />
            )}

            {activeTab === 'history' && (
              <TradeHistoryView
                trades={trades}
                onViewSlip={(trade) => setActiveTradeSlip(trade)}
              />
            )}

            {/* Admin Panel - Strict Authentication Gating */}
            {activeTab === 'admin' && (
              isAdminAuthenticated ? (
                <AdminPanel
                  adminPricing={adminPricing}
                  onUpdatePricing={handleUpdateAdminPricing}
                  onResetPricing={handleResetAdminPricing}
                  onSwitchToTerminal={() => setActiveTab('rfq')}
                  adminUser={adminUser}
                  onLogout={handleAdminLogout}
                  isCloudflareConnected={isCloudflareConnected}
                />
              ) : (
                <div className="admin-locked-page-container">
                  <div className="admin-locked-card glass-panel animate-scale-in">
                    <div className="locked-icon-halo">
                      <Lock size={36} className="text-amber" />
                    </div>
                    <div className="locked-badge">
                      <KeyRound size={13} className="text-amber" />
                      <span>TREASURY DESK ACCESS RESTRICTED</span>
                    </div>
                    <h2>Admin Authentication Required</h2>
                    <p>
                      This console provides direct control over USDT/INR live benchmark rates, spreads, banking escrow parameters, and Cloudflare D1 SQL ledger storage.
                    </p>
                    <div className="locked-actions-row">
                      <button 
                        type="button" 
                        className="btn-primary unlock-admin-btn"
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        <ShieldAlert size={16} />
                        <span>Sign In as Desk Administrator</span>
                      </button>
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => setActiveTab('rfq')}
                      >
                        <span>Return to Client OTC Terminal</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer-bar glass-panel no-print">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">VALENCE OTC MARKETS LLC</span>
            <span className="footer-sep">•</span>
            <span className="footer-text">Institutional Grade USDT Liquidity, Escrow & Settlements</span>
          </div>
          <div className="footer-right">
            <span className="network-status-dot"></span>
            <span className="footer-status">All 5 USDT Networks Operational</span>
            <span className="footer-sep">•</span>
            <span className="mono footer-reserves">Reserves: $42,850,000 USDT</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeSettlementTrade && (
        <RFQSettlementModal
          trade={activeSettlementTrade}
          onClose={() => setActiveSettlementTrade(null)}
          onViewTradeSlip={(trade) => setActiveTradeSlip(trade)}
          onCompleteTrade={handleCompleteTrade}
          adminPricing={adminPricing}
        />
      )}

      {activeTradeSlip && (
        <TradeSlipModal
          trade={activeTradeSlip}
          onClose={() => setActiveTradeSlip(null)}
        />
      )}

      {/* Floating Broker Chat */}
      <LiveBrokerChat
        isOpen={isBrokerChatOpen}
        onClose={() => setIsBrokerChatOpen(false)}
      />

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Floating Toast Alerts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card toast-${t.type}`}>
            <CheckCircle2 size={16} className="toast-icon text-emerald" />
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
