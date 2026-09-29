import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Layers, 
  Zap,
  Building,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { INITIAL_DESK_RFQS } from '../data/mockData';

export function DeskOperatorConsole({ 
  deskSpreadBps, 
  setDeskSpreadBps, 
  onApproveRFQ,
  adminPricing,
  onOpenAdmin
}) {
  const [rfqQueue, setRfqQueue] = useState(INITIAL_DESK_RFQS);
  const [autoQuoteEnabled, setAutoQuoteEnabled] = useState(true);
  const [actionNotice, setActionNotice] = useState(null);

  const handleApprove = (rfq) => {
    setRfqQueue(prev => prev.filter(item => item.id !== rfq.id));
    setActionNotice(`Approved firm quote ${rfq.id} for ${rfq.client} ($${rfq.amountUsdt.toLocaleString()} USDT on ${rfq.requestedNetwork})`);
    setTimeout(() => setActionNotice(null), 4000);
    if (onApproveRFQ) onApproveRFQ(rfq);
  };

  const handleReject = (rfqId) => {
    setRfqQueue(prev => prev.filter(item => item.id !== rfqId));
    setActionNotice(`Declined RFQ ${rfqId}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="desk-console-container">
      {/* Console Top Header */}
      <div className="desk-console-banner glass-panel">
        <div className="console-banner-left">
          <div className="desk-admin-badge">
            <span className="pulse-amber"></span>
            LIQUIDITY DESK OPERATOR CONSOLE
          </div>
          <h1 className="console-title">Valence Market Maker & Desk Engine</h1>
          <p className="console-sub">
            Real-time management of OTC pricing margins, desk spread basis points, institutional RFQ approvals, and multi-sig escrow clearing.
          </p>
        </div>

        <div className="console-banner-right">
          <div className="desk-toggle-card">
            <span className="toggle-label">Auto-Quoting Engine (&lt;$500k):</span>
            <button 
              className={`auto-quote-toggle ${autoQuoteEnabled ? 'toggle-on' : 'toggle-off'}`}
              onClick={() => setAutoQuoteEnabled(!autoQuoteEnabled)}
            >
              <span className="toggle-indicator"></span>
              <span>{autoQuoteEnabled ? 'ENABLED' : 'PAUSED'}</span>
            </button>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="console-action-banner">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Grid: Left: Spread Control & Risk, Right: Pending RFQ Queue */}
      <div className="console-grid">
        {/* Left Column: Pricing & Spread Engine */}
        <div className="console-left-col">
          {/* INR Dual Price Active Overview Card */}
          <div className="desk-card glass-panel inr-operator-card">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">USDT / INR Fixed Desk Rates</h3>
                <p className="card-sub">Active live buying and selling rates quoted to Indian clients.</p>
              </div>
              {onOpenAdmin && (
                <button 
                  type="button" 
                  className="btn-primary admin-jump-btn"
                  onClick={onOpenAdmin}
                >
                  <SlidersHorizontal size={13} />
                  <span>Open Rate Admin Panel</span>
                </button>
              )}
            </div>

            <div className="operator-rates-grid">
              <div className="op-rate-box op-buy-box">
                <span className="op-rate-lbl">Client Buy Price:</span>
                <span className="op-rate-val mono text-emerald font-bold">
                  ₹{adminPricing?.buyPriceInr?.toFixed(2) || '90.25'}
                </span>
                <span className="op-rate-sub">Desk Sells USDT</span>
              </div>
              <div className="op-rate-box op-sell-box">
                <span className="op-rate-lbl">Client Sell Price:</span>
                <span className="op-rate-val mono text-cyan font-bold">
                  ₹{adminPricing?.sellPriceInr?.toFixed(2) || '88.80'}
                </span>
                <span className="op-rate-sub">Desk Buys USDT</span>
              </div>
            </div>
            <div className="op-spread-bar">
              <span>Spread: <strong>₹{((adminPricing?.buyPriceInr || 90.25) - (adminPricing?.sellPriceInr || 88.80)).toFixed(2)} INR</strong></span>
              <span className="text-secondary">• Direct IMPS / RTGS Settlement Rails</span>
            </div>
          </div>

          {/* Desk Spread Slider Card */}
          <div className="desk-card glass-panel">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">OTC Desk Spread & Markup</h3>
                <p className="card-sub">Controls the basis points added/deducted from spot benchmark for all client RFQs.</p>
              </div>
              <span className="spread-pill mono text-amber font-bold">
                +{deskSpreadBps} BPS
              </span>
            </div>

            <div className="spread-slider-wrap">
              <input
                type="range"
                min="4"
                max="50"
                step="1"
                value={deskSpreadBps}
                onChange={(e) => setDeskSpreadBps(parseInt(e.target.value, 10))}
                className="spread-range-slider"
              />
              <div className="slider-ticks mono">
                <span>Tight (4 bps)</span>
                <span>Standard (12 bps)</span>
                <span>Wide (50 bps)</span>
              </div>
            </div>

            <div className="spread-impact-box">
              <div className="impact-item">
                <span className="i-label">Desk Margin on $1M Block:</span>
                <span className="i-val mono text-emerald font-bold">
                  +${((1000000 * deskSpreadBps) / 10000).toLocaleString()} USD
                </span>
              </div>
              <div className="impact-item">
                <span className="i-label">Client Quote Parity (USDT/USD):</span>
                <span className="i-val mono text-main">
                  ${(1.0002 * (1 + deskSpreadBps / 10000)).toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Treasury Liquidity Matrix */}
          <div className="desk-card glass-panel">
            <h3 className="card-title">Multi-Sig Treasury Liquidity</h3>
            <p className="card-sub">Available segregated reserves ready for immediate block execution.</p>

            <div className="treasury-list">
              <div className="treasury-row">
                <span className="t-chain">TRON (TRC-20)</span>
                <span className="t-bal mono font-bold text-emerald">$24,500,000 USDT</span>
                <span className="badge-emerald">Healthy</span>
              </div>
              <div className="treasury-row">
                <span className="t-chain">Ethereum (ERC-20)</span>
                <span className="t-bal mono font-bold text-emerald">$12,200,000 USDT</span>
                <span className="badge-emerald">Healthy</span>
              </div>
              <div className="treasury-row">
                <span className="t-chain">BNB Chain (BEP-20)</span>
                <span className="t-bal mono font-bold text-emerald">$4,800,000 USDT</span>
                <span className="badge-emerald">Healthy</span>
              </div>
              <div className="treasury-row">
                <span className="t-chain">Solana (SPL)</span>
                <span className="t-bal mono font-bold text-emerald">$1,620,000 USDT</span>
                <span className="badge-cyan">High Velocity</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pending RFQ Queue */}
        <div className="console-right-col">
          <div className="desk-card glass-panel">
            <div className="card-header-row">
              <div>
                <h3 className="card-title">Pending Institutional RFQs</h3>
                <p className="card-sub">Live requests from Tier 2 & Tier 3 clients awaiting desk confirmation.</p>
              </div>
              <span className="queue-count-badge mono">
                {rfqQueue.length} Pending
              </span>
            </div>

            {rfqQueue.length === 0 ? (
              <div className="empty-queue-box">
                <CheckCircle2 size={32} className="text-emerald" />
                <p>All institutional quotes currently cleared or automated.</p>
              </div>
            ) : (
              <div className="rfq-queue-list">
                {rfqQueue.map(rfq => (
                  <div key={rfq.id} className="queue-item-card">
                    <div className="queue-item-top">
                      <div>
                        <div className="queue-client-name">
                          <strong>{rfq.client}</strong>
                          <span className="badge-purple">{rfq.tier}</span>
                        </div>
                        <div className="queue-meta mono text-secondary">
                          Ref: {rfq.id} • {rfq.timestamp} • Time Left: <span className="text-amber font-bold">{rfq.timeLeftSeconds}s</span>
                        </div>
                      </div>

                      <div className="queue-type-badge">
                        <span className={rfq.type === 'BUY' ? 'badge-emerald' : 'badge-amber'}>
                          {rfq.type === 'BUY' ? 'CLIENT BUYING USDT' : 'CLIENT SELLING USDT'}
                        </span>
                      </div>
                    </div>

                    <div className="queue-numbers-grid">
                      <div className="q-num-box">
                        <span className="q-lbl">Requested Volume</span>
                        <span className="q-val mono font-bold">
                          {rfq.amountUsdt.toLocaleString()} USDT
                        </span>
                      </div>
                      <div className="q-num-box">
                        <span className="q-lbl">Delivery Network</span>
                        <span className="q-val mono text-cyan font-bold">
                          {rfq.requestedNetwork}
                        </span>
                      </div>
                      <div className="q-num-box">
                        <span className="q-lbl">Desk Spread</span>
                        <span className="q-val mono text-emerald font-bold">
                          +{rfq.spreadBps} bps
                        </span>
                      </div>
                    </div>

                    <div className="queue-actions-row">
                      <button 
                        className="btn-secondary q-reject-btn"
                        onClick={() => handleReject(rfq.id)}
                      >
                        <X size={15} />
                        <span>Decline Quote</span>
                      </button>
                      <button 
                        className="btn-primary q-approve-btn"
                        onClick={() => handleApprove(rfq)}
                      >
                        <Check size={16} />
                        <span>Approve Firm Quote</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
