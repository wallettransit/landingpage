import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export const SpatialStage = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001
  });

  // Scene 1: Cash Chaos (0.1 to 0.25)
  const scene1Scale = useTransform(smoothProgress, [0, 0.15, 0.25, 0.3], [4, 1, 1, 0.5]);
  const scene1Opacity = useTransform(smoothProgress, [0, 0.1, 0.25, 0.35], [0, 1, 1, 0]);
  const scene1Filter = useTransform(smoothProgress, [0.25, 0.35], ["blur(0px)", "blur(20px)"]);

  // Scene 2: Dual Wallet (0.3 to 0.55)
  const cardRotateY = useTransform(smoothProgress, [0.25, 0.45], [90, 0]);
  const cardRotateX = useTransform(smoothProgress, [0.25, 0.45], [45, 0]);
  const scene2Opacity = useTransform(smoothProgress, [0.25, 0.35, 0.5, 0.6], [0, 1, 1, 0]);
  const scene2Z = useTransform(smoothProgress, [0.3, 0.5], [500, -500]);

  // Scene 3: Monthly Transit (0.55 to 0.75)
  const scene3Scale = useTransform(smoothProgress, [0.5, 0.6, 0.7, 0.8], [0, 1, 1, 4]);
  const scene3Opacity = useTransform(smoothProgress, [0.5, 0.6, 0.75, 0.85], [0, 1, 1, 0]);

  // Scene 4: Radar & Ping (0.75 to 0.9)
  const radarScale = useTransform(smoothProgress, [0.75, 0.9], [0, 10]);
  const scene4Opacity = useTransform(smoothProgress, [0.75, 0.85, 0.9, 0.95], [0, 1, 1, 0]);

  // Scene 5: Save/Earn (0.9 to 1.0)
  const scene5Y = useTransform(smoothProgress, [0.9, 1], [100, 0]);
  const scene5Opacity = useTransform(smoothProgress, [0.9, 1], [0, 1]);

  return (
    <div ref={containerRef} style={{ height: '700vh', position: 'relative', background: 'var(--ink)' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', perspective: '1200px' }}>
        
        {/* Abstract Ambient Background */}
        <motion.div style={{
          position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 157, 92, 0.15) 0%, rgba(11, 20, 16, 0) 70%)',
          filter: 'blur(60px)',
          x: useTransform(smoothProgress, [0, 1], ['-20vw', '20vw']),
          y: useTransform(smoothProgress, [0, 1], ['-20vh', '20vh']),
        }} />
        <motion.div style={{
          position: 'absolute', width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(242, 183, 5, 0.1) 0%, rgba(11, 20, 16, 0) 70%)',
          filter: 'blur(80px)',
          x: useTransform(smoothProgress, [0, 1], ['20vw', '-20vw']),
          y: useTransform(smoothProgress, [0, 1], ['20vh', '-20vh']),
        }} />

        {/* Scene 1: Massive Typography */}
        <motion.div 
          style={{ position: 'absolute', scale: scene1Scale, opacity: scene1Opacity, filter: scene1Filter, textAlign: 'center' }}
        >
          <h2 className="spatial-massive">₦82B LOST.</h2>
          <p className="spatial-sub">Cash is a broken system for 75,000 drivers.<br/>We are fixing it.</p>
        </motion.div>

        {/* Scene 2: The Core Object (Dual Wallet Card) */}
        <motion.div 
          style={{ position: 'absolute', opacity: scene2Opacity, z: scene2Z, rotateX: cardRotateX, rotateY: cardRotateY, display: 'flex', alignItems: 'center', gap: '80px' }}
        >
          <div className="spatial-text-left">One Wallet.</div>
          <div className="spatial-card">
            <div className="spatial-card-inner">
              <div className="card-chip"></div>
              <div className="card-brand">OyaPay</div>
            </div>
          </div>
          <div className="spatial-text-right">Two Sides.</div>
        </motion.div>

        {/* Scene 3: Monthly Transit */}
        <motion.div 
          style={{ position: 'absolute', scale: scene3Scale, opacity: scene3Opacity, textAlign: 'center' }}
        >
          <h2 className="spatial-huge">Stay on Budget.</h2>
          <p className="spatial-sub-large">Your monthly transit funds, securely locked.<br/>No cash, no hassle.</p>
        </motion.div>

        {/* Scene 4: Radar Ping */}
        <motion.div 
          style={{ position: 'absolute', opacity: scene4Opacity, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <motion.div style={{
            position: 'absolute', width: '100px', height: '100px', borderRadius: '50%',
            border: '2px solid rgba(242, 183, 5, 0.4)', scale: radarScale
          }} />
          <motion.div style={{
            position: 'absolute', width: '100px', height: '100px', borderRadius: '50%',
            border: '1px solid rgba(14, 157, 92, 0.2)', scale: useTransform(radarScale, v => v * 1.5)
          }} />
          <h2 className="spatial-huge" style={{ position: 'relative', zIndex: 10, mixBlendMode: 'difference' }}>Ping for Ride.</h2>
          <p className="spatial-sub-large" style={{ position: 'relative', zIndex: 10, mixBlendMode: 'difference' }}>Connect instantly with drivers going your way.</p>
        </motion.div>

        {/* Scene 5: Save More, Earn More */}
        <motion.div 
          style={{ position: 'absolute', y: scene5Y, opacity: scene5Opacity, textAlign: 'center', filter: 'drop-shadow(0 0 40px rgba(14, 157, 92, 0.4))' }}
        >
          <h2 className="spatial-mega">
            <span style={{ color: 'var(--amber)' }}>Save</span> More.<br/>
            <span style={{ color: 'var(--emerald)' }}>Earn</span> More.
          </h2>
        </motion.div>

      </div>
    </div>
  );
};
