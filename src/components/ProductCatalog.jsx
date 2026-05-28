import React, { useState } from 'react';
import { PRODUCTS } from '../utils/db';
import { Sparkles, Calendar, Plus, Minus, ShoppingCart, ChevronDown, ChevronUp, RefreshCw, Star } from 'lucide-react';

export default function ProductCatalog({ onAddToCart, onStartSubscription }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProductInfo, setExpandedProductInfo] = useState({});
  const [purchaseModes, setPurchaseModes] = useState({}); // { productId: 'once' | 'subscribe' }
  const [quantities, setQuantities] = useState({}); // { productId: qty }
  const [subFrequencies, setSubFrequencies] = useState({}); // { productId: frequency }
  const [subDurations, setSubDurations] = useState({}); // { productId: duration }

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'milk', label: 'Fresh Milk' },
    { id: 'ghee', label: 'Pure Ghee' },
    { id: 'beverage', label: 'Chach & Lassi' },
    { id: 'paneer', label: 'Malai Paneer' },
    { id: 'dahi', label: 'Creamy Dahi' },
    { id: 'butter', label: 'White Butter' }
  ];

  const handleQtyChange = (id, delta) => {
    const current = quantities[id] || 1;
    const next = Math.max(1, Math.min(20, current + delta));
    setQuantities({ ...quantities, [id]: next });
  };

  const togglePurchaseMode = (id, mode) => {
    setPurchaseModes({ ...purchaseModes, [id]: mode });
  };

  const toggleAccordion = (id) => {
    setExpandedProductInfo({
      ...expandedProductInfo,
      [id]: !expandedProductInfo[id]
    });
  };

  const handleAddToCartClick = (product) => {
    const qty = quantities[product.id] || 1;
    onAddToCart(product, qty);
    // Reset quantity back to 1
    setQuantities({ ...quantities, [product.id]: 1 });
  };

  const handleSubscribeClick = (product) => {
    const qty = quantities[product.id] || 1;
    const freq = subFrequencies[product.id] || 'Daily';
    const dur = subDurations[product.id] || '30';
    onStartSubscription(product, qty, freq, dur);
  };

  // Filter products based on search and category
  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="catalog-wrapper">
      {/* Search & Category Filter Header */}
      <div className="catalog-controls glass-card">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search fresh milk, bilona ghee, matka chach..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="categories-scroller">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid-responsive">
        {filteredProducts.map((product) => {
          const mode = purchaseModes[product.id] || 'once';
          const qty = quantities[product.id] || 1;
          const frequency = subFrequencies[product.id] || 'Daily';
          const duration = subDurations[product.id] || '30';
          const isExpanded = expandedProductInfo[product.id];
          const discountPrice = Math.round(product.price * 0.9); // 10% Sub discount

          // Custom colors based on category
          let accentClass = 'accent-milk';
          if (product.category === 'ghee') accentClass = 'accent-ghee';
          if (product.category === 'beverage') accentClass = 'accent-chach';

          return (
            <div key={product.id} className={`product-card glass-card ${accentClass}`}>
              {/* Product Badges */}
              <div className="product-badges">
                {product.badges.map((badge, idx) => (
                  <span 
                    key={idx} 
                    className={`badge ${
                      product.category === 'milk' ? 'badge-milk' : 
                      product.category === 'ghee' ? 'badge-ghee' : 'badge-chach'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Product Image & Info */}
              <div className="product-visual">
                <div className="product-avatar-placeholder">
                  {product.category === 'milk' && '🥛'}
                  {product.category === 'ghee' && '🍯'}
                  {product.category === 'beverage' && '🥤'}
                  {product.category === 'paneer' && '🧀'}
                  {product.category === 'dahi' && '🥣'}
                  {product.category === 'butter' && '🧈'}
                </div>
                <div className="product-rating">
                  <Star size={14} className="fill-gold" />
                  <Star size={14} className="fill-gold" />
                  <Star size={14} className="fill-gold" />
                  <Star size={14} className="fill-gold" />
                  <Star size={14} className="fill-gold" />
                  <span>5.0</span>
                </div>
              </div>

              <div className="product-meta">
                <h4 className="product-title">{product.name}</h4>
                <span className="product-unit">Per {product.unit}</span>
                <p className="product-desc">{product.description}</p>
              </div>

              {/* Nutritional Facts Accordion */}
              <div className="accordion-section">
                <button onClick={() => toggleAccordion(product.id)} className="accordion-trigger">
                  <span>Nutritional Values</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isExpanded && (
                  <div className="nutrition-details">
                    {Object.entries(product.nutrients).map(([key, val]) => (
                      <div key={key} className="nutrition-row">
                        <span className="nutrition-key">{key}</span>
                        <strong className="nutrition-val">{val}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase Mode Toggle */}
              <div className="mode-toggle-container">
                <button
                  onClick={() => togglePurchaseMode(product.id, 'once')}
                  className={`mode-btn ${mode === 'once' ? 'active' : ''}`}
                >
                  Buy Once
                </button>
                <button
                  onClick={() => togglePurchaseMode(product.id, 'subscribe')}
                  className={`mode-btn sub-mode-btn ${mode === 'subscribe' ? 'active' : ''}`}
                >
                  <Sparkles size={14} />
                  <span>Subscribe & Save (10%)</span>
                </button>
              </div>

              {/* Pricing Display */}
              <div className="price-display">
                {mode === 'once' ? (
                  <div className="price-box">
                    <span className="price-num">₹{product.price}</span>
                    <span className="price-unit">/{product.unit}</span>
                  </div>
                ) : (
                  <div className="price-box">
                    <span className="price-slashed">₹{product.price}</span>
                    <span className="price-num text-primary-color">₹{discountPrice}</span>
                    <span className="price-unit">/{product.unit}</span>
                  </div>
                )}
              </div>

              {/* Mode-Specific Settings */}
              {mode === 'subscribe' && (
                <div className="subscription-settings bg-light-panel">
                  {/* Frequency Picker */}
                  <div className="setting-group">
                    <label className="setting-label">Delivery Cycle</label>
                    <select
                      value={frequency}
                      onChange={(e) => setSubFrequencies({ ...subFrequencies, [product.id]: e.target.value })}
                      className="setting-select"
                    >
                      <option value="Daily">Every Morning (Daily)</option>
                      <option value="Alternate">Alternate Days</option>
                      <option value="Weekly">Once a Week</option>
                      <option value="Every 3 Days">Every 3 Days</option>
                    </select>
                  </div>
                  {/* Duration Picker */}
                  <div className="setting-group">
                    <label className="setting-label">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setSubDurations({ ...subDurations, [product.id]: e.target.value })}
                      className="setting-select"
                    >
                      <option value="7">7 Days Trial</option>
                      <option value="30">30 Days Pack</option>
                      <option value="90">90 Days Season</option>
                      <option value="ongoing">Ongoing (Cancel Anytime)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Quantity Changer & Action CTA */}
              <div className="action-row">
                <div className="qty-picker">
                  <button onClick={() => handleQtyChange(product.id, -1)} className="qty-btn" aria-label="Decrease quantity">
                    <Minus size={16} />
                  </button>
                  <span className="qty-number">{qty}</span>
                  <button onClick={() => handleQtyChange(product.id, 1)} className="qty-btn" aria-label="Increase quantity">
                    <Plus size={16} />
                  </button>
                </div>

                {mode === 'once' ? (
                  <button
                    onClick={() => handleAddToCartClick(product)}
                    className="btn btn-primary btn-action-card w-full"
                  >
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribeClick(product)}
                    className="btn btn-ghee btn-action-card w-full"
                  >
                    <Calendar size={18} />
                    <span>Subscribe Now</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .catalog-wrapper {
          padding: 16px 0;
        }
        .catalog-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
          padding: 20px;
        }
        .search-bar-container {
          width: 100%;
        }
        .search-input {
          width: 100%;
          padding: 14px 20px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-pill);
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.2s;
        }
        .search-input:focus {
          border-color: var(--primary-milk);
          box-shadow: 0 0 0 3px rgba(var(--primary-milk-rgb), 0.1);
        }
        .categories-scroller {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none; /* Hide scrollbar for clean slider */
        }
        .categories-scroller::-webkit-scrollbar {
          display: none;
        }
        .category-pill {
          padding: 8px 18px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border-radius: var(--radius-pill);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .category-pill:hover, .category-pill.active {
          background: var(--primary-milk);
          color: white;
        }
        .product-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
        }
        .product-badges {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }
        .product-visual {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          margin-bottom: 16px;
        }
        .product-avatar-placeholder {
          font-size: 3rem;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
        }
        .product-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          background: var(--bg-secondary);
          padding: 4px 8px;
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          font-weight: 700;
        }
        .fill-gold {
          color: var(--ghee-gold);
          fill: var(--ghee-gold);
        }
        .product-meta {
          flex-grow: 1;
          margin-bottom: 12px;
        }
        .product-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .product-unit {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
          display: inline-block;
          margin-bottom: 8px;
        }
        .product-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .accordion-section {
          border-top: 1px solid var(--border-color);
          margin-bottom: 16px;
        }
        .accordion-trigger {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .nutrition-details {
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          font-size: 0.75rem;
          margin-bottom: 10px;
        }
        .nutrition-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 2px;
        }
        .nutrition-key {
          text-transform: capitalize;
          color: var(--text-secondary);
        }
        .mode-toggle-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
        }
        .mode-btn {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 8px;
          border-radius: 4px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .mode-btn.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }
        .sub-mode-btn.active {
          color: var(--ghee-gold);
        }
        .price-display {
          margin-bottom: 16px;
        }
        .price-box {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .price-num {
          font-size: 1.7rem;
          font-weight: 800;
        }
        .text-primary-color {
          color: var(--primary-milk);
        }
        [data-theme="dark"] .text-primary-color {
          color: var(--primary-milk);
        }
        .price-slashed {
          font-size: 1.1rem;
          text-decoration: line-through;
          color: var(--text-secondary);
        }
        .price-unit {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .subscription-settings {
          padding: 12px;
          border-radius: var(--radius-sm);
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .setting-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .setting-select {
          width: 100%;
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 0.8rem;
        }
        .action-row {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: auto;
        }
        .qty-picker {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-pill);
          background: var(--bg-card);
          padding: 4px;
        }
        .qty-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .qty-btn:hover {
          background: var(--border-color);
        }
        .qty-number {
          width: 30px;
          text-align: center;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .btn-action-card {
          flex-grow: 1;
          height: 44px;
          font-size: 0.9rem;
        }
        
        /* Accents on card */
        .accent-milk:hover {
          border-color: var(--primary-milk);
        }
        .accent-ghee:hover {
          border-color: var(--ghee-gold);
        }
        .accent-chach:hover {
          border-color: var(--chach-green);
        }
      `}</style>
    </div>
  );
}
