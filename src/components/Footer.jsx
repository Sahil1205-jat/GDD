import React from 'react';
import { Award, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer({ setView }) {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-grid">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="logo-section">
            <span className="footer-logo">🥛</span>
            <h4>Ganga Dudh Dairy</h4>
          </div>
          <p className="footer-pitch">
            Pioneering the delivery of farm-fresh, premium A2 cow/buffalo milk, granular Vedic Bilona ghee, and matka chach in Jaipur since 1998. Straight from our farms to your breakfast table.
          </p>
          <div className="certification-badge">
            <Award size={18} className="text-gold" />
            <span>FSSAI Certified: #10021013000289</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h5>GDD Services</h5>
          <ul className="footer-links">
            <li><button onClick={() => setView('store')}>Browse Store</button></li>
            <li><button onClick={() => setView('home')}>Verify Radius</button></li>
            <li><button onClick={() => setView('customer')}>My Subscriptions</button></li>
            <li><button onClick={() => setView('admin')}>Shopkeeper Admin</button></li>
          </ul>
        </div>

        {/* Jaipur Branches */}
        <div className="footer-col">
          <h5>Jaipur Branches (5 km Radius)</h5>
          <ul className="footer-links font-small">
            <li>📍 <strong>Vaishali Nagar:</strong> Near Amrapali Circle</li>
            <li>📍 <strong>Malviya Nagar:</strong> Near Gaurav Tower (GT)</li>
            <li>📍 <strong>Mansarovar:</strong> Near Metro Station</li>
            <li>📍 <strong>Raja Park:</strong> Near Gali No. 4</li>
            <li>📍 <strong>C-Scheme:</strong> Near Panch Batti</li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="footer-col contact-col">
          <h5>Contact Headquarters</h5>
          <ul className="footer-contact-list">
            <li>
              <Phone size={16} className="text-blue" />
              <span>+91 98290 12345</span>
            </li>
            <li>
              <Mail size={16} className="text-blue" />
              <span>support@gangadudh.com</span>
            </li>
            <li>
              <MapPin size={16} className="text-blue" />
              <span>Plot 12, Queens Road, Vaishali Nagar, Jaipur, Rajasthan</span>
            </li>
          </ul>
        </div>
      </div>

      <hr className="footer-divider" />

      <div className="footer-bottom">
        <p>© 2026 Ganga Dudh Dairy. All rights reserved.</p>
        <p className="credit-text">
          Crafted with <Heart size={10} className="text-red-fill" /> in Jaipur, India.
        </p>
      </div>

      <style>{`
        .footer-wrapper {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 64px 0 24px 0;
          margin-top: 64px;
          transition: background 0.3s, border-color 0.3s;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.2fr 1.3fr;
          gap: 40px;
          margin-bottom: 48px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .brand-col {
          gap: 12px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-logo {
          font-size: 1.8rem;
        }
        .footer-col h4 {
          font-size: 1.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-milk), var(--ghee-gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .footer-pitch {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .certification-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          width: fit-content;
        }
        .text-gold {
          color: var(--ghee-gold);
        }
        .footer-col h5 {
          font-size: 1rem;
          font-weight: 700;
          border-left: 3px solid var(--primary-milk);
          padding-left: 8px;
          margin-bottom: 4px;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .footer-links button {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: left;
          font-weight: 500;
        }
        .footer-links button:hover {
          color: var(--primary-milk);
          transform: translateX(2px);
        }
        .font-small {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .footer-contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .footer-contact-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .text-blue {
          color: var(--primary-milk);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .footer-divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin-bottom: 24px;
        }
        .footer-bottom {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .credit-text {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .text-red-fill {
          color: var(--danger-red);
          fill: var(--danger-red);
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: center;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
