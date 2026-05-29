import React, { useEffect, useState } from 'react';
import { Send, CheckCheck, ShieldAlert, ArrowLeft, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';

export default function WhatsAppSimulator({ isOpen, onClose, customerName, phone, activeOrder, activeSubscription, onTrackOrderLinkClick }) {
  const [messages, setMessages] = useState([]);
  
  if (!isOpen) return null;

  const handleTrackLinkClick = () => {
    onClose();
    if (onTrackOrderLinkClick) {
      const mockTrackOrder = activeOrder || {
        id: 'GDD_48921',
        branchId: 'vaishali',
        address: 'Plot 45, Amrapali Circle, Vaishali Nagar, Jaipur',
        coords: { lat: 26.9082, lng: 75.7485 }
      };
      onTrackOrderLinkClick(mockTrackOrder);
    }
  };

  useEffect(() => {
    // Generate simulated WhatsApp message templates based on transaction type
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempMessages = [
      {
        id: 1,
        sender: 'system',
        text: '🔒 Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Tap to learn more.',
        time: ''
      }
    ];

    if (activeSubscription) {
      tempMessages.push({
        id: 2,
        sender: 'dairy',
        text: `*Ganga Dudh Dairy • गंगा दूध* 🥛\n\nPranam *${customerName}*,\nYour subscription is successfully activated! 🎉\n\n📋 *Details:*\n• *Item:* ${activeSubscription.quantity}x ${activeSubscription.name}\n• *Frequency:* ${activeSubscription.frequency}\n• *Duration:* ${activeSubscription.duration === 'ongoing' ? 'Ongoing (Cancel anytime)' : `${activeSubscription.duration} Days`}\n• *Starting:* Tomorrow Morning\n\nYour fresh delivery will arrive at your doorstep between *6:00 AM - 9:00 AM* every cycle. Thank you for choosing purity! 🙏`,
        time: currentTimeStr
      });
    } else if (activeOrder) {
      tempMessages.push({
        id: 2,
        sender: 'dairy',
        text: `*Ganga Dudh Dairy • गंगा दूध* 🥛\n\nPranam *${customerName}*,\nYour order *#${activeOrder.id}* is successfully confirmed! 🛵\n\n🛍️ *Summary:*\n${activeOrder.items.map(item => `• ${item.quantity}x ${item.name}`).join('\n')}\n\n💵 *Total Payable:* ₹${activeOrder.totalAmount}\n📍 *Deliver to:* ${activeOrder.address}\n⚡ *Time Slot:* ${activeOrder.deliverySlot}\n\nOur delivery rider will reach you shortly. Please keep cash or UPI ready. track your package here: _t.gangadudh.in/track/${activeOrder.id}_`,
        time: currentTimeStr
      });
    } else {
      // Default general greeting template
      tempMessages.push({
        id: 2,
        sender: 'dairy',
        text: `Pranam *${customerName}*,\nWelcome to Ganga Dudh Dairy! 🥛\n\nThis channel will deliver instant, free automated notifications for your fresh milk deliveries, order confirmation receipts, daily dispatch timers, and seasonal offers in Jaipur!\n\nLater, you can text *'MENU'* here to pause/resume deliveries dynamically via our WhatsApp automated bot!`,
        time: currentTimeStr
      });
    }

    // Add a simulated rider morning dispatch message 1.5 seconds later!
    setMessages(tempMessages);
    
    const timer = setTimeout(() => {
      const dispatchTimeStr = new Date(Date.now() + 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          id: 3,
          sender: 'dairy',
          text: `🛵 *Rider Dispatch Alert*\n\nHello *${customerName}*,\nYour fresh morning delivery batch has been dispatched from our *Vaishali Nagar Branch*! \n\n👤 *Rider:* Ramesh Kumar (+91 99999 12345)\n🌡️ *Milk Temperature:* Sourced at 4°C\n⏱️ *Est. Arrival:* 7:15 AM\n\nClick to view live delivery path: _m.gangadudh.in/map/rider-092_`,
          time: dispatchTimeStr
        }
      ]);
    }, 2500);

    return () => clearTimeout(timer);
  }, [activeOrder, activeSubscription, customerName]);

  return (
    <div className="wa-overlay" onClick={onClose}>
      <div className="wa-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Smartphone Screen container */}
        <div className="wa-phone-canvas">
          
          {/* Phone Notch/Top Bar */}
          <div className="wa-phone-notch">
            <div className="wa-time-sensor">18:54</div>
            <div className="wa-earpiece"></div>
            <div className="wa-battery-wifi">📶 🔋 98%</div>
          </div>

          {/* WhatsApp Header */}
          <div className="wa-chat-header">
            <button onClick={onClose} className="wa-back-btn">
              <ArrowLeft size={20} />
            </button>
            <div className="wa-header-avatar">G</div>
            <div className="wa-header-meta">
              <div className="wa-header-title-row">
                <h4>Ganga Dudh</h4>
                <span className="wa-verified-badge" title="Verified Business Profile">✓</span>
              </div>
              <span className="wa-status">online</span>
            </div>
            
            <div className="wa-header-actions">
              <Video size={18} />
              <Phone size={16} />
              <MoreVertical size={18} />
            </div>
          </div>

          {/* WhatsApp Chat Body */}
          <div className="wa-chat-body">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`wa-msg-wrapper ${
                  msg.sender === 'system' ? 'wa-system' : 
                  msg.sender === 'dairy' ? 'wa-dairy' : 'wa-client'
                }`}
              >
                <div className="wa-msg-bubble animate-message">
                  {msg.text.split('\n').map((line, lIdx) => {
                    // Quick bolding formatting rules for simulation markup
                    let formattedLine = line;
                    
                    // Simple replacement of *bold* to <strong>
                    if (line.includes('*')) {
                      const parts = line.split('*');
                      formattedLine = parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part);
                    }
                    
                    // Simple replacement of _italic_ to <em> or Clickable Map Button
                    if (line.includes('_')) {
                      const parts = line.split('_');
                      formattedLine = parts.map((part, pIdx) => {
                        if (pIdx % 2 === 1) {
                          if (part.includes('m.gangadudh.in/map/rider-092')) {
                            return (
                              <button 
                                key={pIdx} 
                                onClick={handleTrackLinkClick}
                                style={{ 
                                  color: '#34b7f1', 
                                  background: 'none', 
                                  border: 'none', 
                                  textDecoration: 'underline', 
                                  cursor: 'pointer', 
                                  padding: 0, 
                                  font: 'inherit',
                                  textAlign: 'left'
                                }}
                              >
                                {part}
                              </button>
                            );
                          }
                          return <em key={pIdx}>{part}</em>;
                        }
                        return part;
                      });
                    }

                    return <p key={lIdx} className="wa-msg-line">{formattedLine}</p>;
                  })}
                  
                  {msg.time && (
                    <span className="wa-msg-time">
                      {msg.time}
                      <CheckCheck size={14} className="wa-ticks text-blue" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Text Input Footer */}
          <div className="wa-chat-footer">
            <div className="wa-input-container">
              <Smile size={20} className="text-secondary" />
              <input type="text" placeholder="Type a message..." disabled className="wa-text-input" />
              <Paperclip size={18} className="text-secondary" />
            </div>
            <button className="wa-send-btn">
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Action Dismiss Bar */}
        <button onClick={onClose} className="btn btn-primary wa-dismiss-btn w-full pulse-milk">
          <span>Awesome! Close Simulation</span>
        </button>
      </div>

      <style>{`
        .wa-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 30000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .wa-dialog {
          width: 100%;
          max-width: 375px; /* Exact size of a mobile smartphone screen! */
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .wa-phone-canvas {
          background: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); /* Official WhatsApp doodle background! */
          background-color: #efeae2;
          height: 600px;
          border-radius: 36px;
          border: 12px solid #1e293b; /* Premium outer bezel */
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        .wa-phone-notch {
          height: 28px;
          background: #075e54;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
        }
        .wa-earpiece {
          width: 60px;
          height: 4px;
          background: #1e293b;
          border-radius: 2px;
          margin-top: 4px;
        }
        .wa-chat-header {
          background: #075e54; /* Classic WhatsApp forest green */
          color: white;
          height: 56px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          gap: 8px;
        }
        .wa-back-btn {
          color: white;
          padding: 4px;
        }
        .wa-header-avatar {
          width: 36px;
          height: 36px;
          background: var(--primary-milk);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          font-weight: bold;
        }
        .wa-header-meta {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .wa-header-title-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .wa-header-meta h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
        }
        .wa-verified-badge {
          background: #128c7e;
          color: white;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.55rem;
          font-weight: 800;
        }
        .wa-status {
          font-size: 0.65rem;
          opacity: 0.8;
        }
        .wa-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0.9;
        }
        
        .wa-chat-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .wa-msg-wrapper {
          display: flex;
          width: 100%;
        }
        .wa-system {
          justify-content: center;
        }
        .wa-system .wa-msg-bubble {
          background: rgba(254, 240, 138, 0.95);
          color: #713f12;
          font-size: 0.65rem;
          max-width: 90%;
          text-align: center;
          padding: 6px 12px;
          border-radius: 8px;
          box-shadow: 0 1px 1px rgba(0,0,0,0.06);
          border: none;
        }
        .wa-dairy {
          justify-content: flex-start;
        }
        .wa-dairy .wa-msg-bubble {
          background: #ffffff;
          color: #111827;
          border-radius: 0 12px 12px 12px;
          max-width: 85%;
          padding: 8px 10px 20px 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          position: relative;
        }
        .wa-msg-line {
          font-size: 0.75rem;
          line-height: 1.35;
          margin-bottom: 2px;
        }
        .wa-msg-time {
          position: absolute;
          bottom: 2px;
          right: 6px;
          font-size: 0.55rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .wa-ticks {
          font-size: 0.65rem;
        }
        .wa-ticks.text-blue {
          color: #34b7f1;
        }
        
        .animate-message {
          animation: popMsg 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popMsg {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .wa-chat-footer {
          height: 52px;
          padding: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
        }
        .wa-input-container {
          flex-grow: 1;
          background: white;
          height: 100%;
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          gap: 8px;
          box-shadow: 0 1px 1px rgba(0,0,0,0.05);
        }
        .wa-text-input {
          flex-grow: 1;
          border: none;
          background: transparent;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .text-secondary {
          color: #6b7280;
          opacity: 0.6;
        }
        .wa-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #128c7e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wa-dismiss-btn {
          height: 48px;
          border-radius: 12px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
