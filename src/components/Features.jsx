import React, { useState, useEffect, useRef } from 'react';

export const Features = () => {
  const [step1, setStep1] = useState(0);
  const [step2, setStep2] = useState(0);
  const [step3, setStep3] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setStep1(3);
      setStep2(2);
      setStep3(3);
      return;
    }

    let t1, t2, t3;
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!t1) t1 = setInterval(() => setStep1((s) => (s + 1) % 4), 1500);
            if (!t2) t2 = setInterval(() => setStep2((s) => (s + 1) % 3), 1700);
            if (!t3) t3 = setInterval(() => setStep3((s) => (s + 1) % 4), 1600);
          } else {
            clearInterval(t1);
            clearInterval(t2);
            clearInterval(t3);
            t1 = t2 = t3 = null;
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="moves" id="moves" ref={sectionRef}>
      <div className="wrap">
        <h2 className="disp sec-h split">
          Your fare moves even <span className="em">better</span> with OyaPay.
        </h2>

        <div className="grid3">
          {/* Card 1: Instant payment toast */}
          <article className="fcard rv spot">
            <div className="mini m1 stepper" data-step={step1} aria-hidden="true">
              <div className="tot">
                Today
                <b className="t0">₦0</b>
                <b className="t1">₦150</b>
                <b className="t2">₦400</b>
                <b className="t3">₦700</b>
              </div>
              <div className="toast k1">
                <i>₦</i>
                <div>
                  <strong>₦150 received</strong>
                  <span>Ojota · just now</span>
                </div>
              </div>
              <div className="toast k2">
                <i>₦</i>
                <div>
                  <strong>₦250 received</strong>
                  <span>Maryland · just now</span>
                </div>
              </div>
              <div className="toast k3">
                <i>₦</i>
                <div>
                  <strong>₦300 received</strong>
                  <span>Anthony · just now</span>
                </div>
              </div>
            </div>
            <div className="txt">
              <h3>Paid the second they pay</h3>
              <p>
                Every fare buzzes your phone the moment it lands. Your running total updates itself, so you never count coins at the end of the day.
              </p>
            </div>
          </article>

          {/* Card 2: Usual routes */}
          <article className="fcard rv spot" style={{ '--d': '.1s' }}>
            <div className="mini m2 stepper" data-step={step2} aria-hidden="true">
              <small>Your usual routes</small>
              <div className="qr2">
                <span>Ikorodu → TBS</span>
                <em>Ready</em>
              </div>
              <div className="qr2">
                <span>Ojota → Yaba</span>
                <em>Ready</em>
              </div>
              <div className="qr2">
                <span>Mile 12 → CMS</span>
                <em>Ready</em>
              </div>
            </div>
            <div className="txt">
              <h3>Your route, one tap away</h3>
              <p>
                GPS finds where you start. Pick your destination once and it's saved, so setup takes a minute, not an afternoon.
              </p>
            </div>
          </article>

          {/* Card 3: Exact fare highlight */}
          <article className="fcard rv spot" style={{ '--d': '.2s' }}>
            <div className="mini m3 stepper" data-step={step3} aria-hidden="true">
              <div className="list">
                <div className="hl" />
                <div className="st">
                  <span>Ojota</span>
                  <b>₦150</b>
                </div>
                <div className="st">
                  <span>Maryland</span>
                  <b>₦250</b>
                </div>
                <div className="st">
                  <span>Anthony</span>
                  <b>₦300</b>
                </div>
                <div className="st">
                  <span>TBS (end)</span>
                  <b>₦400</b>
                </div>
              </div>
            </div>
            <div className="txt">
              <h3>Exact fare, every stop</h3>
              <p>
                Fares are set per stop, so you always see what you owe before you pay. No guessing, no argument, no short change.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Features;
