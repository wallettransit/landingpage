import React, { useRef, useEffect } from 'react';
import { Bus, Smartphone, Banknote } from 'lucide-react';

export const WhyOyaPay = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          sectionRef.current.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section light reveal-up" id="trust" ref={sectionRef}>
      <div className="wrap">
        <div className="diff-wrap">
          <div className="diff-copy">
            <span className="eyebrow-plain">WHY OYAPAY</span>
            <h2 className="section-title" style={{ marginBottom: '32px' }}>
              Built for the buses nobody else is building for.
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', background: 'var(--paper-2)', borderRadius: '12px' }}>
                <Bus size={24} color="var(--emerald)" />
              </div>
              <p>
                Regulated transit apps cover BRT and rail. <strong>They stop there.</strong> Danfo and keke the vehicles most Lagosians actually ride, every day, are still entirely cash-based.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'var(--paper-2)', borderRadius: '12px' }}>
                <Smartphone size={24} color="var(--amber)" />
              </div>
              <p>
                OyaPay doesn't ask drivers to change vehicles, routes, or how they already work.{' '}
                <strong>Same danfo, same route, same passengers</strong> we just replace the moment money changes hands.
              </p>
            </div>
          </div>
          <div className="trust-card">
            <div className="coin">₦</div>
            <h4>We ask for your bank details once.</h4>
            <p>
              The day you actually have money to withdraw, not before. No forms, no ID, no waiting, just to get started.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
