import React, { useState, useRef, useEffect } from 'react';

const DRIVER_STEPS = [
  {
    num: '1',
    title: 'Set your route',
    desc: 'GPS finds your starting point. Pick your destination, we handle the rest.'
  },
  {
    num: '2',
    title: 'Get paid instantly',
    desc: "Every fare lands the moment it's paid. No chasing cash, no disputed coins."
  },
  {
    num: '3',
    title: 'See your real net income',
    desc: 'Gross collected, minus fuel and levies — automatically, every single day.'
  }
];

const RIDER_STEPS = [
  {
    num: '1',
    title: 'Scan the code',
    desc: 'Point your camera at the code in the vehicle. Takes a second.'
  },
  {
    num: '2',
    title: 'Pick your stop',
    desc: 'Fares are set per stop — you always know exactly what you owe.'
  },
  {
    num: '3',
    title: 'Pay in one tap',
    desc: 'Instant, from your wallet balance. No change, no arguing, no delay.'
  }
];

export const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('driver');
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
    <section className="section dark reveal-up" id="how" ref={sectionRef}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-plain">HOW IT WORKS</span>
          <h2 className="section-title">One wallet. Two sides of the same fare.</h2>
        </div>
        
        <div className="how-tabs-container">
          <div className="how-tabs-nav">
            <button 
              className={`how-tab-btn driver ${activeTab === 'driver' ? 'active' : ''}`}
              onClick={() => setActiveTab('driver')}
            >
              For Drivers
            </button>
            <button 
              className={`how-tab-btn rider ${activeTab === 'rider' ? 'active' : ''}`}
              onClick={() => setActiveTab('rider')}
            >
              For Riders
            </button>
          </div>

          <div className="how-tab-content" key={activeTab}>
            <h3>{activeTab === 'driver' ? 'Know what you actually earn.' : 'Pay exact. Every time.'}</h3>
            <div className={`steps-grid ${activeTab}-content`}>
              {(activeTab === 'driver' ? DRIVER_STEPS : RIDER_STEPS).map((step) => (
                <div key={step.num} className="step-card">
                  <div className="step-num-large">{step.num}</div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
