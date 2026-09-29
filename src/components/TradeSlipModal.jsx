import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText,
  ExternalLink,
  Download
} from 'lucide-react';

export function TradeSlipModal({ trade, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!trade) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isBuy = trade.side === 'BUY' || trade.side === 'BUY_USDT';

  return (
    <div className="modal-backdrop">
      <div className="modal-content trade-slip-modal-content">
        {/* Top Control Bar (Hidden during print) */}
        <div className="trade-slip-topbar no-print">
          <div className="slip-top-left">
            <FileText size={18} className="text-emerald" />
            <span className="slip-top-title">Official Institutional Trade Confirmation</span>
          </div>
          <div className="slip-top-actions">
            <button className="btn-secondary slip-action-btn" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print Slip</span>
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* The Printable Trade Slip Sheet */}
        <div className="trade-slip-sheet">
          {/* Slip Header */}
          <div className="slip-header-row">
            <div className="slip-brand">
              <div className="slip-logo-gem">₮</div>
              <div>
                <h2 className="slip-brand-name">VALENCE CAPITAL OTC</h2>
                <div className="slip-brand-sub">INSTITUTIONAL LIQUIDITY & ESCROW MARKETS</div>
                <div className="slip-vasp-id mono">LEI: 549300VLC0994TC8820 • VASP REG #DX-9941</div>
              </div>
            </div>

            <div className="slip-meta-box">
              <div className="slip-badge-status">
                <CheckCircle2 size={14} className="text-emerald" />
                <span>SETTLED & CLEARED</span>
              </div>
              <div className="slip-ref-no mono">
                TRADE ID: <strong>{trade.id || trade.quoteId || 'OTC-99421'}</strong>
              </div>
              <div className="slip-date mono">
                EXECUTED: {trade.timestamp || trade.settledAt || new Date().toISOString()}
              </div>
            </div>
          </div>

          <div className="slip-divider"></div>

          {/* Section: Trade Overview */}
          <div className="slip-section-title">1. EXECUTION SPECIFICATIONS</div>
          <div className="slip-grid-2">
            <div className="slip-kv-box">
              <span className="kv-label">TRADE TYPE</span>
              <span className="kv-val font-bold">
                {isBuy ? 'OVER-THE-COUNTER PURCHASE (BUY USDT)' : 'OVER-THE-COUNTER LIQUIDATION (SELL USDT)'}
              </span>
            </div>
            <div className="slip-kv-box">
              <span className="kv-label">SETTLEMENT ASSET</span>
              <span className="kv-val font-bold text-emerald">
                Tether USD (USDT)
              </span>
            </div>
            <div className="slip-kv-box">
              <span className="kv-label">NOTIONAL USDT VOLUME</span>
              <span className="kv-val mono font-bold text-main">
                {(trade.amountUsdt || trade.usdtAmount || 150000).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </span>
            </div>
            <div className="slip-kv-box">
              <span className="kv-label">FIAT EQUIVALENT SETTLED</span>
              <span className="kv-val mono font-bold">
                {trade.currency?.symbol || '$'}{(trade.fiatAmount || 150030).toLocaleString('en-US', { minimumFractionDigits: 2 })} {trade.currency?.code || trade.fiatCode || 'USD'}
              </span>
            </div>
            <div className="slip-kv-box">
              <span className="kv-label">LOCKED EXECUTION RATE</span>
              <span className="kv-val mono font-bold">
                1 USDT = {trade.currency?.symbol || '$'}{(trade.rate || 1.0002).toFixed(4)} {trade.currency?.code || trade.fiatCode || 'USD'}
              </span>
            </div>
            <div className="slip-kv-box">
              <span className="kv-label">DELIVERY NETWORK</span>
              <span className="kv-val font-bold">
                {trade.network?.name || trade.network || 'TRON (TRC-20)'}
              </span>
            </div>
          </div>

          <div className="slip-divider"></div>

          {/* Section: Counterparty & Escrow Details */}
          <div className="slip-section-title">2. COUNTERPARTY & SETTLEMENT RAILS</div>
          <div className="slip-grid-2">
            <div className="slip-kv-box">
              <span className="kv-label">LIQUIDITY DESK</span>
              <span className="kv-val font-bold">
                {trade.counterparty || 'Valence Institutional Prime Desk'}
              </span>
            </div>
            <div className="slip-kv-box">
              <span className="kv-label">CLIENT PROFILE</span>
              <span className="kv-val font-bold">
                Apex Corporate Treasury (Tier 3 KYB Verified)
              </span>
            </div>
            <div className="slip-kv-box full-width">
              <span className="kv-label">BLOCKCHAIN TRANSACTION HASH</span>
              <div className="slip-hash-row">
                <span className="mono slip-hash-text">
                  {trade.txHash || '9a3f2c58e1b049d95f87b8d3f545acb879e6f4773a9089f2e347c6a9b4d81234'}
                </span>
                <button 
                  className="copy-btn-sm no-print"
                  onClick={() => copyToClipboard(trade.txHash || '9a3f2c58e1b049d95f87b8d3f545acb879e6f4773a9089f2e347c6a9b4d81234', 'txHash')}
                >
                  {copiedKey === 'txHash' ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <div className="slip-kv-box full-width">
              <span className="kv-label">SETTLEMENT ESCROW IDENTIFIER</span>
              <span className="mono font-bold text-cyan">
                {trade.escrowId || 'ESC-4890-MULTI-SIG-VAULT'}
              </span>
            </div>
          </div>

          <div className="slip-divider"></div>

          {/* Signatures & Legal Disclaimer */}
          <div className="slip-footer-row">
            <div className="slip-disclaimer">
              <p>
                This trade confirmation constitutes a binding legal record of execution under the Valence OTC Master Participation Agreement. Transactions in USDT are final and irrevocable once confirmed by consensus on the designated distributed ledger.
              </p>
            </div>
            <div className="slip-signature-box">
              <div className="signature-line mono">Marcus Vance, CFA</div>
              <div className="signature-title">Managing Director of Liquidity</div>
              <div className="signature-badge">DIGITALLY SIGNED & VERIFIED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
