import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export const SpatialTrust = () => {
  const containerRef = useRef(null);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const spotlightX = useTransform(springX, [0, 1], ['0%', '100%']);
  const spotlightY = useTransform(springY, [0, 1], ['0%', '100%']);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ 
        minHeight: '100vh', 
        background: '#040806', // extremely dark ink
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '120px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* The Spotlight Mask */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle 600px at calc(${spotlightX}) calc(${spotlightY}), rgba(255,255,255,0.15), transparent 80%)`,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '800px' }}>
        
        <motion.div 
          animate={{ rotateY: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ display: 'inline-block', marginBottom: '40px', transformStyle: 'preserve-3d' }}
        >
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(14, 157, 92, 0.1)',
            border: '2px solid rgba(14, 157, 92, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(14, 157, 92, 0.2)'
          }}>
            <ShieldCheck size={64} color="var(--emerald)" />
          </div>
        </motion.div>

        <h2 className="spatial-huge spotlight-text" style={{ fontSize: '5vw', marginBottom: '32px' }}>
          We ask for your bank details once.
        </h2>
        
        <p className="spatial-sub-large spotlight-text" style={{ fontSize: '1.8vw', lineHeight: '1.6' }}>
          The day you actually have money to withdraw, not before. 
          No forms, no ID, no waiting, just to get started. 
          Built for the buses nobody else is building for.
        </p>

      </div>
    </div>
  );
};
