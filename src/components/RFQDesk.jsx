import React, { useState, useEffect } from 'react';
import { 
  ArrowDownUp, 
  Clock, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Lock,
  Sliders,
  TrendingUp,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { USDT_NETWORKS, FIAT_CURRENCIES } from '../data/mockData';

export function RFQDesk({ 
  deskSpreadBps, 
  onExecuteTrade, 
  walletBalance,
  adminPricing,
  onOpenAdmin
}) {
  const [tradeSide, setTradeSide] = useState('BUY'); // 'BUY' = Buy USDT with Fiat, 'SELL' = Sell USDT for Fiat
  // Default to INR
  const inrCurrency = FIAT_CURRENCIES.find(c => c.code === 'INR') || FIAT_CURRENCIES[0];
  const [selectedCurrency, setSelectedCurrency] = useState(inrCurrency);
  const [selectedNetwork, setSelectedNetwork] = useState(USDT_NETWORKS[0]);
  
  // Amounts (default ₹5,00,000 for INR or $50,000 for USD)
  const isINR = selectedCurrency.code === 'INR';
  const [fiatAmount, setFiatAmount] = useState(isINR ? '500000' : '50000');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [lastEdited, setLastEdited] = useState('fiat'); // 'fiat' or 'usdt'

  // Quote lock countdown (15s)
  const [timeLeft, setTimeLeft] = useState(15);
  const [quoteId, setQuoteId] = useState(`Q-${Math.floor(100000 + Math.random() * 900000)}`);

  // Active admin prices
  const inrBuyRate = adminPricing?.buyPriceInr || 90.25;
  const inrSellRate = adminPricing?.sellPriceInr || 88.80;

  // Receiving address for Buy or Bank details for Sell
  const [recipientAddress, setRecipientAddress] = useState(USDT_NETWORKS[0].defaultAddress);
  const [bankWireInfo, setBankWireInfo] = useState(
    isINR 
      ? (adminPricing?.bankDetails?.bankName 
          ? `${adminPricing.bankDetails.bankName} - A/C #${adminPricing.bankDetails.accountNumber} - IFSC: ${adminPricing.bankDetails.ifsc}`
          : 'HDFC Bank Ltd - Current A/C #50200084920199 - IFSC: HDFC0000123')
      : 'JPMorgan Chase NY - Acct #8841-99201 - SWIFT: CHASUS33'
  );

  // Update recipient address when network changes
  useEffect(() => {
    setRecipientAddress(selectedNetwork.defaultAddress);
  }, [selectedNetwork]);

  // Update default bank details if currency or admin pricing switches
  useEffect(() => {
    if (selectedCurrency.code === 'INR') {
      const b = adminPricing?.bankDetails;
      if (b?.bankName) {
        setBankWireInfo(`${b.bankName} - A/C #${b.accountNumber} - IFSC: ${b.ifsc} (${b.beneficiaryName || ''})`);
      } else {
        setBankWireInfo('HDFC Bank Ltd - Current A/C #50200084920199 - IFSC: HDFC0000123');
      }
    } else {
      setBankWireInfo('JPMorgan Chase NY - Acct #8841-99201 - SWIFT: CHASUS33');
    }
  }, [selectedCurrency, adminPricing]);

  // Dynamic calculated rate: strictly respect Admin Pricing for INR!
  const rawRate = isINR ? (adminPricing?.baseBenchmarkInr || 89.45) : selectedCurrency.rateToUsdt;
  const numFiat = parseFloat(fiatAmount) || 0;
  const numUsdt = parseFloat(usdtAmount) || 0;
  const primaryVolume = tradeSide === 'BUY' ? numFiat : numUsdt;
  let volumeDiscountBps = 0;
  let effectiveSpreadBps = deskSpreadBps;
  let lockedOtcRate;

  if (isINR) {
    lockedOtcRate = tradeSide === 'BUY' ? inrBuyRate : inrSellRate;
    effectiveSpreadBps = Math.round(((inrBuyRate - inrSellRate) / inrBuyRate) * 10000);
  } else {
    // Bulk tier discounts for non-INR
    if (primaryVolume >= 1000000) volumeDiscountBps = 6;
    else if (primaryVolume >= 250000) volumeDiscountBps = 3;

    effectiveSpreadBps = Math.max(2, deskSpreadBps - volumeDiscountBps);
    const spreadMultiplier = tradeSide === 'BUY' 
      ? 1 + (effectiveSpreadBps / 10000) 
      : 1 - (effectiveSpreadBps / 10000);

    lockedOtcRate = Number((rawRate * spreadMultiplier).toFixed(4));
  }

  // Recalculate counter amount when input or rate changes
  useEffect(() => {
    if (lastEdited === 'fiat') {
      const val = parseFloat(fiatAmount);
      if (!val || isNaN(val) || !lockedOtcRate) {
        setUsdtAmount('');
      } else {
        const calculatedUsdt = (val / lockedOtcRate).toFixed(2);
        setUsdtAmount(calculatedUsdt);
      }
    } else {
      const val = parseFloat(usdtAmount);
      if (!val || isNaN(val) || !lockedOtcRate) {
        setFiatAmount('');
      } else {
        const calculatedFiat = (val * lockedOtcRate).toFixed(isINR ? 0 : 2);
        setFiatAmount(calculatedFiat);
      }
    }
  }, [fiatAmount, usdtAmount, lastEdited, lockedOtcRate, tradeSide, isINR]);

  // Quote countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Generate new quote ID and reset timer
          setQuoteId(`Q-${Math.floor(100000 + Math.random() * 900000)}`);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Preset amounts adapted to currency
  const inrPresets = [
    { label: '₹1 Lakh', val: 100000 },
    { label: '₹5 Lakh', val: 500000 },
    { label: '₹10 Lakh', val: 1000000 },
    { label: '₹25 Lakh', val: 2500000 },
    { label: '₹1 Crore', val: 10000000 }
  ];

  const standardPresets = [
    { label: '$25K', val: 25000 },
    { label: '$50K', val: 50000 },
    { label: '$150K', val: 150000 },
    { label: '$500K', val: 500000 },
    { label: '$1M', val: 1000000 }
  ];

  const activePresets = isINR ? inrPresets : standardPresets;

  const handlePresetClick = (amount) => {
    setLastEdited('fiat');
    setFiatAmount(amount.toString());
  };

  const handleExecute = () => {
    const tradeData = {
      quoteId,
      side: tradeSide,
      currency: selectedCurrency,
      network: selectedNetwork,
      fiatAmount: parseFloat(fiatAmount) || 0,
      usdtAmount: parseFloat(usdtAmount) || 0,
      rate: lockedOtcRate,
      spreadBps: effectiveSpreadBps,
      recipientAddress,
      bankWireInfo,
      deskFeeUsdt: (isINR ? numFiat >= 2000000 : numFiat >= 100000) ? 0 : 20,
      timestamp: new Date().toISOString()
    };
    onExecuteTrade(tradeData);
  };

  return (
    <div className="rfq-desk-container">
      {/* Top Header Card */}
      <div className="rfq-header-banner glass-panel">
        <div className="rfq-banner-left">
          <div className="desk-tier-badge">
            <span className="pulse-dot"></span>
            INSTITUTIONAL OTC DESK • {isINR ? 'INR LIQUIDITY DESK' : 'MULTI-CURRENCY DESK'}
          </div>
          <h1 className="rfq-title">
            Institutional Tether (USDT) Liquidity Desk
          </h1>
          <p className="rfq-subtitle">
            Execute high-volume blocks with <strong>guaranteed locked pricing</strong>, transparent OTC spreads, and multi-network escrow settlements.
          </p>
        </div>
        <div className="rfq-banner-right">
          <div className="desk-features-grid">
            <div className="desk-feature-item">
              <Zap size={16} className="text-emerald" />
              <span>Multi-Chain Instant Delivery</span>
            </div>
            <div className="desk-feature-item">
              <ShieldCheck size={16} className="text-cyan" />
              <span>Segregated Tier-1 Escrow</span>
            </div>
            <div className="desk-feature-item">
              <Clock size={16} className="text-purple" />
              <span>Avg Settle: 2.1 Mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent USDT/INR Dual Price Hero Cards */}
      {isINR && (
        <div className="inr-dual-rate-hero glass-panel">
          <div className="inr-dual-hero-header">
            <div className="dual-hero-title-box">
              <span className="inr-flag-lg">🇮🇳</span>
              <div>
                <h2 className="dual-hero-heading">Live USDT / Indian Rupee (INR) OTC Rates</h2>
                <p className="dual-hero-sub">Direct OTC prime desk liquidity with guaranteed fixed execution prices.</p>
              </div>
            </div>

            {onOpenAdmin && (
              <button 
                type="button" 
                className="admin-quick-adjust-btn"
                onClick={onOpenAdmin}
                title="Adjust buying and selling rates in Admin Panel"
              >
                <Sliders size={14} />
                <span>Adjust Prices in Admin Panel</span>
              </button>
            )}
          </div>

          <div className="inr-hero-cards-grid">
            {/* BUY USDT CARD */}
            <div 
              className={`inr-hero-rate-card buy-hero-card ${tradeSide === 'BUY' ? 'active-hero-side' : ''}`}
              onClick={() => { setTradeSide('BUY'); setLastEdited('fiat'); }}
            >
              <div className="hero-card-badge-row">
                <span className="hero-side-badge buy-badge">
                  <TrendingUp size={13} />
                  <span>CLIENT BUY PRICE</span>
                </span>
                <span className="hero-action-pill">Desk Sells to You</span>
              </div>

              <div className="hero-rate-row">
                <span className="hero-rate-val mono text-emerald font-bold">
                  ₹{inrBuyRate.toFixed(2)}
                </span>
                <span className="hero-rate-unit">/ USDT</span>
              </div>

              <div className="hero-card-meta-row">
                <span className="hero-meta-text">Pay via IMPS / RTGS • Get USDT instantly</span>
                <span className="hero-select-btn">{tradeSide === 'BUY' ? '✓ Selected' : 'Select Buy'}</span>
              </div>
            </div>

            {/* SELL USDT CARD */}
            <div 
              className={`inr-hero-rate-card sell-hero-card ${tradeSide === 'SELL' ? 'active-hero-side' : ''}`}
              onClick={() => { setTradeSide('SELL'); setLastEdited('usdt'); }}
            >
              <div className="hero-card-badge-row">
                <span className="hero-side-badge sell-badge">
                  <TrendingDown size={13} />
                  <span>CLIENT SELL PRICE</span>
                </span>
                <span className="hero-action-pill">Desk Buys from You</span>
              </div>

              <div className="hero-rate-row">
                <span className="hero-rate-val mono text-cyan font-bold">
                  ₹{inrSellRate.toFixed(2)}
                </span>
                <span className="hero-rate-unit">/ USDT</span>
              </div>

              <div className="hero-card-meta-row">
                <span className="hero-meta-text">Send USDT • Direct credit to your Bank A/C</span>
                <span className="hero-select-btn">{tradeSide === 'SELL' ? '✓ Selected' : 'Select Sell'}</span>
              </div>
            </div>
          </div>

          <div className="inr-hero-footer-bar">
            <div className="spread-info-pill">
              <span className="spread-label">Desk Spread:</span>
              <span className="spread-val mono text-emerald font-bold">
                ₹{(inrBuyRate - inrSellRate).toFixed(2)} INR
              </span>
              <span className="spread-pct text-muted">
                ({(((inrBuyRate - inrSellRate) / inrBuyRate) * 100).toFixed(2)}% margin)
              </span>
            </div>
            <div className="zero-fees-pill">
              <CheckCircle2 size={13} className="text-emerald" />
              <span>Zero Slippage • Locked Escrow Clearing</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Trading Terminal Grid */}
      <div className="rfq-grid">
        {/* Left Column: RFQ Form */}
        <div className="rfq-form-card glass-panel">
          {/* Side Switcher (Buy vs Sell) */}
          <div className="side-switcher-bar">
            <button
              className={`side-switch-btn ${tradeSide === 'BUY' ? 'active-buy' : ''}`}
              onClick={() => { setTradeSide('BUY'); setLastEdited('fiat'); }}
            >
              <div className="btn-main-label">
                <span>BUY USDT</span>
                {isINR && <span className="btn-rate-chip buy-rate-chip mono">₹{inrBuyRate.toFixed(2)}</span>}
              </div>
              <small>Deposit {selectedCurrency.code} • Receive USDT</small>
            </button>
            <button
              className={`side-switch-btn ${tradeSide === 'SELL' ? 'active-sell' : ''}`}
              onClick={() => { setTradeSide('SELL'); setLastEdited('usdt'); }}
            >
              <div className="btn-main-label">
                <span>SELL USDT</span>
                {isINR && <span className="btn-rate-chip sell-rate-chip mono">₹{inrSellRate.toFixed(2)}</span>}
              </div>
              <small>Deposit USDT • Receive {selectedCurrency.code}</small>
            </button>
          </div>

          {/* Currency & Preset volume bar */}
          <div className="volume-presets-row">
            <span className="preset-label">Block Presets:</span>
            <div className="preset-chips">
              {activePresets.map(preset => (
                <button
                  key={preset.val}
                  className={`preset-chip ${fiatAmount === preset.val.toString() ? 'selected' : ''}`}
                  onClick={() => handlePresetClick(preset.val)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box 1: You Pay */}
          <div className="rfq-input-card">
            <div className="rfq-input-header">
              <label className="rfq-input-label">
                {tradeSide === 'BUY' ? `YOU SEND (${selectedCurrency.code} TRANSFER)` : 'YOU SEND (USDT)'}
              </label>
              <span className="balance-hint mono">
                {tradeSide === 'SELL' 
                  ? `Avail: ${(walletBalance?.totalUsdt || 348500).toLocaleString()} USDT` 
                  : `Limit: ${selectedCurrency.symbol}${selectedCurrency.minTrade.toLocaleString()} - ${selectedCurrency.symbol}${selectedCurrency.maxTrade.toLocaleString()}`
                }
              </span>
            </div>

            <div className="rfq-input-row">
              <input
                type="number"
                className="rfq-amount-input mono"
                placeholder="0.00"
                value={tradeSide === 'BUY' ? fiatAmount : usdtAmount}
                onChange={(e) => {
                  if (tradeSide === 'BUY') {
                    setLastEdited('fiat');
                    setFiatAmount(e.target.value);
                  } else {
                    setLastEdited('usdt');
                    setUsdtAmount(e.target.value);
                  }
                }}
              />

              {tradeSide === 'BUY' ? (
                /* Fiat Currency Selector */
                <div className="currency-selector-pill">
                  <select
                    value={selectedCurrency.code}
                    onChange={(e) => {
                      const found = FIAT_CURRENCIES.find(c => c.code === e.target.value);
                      if (found) setSelectedCurrency(found);
                    }}
                    className="currency-select"
                  >
                    {FIAT_CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.flag} {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* USDT Asset Badge */
                <div className="asset-tag-pill">
                  <span className="usdt-icon-sm">₮</span>
                  <span className="asset-code">USDT</span>
                </div>
              )}
            </div>
          </div>

          {/* Central Interchange Divider */}
          <div className="rfq-divider-wrap">
            <div className="rfq-divider-line"></div>
            <div className="rfq-divider-badge">
              <ArrowDownUp size={15} />
              <span>
                LOCKED {tradeSide === 'BUY' ? 'BUY' : 'SELL'} RATE: 1 USDT = {selectedCurrency.symbol}{lockedOtcRate.toFixed(isINR ? 2 : 4)} {selectedCurrency.code}
              </span>
            </div>
            <div className="rfq-divider-line"></div>
          </div>

          {/* Input Box 2: You Receive */}
          <div className="rfq-input-card">
            <div className="rfq-input-header">
              <label className="rfq-input-label">
                {tradeSide === 'BUY' ? 'YOU RECEIVE (USDT NET)' : `YOU RECEIVE (${selectedCurrency.code} BANK WIRE)`}
              </label>
              <span className="badge-emerald-subtle">
                <CheckCircle2 size={12} /> Guaranteed Fixed Price
              </span>
            </div>

            <div className="rfq-input-row">
              <input
                type="number"
                className="rfq-amount-input mono highlight-amount"
                placeholder="0.00"
                value={tradeSide === 'BUY' ? usdtAmount : fiatAmount}
                onChange={(e) => {
                  if (tradeSide === 'BUY') {
                    setLastEdited('usdt');
                    setUsdtAmount(e.target.value);
                  } else {
                    setLastEdited('fiat');
                    setFiatAmount(e.target.value);
                  }
                }}
              />

              {tradeSide === 'BUY' ? (
                /* USDT Asset Badge */
                <div className="asset-tag-pill">
                  <span className="usdt-icon-sm">₮</span>
                  <span className="asset-code">USDT</span>
                </div>
              ) : (
                /* Fiat Currency Selector */
                <div className="currency-selector-pill">
                  <select
                    value={selectedCurrency.code}
                    onChange={(e) => {
                      const found = FIAT_CURRENCIES.find(c => c.code === e.target.value);
                      if (found) setSelectedCurrency(found);
                    }}
                    className="currency-select"
                  >
                    {FIAT_CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.flag} {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Network Selector */}
          <div className="network-selection-section">
            <div className="network-section-header">
              <label className="network-label">
                SETTLEMENT NETWORK FOR USDT
              </label>
              <span className="network-hint">
                Selected: <strong>{selectedNetwork.name}</strong> • Fee: ${selectedNetwork.feeUsdt.toFixed(2)} USDT
              </span>
            </div>

            <div className="network-pills-grid">
              {USDT_NETWORKS.map(net => (
                <button
                  key={net.id}
                  className={`network-chip ${selectedNetwork.id === net.id ? 'active' : ''}`}
                  onClick={() => setSelectedNetwork(net)}
                >
                  <span className="net-icon">{net.icon}</span>
                  <div className="net-details">
                    <span className="net-name">{net.short}</span>
                    <span className="net-speed mono">{net.speed}</span>
                  </div>
                  {net.isPopular && <span className="net-popular-badge">Fast</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Destination Details / Delivery Info */}
          <div className="delivery-destination-card">
            {tradeSide === 'BUY' ? (
              <div>
                <div className="dest-header">
                  <span className="dest-title">Recipient USDT Wallet Address ({selectedNetwork.short}):</span>
                  <span className="dest-status-ok">Valid Checksum</span>
                </div>
                <input
                  type="text"
                  className="dest-input mono"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder={`Enter your ${selectedNetwork.short} wallet address`}
                />
              </div>
            ) : (
              <div>
                <div className="dest-header">
                  <span className="dest-title">Receiving Bank Details ({selectedCurrency.code}):</span>
                  <span className="dest-status-ok">Direct Rails</span>
                </div>
                <input
                  type="text"
                  className="dest-input mono"
                  value={bankWireInfo}
                  onChange={(e) => setBankWireInfo(e.target.value)}
                  placeholder={isINR ? "Bank Name, IFSC Code, Account Number" : "Bank Name, IBAN / SWIFT, Account Number"}
                />
              </div>
            )}
          </div>

          {/* Firm Quote Locking Action Bar */}
          <div className="quote-action-bar">
            <div className="quote-timer-block">
              <div className="circular-countdown">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle"
                    strokeDasharray={`${(timeLeft / 15) * 100}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="countdown-number mono">{timeLeft}s</span>
              </div>
              <div className="quote-id-col">
                <span className="quote-id-label">FIRM QUOTE REF</span>
                <span className="quote-id-val mono">{quoteId}</span>
              </div>
            </div>

            <button
              className="btn-primary rfq-execute-btn"
              onClick={handleExecute}
              disabled={!numFiat || !numUsdt || numFiat <= 0}
            >
              <Lock size={17} />
              <span>LOCK & EXECUTE RFQ</span>
            </button>
          </div>
        </div>

        {/* Right Column: Institutional Execution Analytics & Breakdown */}
        <div className="rfq-insights-col">
          {/* Order Summary & Fee Schedule Card */}
          <div className="breakdown-card glass-panel">
            <div className="breakdown-header">
              <h3>Institutional Order Matrix</h3>
              <span className="badge-purple">Direct Desk Routing</span>
            </div>

            <div className="breakdown-list">
              <div className="breakdown-row">
                <span className="row-label">Base Benchmark Rate</span>
                <span className="row-value mono">
                  1 USDT = {selectedCurrency.symbol}{rawRate.toFixed(isINR ? 2 : 4)} {selectedCurrency.code}
                </span>
              </div>

              <div className="breakdown-row">
                <span className="row-label">
                  Desk Spread Margin ({effectiveSpreadBps} bps)
                  {volumeDiscountBps > 0 && <span className="rebate-tag">-{volumeDiscountBps}bps Rebate</span>}
                </span>
                <span className="row-value mono text-emerald">
                  +{((lockedOtcRate - rawRate) * (tradeSide === 'BUY' ? 1 : -1)).toFixed(isINR ? 2 : 4)} {selectedCurrency.code}
                </span>
              </div>

              <div className="breakdown-row">
                <span className="row-label">Execution Pricing</span>
                <span className="row-value mono text-emerald font-bold">
                  Guaranteed Fixed Rate
                </span>
              </div>

              <div className="breakdown-row">
                <span className="row-label">Valence Desk Commission</span>
                <span className="row-value mono text-emerald">
                  {(isINR ? numFiat >= 2000000 : primaryVolume >= 100000) ? '0.00% (Waived for Block Size)' : '$20.00 USDT'}
                </span>
              </div>

              <div className="breakdown-row">
                <span className="row-label">Estimated Blockchain Gas</span>
                <span className="row-value mono">
                  ${selectedNetwork.feeUsdt.toFixed(2)} USDT ({selectedNetwork.short})
                </span>
              </div>

              <div className="breakdown-row highlight-row">
                <span className="row-label font-bold">Total Settlement Amount</span>
                <span className="row-value mono text-main font-bold">
                  {tradeSide === 'BUY'
                    ? `${(parseFloat(usdtAmount) || 0).toLocaleString()} USDT`
                    : `${selectedCurrency.symbol}${(parseFloat(fiatAmount) || 0).toLocaleString()} ${selectedCurrency.code}`
                  }
                </span>
              </div>
            </div>

            {/* Firm Execution Guarantee Banner */}
            <div className="savings-banner">
              <Sparkles size={16} className="text-emerald" />
              <div>
                <div className="savings-title">Firm OTC Execution Guarantee</div>
                <div className="savings-desc">
                  All executed quantities settle strictly at the locked unit price of <strong className="text-emerald font-bold mono">{selectedCurrency.symbol}{lockedOtcRate.toFixed(isINR ? 2 : 4)} {selectedCurrency.code}</strong> with immediate smart escrow reservation.
                </div>
              </div>
            </div>
          </div>

          {/* Liquidity & Custody Safeguards Card */}
          <div className="safeguards-card glass-panel">
            <h4 className="safeguard-title">Desk Settlement Safeguards</h4>
            <div className="safeguard-item">
              <div className="safeguard-icon-box text-emerald">
                <ShieldCheck size={18} />
              </div>
              <div className="safeguard-text">
                <strong>Segregated Escrow Multi-Sig</strong>
                <p>USDT liquidity is locked on-chain in verified smart vaults before fiat dispatch.</p>
              </div>
            </div>

            <div className="safeguard-item">
              <div className="safeguard-icon-box text-cyan">
                <Zap size={18} />
              </div>
              <div className="safeguard-text">
                <strong>Instant Banking Rails ({selectedCurrency.paymentMethods[0]})</strong>
                <p>Automated transfer reference tracking ensures releases occur within minutes of fiat credit.</p>
              </div>
            </div>

            <div className="safeguard-item">
              <div className="safeguard-icon-box text-purple">
                <Clock size={18} />
              </div>
              <div className="safeguard-text">
                <strong>Proof of Reserve (PoR) 1:1</strong>
                <p>All USDT backed 1:1 with real-time verifiable on-chain treasury balances.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
