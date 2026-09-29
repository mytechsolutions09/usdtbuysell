import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import { FIAT_CURRENCIES } from '../data/mockData';

export function TickerBar({ deskSpreadBps, adminPricing }) {
  const [rates, setRates] = useState(FIAT_CURRENCIES);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const buyPrice = adminPricing?.buyPriceInr || 90.25;
  const sellPrice = adminPricing?.sellPriceInr || 88.80;
  const inrSpread = (buyPrice - sellPrice).toFixed(2);

  // Simulate realistic micro fluctuations in OTC desk rates for non-INR or benchmark
  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prev => prev.map(item => {
        if (item.code === 'INR') {
          return {
            ...item,
            rateToUsdt: buyPrice
          };
        }
        // Micro fluctuation between -0.015% and +0.015%
        const delta = (Math.random() - 0.49) * 0.0003;
        const newRate = Number((item.rateToUsdt * (1 + delta)).toFixed(4));
        return {
          ...item,
          rateToUsdt: newRate,
          change: delta >= 0 ? `+${(delta * 100).toFixed(2)}%` : `${(delta * 100).toFixed(2)}%`,
          isPositive: delta >= 0
        };
      }));
      setLastUpdated(new Date());
    }, 4000);

    return () => clearInterval(interval);
  }, [buyPrice]);

  return (
    <div className="ticker-wrapper">
      <div className="ticker-fixed-left">
        <span className="live-pill">
          <span className="pulse-dot"></span> LIVE PARITY
        </span>
        <div className="ticker-inr-highlight" title="Real-time USDT Buy and Sell rates in Indian Rupee">
          <span className="inr-flag">🇮🇳</span>
          <span className="inr-txt mono">
            BUY: <strong className="text-emerald">₹{buyPrice.toFixed(2)}</strong>
            <span className="ticker-sep">•</span>
            SELL: <strong className="text-cyan">₹{sellPrice.toFixed(2)}</strong>
          </span>
        </div>
        <span className="desk-spread-label">
          SPREAD: <strong>₹{inrSpread}</strong>
        </span>
      </div>

      <div className="ticker-scroll-area">
        <div className="ticker-track">
          {rates.concat(rates).map((curr, idx) => (
            <div key={`${curr.code}-${idx}`} className="ticker-item">
              <span className="ticker-flag">{curr.flag}</span>
              <span className="ticker-pair">USDT/{curr.code}</span>
              <span className="ticker-val mono">
                {curr.code === 'USD' ? '$' : curr.code === 'EUR' ? '€' : curr.code === 'GBP' ? '£' : curr.code === 'INR' ? '₹' : curr.code === 'AED' ? 'AED ' : ''}
                {curr.code === 'INR' 
                  ? curr.rateToUsdt.toFixed(2)
                  : curr.rateToUsdt.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
                }
              </span>
              <span className={`ticker-change ${curr.isPositive !== false ? 'text-up' : 'text-down'}`}>
                {curr.change || '+0.01%'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="ticker-fixed-right">
        <div className="desk-stat-pill" title="Total Segregated Reserves in Multi-Sig Escrow">
          <ShieldCheck size={13} className="text-emerald" />
          <span>RESERVES: <strong>$42.85M USDT</strong></span>
        </div>
        <div className="desk-stat-pill" title="Average Trade Settlement Time across all chains">
          <Zap size={13} className="text-cyan" />
          <span>AVG SPEED: <strong>2.1 MIN</strong></span>
        </div>
      </div>
    </div>
  );
}
