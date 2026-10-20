import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Wallet, Users, MapPin, TrendingUp, Bus, Smartphone } from 'lucide-react';

const DanfoSVG = () => (
  <svg viewBox="0 0 100 60" width="80" height="48" style={{ filter: 'drop-shadow(0 10px 15px rgba(242,183,5,0.4))' }}>
    {/* Body */}
    <rect x="5" y="10" width="90" height="40" rx="8" fill="#F2B705" />
    <rect x="5" y="28" width="90" height="12" fill="#0E9D5C" /> {/* iconic green stripe */}
    {/* Windows */}
    <rect x="15" y="15" width="15" height="10" rx="2" fill="#0B1410" />
    <rect x="35" y="15" width="15" height="10" rx="2" fill="#0B1410" />
    <rect x="55" y="15" width="15" height="10" rx="2" fill="#0B1410" />
    <rect x="75" y="15" width="15" height="10" rx="2" fill="#0B1410" />
    {/* Wheels */}
    <circle cx="25" cy="50" r="8" fill="#0B1410" stroke="#F7F5EF" strokeWidth="2" />
    <circle cx="75" cy="50" r="8" fill="#0B1410" stroke="#F7F5EF" strokeWidth="2" />
    {/* Headlight */}
    <circle cx="95" cy="35" r="4" fill="#FFFFFF" style={{ filter: 'drop-shadow(10px 0px 10px rgba(255,255,255,0.8))' }} />
  </svg>
);

const Stop = ({ progress, range, align, title, description, icon, highlightColor }) => {
  // Reveal content when bus reaches this stop
  const scale = useTransform(progress, [range[0] - 0.05, range[0], range[1]], [0, 1, 1]);
  const opacity = useTransform(progress, [range[0] - 0.05, range[0], range[1], range[1] + 0.05], [0, 1, 1, 0]);
  
  return (
    <motion.div 
      style={{ 
        scale, 
        opacity,
        y: "-50%",
        position: 'absolute',
        top: `${range[0] * 100}%`,
        [align === 'left' ? 'right' : 'left']: '50%',
        marginRight: align === 'left' ? '60px' : 'auto',
        marginLeft: align === 'right' ? '60px' : 'auto',
        width: '320px',
        background: 'rgba(18, 28, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: '20px',
        padding: '24px',
        zIndex: 10,
        boxShadow: `0 20px 40px rgba(0,0,0,0.5)`,
        transformOrigin: align === 'left' ? 'right center' : 'left center'
      }}
      className="journey-stop-card"
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: highlightColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '22px', color: '#F7F5EF', marginBottom: '10px', fontFamily: '"Baloo 2", sans-serif' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14.5px', color: '#8FA79A', lineHeight: '1.5' }}>
        {description}
      </p>
    </motion.div>
  );
};

export const JourneyLayout = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress for the bus movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map scroll progress to the Y position of the bus
  // Range is from 5vh to 95vh of the viewport height, tracking the line
  const busY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  // Path progress tracking for glowing line effect
  const pathHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} style={{ height: '600vh', position: 'relative', background: '#0B1410', padding: '0 20px' }}>
      
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        
        {/* Background gradient effects tied to scroll */}
        <motion.div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(14, 157, 92, 0.05), transparent 60%)',
          opacity: useTransform(smoothProgress, [0, 0.5, 1], [0.2, 0.8, 0.2]),
          pointerEvents: 'none'
        }} />

        {/* The Route Path (Background Line) */}
        <div style={{
          position: 'absolute',
          top: '10%', bottom: '10%',
          left: '50%', transform: 'translateX(-50%)',
          width: '4px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '4px'
        }}>
          {/* Glowing active path line */}
          <motion.div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%',
            height: pathHeight,
            background: 'linear-gradient(180deg, #0E9D5C, #F2B705)',
            borderRadius: '4px',
            boxShadow: '0 0 20px rgba(242, 183, 5, 0.5)'
          }} />
        </div>

        {/* The Animated Danfo Bus */}
        <motion.div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          x: '-50%', // center on line
          y: useTransform(busY, v => `calc(${v} * 80vh - 24px)`),
          zIndex: 20
        }}>
          <DanfoSVG />
        </motion.div>

        {/* The Stops */}
        <div style={{ position: 'absolute', top: '10%', bottom: '10%', width: '100%', maxWidth: '1180px', pointerEvents: 'none' }}>
          
          <Stop 
            progress={smoothProgress} range={[0.1, 0.25]} align="right"
            title="The Cash Chaos"
            description="₦82B lost to informal union levies. 75,000 buses running entirely on untraceable physical cash. Passengers constantly losing change. It stops here."
            icon={<span style={{fontSize:'24px', fontWeight:'800'}}>₦</span>}
            highlightColor="rgba(242, 183, 5, 0.2)"
          />

          <Stop 
            progress={smoothProgress} range={[0.25, 0.4]} align="left"
            title="One Wallet. Two Sides."
            description="Whether you're holding the wheel or scanning the code from the back seat, it's the exact same ecosystem. Scan, tap, pay instantly."
            icon={<Smartphone size={24} color="#0E9D5C" />}
            highlightColor="rgba(14, 157, 92, 0.2)"
          />

          <Stop 
            progress={smoothProgress} range={[0.4, 0.55]} align="right"
            title="Monthly Transit Wallet"
            description="Remove the hassle, stay on budget. Set aside your transport funds at the start of the month and never worry about finding cash on a Monday morning."
            icon={<Wallet size={24} color="#3B82F6" />}
            highlightColor="rgba(59, 130, 246, 0.2)"
          />

          <Stop 
            progress={smoothProgress} range={[0.55, 0.7]} align="left"
            title="Community Rides"
            description="Connect with your community. Find others going your way, ride together on shared routes, and split costs to save more every week."
            icon={<Users size={24} color="#F59E0B" />}
            highlightColor="rgba(245, 158, 11, 0.2)"
          />

          <Stop 
            progress={smoothProgress} range={[0.7, 0.85]} align="right"
            title="Ping for Ride"
            description="Instantly locate drivers heading in your specific direction. No more waiting endlessly at the bus stop hoping the right danfo shows up."
            icon={<MapPin size={24} color="#EC4899" />}
            highlightColor="rgba(236, 72, 153, 0.2)"
          />

          <Stop 
            progress={smoothProgress} range={[0.85, 1.0]} align="left"
            title="Save More. Earn More."
            description="A unified ecosystem where riders protect their budgets through community sharing, and drivers maximize their net income without middleman leakage."
            icon={<TrendingUp size={24} color="#10B981" />}
            highlightColor="rgba(16, 185, 129, 0.2)"
          />
        </div>
      </div>
    </div>
  );
};
