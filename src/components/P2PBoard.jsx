import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  Building,
  Sliders,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { INITIAL_MERCHANTS, FIAT_CURRENCIES } from '../data/mockData';
import { P2PTradeModal } from './P2PTradeModal';

export function P2PBoard({ onTradeComplete, adminPricing, onOpenAdmin }) {
  const [tradeType, setTradeType] = useState('BUY'); // 'BUY' = user wants to buy USDT, 'SELL' = user wants to sell USDT
  const [selectedFiat, setSelectedFiat] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [activeMerchantModal, setActiveMerchantModal] = useState(null);

  const buyPrice = adminPricing?.buyPriceInr || 90.25;
  const sellPrice = adminPricing?.sellPriceInr || 88.80;

  // Dynamically map merchants with admin pricing for INR desks
  const merchantsWithLivePricing = INITIAL_MERCHANTS.map(m => {
    if (m.fiatCode === 'INR') {
      const isOfficialDesk = m.isDesk;
      const rate = m.type === 'SELL' 
        ? (isOfficialDesk ? buyPrice : Number((buyPrice - 0.15).toFixed(2)))
        : (isOfficialDesk ? sellPrice : Number((sellPrice - 0.20).toFixed(2)));
      return {
        ...m,
        unitPrice: rate
      };
    }
    return m;
  });

  // Filter listings
  const filteredMerchants = merchantsWithLivePricing.filter(m => {
    // If tradeType is BUY, we show merchants where type === 'SELL' (selling to user)
    // If tradeType is SELL, we show merchants where type === 'BUY' (buying from user)
    const matchType = tradeType === 'BUY' ? m.type === 'SELL' : m.type === 'BUY';
    const matchFiat = selectedFiat === 'ALL' || m.fiatCode === selectedFiat;
    const matchMethod = selectedMethod === 'ALL' || m.paymentMethods.some(pm => pm.toLowerCase().includes(selectedMethod.toLowerCase()));
    return matchType && matchFiat && matchMethod;
  });

  return (
    <div className="p2p-board-container">
      {/* Top Banner */}
      <div className="p2p-header-banner glass-panel">
        <div className="p2p-banner-text">
          <div className="desk-tier-badge">
            <span className="pulse-dot"></span> VERIFIED MERCHANT DESKS
          </div>
          <h1 className="p2p-title">Institutional Direct & P2P Board</h1>
          <p className="p2p-subtitle">
            Trade USDT directly with verified institutional liquidity providers and private wealth desks. 100% smart contract escrow secured.
          </p>

          {/* Prominent Live INR Dual Rate Benchmark Badge */}
          <div className="p2p-inr-benchmark-card">
            <div className="p2p-bench-left">
              <span className="inr-flag">🇮🇳</span>
              <span className="bench-title">Official Desk Benchmark:</span>
              <div className="bench-duo mono">
                <span className="bench-buy text-emerald font-bold">BUY: ₹{buyPrice.toFixed(2)}</span>
                <span className="bench-sep">•</span>
                <span className="bench-sell text-cyan font-bold">SELL: ₹{sellPrice.toFixed(2)}</span>
              </div>
            </div>
            {onOpenAdmin && (
              <button 
                type="button" 
                className="bench-admin-btn"
                onClick={onOpenAdmin}
                title="Adjust pricing in Admin Panel"
              >
                <Sliders size={13} />
                <span>Adjust in Admin Panel</span>
              </button>
            )}
          </div>
        </div>
        <div className="p2p-banner-stats">
          <div className="p2p-stat-box">
            <span className="p2p-stat-val text-emerald mono">100%</span>
            <span className="p2p-stat-lbl">Escrow Backed</span>
          </div>
          <div className="p2p-stat-box">
            <span className="p2p-stat-val text-cyan mono">&lt; 2.5 min</span>
            <span className="p2p-stat-lbl">Avg Settle Time</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Buy/Sell, Currency tabs, and Payment filter */}
      <div className="p2p-filter-bar glass-panel">
        <div className="p2p-type-pills">
          <button 
            className={`p2p-type-btn ${tradeType === 'BUY' ? 'active-buy' : ''}`}
            onClick={() => setTradeType('BUY')}
          >
            Buy USDT
          </button>
          <button 
            className={`p2p-type-btn ${tradeType === 'SELL' ? 'active-sell' : ''}`}
            onClick={() => setTradeType('SELL')}
          >
            Sell USDT
          </button>
        </div>

        {/* Currency Tabs */}
        <div className="p2p-currency-chips">
          {['ALL', 'USD', 'EUR', 'GBP', 'AED', 'INR'].map(code => (
            <button
              key={code}
              className={`p2p-curr-chip ${selectedFiat === code ? 'selected' : ''}`}
              onClick={() => setSelectedFiat(code)}
            >
              {code}
            </button>
          ))}
        </div>

        {/* Payment Method filter */}
        <div className="p2p-method-select-wrap">
          <select 
            className="p2p-method-select"
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
          >
            <option value="ALL">All Payment Methods</option>
            <option value="wire">Bank Wire / Fedwire</option>
            <option value="sepa">SEPA Instant</option>
            <option value="revolut">Revolut</option>
            <option value="cash">Cash Desk (Dubai / London)</option>
            <option value="rtgs">IMPS / RTGS</option>
          </select>
        </div>
      </div>

      {/* Listings Table / Cards */}
      <div className="p2p-listings-grid">
        {filteredMerchants.length === 0 ? (
          <div className="no-listings-card glass-panel">
            <p>No desk listings found matching your current filter criteria.</p>
            <button 
              className="btn-secondary" 
              onClick={() => { setSelectedFiat('ALL'); setSelectedMethod('ALL'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredMerchants.map(merchant => (
            <div key={merchant.id} className="merchant-card glass-panel">
              {/* Merchant Details Row */}
              <div className="merchant-main-col">
                <div className="merchant-header-row">
                  <div className="merchant-avatar">
                    <Building size={18} />
                  </div>
                  <div>
                    <div className="merchant-name-wrap">
                      <span className="m-name">{merchant.name}</span>
                      <span className="badge-emerald">{merchant.badge}</span>
                    </div>
                    <div className="m-sub-stats">
                      <span>{merchant.completedTrades.toLocaleString()} orders</span>
                      <span className="dot-divider">•</span>
                      <span className="text-emerald font-bold">{merchant.completionRate}</span>
                      <span className="dot-divider">•</span>
                      <span>Avg: {merchant.avgSpeed}</span>
                    </div>
                  </div>
                </div>

                {/* Terms snippet */}
                <p className="merchant-terms-snippet">
                  "{merchant.terms.slice(0, 115)}..."
                </p>

                {/* Networks accepted */}
                <div className="merchant-chains-row">
                  <span className="chains-label">Settles on:</span>
                  {merchant.chains.map(c => (
                    <span key={c} className="chain-tag mono">{c}</span>
                  ))}
                </div>
              </div>

              {/* Price & Limits Column */}
              <div className="merchant-pricing-col">
                <div className="m-price-box">
                  <span className="m-price-label">Desk Unit Price</span>
                  <span className="m-price-val mono font-bold">
                    {merchant.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 4 })} <small>{merchant.fiatCode}</small>
                  </span>
                </div>

                <div className="m-limit-box">
                  <div className="m-limit-row">
                    <span className="lbl">Available:</span>
                    <span className="val mono font-bold text-emerald">
                      {merchant.availableUsdt.toLocaleString()} USDT
                    </span>
                  </div>
                  <div className="m-limit-row">
                    <span className="lbl">Trade Limit:</span>
                    <span className="val mono">
                      ${merchant.minLimitUsdt.toLocaleString()} - ${merchant.maxLimitUsdt.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods & Action Button */}
              <div className="merchant-action-col">
                <div className="m-payments-list">
                  {merchant.paymentMethods.map(pm => (
                    <span key={pm} className="pm-tag">{pm}</span>
                  ))}
                </div>

                <button 
                  className="btn-primary m-trade-btn"
                  onClick={() => setActiveMerchantModal(merchant)}
                >
                  <span>{tradeType === 'BUY' ? 'Buy USDT' : 'Sell USDT'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Modal */}
      {activeMerchantModal && (
        <P2PTradeModal
          merchant={activeMerchantModal}
          tradeType={tradeType}
          onClose={() => setActiveMerchantModal(null)}
          onTradeComplete={(trade) => {
            setActiveMerchantModal(null);
            if (onTradeComplete) onTradeComplete(trade);
          }}
        />
      )}
    </div>
  );
}
