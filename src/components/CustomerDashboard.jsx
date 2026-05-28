import React, { useState } from 'react';
import { Calendar, AlertCircle, ShoppingBag, Clock, Play, Pause, XCircle, ChevronRight, Award, Trash2 } from 'lucide-react';

export default function CustomerDashboard({ 
  subscriptions, 
  orders, 
  userPoints, 
  onToggleSubscription, 
  onCancelSubscription 
}) {
  const [activeTab, setActiveTab] = useState('subs'); // subs | orders

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
        </div>

        {/* Content Panel */}
        <div className="tabs-content">
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
      `}</style>
    </div>
  );
}
