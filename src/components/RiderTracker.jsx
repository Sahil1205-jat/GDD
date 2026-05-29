import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { SHOPS } from '../utils/geo';
import { X, Phone, Thermometer, ShieldAlert, Sparkles, Navigation, Play, FastForward, CheckCircle } from 'lucide-react';
import L from 'leaflet';

// Custom icons to bypass asset resolution failures in React
const shopIcon = L.divIcon({
  className: 'tracker-shop-icon',
  html: `
    <div style="background: #2575fc; border: 2px solid white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
      <span style="font-size: 18px;">🥛</span>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19]
});

const customerIcon = L.divIcon({
  className: 'tracker-customer-icon',
  html: `
    <div style="background: var(--danger-red); border: 2px solid white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
      <span style="font-size: 16px;">🏠</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const riderIcon = L.divIcon({
  className: 'tracker-rider-icon',
  html: `
    <div class="rider-scooter-pulse" style="background: #efeae2; border: 2px solid #25d366; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.45); position: relative; animation: riderBounce 0.4s infinite alternate;">
      <span style="font-size: 22px;">🛵</span>
      <div style="position: absolute; width: 100%; height: 100%; border: 2px solid #25d366; border-radius: 50%; animation: pulseRing 1.5s infinite; opacity: 0.7;"></div>
    </div>
    <style>
      @keyframes riderBounce {
        from { transform: translateY(0); }
        to { transform: translateY(-4px); }
      }
      @keyframes pulseRing {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// Programmatic map center adjuster
function TrackerMapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13.5);
    }
  }, [center, map]);
  return null;
}

// Linear street interpolation with sine turns
const generateWaypoints = (start, end, steps = 20) => {
  const waypoints = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add wave offsets to simulate navigating around Jaipur blocks rather than flying diagonals
    const lat = start.lat + (end.lat - start.lat) * t + (i > 0 && i < steps ? (Math.sin(i * 1.5) * 0.0012) : 0);
    const lng = start.lng + (end.lng - start.lng) * t + (i > 0 && i < steps ? (Math.cos(i * 1.5) * 0.0012) : 0);
    waypoints.push([lat, lng]);
  }
  return waypoints;
};

export default function RiderTracker({ order, onClose }) {
  const shop = SHOPS.find(s => s.id === order.branchId) || SHOPS[0];
  const startCoords = { lat: shop.lat, lng: shop.lng };
  const endCoords = order.coords || { lat: 26.9082, lng: 75.7485 };
  
  const totalSteps = 20;
  const pathWaypointsRef = useRef(generateWaypoints(startCoords, endCoords, totalSteps));
  
  // Animation state controls
  const [stepIndex, setStepIndex] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1 = Normal, 5 = Fast Forward, 20 = Teleport
  const [telemetry, setTelemetry] = useState({
    temp: 4.1,
    speed: 25,
    eta: 24
  });
  
  const [chatLog, setChatLog] = useState([
    { time: '06:05 AM', sender: 'Ramesh Rider', msg: 'Pranam! I am Ramesh. Sourced your A2 Milk directly at 4°C. Packing it in our insulated vacuum box now! 🥛' }
  ]);

  const activeRiderCoords = pathWaypointsRef.current[stepIndex];

  // Tick timer for rider coordinates progress
  useEffect(() => {
    if (stepIndex >= totalSteps) return;

    const baseDelay = 1800; // Normal rate
    const currentDelay = baseDelay / speedMultiplier;

    const timer = setTimeout(() => {
      setStepIndex(prev => prev + 1);
    }, currentDelay);

    return () => clearTimeout(timer);
  }, [stepIndex, speedMultiplier]);

  // Telemetry fluctuation simulator
  useEffect(() => {
    if (stepIndex >= totalSteps) {
      setTelemetry({ temp: 4.3, speed: 0, eta: 0 });
      return;
    }
    const remSteps = totalSteps - stepIndex;
    const etaMins = remSteps * 1.5;
    
    setTelemetry({
      temp: parseFloat((4.0 + Math.random() * 0.4).toFixed(1)),
      speed: Math.floor(22 + Math.random() * 8),
      eta: Math.round(etaMins)
    });
  }, [stepIndex]);

  // Dynamic rider chat prompts based on street waypoint landmarks
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (stepIndex === 5) {
      setChatLog(prev => [
        ...prev,
        { time: timeStr, sender: 'Ramesh Rider', msg: '🛵 Dispatched from branch! Container temperature is locked chilled at 4.1°C. Traffic is smooth near Jaipur highway.' }
      ]);
    } else if (stepIndex === 11) {
      setChatLog(prev => [
        ...prev,
        { time: timeStr, sender: 'Ramesh Rider', msg: '📍 Passing local circle now! Sourced A2 quality is completely fresh. Reaching your block in less than 5 minutes.' }
      ]);
    } else if (stepIndex === 17) {
      setChatLog(prev => [
        ...prev,
        { time: timeStr, sender: 'Ramesh Rider', msg: '🏡 Reached your neighborhood lane. Looking for house/plot details. Please keep porch light or collection box ready!' }
      ]);
    } else if (stepIndex === 20) {
      setChatLog(prev => [
        ...prev,
        { time: timeStr, sender: 'Ramesh Rider', msg: '✅ Delivered successfully! Placed securely in your delivery cabinet. Thank you for supporting Ganga Dairy! Pranam! 🙏🥛' }
      ]);
      
      // Update order status in db locally if possible
      try {
        const users = JSON.parse(localStorage.getItem('gdd_users')) || {};
        Object.keys(users).forEach(phone => {
          users[phone].orders = users[phone].orders.map(o => {
            if (o.id === order.id) {
              return { ...o, status: 'Delivered' };
            }
            return o;
          });
        });
        localStorage.setItem('gdd_users', JSON.stringify(users));
      } catch (err) {
        console.error("Local db order sync error", err);
      }
    }
  }, [stepIndex, order.id]);

  const mapCenter = [
    (startCoords.lat + endCoords.lat) / 2,
    (startCoords.lng + endCoords.lng) / 2
  ];

  return (
    <div className="tracker-overlay" onClick={onClose}>
      <div className="tracker-modal glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tracker-modal-header flex-row-between">
          <div className="tracker-title-row">
            <span className="scooter-glow">🛵</span>
            <div>
              <h3>Live Dispatch Tracking</h3>
              <p>Order #{order.id} • Sourced from {shop.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-tracker" title="Close Tracking">
            <X size={20} />
          </button>
        </div>

        {/* Layout Grid */}
        <div className="tracker-grid">
          {/* Left panel: Map */}
          <div className="tracker-map-canvas">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Branch Node */}
              <Marker position={[startCoords.lat, startCoords.lng]} icon={shopIcon}>
                <Popup>
                  <div>
                    <strong>{shop.name}</strong>
                    <p style={{ margin: '2px 0', fontSize: '0.75rem' }}>Dispatch Hub</p>
                  </div>
                </Popup>
              </Marker>

              {/* Customer Node */}
              <Marker position={[endCoords.lat, endCoords.lng]} icon={customerIcon}>
                <Popup>
                  <div>
                    <strong>Your Location</strong>
                    <p style={{ margin: '2px 0', fontSize: '0.75rem' }}>{order.address}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Polyline Route */}
              <Polyline 
                positions={pathWaypointsRef.current} 
                pathOptions={{ color: '#2575fc', weight: 4, opacity: 0.6, dashArray: '8, 8' }} 
              />
              
              {/* Completed Polyline segment */}
              <Polyline 
                positions={pathWaypointsRef.current.slice(0, stepIndex + 1)} 
                pathOptions={{ color: '#25d366', weight: 4, opacity: 0.8 }} 
              />

              {/* Rider Scooter Marker */}
              {activeRiderCoords && (
                <Marker position={activeRiderCoords} icon={riderIcon}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <strong>Rider Ramesh Kumar</strong>
                      <p style={{ margin: '2px 0', fontSize: '0.75rem' }}>Temp: {telemetry.temp}°C (Insulated)</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              <TrackerMapController center={activeRiderCoords || mapCenter} />
            </MapContainer>
          </div>

          {/* Right panel: Telemetry & chat */}
          <div className="tracker-sidebar bg-light-panel">
            
            {/* Speed Simulation Toggles */}
            <div className="simulation-toggles flex-row-between">
              <span className="sim-lbl font-bold">Sim Speed Multiplier:</span>
              <div className="multiplier-buttons">
                <button 
                  onClick={() => setSpeedMultiplier(1)} 
                  className={`mult-btn ${speedMultiplier === 1 ? 'active' : ''}`}
                >
                  1x
                </button>
                <button 
                  onClick={() => setSpeedMultiplier(5)} 
                  className={`mult-btn ${speedMultiplier === 5 ? 'active' : ''}`}
                  title="Fast Forward Simulation"
                >
                  <Play size={10} style={{ display: 'inline', marginRight: '2px' }} /> 5x
                </button>
                <button 
                  onClick={() => setSpeedMultiplier(25)} 
                  className={`mult-btn ${speedMultiplier === 25 ? 'active' : ''}`}
                  title="Instant Delivery"
                >
                  <FastForward size={10} style={{ display: 'inline', marginRight: '2px' }} /> 25x
                </button>
              </div>
            </div>

            {/* Telemetry Sensor Dashboard */}
            <div className="telemetry-dashboard">
              <div className="tel-card glass-card">
                <div className="tel-title flex-row-center text-green">
                  <Thermometer size={18} />
                  <span>Insulated Cold Containment</span>
                </div>
                <h3>{telemetry.temp} °C</h3>
                <span className="tel-lbl">Ideal Chilled Standard: &lt; 4.5°C</span>
              </div>

              <div className="grid-2">
                <div className="tel-card glass-card">
                  <span className="tel-lbl font-bold text-secondary">Rider Speed</span>
                  <h4>{telemetry.speed} km/h</h4>
                </div>
                <div className="tel-card glass-card">
                  <span className="tel-lbl font-bold text-secondary">ETA Ticker</span>
                  <h4 style={{ color: stepIndex >= totalSteps ? 'var(--chach-green)' : 'var(--primary-milk)' }}>
                    {stepIndex >= totalSteps ? 'Arrived!' : `${telemetry.eta} Mins`}
                  </h4>
                </div>
              </div>
            </div>

            {/* Rider Bio Card */}
            <div className="rider-card bg-card">
              <div className="rider-avatar">🧑🏽‍🛵</div>
              <div className="rider-meta">
                <h5>Ramesh Kumar</h5>
                <span className="badge badge-milk" style={{ background: 'var(--chach-green-light)', color: 'var(--chach-green)', border: 'none' }}>
                  ★ 4.9 Verified Rider
                </span>
              </div>
              <a href="tel:+919999912345" className="btn-call-rider" title="Call Ramesh Rider">
                <Phone size={16} />
              </a>
            </div>

            {/* Simulated Live Chat */}
            <div className="chat-container">
              <span className="chat-title font-bold text-secondary">📲 Live Delivery Log notifications</span>
              <div className="chat-log-box">
                {chatLog.map((chat, idx) => (
                  <div key={idx} className={`chat-bubble ${chat.sender.includes('Ramesh') ? 'rider-chat' : 'customer-chat'}`}>
                    <div className="chat-bubble-header flex-row-between">
                      <span className="chat-sender">{chat.sender}</span>
                      <span className="chat-time">{chat.time}</span>
                    </div>
                    <p className="chat-text">{chat.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {stepIndex >= totalSteps && (
              <div className="delivery-badge-arrived animate-bounce">
                <CheckCircle size={20} />
                <span>Ramesh Kumar has successfully delivered your milk! Enjoy!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .tracker-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 25000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .tracker-modal {
          width: 100%;
          max-width: 1000px;
          height: 80vh;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 0;
          box-shadow: var(--shadow-lg);
          animation: slideUpModal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideUpModal {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .tracker-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        .tracker-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .scooter-glow {
          font-size: 2.2rem;
        }
        .tracker-title-row h3 {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
        }
        .tracker-title-row p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 2px 0 0 0;
        }
        .btn-close-tracker {
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
          color: var(--text-secondary);
        }
        .btn-close-tracker:hover {
          color: var(--danger-red);
          background: var(--danger-red-light);
        }
        
        .tracker-grid {
          display: grid;
          grid-template-columns: 1.7fr 1.3fr;
          flex-grow: 1;
          overflow: hidden;
          height: calc(100% - 78px);
        }
        .tracker-map-canvas {
          background: #e5e7eb;
          height: 100%;
          position: relative;
        }
        
        .tracker-sidebar {
          display: flex;
          flex-direction: column;
          padding: 20px;
          overflow-y: auto;
          gap: 16px;
          border-left: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }
        
        .simulation-toggles {
          padding: 8px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 10px;
        }
        .sim-lbl {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .multiplier-buttons {
          display: flex;
          gap: 4px;
        }
        .mult-btn {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          transition: all 0.2s;
        }
        .mult-btn:hover, .mult-btn.active {
          background: var(--primary-milk);
          color: white;
          border-color: var(--primary-milk);
        }
        
        .telemetry-dashboard {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tel-card {
          padding: 14px;
          border-radius: var(--radius-sm);
        }
        .tel-title {
          font-size: 0.8rem;
          font-weight: 700;
          gap: 6px;
          margin-bottom: 6px;
        }
        .tel-card h3 {
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, var(--text-primary), var(--chach-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tel-card h4 {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 4px 0 0 0;
        }
        .tel-lbl {
          font-size: 0.65rem;
          color: var(--text-secondary);
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .rider-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .rider-avatar {
          font-size: 2rem;
        }
        .rider-meta h5 {
          font-size: 0.9rem;
          font-weight: 700;
          margin: 0 0 2px 0;
        }
        .btn-call-rider {
          margin-left: auto;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--chach-green-light);
          color: var(--chach-green);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .btn-call-rider:hover {
          background: var(--chach-green);
          color: white;
        }
        
        .chat-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-grow: 1;
        }
        .chat-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .chat-log-box {
          height: 140px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 4px;
        }
        .chat-bubble {
          padding: 8px 12px;
          border-radius: 12px;
          max-width: 90%;
          font-size: 0.75rem;
          line-height: 1.35;
          animation: slideMsg 0.2s ease-out;
        }
        @keyframes slideMsg {
          from { transform: translateY(6px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .rider-chat {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          align-self: flex-start;
          border-top-left-radius: 0;
        }
        .customer-chat {
          background: var(--primary-milk-light);
          color: var(--primary-milk);
          align-self: flex-end;
          border-top-right-radius: 0;
        }
        .chat-bubble-header {
          font-size: 0.6rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .chat-sender {
          color: var(--ghee-gold);
        }
        .chat-time {
          color: var(--text-secondary);
        }
        .chat-text {
          margin: 0;
        }
        
        .delivery-badge-arrived {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--chach-green-light);
          color: var(--chach-green);
          border: 1px solid var(--chach-green);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        @media (max-width: 800px) {
          .tracker-modal {
            height: 95vh;
          }
          .tracker-grid {
            grid-template-columns: 1fr;
          }
          .tracker-map-canvas {
            height: 300px;
          }
          .tracker-sidebar {
            height: calc(100% - 300px);
          }
        }
      `}</style>
    </div>
  );
}
