import React from 'react';
import { 
  ShieldCheck, 
  ArrowLeftRight, 
  Wallet, 
  FileText, 
  SlidersHorizontal, 
  Headphones, 
  ExternalLink,
  ChevronDown,
  Sliders,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Lock,
  LogOut,
  KeyRound
} from 'lucide-react';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  isDeskMode, 
  setIsDeskMode, 
  walletBalance, 
  onOpenBrokerChat,
  onOpenTradeHistory,
  adminPricing,
  theme = 'dark',
  toggleTheme,
  isAdminAuthenticated = false,
  adminUser = null,
  onOpenAdmin,
  onAdminLogout
}) {
  const buyPrice = adminPricing?.buyPriceInr || 90.25;
  const sellPrice = adminPricing?.sellPriceInr || 88.80;

  return (
    <header className="navbar-container">
      {/* Top utility alert / Desk mode indicator */}
      {isDeskMode && (
        <div className="desk-mode-banner">
          <div className="desk-mode-indicator">
            <span className="pulse-amber"></span>
            <strong>OTC LIQUIDITY DESK OPERATOR MODE ACTIVE</strong> — You are managing desk spreads, quotes, and escrow settlement queues.
          </div>
          <button 
            className="desk-mode-exit-btn"
            onClick={() => setIsDeskMode(false)}
          >
            Switch to Client View
          </button>
        </div>
      )}

      <div className="navbar-main">
        {/* Brand Logo */}
        <div className="navbar-brand-section">
          <div className="navbar-brand" onClick={() => { setActiveTab('rfq'); setIsDeskMode(false); }}>
            <div className="brand-logo-gem">
              <span className="usdt-t-symbol">₮</span>
            </div>
            <div className="brand-text-col">
              <div className="brand-name">
                VALENCE <span className="brand-highlight">OTC</span>
              </div>
              <div className="brand-sub">USDT INSTITUTIONAL DESK</div>
            </div>
          </div>

          {/* Prominent Live USDT in INR Selling & Buying Price Badge */}
          <div 
            className="navbar-inr-dual-pill" 
            title="Live Tether (USDT) OTC Rates in Indian Rupee (INR). Click to adjust in Admin Panel."
            onClick={() => onOpenAdmin ? onOpenAdmin() : setActiveTab('admin')}
          >
            <div className="inr-flag-wrap">
              <span className="inr-flag">🇮🇳</span>
              <span className="inr-pair-text mono">USDT/INR</span>
            </div>
            
            <div className="navbar-rates-split">
              <div className="nav-rate-chip buy-chip" title="Price to Buy USDT from Desk">
                <span className="rate-chip-tag">BUY</span>
                <span className="rate-chip-val mono">₹{buyPrice.toFixed(2)}</span>
              </div>
              <div className="nav-rate-chip sell-chip" title="Price when Selling USDT to Desk">
                <span className="rate-chip-tag">SELL</span>
                <span className="rate-chip-val mono">₹{sellPrice.toFixed(2)}</span>
              </div>
            </div>
            <span className="pulse-dot-small" title="Live streaming rates"></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="navbar-nav">
          <button 
            className={`nav-link ${activeTab === 'rfq' && !isDeskMode ? 'active' : ''}`}
            onClick={() => { setActiveTab('rfq'); setIsDeskMode(false); }}
            title="Instant OTC Request For Quote"
          >
            <ArrowLeftRight size={14} />
            <span>Instant RFQ</span>
          </button>

          <button 
            className={`nav-link ${activeTab === 'p2p' && !isDeskMode ? 'active' : ''}`}
            onClick={() => { setActiveTab('p2p'); setIsDeskMode(false); }}
            title="Direct P2P OTC Order Board"
          >
            <span>P2P Board</span>
          </button>

          <button 
            className={`nav-link ${activeTab === 'vault' && !isDeskMode ? 'active' : ''}`}
            onClick={() => { setActiveTab('vault'); setIsDeskMode(false); }}
            title="Multi-Chain Vault & Balances"
          >
            <Wallet size={14} />
            <span>Vault</span>
          </button>

          <button 
            className={`nav-link ${activeTab === 'history' && !isDeskMode ? 'active' : ''}`}
            onClick={() => { setActiveTab('history'); setIsDeskMode(false); }}
            title="Settlement Slips & Trade History"
          >
            <FileText size={14} />
            <span>Trade Slips</span>
          </button>

          {/* Admin Panel Tab Button - Secured */}
          <button 
            className={`nav-link nav-link-admin ${activeTab === 'admin' && !isDeskMode ? 'active' : ''} ${!isAdminAuthenticated ? 'nav-link-locked' : ''}`}
            onClick={() => onOpenAdmin ? onOpenAdmin() : setActiveTab('admin')}
            title={isAdminAuthenticated ? "Open Admin Panel" : "Admin Panel (Restricted - Login Required)"}
          >
            {isAdminAuthenticated ? (
              <Sliders size={14} className="text-amber" />
            ) : (
              <Lock size={13} className="text-amber" />
            )}
            <span>Admin</span>
            <span className={isAdminAuthenticated ? "nav-tag-amber" : "nav-tag-locked"}>
              {isAdminAuthenticated ? "Unlocked" : "Login"}
            </span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="navbar-actions">
          {/* Active Admin Session Badge if logged in */}
          {isAdminAuthenticated && (
            <div className="nav-admin-session-badge" title="Authenticated Admin Session">
              <span className="pulse-amber-dot"></span>
              <span className="admin-session-name mono">
                {adminUser?.username || 'admin'}
              </span>
              {onAdminLogout && (
                <button
                  type="button"
                  className="session-logout-icon-btn"
                  onClick={onAdminLogout}
                  title="Sign Out of Admin"
                >
                  <LogOut size={12} />
                </button>
              )}
            </div>
          )}

          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={15} style={{ color: '#f59e0b' }} />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={15} style={{ color: '#7c3aed' }} />
                <span>Dark</span>
              </>
            )}
          </button>

          {/* Broker Support Launcher */}
          <button 
            className="broker-btn"
            onClick={onOpenBrokerChat}
            title="Chat with Senior OTC Desk Broker"
          >
            <Headphones size={16} />
            <span className="broker-btn-label">Desk Broker</span>
            <span className="pulse-dot-small"></span>
          </button>

          {/* Wallet / Account Badge */}
          <div className="client-badge-card" onClick={() => setActiveTab('vault')}>
            <div className="client-status-indicator">
              <ShieldCheck size={16} className="text-emerald" />
              <div className="client-meta">
                <span className="client-tier">Tier 3 KYB</span>
                <span className="client-balance mono">
                  ${(walletBalance?.totalUsdt || 348500).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <small>USDT</small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
