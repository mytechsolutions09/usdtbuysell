import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Copy, 
  Check,
  ShieldCheck,
  Filter
} from 'lucide-react';

export function TradeHistoryView({ trades, onViewSlip }) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredTrades = trades.filter(t => {
    const isBuy = t.side === 'BUY' || t.side === 'BUY_USDT';
    const matchType = filterType === 'ALL' || (filterType === 'BUY' ? isBuy : !isBuy);
    const searchLow = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      (t.id && t.id.toLowerCase().includes(searchLow)) ||
      (t.counterparty && t.counterparty.toLowerCase().includes(searchLow)) ||
      (t.fiatCode && t.fiatCode.toLowerCase().includes(searchLow));
    return matchType && matchSearch;
  });

  return (
    <div className="trade-history-container">
      {/* Top Banner */}
      <div className="history-header-banner glass-panel">
        <div className="history-banner-left">
          <div className="desk-tier-badge">
            <span className="pulse-dot"></span> AUDITED SETTLEMENT LOGS
          </div>
          <h1 className="history-title">Institutional Trade History & Slips</h1>
          <p className="history-sub">
            Review completed OTC block trades, verify cryptographic on-chain settlement hashes, and generate formal institutional trade slips for tax and accounting.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="history-filter-bar glass-panel">
        <div className="filter-pill-group">
          {['ALL', 'BUY', 'SELL'].map(type => (
            <button
              key={type}
              className={`filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'ALL' ? 'All Executions' : type === 'BUY' ? 'USDT Purchases' : 'USDT Liquidations'}
            </button>
          ))}
        </div>

        <div className="search-input-wrap">
          <Search size={16} className="text-secondary" />
          <input
            type="text"
            placeholder="Search by Trade ID, Desk, or Currency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="history-search-input"
          />
        </div>
      </div>

      {/* Trades Table */}
      <div className="history-table-card glass-panel">
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Trade Ref / Date</th>
                <th>Direction</th>
                <th>Notional Volume (USDT)</th>
                <th>Fiat Equivalent</th>
                <th>Locked Parity</th>
                <th>Settlement Network</th>
                <th>Counterparty Desk</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-secondary">
                    No trades found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTrades.map(trade => {
                  const isBuy = trade.side === 'BUY' || trade.side === 'BUY_USDT';
                  const usdtVol = trade.amountUsdt || trade.usdtAmount || 0;
                  const fiatVol = trade.fiatAmount || 0;
                  const fiatCode = trade.fiatCode || trade.currency?.code || 'USD';
                  const networkStr = trade.network?.name || trade.network || 'TRON (TRC-20)';

                  return (
                    <tr key={trade.id || Math.random()}>
                      <td>
                        <div className="trade-id-cell">
                          <span className="trade-id mono font-bold">{trade.id}</span>
                          <span className="trade-time mono text-secondary">{trade.timestamp || trade.settledAt}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`direction-badge ${isBuy ? 'badge-buy' : 'badge-sell'}`}>
                          {isBuy ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                          <span>{isBuy ? 'BUY USDT' : 'SELL USDT'}</span>
                        </span>
                      </td>

                      <td>
                        <span className="mono font-bold text-main">
                          {usdtVol.toLocaleString()} USDT
                        </span>
                      </td>

                      <td>
                        <span className="mono">
                          {fiatVol.toLocaleString()} {fiatCode}
                        </span>
                      </td>

                      <td>
                        <span className="mono text-emerald">
                          {trade.rate?.toFixed(4)}
                        </span>
                      </td>

                      <td>
                        <span className="network-pill mono">{networkStr}</span>
                      </td>

                      <td>
                        <span className="counterparty-cell">{trade.counterparty || 'Valence Prime Desk'}</span>
                      </td>

                      <td>
                        <span className="badge-emerald font-bold">
                          <CheckCircle2 size={12} /> Settled
                        </span>
                      </td>

                      <td>
                        <button 
                          className="btn-outline-emerald btn-sm"
                          onClick={() => onViewSlip(trade)}
                        >
                          <FileText size={13} />
                          <span>Trade Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
