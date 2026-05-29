import React, { useState } from 'react';
import { Calendar, AlertCircle, ShoppingBag, Clock, Play, Pause, XCircle, ChevronRight, Award, Trash2, User, MapPin, Mail, Home, Briefcase, Plus, Edit2, CheckCircle, Save, Phone } from 'lucide-react';

export default function CustomerDashboard({ 
  subscriptions, 
  orders, 
  userPoints, 
  onToggleSubscription, 
  onCancelSubscription,
  user,
  onClaimReward,
  onTrackOrder,
  onUpdateProfile
}) {
  const [activeTab, setActiveTab] = useState('profile'); // profile | subs | orders | rewards

  // Profile Editor States
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [emailInput, setEmailInput] = useState(user?.email || 'sahil.sepat@gmail.com');
  const [instructions, setInstructions] = useState(user?.instructions || 'Leave at doorstep in milk bag.');
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  // Zomato-style Addresses States
  const [addresses, setAddresses] = useState(() => {
    return user?.addresses || [
      { 
        id: 'addr_default', 
        label: 'My Residence', 
        text: user?.address || 'Plot 45, Amrapali Circle, Vaishali Nagar, Jaipur', 
        tag: 'Home', 
        flat: 'Plot 45', 
        building: 'Amrapali Apartments', 
        landmark: 'Near Amrapali Circle' 
      }
    ];
  });
  
  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [fullAddressText, setFullAddressText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Home'); // Home | Work | Other

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    const updated = {
      ...user,
      name: nameInput,
      email: emailInput,
      instructions: instructions
    };
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    setShowProfileSuccess(true);
    setTimeout(() => setShowProfileSuccess(false), 3000);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressLabel.trim() || !flatNo.trim() || !landmark.trim() || !fullAddressText.trim()) {
      alert("Please fill in all required address fields.");
      return;
    }

    let updatedAddresses = [];
    if (editingAddressId) {
      // Edit existing
      updatedAddresses = addresses.map(addr => {
        if (addr.id === editingAddressId) {
          return {
            id: editingAddressId,
            label: addressLabel,
            text: fullAddressText,
            tag: selectedTag,
            flat: flatNo,
            building: buildingName,
            landmark: landmark
          };
        }
        return addr;
      });
    } else {
      // Add new
      const newAddress = {
        id: 'addr_' + Math.random().toString(36).substr(2, 9),
        label: addressLabel,
        text: fullAddressText,
        tag: selectedTag,
        flat: flatNo,
        building: buildingName,
        landmark: landmark
      };
      updatedAddresses = [...addresses, newAddress];
    }

    setAddresses(updatedAddresses);
    
    // Save to DB
    const updated = {
      ...user,
      addresses: updatedAddresses
    };
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }

    // Reset Form
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressLabel('');
    setFlatNo('');
    setBuildingName('');
    setLandmark('');
    setFullAddressText('');
    setSelectedTag('Home');
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setFlatNo(addr.flat);
    setBuildingName(addr.building || '');
    setLandmark(addr.landmark);
    setFullAddressText(addr.text);
    setSelectedTag(addr.tag);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id) => {
    if (confirm("Are you sure you want to delete this delivery address?")) {
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      setAddresses(updatedAddresses);
      
      const updated = {
        ...user,
        addresses: updatedAddresses
      };
      
      // If deleted address was active, set active to the first remaining one
      if (user.address === addresses.find(a => a.id === id)?.text && updatedAddresses.length > 0) {
        updated.address = updatedAddresses[0].text;
      }
      
      if (onUpdateProfile) {
        onUpdateProfile(updated);
      }
    }
  };

  const handleSelectAddress = (addressText) => {
    const updated = {
      ...user,
      address: addressText
    };
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
  };

  // Generate next 7 days for the interactive delivery schedule
  const getNext7Days = () => {
    const days = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i + 1); // Starts from tomorrow
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        dayName: weekdayNames[d.getDay()],
        isTomorrow: i === 0
      });
    }
    return days;
  };

  const scheduleDays = getNext7Days();

  // Helper to determine if a subscription delivers on a specific date string
  const checkDeliveryOnDate = (sub, dateStr) => {
    if (sub.status !== 'Active') return false;
    if (sub.frequency === 'Daily') return true;
    
    if (sub.frequency === 'Alternate') {
      const start = new Date(sub.startDate);
      const target = new Date(dateStr);
      const diffTime = Math.abs(target - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays % 2 === 0;
    }
    
    if (sub.frequency === 'Weekly') {
      const startDay = new Date(sub.startDate).getDay();
      const targetDay = new Date(dateStr).getDay();
      return startDay === targetDay;
    }

    return true; // Default
  };

  return (
    <div className="dashboard-wrapper">
      {/* Overview Cards */}
      <div className="dashboard-stats">
        <div className="stat-card glass-card">
          <div className="stat-header">
            <Calendar size={24} className="text-blue" />
            <span>Active Subscriptions</span>
          </div>
          <h3>{subscriptions.filter(s => s.status === 'Active').length} Items</h3>
          <p className="stat-desc">Fresh items delivering every morning.</p>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-header">
            <ShoppingBag size={24} className="text-green" />
            <span>Pending Orders</span>
          </div>
          <h3>{orders.filter(o => o.status !== 'Delivered').length} Orders</h3>
          <p className="stat-desc">In preparation at nearest branch.</p>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-header">
            <Award size={24} className="text-gold" />
            <span>Loyalty Milk Points</span>
          </div>
          <h3>{userPoints} Pts</h3>
          <p className="stat-desc">Earned 5% back on all purchases.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs glass-card">
        <div className="tabs-header">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          >
            👤 My Profile
          </button>
          <button 
            onClick={() => setActiveTab('subs')} 
            className={`tab-btn ${activeTab === 'subs' ? 'active' : ''}`}
          >
            Manage Subscriptions
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            Order History
          </button>
          <button 
            onClick={() => setActiveTab('rewards')} 
            className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
          >
            🎁 Rewards Store
          </button>
        </div>

        {/* Content Panel */}
        <div className="tabs-content">
          {/* TAB 4: Profile & Addresses */}
          {activeTab === 'profile' && (
            <div className="profile-panel animate-fadeIn">
              <div className="profile-grid">
                
                {/* BIO SECTION & CARD */}
                <div className="profile-card-col">
                  <div className="glass-card premium-profile-header">
                    <div className="profile-avatar-large">
                      {nameInput.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="profile-meta-header">
                      <h4>{nameInput || 'Sahil Sepat'}</h4>
                      <span>🥛 Ganga Gold Member</span>
                      <div className="pts-count-header">
                        <strong>{userPoints}</strong> Milk Points
                      </div>
                    </div>
                  </div>

                  <div className="glass-card profile-bio-form">
                    <h4 className="panel-sub-title">👤 Edit Bio & Preferences</h4>
                    <form onSubmit={handleSaveProfile} className="bio-fields-form">
                      <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input 
                          type="text" 
                          value={nameInput} 
                          onChange={(e) => setNameInput(e.target.value)} 
                          className="custom-input-check"
                          placeholder="Your Name"
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="input-group">
                          <label className="input-label">Mobile Number</label>
                          <input 
                            type="text" 
                            value={phoneInput} 
                            onChange={(e) => setPhoneInput(e.target.value)} 
                            className="custom-input-check"
                            placeholder="Mobile"
                            disabled
                          />
                        </div>
                        <div className="input-group">
                          <label className="input-label">Email Address</label>
                          <input 
                            type="email" 
                            value={emailInput} 
                            onChange={(e) => setEmailInput(e.target.value)} 
                            className="custom-input-check"
                            placeholder="Email"
                            required
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Special Delivery Instructions</label>
                        <textarea 
                          value={instructions} 
                          onChange={(e) => setInstructions(e.target.value)} 
                          className="custom-textarea"
                          rows="2"
                          placeholder="e.g. Leave at doorstep, Ring buzzer, etc."
                        />
                      </div>

                      <button type="submit" className="btn btn-primary w-full flex-row-center gap-6" style={{ marginTop: '10px' }}>
                        <Save size={16} />
                        <span>Save Profile Changes</span>
                      </button>

                      {showProfileSuccess && (
                        <div className="profile-success-alert animate-bounce">
                          <CheckCircle size={16} className="text-green" />
                          <span>Profile changes saved successfully!</span>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* SAVED ADDRESSES SECTION */}
                <div className="profile-addresses-col">
                  <div className="glass-card addresses-header-card">
                    <div className="flex-row-between">
                      <h4 className="panel-sub-title" style={{ margin: 0 }}>📍 Saved Delivery Locations</h4>
                      <button 
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddressLabel('');
                          setFlatNo('');
                          setBuildingName('');
                          setLandmark('');
                          setFullAddressText('');
                          setSelectedTag('Home');
                          setShowAddressForm(!showAddressForm);
                        }} 
                        className="btn btn-secondary btn-small flex-row-center gap-4"
                      >
                        <Plus size={14} />
                        <span>Add New</span>
                      </button>
                    </div>

                    {/* Address Add / Edit Form */}
                    {showAddressForm && (
                      <form onSubmit={handleSaveAddress} className="address-form-box bg-light-panel animate-scale">
                        <h5>{editingAddressId ? '📝 Edit Address' : '🏠 Add New Saved Address'}</h5>
                        
                        <div className="tag-selectors-row">
                          <button 
                            type="button" 
                            onClick={() => setSelectedTag('Home')}
                            className={`tag-btn-selector ${selectedTag === 'Home' ? 'active home-active' : ''}`}
                          >
                            🏠 Home
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setSelectedTag('Work')}
                            className={`tag-btn-selector ${selectedTag === 'Work' ? 'active work-active' : ''}`}
                          >
                            🏢 Work
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setSelectedTag('Other')}
                            className={`tag-btn-selector ${selectedTag === 'Other' ? 'active other-active' : ''}`}
                          >
                            📍 Other
                          </button>
                        </div>

                        <div className="form-row" style={{ marginTop: '12px' }}>
                          <div className="input-group">
                            <label className="input-label">Address Nickname</label>
                            <input 
                              type="text" 
                              value={addressLabel} 
                              onChange={(e) => setAddressLabel(e.target.value)} 
                              className="custom-input-check" 
                              placeholder="e.g. My Apartment, Parent's Home"
                              required
                            />
                          </div>
                          <div className="input-group">
                            <label className="input-label">Flat / Plot / Floor</label>
                            <input 
                              type="text" 
                              value={flatNo} 
                              onChange={(e) => setFlatNo(e.target.value)} 
                              className="custom-input-check" 
                              placeholder="e.g. Plot 45, F-2"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="input-group">
                            <label className="input-label">Building / Society</label>
                            <input 
                              type="text" 
                              value={buildingName} 
                              onChange={(e) => setBuildingName(e.target.value)} 
                              className="custom-input-check" 
                              placeholder="e.g. Amrapali Apartments"
                            />
                          </div>
                          <div className="input-group">
                            <label className="input-label">Landmark</label>
                            <input 
                              type="text" 
                              value={landmark} 
                              onChange={(e) => setLandmark(e.target.value)} 
                              className="custom-input-check" 
                              placeholder="e.g. Near Amrapali Circle"
                              required
                            />
                          </div>
                        </div>

                        <div className="input-group">
                          <label className="input-label">Full Address Line</label>
                          <textarea 
                            value={fullAddressText} 
                            onChange={(e) => setFullAddressText(e.target.value)} 
                            className="custom-textarea" 
                            rows="2"
                            placeholder="Plot 45, Amrapali Circle, Vaishali Nagar, Jaipur"
                            required
                          />
                        </div>

                        <div className="form-actions-row">
                          <button 
                            type="button" 
                            onClick={() => setShowAddressForm(false)} 
                            className="btn btn-secondary btn-small"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="btn btn-primary btn-small ml-auto"
                          >
                            {editingAddressId ? 'Save Address' : 'Add Location'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Addresses List */}
                    <div className="addresses-list-box">
                      {addresses.map((addr) => {
                        const isActive = user.address === addr.text;
                        return (
                          <div key={addr.id} className={`address-card-zomato bg-light-panel ${isActive ? 'active-border' : ''}`}>
                            <div className="address-card-top">
                              <div className="address-tag-title-row">
                                <span className={`address-tag-badge ${
                                  addr.tag === 'Home' ? 'tag-home' : 
                                  addr.tag === 'Work' ? 'tag-work' : 'tag-other'
                                }`}>
                                  {addr.tag === 'Home' ? '🏠 Home' : addr.tag === 'Work' ? '🏢 Work' : '📍 Other'}
                                </span>
                                <strong className="address-nickname-lbl">{addr.label}</strong>
                                {isActive && <span className="active-address-pill">Default</span>}
                              </div>
                              <div className="address-actions-btn-group">
                                <button 
                                  type="button" 
                                  onClick={() => handleEditAddress(addr)}
                                  className="addr-action-btn edit-btn"
                                  title="Edit saved address"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="addr-action-btn delete-btn"
                                  title="Delete address"
                                  disabled={addresses.length === 1}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            
                            <p className="address-card-text">
                              <strong>{addr.flat}{addr.building ? `, ${addr.building}` : ''}</strong><br />
                              <span className="landmark-text-style">Landmark: {addr.landmark}</span><br />
                              {addr.text}
                            </p>

                            {!isActive && (
                              <button 
                                onClick={() => handleSelectAddress(addr.text)}
                                className="btn btn-secondary btn-small w-full btn-set-default"
                                style={{ marginTop: '10px', height: '32px', fontSize: '0.7rem' }}
                              >
                                Deliver to this Address
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 1: Subscriptions */}
          {activeTab === 'subs' && (
            <div className="subs-panel">
              {subscriptions.length === 0 ? (
                <div className="empty-panel-view">
                  <span className="empty-icon">📅</span>
                  <h4>No Active Subscriptions</h4>
                  <p>Subscribe to cow/buffalo milk and have it delivered directly to your doorstep every morning.</p>
                </div>
              ) : (
                <div className="subs-layout">
                  {/* Calendar Grid */}
                  <div className="delivery-calendar bg-light-panel">
                    <h4 className="panel-sub-title">🥛 Delivery Schedule (Next 7 Days)</h4>
                    <div className="calendar-grid">
                      {scheduleDays.map((day, idx) => {
                        const activeDeliveries = subscriptions.filter(sub => checkDeliveryOnDate(sub, day.dateStr));
                        
                        return (
                          <div key={idx} className={`calendar-day-card ${day.isTomorrow ? 'tomorrow-glow' : ''}`}>
                            <span className="day-name">{day.dayName}</span>
                            <span className="day-num">{day.dayNum}</span>
                            
                            <div className="deliveries-container">
                              {activeDeliveries.map((del, dIdx) => (
                                <div key={dIdx} className="milk-drop-badge" title={del.name}>
                                  🥛 {del.quantity}L
                                </div>
                              ))}
                              {activeDeliveries.length === 0 && <span className="no-delivery-indicator">•</span>}
                            </div>
                            {day.isTomorrow && <span className="tomorrow-badge">Tomorrow</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subscriptions List */}
                  <div className="subs-list">
                    <h4 className="panel-sub-title">📋 Active Subscriptions Logs</h4>
                    <div className="subs-items">
                      {subscriptions.map((sub) => (
                        <div key={sub.id} className="sub-item-row bg-light-panel">
                          <div className="sub-row-meta">
                            <h5>{sub.name}</h5>
                            <div className="sub-meta-tags">
                              <span className="badge badge-milk">{sub.quantity} {sub.unit}s</span>
                              <span className="sub-cycle-tag">{sub.frequency}</span>
                              <span className={`status-badge-inline ${sub.status === 'Active' ? 'active-green' : 'paused-grey'}`}>
                                {sub.status}
                              </span>
                            </div>
                            <span className="sub-start-date">Started: {sub.startDate}</span>
                          </div>

                          <div className="sub-row-actions">
                            {sub.status === 'Active' ? (
                              <button 
                                onClick={() => onToggleSubscription(sub.id, 'Paused')}
                                className="btn btn-secondary btn-small"
                                title="Pause subscription"
                              >
                                <Pause size={14} />
                                <span>Pause</span>
                              </button>
                            ) : (
                              <button 
                                onClick={() => onToggleSubscription(sub.id, 'Active')}
                                className="btn btn-primary btn-small"
                                title="Resume subscription"
                              >
                                <Play size={14} />
                                <span>Resume</span>
                              </button>
                            )}
                            <button 
                              onClick={() => onCancelSubscription(sub.id)}
                              className="btn-trash-sub"
                              title="Cancel subscription"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Order History */}
          {activeTab === 'orders' && (
            <div className="orders-panel">
              {orders.length === 0 ? (
                <div className="empty-panel-view">
                  <span className="empty-icon">🛍️</span>
                  <h4>No Past Orders</h4>
                  <p>You haven't placed any standard single-delivery orders yet.</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-log-card bg-light-panel">
                      <div className="order-log-header">
                        <div>
                          <strong>Order #{order.id}</strong>
                          <span className="order-log-date">Placed: {new Date(order.date).toLocaleString()}</span>
                          {(order.status === 'Out for Delivery' || order.status === 'Preparing') && (
                            <button 
                              onClick={() => onTrackOrder(order)} 
                              className="btn btn-primary btn-small track-order-btn pulse-wa"
                              style={{ 
                                marginTop: '10px', 
                                background: '#2575fc', 
                                color: 'white', 
                                border: 'none', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                cursor: 'pointer',
                                padding: '6px 12px',
                                fontSize: '0.75rem',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(37, 117, 252, 0.2)'
                              }}
                            >
                              <span>🛵 Track Live Delivery</span>
                            </button>
                          )}
                        </div>
                        <span className={`order-status-badge ${
                          order.status === 'Delivered' ? 'delivered' :
                          order.status === 'Out for Delivery' ? 'out-for-delivery' : 'preparing'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Live Tracker Stepper for Active Orders */}
                      {order.status !== 'Delivered' && (
                        <div className="order-tracker-stepper">
                          <div className="stepper-step active">
                            <div className="stepper-dot"></div>
                            <span>Preparing</span>
                          </div>
                          <div className={`stepper-line ${order.status === 'Out for Delivery' ? 'active' : ''}`}></div>
                          <div className={`stepper-step ${order.status === 'Out for Delivery' ? 'active' : ''}`}>
                            <div className="stepper-dot"></div>
                            <span>Out for Delivery</span>
                          </div>
                          <div className="stepper-line"></div>
                          <div className="stepper-step">
                            <div className="stepper-dot"></div>
                            <span>Delivered</span>
                          </div>
                        </div>
                      )}

                      <div className="order-items-grid">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-log-item">
                            <span>{item.quantity}x {item.name}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <hr className="divider-dashed" />

                      <div className="order-log-footer">
                        <span>Delivery Address: <em>{order.address}</em></span>
                        <strong>Grand Total: ₹{order.totalAmount}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Loyalty Rewards Store */}
          {activeTab === 'rewards' && (
            <div className="rewards-panel" style={{ animation: 'fadeIn 0.3s' }}>
              <div className="rewards-intro bg-light-panel" style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid var(--ghee-gold)', marginBottom: '24px', background: 'linear-gradient(135deg, var(--bg-secondary), rgba(245, 158, 11, 0.05))' }}>
                <h4 style={{ color: 'var(--ghee-gold)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 6px 0' }}>
                  <span>🏆</span> Ganga Loyalty Rewards Store
                </h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Thank you for supporting pure farming! Spend your milk points to redeem exclusive fresh dairy discounts and physical kitchen collectibles.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700' }}>
                    <span>Active Balance:</span>
                    <span style={{ color: 'var(--ghee-gold)' }}>{userPoints} Milk Points</span>
                  </div>
                  {/* Progress Bar towards Spoon */}
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (userPoints / 600) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--ghee-gold), var(--primary-milk))', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span>0 Pts</span>
                    <span>300 Pts (Vedic Ghee)</span>
                    <span>600 Pts (Copper Keepsake)</span>
                  </div>
                </div>
              </div>

              {/* Rewards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                  { id: 'chach-coupon', title: 'Spiced Matka Chach Cup', cost: 50, desc: 'Add 1x traditional clay-churned matka chach to your next slot.', emoji: '🥤' },
                  { id: 'butter-pack', title: 'Fresh Cow Butter (100g)', cost: 150, desc: 'Delicious unsalted white butter churned fresh daily.', emoji: '🧈' },
                  { id: 'ghee-sample', title: 'Vedic Gir Cow Ghee (100ml)', cost: 300, desc: 'Aromatic Vedic Bilona method high-medicinal ghee sample.', emoji: '🍯' },
                  { id: 'cash-coupon', title: '₹100 Store Cashback Voucher', cost: 450, desc: 'Get ₹100 direct cash discount coupon code on any standard order.', emoji: '🎟️' },
                  { id: 'copper-spoon', title: 'Luxury Copper Ghee Spoon', cost: 600, desc: 'Physical royal copper serving spoon shipped as gift.', emoji: '🥄' }
                ].map((rew) => {
                  const canClaim = userPoints >= rew.cost;
                  return (
                    <div key={rew.id} className="glass-card reward-item-card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-card)', transition: 'all 0.2s', position: 'relative' }}>
                      <span style={{ fontSize: '2.5rem', textAlign: 'center', display: 'block', margin: '4px 0' }}>{rew.emoji}</span>
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: '700', margin: '0 0 4px 0' }}>{rew.title}</h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0', lineHeight: '1.3' }}>{rew.desc}</p>
                      </div>
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--ghee-gold)' }}>{rew.cost} Pts</span>
                        <button 
                          onClick={async () => {
                            if (!canClaim) return;
                            if (confirm(`Claim "${rew.title}" for ${rew.cost} Milk Points?`)) {
                              const res = onClaimReward(rew.id, rew.cost, rew.title);
                              if (res && res.success) {
                                alert(`Success! Claimed "${rew.title}". Your coupon code is: ${res.reward.code}`);
                              } else {
                                alert(`Error: ${res?.error || 'Failed to claim reward'}`);
                              }
                            }
                          }}
                          disabled={!canClaim}
                          className="btn btn-primary btn-small"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.7rem', 
                            borderRadius: '20px',
                            background: canClaim ? 'linear-gradient(135deg, var(--ghee-gold), #d97706)' : 'var(--border-color)',
                            color: canClaim ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            cursor: canClaim ? 'pointer' : 'not-allowed',
                            boxShadow: canClaim ? '0 4px 10px rgba(245, 158, 11, 0.25)' : 'none'
                          }}
                        >
                          {canClaim ? 'Claim Reward' : 'Locked 🔒'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Claimed Coupons List */}
              <div className="bg-light-panel" style={{ padding: '20px', borderRadius: '12px' }}>
                <h5 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  🔑 Your Claimed Reward Coupons
                </h5>
                {(!user || !user.claimedRewards || user.claimedRewards.length === 0) ? (
                  <p style={{ margin: '0', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px' }}>
                    No claimed reward vouchers yet. Earn points on orders and claim them above!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {user.claimedRewards.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <div>
                          <strong>{item.title}</strong>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Claimed on {item.claimedDate}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', color: 'var(--primary-milk)', fontWeight: '700', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            {item.code}
                          </code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(item.code);
                              alert('Coupon code copied to clipboard!');
                            }}
                            className="btn btn-secondary btn-small"
                            style={{ padding: '4px 8px', fontSize: '0.65rem', borderRadius: '4px' }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          padding: 16px 0;
        }
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        .stat-card {
          padding: 24px;
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .stat-card h3 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 4px;
          background: linear-gradient(135deg, var(--text-primary), var(--primary-milk));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .text-blue { color: var(--primary-milk); }
        .text-green { color: var(--chach-green); }
        .text-gold { color: var(--ghee-gold); }

        .dashboard-tabs {
          padding: 0;
          overflow: hidden;
        }
        .tabs-header {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        .tab-btn {
          flex-grow: 1;
          padding: 18px;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: center;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }
        .tab-btn:hover {
          color: var(--primary-milk);
        }
        .tab-btn.active {
          color: var(--primary-milk);
          background: var(--bg-card);
          border-bottom-color: var(--primary-milk);
        }
        .tabs-content {
          padding: 24px;
        }
        
        .empty-panel-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px;
        }
        .empty-icon {
          font-size: 3.5rem;
          margin-bottom: 16px;
        }
        .empty-panel-view h4 {
          font-size: 1.25rem;
          margin-bottom: 8px;
        }
        .empty-panel-view p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 320px;
        }

        .subs-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .bg-light-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        .panel-sub-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .calendar-day-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          border-radius: var(--radius-sm);
          position: relative;
        }
        .calendar-day-card.tomorrow-glow {
          border-color: var(--primary-milk);
          box-shadow: 0 0 0 3px rgba(var(--primary-milk-rgb), 0.1);
        }
        .day-name {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .day-num {
          font-size: 1.2rem;
          font-weight: 800;
          margin: 4px 0;
        }
        .deliveries-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-height: 36px;
          justify-content: center;
        }
        .milk-drop-badge {
          background: var(--primary-milk-light);
          color: var(--primary-milk);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(var(--primary-milk-rgb), 0.1);
        }
        .no-delivery-indicator {
          color: var(--border-color);
          font-size: 1.5rem;
        }
        .tomorrow-badge {
          position: absolute;
          bottom: -8px;
          background: var(--primary-milk);
          color: white;
          font-size: 0.55rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: var(--radius-pill);
          text-transform: uppercase;
        }
        
        .subs-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sub-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
        }
        .sub-row-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sub-row-meta h5 {
          font-size: 1rem;
          font-weight: 700;
        }
        .sub-meta-tags {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .sub-cycle-tag {
          font-size: 0.7rem;
          padding: 2px 6px;
          background: var(--ghee-gold-light);
          color: var(--ghee-gold);
          border-radius: 4px;
          font-weight: 700;
        }
        .status-badge-inline {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .status-badge-inline.active-green {
          background: var(--chach-green-light);
          color: var(--chach-green);
        }
        .status-badge-inline.paused-grey {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }
        .sub-start-date {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }
        .sub-row-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-small {
          padding: 6px 12px;
          font-size: 0.75rem;
        }
        .btn-trash-sub {
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .btn-trash-sub:hover {
          color: var(--danger-red);
          background: var(--danger-red-light);
        }

        /* Order Logs */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .order-log-card {
          padding: 20px;
        }
        .order-log-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .order-log-date {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .order-status-badge {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          text-transform: uppercase;
        }
        .order-status-badge.delivered {
          background: var(--chach-green-light);
          color: var(--chach-green);
        }
        .order-status-badge.out-for-delivery {
          background: var(--ghee-gold-light);
          color: var(--ghee-gold);
        }
        .order-status-badge.preparing {
          background: var(--primary-milk-light);
          color: var(--primary-milk);
        }
        .order-tracker-stepper {
          display: flex;
          align-items: center;
          padding: 12px 10%;
          background: var(--bg-card);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          margin-bottom: 16px;
        }
        .stepper-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .stepper-step.active {
          color: var(--primary-milk);
        }
        .stepper-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--border-color);
        }
        .stepper-step.active .stepper-dot {
          background: var(--primary-milk);
          box-shadow: 0 0 0 3px rgba(var(--primary-milk-rgb), 0.2);
        }
        .stepper-line {
          flex-grow: 1;
          height: 2px;
          background: var(--border-color);
          margin: 0 8px;
          margin-top: -16px;
        }
        .stepper-line.active {
          background: var(--primary-milk);
        }
        .order-items-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .order-log-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .divider-dashed {
          border: 0;
          border-top: 1px dashed var(--border-color);
          margin-bottom: 12px;
        }
        .order-log-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }
        .order-log-footer span {
          color: var(--text-secondary);
          max-width: 60%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .order-log-footer strong {
          color: var(--primary-milk);
          font-size: 1.05rem;
        }

        @media (max-width: 900px) {
          .dashboard-stats {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .calendar-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .tabs-header {
            flex-direction: column;
          }
          .sub-item-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .sub-row-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }

        /* Scoped Profile & Addresses Panel CSS (Zomato-inspired HSL styling) */
        .profile-panel {
          animation: fadeIn 0.4s ease-out;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }
        .premium-profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: linear-gradient(135deg, var(--bg-card), rgba(var(--primary-milk-rgb), 0.03));
          margin-bottom: 20px;
        }
        .profile-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-milk), var(--ghee-gold));
          color: white;
          font-size: 2.2rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0, 102, 255, 0.2);
        }
        .profile-meta-header h4 {
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .profile-meta-header span {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--ghee-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pts-count-header {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 6px;
        }
        .pts-count-header strong {
          color: var(--primary-milk);
          font-size: 1rem;
        }
        
        .profile-bio-form {
          padding: 24px;
        }
        .bio-fields-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 16px;
        }
        .profile-success-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--chach-green-light);
          color: var(--chach-green);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 8px;
        }
        
        /* Zomato-style Addresses Section */
        .addresses-header-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .address-form-box {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .address-form-box h5 {
          font-size: 0.9rem;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .tag-selectors-row {
          display: flex;
          gap: 8px;
        }
        .tag-btn-selector {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .tag-btn-selector.active {
          color: white;
          border-color: transparent;
        }
        .tag-btn-selector.home-active {
          background: #2563eb;
        }
        .tag-btn-selector.work-active {
          background: #ea580c;
        }
        .tag-btn-selector.other-active {
          background: #16a34a;
        }
        .form-actions-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }
        
        .addresses-list-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .address-card-zomato {
          padding: 16px;
          border: 1.5px solid transparent;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .address-card-zomato:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .address-card-zomato.active-border {
          border-color: var(--primary-milk);
          background: var(--primary-milk-light);
        }
        .address-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .address-tag-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .address-tag-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          color: white;
          text-transform: uppercase;
        }
        .tag-home { background: #2563eb; }
        .tag-work { background: #ea580c; }
        .tag-other { background: #16a34a; }
        
        .address-nickname-lbl {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .active-address-pill {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--primary-milk);
          background: white;
          border: 1px solid var(--primary-milk);
          padding: 1px 6px;
          border-radius: 4px;
        }
        .address-actions-btn-group {
          display: flex;
          gap: 6px;
        }
        .addr-action-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }
        .addr-action-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-primary);
        }
        .delete-btn:hover {
          color: var(--danger-red);
          border-color: var(--danger-red);
          background: var(--danger-red-light);
        }
        .address-card-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }
        .landmark-text-style {
          font-style: italic;
          color: var(--text-secondary);
          font-size: 0.75rem;
        }
        .btn-set-default {
          border-color: var(--primary-milk);
          color: var(--primary-milk);
          font-weight: 700;
        }
        .btn-set-default:hover {
          background: var(--primary-milk);
          color: white;
        }

        @media (max-width: 900px) {
          .profile-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        }
      `}</style>
    </div>
  );
}
