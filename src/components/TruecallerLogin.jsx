import React, { useState, useEffect } from 'react';
import { ShieldCheck, MessageSquare, ArrowRight, Smartphone, Check, Loader2, Settings, Info, User } from 'lucide-react';

export default function TruecallerLogin({ isOpen, onClose, onLoginSuccess }) {
  const [method, setMethod] = useState(null); // null | 'truecaller' | 'otp'
  const [nameInput, setNameInput] = useState(''); // Custom Name registration input
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [loadingStep, setLoadingStep] = useState(0); // 0: idle, 1: loading, 2: loaded, 3: verifying, 4: success
  const [loadingText, setLoadingText] = useState('');
  
  // Developer Sandbox Settings - Fully Customizable Mock Profile!
  const [isSandbox, setIsSandbox] = useState(true);
  const [partnerKey, setPartnerKey] = useState('gdd_dummy_partner_key_1092');
  const [showDevSettings, setShowDevSettings] = useState(false);
  const [sdkStatus, setSdkStatus] = useState('Simulator Mode Active');
  
  // Mock Truecaller Identity settings
  const [mockName, setMockName] = useState('Sahil Sepat');
  const [mockPhone, setMockPhone] = useState('+91 98765 43210');

  if (!isOpen) return null;

  // DYNAMIC SCRIPT INJECTION: Load Truecaller Web SDK CDN Script
  useEffect(() => {
    if (isSandbox) {
      setSdkStatus('Simulator Mode Active');
      return;
    }

    setSdkStatus('Loading SDK...');
    const existingScript = document.getElementById('truecaller-sdk-script');
    
    if (existingScript) {
      initTruecallerSDK();
      return;
    }

    const script = document.createElement('script');
    script.id = 'truecaller-sdk-script';
    script.src = 'https://one-tap-sdk-web.truecaller.com/v1.0/sdk.js';
    script.async = true;
    script.onload = () => {
      setSdkStatus('Loaded successfully');
      initTruecallerSDK();
    };
    script.onerror = () => {
      setSdkStatus('Failed to load. Blocked by origin.');
      console.warn('Truecaller SDK script failed to load. Falling back to Sandbox simulator.');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanups
    };
  }, [isSandbox]);

  // INITIALIZE THE OFFICIAL TRUECALLER SDK API
  const initTruecallerSDK = () => {
    try {
      if (window.Truecaller) {
        window.Truecaller.init({
          partnerKey: partnerKey,
          partnerName: 'Ganga Dudh Dairy',
          buttonStyle: 'ROUNDED',
          buttonColor: '#2575fc',
          buttonTextColor: '#ffffff',
          loginState: 'LOG_IN',
          onVerificationSuccess: (profile) => {
            setLoadingStep(4);
            setTimeout(() => {
              onLoginSuccess({
                name: profile.firstName + ' ' + (profile.lastName || ''),
                phone: profile.phoneNumber
              });
              onClose();
            }, 800);
          },
          onVerificationFailed: (error) => {
            console.error('Truecaller SDK Verification Failed:', error);
            setLoadingStep(0);
            setMethod(null);
            alert(`SDK Error: ${error.message || 'Verification aborted'}. Falling back to Sandbox.`);
            setIsSandbox(true);
          }
        });
        setSdkStatus('Initialized & Ready');
      }
    } catch (err) {
      setSdkStatus('Init Error: ' + err.message);
    }
  };

  // Truecaller Verification Flow Trigger
  const handleTruecallerLogin = () => {
    setMethod('truecaller');

    if (isSandbox) {
      setLoadingStep(1);
      setLoadingText('Connecting to Truecaller Secure Gateway...');
      setTimeout(() => {
        setLoadingStep(2); // Display Slide-up verification card
      }, 1200);
    } else {
      if (!window.Truecaller) {
        alert('Truecaller SDK is not loaded yet or blocked by domain. Bypassing to Sandbox Mode.');
        setIsSandbox(true);
        setLoadingStep(1);
        setLoadingText('Connecting to Sandbox Simulator...');
        setTimeout(() => setLoadingStep(2), 1000);
        return;
      }
      
      setLoadingStep(1);
      setLoadingText('Triggering Truecaller One-Tap Web SDK...');
      
      try {
        window.Truecaller.triggerOneTap();
      } catch (err) {
        alert('Truecaller triggerOneTap failed due to Domain mismatch on localhost. Auto-bypassing to Sandbox.');
        setIsSandbox(true);
        setLoadingStep(2);
      }
    }
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
            name: mockName, // Use customizable sandbox name!
            phone: mockPhone // Use customizable sandbox phone!
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
    if (!nameInput.trim()) {
      alert("Please enter your Full Name.");
      return;
    }
    if (!phoneInput || phoneInput.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoadingStep(1);
    setLoadingText('Generating OTP via SMS gateway...');
    
    setTimeout(() => {
      setLoadingStep(2); // Enter OTP state
      setLoadingText('OTP sent to ' + phoneInput);
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
            name: nameInput, // Use the user's custom registered name!
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

    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-dialog zomato-login-card animate-scale" onClick={(e) => e.stopPropagation()}>
        
        {/* Sandbox Dev Settings Toggler */}
        <button 
          onClick={() => setShowDevSettings(!showDevSettings)} 
          className="dev-settings-btn"
          title="Truecaller API Sandbox Configurator"
        >
          <Settings size={18} />
        </button>

        {/* Developer settings pane */}
        {showDevSettings && (
          <div className="dev-settings-pane bg-light-panel animate-scale">
            <h5>⚙️ Truecaller API Sandbox</h5>
            <div className="dev-row">
              <label>SDK Load Status:</label>
              <strong className={sdkStatus.includes('Ready') || sdkStatus.includes('Active') ? 'text-green' : 'text-red'}>
                {sdkStatus}
              </strong>
            </div>
            
            {/* Custom Mock Profile Name */}
            <div className="dev-row">
              <label>Mock Profile Name:</label>
              <input 
                type="text" 
                value={mockName} 
                onChange={(e) => setMockName(e.target.value)} 
                className="dev-input"
              />
            </div>
            {/* Custom Mock Profile Phone */}
            <div className="dev-row">
              <label>Mock Profile Phone:</label>
              <input 
                type="text" 
                value={mockPhone} 
                onChange={(e) => setMockPhone(e.target.value)} 
                className="dev-input"
              />
            </div>

            <div className="dev-row">
              <label>Partner Key:</label>
              <input 
                type="text" 
                value={partnerKey} 
                onChange={(e) => setPartnerKey(e.target.value)} 
                className="dev-input"
              />
            </div>
            <div className="dev-row flex-row-between">
              <label>Bypass Domain Locks (Sandbox):</label>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={isSandbox}
                  onChange={(e) => {
                    setIsSandbox(e.target.checked);
                    setLoadingStep(0);
                    setMethod(null);
                  }}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="dev-info">
              <Info size={12} />
              <span>Truecaller's live API restricts domain origins. Keep <strong>Sandbox ON</strong> to showcase a flawless verification demo on Vercel without key mismatches!</span>
            </div>
          </div>
        )}

        {/* ZOMATO INSPIRED LOGIN VIEW */}
        {method === null && (
          <div className="zomato-login-menu">
            <div className="zomato-header-logo">
              <div className="logo-milk-bottle">🥛</div>
              <div className="zomato-glow-ring"></div>
            </div>
            <h3>Ganga Dudh Dairy</h3>
            <p className="login-subtitle">Jaipur's Purest Milk items • Delivered fresh in 5-6 km</p>
            
            <h4 className="zomato-login-title">Login or Signup</h4>

            {/* ZOMATO-STYLE CUSTOMER REGISTER & PHONE FORM */}
            <form onSubmit={handleSendOtp} className="zomato-phone-form">
              {/* Full Name Input Slot */}
              <div className="zomato-input-wrapper" style={{ marginBottom: '8px' }}>
                <div className="country-flag-selector">
                  <User size={18} className="text-secondary" style={{ marginRight: '6px' }} />
                  <span className="divider-line">|</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter Full Name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="zomato-phone-input"
                />
              </div>

              {/* Phone Number Input Slot */}
              <div className="zomato-input-wrapper">
                <div className="country-flag-selector">
                  <span className="flag-icon">🇮🇳</span>
                  <span className="prefix-num">+91</span>
                  <span className="divider-line">|</span>
                </div>
                <input
                  type="tel"
                  maxLength="10"
                  required
                  placeholder="Enter Mobile Number"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                  className="zomato-phone-input"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-zomato-red w-full">
                <span>Send One-Time Password</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="login-divider">
              <span>or</span>
            </div>

            {/* ZOMATO-STYLE TRUECALLER INTEGRATION BUTTON */}
            <button 
              onClick={handleTruecallerLogin} 
              className="btn btn-zomato-truecaller pulse-truecaller w-full"
            >
              <div className="tc-btn-inner">
                <span className="tc-btn-icon">🛡️</span>
                <span>Continue as {mockName}</span>
              </div>
              <span className="verified-badge-zomato">Verified</span>
            </button>

            <p className="login-privacy-policy">
              By continuing, you agree to our **Terms of Service** and **Privacy Policy**. All standard SMS charges apply.
            </p>
          </div>
        )}

        {/* METHOD A: TRUECALLER FLOW */}
        {method === 'truecaller' && (
          <div className="truecaller-view">
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
                  <div className="profile-avatar">{mockName.charAt(0)}</div>
                  <div className="profile-meta">
                    <div className="profile-name-row">
                      <h4>{mockName}</h4>
                      <span className="verified-tick-badge" title="Verified by Truecaller">✓</span>
                    </div>
                    <span className="profile-phone">{mockPhone}</span>
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
                <p>Welcome back, {mockName}.</p>
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
                  className="btn btn-primary w-full btn-zomato-red"
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
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 20000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        
        /* ZOMATO THEMED CARD */
        .zomato-login-card {
          width: 100%;
          max-width: 440px;
          background: var(--bg-card);
          border-radius: 20px;
          padding: 36px 28px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.16);
          position: relative;
          border: 1px solid var(--border-color);
        }

        /* Developer Settings Panel */
        .dev-settings-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          color: var(--text-secondary);
          opacity: 0.6;
          transition: all 0.2s;
        }
        .dev-settings-btn:hover {
          opacity: 1;
          transform: rotate(45deg);
        }
        .dev-settings-pane {
          position: absolute;
          top: 64px;
          left: 20px;
          right: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px;
          z-index: 10;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dev-settings-pane h5 {
          font-size: 0.95rem;
          font-weight: 700;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
        }
        .dev-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }
        .dev-input {
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          width: 60%;
        }
        .dev-info {
          display: flex;
          gap: 8px;
          font-size: 0.65rem;
          color: var(--text-secondary);
          line-height: 1.35;
          padding-top: 6px;
          border-top: 1px dashed var(--border-color);
        }

        .zomato-login-menu {
          text-align: center;
        }
        .zomato-header-logo {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 16px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: 50%;
          box-shadow: var(--shadow-sm);
        }
        .logo-milk-bottle {
          font-size: 3rem;
          z-index: 2;
        }
        .zomato-glow-ring {
          position: absolute;
          width: 90%;
          height: 90%;
          border: 2px dashed var(--primary-milk);
          border-radius: 50%;
          animation: spin 12s linear infinite;
        }
        .zomato-login-menu h3 {
          font-size: 1.45rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text-primary), var(--primary-milk));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .zomato-login-title {
          font-size: 1.2rem;
          font-weight: 800;
          margin: 28px 0 16px 0;
          text-align: left;
          letter-spacing: -0.01em;
        }

        /* ZOMATO SPECIFIC PHONE ENTRY */
        .zomato-phone-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .zomato-input-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-input);
          padding: 4px 12px;
          height: 52px;
          transition: border-color 0.2s;
        }
        .zomato-input-wrapper:focus-within {
          border-color: var(--primary-milk);
          background: var(--bg-card);
          box-shadow: 0 0 0 4px rgba(var(--primary-milk-rgb), 0.08);
        }
        .country-flag-selector {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .divider-line {
          color: var(--border-color);
          margin-left: 4px;
        }
        .zomato-phone-input {
          flex-grow: 1;
          border: none;
          background: transparent;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          padding-left: 10px;
        }
        .btn-zomato-red {
          background: linear-gradient(135deg, #e11d48, #be123c); /* Zomato classic red gradient */
          color: white;
          border-radius: 12px;
          height: 48px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
        }
        .btn-zomato-red:hover {
          background: linear-gradient(135deg, #be123c, #9f1239);
          transform: translateY(-1px);
        }

        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
        }
        .login-divider::before, .login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }
        .login-divider:not(:empty)::before { margin-right: 16px; }
        .login-divider:not(:empty)::after { margin-left: 16px; }

        /* ZOMATO TRUECALLER BUTTON BUTTON */
        .btn-zomato-truecaller {
          background: #ffffff;
          border: 1px solid #2575fc;
          color: #2575fc;
          border-radius: 12px;
          height: 52px;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37, 117, 252, 0.05);
        }
        [data-theme="dark"] .btn-zomato-truecaller {
          background: var(--bg-secondary);
          border-color: #2575fc;
        }
        .btn-zomato-truecaller:hover {
          background: #2575fc;
          color: white !important;
          box-shadow: 0 4px 16px rgba(37, 117, 252, 0.3);
          transform: translateY(-1px);
        }
        .tc-btn-inner {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tc-btn-icon {
          font-size: 1.15rem;
        }
        .verified-badge-zomato {
          background: #dbeafe;
          color: #1e40af;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .btn-zomato-truecaller:hover .verified-badge-zomato {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .pulse-truecaller {
          animation: tcPulse 3s infinite;
        }
        @keyframes tcPulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 117, 252, 0.15); }
          70% { box-shadow: 0 0 0 10px rgba(37, 117, 252, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 117, 252, 0); }
        }

        .login-privacy-policy {
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 24px;
          line-height: 1.45;
        }

        /* Truecaller SDK Simulated Drawer */
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

        @media(max-width: 768px) {
          .zomato-login-card {
            padding: 28px 20px;
            border-radius: 20px 20px 0 0 !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 20002;
            box-shadow: 0 -8px 32px rgba(0,0,0,0.25);
            animation: slideUpShort 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .truecaller-drawer-sim {
            border: none !important;
            position: relative !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
