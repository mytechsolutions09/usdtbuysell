import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  ArrowRight, 
  Lock, 
  Loader2, 
  Check,
  Building,
  AlertCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function RFQSettlementModal({ 
  trade, 
  onClose, 
  onViewTradeSlip, 
  onCompleteTrade,
  adminPricing
}) {
  const [step, setStep] = useState(1); // 1: Quote Locked, 2: Escrow & Wire, 3: Verifying, 4: Settled
  const [copiedKey, setCopiedKey] = useState(null);
  const [wireRefInput, setWireRefInput] = useState(`VAL-${Math.floor(100000 + Math.random() * 900000)}`);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    // Generate simulated realistic tx hash
    const prefix = trade.network.id === 'trc20' ? '' : '0x';
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setTxHash(`${prefix}${randomHex}`);
  }, [trade]);

  // Stage 3 to 4 auto advance simulation
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setStep(4);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // fallback
        }
        if (onCompleteTrade) {
          onCompleteTrade({
            ...trade,
            txHash,
            status: 'COMPLETED',
            settledAt: new Date().toISOString()
          });
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [step, trade, txHash, onCompleteTrade]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isBuy = trade.side === 'BUY';

  return (
    <div className="modal-backdrop">
      <div className="modal-content settlement-modal-content">
        {/* Header */}
        <div className="settlement-header">
          <div className="settlement-header-left">
            <span className="badge-emerald">
              <Lock size={12} /> SECURE ESCROW SETTLEMENT
            </span>
            <h2 className="settlement-title">
              {isBuy ? 'Institutional USDT Purchase' : 'USDT Liquidity Liquidation'}
            </h2>
            <span className="settlement-ref mono">Ref: {trade.quoteId}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="settlement-stepper">
          {[
            { num: 1, label: 'Quote Locked' },
            { num: 2, label: isBuy ? 'Bank Wire / Escrow' : 'Deposit USDT' },
            { num: 3, label: 'Clearing & Audit' },
            { num: 4, label: 'Settled' }
          ].map(s => (
            <div 
              key={s.num} 
              className={`step-item ${step === s.num ? 'step-active' : step > s.num ? 'step-done' : ''}`}
            >
              <div className="step-circle">
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: Quote Locked Review */}
        {step === 1 && (
          <div className="step-pane">
            <div className="quote-lock-box">
              <div className="quote-lock-header">
                <ShieldCheck size={20} className="text-emerald" />
                <span>Locked Execution Agreement</span>
              </div>
              <div className="quote-lock-grid">
                <div className="lock-item">
                  <span className="lock-label">Total Volume</span>
                  <span className="lock-value mono font-bold">
                    {trade.usdtAmount.toLocaleString()} USDT
                  </span>
                </div>
                <div className="lock-item">
                  <span className="lock-label">Fiat Settlement</span>
                  <span className="lock-value mono">
                    {trade.currency.symbol}{trade.fiatAmount.toLocaleString()} {trade.currency.code}
                  </span>
                </div>
                <div className="lock-item">
                  <span className="lock-label">Locked OTC Rate</span>
                  <span className="lock-value mono text-emerald font-bold">
                    1 USDT = {trade.currency.symbol}{trade.rate.toFixed(4)} {trade.currency.code}
                  </span>
                </div>
                <div className="lock-item">
                  <span className="lock-label">Settlement Network</span>
                  <span className="lock-value">
                    {trade.network.name} ({trade.network.short})
                  </span>
                </div>
              </div>
            </div>

            <div className="escrow-notice-card">
              <Building size={18} className="text-cyan" />
              <div>
                <strong>Segregated Settlement Rails</strong>
                <p>USDT liquidity has been reserved in the Valence Multi-Sig Treasury. Once transfer reference or crypto lock is confirmed, delivery executes at the guaranteed fixed rate.</p>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={onClose}>
                Cancel Quote
              </button>
              <button className="btn-primary" onClick={() => setStep(2)}>
                <span>Proceed to Escrow Deposit</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Escrow & Wire Instructions */}
        {step === 2 && (
          <div className="step-pane">
            {isBuy ? (
              /* BUY USDT: Show Wire details to send Fiat */
              <div>
                <div className="instructions-card">
                  <h4 className="instructions-title">Desk Corporate Transfer Instructions ({trade.currency.code})</h4>
                  <p className="instructions-sub">
                    Please initiate a {trade.currency.paymentMethods[0]} for exactly <strong>{trade.currency.symbol}{trade.fiatAmount.toLocaleString()} {trade.currency.code}</strong>.
                  </p>

                  <div className="wire-details-table">
                    <div className="wire-detail-row">
                      <span className="detail-label">Beneficiary Desk</span>
                      <span className="detail-value">{trade.currency.code === 'INR' ? (adminPricing?.bankDetails?.beneficiaryName || 'Valence Digital Asset Desk India Pvt Ltd') : 'Valence Capital Markets OTC LLC'}</span>
                    </div>
                    <div className="wire-detail-row">
                      <span className="detail-label">Beneficiary Bank</span>
                      <span className="detail-value">{trade.currency.code === 'INR' ? (adminPricing?.bankDetails?.bankName || 'HDFC Bank Ltd (Corporate Banking Branch)') : 'JPMorgan Chase Bank, N.A. New York'}</span>
                    </div>
                    <div className="wire-detail-row">
                      <span className="detail-label">{trade.currency.code === 'INR' ? 'IFSC Code' : 'SWIFT / BIC'}</span>
                      <div className="detail-copy-wrap">
                        <span className="mono">{trade.currency.code === 'INR' ? (adminPricing?.bankDetails?.ifsc || 'HDFC0000123') : 'CHASUS33AXXX'}</span>
                        <button onClick={() => copyToClipboard(trade.currency.code === 'INR' ? (adminPricing?.bankDetails?.ifsc || 'HDFC0000123') : 'CHASUS33AXXX', 'swift')}>
                          {copiedKey === 'swift' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="wire-detail-row">
                      <span className="detail-label">Corporate Account No.</span>
                      <div className="detail-copy-wrap">
                        <span className="mono">{trade.currency.code === 'INR' ? (adminPricing?.bankDetails?.accountNumber || '50200084920199') : '8841-99201-99'}</span>
                        <button onClick={() => copyToClipboard(trade.currency.code === 'INR' ? (adminPricing?.bankDetails?.accountNumber || '50200084920199') : '8841-99201-99', 'acct')}>
                          {copiedKey === 'acct' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    {trade.currency.code === 'INR' && adminPricing?.bankDetails?.upiId && (
                      <div className="wire-detail-row">
                        <span className="detail-label">Desk UPI VPA</span>
                        <div className="detail-copy-wrap">
                          <span className="mono text-cyan">{adminPricing.bankDetails.upiId}</span>
                          <button onClick={() => copyToClipboard(adminPricing.bankDetails.upiId, 'upi')}>
                            {copiedKey === 'upi' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="wire-detail-row">
                      <span className="detail-label">Mandatory Transfer Reference</span>
                      <div className="detail-copy-wrap highlight-copy">
                        <span className="mono font-bold text-amber">{wireRefInput}</span>
                        <button onClick={() => copyToClipboard(wireRefInput, 'ref')}>
                          {copiedKey === 'ref' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="wire-ref-confirm-box">
                  <label className="ref-label">Enter Wire Confirmation / MT103 Ref:</label>
                  <input 
                    type="text" 
                    className="ref-input mono"
                    value={wireRefInput}
                    onChange={(e) => setWireRefInput(e.target.value)}
                    placeholder="Enter bank wire reference number"
                  />
                </div>
              </div>
            ) : (
              /* SELL USDT: Show Multi-sig Deposit Address */
              <div>
                <div className="instructions-card">
                  <h4 className="instructions-title">Deposit USDT to Escrow Vault ({trade.network.short})</h4>
                  <p className="instructions-sub">
                    Send exactly <strong>{trade.usdtAmount.toLocaleString()} USDT</strong> to the audited Valence Multi-Sig Escrow contract below.
                  </p>

                  <div className="escrow-address-box">
                    <div className="address-label-bar">
                      <span>Valence Treasury Escrow Address ({trade.network.short}):</span>
                      <span className="mono text-emerald">19 Confirmations Required</span>
                    </div>
                    <div className="address-display-row">
                      <span className="address-text mono">{trade.network.defaultAddress}</span>
                      <button 
                        className="copy-btn-pill"
                        onClick={() => copyToClipboard(trade.network.defaultAddress, 'escrow')}
                      >
                        {copiedKey === 'escrow' ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedKey === 'escrow' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-primary" onClick={() => setStep(3)}>
                <ShieldCheck size={17} />
                <span>Confirm Payment Dispatched</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Verification & Clearing */}
        {step === 3 && (
          <div className="step-pane step-pane-center">
            <div className="clearing-spinner-wrap">
              <Loader2 size={54} className="animate-spin text-emerald" />
            </div>
            <h3 className="clearing-title">Reconciling Settlement with Desk Rail</h3>
            <p className="clearing-sub">
              Auditing banking reference <strong className="mono text-emerald">{wireRefInput}</strong> against institutional liquidity ledger...
            </p>
            <div className="clearing-progress-box mono">
              <div>[1/3] Multi-sig escrow verification: OK</div>
              <div>[2/3] Compliance & sanctions screening: PASS</div>
              <div className="text-emerald">[3/3] Broadcasting on {trade.network.name}...</div>
            </div>
          </div>
        )}

        {/* STEP 4: Trade Settled & Receipt */}
        {step === 4 && (
          <div className="step-pane">
            <div className="settled-success-banner">
              <div className="success-icon-wrap">
                <CheckCircle2 size={44} className="text-emerald" />
              </div>
              <h3 className="success-title">Trade Successfully Settled!</h3>
              <p className="success-sub">
                {isBuy 
                  ? `Successfully delivered ${trade.usdtAmount.toLocaleString()} USDT on ${trade.network.short}.` 
                  : `Successfully settled ${trade.currency.symbol}${trade.fiatAmount.toLocaleString()} ${trade.currency.code} to your bank account.`
                }
              </p>
            </div>

            <div className="tx-details-card">
              <div className="tx-row">
                <span className="tx-label">Blockchain Tx Hash ({trade.network.short}):</span>
                <div className="tx-val-wrap">
                  <span className="mono tx-hash-str">{txHash.slice(0, 16)}...{txHash.slice(-14)}</span>
                  <button 
                    className="copy-icon-btn"
                    onClick={() => copyToClipboard(txHash, 'tx')}
                    title="Copy full hash"
                  >
                    {copiedKey === 'tx' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="tx-row">
                <span className="tx-label">Recipient Destination:</span>
                <span className="mono tx-dest">
                  {isBuy ? trade.recipientAddress : trade.bankWireInfo}
                </span>
              </div>

              <div className="tx-row">
                <span className="tx-label">Settlement Speed:</span>
                <span className="text-emerald mono font-bold">1.4 minutes</span>
              </div>
            </div>

            <div className="step-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  onClose();
                  if (onViewTradeSlip) {
                    onViewTradeSlip({
                      ...trade,
                      txHash,
                      status: 'COMPLETED',
                      settledAt: new Date().toISOString()
                    });
                  }
                }}
              >
                <FileText size={16} />
                <span>View Official Trade Slip</span>
              </button>

              <button className="btn-primary" onClick={onClose}>
                Done / New Trade
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
