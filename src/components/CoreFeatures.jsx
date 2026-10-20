import React, { useRef, useEffect } from 'react';
import { Wallet, Users, MapPin, TrendingUp } from 'lucide-react';

export const CoreFeatures = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          sectionRef.current.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section light reveal-up" id="features" ref={sectionRef}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-plain">MORE THAN PAYMENTS</span>
          <h2 className="section-title">Built to move you forward.</h2>
        </div>
        
        <div className="bento-grid">
          {/* Card 1: Wallet (Large) */}
          <div className="bento-card bento-large">
            <div className="bento-icon-wrapper wallet-bg">
              <Wallet size={32} color="var(--emerald)" />
            </div>
            <div className="bento-content">
              <h3>Monthly Transit Wallet</h3>
              <p>Remove the hassle, stay on budget. Set aside your monthly transport funds and never worry about having cash when you need to move.</p>
            </div>
          </div>

          {/* Card 2: Community Rides (Medium) */}
          <div className="bento-card">
            <div className="bento-icon-wrapper community-bg">
              <Users size={28} color="var(--amber)" />
            </div>
            <div className="bento-content">
              <h3>Community Rides</h3>
              <p>Connect with your community. Ride together on shared routes and split costs to save more every week.</p>
            </div>
          </div>

          {/* Card 3: Ping for Ride (Medium) */}
          <div className="bento-card">
            <div className="bento-icon-wrapper ping-bg">
              <MapPin size={28} color="#4F46E5" />
            </div>
            <div className="bento-content">
              <h3>Ping for Ride</h3>
              <p>Find a driver going your way instantly. Connect with drivers heading in your direction and skip the wait.</p>
            </div>
          </div>

          {/* Card 4: Save & Earn (Wide) */}
          <div className="bento-card bento-wide">
            <div className="bento-icon-wrapper earn-bg">
              <TrendingUp size={32} color="#059669" />
            </div>
            <div className="bento-content">
              <h3>Save More, Earn More</h3>
              <p>A unified ecosystem where riders save money through shared routes, and drivers earn more through consistent, direct digital payments without middleman leakage.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
