import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export const SpatialDrivers = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Stat 1: ₦82B (0 to 0.35)
  const stat1Op = useTransform(smoothProgress, [0, 0.1, 0.25, 0.35], [1, 1, 0, 0]);
  const stat1Y = useTransform(smoothProgress, [0.2, 0.35], [0, -100]);
  
  // Stat 2: 75,000 (0.25 to 0.7)
  const stat2Op = useTransform(smoothProgress, [0.2, 0.3, 0.55, 0.7], [0, 1, 1, 0]);
  const stat2Scale = useTransform(smoothProgress, [0.2, 0.35], [0.5, 1]);
  const stat2Y = useTransform(smoothProgress, [0.55, 0.7], [0, -100]);

  // Stat 3: ₦50-100 (0.6 to 1.0)
  const stat3Op = useTransform(smoothProgress, [0.55, 0.7, 1], [0, 1, 1]);
  const stat3Scale = useTransform(smoothProgress, [0.55, 0.7], [0.5, 1]);

  return (
    <div ref={containerRef} style={{ height: '400vh', background: 'var(--ink)' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        
        {/* Background glow tied to scroll */}
        <motion.div style={{
          position: 'absolute', width: '100vw', height: '100vh',
          background: useTransform(
            smoothProgress, 
            [0, 0.5, 1], 
            [
              'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.05) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(242,183,5,0.05) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(14,157,92,0.05) 0%, transparent 60%)'
            ]
          )
        }} />

        <div style={{ position: 'relative', width: '100%', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          <motion.div style={{ position: 'absolute', opacity: stat1Op, y: stat1Y, textAlign: 'center' }}>
            <h2 className="spatial-massive" style={{ color: '#EF4444' }}>₦82B</h2>
            <p className="spatial-sub-large">Lost yearly by Lagos drivers in cash levies.</p>
          </motion.div>

          <motion.div style={{ position: 'absolute', opacity: stat2Op, scale: stat2Scale, y: stat2Y, textAlign: 'center' }}>
            <h2 className="spatial-massive" style={{ color: 'var(--amber)' }}>75,000</h2>
            <p className="spatial-sub-large">Buses running entirely on untraceable physical cash.</p>
          </motion.div>

          <motion.div style={{ position: 'absolute', opacity: stat3Op, scale: stat3Scale, textAlign: 'center' }}>
            <h2 className="spatial-massive" style={{ color: 'var(--emerald)' }}>₦50–100</h2>
            <p className="spatial-sub-large">Lost to unavailable change on almost every ride.</p>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 1 }}
              style={{ marginTop: '40px', fontSize: '24px', color: 'var(--paper)', fontFamily: '"Baloo 2", sans-serif' }}
            >
              We fix this.
            </motion.p>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
