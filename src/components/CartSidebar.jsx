import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onProceedToCheckout 
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 200 || subtotal === 0 ? 0 : 15;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-sidebar-header">
          <div className="cart-header-title">
            <ShoppingBag size={22} className="text-primary-color" />
            <h3>Your Shopping Cart</h3>
            <span className="cart-count-bubble">{cartItems.length}</span>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close Cart">
            <X size={20} />
          </button>
        </div>

        {/* Cart Contents */}
        <div className="cart-items-container">
          {cartItems.length === 0 ? (
            <div className="empty-cart-view">
              <span className="empty-cart-emoji">🥛</span>
              <h4>Your Cart is Empty</h4>
              <p>Add fresh cow milk, ghee, and chach to start delivering health to your home.</p>
              <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '16px' }}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-visual">
                    {item.category === 'milk' && '🥛'}
                    {item.category === 'ghee' && '🍯'}
                    {item.category === 'beverage' && '🥤'}
                    {item.category === 'paneer' && '🧀'}
                    {item.category === 'dahi' && '🥣'}
                    {item.category === 'butter' && '🧈'}
                  </div>
                  <div className="cart-item-details">
                    <h5 className="cart-item-name">{item.name}</h5>
                    <span className="cart-item-unit">₹{item.price} / {item.unit}</span>
                    <div className="cart-item-adjuster">
                      <div className="qty-picker small-picker">
                        <button 
                          onClick={() => onUpdateQty(item.id, -1)} 
                          className="qty-btn small-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-number small-number">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQty(item.id, 1)} 
                          className="qty-btn small-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="cart-item-subtotal">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)} 
                    className="trash-btn" 
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Billing Details */}
        {cartItems.length > 0 && (
          <div className="cart-sidebar-footer">
            {/* Free Shipping Alert */}
            {subtotal < 200 ? (
              <div className="shipping-alert alert-yellow">
                <span>Add <strong>₹{200 - subtotal}</strong> more for <strong>FREE DELIVERY</strong>!</span>
              </div>
            ) : (
              <div className="shipping-alert alert-green">
                <span>🎉 You qualify for <strong>FREE EXPRESS DELIVERY</strong>!</span>
              </div>
            )}

            <div className="billing-summary">
              <div className="billing-row">
                <span>Cart Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="billing-row">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <hr className="billing-divider" />
              <div className="billing-row grand-total-row">
                <span>Grand Total</span>
                <strong>₹{grandTotal}</strong>
              </div>
            </div>

            <button 
              onClick={onProceedToCheckout} 
              className="btn btn-primary checkout-action-btn w-full"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 10000;
          display: flex;
          justify-content: flex-end;
          backdrop-filter: blur(4px);
        }
        .cart-sidebar {
          width: 100%;
          max-width: 440px;
          height: 100%;
          background: var(--bg-card);
          border-radius: 0;
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 0;
          box-shadow: var(--shadow-lg);
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .cart-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }
        .cart-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cart-header-title h3 {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .cart-count-bubble {
          background: var(--primary-milk-light);
          color: var(--primary-milk);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .cart-items-container {
          flex-grow: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .empty-cart-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
          padding: 0 16px;
        }
        .empty-cart-emoji {
          font-size: 4rem;
          margin-bottom: 16px;
        }
        .empty-cart-view h4 {
          font-size: 1.15rem;
          margin-bottom: 6px;
        }
        .empty-cart-view p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.4;
        }
        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cart-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-primary);
          transition: border-color 0.2s;
        }
        .cart-item:hover {
          border-color: var(--primary-milk);
        }
        .cart-item-visual {
          font-size: 2.2rem;
          width: 50px;
          height: 50px;
          background: var(--bg-card);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }
        .cart-item-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cart-item-name {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .cart-item-unit {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .cart-item-adjuster {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }
        .small-picker {
          padding: 2px;
        }
        .small-btn {
          width: 24px;
          height: 24px;
        }
        .small-number {
          width: 22px;
          font-size: 0.8rem;
        }
        .cart-item-subtotal {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .trash-btn {
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .trash-btn:hover {
          color: var(--danger-red);
          background: var(--danger-red-light);
        }
        .cart-sidebar-footer {
          padding: 24px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-primary);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .shipping-alert {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          text-align: center;
          font-weight: 600;
        }
        .alert-yellow {
          background: var(--ghee-gold-light);
          color: var(--ghee-gold);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .alert-green {
          background: var(--chach-green-light);
          color: var(--chach-green);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .billing-summary {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .billing-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .billing-divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin: 4px 0;
        }
        .grand-total-row {
          font-size: 1.1rem;
          color: var(--text-primary);
        }
        .grand-total-row strong {
          font-size: 1.3rem;
          color: var(--primary-milk);
        }
        .checkout-action-btn {
          height: 50px;
          font-size: 0.95rem;
          border-radius: var(--radius-pill);
        }
      `}</style>
    </div>
  );
}
