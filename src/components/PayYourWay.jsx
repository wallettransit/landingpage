import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCode } from './QRCode';

const MODES = [
  {
    k: 'scan',
    live: true,
    tag: 'Live at launch',
    t: 'Scan',
    d: 'Point your camera at the code in the vehicle, pick your stop, and pay from your wallet. The fastest way to get going on day one.',
  },
  {
    k: 'tap',
    tag: 'Coming next',
    t: 'Tap',
    d: 'Touch your phone to a tap tag on the dashboard. No camera, no focus, no fumbling in a moving danfo.',
  },
  {
    k: 'dial',
    tag: 'Coming next',
    t: 'Dial',
    d: 'No smartphone or data? Dial a short code, pick your route and stop, and pay without opening an app.',
  },
  {
    k: 'auto',
    tag: 'Later',
    t: 'Auto',
    d: 'Board and go. OyaPay notices the vehicle you stepped into and asks you to confirm your stop from a single notification.',
  },
];

const VB = { w: 1000, h: 230 };
const TS = [0.05, 0.36, 0.64, 0.95];

export const PayYourWay = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const tabRefs = useRef([]);
  const arcRef = useRef(null);
  const userInteracted = useRef(false);
  const curPos = useRef(TS[0]);
  const rafRef = useRef(0);

  // Position tabs and glide dot along arc
  const glide = useCallback((toRatio) => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const length = path.getTotalLength();
    const from = curPos.current;
    const t0 = performance.now();
    const dur = reduce ? 1 : 650;

    cancelAnimationFrame(rafRef.current);

    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      curPos.current = from + (toRatio - from) * ease;
      const pt = path.getPointAtLength(length * curPos.current);
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);

      if (k < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, []);

  const selectTab = useCallback((idx, shouldFocus = false) => {
    setActiveIdx(idx);
    glide(TS[idx]);
    if (shouldFocus && tabRefs.current[idx]) {
      tabRefs.current[idx].focus();
    }
  }, [glide]);

  // Initial tab positioning on curve
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();

    tabRefs.current.forEach((btn, i) => {
      if (!btn) return;
      const pt = path.getPointAtLength(length * TS[i]);
      btn.style.left = `${(pt.x / VB.w) * 100}%`;
      btn.style.top = `${(pt.y / VB.h) * 100}%`;
    });

    const initPt = path.getPointAtLength(length * TS[0]);
    if (dotRef.current) {
      dotRef.current.setAttribute('cx', initPt.x);
      dotRef.current.setAttribute('cy', initPt.y);
    }
  }, []);

  // Gentle auto-tour
  useEffect(() => {
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let tourTimer = null;
    const arcEl = arcRef.current;
    if (!arcEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !userInteracted.current) {
            if (!tourTimer) {
              tourTimer = setInterval(() => {
                if (userInteracted.current) {
                  clearInterval(tourTimer);
                  return;
                }
                setActiveIdx((prev) => {
                  const next = (prev + 1) % 4;
                  glide(TS[next]);
                  return next;
                });
              }, 4200);
            }
          } else {
            clearInterval(tourTimer);
            tourTimer = null;
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(arcEl);
    return () => {
      clearInterval(tourTimer);
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [glide]);

  const handleKeyDown = (e, i) => {
    userInteracted.current = true;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectTab((i + 1) % 4, true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectTab((i + 3) % 4, true);
    }
  };

  const handleTabClick = (i) => {
    userInteracted.current = true;
    selectTab(i);
  };

  const activeMode = MODES[activeIdx];

  return (
    <section className="pay" id="pay">
      <div className="wrap">
        <h2 className="disp big rv">
          Pay <span className="em">your way</span>
        </h2>
        <p className="lede rv" style={{ '--d': '.1s' }}>
          Four ways to settle a fare, one wallet behind all of them. Pick the one that fits your phone and your journey.
        </p>

        <div className="pay-stage">
          <div className="phone rv" style={{ '--d': '.15s' }}>
            <div className="notch"></div>
            <div className="screen">
              {/* Scan Mode */}
              <div className={`mode ${activeMode.k === 'scan' ? 'on' : ''}`} data-mode="scan">
                <div className="sc-top">
                  <span>Scan to pay</span>
                  <span>OyaPay</span>
                </div>
                <div className="vf">
                  <i></i><i></i><i></i><i></i>
                  <div className="qr">
                    <QRCode n={21} />
                  </div>
                  <div className="line"></div>
                </div>
                <div className="rchip">
                  <span>Route detected</span>
                  <b>IKORODU → TBS</b>
                </div>
              </div>

              {/* Tap Mode */}
              <div className={`mode ${activeMode.k === 'tap' ? 'on' : ''}`} data-mode="tap">
                <div className="sc-top">
                  <span>Tap to pay</span>
                  <span>OyaPay</span>
                </div>
                <div className="ripple-wrap">
                  <span className="ring"></span>
                  <span className="ring"></span>
                  <span className="ring"></span>
                  <div className="core">
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0B1410" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M8 7a7 7 0 010 10M12 4.5a11 11 0 010 15M16 2a15 15 0 010 20" />
                    </svg>
                  </div>
                  <div className="pop">₦250 paid ✓</div>
                </div>
                <div className="rchip">
                  <span>Hold near the tag</span>
                  <b>LND 412 XA</b>
                </div>
              </div>

              {/* Dial Mode */}
              <div className={`mode ${activeMode.k === 'dial' ? 'on' : ''}`} data-mode="dial">
                <div className="sc-top">
                  <span>Dial to pay</span>
                  <span>No data needed</span>
                </div>
                <div className="disp-line">
                  <span className="typed">*000*21#</span>
                </div>
                <div className="keys">
                  <span>1</span><span>2</span><span>3</span>
                  <span>4</span><span>5</span><span>6</span>
                  <span>7</span><span>8</span><span>9</span>
                  <span>*</span><span>0</span><span>#</span>
                </div>
                <div className="confirm later">Pay ₦250 → Maryland</div>
              </div>

              {/* Auto Mode */}
              <div className={`mode ${activeMode.k === 'auto' ? 'on' : ''}`} data-mode="auto">
                <div className="sc-top">
                  <span>You just boarded</span>
                  <span>Nearby</span>
                </div>
                <div className="pulse-wrap">
                  <span className="ring"></span>
                  <span className="ring"></span>
                  <div className="core"></div>
                </div>
                <div className="rchip">
                  <span>Vehicle detected</span>
                  <b>LND 412 XA</b>
                </div>
                <div className="row" style={{ marginTop: '12px' }}>
                  <div>
                    Ikorodu → TBS<small>Confirm your stop</small>
                  </div>
                  <b>₦250</b>
                </div>
                <div className="confirm">Confirm</div>
              </div>
            </div>
          </div>

          {/* Interactive Arc */}
          <div className="arc" id="arc" ref={arcRef} role="tablist" aria-label="Ways to pay">
            <svg viewBox="0 0 1000 230" aria-hidden="true">
              <path
                id="arcPath"
                ref={pathRef}
                d="M 60 50 Q 500 270 940 50"
                fill="none"
                stroke="#26332C"
                strokeWidth="3"
                strokeDasharray="3 12"
                strokeLinecap="round"
              />
              <circle id="arcDot" ref={dotRef} r="9" cx="60" cy="50" fill="#F2B705" stroke="#0B1410" strokeWidth="3" />
            </svg>

            {/* Scan Tab */}
            <button
              className="arc-tab"
              role="tab"
              aria-selected={activeIdx === 0}
              tabIndex={activeIdx === 0 ? 0 : -1}
              ref={(el) => (tabRefs.current[0] = el)}
              onClick={() => handleTabClick(0)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
              id="tab-scan"
            >
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2M7 12h10" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="lb">Scan</span>
            </button>

            {/* Tap Tab */}
            <button
              className="arc-tab"
              role="tab"
              aria-selected={activeIdx === 1}
              tabIndex={activeIdx === 1 ? 0 : -1}
              ref={(el) => (tabRefs.current[1] = el)}
              onClick={() => handleTabClick(1)}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              id="tab-tap"
            >
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M8 7a7 7 0 010 10M12 4.5a11 11 0 010 15M16 2a15 15 0 010 20" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="lb">Tap</span>
            </button>

            {/* Dial Tab */}
            <button
              className="arc-tab"
              role="tab"
              aria-selected={activeIdx === 2}
              tabIndex={activeIdx === 2 ? 0 : -1}
              ref={(el) => (tabRefs.current[2] = el)}
              onClick={() => handleTabClick(2)}
              onKeyDown={(e) => handleKeyDown(e, 2)}
              id="tab-dial"
            >
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="6" cy="6" r="1.4" fill="currentColor" />
                  <circle cx="12" cy="6" r="1.4" fill="currentColor" />
                  <circle cx="18" cy="6" r="1.4" fill="currentColor" />
                  <circle cx="6" cy="12" r="1.4" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.4" fill="currentColor" />
                  <circle cx="18" cy="12" r="1.4" fill="currentColor" />
                  <circle cx="12" cy="18" r="1.4" fill="currentColor" />
                </svg>
              </span>
              <span className="lb">Dial</span>
            </button>

            {/* Auto Tab */}
            <button
              className="arc-tab"
              role="tab"
              aria-selected={activeIdx === 3}
              tabIndex={activeIdx === 3 ? 0 : -1}
              ref={(el) => (tabRefs.current[3] = el)}
              onClick={() => handleTabClick(3)}
              onKeyDown={(e) => handleKeyDown(e, 3)}
              id="tab-auto"
            >
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M7 7l10 10-5 4V3l5 4L7 17" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="lb">Auto</span>
            </button>
          </div>

          <div className="mode-desc" id="modeDesc" aria-live="polite">
            <span className={`tag ${activeMode.live ? 'live' : ''}`}>{activeMode.tag}</span>
            <h3>{activeMode.t}</h3>
            <p>{activeMode.d}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
