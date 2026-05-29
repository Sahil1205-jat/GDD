import React from 'react';
import { ShoppingCart, Moon, Sun, Shield, Award, Menu, X } from 'lucide-react';

export default function Navbar({ 
  currentView, 
  setView, 
  theme, 
  toggleTheme, 
  cartCount, 
  toggleCart,
  userPoints 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'store', label: 'Shop Dairy' },
    { id: 'customer', label: 'My Profile & Subs' }
  ];

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo-section" onClick={() => setView('home')}>
          <div className="logo-icon">🥛</div>
          <div className="logo-text">
            <span className="logo-brand">Ganga Dudh</span>
            <span className="logo-sub">Ganga Dudh Dairy • गंगा दूध</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`nav-link ${currentView === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
          
          <button 
            onClick={() => setView('admin')}
            className={`btn-admin-pill ${currentView === 'admin' ? 'active' : ''}`}
            title="Shopkeeper Dashboard"
          >
            <Shield size={16} />
            <span>Shopkeeper Admin</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* User Points Badge */}
          <div className="points-badge" title="GDD Milk Loyalty Points">
            <Award size={16} className="text-gold" />
            <span>{userPoints} Pts</span>
          </div>

          {/* Theme Toggler */}
          <button 
            onClick={toggleTheme} 
            className="theme-btn" 
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Cart Button */}
          <button 
            onClick={toggleCart} 
            className="cart-btn pulse-milk"
            aria-label="Open Shopping Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-card">
          <div className="mobile-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`mobile-nav-link ${currentView === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setView('admin');
                setMobileMenuOpen(false);
              }}
              className={`mobile-nav-link admin-mobile-link ${currentView === 'admin' ? 'active' : ''}`}
            >
              <Shield size={18} />
              <span>Shopkeeper Admin Portal</span>
            </button>
          </div>
        </div>
      )}

      {/* Styled JSX for local scoped adjustments without bloating index.css */}
      <style>{`
        .navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--bg-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          transition: background 0.3s, border-color 0.3s;
        }
        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          height: 80px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .logo-icon {
          font-size: 2.2rem;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15));
          animation: wiggle 5s infinite ease-in-out;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        .logo-text {
          display: flex;
          flex-direction: column;
        }
        .logo-brand {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-milk), var(--ghee-gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .logo-sub {
          font-size: 0.7rem;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-link {
          padding: 8px 16px;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-pill);
          transition: all 0.2s;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--primary-milk);
          background: var(--primary-milk-light);
        }
        .btn-admin-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-weight: 600;
          color: var(--text-secondary);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-pill);
          transition: all 0.2s;
        }
        .btn-admin-pill:hover, .btn-admin-pill.active {
          color: var(--chach-green);
          border-color: var(--chach-green);
          background: var(--chach-green-light);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .points-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-secondary);
          border-radius: var(--radius-pill);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .text-gold {
          color: var(--ghee-gold);
        }
        .theme-btn, .cart-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          position: relative;
          transition: all 0.2s;
        }
        .theme-btn:hover, .cart-btn:hover {
          border-color: var(--primary-milk);
          color: var(--primary-milk);
          background: var(--bg-secondary);
        }
        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--primary-milk);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          min-width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-card);
        }
        .mobile-toggle {
          display: none;
          color: var(--text-primary);
        }
        .mobile-drawer {
          position: absolute;
          top: 80px;
          left: 16px;
          right: 16px;
          z-index: 999;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .mobile-nav-link {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
        }
        .mobile-nav-link:hover, .mobile-nav-link.active {
          color: var(--primary-milk);
          background: var(--primary-milk-light);
        }
        .admin-mobile-link {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px dashed var(--border-color);
        }
        .admin-mobile-link:hover, .admin-mobile-link.active {
          color: var(--chach-green);
          background: var(--chach-green-light);
          border-color: var(--chach-green);
        }

        @media (max-width: 900px) {
          .desktop-nav {
            display: none;
          }
          .mobile-toggle {
            display: flex;
          }
          .points-badge {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
