import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import { SHOPS, checkDeliveryEligibility } from '../utils/geo';
import { MapPin, Navigation, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import L from 'leaflet';

// Custom high-fidelity inline SVG icons to prevent Leaflet marker asset failures
const shopIcon = L.divIcon({
  className: 'custom-shop-icon',
  html: `
    <div style="background: var(--primary-milk); border: 2px solid white; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: scale(1.1); transition: transform 0.2s;">
      <span style="font-size: 20px;">🥛</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21]
});

const customerIcon = L.divIcon({
  className: 'custom-customer-icon',
  html: `
    <div style="background: var(--ghee-gold); border: 2px solid white; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); animation: bounce 1s infinite alternate;">
      <span style="font-size: 16px;">🏠</span>
    </div>
    <style>
      @keyframes bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-5px); }
      }
    </style>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19]
});

// A component to programmatically fly to a new location when selected
function MapFlyController({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 13, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

// Map event listener to capture pin drops on map click
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Top Popular Jaipur Localities for quick demo teleportation
const JAIPUR_NEIGHBORHOODS = [
  { name: 'Vaishali Nagar (Eligible)', lat: 26.9082, lng: 75.7485, desc: 'Near Shop' },
  { name: 'Malviya Nagar (Eligible)', lat: 26.8530, lng: 75.8150, desc: 'Near Shop' },
  { name: 'Mansarovar (Eligible)', lat: 26.8720, lng: 75.7720, desc: 'Near Shop' },
  { name: 'Raja Park (Eligible)', lat: 26.8990, lng: 75.8250, desc: 'Near Shop' },
  { name: 'C-Scheme (Eligible)', lat: 26.9150, lng: 75.7990, desc: 'Near Shop' },
  { name: 'Pink City / Johri Bazar', lat: 26.9210, lng: 75.8240, desc: 'Border Radius' },
  { name: 'Jagatpura (Outside)', lat: 26.8280, lng: 75.8640, desc: 'Too Far (7.8 km)' },
  { name: 'Kanota (Outside)', lat: 26.8780, lng: 75.9890, desc: 'Too Far (16 km)' }
];

export default function MapSelector({ onLocationSelect, selectedCoords, selectedAddress, onAddressChange }) {
  const [coords, setCoords] = useState(selectedCoords || { lat: 26.9124, lng: 75.7873 }); // Jaipur Center
  const [status, setStatus] = useState(null);
  const [addressInput, setAddressInput] = useState(selectedAddress || '');

  useEffect(() => {
    // Run verification on initial render
    verifyLocation(coords.lat, coords.lng);
  }, []);

  const verifyLocation = (lat, lng) => {
    const check = checkDeliveryEligibility(lat, lng);
    setStatus(check);
    setCoords({ lat, lng });
    onLocationSelect({ lat, lng, eligibility: check });
  };

  const handleNeighborhoodSelect = (nh) => {
    setAddressInput(`Plot/House Near ${nh.name}, Jaipur`);
    onAddressChange(`Plot/House Near ${nh.name}, Jaipur`);
    verifyLocation(nh.lat, nh.lng);
  };

  const handleManualMapClick = (lat, lng) => {
    setAddressInput(`Custom Pin Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    onAddressChange(`Custom Pin Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    verifyLocation(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setAddressInput(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          onAddressChange(`GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          verifyLocation(latitude, longitude);
        },
        () => {
          alert("Unable to retrieve location. Please choose a location from the map or quick-lists instead.");
        }
      );
    }
  };

  return (
    <div className="map-selector-card glass-card">
      <div className="map-header">
        <h3 className="section-title">🗺️ Verify Your Delivery Area</h3>
        <p className="section-subtitle">
          We deliver within a <strong>5-6 km radius</strong> of our 5 Jaipur shops. Use the map or quick buttons to test your address.
        </p>
      </div>

      <div className="map-layout">
        {/* Left Options / Info Panel */}
        <div className="map-controls">
          <div className="input-group">
            <label className="input-label">Delivery Address Line</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Enter house, apartment, street details..."
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  onAddressChange(e.target.value);
                }}
                className="custom-input"
              />
            </div>
          </div>

          <button onClick={handleGetCurrentLocation} className="btn btn-secondary w-full gps-btn">
            <Navigation size={16} />
            <span>Detect Current Location</span>
          </button>

          {/* Quick Select Buttons */}
          <div className="quick-select">
            <span className="quick-title">Quick Select Popular Localities:</span>
            <div className="neighborhoods-grid">
              {JAIPUR_NEIGHBORHOODS.map((nh, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNeighborhoodSelect(nh)}
                  className={`nh-btn ${coords.lat === nh.lat ? 'active' : ''}`}
                >
                  <span className="nh-name">{nh.name.split(' (')[0]}</span>
                  <span className={`nh-badge ${nh.desc.includes('Eligible') ? 'eligible' : 'outside'}`}>
                    {nh.desc.includes('Eligible') ? 'In Range' : nh.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Eligibility Panel */}
          {status && (
            <div className={`status-panel ${status.isEligible ? 'status-green' : 'status-red'}`}>
              <div className="status-header">
                {status.isEligible ? (
                  <CheckCircle size={24} className="icon-green" />
                ) : (
                  <AlertTriangle size={24} className="icon-red" />
                )}
                <div>
                  <h4 className="status-title">
                    {status.isEligible ? 'Delivery Available!' : 'Outside Delivery Zone'}
                  </h4>
                  <p className="status-details">
                    {status.isEligible 
                      ? `We can deliver to your doorstep from our ${status.nearestShop.name} (distance: ${status.distanceKm} km).`
                      : `Your location is ${status.distanceKm} km away. Our maximum radius limit is ${status.radiusLimit} km.`}
                  </p>
                </div>
              </div>

              {status.isEligible ? (
                <div className="delivery-details-info">
                  <div className="info-row">
                    <span>Nearest Shop:</span>
                    <strong>{status.nearestShop.name}</strong>
                  </div>
                  <div className="info-row">
                    <span>Contact Branch:</span>
                    <strong>{status.nearestShop.contact}</strong>
                  </div>
                  <div className="info-row">
                    <span>Standard Delivery:</span>
                    <strong>⚡ 30 - 45 Mins</strong>
                  </div>
                </div>
              ) : (
                <div className="out-of-bounds-options">
                  <div className="info-alert">
                    <Info size={16} />
                    <span>You can still place orders for <strong>Self-Pickup</strong> at our nearest branch.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Map Canvas */}
        <div className="map-canvas-container">
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Draw shop markers & circles */}
            {SHOPS.map((shop) => (
              <React.Fragment key={shop.id}>
                <Marker position={[shop.lat, shop.lng]} icon={shopIcon}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--primary-milk)' }}>
                        {shop.name}
                      </strong>
                      <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>{shop.locationName}</p>
                      <span className="badge badge-milk">{shop.radiusKm} km Delivery Zone</span>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[shop.lat, shop.lng]}
                  radius={shop.radiusKm * 1000} // Radius in meters
                  pathOptions={{
                    color: shop.color,
                    fillColor: shop.color,
                    fillOpacity: 0.15,
                    weight: 1.5,
                    dashArray: '5, 5'
                  }}
                />
              </React.Fragment>
            ))}

            {/* Selected Location Marker */}
            <Marker position={[coords.lat, coords.lng]} icon={customerIcon}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>Your Delivery Point</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.8rem' }}>
                    {status?.isEligible ? '🟢 Deliverable' : '🔴 Out of radius'}
                  </p>
                </div>
              </Popup>
            </Marker>

            <MapFlyController coords={coords} />
            <MapEventsHandler onMapClick={handleManualMapClick} />
          </MapContainer>
          <div className="map-tip">
            <span className="tip-badge">Tip</span>
            <span>Click anywhere on the map to manually set your delivery pin!</span>
          </div>
        </div>
      </div>

      <style>{`
        .map-selector-card {
          margin: 32px 0;
        }
        .map-header {
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 1.6rem;
          margin-bottom: 8px;
        }
        .section-subtitle {
          color: var(--text-secondary);
        }
        .map-layout {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 24px;
          min-height: 480px;
        }
        .map-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--primary-milk);
        }
        .custom-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-input);
          color: var(--text-primary);
          transition: border-color 0.2s;
        }
        .custom-input:focus {
          border-color: var(--border-focus);
        }
        .w-full {
          width: 100%;
        }
        .gps-btn {
          height: 44px;
          font-size: 0.9rem;
        }
        .quick-select {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .quick-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .neighborhoods-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          max-height: 150px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .nh-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          transition: all 0.15s;
          text-align: left;
        }
        .nh-btn:hover, .nh-btn.active {
          border-color: var(--primary-milk);
          background: var(--primary-milk-light);
        }
        .nh-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .nh-badge {
          font-size: 0.65rem;
          padding: 1px 4px;
          border-radius: 4px;
          font-weight: 500;
        }
        .nh-badge.eligible {
          background: var(--primary-milk-light);
          color: var(--primary-milk);
        }
        .nh-badge.outside {
          background: var(--danger-red-light);
          color: var(--danger-red);
        }
        .status-panel {
          border-radius: var(--radius-md);
          padding: 16px;
          border: 1px solid;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: auto;
        }
        .status-green {
          background: var(--chach-green-light);
          border-color: var(--chach-green);
        }
        .status-red {
          background: var(--danger-red-light);
          border-color: var(--danger-red);
        }
        .status-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .status-title {
          font-size: 1rem;
          margin-bottom: 2px;
        }
        .status-details {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.35;
        }
        .icon-green {
          color: var(--chach-green);
        }
        .icon-red {
          color: var(--danger-red);
        }
        .delivery-details-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.8rem;
          padding-top: 10px;
          border-top: 1px dashed rgba(0, 0, 0, 0.1);
        }
        [data-theme="dark"] .delivery-details-info {
          border-top-color: rgba(255, 255, 255, 0.1);
        }
        .info-row {
          display: flex;
          justify-content: space-between;
        }
        .out-of-bounds-options {
          font-size: 0.8rem;
          padding-top: 10px;
          border-top: 1px dashed rgba(0,0,0,0.1);
        }
        .info-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }
        .map-canvas-container {
          position: relative;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .map-tip {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          z-index: 500;
          background: var(--bg-card);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          border: 1px solid var(--border-color);
        }
        .tip-badge {
          background: var(--primary-milk);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .map-layout {
            grid-template-columns: 1fr;
          }
          .map-canvas-container {
            height: 350px;
          }
        }
      `}</style>
    </div>
  );
}
