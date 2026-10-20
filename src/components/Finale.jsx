import React, { useState, useEffect, useRef } from 'react';

export const Finale = () => {
  const [who, setWho] = useState('driver');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const finRef = useRef(null);
  const canvasRef = useRef(null);
  const shootLRef = useRef(null);
  const shootRRef = useRef(null);

  // Coin Physics Simulation
  const partsRef = useRef([]);
  const hmRef = useRef([]);
  const runningRef = useRef(false);
  const rafRef = useRef(0);
  const rainedRef = useRef(false);

  useEffect(() => {
    const fin = finRef.current;
    const cv = canvasRef.current;
    if (!fin || !cv) return;

    const ctx = cv.getContext('2d');
    const BW = 22;
    let W = 0;
    let H = 0;
    let dpr = 1;

    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const floor = () => H - 4;

    function size() {
      const r = fin.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hmRef.current = new Array(Math.ceil(W / BW) + 2).fill(0);
      partsRef.current.forEach((p) => {
        p.rest = false;
        p.vy = 0;
      });
      kick();
    }

    function make(x, y, vx, vy) {
      const coin = Math.random() < 0.55;
      const s = coin ? 30 + Math.random() * 16 : 38 + Math.random() * 14;
      return {
        x,
        y,
        vx,
        vy,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.32,
        s,
        coin,
        rest: false,
      };
    }

    function restNow(p) {
      const b = Math.max(0, Math.min(hmRef.current.length - 1, (p.x / BW) | 0));
      p.y = floor() - hmRef.current[b] - p.s * 0.25;
      p.rest = true;
      p.vx = p.vy = p.vr = 0;
      hmRef.current[b] = Math.min(hmRef.current[b] + p.s * 0.3, 240);
    }

    function add(p) {
      partsRef.current.push(p);
      if (partsRef.current.length > 240) {
        partsRef.current.splice(0, partsRef.current.length - 240);
      }
    }

    function step() {
      let moving = 0;
      for (const p of partsRef.current) {
        if (p.rest) continue;
        p.vy += 0.55;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        if (p.x < p.s / 2) {
          p.x = p.s / 2;
          p.vx *= -0.6;
        }
        if (p.x > W - p.s / 2) {
          p.x = W - p.s / 2;
          p.vx *= -0.6;
        }

        const b = Math.max(0, Math.min(hmRef.current.length - 1, (p.x / BW) | 0));
        const fy = floor() - hmRef.current[b] - p.s * 0.25;
        if (p.y >= fy) {
          p.y = fy;
          if (Math.abs(p.vy) > 2.4) {
            p.vy *= -0.38;
            p.vx *= 0.8;
            p.vr *= 0.6;
          } else {
            p.rest = true;
            p.vy = p.vx = p.vr = 0;
            hmRef.current[b] = Math.min(hmRef.current[b] + p.s * 0.3, 240);
          }
        }
        moving++;
      }
      return moving;
    }

    function rr(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of partsRef.current) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.coin) {
          ctx.beginPath();
          ctx.arc(0, 0, p.s / 2, 0, 6.283);
          ctx.fillStyle = '#F2B705';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#0B1410';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, p.s / 2 - 6, 0, 6.283);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(11,20,16,.45)';
          ctx.stroke();

          ctx.fillStyle = '#0B1410';
          ctx.font = '800 ' + p.s * 0.5 + 'px Inter,sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('₦', 0, 1);
        } else {
          const w = p.s * 1.55;
          const h = p.s * 0.88;
          rr(-w / 2, -h / 2, w, h, 6);
          ctx.fillStyle = '#F7F5EF';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#0B1410';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, h * 0.3, 0, 6.283);
          ctx.fillStyle = '#0E9D5C';
          ctx.fill();

          ctx.fillStyle = '#0B1410';
          ctx.font = '800 ' + h * 0.36 + 'px Inter,sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('₦', 0, 1);
        }
        ctx.restore();
      }
    }

    function loop() {
      const moving = step();
      draw();
      rafRef.current = moving > 0 && runningRef.current ? requestAnimationFrame(loop) : 0;
    }

    function kick() {
      draw();
      if (!rafRef.current && runningRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    function burst(btn, dir) {
      if (!btn) return;
      const nozzle = btn.querySelector('.nozzle');
      if (!nozzle) return;
      const nz = nozzle.getBoundingClientRect();
      const fr = fin.getBoundingClientRect();
      const x = nz.left + nz.width / 2 - fr.left;
      const y = nz.top + nz.height / 2 - fr.top;

      for (let i = 0; i < 16; i++) {
        if (reduce) {
          const p = make(W / 2 + (Math.random() - 0.5) * 420, 0, 0, 0);
          restNow(p);
          add(p);
          continue;
        }
        setTimeout(() => {
          add(make(x, y, dir * (4 + Math.random() * 7), -(11 + Math.random() * 9)));
          runningRef.current = true;
          kick();
        }, i * 28);
      }
      if (reduce) draw();
    }

    function rain() {
      if (reduce) return;
      for (let i = 0; i < 40; i++) {
        setTimeout(() => {
          add(make(40 + Math.random() * (W - 80), -40, (Math.random() - 0.5) * 2, Math.random() * 2));
          runningRef.current = true;
          kick();
        }, i * 90);
      }
    }

    const onShootL = () => burst(shootLRef.current, 1);
    const onShootR = () => burst(shootRRef.current, -1);

    const btnL = shootLRef.current;
    const btnR = shootRRef.current;
    if (btnL) btnL.addEventListener('click', onShootL);
    if (btnR) btnR.addEventListener('click', onShootR);

    size();
    let ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(size);
      ro.observe(fin);
    } else {
      window.addEventListener('resize', size);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          runningRef.current = e.isIntersecting;
          if (runningRef.current) {
            kick();
            if (!rainedRef.current) {
              rainedRef.current = true;
              rain();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(fin);

    return () => {
      observer.disconnect();
      if (ro) ro.disconnect();
      window.removeEventListener('resize', size);
      if (btnL) btnL.removeEventListener('click', onShootL);
      if (btnR) btnR.removeEventListener('click', onShootR);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
  };

  const marqueeText1 = Array(8).fill('Oya! Oya! Oya!').join(' · ');
  const marqueeText2 = Array(6).fill('Get there. Get paid.').join(' · ');

  return (
    <section className="finale" id="finale" ref={finRef}>
      {/* 3-Tier Marquee */}
      <div className="mqs" aria-hidden="true">
        <div className="mq">
          <div className="mqg">
            <span>{marqueeText1}</span>
          </div>
          <div className="mqg" aria-hidden="true">
            <span>{marqueeText1}</span>
          </div>
        </div>
        <div className="mq rev solid">
          <div className="mqg">
            <span>{marqueeText2}</span>
          </div>
          <div className="mqg" aria-hidden="true">
            <span>{marqueeText2}</span>
          </div>
        </div>
        <div className="mq">
          <div className="mqg">
            <span>{marqueeText1}</span>
          </div>
          <div className="mqg" aria-hidden="true">
            <span>{marqueeText1}</span>
          </div>
        </div>
      </div>

      {/* Physics Canvas */}
      <canvas className="fx" ref={canvasRef} aria-hidden="true"></canvas>

      {/* Waitlist Form Card */}
      <div className="join rv" id="join">
        <h2 className="disp">Oya, let's go.</h2>
        <p>Be first in line when OyaPay opens in your corridor.</p>

        {!submitted ? (
          <>
            <div className="who" role="radiogroup" aria-label="I am a">
              <label>
                <input
                  type="radio"
                  name="who"
                  value="driver"
                  checked={who === 'driver'}
                  onChange={() => setWho('driver')}
                />
                <span>I drive</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="who"
                  value="rider"
                  checked={who === 'rider'}
                  onChange={() => setWho('rider')}
                />
                <span>I ride</span>
              </label>
            </div>

            <form id="joinForm" onSubmit={handleSubmit} noValidate>
              <input
                type="email"
                id="joinEmail"
                placeholder="your@email.com"
                autoComplete="email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="btn btn-ink" type="submit">
                Notify me
              </button>
            </form>

            {error && (
              <div className="err" role="alert" style={{ display: 'block' }}>
                Please enter a valid email address.
              </div>
            )}
          </>
        ) : (
          <div className="ok" role="status" style={{ display: 'block' }}>
            {who === 'driver'
              ? "You're on the list, driver. We're starting with drivers, so we'll reach out first."
              : "You're on the list. We'll reach out when OyaPay opens near you."}
          </div>
        )}
      </div>

      {/* Left Shooter */}
      <button className="shooter l" ref={shootLRef} id="shootL" aria-label="Shoot coins">
        <span className="hint">tap me</span>
        <span className="nozzle"></span>
        <svg viewBox="0 0 140 140" aria-hidden="true">
          <g transform="rotate(-32 70 82)">
            <rect x="16" y="58" width="86" height="40" rx="16" fill="#0B1410" />
            <rect x="92" y="52" width="22" height="52" rx="11" fill="#F2B705" stroke="#0B1410" strokeWidth="4" />
            <path d="M38 78 l13 -10 v20z" fill="#0E9D5C" />
          </g>
          <circle cx="46" cy="114" r="22" fill="#0B1410" />
          <circle cx="46" cy="114" r="9" fill="#0E9D5C" />
        </svg>
      </button>

      {/* Right Shooter */}
      <button className="shooter r" ref={shootRRef} id="shootR" aria-label="Shoot coins">
        <span className="hint">tap me</span>
        <span className="nozzle"></span>
        <svg viewBox="0 0 140 140" aria-hidden="true">
          <g transform="rotate(-32 70 82)">
            <rect x="16" y="58" width="86" height="40" rx="16" fill="#0B1410" />
            <rect x="92" y="52" width="22" height="52" rx="11" fill="#F2B705" stroke="#0B1410" strokeWidth="4" />
            <path d="M38 78 l13 -10 v20z" fill="#0E9D5C" />
          </g>
          <circle cx="46" cy="114" r="22" fill="#0B1410" />
          <circle cx="46" cy="114" r="9" fill="#0E9D5C" />
        </svg>
      </button>
    </section>
  );
};
