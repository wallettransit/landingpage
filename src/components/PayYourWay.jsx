import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCode } from './QRCode';
import { sound } from '../services/sound';

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

const RATIOS = [0.05, 0.36, 0.64, 0.95];

export const PayYourWay = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const tabRefs = useRef([]);
  const arcRef = useRef(null);
  const curPos = useRef(RATIOS[0]);
  const rafRef = useRef(0);

  // Position indicator dot and tab elements along the SVG quadratic arc curve
  const glide = useCallback((toRatio) => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    cancelAnimationFrame(rafRef.current);
    const from = curPos.current;
    const t0 = performance.now();
    const dur = 550;

    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      const cur = from + (toRatio - from) * ease;
      curPos.current = cur;

      try {
        const total = path.getTotalLength();
        if (total > 0) {
          const pt = path.getPointAtLength(total * cur);
          dot.setAttribute('cx', pt.x.toFixed(1));
          dot.setAttribute('cy', pt.y.toFixed(1));
        }
      } catch (e) {}

      if (k < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const placeTabs = useCallback(() => {
    const path = pathRef.current;
    const arc = arcRef.current;
    if (!path || !arc) return;

    if (window.innerWidth <= 820) {
      tabRefs.current.forEach((tab) => {
        if (tab) {
          tab.style.left = '';
          tab.style.top = '';
        }
      });
      return;
    }

    try {
      const total = path.getTotalLength();
      if (!total || total <= 0) return;

      tabRefs.current.forEach((tab, i) => {
        if (!tab) return;
        const pt = path.getPointAtLength(total * RATIOS[i]);
        tab.style.left = ((pt.x / 1000) * 100).toFixed(2) + '%';
        tab.style.top = ((pt.y / 230) * 100).toFixed(2) + '%';
      });

      const activePt = path.getPointAtLength(total * RATIOS[activeIdx]);
      if (dotRef.current) {
        dotRef.current.setAttribute('cx', activePt.x.toFixed(1));
        dotRef.current.setAttribute('cy', activePt.y.toFixed(1));
      }
    } catch (err) {}
  }, [activeIdx]);

  useEffect(() => {
    placeTabs();
    window.addEventListener('resize', placeTabs);
    return () => {
      window.removeEventListener('resize', placeTabs);
      cancelAnimationFrame(rafRef.current);
    };
  }, [placeTabs]);

  const handleSelectMode = (idx) => {
    setActiveIdx(idx);
    glide(RATIOS[idx]);
    sound.playTap();
  };

  const mode = MODES[activeIdx];

  return (
    <section className="pay" id="pay">
      <div className="wrap">
        <h2 className="disp big split">
          Pay <span className="em">your way</span>
        </h2>
        <p className="lede rv" style={{ '--d': '.1s' }}>
          Four ways to settle a fare, one wallet behind all of them. Pick the one that fits your phone and your journey.
        </p>

        <div className="pay-stage">
          <div className="phone rv" style={{ '--d': '.15s' }}>
            <div className="notch"></div>
            <div className="screen">
              {/* Scan mode */}
              <div className={`mode ${mode.k === 'scan' ? 'on' : ''}`} data-mode="scan">
                <div className="sc-top">
                  <span>Scan to pay</span>
                  <span>OyaPay</span>
                </div>
                <div className="vf">
                  <i></i><i></i><i></i><i></i>
                  <div className="qr">
                    <QRCode value="21" size={150} />
                  </div>
                  <div className="line"></div>
                </div>
                <div className="rchip">
                  <span>Route detected</span>
                  <b>IKORODU → TBS</b>
                </div>
              </div>

              {/* Tap mode */}
              <div className={`mode ${mode.k === 'tap' ? 'on' : ''}`} data-mode="tap">
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

              {/* Dial mode */}
              <div className={`mode ${mode.k === 'dial' ? 'on' : ''}`} data-mode="dial">
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

              {/* Auto mode */}
              <div className={`mode ${mode.k === 'auto' ? 'on' : ''}`} data-mode="auto">
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
                <div className="row" style={{ marginTop: 12 }}>
                  <div>
                    Ikorodu → TBS
                    <small>Confirm your stop</small>
                  </div>
                  <b>₦250</b>
                </div>
                <div className="confirm">Confirm</div>
              </div>
            </div>
          </div>

          <div className="arc" id="arc" ref={arcRef} role="tablist" aria-label="Ways to pay">
            <svg viewBox="0 0 1000 230" aria-hidden="true">
              <path
                id="arcPath"
                ref={pathRef}
                d="M 60 50 Q 500 270 940 50"
                fill="none"
                stroke="#2f4037"
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
              id="tab-scan"
              ref={(el) => (tabRefs.current[0] = el)}
              onClick={() => handleSelectMode(0)}
            >
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2M7 12h10" />
                </svg>
              </span>
              <span className="lb">Scan</span>
            </button>

            {/* Tap Tab */}
            <button
              className="arc-tab"
              role="tab"
              aria-selected={activeIdx === 1}
              id="tab-tap"
              ref={(el) => (tabRefs.current[1] = el)}
              onClick={() => handleSelectMode(1)}
            >
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M8 7a7 7 0 010 10M12 4.5a11 11 0 010 15M16 2a15 15 0 010 20" />
                </svg>
              </span>
              <span className="lb">Tap</span>
            </button>

            {/* Dial Tab */}
            <button
              className="arc-tab"
              role="tab"
              aria-selected={activeIdx === 2}
              id="tab-dial"
              ref={(el) => (tabRefs.current[2] = el)}
              onClick={() => handleSelectMode(2)}
            >
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <circle cx="6" cy="6" r="1.4" />
                  <circle cx="12" cy="6" r="1.4" />
                  <circle cx="18" cy="6" r="1.4" />
                  <circle cx="6" cy="12" r="1.4" />
                  <circle cx="12" cy="12" r="1.4" />
                  <circle cx="18" cy="12" r="1.4" />
                  <circle cx="12" cy="18" r="1.4" />
                </svg>
              </span>
              <span className="lb">Dial</span>
            </button>

            {/* Auto Tab */}
            <button
              className="arc-tab"
              role="tab"
              aria-selected={activeIdx === 3}
              id="tab-auto"
              ref={(el) => (tabRefs.current[3] = el)}
              onClick={() => handleSelectMode(3)}
            >
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M7 7l10 10-5 4V3l5 4L7 17" />
                </svg>
              </span>
              <span className="lb">Auto</span>
            </button>
          </div>

          <div className="mode-desc" id="modeDesc" aria-live="polite">
            <span className={`tag ${mode.live ? 'live' : ''}`}>{mode.tag}</span>
            <h3>{mode.t} to pay</h3>
            <p>{mode.d}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PayYourWay;
