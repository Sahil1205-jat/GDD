import React, { useState, useEffect } from 'react';
import { Check, CreditCard, QrCode, MapPin, Clock, ArrowLeft, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function CheckoutWizard({ 
  cartItems, 
  subscriptionOrder, // If subscribing directly from catalog
  userAddress, 
  userCoords,
  nearestShop,
  onOrderSuccess, 
  onCancel,
  user
}) {
  const [step, setStep] = useState(1);
  const [addressDetails, setAddressDetails] = useState(userAddress || '');
  const [deliverySlot, setDeliverySlot] = useState('morning'); // morning (6-9 AM) or evening (5-8 PM)
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi | card | cod
  const [isSimulating, setIsSimulating] = useState(false);
  const [upiTimer, setUpiTimer] = useState(120); // 2 minute countdown
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [name, setName] = useState(user?.name || 'Sahil Sepat');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Calculates billing
  const isSubscription = !!subscriptionOrder;
  const items = isSubscription 
    ? [{ ...subscriptionOrder, quantity: subscriptionOrder.quantity }]
    : cartItems;

  const subtotal = isSubscription
    ? Math.round(subscriptionOrder.price * 0.9) * subscriptionOrder.quantity * parseInt(subscriptionOrder.duration === 'ongoing' ? '30' : subscriptionOrder.duration)
    : items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const deliveryFee = subtotal >= 200 || subtotal === 0 ? 0 : 15;
  const grandTotal = subtotal + deliveryFee;

  // Countdown timer for UPI payments
  useEffect(() => {
    let interval = null;
    if (step === 2 && paymentMethod === 'upi' && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer((prev) => prev - 1);
      }, 1000);
    } else if (upiTimer === 0) {
      setUpiTimer(120); // Reset
    }
    return () => clearInterval(interval);
  }, [step, paymentMethod, upiTimer]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSimulatePayment = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      
      const completeOrderObj = {
        items: isSubscription ? [] : items,
        subscription: isSubscription ? {
          productId: subscriptionOrder.id,
          name: subscriptionOrder.name,
          quantity: subscriptionOrder.quantity,
          price: Math.round(subscriptionOrder.price * 0.9),
          unit: subscriptionOrder.unit,
          frequency: subscriptionOrder.frequency,
          duration: subscriptionOrder.duration,
          totalPrice: subtotal
        } : null,
        branchId: nearestShop?.id || 'vaishali',
        customerName: name,
        address: addressDetails,
        coords: userCoords,
        deliverySlot: deliverySlot === 'morning' ? 'Morning (6:00 AM - 9:00 AM)' : 'Evening (5:00 PM - 8:00 PM)',
        paymentMethod: paymentMethod.toUpperCase(),
        totalAmount: grandTotal
      };

      onOrderSuccess(completeOrderObj);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="checkout-wizard-card glass-card">
      {/* Wizard Header Progress Bar */}
      <div className="wizard-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-num">{step > 1 ? <Check size={14} /> : '1'}</div>
          <span>Delivery Details</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-num">{step > 2 ? <Check size={14} /> : '2'}</div>
          <span>Secure Payment</span>
        </div>
        <div className="progress-line" />
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-num">3</div>
          <span>Enjoy Fresh Milk!</span>
        </div>
      </div>

      <hr className="divider" />

      {/* STEP 1: Delivery Details */}
      {step === 1 && (
        <div className="step-container">
          <h3 className="step-title">📍 Confirm Delivery Logistics</h3>
          <p className="step-subtitle">Please specify your delivery timings and confirm the contact information.</p>

          <div className="step-grid">
            <div className="step-form">
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Recipient Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="custom-input-check"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Mobile Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="custom-input-check"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Delivery Address Line (Auto-filled from Map)</label>
                <textarea 
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  className="custom-textarea"
                  rows="3"
                />
              </div>

              {/* Delivery Slot Selectors */}
              <div className="slot-selection">
                <label className="input-label">Preferred Delivery Slot</label>
                <div className="slots-grid">
                  <button 
                    onClick={() => setDeliverySlot('morning')}
                    className={`slot-card ${deliverySlot === 'morning' ? 'active' : ''}`}
                  >
                    <Clock size={20} className="slot-icon text-blue" />
                    <div className="slot-meta">
                      <strong>Morning Slot</strong>
                      <span>6:00 AM - 9:00 AM</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setDeliverySlot('evening')}
                    className={`slot-card ${deliverySlot === 'evening' ? 'active' : ''}`}
                  >
                    <Clock size={20} className="slot-icon text-gold" />
                    <div className="slot-meta">
                      <strong>Evening Slot</strong>
                      <span>5:00 PM - 8:00 PM</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Order Summary */}
            <div className="order-summary-box bg-light-panel">
              <h4 className="summary-title">Order Summary</h4>
              <div className="summary-items-list">
                {items.map((item) => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-left">
                      <strong>{item.quantity}x</strong>
                      <span>{item.name}</span>
                      {isSubscription && <span className="sub-tag">Sub ({item.frequency})</span>}
                    </div>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <hr className="summary-divider" />

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-row grand-total">
                  <span>Total Payable</span>
                  <strong>₹{grandTotal}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="wizard-actions">
            <button onClick={onCancel} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Store</span>
            </button>
            <button 
              onClick={() => setStep(2)} 
              disabled={!addressDetails || !phone} 
              className="btn btn-primary ml-auto"
            >
              <span>Proceed to Payment</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Secure Payment */}
      {step === 2 && (
        <div className="step-container">
          <h3 className="step-title">💳 Secure Payments</h3>
          <p className="step-subtitle">Your transaction is fully encrypted and secured by Ganga Dudh Dairy.</p>

          <div className="step-grid">
            {/* Payment Method Selectors */}
            <div className="payment-options">
              <button 
                onClick={() => setPaymentMethod('upi')}
                className={`payment-method-card ${paymentMethod === 'upi' ? 'active' : ''}`}
              >
                <QrCode size={20} />
                <span>UPI Scan & Pay (GPay/PhonePe)</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}
              >
                <CreditCard size={20} />
                <span>Credit / Debit Card</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('cod')}
                className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`}
              >
                <ShoppingBag size={20} />
                <span>Cash on Delivery (COD)</span>
              </button>
            </div>

            {/* Payment Portal Canvas */}
            <div className="payment-canvas glass-card">
              {paymentMethod === 'upi' && (
                <div className="upi-portal">
                  <div className="upi-qr-placeholder">
                    {/* Simulated beautiful QR code using clean CSS */}
                    <div className="simulated-qr">
                      <div className="qr-corner qr-tl"></div>
                      <div className="qr-corner qr-tr"></div>
                      <div className="qr-corner qr-bl"></div>
                      <div className="qr-center-logo">🥛</div>
                    </div>
                  </div>
                  <div className="upi-info">
                    <h4>Scan to Pay ₹{grandTotal}</h4>
                    <span className="upi-timer-badge">
                      Timer: <strong>{formatTime(upiTimer)}</strong>
                    </span>
                    <p className="upi-desc">Scan this simulated QR code using Google Pay, PhonePe, Paytm, or BHIM.</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="card-portal">
                  <div className="simulated-credit-card animate-float">
                    <div className="card-chip"></div>
                    <div className="card-brand">Ganga Dairy Gold</div>
                    <div className="card-number">•••• •••• •••• 4892</div>
                    <div className="card-holder-row">
                      <div>
                        <div className="card-lbl">HOLDER</div>
                        <div>{name}</div>
                      </div>
                      <div>
                        <div className="card-lbl">EXPIRES</div>
                        <div>12/29</div>
                      </div>
                    </div>
                  </div>

                  <div className="card-inputs">
                    <input type="text" placeholder="Cardholder Name" defaultValue={name} className="custom-input-check" />
                    <input type="text" placeholder="Card Number (Simulated)" defaultValue="4321 9821 4892 1092" className="custom-input-check" />
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="cod-portal">
                  <div className="cod-illustration">🤝</div>
                  <h4>Pay Cash / UPI upon Delivery</h4>
                  <p className="cod-desc">
                    Keep cash handy or pay the delivery agent via UPI QR when they arrive. Fresh items will reach you between **{deliverySlot === 'morning' ? '6:00 AM - 9:00 AM' : '5:00 PM - 8:00 PM'}** tomorrow.
                  </p>
                </div>
              )}

              <hr className="divider" style={{ margin: '16px 0' }} />

              <button 
                onClick={handleSimulatePayment} 
                disabled={isSimulating}
                className="btn btn-primary w-full pulse-milk"
              >
                {isSimulating ? (
                  <span className="flex-row-center">
                    <span className="spinner"></span>
                    <span>Processing Secure Gateway...</span>
                  </span>
                ) : (
                  <span>Verify & Pay ₹{grandTotal}</span>
                )}
              </button>
              
              <div className="security-tag">
                <ShieldCheck size={14} className="text-green" />
                <span>PCI-DSS Compliant • Bank Grade 256-bit SSL Security</span>
              </div>
            </div>
          </div>

          <div className="wizard-actions">
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Shipping</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .checkout-wizard-card {
          max-width: 960px;
          margin: 32px auto;
        }
        .wizard-progress {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10%;
          margin-bottom: 24px;
        }
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .progress-step.active {
          color: var(--primary-milk);
        }
        .step-num {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          font-weight: 700;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .progress-step.active .step-num {
          background: var(--primary-milk);
          color: white;
          border-color: var(--primary-milk);
          box-shadow: 0 4px 10px rgba(var(--primary-milk-rgb), 0.3);
        }
        .progress-line {
          flex-grow: 1;
          height: 2px;
          background: var(--border-color);
          margin: 0 12px;
          margin-top: -20px;
        }
        .divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin-bottom: 24px;
        }
        .step-container {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .step-title {
          font-size: 1.4rem;
          margin-bottom: 4px;
        }
        .step-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 24px;
        }
        .step-grid {
          display: grid;
          grid-template-columns: 1.8fr 1.2fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        .step-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .custom-input-check, .custom-textarea {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
        }
        .custom-input-check:focus, .custom-textarea:focus {
          border-color: var(--primary-milk);
        }
        .slots-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }
        .slot-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          transition: all 0.2s;
          text-align: left;
        }
        .slot-card.active {
          border-color: var(--primary-milk);
          background: var(--primary-milk-light);
        }
        .slot-meta {
          display: flex;
          flex-direction: column;
        }
        .slot-meta strong {
          font-size: 0.85rem;
          color: var(--text-primary);
        }
        .slot-meta span {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .slot-icon {
          padding: 6px;
          border-radius: 50%;
          background: var(--bg-secondary);
        }
        .slot-icon.text-blue {
          color: var(--primary-milk);
        }
        .slot-icon.text-gold {
          color: var(--ghee-gold);
        }
        .order-summary-box {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
          background: var(--bg-secondary);
        }
        .summary-title {
          font-size: 1.1rem;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }
        .summary-items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 180px;
          overflow-y: auto;
          margin-bottom: 16px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .summary-item-left {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .sub-tag {
          font-size: 0.65rem;
          padding: 1px 4px;
          background: var(--ghee-gold-light);
          color: var(--ghee-gold);
          border-radius: 4px;
          font-weight: 700;
        }
        .summary-divider {
          border: 0;
          border-top: 1px dashed var(--border-color);
          margin: 12px 0;
        }
        .summary-totals {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .summary-row.grand-total {
          font-size: 1rem;
          color: var(--text-primary);
        }
        .summary-row.grand-total strong {
          font-size: 1.25rem;
          color: var(--primary-milk);
        }
        .wizard-actions {
          display: flex;
          margin-top: 24px;
        }
        .ml-auto {
          margin-left: auto;
        }
        
        /* Payment Styles */
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .payment-method-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
          text-align: left;
        }
        .payment-method-card.active {
          border-color: var(--primary-milk);
          background: var(--primary-milk-light);
          color: var(--primary-milk);
        }
        .payment-canvas {
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .upi-portal {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }
        .simulated-qr {
          width: 140px;
          height: 140px;
          background: white;
          border: 10px solid #1e293b;
          border-radius: 8px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-corner {
          width: 25px;
          height: 25px;
          border: 6px solid #1e293b;
          position: absolute;
        }
        .qr-tl { top: 6px; left: 6px; }
        .qr-tr { top: 6px; right: 6px; }
        .qr-bl { bottom: 6px; left: 6px; }
        .qr-center-logo {
          font-size: 2.2rem;
        }
        .upi-info h4 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }
        .upi-timer-badge {
          background: var(--danger-red-light);
          color: var(--danger-red);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
        }
        .upi-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 8px;
          max-width: 280px;
        }
        .card-portal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }
        .simulated-credit-card {
          width: 100%;
          max-width: 280px;
          height: 160px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, hsl(45, 95%, 45%), hsl(45, 100%, 65%));
          padding: 16px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: var(--shadow-md);
        }
        .card-chip {
          width: 32px;
          height: 24px;
          background: #d1d5db;
          border-radius: 4px;
        }
        .card-brand {
          font-size: 0.95rem;
          font-weight: 800;
          text-align: right;
          margin-top: -24px;
        }
        .card-number {
          font-size: 1.1rem;
          letter-spacing: 0.1em;
          text-align: center;
          margin: 12px 0;
        }
        .card-holder-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }
        .card-lbl {
          font-size: 0.55rem;
          opacity: 0.7;
          margin-bottom: 2px;
        }
        .card-inputs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        .cod-portal {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          padding: 16px 0;
        }
        .cod-illustration {
          font-size: 3.5rem;
        }
        .cod-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          max-width: 280px;
          line-height: 1.4;
        }
        .flex-row-center {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .security-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.65rem;
          color: var(--text-secondary);
          margin-top: 10px;
        }
        .text-green {
          color: var(--chach-green);
        }

        @media (max-width: 900px) {
          .step-grid {
            grid-template-columns: 1fr;
          }
          .wizard-progress {
            padding: 0;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
