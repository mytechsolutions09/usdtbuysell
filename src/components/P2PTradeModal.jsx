import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  X, 
  Check, 
  Copy, 
  Send, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  Building,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function P2PTradeModal({ 
  merchant, 
  tradeType, // 'BUY' (user buys USDT) or 'SELL' (user sells USDT)
  onClose, 
  onTradeComplete 
}) {
  const [fiatAmount, setFiatAmount] = useState((merchant.minLimitUsdt * merchant.unitPrice).toFixed(2));
  const [usdtAmount, setUsdtAmount] = useState(merchant.minLimitUsdt.toString());
  const [stage, setStage] = useState('input'); // 'input', 'escrow_active', 'releasing', 'completed'
  const [copiedKey, setCopiedKey] = useState(null);

  // Chat messages with merchant
  const [messages, setMessages] = useState([
    {
      sender: 'merchant',
      name: merchant.name,
      text: `Hello! I am active and ready for this block. Once you initiate, the escrow contract secures the funds immediately. Please include the Trade Reference in your transfer note.`,
      time: 'Just now'
    }
  ]);
  const [newMsg, setNewMsg] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFiatChange = (val) => {
    setFiatAmount(val);
    const num = parseFloat(val);
    if (!num || isNaN(num)) setUsdtAmount('');
    else setUsdtAmount((num / merchant.unitPrice).toFixed(2));
  };

  const handleUsdtChange = (val) => {
    setUsdtAmount(val);
    const num = parseFloat(val);
    if (!num || isNaN(num)) setFiatAmount('');
    else setFiatAmount((num * merchant.unitPrice).toFixed(2));
  };

  const handleStartTrade = () => {
    setStage('escrow_active');
    setMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: `🔒 ESCROW ACTIVE: ${parseFloat(usdtAmount).toLocaleString()} USDT has been frozen in smart contract escrow from ${merchant.name}. You have 30 minutes to complete the transfer.`,
        time: 'Just now'
      }
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const userText = newMsg;
    setMessages(prev => [
      ...prev,
      { sender: 'user', name: 'You (Tier 3)', text: userText, time: 'Just now' }
    ]);
    setNewMsg('');

    // Simulate merchant response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'merchant',
          name: merchant.name,
          text: `Acknowledged! Monitoring incoming accounts for credit now.`,
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  const handleConfirmPaid = () => {
    setStage('releasing');
    setMessages(prev => [
      ...prev,
      {
        sender: 'system',
        text: `Buyer marked payment as transferred. Merchant is verifying receipt...`,
        time: 'Just now'
      }
    ]);

    setTimeout(() => {
      setStage('completed');
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      if (onTradeComplete) {
        onTradeComplete({
          id: `P2P-${Math.floor(100000 + Math.random() * 900000)}`,
          side: tradeType === 'BUY' ? 'BUY_USDT' : 'SELL_USDT',
          type: tradeType,
          amountUsdt: parseFloat(usdtAmount),
          fiatAmount: parseFloat(fiatAmount),
          fiatCode: merchant.fiatCode,
          network: merchant.chains[0],
          rate: merchant.unitPrice,
          counterparty: merchant.name,
          status: 'COMPLETED',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          feeUsdt: 0
        });
      }
    }, 3000);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content p2p-modal-content">
        {/* Header */}
        <div className="p2p-modal-header">
          <div>
            <div className="p2p-merchant-badge">
              <ShieldCheck size={14} className="text-emerald" />
              <span>{merchant.badge}</span>
            </div>
            <h2 className="p2p-modal-title">
              {tradeType === 'BUY' ? 'Buy USDT from ' : 'Sell USDT to '} {merchant.name}
            </h2>
            <div className="p2p-rate-indicator mono">
              Unit Rate: <strong>{merchant.unitPrice} {merchant.fiatCode}</strong> / USDT
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {stage === 'input' && (
          <div className="p2p-input-stage">
            <div className="p2p-input-box">
              <label>Amount you send ({tradeType === 'BUY' ? merchant.fiatCode : 'USDT'}):</label>
              <div className="p2p-field-row">
                <input
                  type="number"
                  className="p2p-modal-input mono"
                  value={tradeType === 'BUY' ? fiatAmount : usdtAmount}
                  onChange={(e) => tradeType === 'BUY' ? handleFiatChange(e.target.value) : handleUsdtChange(e.target.value)}
                />
                <span className="p2p-unit-tag">{tradeType === 'BUY' ? merchant.fiatCode : 'USDT'}</span>
              </div>
            </div>

            <div className="p2p-input-box">
              <label>Amount you receive ({tradeType === 'BUY' ? 'USDT' : merchant.fiatCode}):</label>
              <div className="p2p-field-row">
                <input
                  type="number"
                  className="p2p-modal-input mono highlight-text"
                  value={tradeType === 'BUY' ? usdtAmount : fiatAmount}
                  onChange={(e) => tradeType === 'BUY' ? handleUsdtChange(e.target.value) : handleFiatChange(e.target.value)}
                />
                <span className="p2p-unit-tag">{tradeType === 'BUY' ? 'USDT' : merchant.fiatCode}</span>
              </div>
            </div>

            <div className="p2p-terms-box">
              <div className="terms-header font-bold text-secondary">Desk Trading Terms:</div>
              <p className="terms-text">{merchant.terms}</p>
            </div>

            <div className="p2p-modal-actions">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleStartTrade}>
                <span>Lock Escrow & Open Trade Room</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {(stage === 'escrow_active' || stage === 'releasing' || stage === 'completed') && (
          <div className="p2p-active-room">
            {/* Left: Payment Info */}
            <div className="p2p-room-left">
              <div className="escrow-status-bar">
                <Clock size={16} className="text-amber" />
                <span>Escrow Active: Payment window closes in <strong>29:45</strong></span>
              </div>

              <div className="merchant-bank-box">
                <h4 className="bank-box-title">Merchant Beneficiary Account</h4>
                
                <div className="bank-row">
                  <span className="b-label">Account Name:</span>
                  <span className="b-val">{merchant.name} Ltd</span>
                </div>

                <div className="bank-row">
                  <span className="b-label">Payment Rail:</span>
                  <span className="b-val">{merchant.paymentMethods[0]}</span>
                </div>

                <div className="bank-row">
                  <span className="b-label">Account / IBAN:</span>
                  <div className="b-copy-wrap">
                    <span className="mono">GB88BARC20201584920199</span>
                    <button onClick={() => copyToClipboard('GB88BARC20201584920199', 'iban')}>
                      {copiedKey === 'iban' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="bank-row">
                  <span className="b-label">Trade Reference:</span>
                  <div className="b-copy-wrap">
                    <span className="mono text-amber font-bold">VAL-P2P-{merchant.id.toUpperCase()}</span>
                    <button onClick={() => copyToClipboard(`VAL-P2P-${merchant.id.toUpperCase()}`, 'p2pref')}>
                      {copiedKey === 'p2pref' ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {stage === 'escrow_active' && (
                <button className="btn-primary w-full p2p-paid-btn" onClick={handleConfirmPaid}>
                  <ShieldCheck size={18} />
                  <span>I Have Transferred {fiatAmount} {merchant.fiatCode}</span>
                </button>
              )}

              {stage === 'releasing' && (
                <div className="releasing-alert">
                  <span className="pulse-amber"></span>
                  <span>Verifying deposit with counterparty bank...</span>
                </div>
              )}

              {stage === 'completed' && (
                <div className="completed-alert">
                  <CheckCircle2 size={24} className="text-emerald" />
                  <div>
                    <strong>Order Completed!</strong>
                    <p>{usdtAmount} USDT credited to your wallet.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Live Interactive Chat with Merchant */}
            <div className="p2p-room-chat">
              <div className="chat-header">
                <span className="chat-dot"></span>
                <span>Live Chat with {merchant.name}</span>
              </div>

              <div className="chat-messages-scroll">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`chat-bubble-wrap ${m.sender === 'user' ? 'msg-user' : m.sender === 'system' ? 'msg-system' : 'msg-merchant'}`}
                  >
                    {m.name && <div className="msg-author">{m.name}</div>}
                    <div className="msg-bubble">{m.text}</div>
                    <div className="msg-time">{m.time}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {stage !== 'completed' ? (
                <form className="chat-input-bar" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type message to merchant..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                  />
                  <button type="submit" className="chat-send-btn">
                    <Send size={15} />
                  </button>
                </form>
              ) : (
                <div className="chat-ended-bar">Trade Finished & Settled</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
