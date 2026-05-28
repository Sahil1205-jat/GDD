import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageSquare, PhoneCall, ArrowRight, Smartphone, Check, Loader2 } from 'lucide-react';

export default function TruecallerLogin({ isOpen, onClose, onLoginSuccess }) {
  const [method, setMethod] = useState(null); // null | 'truecaller' | 'otp'
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [loadingStep, setLoadingStep] = useState(0); // 0: idle, 1: loading, 2: OTP sent, 3: verifying, 4: success
  const [loadingText, setLoadingText] = useState('');

  if (!isOpen) return null;

  // Truecaller Verification simulation sequence
  const startTruecallerVerification = () => {
    setMethod('truecaller');
    setLoadingStep(1);
    setLoadingText('Connecting to Truecaller Secure Gateway...');
    
    // Simulate SDK loading state
    setTimeout(() => {
      setLoadingStep(2); // Display Slide-up verification card
    }, 1200);
  };

  const handleTruecallerConfirm = () => {
    setLoadingStep(3);
    setLoadingText('Requesting secure credential token...');
    
    setTimeout(() => {
      setLoadingText('Authenticating signature and decrypting profile...');
      setTimeout(() => {
        setLoadingStep(4);
        setTimeout(() => {
          onLoginSuccess({
            name: 'Sahil Sepat',
            phone: '+91 98765 43210'
          });
          onClose();
        }, 800);
      }, 1000);
    }, 1200);
  };

  // OTP Fallback simulation sequence
  const startOtpFlow = () => {
    setMethod('otp');
    setLoadingStep(0);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoadingStep(1);
    setLoadingText('Generating OTP via SMS gateway...');
    
    setTimeout(() => {
      setLoadingStep(2); // Enter OTP state
      setLoadingText('OTP sent to ' + phoneInput);
      
      // Simulate auto-fill OTP after 1.5s
      setTimeout(() => {
        setOtpInput(['4', '8', '9', '2']);
      }, 1500);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    setLoadingStep(3);
    setLoadingText('Validating OTP credentials...');
    
    setTimeout(() => {
      if (otpInput.join('') === '4892') {
        setLoadingStep(4);
        setTimeout(() => {
          onLoginSuccess({
            name: 'Sahil Sepat', // Default mock user name
            phone: phoneInput.startsWith('+91') ? phoneInput : `+91 ${phoneInput}`
          });
          onClose();
        }, 800);
      } else {
        alert("Invalid OTP! Please enter the correct code 4892.");
        setLoadingStep(2);
      }
    }, 1500);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const nextOtp = [...otpInput];
    nextOtp[index] = value;
    setOtpInput(nextOtp);

    // Auto-focus next input field
    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-dialog glass-card animate-scale" onClick={(e) => e.stopPropagation()}>
        
        {/* Main Landing Menu */}
        {method === null && (
          <div className="login-menu-view">
            <span className="login-avatar-logo">🥛</span>
            <h3>Welcome to Ganga Dudh</h3>
            <p className="login-subtitle">Unlock farm-fresh morning deliveries and earn loyalty points.</p>

            {/* Truecaller Main Button */}
            <button 
              onClick={startTruecallerVerification} 
              className="btn btn-truecaller pulse-truecaller w-full"
            >
              <ShieldCheck size={20} />
              <span>Verify Instantly via Truecaller</span>
            </button>

            <div className="login-divider">
              <span>OR</span>
            </div>

            {/* OTP Fallback Trigger */}
            <button 
              onClick={startOtpFlow} 
              className="btn btn-secondary w-full"
            >
              <Smartphone size={18} />
              <span>Login with Mobile Number</span>
            </button>

            <p className="login-privacy-policy">
              By logging in, you agree to Ganga Dudh Dairy's Terms of Service and Privacy Policy. FSSAI Licensed.
            </p>
          </div>
        )}

        {/* METHOD A: TRUECALLER FLOW */}
        {method === 'truecaller' && (
          <div className="truecaller-view">
            {/* Loading/Decryption Phase */}
            {(loadingStep === 1 || loadingStep === 3) && (
              <div className="loading-canvas">
                <Loader2 size={40} className="spinner text-truecaller-color" />
                <h4>Secure Verification</h4>
                <p>{loadingText}</p>
              </div>
            )}

            {/* Simulated Truecaller SDK Slide-Up Drawer */}
            {loadingStep === 2 && (
              <div className="truecaller-drawer-sim">
                <div className="drawer-handle"></div>
                <div className="truecaller-header-row">
                  <div className="truecaller-logo-text">
                    <span className="tc-blue-shield">🛡️</span>
                    <strong>Truecaller</strong>
                  </div>
                  <span className="secure-badge">Instant Verify</span>
                </div>
                
                <div className="profile-card">
                  <div className="profile-avatar">S</div>
                  <div className="profile-meta">
                    <div className="profile-name-row">
                      <h4>Sahil Sepat</h4>
                      <span className="verified-tick-badge" title="Verified by Truecaller">✓</span>
                    </div>
                    <span className="profile-phone">+91 98765 43210</span>
                  </div>
                </div>

                <p className="drawer-terms">
                  Ganga Dudh Dairy is requesting access to your verified Truecaller profile to authenticate your shipping address.
                </p>

                <div className="drawer-actions">
                  <button onClick={() => setMethod(null)} className="btn btn-secondary flex-1">
                    Cancel
                  </button>
                  <button onClick={handleTruecallerConfirm} className="btn btn-truecaller flex-2">
                    Allow & Continue
                  </button>
                </div>
              </div>
            )}

            {/* Success Animation Checkmark */}
            {loadingStep === 4 && (
              <div className="success-canvas animate-scale">
                <div className="success-circle">
                  <Check size={40} />
                </div>
                <h4>Truecaller Verified!</h4>
                <p>Welcome back, Sahil.</p>
              </div>
            )}
          </div>
        )}

        {/* METHOD B: SMS OTP FLOW */}
        {method === 'otp' && (
          <div className="otp-view">
            <button onClick={() => setMethod(null)} className="back-to-menu-btn">
              ← Back
            </button>

            {loadingStep === 0 && (
              <form onSubmit={handleSendOtp} className="phone-form">
                <Smartphone size={32} className="text-primary-color" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                <h3>Enter Mobile Number</h3>
                <p className="login-subtitle">We will send a 4-digit verification code via SMS.</p>
                
                <div className="input-group" style={{ margin: '16px 0' }}>
                  <div className="phone-prefix-input">
                    <span className="prefix-lbl">+91</span>
                    <input
                      type="tel"
                      maxLength="10"
                      required
                      placeholder="98290 XXXXX"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      className="custom-input-check"
                      style={{ paddingLeft: '48px' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  <span>Send One-Time Password</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {loadingStep === 1 && (
              <div className="loading-canvas">
                <Loader2 size={40} className="spinner text-primary-color" />
                <h4>Sending SMS Code...</h4>
                <p>{loadingText}</p>
              </div>
            )}

            {loadingStep === 2 && (
              <div className="otp-verification-screen">
                <MessageSquare size={32} className="text-primary-color" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                <h3>Verify OTP Code</h3>
                <p className="login-subtitle">Enter the 4-digit code sent to +91 {phoneInput}</p>
                <p className="sim-hint">Simulating SMS: use code <strong>4892</strong></p>

                <div className="otp-slots-row">
                  {otpInput.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="otp-digit-field"
                    />
                  ))}
                </div>

                <button 
                  onClick={handleVerifyOtp}
                  disabled={otpInput.some(d => !d)}
                  className="btn btn-primary w-full"
                  style={{ marginTop: '16px' }}
                >
                  Verify & Log In
                </button>
              </div>
            )}

            {loadingStep === 3 && (
              <div className="loading-canvas">
                <Loader2 size={40} className="spinner text-primary-color" />
                <h4>Authenticating Secure OTP...</h4>
                <p>{loadingText}</p>
              </div>
            )}

            {loadingStep === 4 && (
              <div className="success-canvas animate-scale">
                <div className="success-circle">
                  <Check size={40} />
                </div>
                <h4>Login Successful!</h4>
                <p>Welcome to Ganga Dudh Dairy.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .login-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 20000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .login-dialog {
          width: 100%;
          max-width: 420px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 32px 24px;
          box-shadow: var(--shadow-lg);
          position: relative;
        }
        .animate-scale {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .login-avatar-logo {
          font-size: 4rem;
          display: block;
          text-align: center;
          margin-bottom: 16px;
        }
        .login-menu-view {
          text-align: center;
        }
        .login-menu-view h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .login-subtitle {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: 24px;
          line-height: 1.4;
        }
        .btn-truecaller {
          background: #2575fc;
          color: white;
          border-radius: var(--radius-pill);
          height: 48px;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 4px 14px rgba(37, 117, 252, 0.3);
        }
        .btn-truecaller:hover {
          background: #1a61db;
          transform: translateY(-1px);
        }
        .text-truecaller-color {
          color: #2575fc;
        }
        @keyframes tcPulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 117, 252, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(37, 117, 252, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 117, 252, 0); }
        }
        .pulse-truecaller {
          animation: tcPulse 2.5s infinite;
        }
        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 20px 0;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .login-divider::before, .login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }
        .login-divider:not(:empty)::before { margin-right: 12px; }
        .login-divider:not(:empty)::after { margin-left: 12px; }
        .login-privacy-policy {
          font-size: 0.65rem;
          color: var(--text-secondary);
          margin-top: 20px;
          line-height: 1.4;
        }

        /* Truecaller SDK Simulated Modal Sheet */
        .truecaller-drawer-sim {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: slideUpShort 0.3s ease-out;
        }
        @keyframes slideUpShort {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .drawer-handle {
          width: 36px;
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          align-self: center;
          margin-top: -8px;
          margin-bottom: 8px;
        }
        .truecaller-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .truecaller-logo-text {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #2575fc;
          font-size: 1.15rem;
        }
        .secure-badge {
          background: #dcfce7;
          color: #166534;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: var(--radius-sm);
        }
        .profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #2575fc;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: bold;
        }
        .profile-meta {
          display: flex;
          flex-direction: column;
        }
        .profile-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .profile-name-row h4 {
          font-size: 1rem;
          font-weight: 700;
        }
        .verified-tick-badge {
          background: #10b981;
          color: white;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 800;
        }
        .profile-phone {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .drawer-terms {
          font-size: 0.7rem;
          color: var(--text-secondary);
          line-height: 1.45;
          text-align: center;
        }
        .drawer-actions {
          display: flex;
          gap: 10px;
        }
        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }
        
        .loading-canvas {
          text-align: center;
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .loading-canvas h4 {
          font-size: 1.15rem;
          margin-top: 8px;
        }
        .loading-canvas p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .success-canvas {
          text-align: center;
          padding: 32px 0;
        }
        .success-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--chach-green-light);
          color: var(--chach-green);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        .success-canvas h3 {
          font-size: 1.3rem;
          margin-bottom: 6px;
        }
        
        /* OTP Fallback Form */
        .otp-view {
          position: relative;
        }
        .back-to-menu-btn {
          position: absolute;
          top: -12px;
          left: 0;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary-milk);
        }
        .back-to-menu-btn:hover {
          text-decoration: underline;
        }
        .phone-form {
          text-align: center;
          padding-top: 16px;
        }
        .phone-prefix-input {
          position: relative;
          display: flex;
          align-items: center;
        }
        .prefix-lbl {
          position: absolute;
          left: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        .sim-hint {
          background: var(--ghee-gold-light);
          color: var(--ghee-gold);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 4px;
          margin: 8px auto 16px auto;
          width: fit-content;
        }
        .otp-slots-row {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 20px 0;
        }
        .otp-digit-field {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: 1.4rem;
          font-weight: bold;
          text-align: center;
          outline: none;
        }
        .otp-digit-field:focus {
          border-color: var(--primary-milk);
          box-shadow: 0 0 0 3px rgba(var(--primary-milk-rgb), 0.1);
        }
        .otp-verification-screen {
          text-align: center;
          padding-top: 16px;
        }
      `}</style>
    </div>
  );
}
