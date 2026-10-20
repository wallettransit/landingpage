import React, { useState, useEffect, useRef } from 'react';
import { QRCode } from './QRCode';

export const Hero = () => {
  const [heroStep, setHeroStep] = useState(0);
  const stageRef = useRef(null);
  const phoneRef = useRef(null);
  const chipRefs = useRef([]);
  const r1Ref = useRef(null);
  const [stops, setStops] = useState([]);

  // Calculate stop markers along the wave curve
  useEffect(() => {
    if (r1Ref.current) {
      const path = r1Ref.current;
      const length = path.getTotalLength();
      const points = [0.12, 0.34, 0.58, 0.8].map((t) => {
        const pt = path.getPointAtLength(length * t);
        return { cx: pt.x, cy: pt.y };
      });
      setStops(points);
    }
  }, []);

  // Phone stepper animation
  useEffect(() => {
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let timer = null;
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!timer) {
              timer = setInterval(() => {
                setHeroStep((prev) => (prev + 1) % 3);
              }, 2800);
            }
          } else {
            clearInterval(timer);
            timer = null;
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(stage);
    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  // Mouse / Pointer Parallax
  useEffect(() => {
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let isVisible = true;

    const handlePointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const depths = [0.7, 1.0, 0.45, 0.6];

    const frame = () => {
      tx += (mx - tx) * 0.07;
      ty += (my - ty) * 0.07;
      const sy = Math.min(window.scrollY, 900);

      chipRefs.current.forEach((el, idx) => {
        if (!el) return;
        const d = depths[idx] || 0.5;
        const xPos = tx * d * 38;
        const yPos = ty * d * 22 - sy * d * 0.1;
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
      });

      if (phoneRef.current) {
        phoneRef.current.style.transform = `rotateY(${tx * 9}deg) rotateX(${-ty * 7}deg)`;
      }

      if (isVisible) {
        raf = requestAnimationFrame(frame);
      }
    };

    const stageObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        isVisible = e.isIntersecting;
        if (isVisible && !raf) {
          raf = requestAnimationFrame(frame);
        }
      });
    }, { threshold: 0 });

    if (stageRef.current) stageObserver.observe(stageRef.current);
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      stageObserver.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div className="badges rv">
          <span className="pill">
            <i className="dot"></i>Starting in Lagos
          </span>
          <span className="pill">Drivers first</span>
          <span className="pill">Danfo · Keke</span>
        </div>
        <h1 className="disp hero-h">
          <span className="w" style={{ '--i': 0 }}>Get</span>{' '}
          <span className="w" style={{ '--i': 1 }}>there.</span>
          <br />
          <span className="w ink" style={{ '--i': 2 }}>Get</span>{' '}
          <span className="w ink" style={{ '--i': 3 }}>paid.</span>
        </h1>
        <p className="hero-sub rv" style={{ '--d': '.5s' }}>
          Scan to pay your fare. Get paid the second someone pays you. No cash, no lost change, no wahala.
        </p>
        <div className="hero-cta rv" style={{ '--d': '.65s' }}>
          <a className="btn btn-ink btn-lg" href="#join">
            Join the waitlist
          </a>
          <a className="link" href="#pay">
            See how it works ↓
          </a>
        </div>
      </div>

      <div className="stage" id="heroStage" ref={stageRef}>
        <svg
          className="wave wave-back"
          viewBox="0 0 1600 760"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g fill="none" stroke="rgba(247,245,239,.26)" strokeWidth="2.4">
            <path
              id="r1"
              ref={r1Ref}
              d="M-80 600 C 220 470, 480 720, 800 570 S 1380 400, 1700 540"
            />
            <path d="M-80 540 C 220 410, 480 660, 800 510 S 1380 340, 1700 480" />
            <path d="M-80 480 C 220 350, 480 600, 800 450 S 1380 280, 1700 420" />
            <path d="M-80 420 C 220 290, 480 540, 800 390 S 1380 220, 1700 360" />
            <path d="M-80 360 C 220 230, 480 480, 800 330 S 1380 160, 1700 300" />
            <path d="M-80 300 C 220 170, 480 420, 800 270 S 1380 100, 1700 240" />
            <path d="M-80 660 C 220 530, 480 780, 800 630 S 1380 460, 1700 600" />
          </g>

          <g>
            {stops.map((pt, i) => (
              <circle
                key={i}
                cx={pt.cx}
                cy={pt.cy}
                r="8"
                fill="#F7F5EF"
                stroke="#0B1410"
                strokeWidth="3.5"
              />
            ))}
          </g>

          <g>
            <circle r="11" fill="#F2B705" stroke="#0B1410" strokeWidth="4">
              <animateMotion dur="15s" repeatCount="indefinite">
                <mpath href="#r1" />
              </animateMotion>
            </circle>
          </g>
        </svg>

        {/* Floating Chips */}
        <div className="px c1" ref={(el) => (chipRefs.current[0] = el)}>
          <div className="chip">
            <i>₦</i>
            <div>
              <strong>₦250 received</strong>
              <span>Maryland · just now</span>
            </div>
          </div>
        </div>

        <div className="px c2" ref={(el) => (chipRefs.current[1] = el)}>
          <div className="chip">
            <i className="g">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1410" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
            </i>
            <div>
              <strong>Exact fare</strong>
              <span>No change needed</span>
            </div>
          </div>
        </div>

        <div className="px c3" ref={(el) => (chipRefs.current[2] = el)}>
          <div className="chip">
            <i className="k">₦</i>
            <div>
              <strong>Net today</strong>
              <span>₦14,200 after fuel &amp; levies</span>
            </div>
          </div>
        </div>

        <div className="px c4" ref={(el) => (chipRefs.current[3] = el)}>
          <div className="chip">
            <i className="k">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2B705" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </i>
            <div>
              <strong>Ikorodu → TBS</strong>
              <span>Your usual route</span>
            </div>
          </div>
        </div>

        {/* Center Hero Phone */}
        <div className="hero-phone">
          <div className="phone" ref={phoneRef}>
            <div className="notch"></div>
            <div className="screen stepper" data-step={heroStep}>
              {/* Scene 0: Scan */}
              <div className={`scene s0 ${heroStep === 0 ? 'active' : ''}`}>
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

              {/* Scene 1: Stop Selection */}
              <div className={`scene s1 ${heroStep === 1 ? 'active' : ''}`}>
                <div className="ttl">
                  Where are you<br />dropping?
                </div>
                <div className="row">
                  <div>
                    Ojota<small>3 stops away</small>
                  </div>
                  <b>₦150</b>
                </div>
                <div className="row sel">
                  <div>
                    Maryland<small>6 stops away</small>
                  </div>
                  <b>₦250</b>
                </div>
                <div className="row">
                  <div>
                    Anthony<small>8 stops away</small>
                  </div>
                  <b>₦300</b>
                </div>
                <div className="row">
                  <div>
                    TBS (end)<small>11 stops away</small>
                  </div>
                  <b>₦400</b>
                </div>
                <div className="pbtn">Pay ₦250</div>
              </div>

              {/* Scene 2: Success Ticket */}
              <div className={`scene s2 ${heroStep === 2 ? 'active' : ''}`}>
                <div className="check">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0B1410" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                </div>
                <div className="amt">₦250</div>
                <div className="amt-sub">paid · instant</div>
                <div className="ticket">
                  <h5>Ikorodu → Maryland</h5>
                  <p>Danfo · LND 412 XA · 7:42 AM</p>
                  <div className="tf">
                    <span>Wallet balance</span>
                    <b>₦1,340</b>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="pdots">
                <i className={heroStep === 0 ? 'active' : ''}></i>
                <i className={heroStep === 1 ? 'active' : ''}></i>
                <i className={heroStep === 2 ? 'active' : ''}></i>
              </div>
            </div>
          </div>
        </div>

        <svg className="wave wave-front" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 120 C 260 30, 560 190, 860 100 S 1380 20, 1600 90 L1600 200 L0 200 Z" fill="#0B1410" />
        </svg>
      </div>
    </section>
  );
};
