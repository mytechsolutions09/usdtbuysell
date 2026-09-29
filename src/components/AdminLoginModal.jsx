import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  KeyRound, 
  AlertCircle, 
  X, 
  Database,
  ArrowRight,
  Sparkles,
  Server
} from 'lucide-react';
import { apiService } from '../services/apiService';

export function AdminLoginModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess 
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoNotice, setInfoNotice] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both administrator username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setInfoNotice('');

    try {
      const res = await apiService.login(username, password);
      if (res.success) {
        if (res.notice) {
          setInfoNotice(res.notice);
        }
        onLoginSuccess(res.user, res.isCloudflareConnected);
        onClose();
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMsg('Unable to connect to authentication service. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setUsername('admin');
    setPassword('valence2026!');
    setErrorMsg('');
  };

  return (
    <div className="modal-backdrop-blur" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-login-modal glass-card animate-scale-in">
        {/* Modal Top Bar */}
        <div className="admin-login-header">
          <div className="admin-login-icon-badge">
            <Lock size={22} className="text-amber" />
          </div>
          <button 
            className="admin-modal-close-btn" 
            onClick={onClose} 
            title="Cancel & Return to OTC Terminal"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Title & Meta */}
        <div className="admin-login-title-wrap">
          <div className="admin-security-pill">
            <KeyRound size={12} className="text-amber" />
            <span>RESTRICTED ACCESS • TREASURY DESK ONLY</span>
          </div>
          <h2 className="admin-login-title">Administrator Authentication</h2>
          <p className="admin-login-sub">
            Sign in with institutional credentials to manage live USDT/INR desk pricing, banking rails, and automated escrow parameters.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="admin-login-alert error animate-shake">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Info Alert */}
        {infoNotice && (
          <div className="admin-login-alert info">
            <Database size={16} />
            <span>{infoNotice}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">
              <User size={14} className="text-muted" />
              <span>Admin Username</span>
            </label>
            <div className="admin-input-wrap">
              <input
                id="admin-username"
                type="text"
                className="admin-text-input mono"
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              <Lock size={14} className="text-muted" />
              <span>Admin Password</span>
            </label>
            <div className="admin-input-wrap">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-text-input mono"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-toggle-pwd-btn"
                onClick={() => setShowPassword(p => !p)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="admin-demo-helper-bar">
            <span className="demo-helper-label">Quick Test:</span>
            <button 
              type="button" 
              className="demo-credentials-pill"
              onClick={handleFillDemoCredentials}
              title="Click to fill default admin credentials"
            >
              <Sparkles size={12} className="text-amber" />
              <span>Auto-fill: <strong>admin</strong> / <strong>valence2026!</strong></span>
            </button>
          </div>

          {/* Action Button */}
          <button 
            type="submit" 
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-spinner"></span>
                <span>Authenticating with SQL Database...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Sign In to Admin Panel</span>
                <ArrowRight size={16} className="btn-arrow" />
              </>
            )}
          </button>
        </form>

        {/* Database & Hosting Architecture Footer */}
        <div className="admin-login-footer">
          <div className="db-badge-row">
            <span className="infra-pill">
              <Server size={11} className="text-cyan" />
              <span>Netlify Serverless</span>
            </span>
            <span className="infra-sep">+</span>
            <span className="infra-pill">
              <Database size={11} className="text-amber" />
              <span>Cloudflare D1 SQL</span>
            </span>
          </div>
          <p className="admin-footer-sub">
            All price adjustments are cryptographically authenticated & recorded in the SQL audit ledger.
          </p>
        </div>
      </div>
    </div>
  );
}
