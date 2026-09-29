import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Headphones, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Bot
} from 'lucide-react';

export function LiveBrokerChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'broker',
      text: 'Good day! I am Marcus Vance, CFA — Senior Liquidity Desk Manager at Valence OTC. How can I assist with your USDT block trade, wire rails, or custom pricing today?',
      time: 'Just now'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I execute >$1,000,000 USDT?',
    'What are TRC-20 vs ERC-20 wire clearing times?',
    'Can I settle in UAE Dirham (AED)?',
    'How does the multi-sig escrow protect my funds?'
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    setMessages(prev => [
      ...prev,
      { sender: 'user', text: query, time: 'Just now' }
    ]);
    if (!textToSend) setInputMsg('');

    // Broker AI / Automated intelligence reply
    setTimeout(() => {
      let reply = "Our desk is ready to support your request. All trades above $100k benefit from 0.00% desk fee and direct multi-sig escrow allocation.";
      const low = query.toLowerCase();

      if (low.includes('1,000,000') || low.includes('1m') || low.includes('million')) {
        reply = "For blocks exceeding $1,000,000 USDT, we provide a 6 bps rebate off standard desk spreads. We can arrange split tranches via Fedwire or SWIFT MT103 with simultaneous on-chain TRC-20 or ERC-20 dispatches.";
      } else if (low.includes('trc-20') || low.includes('erc-20') || low.includes('speed')) {
        reply = "TRC-20 requires 19 block confirmations (~1 to 2 minutes) with network fees around $1.00 USDT. ERC-20 requires 12 confirmations (~3 to 5 minutes) with fees around $3.80 USDT. Both are fully automated in our multi-sig vault.";
      } else if (low.includes('aed') || low.includes('dirham') || low.includes('dubai')) {
        reply = "Yes! We operate direct UAE banking rails (FTS local transfer) and a physical private desk in Dubai Marina for high-net-worth clients requiring same-day AED/USDT settlement.";
      } else if (low.includes('escrow') || low.includes('protect')) {
        reply = "All OTC liquidity is pre-locked in verified multi-sig smart vaults. Fiat wire reference codes are cryptographically matched before any crypto release, preventing counterparty default.";
      }

      setMessages(prev => [
        ...prev,
        { sender: 'broker', text: reply, time: 'Just now' }
      ]);
    }, 900);
  };

  return (
    <div className="broker-chat-drawer glass-panel">
      {/* Drawer Header */}
      <div className="broker-chat-header">
        <div className="broker-profile-row">
          <div className="broker-avatar">
            <span className="broker-initials">MV</span>
            <span className="pulse-broker-dot"></span>
          </div>
          <div>
            <div className="broker-name-line">
              <strong>Marcus Vance, CFA</strong>
              <span className="badge-emerald">Live Broker</span>
            </div>
            <div className="broker-role-sub">Senior Desk Liquidity Director</div>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Security notice */}
      <div className="broker-security-alert">
        <ShieldCheck size={14} className="text-emerald" />
        <span>End-to-end encrypted institutional desk channel.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="broker-messages-area">
        {messages.map((m, idx) => (
          <div key={idx} className={`b-msg-row ${m.sender === 'user' ? 'b-msg-user' : 'b-msg-desk'}`}>
            {m.sender === 'broker' && <div className="b-author-label">Valence Prime Desk</div>}
            <div className="b-msg-content">{m.text}</div>
            <div className="b-msg-timestamp">{m.time}</div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="quick-prompts-bar">
        {quickPrompts.map((p, idx) => (
          <button 
            key={idx} 
            className="quick-prompt-chip"
            onClick={() => handleSend(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form 
        className="broker-input-form"
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
      >
        <input
          type="text"
          placeholder="Ask broker about block quotes, wires, or limits..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
        />
        <button type="submit" className="broker-send-btn">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
