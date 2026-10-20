import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';

export const SpatialMechanics = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', perspective: '2000px', padding: '120px 20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 className="spatial-huge" style={{ fontSize: '6vw' }}>The Mechanics</h2>
        <p className="spatial-sub-large" style={{ fontSize: '1.5vw' }}>One seamless interaction. Two different perspectives.</p>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '900px', height: '600px', transformStyle: 'preserve-3d' }}>
        
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 50, damping: 15 }}
          style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
        >
          {/* Driver Side (Front) */}
          <div className="spatial-flip-card front" style={{ backfaceVisibility: 'hidden' }}>
            <div className="flip-content">
              <span className="flip-badge driver-badge">Driver View</span>
              <h3 style={{ fontSize: '48px', color: 'var(--emerald)', marginBottom: '40px', fontFamily: '"Baloo 2", sans-serif' }}>Get Paid Instantly.</h3>
              <div className="flip-steps">
                <div className="flip-step">
                  <div className="step-number driver">1</div>
                  <h4>Set Route</h4>
                  <p>GPS finds your start. Pick your destination.</p>
                </div>
                <div className="flip-step">
                  <div className="step-number driver">2</div>
                  <h4>Boarding</h4>
                  <p>Passengers scan your unique vehicle code.</p>
                </div>
                <div className="flip-step">
                  <div className="step-number driver">3</div>
                  <h4>Clear Earnings</h4>
                  <p>Fares land instantly. No cash, no arguments.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rider Side (Back) */}
          <div className="spatial-flip-card back" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="flip-content">
              <span className="flip-badge rider-badge">Rider View</span>
              <h3 style={{ fontSize: '48px', color: 'var(--amber)', marginBottom: '40px', fontFamily: '"Baloo 2", sans-serif' }}>Pay Exact. Every Time.</h3>
              <div className="flip-steps">
                <div className="flip-step">
                  <div className="step-number rider">1</div>
                  <h4>Scan Code</h4>
                  <p>Point your camera at the bus QR code.</p>
                </div>
                <div className="flip-step">
                  <div className="step-number rider">2</div>
                  <h4>Pick Stop</h4>
                  <p>Fares are set per stop. Always know what you owe.</p>
                </div>
                <div className="flip-step">
                  <div className="step-number rider">3</div>
                  <h4>One Tap Pay</h4>
                  <p>Instant transfer from wallet. No waiting for change.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <button 
          className="flip-toggle-btn"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <RefreshCcw size={24} />
          <span>Flip to {isFlipped ? 'Driver' : 'Rider'} View</span>
        </button>

      </div>
    </div>
  );
};
