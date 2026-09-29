import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  Sparkles, 
  History,
  Eye,
  LogOut,
  Database,
  ShieldCheck
} from 'lucide-react';
import { apiService } from '../services/apiService';

export function AdminPanel({ 
  adminPricing, 
  onUpdatePricing, 
  onResetPricing,
  onSwitchToTerminal,
  adminUser,
  onLogout,
  isCloudflareConnected = false
}) {
  // Local form state initialized from props
  const [buyPrice, setBuyPrice] = useState(adminPricing.buyPriceInr.toString());
  const [sellPrice, setSellPrice] = useState(adminPricing.sellPriceInr.toString());
  const [minTrade, setMinTrade] = useState(adminPricing.minTradeInr.toString());
  const [maxTrade, setMaxTrade] = useState(adminPricing.maxTradeInr.toString());
  
  // Bank details form state
  const [bankName, setBankName] = useState(adminPricing.bankDetails?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(adminPricing.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(adminPricing.bankDetails?.ifsc || '');
  const [beneficiaryName, setBeneficiaryName] = useState(adminPricing.bankDetails?.beneficiaryName || '');
  const [upiId, setUpiId] = useState(adminPricing.bankDetails?.upiId || '');

  // Status & history
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [historyList, setHistoryList] = useState(() => {
    try {
      const stored = localStorage.getItem('valence_price_history');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'h-1',
        time: 'Today, 12:30 PM',
        buy: 90.25,
        sell: 88.80,
        spread: 1.45,
        note: 'Default prime liquidity desk calibration'
      }
    ];
  });

  // Sync if prop updates externally
  useEffect(() => {
    setBuyPrice(adminPricing.buyPriceInr.toString());
    setSellPrice(adminPricing.sellPriceInr.toString());
    setMinTrade(adminPricing.minTradeInr.toString());
    setMaxTrade(adminPricing.maxTradeInr.toString());
    if (adminPricing.bankDetails) {
      setBankName(adminPricing.bankDetails.bankName || '');
      setAccountNumber(adminPricing.bankDetails.accountNumber || '');
      setIfsc(adminPricing.bankDetails.ifsc || '');
      setBeneficiaryName(adminPricing.bankDetails.beneficiaryName || '');
      setUpiId(adminPricing.bankDetails.upiId || '');
    }
  }, [adminPricing]);

  const numBuy = parseFloat(buyPrice) || 0;
  const numSell = parseFloat(sellPrice) || 0;
  const spreadInr = Number((numBuy - numSell).toFixed(2));
  const spreadPct = numBuy > 0 ? Number(((spreadInr / numBuy) * 100).toFixed(2)) : 0;
  const isNegativeSpread = spreadInr <= 0;

  // Step adjustments
  const adjustBuy = (delta) => {
    const updated = Math.max(1, Number((numBuy + delta).toFixed(2)));
    setBuyPrice(updated.toString());
  };

  const adjustSell = (delta) => {
    const updated = Math.max(1, Number((numSell + delta).toFixed(2)));
    setSellPrice(updated.toString());
  };

  // Presets
  const applyPreset = (presetBuy, presetSell) => {
    setBuyPrice(presetBuy.toFixed(2));
    setSellPrice(presetSell.toFixed(2));
  };

  // Save changes
  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (numBuy <= 0 || numSell <= 0) return;

    const newPricing = {
      ...adminPricing,
      buyPriceInr: numBuy,
      sellPriceInr: numSell,
      minTradeInr: parseFloat(minTrade) || adminPricing.minTradeInr,
      maxTradeInr: parseFloat(maxTrade) || adminPricing.maxTradeInr,
      bankDetails: {
        ...adminPricing.bankDetails,
        bankName,
        accountNumber,
        ifsc,
        beneficiaryName,
        upiId
      },
      lastUpdated: new Date().toISOString()
    };

    // Add to history
    const historyItem = {
      id: `h-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      buy: numBuy,
      sell: numSell,
      spread: spreadInr,
      note: `Updated by Desk Admin (Spread: ₹${spreadInr})`
    };

    const updatedHistory = [historyItem, ...historyList.slice(0, 7)];
    setHistoryList(updatedHistory);
    try {
      localStorage.setItem('valence_price_history', JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }

    // Save to Cloudflare D1 SQL via Netlify Function
    apiService.updatePricing(newPricing, `Updated by Admin ${adminUser?.username || 'admin'}`)
      .then(res => {
        if (res && res.historyEntry) {
          setHistoryList(prev => [res.historyEntry, ...prev.slice(0, 9)]);
        }
      })
      .catch(err => console.warn('Cloudflare SQL sync note:', err));

    onUpdatePricing(newPricing, `Rates published: BUY ₹${numBuy.toFixed(2)} | SELL ₹${numSell.toFixed(2)}`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Fetch price history from Cloudflare SQL on mount
  useEffect(() => {
    apiService.fetchHistory().then(res => {
      if (res.success && res.history && res.history.length > 0) {
        setHistoryList(res.history);
      }
    });
  }, []);

  const handleReset = () => {
    onResetPricing();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="admin-panel-container">
      {/* Top Banner with Admin Identity & Cloudflare D1 Status */}
      <div className="admin-banner-card glass-panel">
        <div className="admin-banner-left">
          <div className="admin-badge-row">
            <div className="admin-badge">
              <span className="pulse-amber"></span>
              ADMINISTRATION & PRICING ENGINE
            </div>

            {/* Cloudflare D1 SQL Connection Badge */}
            <div className={`db-status-pill ${isCloudflareConnected ? 'connected' : 'standalone'}`} title="Cloudflare D1 SQL Database Status">
              <Database size={12} />
              <span>{isCloudflareConnected ? 'Cloudflare D1 SQL: Connected' : 'Cloudflare D1 SQL: Standalone'}</span>
            </div>

            {/* Admin User Info Badge */}
            {adminUser && (
              <div className="admin-user-pill">
                <ShieldCheck size={12} className="text-emerald" />
                <span>Admin: <strong>{adminUser.username}</strong> ({adminUser.role || 'Superuser'})</span>
              </div>
            )}
          </div>

          <h1 className="admin-title">USDT / INR Desk Pricing & Margins</h1>
          <p className="admin-sub">
            Directly adjust live selling and buying prices in Indian Rupee for all USDT transactions. Changes reflect instantly on the Navbar, Ticker, Instant RFQ Desk, and persist to Cloudflare D1 SQL.
          </p>
        </div>

        <div className="admin-banner-right">
          <button 
            type="button"
            className="btn-secondary view-client-btn"
            onClick={onSwitchToTerminal}
          >
            <Eye size={15} />
            <span>Preview Client View</span>
          </button>

          <button 
            type="button" 
            className="btn-primary publish-rates-btn"
            onClick={handleSave}
          >
            <Save size={16} />
            <span>Publish Live Prices</span>
          </button>

          {onLogout && (
            <button
              type="button"
              className="btn-danger admin-logout-btn"
              onClick={onLogout}
              title="End Admin Session and Log Out"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="admin-alert-banner success-banner">
          <CheckCircle2 size={18} className="text-emerald" />
          <span>
            <strong>Success!</strong> Live prices have been updated and synced to all client terminals: 
            {' '}<strong>BUY ₹{numBuy.toFixed(2)}</strong> • <strong>SELL ₹{numSell.toFixed(2)}</strong>.
          </span>
        </div>
      )}

      {isNegativeSpread && (
        <div className="admin-alert-banner warning-banner">
          <AlertTriangle size={18} className="text-amber" />
          <span>
            <strong>Attention:</strong> Buying price (₹{numBuy.toFixed(2)}) is less than or equal to Selling price (₹{numSell.toFixed(2)}). Desk will operate at zero or negative margin!
          </span>
        </div>
      )}

      {/* Main Grid: Price Adjustments on Left, Spread & Analytics on Right */}
      <div className="admin-grid">
        {/* Left Column: Direct Price Adjusters */}
        <div className="admin-main-col">
          {/* Dual Price Cards */}
          <div className="admin-pricing-cards-row">
            {/* BUY PRICE CARD (What Customer Pays) */}
            <div className="admin-price-card buy-card glass-panel">
              <div className="price-card-header">
                <div className="price-header-pill buy-pill">
                  <TrendingUp size={14} />
                  <span>CLIENT BUY RATE (DESK SELLS)</span>
                </div>
                <span className="badge-emerald-soft">Customer Pays INR</span>
              </div>

              <div className="price-card-body">
                <span className="price-input-hint">Set price per 1 USDT in INR</span>
                <div className="price-input-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-price-input mono text-emerald"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                  />
                  <span className="currency-suffix">/ USDT</span>
                </div>

                <div className="quick-steppers-grid">
                  <button type="button" className="step-btn" onClick={() => adjustBuy(-1.00)}>-₹1.00</button>
                  <button type="button" className="step-btn" onClick={() => adjustBuy(-0.50)}>-₹0.50</button>
                  <button type="button" className="step-btn" onClick={() => adjustBuy(-0.10)}>-₹0.10</button>
                  <button type="button" className="step-btn" onClick={() => adjustBuy(+0.10)}>+₹0.10</button>
                  <button type="button" className="step-btn" onClick={() => adjustBuy(+0.50)}>+₹0.50</button>
                  <button type="button" className="step-btn" onClick={() => adjustBuy(+1.00)}>+₹1.00</button>
                </div>

                <div className="price-card-footer">
                  <span className="footer-label">Spot Base (₹89.45):</span>
                  <span className="footer-val text-emerald mono">
                    {numBuy >= 89.45 ? `+₹${(numBuy - 89.45).toFixed(2)} premium` : `-₹${(89.45 - numBuy).toFixed(2)} discount`}
                  </span>
                </div>
              </div>
            </div>

            {/* SELL PRICE CARD (What Customer Receives) */}
            <div className="admin-price-card sell-card glass-panel">
              <div className="price-card-header">
                <div className="price-header-pill sell-pill">
                  <TrendingDown size={14} />
                  <span>CLIENT SELL RATE (DESK BUYS)</span>
                </div>
                <span className="badge-cyan-soft">Customer Receives INR</span>
              </div>

              <div className="price-card-body">
                <span className="price-input-hint">Set price per 1 USDT in INR</span>
                <div className="price-input-wrap">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-price-input mono text-cyan"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                  />
                  <span className="currency-suffix">/ USDT</span>
                </div>

                <div className="quick-steppers-grid">
                  <button type="button" className="step-btn" onClick={() => adjustSell(-1.00)}>-₹1.00</button>
                  <button type="button" className="step-btn" onClick={() => adjustSell(-0.50)}>-₹0.50</button>
                  <button type="button" className="step-btn" onClick={() => adjustSell(-0.10)}>-₹0.10</button>
                  <button type="button" className="step-btn" onClick={() => adjustSell(+0.10)}>+₹0.10</button>
                  <button type="button" className="step-btn" onClick={() => adjustSell(+0.50)}>+₹0.50</button>
                  <button type="button" className="step-btn" onClick={() => adjustSell(+1.00)}>+₹1.00</button>
                </div>

                <div className="price-card-footer">
                  <span className="footer-label">Spot Base (₹89.45):</span>
                  <span className="footer-val text-cyan mono">
                    {numSell >= 89.45 ? `+₹${(numSell - 89.45).toFixed(2)} premium` : `-₹${(89.45 - numSell).toFixed(2)} discount`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="admin-section-card glass-panel">
            <div className="section-card-header">
              <Sparkles size={16} className="text-amber" />
              <h3>One-Click Spread Presets</h3>
              <span className="text-secondary text-xs">(Based on current spot ₹89.45)</span>
            </div>

            <div className="preset-buttons-grid">
              <button
                type="button"
                className="spread-preset-btn"
                onClick={() => applyPreset(89.95, 89.20, 'Tight')}
              >
                <div className="preset-name">⚡ Ultra Tight</div>
                <div className="preset-rates mono">Buy ₹89.95 • Sell ₹89.20</div>
                <div className="preset-spread text-emerald">₹0.75 Spread (0.83%)</div>
              </button>

              <button
                type="button"
                className="spread-preset-btn active-preset"
                onClick={() => applyPreset(90.25, 88.80, 'Standard')}
              >
                <div className="preset-name">💎 Institutional Prime</div>
                <div className="preset-rates mono">Buy ₹90.25 • Sell ₹88.80</div>
                <div className="preset-spread text-emerald">₹1.45 Spread (1.61%)</div>
              </button>

              <button
                type="button"
                className="spread-preset-btn"
                onClick={() => applyPreset(91.00, 88.40, 'High Vol')}
              >
                <div className="preset-name">🛡️ High Volatility</div>
                <div className="preset-rates mono">Buy ₹91.00 • Sell ₹88.40</div>
                <div className="preset-spread text-emerald">₹2.60 Spread (2.86%)</div>
              </button>

              <button
                type="button"
                className="spread-preset-btn"
                onClick={() => applyPreset(91.80, 88.00, 'Surge')}
              >
                <div className="preset-name">🔥 Peak Demand Surge</div>
                <div className="preset-rates mono">Buy ₹91.80 • Sell ₹88.00</div>
                <div className="preset-spread text-emerald">₹3.80 Spread (4.14%)</div>
              </button>
            </div>
          </div>

          {/* Settlement Bank Details Settings */}
          <div className="admin-section-card glass-panel">
            <div className="section-card-header">
              <Building size={16} className="text-cyan" />
              <h3>Desk Banking & Settlement Rails (Displayed to Clients)</h3>
            </div>

            <div className="bank-settings-grid">
              <div className="form-group full-width">
                <label>Beneficiary Entity Name</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. VALENCE OTC MARKETS PRIVATE LIMITED"
                />
              </div>

              <div className="form-group">
                <label>Bank Name & Branch</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank Ltd (BKC Branch)"
                />
              </div>

              <div className="form-group">
                <label>Corporate Account Number</label>
                <input
                  type="text"
                  className="mono"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 50200084920199"
                />
              </div>

              <div className="form-group">
                <label>Bank IFSC Code</label>
                <input
                  type="text"
                  className="mono uppercase"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  placeholder="e.g. HDFC0000123"
                />
              </div>

              <div className="form-group">
                <label>Official Settlement UPI ID</label>
                <input
                  type="text"
                  className="mono"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. valence.otc@hdfcbank"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Margin Metrics, Live Preview & History */}
        <div className="admin-side-col">
          {/* Spread & Margin Analysis Card */}
          <div className="admin-section-card glass-panel">
            <div className="section-card-header">
              <TrendingUp size={16} className="text-emerald" />
              <h3>Live Margin & Economics</h3>
            </div>

            <div className="margin-metrics-list">
              <div className="margin-metric-row">
                <span className="metric-label">Desk Spread / Margin:</span>
                <span className={`metric-val mono font-bold ${spreadInr > 0 ? 'text-emerald' : 'text-red'}`}>
                  ₹{spreadInr.toFixed(2)} per USDT
                </span>
              </div>

              <div className="margin-metric-row">
                <span className="metric-label">Percentage Margin:</span>
                <span className={`metric-val mono font-bold ${spreadPct > 0 ? 'text-emerald' : 'text-red'}`}>
                  {spreadPct.toFixed(2)}%
                </span>
              </div>

              <div className="margin-divider"></div>

              <div className="turnover-projections">
                <span className="turnover-title">Projected Desk Gross Revenue:</span>
                <div className="projection-item">
                  <span className="proj-vol">₹10 Lakh Turnover:</span>
                  <span className="proj-amt mono text-emerald font-bold">
                    +₹{Math.round((1000000 / (numBuy || 1)) * spreadInr).toLocaleString()}
                  </span>
                </div>
                <div className="projection-item">
                  <span className="proj-vol">₹1 Crore Turnover:</span>
                  <span className="proj-amt mono text-emerald font-bold">
                    +₹{Math.round((10000000 / (numBuy || 1)) * spreadInr).toLocaleString()}
                  </span>
                </div>
                <div className="projection-item">
                  <span className="proj-vol">100,000 USDT Block:</span>
                  <span className="proj-amt mono text-emerald font-bold">
                    +₹{(100000 * spreadInr).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="admin-section-card glass-panel live-preview-box">
            <div className="section-card-header">
              <Eye size={16} className="text-cyan" />
              <h3>Live Client Preview</h3>
            </div>

            <p className="preview-desc">How rates appear on the user terminal:</p>

            <div className="preview-terminal-pill">
              <div className="preview-pill-header">
                <span className="inr-flag">🇮🇳</span>
                <span className="mono font-bold">USDT / INR OTC</span>
              </div>
              <div className="preview-rates-duo">
                <div className="prev-rate-item prev-buy">
                  <span className="prev-tag">BUY</span>
                  <span className="prev-val mono">₹{numBuy.toFixed(2)}</span>
                </div>
                <div className="prev-rate-item prev-sell">
                  <span className="prev-tag">SELL</span>
                  <span className="prev-val mono">₹{numSell.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="preview-rfq-snippet">
              <div className="rfq-prev-row">
                <span>User Buys $10,000 USDT:</span>
                <strong className="mono">₹{(10000 * numBuy).toLocaleString()}</strong>
              </div>
              <div className="rfq-prev-row">
                <span>User Sells $10,000 USDT:</span>
                <strong className="mono text-cyan">₹{(10000 * numSell).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons Box */}
          <div className="admin-actions-card glass-panel">
            <button 
              type="button"
              className="btn-primary full-width-btn save-large-btn"
              onClick={handleSave}
            >
              <Save size={18} />
              <span>Apply & Publish to Live Users</span>
            </button>

            <button 
              type="button"
              className="btn-secondary full-width-btn reset-btn"
              onClick={handleReset}
            >
              <RotateCcw size={15} />
              <span>Reset to Default Benchmarks</span>
            </button>
          </div>

          {/* Audit History Log */}
          <div className="admin-section-card glass-panel">
            <div className="section-card-header">
              <History size={16} className="text-purple" />
              <h3>Price Change Audit Log</h3>
            </div>

            <div className="audit-log-list">
              {historyList.map(h => (
                <div key={h.id} className="audit-log-item">
                  <div className="audit-top">
                    <span className="audit-time mono">{h.time}</span>
                    <span className="audit-spread mono text-emerald font-bold">+₹{h.spread.toFixed(2)}</span>
                  </div>
                  <div className="audit-rates mono">
                    <span className="text-emerald">BUY: ₹{h.buy.toFixed(2)}</span>
                    <span className="audit-sep">•</span>
                    <span className="text-cyan">SELL: ₹{h.sell.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
