import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const WaitlistCTA = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('driver'); // 'driver' | 'rider'
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
  };

  return (
    <section className="cta-section reveal-up" id="join" ref={sectionRef}>
      <div className="wrap">
        <span className="eyebrow" style={{ opacity: 1, animation: 'none' }}>
          <span className="dot"></span>
          STARTING IN LAGOS
        </span>
        <h2>Oya, let's go.</h2>
        <p className="cta-copy">
          Be first in line when OyaPay opens in your corridor — drivers and riders both.
        </p>

        {submitted ? (
          <div className="form-success-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 color="#0E9D5C" size={24} />
              <h3 className="form-success-title" style={{ margin: 0 }}>You're on the list!</h3>
            </div>
            <p className="form-success-sub">
              We saved your spot as a <strong>{role === 'driver' ? 'Driver' : 'Rider'}</strong> ({email}). We'll reach out before launch.
            </p>
          </div>
        ) : (
          <div>
            <div className="role-selector">
              <button
                type="button"
                className={`role-tab ${role === 'driver' ? 'active' : ''}`}
                onClick={() => setRole('driver')}
              >
                I am a Driver
              </button>
              <button
                type="button"
                className={`role-tab ${role === 'rider' ? 'active' : ''}`}
                onClick={() => setRole('rider')}
              >
                I am a Passenger / Rider
              </button>
            </div>

            <form className="email-form" onSubmit={handleSubmit} noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(false);
                }}
                className={error ? 'input-error' : ''}
                placeholder="your@email.com"
                required
                aria-label="Email address"
              />
              <button type="submit" className="btn btn-emerald">
                Notify me <ArrowRight size={16} />
              </button>
            </form>
          </div>
        )}

        <p className="cta-note">Drivers first. Riders right after.</p>
      </div>
    </section>
  );
};
