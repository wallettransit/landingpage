import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Wallet, Users, MapPin, TrendingUp } from 'lucide-react';

export const SpatialRiders = () => {
  const containerRef = useRef(null);
  
  // Mouse position tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Spring physics for smooth return and movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Map mouse position to 3D rotation
  const rotateX = useTransform(smoothY, [0, 1], [15, -15]);
  const rotateY = useTransform(smoothX, [0, 1], [-15, 15]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        minHeight: '100vh', 
        background: 'var(--ink)', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '120px 20px',
        perspective: '2000px'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '80px', zIndex: 10 }}>
        <h2 className="spatial-huge" style={{ fontSize: '5vw' }}>The Rider Ecosystem</h2>
        <p className="spatial-sub-large" style={{ fontSize: '1.5vw' }}>More than just a payment app. A better way to move.</p>
      </div>

      <motion.div 
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: 'preserve-3d',
          width: '100%',
          maxWidth: '1200px'
        }}
        className="holo-grid"
      >
        <div className="bento-grid">
          <motion.div className="bento-card bento-large holo-card" whileHover={{ translateZ: 50, scale: 1.02 }}>
            <div className="bento-icon-wrapper wallet-bg"><Wallet size={32} color="var(--emerald)" /></div>
            <div className="bento-content">
              <h3>Monthly Transit Wallet</h3>
              <p>Remove the hassle, stay on budget. Set aside your monthly transport funds.</p>
            </div>
          </motion.div>

          <motion.div className="bento-card holo-card" whileHover={{ translateZ: 50, scale: 1.02 }}>
            <div className="bento-icon-wrapper community-bg"><Users size={28} color="var(--amber)" /></div>
            <div className="bento-content">
              <h3>Community Rides</h3>
              <p>Connect with your community. Ride together and split costs to save more.</p>
            </div>
          </motion.div>

          <motion.div className="bento-card holo-card" whileHover={{ translateZ: 50, scale: 1.02 }}>
            <div className="bento-icon-wrapper ping-bg"><MapPin size={28} color="#4F46E5" /></div>
            <div className="bento-content">
              <h3>Ping for Ride</h3>
              <p>Find a driver going your way instantly and skip the wait.</p>
            </div>
          </motion.div>

          <motion.div className="bento-card bento-wide holo-card" whileHover={{ translateZ: 50, scale: 1.02 }}>
            <div className="bento-icon-wrapper earn-bg"><TrendingUp size={32} color="#059669" /></div>
            <div className="bento-content">
              <h3>Save More, Earn More</h3>
              <p>A unified ecosystem where riders save money through shared routes, and drivers earn more.</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
