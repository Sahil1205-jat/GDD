import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapSelector from './components/MapSelector';
import ProductCatalog from './components/ProductCatalog';
import CartSidebar from './components/CartSidebar';
import CheckoutWizard from './components/CheckoutWizard';
import CustomerDashboard from './components/CustomerDashboard';
import ShopkeeperPortal from './components/ShopkeeperPortal';
import TruecallerLogin from './components/TruecallerLogin';
import WhatsAppSimulator from './components/WhatsAppSimulator';
import Footer from './components/Footer';

import { initDB, getDBData, setDBData, addOrder, addSubscription, getUserProfile, saveUserProfile, claimReward } from './utils/db';
import RiderTracker from './components/RiderTracker';
import { Calendar, Compass, Shield, Smile, ArrowRight, HelpCircle, ChevronDown, CheckCircle, Home, ShoppingBag as StoreIcon, LogIn, LogOut, Award, MessageCircle, User } from 'lucide-react';

export default function App() {
  // Initialize Database
  useEffect(() => {
    initDB();
  }, []);

  // Application States
  const [view, setView] = useState('home'); // home | store | customer | admin | checkout
  const [theme, setTheme] = useState(localStorage.getItem('gdd_theme') || 'light');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // PERSISTENT AUTH SESSION - Reloading page will NEVER log the customer out!
  const [user, setUser] = useState(() => {
    initDB();
    const active = localStorage.getItem('gdd_active_user');
    return active ? JSON.parse(active) : null; 
  });
  const [loginOpen, setLoginOpen] = useState(false);

  // User spatial states
  const [selectedCoords, setSelectedCoords] = useState({ lat: 26.9082, lng: 75.7485 });
  const [selectedAddress, setSelectedAddress] = useState('Plot 45, Amrapali Circle, Vaishali Nagar, Jaipur');
  const [eligibility, setEligibility] = useState(null);

  // Dynamic transactional states
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({});
  const [userPoints, setUserPoints] = useState(0);

  // Checkout Direct Subs order
  const [directSubscriptionOrder, setDirectSubscriptionOrder] = useState(null);

  // WhatsApp Simulator Widget States
  const [waOpen, setWaOpen] = useState(false);
  const [waActiveOrder, setWaActiveOrder] = useState(null);
  const [waActiveSubscription, setWaActiveSubscription] = useState(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null); // Real-time delivery tracker map state

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState({});

  // Sync state changes with database
  useEffect(() => {
    if (user) {
      // Query specific customer profile from relational schema by phone index!
      const profile = getUserProfile(user.phone);
      setSubscriptions(profile.subscriptions || []);
      setOrders(profile.orders || []);
      setInventory(getDBData('inventory') || {});
      setUserPoints(profile.points || 0);
      
      if (profile.coords) setSelectedCoords(profile.coords);
      if (profile.address) setSelectedAddress(profile.address);
    } else {
      setSubscriptions([]);
      setOrders([]);
      setInventory(getDBData('inventory') || {});
      setUserPoints(0);
    }
  }, [user, view]);

  // Apply Theme Mode Attributes to Body Tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gdd_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Truecaller / Manual Profile Verification Callbacks
  const handleLoginSuccess = (profile) => {
    // Retrieve custom record or construct a new one in localized collection
    const userRecord = getUserProfile(profile.phone);
    
    // Override profile name with the one custom entered during Zomato OTP login
    userRecord.name = profile.name;
    userRecord.address = selectedAddress;
    userRecord.coords = selectedCoords;
    
    // Save customer record under his phone index
    saveUserProfile(profile.phone, userRecord);
    
    // Set active auth session in localStorage
    localStorage.setItem('gdd_active_user', JSON.stringify({
      name: userRecord.name,
      phone: userRecord.phone,
      points: userRecord.points
    }));
    
    setUser(userRecord);
    setLoginOpen(false);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out from Ganga Dudh Dairy?")) {
      localStorage.removeItem('gdd_active_user');
      setUser(null);
      setView('home');
      setCart([]);
    }
  };

  const handleSecureViewSwitch = (nextView) => {
    if (nextView === 'customer' || nextView === 'checkout') {
      if (!user) {
        setLoginOpen(true);
        return;
      }
    }
    setView(nextView);
  };

  // Cart Operations
  const handleAddToCart = (product, quantity) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    setCartOpen(true);
  };

  const handleUpdateCartQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const handleRemoveCartItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Triggering Checkout from Cart
  const handleProceedToCheckout = () => {
    setDirectSubscriptionOrder(null);
    setCartOpen(false);
    
    if (!eligibility || !eligibility.isEligible) {
      alert("Please select a valid delivery address within the 5-6 km radius circle on our Jaipur map before checking out!");
      const mapElem = document.getElementById('delivery-map-anchor');
      if (mapElem) mapElem.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!user) {
      setLoginOpen(true);
      return;
    }
    setView('checkout');
  };

  // Triggering Checkout for direct Subscriptions
  const handleStartSubscriptionCheckout = (product, qty, freq, dur) => {
    if (!eligibility || !eligibility.isEligible) {
      alert("Please select a valid delivery address within the 5-6 km radius circle on our Jaipur map before subscribing!");
      const mapElem = document.getElementById('delivery-map-anchor');
      if (mapElem) mapElem.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setDirectSubscriptionOrder({
      ...product,
      quantity: qty,
      frequency: freq,
      duration: dur
    });

    if (!user) {
      setLoginOpen(true);
      return;
    }
    setView('checkout');
  };

  // Final Order Placed Callback
  const handleOrderSuccess = (orderObj) => {
    if (!user) {
      console.error("Order success called but no active user session is found.");
      return;
    }

    if (orderObj.subscription) {
      // Save subscription under active user's phone index record in gdd_users
      const newSub = addSubscription(user.phone, {
        productId: orderObj.subscription.productId,
        name: orderObj.subscription.name,
        quantity: orderObj.subscription.quantity,
        price: orderObj.subscription.price,
        unit: orderObj.subscription.unit,
        frequency: orderObj.subscription.frequency,
        duration: orderObj.subscription.duration,
        totalPrice: orderObj.subscription.totalPrice,
        branchId: orderObj.branchId
      });
      
      setSubscriptions([newSub, ...subscriptions]);
      setWaActiveSubscription(newSub);
      setWaActiveOrder(null);
    } else {
      // Save standard order under active user's phone index record in gdd_users
      const newOrd = addOrder(user.phone, {
        items: orderObj.items,
        branchId: orderObj.branchId,
        customerName: orderObj.customerName,
        address: orderObj.address,
        coords: orderObj.coords,
        deliveryFee: orderObj.totalAmount >= 200 ? 0 : 15,
        totalAmount: orderObj.totalAmount,
        deliverySlot: orderObj.deliverySlot
      });
      
      setOrders([newOrd, ...orders]);
      setWaActiveOrder(newOrd);
      setWaActiveSubscription(null);
      setCart([]);
    }

    // Update state loyalty points from custom record
    const updatedProfile = getUserProfile(user.phone);
    setUserPoints(updatedProfile.points);
    setUser(updatedProfile);
    
    // Save session state
    localStorage.setItem('gdd_active_user', JSON.stringify({
      name: updatedProfile.name,
      phone: updatedProfile.phone,
      points: updatedProfile.points
    }));

    // Seamlessly trigger WhatsApp alert simulator modal!
    setTimeout(() => {
      setWaOpen(true);
    }, 600);
  };

  // Profile Updating Callback
  const handleUpdateProfile = (updatedProfile) => {
    saveUserProfile(updatedProfile.phone, updatedProfile);
    setUser(updatedProfile);
    localStorage.setItem('gdd_active_user', JSON.stringify({
      name: updatedProfile.name,
      phone: updatedProfile.phone,
      points: updatedProfile.points
    }));
  };

  // Reward Coupon Claiming
  const handleClaimReward = (rewardId, pointsCost, title) => {
    if (!user) return { success: false, error: 'Please log in to claim loyalty store items' };
    const res = claimReward(user.phone, rewardId, pointsCost, title);
    if (res.success) {
      setUserPoints(res.updatedPoints);
      
      const active = JSON.parse(localStorage.getItem('gdd_active_user'));
      active.points = res.updatedPoints;
      localStorage.setItem('gdd_active_user', JSON.stringify(active));
      
      setUser({ 
        ...user, 
        points: res.updatedPoints, 
        claimedRewards: getUserProfile(user.phone).claimedRewards 
      });
    }
    return res;
  };

  // Customer sub changes
  const handleToggleSub = (subId, nextStatus) => {
    const profile = getUserProfile(user.phone);
    profile.subscriptions = profile.subscriptions.map((s) => {
      if (s.id === subId) return { ...s, status: nextStatus };
      return s;
    });
    saveUserProfile(user.phone, profile);
    setSubscriptions(profile.subscriptions);
  };

  const handleCancelSub = (subId) => {
    if (confirm("Are you sure you want to cancel this fresh milk subscription?")) {
      const profile = getUserProfile(user.phone);
      profile.subscriptions = profile.subscriptions.filter(s => s.id !== subId);
      saveUserProfile(user.phone, profile);
      setSubscriptions(profile.subscriptions);
    }
  };

  const toggleFaq = (idx) => {
    setExpandedFaq({ ...expandedFaq, [idx]: !expandedFaq[idx] });
  };

  // Redirect to checkout once user logs in after blocking
  useEffect(() => {
    if (user && directSubscriptionOrder) {
      setView('checkout');
    } else if (user && cart.length > 0 && view === 'home') {
      setView('checkout');
    }
  }, [user]);

  // Open general greetings WhatsApp simulator
  const handleOpenGeneralWhatsApp = () => {
    setWaActiveOrder(null);
    setWaActiveSubscription(null);
    setWaOpen(true);
  };

  return (
    <div className="app-shell">
      {/* Sticky Header Nav */}
      <Navbar 
        currentView={view} 
        setView={handleSecureViewSwitch} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        toggleCart={() => setCartOpen(!cartOpen)}
        userPoints={userPoints}
      />

      {/* Truecaller Login Modal Dialog */}
      <TruecallerLogin 
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* WhatsApp Automation Simulator Mobile Dialog */}
      <WhatsAppSimulator 
        isOpen={waOpen}
        onClose={() => setWaOpen(false)}
        customerName={user ? user.name : 'Sahil Sepat'}
        phone={user ? user.phone : '+91 98765 43210'}
        activeOrder={waActiveOrder}
        activeSubscription={waActiveSubscription}
        onTrackOrderLinkClick={setActiveTrackingOrder}
      />

      {/* Cart Sliding Drawer overlay */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        cartItems={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* MAIN VIEW CONTROLLER CONTAINER */}
      <main className="main-content-layout" style={{ paddingBottom: '80px' }}>
        
        {/* User Account Login Floating Bar (for Guests) */}
        {!user && view !== 'checkout' && (
          <div className="guest-login-bar">
            <div className="container flex-row-between">
              <span>👋 You are browsing as a **Guest**. Authenticate to unlock free express shipping and morning subscriptions.</span>
              <button onClick={() => setLoginOpen(true)} className="btn btn-primary btn-small-auth">
                <LogIn size={14} />
                <span>Verify via Truecaller</span>
              </button>
            </div>
          </div>
        )}

        {user && (
          <div className="user-logged-in-bar">
            <div className="container flex-row-between">
              <span 
                className="flex-row-center gap-6" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleSecureViewSwitch('customer')}
                title="Click to view profile & edit details"
              >
                <span className="verified-tc-inline">🛡️</span>
                <span>Logged in as <strong>{user.name}</strong> ({user.phone}). Click to manage profile 👤</span>
                <span className="badge badge-milk" style={{ textTransform: 'none' }}>{userPoints} Loyalty Pts</span>
              </span>
              <button onClick={handleLogout} className="btn-logout flex-row-center gap-4">
                <LogOut size={12} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
        
        {/* VIEW 1: HOME/LANDING PAGE */}
        {view === 'home' && (
          <div className="home-view-container">
            {/* Hero Banner */}
            <section className="hero-banner-section">
              <div className="container hero-layout">
                <div className="hero-typography">
                  <span className="hero-pre-title">🥛 Pure • Organic • Delivered in Jaipur</span>
                  <h1>Pure Farm-Fresh Dairy Sourced & Delivered</h1>
                  <p className="hero-description">
                    Ganga Dudh Dairy delivers chemical-free A2 Milk, traditionally churned Vedic Bilona Ghee, and fresh Matka Chach directly to your home within a 5-6 km radius in Jaipur. 
                  </p>
                  <div className="hero-ctas">
                    <button onClick={() => setView('store')} className="btn btn-primary btn-large">
                      <span>Order Fresh Dairy</span>
                      <ArrowRight size={18} />
                    </button>
                    <a href="#delivery-map-anchor" className="btn btn-secondary btn-large">
                      <span>Check Delivery Area</span>
                    </a>
                  </div>
                </div>
                <div className="hero-graphic animate-float">
                  <div className="milk-ripple-glow">
                    <span className="big-emoji">🥛</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Features Overview */}
            <section className="features-section container">
              <div className="feature-card glass-card">
                <Compass size={32} className="text-blue" />
                <h4>Jaipur Shop Networks</h4>
                <p>5 physical hubs across Vaishali Nagar, Mansarovar, Malviya Nagar, Raja Park, and C-Scheme.</p>
              </div>
              <div className="feature-card glass-card">
                <Calendar size={32} className="text-gold" />
                <h4>Flexible Subscriptions</h4>
                <p>Get milk bottles every morning at 7:00 AM. Easily pause, resume, or modify schedules anytime.</p>
              </div>
              <div className="feature-card glass-card">
                <Shield size={32} className="text-green" />
                <h4>FSSAI Standard Quality</h4>
                <p>No chemicals, zero starch, pure A2 proteins, and high-fat milk straight from our cow shelters.</p>
              </div>
            </section>

            {/* Spatial Location Map Selection */}
            <section id="delivery-map-anchor" className="container map-section">
              <MapSelector 
                onLocationSelect={(loc) => {
                  setSelectedCoords({ lat: loc.lat, lng: loc.lng });
                  setEligibility(loc.eligibility);
                }}
                selectedCoords={selectedCoords}
                selectedAddress={selectedAddress}
                onAddressChange={(addr) => setSelectedAddress(addr)}
              />
            </section>

            {/* Premium FAQ Accordion */}
            <section className="faq-section container">
              <h3 className="section-title text-center">❓ Frequently Asked Questions</h3>
              <p className="section-subtitle text-center">Everything you need to know about our milk delivery limits.</p>
              
              <div className="faq-list glass-card">
                {[
                  { q: "What is your maximum delivery radius?", a: "We deliver within a strict 5 to 6 km radius of our physical Ganga Dudh Dairy branches in Jaipur (Vaishali Nagar, Malviya Nagar, Mansarovar, Raja Park, and C-Scheme). This ensures that milk remains chilled, raw, and absolutely fresh upon doorstep delivery." },
                  { q: "How does the Milk Subscription work?", a: "You can select any milk variant (Fresh Cow Milk or High-Fat Buffalo Milk) and toggle 'Subscribe & Save' inside our shop. Choose daily or alternate days. It slashes prices by 10% and sets up an automated shipment calendar that you can pause or cancel anytime from your dashboard!" },
                  { q: "Are there delivery charges?", a: "We provide 100% Free Express Delivery for all cart subtotals of ₹200 and above. For minor orders under ₹200, a minimal logistics fee of ₹15 is applied to offset rider fuel." },
                  { q: "Can I order if I live outside the radius limit?", a: "If you are outside our 5-6 km circles, our checkout restricts standard home deliveries. However, you can place a 'Self-Pickup' preorder and pick up your items straight from our counters anytime!" }
                ].map((faq, idx) => (
                  <div key={idx} className="faq-accordion-item">
                    <button onClick={() => toggleFaq(idx)} className="faq-trigger">
                      <span>{faq.q}</span>
                      <ChevronDown size={18} className={`faq-chevron ${expandedFaq[idx] ? 'rotated' : ''}`} />
                    </button>
                    {expandedFaq[idx] && (
                      <div className="faq-body">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: PRODUCT STOREFRONT */}
        {view === 'store' && (
          <section className="container store-view-section">
            <div className="store-header">
              <h2 className="section-title">🥛 Shop Ganga Fresh Dairy Items</h2>
              <p className="section-subtitle">Select farm-fresh cow milk, thick buffalo milk, danedar ghee, and probiotics.</p>
              {eligibility?.isEligible && (
                <div className="green-delivery-banner">
                  <CheckCircle size={16} />
                  <span>Eligible for express delivery from **{eligibility.nearestShop.name}**!</span>
                </div>
              )}
            </div>

            <ProductCatalog 
              onAddToCart={handleAddToCart}
              onStartSubscription={handleStartSubscriptionCheckout}
            />
          </section>
        )}

        {/* VIEW 3: CHECKOUT WIZARD */}
        {view === 'checkout' && (
          <section className="container checkout-view-section">
            <CheckoutWizard 
              cartItems={cart}
              subscriptionOrder={directSubscriptionOrder}
              userAddress={selectedAddress}
              userCoords={selectedCoords}
              nearestShop={eligibility?.nearestShop}
              onOrderSuccess={handleOrderSuccess}
              onCancel={() => setView('store')}
              user={user}
            />
          </section>
        )}

        {/* VIEW 4: CUSTOMER DASHBOARD PORTAL */}
        {view === 'customer' && (
          <section className="container customer-dashboard-section">
            <CustomerDashboard 
              subscriptions={subscriptions}
              orders={orders}
              userPoints={userPoints}
              onToggleSubscription={handleToggleSub}
              onCancelSubscription={handleCancelSub}
              user={user}
              onClaimReward={handleClaimReward}
              onTrackOrder={setActiveTrackingOrder}
              onUpdateProfile={handleUpdateProfile}
            />
          </section>
        )}

        {/* VIEW 5: ADMIN SHOPKEEPER PORTAL */}
        {view === 'admin' && (
          <section className="container admin-section">
            <ShopkeeperPortal 
              orders={orders}
              setOrders={setOrders}
              inventory={inventory}
              setInventory={setInventory}
            />
          </section>
        )}

      </main>

      {/* Floating pulsing WhatsApp Support chat bubble (Resting neatly above navigation on bottom right) */}
      <button 
        onClick={handleOpenGeneralWhatsApp}
        className="wa-floating-trigger pulse-wa"
        title="WhatsApp Support & Automated Delivery Simulator"
      >
        <MessageCircle size={26} />
        <span className="wa-tooltip">WhatsApp Alerts</span>
      </button>

      {/* Mobile Sticky Bottom Navigation Menu Bar (Active below 768px viewport) */}
      <nav className="mobile-bottom-nav">
        <button 
          onClick={() => setView('home')} 
          className={`mob-nav-btn ${view === 'home' ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
        </button>
        <button 
          onClick={() => setView('store')} 
          className={`mob-nav-btn ${view === 'store' ? 'active' : ''}`}
        >
          <StoreIcon size={20} />
          <span>Shop</span>
        </button>
        <button 
          onClick={() => handleSecureViewSwitch('customer')} 
          className={`mob-nav-btn ${view === 'customer' ? 'active' : ''}`}
        >
          <User size={20} />
          <span>My Profile</span>
        </button>
        <button 
          onClick={() => setView('admin')} 
          className={`mob-nav-btn ${view === 'admin' ? 'active' : ''}`}
        >
          <Shield size={20} />
          <span>Admin</span>
        </button>
      </nav>

      {/* Live Rider Map Tracking Overlay Portal */}
      {activeTrackingOrder && (
        <RiderTracker 
          order={activeTrackingOrder}
          onClose={() => setActiveTrackingOrder(null)}
        />
      )}

      {/* Styled Footer Segment */}
      <Footer setView={handleSecureViewSwitch} />

      <style>{`
        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content-layout {
          flex-grow: 1;
        }
        
        /* Floating WhatsApp Support Action Trigger Bubble */
        .wa-floating-trigger {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          background: #25d366; /* Official WhatsApp green */
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(37, 211, 102, 0.35);
          z-index: 9998;
          transition: all 0.2s;
        }
        .wa-floating-trigger:hover {
          background: #128c7e;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(18, 140, 126, 0.45);
        }
        .wa-tooltip {
          position: absolute;
          right: 68px;
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: var(--shadow-md);
          opacity: 0;
          transform: translateX(10px);
          pointer-events: none;
          transition: all 0.2s ease-out;
        }
        .wa-floating-trigger:hover .wa-tooltip {
          opacity: 1;
          transform: translateX(0);
        }
        @keyframes waPulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6); }
          70% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        .pulse-wa {
          animation: waPulse 2s infinite;
        }

        /* Guest / Logged In Accounts Banners */
        .guest-login-bar {
          background: var(--ghee-gold-light);
          border-bottom: 1px solid rgba(245, 158, 11, 0.2);
          padding: 10px 0;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .user-logged-in-bar {
          background: var(--chach-green-light);
          border-bottom: 1px solid rgba(16, 185, 129, 0.2);
          padding: 10px 0;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .verified-tc-inline {
          font-size: 1.05rem;
        }
        .flex-row-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .gap-6 { gap: 6px; }
        .btn-small-auth {
          padding: 6px 12px;
          font-size: 0.75rem;
          background: #2575fc;
          color: white;
          border-radius: var(--radius-pill);
        }
        .btn-small-auth:hover {
          background: #1a61db;
        }
        .btn-logout {
          color: var(--danger-red);
          font-weight: 700;
          font-size: 0.75rem;
        }
        .btn-logout:hover {
          text-decoration: underline;
        }

        /* Mobile Bottom Nav CSS */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: var(--bg-glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid var(--border-color);
          z-index: 9997; /* Just below floating button */
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
        }
        .mob-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: var(--text-secondary);
          font-size: 0.7rem;
          font-weight: 700;
          transition: all 0.2s;
          flex: 1;
          height: 100%;
        }
        .mob-nav-btn.active {
          color: var(--primary-milk);
        }

        .hero-banner-section {
          padding: 80px 0;
          background: radial-gradient(circle at top right, var(--primary-milk-light), transparent 60%);
        }
        .hero-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: center;
          gap: 48px;
        }
        .hero-typography {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .hero-pre-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-milk);
          letter-spacing: 0.05em;
        }
        .hero-typography h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .hero-description {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .hero-ctas {
          display: flex;
          gap: 16px;
          margin-top: 12px;
        }
        .btn-large {
          height: 52px;
          padding: 0 32px;
          font-size: 1rem;
        }
        .hero-graphic {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .milk-ripple-glow {
          width: 250px;
          height: 250px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(0, 102, 255, 0.15);
          position: relative;
        }
        .milk-ripple-glow::before {
          content: "";
          position: absolute;
          width: 110%;
          height: 110%;
          border: 2px dashed var(--primary-milk);
          border-radius: 50%;
          opacity: 0.3;
          animation: spin 20s linear infinite;
        }
        .big-emoji {
          font-size: 7.5rem;
        }
        
        .features-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: -40px;
          margin-bottom: 64px;
          z-index: 20;
          position: relative;
        }
        .feature-card {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .feature-card h4 {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .feature-card p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.45;
        }
        
        .map-section {
          margin-bottom: 64px;
        }

        .faq-section {
          margin-bottom: 64px;
        }
        .text-center {
          text-align: center;
        }
        .faq-list {
          max-width: 800px;
          margin: 32px auto;
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 0;
          overflow: hidden;
        }
        .faq-accordion-item {
          border-bottom: 1px solid var(--border-color);
        }
        .faq-accordion-item:last-child {
          border-bottom: 0;
        }
        .faq-trigger {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          text-align: left;
        }
        .faq-trigger:hover {
          color: var(--primary-milk);
        }
        .faq-chevron {
          color: var(--text-secondary);
          transition: transform 0.2s;
        }
        .faq-chevron.rotated {
          transform: rotate(180deg);
          color: var(--primary-milk);
        }
        .faq-body {
          padding: 0 24px 20px 24px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .store-view-section, .checkout-view-section, .customer-dashboard-section, .admin-section {
          padding-top: 48px;
        }
        .store-header {
          margin-bottom: 32px;
        }
        .green-delivery-banner {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--chach-green-light);
          color: var(--chach-green);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 8px;
          border: 1px solid rgba(16, 185, 129, 0.1);
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex;
          }
          /* Lift floating WhatsApp button above bottom nav on mobile */
          .wa-floating-trigger {
            bottom: 80px;
            right: 16px;
            width: 50px;
            height: 50px;
          }
          .hero-layout {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 40px 0;
          }
          .hero-typography h1 {
            font-size: 2.5rem;
          }
          .hero-ctas {
            justify-content: center;
            flex-direction: column;
          }
          .features-section {
            grid-template-columns: 1fr;
            margin-top: 0;
          }
          .milk-ripple-glow {
            width: 180px;
            height: 180px;
          }
          .big-emoji {
            font-size: 5rem;
          }
          .flex-row-between {
            flex-direction: column;
            align-items: center;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
