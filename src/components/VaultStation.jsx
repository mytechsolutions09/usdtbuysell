import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle,
  QrCode,
  Send,
  Sparkles
} from 'lucide-react';
import { USDT_NETWORKS } from '../data/mockData';
import confetti from 'canvas-confetti';

export function VaultStation({ 
  walletBalance, 
  onDepositSimulate, 
  onWithdrawSimulate 
}) {
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit', 'withdraw', 'por'
  const [selectedNetwork, setSelectedNetwork] = useState(USDT_NETWORKS[0]); // default TRC-20
  const [copiedKey, setCopiedKey] = useState(null);

  // Withdraw state
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('50000');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccessHash, setWithdrawSuccessHash] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateDeposit = () => {
    const depositAmt = 15000;
    if (onDepositSimulate) {
      onDepositSimulate(selectedNetwork.id, depositAmt);
    }
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleExecuteWithdraw = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || !withdrawAddress.trim()) return;

    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      const hash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setWithdrawSuccessHash(hash);

      if (onWithdrawSimulate) {
        onWithdrawSimulate(selectedNetwork.id, amt);
      }
    }, 2000);
  };

  // Helper for dynamic SVG QR Code pattern
  const renderMockQr = (address) => {
    return (
      <svg viewBox="0 0 100 100" className="qr-svg">
        <rect width="100" height="100" fill="#0d131f" rx="6" />
        {/* Corners */}
        <rect x="8" y="8" width="24" height="24" fill="#00E599" rx="3" />
        <rect x="12" y="12" width="16" height="16" fill="#0d131f" />
        <rect x="16" y="16" width="8" height="8" fill="#00E599" />

        <rect x="68" y="8" width="24" height="24" fill="#00E599" rx="3" />
        <rect x="72" y="12" width="16" height="16" fill="#0d131f" />
        <rect x="76" y="16" width="8" height="8" fill="#00E599" />

        <rect x="8" y="68" width="24" height="24" fill="#00E599" rx="3" />
        <rect x="12" y="72" width="16" height="16" fill="#0d131f" />
        <rect x="16" y="76" width="8" height="8" fill="#00E599" />

        {/* Matrix points */}
        <circle cx="40" cy="18" r="3" fill="#00E599" />
        <circle cx="52" cy="18" r="3" fill="#00E599" />
        <circle cx="46" cy="28" r="3" fill="#00E599" />
        <circle cx="20" cy="45" r="3" fill="#00E599" />
        <circle cx="34" cy="45" r="3" fill="#00E599" />
        <circle cx="50" cy="50" r="4" fill="#00E599" />
        <circle cx="66" cy="45" r="3" fill="#00E599" />
        <circle cx="80" cy="45" r="3" fill="#00E599" />
        <circle cx="45" cy="65" r="3" fill="#00E599" />
        <circle cx="60" cy="65" r="3" fill="#00E599" />
        <circle cx="75" cy="65" r="3" fill="#00E599" />
        <circle cx="40" cy="80" r="3" fill="#00E599" />
        <circle cx="55" cy="80" r="3" fill="#00E599" />
        <circle cx="70" cy="80" r="3" fill="#00E599" />
        <circle cx="85" cy="80" r="3" fill="#00E599" />
        {/* Center Tether Logo badge */}
        <circle cx="50" cy="50" r="10" fill="#07090e" stroke="#00E599" strokeWidth="1.5" />
        <text x="50" y="54" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#00E599">₮</text>
      </svg>
    );
  };

  return (
    <div className="vault-station-container">
      {/* Portfolio Header Cards */}
      <div className="vault-summary-grid">
        <div className="vault-main-balance-card glass-panel">
          <div className="vault-bal-left">
            <span className="vault-bal-label">TOTAL USDT PORTFOLIO BALANCE</span>
            <div className="vault-bal-val mono">
              ${(walletBalance?.totalUsdt || 348500).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <small>USDT</small>
            </div>
            <div className="vault-bal-fiat mono text-secondary">
              ≈ ${(walletBalance?.fiatEquivUsd || 348569.70).toLocaleString()} USD • Segregated Custody
            </div>
          </div>
          <div className="vault-bal-actions">
            <button 
              className={`vault-action-btn ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => setActiveTab('deposit')}
            >
              <ArrowDownLeft size={16} />
              <span>Deposit USDT</span>
            </button>
            <button 
              className={`vault-action-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              <ArrowUpRight size={16} />
              <span>Disburse / Withdraw</span>
            </button>
            <button 
              className={`vault-action-btn ${activeTab === 'por' ? 'active' : ''}`}
              onClick={() => setActiveTab('por')}
            >
              <ShieldCheck size={16} />
              <span>Proof of Reserves</span>
            </button>
          </div>
        </div>

        {/* Network Breakdown Grid */}
        <div className="vault-breakdown-row">
          {USDT_NETWORKS.map(net => {
            const netBal = walletBalance?.breakdown?.[net.id] || 0;
            return (
              <div 
                key={net.id} 
                className={`network-bal-card glass-panel ${selectedNetwork.id === net.id ? 'active-network-card' : ''}`}
                onClick={() => setSelectedNetwork(net)}
              >
                <div className="net-card-top">
                  <span className="net-card-icon">{net.icon}</span>
                  <span className="net-card-short mono">{net.short}</span>
                </div>
                <div className="net-card-bal mono font-bold">
                  {netBal.toLocaleString()} <small>₮</small>
                </div>
                <div className="net-card-speed">{net.speed}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Action Workspace */}
      <div className="vault-workspace-card glass-panel">
        {activeTab === 'deposit' && (
          <div className="deposit-workspace">
            <div className="workspace-header">
              <div>
                <h3 className="workspace-title">Deposit USDT to Institutional Vault</h3>
                <p className="workspace-sub">
                  Select your network to view your dedicated multi-sig deposit address. Deposits are credited automatically after the specified block confirmations.
                </p>
              </div>
              <button 
                className="btn-outline-emerald"
                onClick={handleSimulateDeposit}
                title="Click to simulate receiving an incoming deposit of 15,000 USDT on this network"
              >
                <Sparkles size={15} />
                <span>Simulate +15,000 USDT Deposit</span>
              </button>
            </div>

            {/* Network Selector Tabs */}
            <div className="deposit-network-chips">
              {USDT_NETWORKS.map(net => (
                <button
                  key={net.id}
                  className={`dep-chip ${selectedNetwork.id === net.id ? 'selected' : ''}`}
                  onClick={() => setSelectedNetwork(net)}
                >
                  <span className="chip-icon">{net.icon}</span>
                  <span>{net.name}</span>
                  <span className="chip-speed mono">{net.confirmations}</span>
                </button>
              ))}
            </div>

            {/* Address & QR Code Box */}
            <div className="deposit-details-grid">
              <div className="qr-box-wrap">
                {renderMockQr(selectedNetwork.defaultAddress)}
                <div className="qr-scan-hint">Scan with mobile crypto wallet</div>
              </div>

              <div className="address-col-wrap">
                <div className="address-field-card">
                  <label className="address-label">
                    YOUR DEDICATED {selectedNetwork.short} VAULT ADDRESS:
                  </label>
                  <div className="address-copy-row">
                    <span className="address-display-text mono">{selectedNetwork.defaultAddress}</span>
                    <button 
                      className="copy-btn-primary"
                      onClick={() => copyToClipboard(selectedNetwork.defaultAddress, 'depAddress')}
                    >
                      {copiedKey === 'depAddress' ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedKey === 'depAddress' ? 'Copied' : 'Copy Address'}</span>
                    </button>
                  </div>
                </div>

                <div className="network-meta-grid">
                  <div className="meta-box">
                    <span className="meta-title">Official Contract:</span>
                    <span className="meta-val mono">{selectedNetwork.contract.slice(0, 10)}...{selectedNetwork.contract.slice(-8)}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-title">Expected Settlement:</span>
                    <span className="meta-val mono text-emerald font-bold">{selectedNetwork.speed}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-title">Block Confirmations:</span>
                    <span className="meta-val mono">{selectedNetwork.confirmations}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-title">Minimum Deposit:</span>
                    <span className="meta-val mono">50.00 USDT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="withdraw-workspace">
            <div className="workspace-header">
              <div>
                <h3 className="workspace-title">Disburse / Withdraw USDT</h3>
                <p className="workspace-sub">
                  Execute corporate or personal disbursements across any supported USDT blockchain with sub-second gas estimation.
                </p>
              </div>
            </div>

            {withdrawSuccessHash ? (
              <div className="withdraw-success-box">
                <ShieldCheck size={48} className="text-emerald" />
                <h4 className="success-hash-title">Disbursement Successfully Broadcasted!</h4>
                <p className="success-hash-sub">
                  Transaction submitted to {selectedNetwork.name} mempool. Funds are en route.
                </p>
                <div className="hash-display-row mono">
                  <span>Tx Hash: {withdrawSuccessHash}</span>
                  <button onClick={() => copyToClipboard(withdrawSuccessHash, 'withHash')}>
                    {copiedKey === 'withHash' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                  </button>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => setWithdrawSuccessHash(null)}
                >
                  Make Another Withdrawal
                </button>
              </div>
            ) : (
              <form className="withdraw-form" onSubmit={handleExecuteWithdraw}>
                <div className="form-group">
                  <label className="form-label">Select Network:</label>
                  <div className="deposit-network-chips">
                    {USDT_NETWORKS.map(net => (
                      <button
                        type="button"
                        key={net.id}
                        className={`dep-chip ${selectedNetwork.id === net.id ? 'selected' : ''}`}
                        onClick={() => setSelectedNetwork(net)}
                      >
                        <span className="chip-icon">{net.icon}</span>
                        <span>{net.short}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Recipient Destination Address ({selectedNetwork.short}):</label>
                  <input
                    type="text"
                    className="form-input mono"
                    placeholder={`Paste valid ${selectedNetwork.short} USDT address`}
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">Withdrawal Amount (USDT):</label>
                    <span className="max-bal-hint mono">
                      Max: {(walletBalance?.breakdown?.[selectedNetwork.id] || 0).toLocaleString()} USDT
                    </span>
                  </div>
                  <div className="input-with-max">
                    <input
                      type="number"
                      className="form-input mono"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="max-btn mono"
                      onClick={() => setWithdrawAmount((walletBalance?.breakdown?.[selectedNetwork.id] || 0).toString())}
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="withdraw-fee-summary">
                  <div className="fee-row">
                    <span>Network Transaction Fee:</span>
                    <span className="mono text-emerald font-bold">${selectedNetwork.feeUsdt.toFixed(2)} USDT</span>
                  </div>
                  <div className="fee-row">
                    <span>Net Amount to Recipient:</span>
                    <span className="mono font-bold text-main">
                      {Math.max(0, (parseFloat(withdrawAmount) || 0) - selectedNetwork.feeUsdt).toLocaleString()} USDT
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary withdraw-submit-btn"
                  disabled={isWithdrawing || !withdrawAddress.trim() || !parseFloat(withdrawAmount)}
                >
                  <Send size={16} />
                  <span>{isWithdrawing ? 'Broadcasting to Chain...' : 'Authorize Disbursement'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'por' && (
          <div className="por-workspace">
            <div className="por-badge-row">
              <span className="badge-emerald font-bold">
                <ShieldCheck size={14} /> 100% COLLATERALIZED & SEGREGATED
              </span>
              <span className="por-updated mono text-secondary">
                Last Verified: 2026-09-27 12:00:00 UTC (Merkle Root verified)
              </span>
            </div>

            <div className="por-stats-grid">
              <div className="por-card">
                <span className="por-label">Total Desk USDT Liabilities</span>
                <span className="por-val mono font-bold">$42,850,000.00</span>
                <span className="por-sub">Client deposits in custody</span>
              </div>
              <div className="por-card">
                <span className="por-label">Audited On-Chain Reserves</span>
                <span className="por-val mono text-emerald font-bold">$43,120,450.00</span>
                <span className="por-sub">Multi-sig vault holdings</span>
              </div>
              <div className="por-card">
                <span className="por-label">Reserve Collateral Ratio</span>
                <span className="por-val mono text-cyan font-bold">100.63%</span>
                <span className="por-sub">Surplus: +$270,450 USDT</span>
              </div>
            </div>

            <div className="por-chains-breakdown">
              <h4 className="por-breakdown-title">Treasury Vault Reserves by Network:</h4>
              <div className="por-bars-list">
                <div className="por-bar-item">
                  <div className="bar-labels">
                    <span>TRON (TRC-20)</span>
                    <span className="mono font-bold">$24,500,000 USDT (57%)</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '57%', background: '#EF4444' }}></div>
                  </div>
                </div>
                <div className="por-bar-item">
                  <div className="bar-labels">
                    <span>Ethereum (ERC-20)</span>
                    <span className="mono font-bold">$12,200,000 USDT (28%)</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '28%', background: '#627EEA' }}></div>
                  </div>
                </div>
                <div className="por-bar-item">
                  <div className="bar-labels">
                    <span>BNB Smart Chain (BEP-20)</span>
                    <span className="mono font-bold">$4,800,000 USDT (11%)</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '11%', background: '#F3BA2F' }}></div>
                  </div>
                </div>
                <div className="por-bar-item">
                  <div className="bar-labels">
                    <span>Solana (SPL)</span>
                    <span className="mono font-bold">$1,620,450 USDT (4%)</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '4%', background: '#14F195' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
