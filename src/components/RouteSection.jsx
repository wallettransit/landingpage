import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../services/sound';

const TABS = [
  { id: 'p-wallet', label: 'Wallet' },
  { id: 'p-earn', label: 'Earnings' },
  { id: 'p-budget', label: 'Budget' },
];

export const RouteSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [disputeStep, setDisputeStep] = useState(0);
  const btnRefs = useRef([]);
  const indRef = useRef(null);
  const ctlRef = useRef(null);

  // Position indicator pill
  const updateIndicator = (idx) => {
    const btn = btnRefs.current[idx];
    const ind = indRef.current;
    if (btn && ind) {
      ind.style.width = `${btn.offsetWidth}px`;
      ind.style.transform = `translateX(${btn.offsetLeft}px)`;
    }
  };

  useEffect(() => {
    updateIndicator(activeTab);
    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Dispute Stepper
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisputeStep(3);
      return;
    }

    let timer = null;
    const el = ctlRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!timer) {
              timer = setInterval(() => {
                setDisputeStep((s) => (s + 1) % 4);
              }, 1700);
            }
          } else {
            clearInterval(timer);
            timer = null;
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  const handleTabClick = (idx) => {
    sound.playTap();
    setActiveTab(idx);
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (i + 1) % TABS.length;
      handleTabClick(next);
      btnRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (i + TABS.length - 1) % TABS.length;
      handleTabClick(prev);
      btnRefs.current[prev]?.focus();
    }
  };

  return (
    <section className="route" id="route">
      <div className="wrap">
        <div className="hd">
          <h2 className="disp sec-h split">
            Built around your <span className="em">daily route</span>
          </h2>
          <p className="rv" style={{ '--d': '.1s' }}>
            From the first fare of the morning to the last cash-out of the night, it's all in one place.
          </p>

          {/* Segmented Tab Controls */}
          <div className="seg rv" id="seg" role="tablist" aria-label="Product areas" style={{ '--d': '.15s' }}>
            <span className="ind" ref={indRef} aria-hidden="true" />
            {TABS.map((tab, idx) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === idx}
                tabIndex={activeTab === idx ? 0 : -1}
                ref={(el) => (btnRefs.current[idx] = el)}
                onClick={() => handleTabClick(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                data-p={tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel 1: Wallet */}
        <div className={`panel ${activeTab === 0 ? 'on' : ''}`} id="p-wallet" role="tabpanel">
          <div>
            <h3>Keep every fare in one place.</h3>
            <p>
              Top up once, ride many times. One small top-up covers a week of trips, so you're not paying a fee on every single fare.
            </p>
          </div>
          <div className="viz spot">
            <div className="bal">
              <small>Wallet balance</small>
              <b data-count="1340" data-pre="₦">
                ₦1,340
              </b>
              <div className="chips2">
                <span>₦1,000</span>
                <span className="sel">₦2,000</span>
                <span>₦5,000</span>
              </div>
            </div>
            <ul className="hist">
              <li>
                <div>
                  Ikorodu → Maryland<small>Today · 7:42 AM</small>
                </div>
                <b className="o">-₦250</b>
              </li>
              <li>
                <div>
                  Maryland → Yaba<small>Yesterday · 6:10 PM</small>
                </div>
                <b className="o">-₦200</b>
              </li>
              <li>
                <div>
                  Wallet top-up<small>Monday · 8:05 AM</small>
                </div>
                <b>+₦2,000</b>
              </li>
            </ul>
          </div>
        </div>

        {/* Panel 2: Earnings */}
        <div className={`panel ${activeTab === 1 ? 'on' : ''}`} id="p-earn" role="tabpanel">
          <div>
            <h3>See what you really took home.</h3>
            <p>
              Gross collected, minus fuel and daily levies, adds up to your real net income, worked out for you at the end of every day.
            </p>
          </div>
          <div className="viz spot">
            <div className="bal" style={{ background: 'linear-gradient(135deg, var(--ink), #16251d)' }}>
              <small style={{ color: 'var(--mist)' }}>Net today</small>
              <b style={{ color: 'var(--amber)' }} data-count="14240" data-pre="₦">
                ₦14,240
              </b>
              <small style={{ color: 'var(--mist)' }}>72 fares · 7:42 AM - 9:15 PM</small>
            </div>
            <div className="bar">
              <div className="bl">
                <span>Gross collected</span>
                <span>₦19,440</span>
              </div>
              <div className="tr">
                <div className="fl" style={{ width: '100%', background: 'var(--em)' }} />
              </div>
            </div>
            <div className="bar">
              <div className="bl">
                <span>Levies</span>
                <span>-₦3,600</span>
              </div>
              <div className="tr">
                <div className="fl" style={{ width: '18.5%', background: '#C1552C', animationDelay: '.15s' }} />
              </div>
            </div>
            <div className="bar">
              <div className="bl">
                <span>Fuel</span>
                <span>-₦1,600</span>
              </div>
              <div className="tr">
                <div className="fl" style={{ width: '8.2%', background: 'var(--amber)', animationDelay: '.3s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Budget */}
        <div className={`panel ${activeTab === 2 ? 'on' : ''}`} id="p-budget" role="tabpanel">
          <div>
            <h3>Know your monthly transport spend.</h3>
            <p>
              Your ride history becomes your transport budget automatically. A calm heads-up as you near your target, and never a block on a fare.
            </p>
          </div>
          <div className="viz spot">
            <div className="ring-wrap">
              <svg viewBox="0 0 160 160" aria-hidden="true">
                <circle className="bg" cx="80" cy="80" r="70" fill="none" strokeWidth="16" />
                <circle className="fg" cx="80" cy="80" r="70" fill="none" strokeWidth="16" />
              </svg>
              <div>
                <b>₦12,800</b>
                <span>of ₦20,000 this month</span>
                <br />
                <span style={{ color: 'var(--em-d)', fontWeight: 700 }}>₦7,200 left · 9 days to go</span>
              </div>
            </div>
            <div className="bar">
              <div className="bl">
                <span>Week 1</span>
                <span>₦3,400</span>
              </div>
              <div className="tr">
                <div className="fl" style={{ width: '85%', background: 'var(--em)' }} />
              </div>
            </div>
            <div className="bar">
              <div className="bl">
                <span>Week 2</span>
                <span>₦3,900</span>
              </div>
              <div className="tr">
                <div className="fl" style={{ width: '98%', background: 'var(--em)', animationDelay: '.12s' }} />
              </div>
            </div>
            <div className="bar">
              <div className="bl">
                <span>Week 3</span>
                <span>₦3,100</span>
              </div>
              <div className="tr">
                <div className="fl" style={{ width: '78%', background: 'var(--em)', animationDelay: '.24s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Always in control: Dispute stepper */}
        <div className="ctl rv" ref={ctlRef}>
          <div>
            <span className="tag">Always in control</span>
            <h3>Wrong fare? Sorted in minutes.</h3>
            <p>
              Raise a dispute from your receipt. The driver confirms or rejects it inside a short window, and an approved refund goes straight back to your wallet.
            </p>
          </div>
          <ul className="tl stepper" data-step={disputeStep} aria-label="How a dispute is resolved">
            <li>
              <i>1</i>
              <div>
                <strong>You raise it</strong>
                <span>Wrong stop charged on your receipt</span>
              </div>
            </li>
            <li>
              <i>2</i>
              <div>
                <strong>Driver is notified</strong>
                <span>Straight away, with the stop you claimed</span>
              </div>
            </li>
            <li>
              <i>3</i>
              <div>
                <strong>Driver confirms</strong>
                <span>Inside the short response window</span>
              </div>
            </li>
            <li>
              <i>4</i>
              <div>
                <strong>Refund lands</strong>
                <span>Back in your wallet, nothing to chase</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Coming soon */}
        <div className="soon">
          <div className="sc rv spot">
            <span className="tag">Coming soon</span>
            <h4>Short of fare? A safety net.</h4>
            <p>
              A small, capped advance for the day you're caught short mid-journey, repaid from your next top-up. We'll share details before it launches.
            </p>
          </div>
          <div className="sc rv spot" style={{ '--d': '.1s' }}>
            <span className="tag">Coming soon</span>
            <h4>Find people moving your way.</h4>
            <p>
              Connect with riders and drivers on your corridor, always opt-in, with no phone numbers shared and payment staying inside the app.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RouteSection;
