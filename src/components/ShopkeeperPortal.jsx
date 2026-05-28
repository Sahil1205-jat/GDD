import React, { useState, useEffect } from 'react';
import { SHOPS, getDistanceKm } from '../utils/geo';
import { getDBData, setDBData, getAllOrders, updateGlobalOrderStatus } from '../utils/db';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Package, ShieldAlert, Truck, ChevronRight, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import L from 'leaflet';

// Leaflet DivIcons for Admin Map
const shopIcon = L.divIcon({
  className: 'admin-shop-icon',
  html: `
    <div style="background: var(--chach-green); border: 2px solid white; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: bold;">
      🏪
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

const deliveryIcon = L.divIcon({
  className: 'admin-delivery-icon',
  html: `
    <div style="background: var(--primary-milk); border: 2px solid white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
      🛵
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Auto focus map onto active shop
function AdminMapFocus({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
}

export default function ShopkeeperPortal({ inventory, setInventory }) {
  const [selectedBranchId, setSelectedBranchId] = useState('vaishali');
  const activeBranchObj = SHOPS.find(s => s.id === selectedBranchId);

  // Local state holding global orders
  const [localOrders, setLocalOrders] = useState(() => getAllOrders());

  // Periodically refresh orders when tab is focused
  useEffect(() => {
    setLocalOrders(getAllOrders());
  }, []);

  // Filter orders for selected branch
  const branchOrders = localOrders.filter(o => o.branchId === selectedBranchId);
  const activeDeliveries = branchOrders.filter(o => o.status !== 'Delivered');

  // Modify stock level manually (Simulating supplier replenishment)
  const handleReplenish = (prodId) => {
    const nextInv = { ...inventory };
    if (nextInv[selectedBranchId]) {
      nextInv[selectedBranchId][prodId] += 100; // Replenish 100 units
      setInventory(nextInv);
      setDBData('inventory', nextInv);
    }
  };

  // Modify Order Status (Preparing -> Out for Delivery -> Delivered)
  const handleUpdateOrderStatus = (orderId, currentStatus) => {
    let nextStatus = 'Delivered';
    if (currentStatus === 'Preparing') nextStatus = 'Out for Delivery';
    if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';

    // Update relational database schema inside the customer's record
    updateGlobalOrderStatus(orderId, nextStatus);

    // Refresh local state list
    setLocalOrders(getAllOrders());
  };

  // Compute total sales metrics for the branch
  const branchEarnings = branchOrders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Build active routing path coordinates for the Leaflet Rider Map
  // Starting point: the shop. Stops: sorted by distance to simulate an "optimized route".
  const getOptimizedRoute = () => {
    if (activeDeliveries.length === 0) return [];
    
    // Sort locations by distance from the shop
    const sortedStops = [...activeDeliveries].sort((a, b) => {
      const distA = getDistanceKm(activeBranchObj.lat, activeBranchObj.lng, a.coords.lat, a.coords.lng);
      const distB = getDistanceKm(activeBranchObj.lat, activeBranchObj.lng, b.coords.lat, b.coords.lng);
      return distA - distB;
    });

    const path = [[activeBranchObj.lat, activeBranchObj.lng]];
    sortedStops.forEach(stop => {
      path.push([stop.coords.lat, stop.coords.lng]);
    });
    return path;
  };

  const routeCoordinates = getOptimizedRoute();

  return (
    <div className="admin-wrapper">
      {/* Branch Selector Bar */}
      <div className="branch-selector-card glass-card">
        <div className="selector-meta">
          <h3>🏪 Ganga Dudh Portal</h3>
          <p>Real-time orders, localized logistics, and stock replenishment.</p>
        </div>
        <div className="branch-pills">
          {SHOPS.map((shop) => (
            <button
              key={shop.id}
              onClick={() => setSelectedBranchId(shop.id)}
              className={`branch-pill-btn ${selectedBranchId === shop.id ? 'active' : ''}`}
            >
              <span>{shop.name.split(' Branch')[0]}</span>
              <span className="branch-sub-lbl">{shop.locationName.split(',')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Local Statistics Overview */}
      <div className="admin-metrics-grid">
        <div className="metric-card glass-card border-green">
          <div className="metric-header">
            <DollarSign size={20} className="text-green" />
            <span>Delivered Sales Today</span>
          </div>
          <h2>₹{branchEarnings}</h2>
          <p className="metric-desc">Sales from completed orders at this branch.</p>
        </div>
        <div className="metric-card glass-card border-blue">
          <div className="metric-header">
            <Truck size={20} className="text-blue" />
            <span>Active Deliveries</span>
          </div>
          <h2>{activeDeliveries.length} Packages</h2>
          <p className="metric-desc">Outbound shipments currently in flight.</p>
        </div>
        <div className="metric-card glass-card border-gold">
          <div className="metric-header">
            <TrendingUp size={20} className="text-gold" />
            <span>Branch Performance</span>
          </div>
          <h2>99.4%</h2>
          <p className="metric-desc">On-time deliveries within 5 km radius limit.</p>
        </div>
      </div>

      <div className="admin-grid-layout">
        {/* Left Side: Inventory & Order Operations */}
        <div className="admin-operations">
          {/* Localized Stock Levels */}
          <div className="inventory-log glass-card">
            <h4 className="card-sub-title">📦 Branch Stock Monitor</h4>
            <div className="inventory-table">
              {inventory[selectedBranchId] && Object.entries(inventory[selectedBranchId]).map(([id, stock]) => {
                const isLow = stock < 50;
                
                // Formulate names nicely
                const displayName = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                return (
                  <div key={id} className="inventory-row">
                    <div className="inv-name-cell">
                      <strong>{displayName}</strong>
                      {isLow && (
                        <span className="stock-alert-tag">
                          <ShieldAlert size={10} />
                          <span>Low Stock</span>
                        </span>
                      )}
                    </div>
                    <div className="inv-action-cell">
                      <span className={`stock-count ${isLow ? 'text-red' : 'text-green'}`}>{stock} Pcs</span>
                      <button 
                        onClick={() => handleReplenish(id)}
                        className="btn btn-secondary btn-tiny"
                      >
                        Replenish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Order Queue */}
          <div className="orders-queue-card glass-card">
            <h4 className="card-sub-title">🛵 Active Delivery Queue</h4>
            <div className="queue-list">
              {branchOrders.length === 0 ? (
                <div className="empty-queue">
                  <span>💤</span>
                  <p>No active orders for this branch yet.</p>
                </div>
              ) : (
                branchOrders.map((order) => (
                  <div key={order.id} className="queue-item bg-light-panel">
                    <div className="queue-item-header">
                      <div>
                        <strong>Order #{order.id}</strong>
                        <span className="queue-item-customer">{order.customerName}</span>
                      </div>
                      <span className={`queue-status-tag ${order.status.replace(/\s/g, '').toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="queue-items-summary">
                      {order.items.map((item, idx) => (
                        <span key={idx}>{item.quantity}x {item.name}</span>
                      ))}
                    </div>

                    <div className="queue-address">
                      <span>📍 {order.address}</span>
                    </div>

                    {order.status !== 'Delivered' && (
                      <button 
                        onClick={() => handleUpdateOrderStatus(order.id, order.status)}
                        className="btn btn-primary btn-queue-action w-full"
                      >
                        <span>{order.status === 'Preparing' ? 'Mark Out for Delivery' : 'Mark Delivered'}</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Rider Routing Map */}
        <div className="admin-rider-map-card glass-card">
          <div className="map-panel-header">
            <h4 className="card-sub-title">🛵 Rider Navigation & Route Optimizer</h4>
            <p className="map-panel-desc">Visualizes real-time optimized delivery routes from shop to active clients.</p>
          </div>

          <div className="admin-map-canvas">
            <MapContainer
              center={[activeBranchObj.lat, activeBranchObj.lng]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Shop Branch Node */}
              <Marker position={[activeBranchObj.lat, activeBranchObj.lng]} icon={shopIcon}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong>{activeBranchObj.name}</strong>
                    <p style={{ margin: '2px 0', fontSize: '0.8rem' }}>Delivery Hub Starting Point</p>
                  </div>
                </Popup>
              </Marker>

              {/* Delivery Node Pins */}
              {activeDeliveries.map((del) => (
                <Marker key={del.id} position={[del.coords.lat, del.coords.lng]} icon={deliveryIcon}>
                  <Popup>
                    <div>
                      <strong>Order #{del.id}</strong>
                      <p style={{ margin: '2px 0', fontSize: '0.8rem' }}>Client: {del.customerName}</p>
                      <p style={{ margin: '2px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Items: {del.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Draw Routing Line */}
              {routeCoordinates.length > 1 && (
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: 'var(--primary-milk)',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '8, 8',
                    lineCap: 'round'
                  }}
                />
              )}

              <AdminMapFocus lat={activeBranchObj.lat} lng={activeBranchObj.lng} />
            </MapContainer>
          </div>

          {activeDeliveries.length > 0 ? (
            <div className="route-optimized-banner bg-light-panel">
              <CheckCircle2 size={18} className="text-green" />
              <span>Optimized Rider Routing Activated! Total stops: <strong>{activeDeliveries.length} client pins</strong>.</span>
            </div>
          ) : (
            <div className="route-optimized-banner bg-light-panel">
              <span>Rider route is empty. No active shipments out of this branch today.</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-wrapper {
          padding: 16px 0;
        }
        .branch-selector-card {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .branch-pills {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        .branch-pill-btn {
          display: flex;
          flex-direction: column;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          transition: all 0.2s;
          text-align: left;
        }
        .branch-pill-btn.active {
          border-color: var(--chach-green);
          background: var(--chach-green-light);
        }
        .branch-pill-btn.active span {
          color: var(--chach-green);
        }
        .branch-pill-btn span {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
        }
        .branch-sub-lbl {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 500;
          margin-top: 4px;
        }

        .admin-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        .metric-card {
          padding: 20px;
        }
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .metric-card h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 2px;
        }
        .metric-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .border-green:hover { border-color: var(--chach-green); }
        .border-blue:hover { border-color: var(--primary-milk); }
        .border-gold:hover { border-color: var(--ghee-gold); }

        .admin-grid-layout {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 24px;
        }
        .admin-operations {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .card-sub-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 16px;
        }
        
        .inventory-table {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .inventory-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
        .inv-name-cell {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
        }
        .stock-alert-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--danger-red-light);
          color: var(--danger-red);
          font-size: 0.6rem;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
          width: fit-content;
          margin-top: 2px;
          text-transform: uppercase;
        }
        .inv-action-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stock-count {
          font-size: 0.9rem;
          font-weight: 700;
        }
        .text-red { color: var(--danger-red); }
        .text-green { color: var(--chach-green); }
        .btn-tiny {
          padding: 4px 8px;
          font-size: 0.7rem;
        }

        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .empty-queue {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .queue-item {
          padding: 14px;
          border: 1px solid var(--border-color);
        }
        .queue-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .queue-item-customer {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .queue-status-tag {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          text-transform: uppercase;
        }
        .queue-status-tag.preparing { background: var(--primary-milk-light); color: var(--primary-milk); }
        .queue-status-tag.outfordelivery { background: var(--ghee-gold-light); color: var(--ghee-gold); }
        .queue-status-tag.delivered { background: var(--chach-green-light); color: var(--chach-green); }
        
        .queue-items-summary {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }
        .queue-items-summary span {
          background: var(--bg-card);
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }
        .queue-address {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .btn-queue-action {
          height: 36px;
          font-size: 0.8rem;
          border-radius: var(--radius-sm);
        }

        .admin-rider-map-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .map-panel-header {
          margin-bottom: 16px;
        }
        .map-panel-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .admin-map-canvas {
          flex-grow: 1;
          height: 480px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .route-optimized-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        @media (max-width: 900px) {
          .branch-pills {
            grid-template-columns: 1fr;
          }
          .admin-metrics-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .admin-grid-layout {
            grid-template-columns: 1fr;
          }
          .admin-map-canvas {
            height: 350px;
          }
        }
      `}</style>
    </div>
  );
}
