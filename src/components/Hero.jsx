import React, { useState, useEffect, useRef } from 'react';
import { HeroMan } from './HeroMan';
import { QRCode } from './QRCode';
import { sound } from '../services/sound';

const STOPS = [
  { stop: 'Ojota', distance: '3 stops away', fare: 150 },
  { stop: 'Maryland', distance: '6 stops away', fare: 250 },
  { stop: 'Anthony', distance: '8 stops away', fare: 300 },
  { stop: 'TBS', distance: '11 stops away (end)', fare: 400 },
];

const TOD_PERIODS = [
  { k: 'dawn', n: 'First light', color: '#1FAE6B' },
  { k: 'day', n: 'Morning rush', color: '#0E9D5C' },
  { k: 'day', n: 'Midday heat', color: '#0E9D5C' },
  { k: 'eve', n: 'Evening rush', color: '#0C8D54' },
  { k: 'night', n: 'Night run', color: '#07663C' },
];

function getLagosTime() {
  try {
    const d = new Date();
    const f = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(d);
    let h = 0;
    let m = 0;
    f.forEach((p) => {
      if (p.type === 'hour') h = +p.value;
      if (p.type === 'minute') m = +p.value;
    });
    return { h: h % 24, m };
  } catch (e) {
    const d = new Date();
    return { h: d.getHours(), m: d.getMinutes() };
  }
}

function getTodIndex(h) {
  if (h >= 5 && h < 7) return 0;
  if (h >= 7 && h < 10) return 1;
  if (h >= 10 && h < 16) return 2;
  if (h >= 16 && h < 20) return 3;
  return 4;
}

function format12h(h, m) {
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${hh}:${m < 10 ? '0' : ''}${m} ${ap}`;
}

const fmt = (n) => '₦' + Math.abs(Math.round(n)).toLocaleString('en-NG');
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export const Hero = () => {
  // Stepper & phone demo state
  const [step, setStep] = useState(0);
  const [selectedStopIdx, setSelectedStopIdx] = useState(1); // default Maryland ₦250
  const [balance, setBalance] = useState(1340);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Time-of-day lighting state
  const [todOverride, setTodOverride] = useState(-1);
  const [todInfo, setTodInfo] = useState({ time: '12:00 PM', name: 'Midday heat', key: 'day' });

  // Slide to join state
  const [slidePos, setSlidePos] = useState(0);
  const [isSlideDone, setIsSlideDone] = useState(false);
  const [isSlideDragging, setIsSlideDragging] = useState(false);
  const [isSlideNudge, setIsSlideNudge] = useState(false);

  // Bus on road state
  const [roadTotal, setRoadTotal] = useState(0);

  const stageRef = useRef(null);
  const phoneRef = useRef(null);
  const chipRefs = useRef([]);
  const sljRef = useRef(null);
  const sljThumbRef = useRef(null);
  const roadRef = useRef(null);
  const busRef = useRef(null);
  const coinsCanvasRef = useRef(null);
  const heroHwRef = useRef(null);

  // Auto-advance stepper every 3.2s until user interacts
  useEffect(() => {
    if (hasInteracted) return;
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(timer);
  }, [hasInteracted]);

  // Dynamic route stops on wave
  useEffect(() => {
    const r1 = document.getElementById('route1');
    const g = document.getElementById('waveStops');
    if (r1 && g && !g.hasChildNodes()) {
      try {
        const L = r1.getTotalLength();
        [0.14, 0.36, 0.6, 0.82].forEach((t) => {
          const p = r1.getPointAtLength(L * t);
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('cx', p.x);
          c.setAttribute('cy', p.y);
          c.setAttribute('r', '8');
          c.setAttribute('fill', '#F7F5EF');
          c.setAttribute('stroke', '#0B1410');
          c.setAttribute('stroke-width', '3.5');
          g.appendChild(c);
        });
      } catch (err) {}
    }
  }, []);

  // Pointer move 3D parallax on chips and phone
  useEffect(() => {
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    let animId = 0;

    const handlePointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const depths = [0.7, 1.0, 0.45, 0.6];

    const frame = () => {
      tx += (mx - tx) * 0.08;
      ty += (my - ty) * 0.08;
      const sy = Math.min(window.scrollY, 900);

      chipRefs.current.forEach((el, idx) => {
        if (!el) return;
        const d = depths[idx] || 0.5;
        const xPos = tx * d * 38;
        const yPos = ty * d * 22 - sy * d * 0.1;
        el.style.transform = `translate3d(${xPos.toFixed(1)}px, ${yPos.toFixed(1)}px, 0)`;
      });

      if (phoneRef.current) {
        phoneRef.current.style.transform = `rotateY(${(tx * 9).toFixed(1)}deg) rotateX(${(-ty * 7).toFixed(1)}deg)`;
      }

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  // Time-of-day lighting calculation & update
  useEffect(() => {
    const updateTod = () => {
      const time = getLagosTime();
      const currentIdx = todOverride >= 0 ? todOverride : getTodIndex(time.h);
      const period = TOD_PERIODS[currentIdx];

      setTodInfo({
        time: format12h(time.h, time.m),
        name: period.n,
        key: period.k,
      });

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', period.color);
    };

    updateTod();
    const interval = setInterval(updateTod, 30000);
    return () => clearInterval(interval);
  }, [todOverride]);

  const handleCycleTod = () => {
    sound.playTap();
    const time = getLagosTime();
    const currentIdx = todOverride >= 0 ? todOverride : getTodIndex(time.h);
    const nextIdx = (currentIdx + 1) % TOD_PERIODS.length;
    setTodOverride(nextIdx);

    setTimeout(() => {
      setTodOverride(-1);
    }, 7000);
  };

  // Coins on the headline Canvas Physics Engine
  useEffect(() => {
    const cv = coinsCanvasRef.current;
    const hw = heroHwRef.current;
    if (!cv || !hw) return;

    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = cv.getContext('2d');
    let W = 0;
    let H = 0;
    let dpr = 1;
    let R = 10;
    let sc = 1;
    let coins = [];
    let shelves = [];
    let raf = 0;
    let last = 0;
    let spr = null;
    let dirty = true;

    function mkSprite(r) {
      const d = Math.ceil(r * 2 * dpr) + 6;
      const s = document.createElement('canvas');
      s.width = s.height = d;
      const c = s.getContext('2d');
      c.translate(d / 2, d / 2);
      c.scale(dpr, dpr);
      c.beginPath();
      c.arc(0, 0, r, 0, 7);
      c.fillStyle = '#F2B705';
      c.fill();
      c.lineWidth = Math.max(1.6, r * 0.2);
      c.strokeStyle = '#0B1410';
      c.stroke();

      c.beginPath();
      c.arc(0, 0, r * 0.68, 0, 7);
      c.lineWidth = Math.max(1, r * 0.09);
      c.strokeStyle = 'rgba(11,20,16,.55)';
      c.stroke();

      c.fillStyle = '#0B1410';
      c.font = '800 ' + Math.round(r * 1.1) + 'px "Baloo 2",Inter,Arial,sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('₦', 0, r * 0.06);
      return s;
    }

    function size() {
      const r = hw.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      sc = clamp(W / 1100, 0.45, 1.1);
      R = clamp(W * 0.0115, 6.5, 12.5);
      spr = mkSprite(R);
    }

    function capPx() {
      const cs = getComputedStyle(hw);
      const v = (cs.getPropertyValue('--mcap') || '').trim();
      const fs = parseFloat(cs.fontSize) || 16;
      if (/em$/.test(v)) return parseFloat(v) * fs;
      return parseFloat(v) || fs * 0.1;
    }

    function measure() {
      shelves = [];
      const h1 = hw.querySelector('.hero-h');
      if (!h1) return;
      const hr = hw.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(hw).paddingTop) || 0;
      const y = pad + capPx();
      const words = Array.from(h1.querySelectorAll('.w')).slice(0, 2);

      words.forEach((w) => {
        const tn = w.firstChild;
        if (!tn || tn.nodeType !== 3) return;
        const txt = tn.nodeValue;
        for (let i = 0; i < txt.length; i++) {
          const ch = txt[i];
          if (ch === ' ' || ch === '.') continue;
          try {
            const rg = document.createRange();
            rg.setStart(tn, i);
            rg.setEnd(tn, i + 1);
            const b = rg.getBoundingClientRect();
            if (!b.width) continue;
            const x1 = b.left - hr.left;
            const x2 = b.right - hr.left;
            const w2 = x2 - x1;
            if (ch === 'H' || ch === 'h') {
              shelves.push({ x1: x1 + w2 * 0.06, x2: x1 + w2 * 0.3, y, n: 0 });
              shelves.push({ x1: x2 - w2 * 0.3, x2: x2 - w2 * 0.06, y, n: 0 });
            } else {
              shelves.push({ x1: x1 + w2 * 0.08, x2: x2 - w2 * 0.08, y, n: 0 });
            }
          } catch (e) {}
        }
      });
      shelves.fontPx = parseFloat(getComputedStyle(hw).fontSize) || 100;
    }

    function burst(cx, cy, n, spread) {
      if (dirty && !coins.length) {
        size();
        measure();
        dirty = false;
      }
      const hr = hw.getBoundingClientRect();
      const x = cx - hr.left;
      const y = cy - hr.top;

      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * (spread || 1.5);
        const sp = (520 + Math.random() * 320) * sc;
        coins.push({
          x: x + (Math.random() - 0.5) * 10,
          y,
          vx: Math.cos(a) * sp * 0.55 + (Math.random() - 0.5) * 160 * sc,
          vy: Math.sin(a) * sp,
          sp: Math.random() * 6,
          sr: 7 + Math.random() * 5,
          state: 0,
          born: performance.now() + i * 70,
          bounced: false,
          shelf: null,
          age: 0,
          alpha: 1,
        });
      }
      while (coins.length > 46) {
        coins.shift();
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }

    function tick(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const G = 1900 * sc;
      const baseY = shelves.length ? shelves[0].y : 0;
      const killY = baseY + (shelves.fontPx || 120) * 0.78;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        if (now < c.born) continue;

        if (c.state < 2) {
          const py = c.y;
          c.vy += G * dt;
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.sp += c.sr * dt;

          if (c.vy > 0) {
            for (let k = 0; k < shelves.length; k++) {
              const s = shelves[k];
              if (c.x >= s.x1 && c.x <= s.x2 && py + R * 0.5 <= s.y + 1 && c.y + R * 0.5 >= s.y) {
                if (s.n >= 6) continue;
                if (!c.bounced && c.vy > 300 * sc) {
                  c.y = s.y - R * 0.5;
                  c.vy *= -0.36;
                  c.vx *= 0.55;
                  c.bounced = true;
                } else {
                  c.state = 2;
                  c.shelf = s;
                  c.slot = s.n++;
                  c.age = 0;
                  c.vx = c.vy = 0;
                }
                break;
              }
            }
          }
          if (c.state < 2 && c.y > killY) {
            c.alpha -= dt * 5;
            if (c.alpha <= 0) {
              coins.splice(i, 1);
              continue;
            }
          }
          if (c.state === 2) {
            c.y = c.shelf.y - R * 0.4 - c.slot * R * 0.56;
          }
        } else {
          c.age += dt;
          if (c.age > 6.5) {
            c.alpha -= dt * 2.2;
            if (c.alpha <= 0) {
              c.shelf.n = Math.max(0, c.shelf.n - 1);
              coins.splice(i, 1);
              continue;
            }
          }
        }

        ctx.globalAlpha = Math.max(0, c.alpha);
        if (c.state < 2) {
          const sx = Math.abs(Math.cos(c.sp));
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.scale(Math.max(0.18, sx), 1);
          ctx.drawImage(spr, -spr.width / 2 / dpr, -spr.height / 2 / dpr, spr.width / dpr, spr.height / dpr);
          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.scale(1, 0.46);
          ctx.drawImage(spr, -spr.width / 2 / dpr, -spr.height / 2 / dpr, spr.width / dpr, spr.height / dpr);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
      if (coins.length) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        ctx.clearRect(0, 0, W, H);
      }
    }

    size();
    window.addEventListener('resize', () => { dirty = true; });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { dirty = true; });
    }
    setTimeout(() => { dirty = true; }, 2800);

    const handleOyaPay = (e) => {
      const g = document.getElementById('g-screen');
      if (!g) return;
      const r = g.getBoundingClientRect();
      const p = { x: r.left + r.width / 2, y: r.top + r.height * 0.18 };
      const d = e.detail || {};
      burst(p.x, p.y, d.manual ? 9 : 3, d.manual ? 1.7 : 1.2);
    };

    window.addEventListener('oya:pay', handleOyaPay);

    return () => {
      window.removeEventListener('oya:pay', handleOyaPay);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Slide-to-Join interactive slider
  useEffect(() => {
    const slj = sljRef.current;
    const th = sljThumbRef.current;
    if (!slj || !th) return;

    let down = false;
    let startX = 0;
    let startP = 0;
    let moved = 0;
    let currentP = 0;

    const getFullMax = () => Math.max(1, slj.clientWidth - th.offsetWidth - 12);

    const setPos = (p) => {
      const max = getFullMax();
      currentP = Math.max(0, Math.min(p, max));
      setSlidePos(currentP);
      slj.style.setProperty('--p', currentP.toFixed(1));
      slj.style.setProperty('--k', (currentP / max).toFixed(3));
    };

    const handlePointerDown = (e) => {
      if (isSlideDone) return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startP = currentP;
      setIsSlideDragging(true);
      try { th.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    };

    const handlePointerMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      const before26 = Math.floor(currentP / 26);
      setPos(startP + dx);
      if (Math.floor(currentP / 26) !== before26) {
        sound.playTap();
        try { if (navigator.vibrate) navigator.vibrate(4); } catch (err) {}
      }
    };

    const complete = () => {
      if (isSlideDone) return;
      const max = getFullMax();
      setIsSlideDragging(false);
      setPos(max);
      setIsSlideDone(true);
      sound.playSuccess();
      try { if (navigator.vibrate) navigator.vibrate(18); } catch (err) {}

      if (window.__man && window.__man.greet) {
        window.__man.greet();
      }

      setTimeout(() => {
        const joinEl = document.getElementById('join');
        if (joinEl) {
          joinEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const em = document.getElementById('joinEmail');
            if (em) em.focus({ preventScroll: true });
          }, 750);
        }
      }, 520);

      setTimeout(() => {
        setIsSlideDone(false);
        setPos(0);
      }, 9000);
    };

    const handlePointerUp = () => {
      if (!down) return;
      down = false;
      setIsSlideDragging(false);
      const max = getFullMax();
      if (currentP > max * 0.85) {
        complete();
      } else {
        setPos(0);
        if (moved < 6) {
          setIsSlideNudge(true);
          setTimeout(() => setIsSlideNudge(false), 650);
        }
      }
    };

    th.addEventListener('pointerdown', handlePointerDown);
    th.addEventListener('pointermove', handlePointerMove);
    th.addEventListener('pointerup', handlePointerUp);
    th.addEventListener('pointercancel', handlePointerUp);

    return () => {
      th.removeEventListener('pointerdown', handlePointerDown);
      th.removeEventListener('pointermove', handlePointerMove);
      th.removeEventListener('pointerup', handlePointerUp);
      th.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isSlideDone]);

  // Scroll-driven Danfo Road bus
  useEffect(() => {
    const road = roadRef.current;
    const bus = busRef.current;
    if (!road || !bus) return;

    const stops = Array.from(road.querySelectorAll('.stop'));
    const totEl = document.getElementById('roadTot');
    const wheels = Array.from(bus.querySelectorAll('.wh'));

    let cur = 0;
    let target = 0;
    let raf = 0;
    let passedPrev = 0;
    let shown = 0;
    let hop = 0;
    let Wd = 0;
    let bw = 0;
    let sx = [];
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    function layout() {
      Wd = road.clientWidth;
      bw = bus.offsetWidth;
      sx = stops.map((s) => s.offsetLeft);
    }

    function prog() {
      const r = road.getBoundingClientRect();
      const vh = window.innerHeight;
      return clamp(((vh - r.top) / (vh + r.height)) * 1.12, 0, 1);
    }

    function pop(i) {
      const s = stops[i];
      if (!s) return;
      s.classList.remove('hit');
      void s.offsetWidth;
      s.classList.add('hit');
      sound.playCoin();

      const fBadge = document.createElement('div');
      fBadge.className = 'fare';
      fBadge.textContent = '+₦150';
      fBadge.style.left = sx[i] + 'px';
      fBadge.style.top = '-18px';
      road.appendChild(fBadge);
      setTimeout(() => fBadge.remove(), 1400);
    }

    function place() {
      const x = -bw + cur * (Wd + bw);
      const mid = x + bw * 0.66;
      let passed = 0;
      for (let i = 0; i < sx.length; i++) {
        if (mid >= sx[i]) passed++;
      }

      if (passed > passedPrev) {
        for (let j = passedPrev; j < passed; j++) pop(j);
        hop = 1;
      }
      if (passed < passedPrev) {
        stops.forEach((s, idx) => {
          if (idx >= passed) s.classList.remove('hit');
        });
      }
      passedPrev = passed;

      const want = passed * 150;
      if (reduce) shown = want;
      else shown += (want - shown) * 0.2;
      if (Math.abs(want - shown) < 1) shown = want;
      if (totEl) totEl.textContent = '₦' + fmt(shown).replace('₦', '');

      hop = Math.max(0, hop - 0.09);
      const y = -Math.sin(hop * Math.PI) * 5;
      bus.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

      const a = x * 5.2;
      wheels.forEach((w) => {
        w.setAttribute('transform', `rotate(${a.toFixed(1)} ${w.getAttribute('data-cx')} 56)`);
      });

      return Math.abs(want - shown) > 0.5 || hop > 0;
    }

    function loop() {
      cur += (target - cur) * 0.14;
      const busyTxt = place();
      if (Math.abs(target - cur) > 0.0004 || busyTxt) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    }

    let sq = false;
    function onScroll() {
      if (sq) return;
      sq = true;
      requestAnimationFrame(() => {
        sq = false;
        target = prog();
        if (!raf) raf = requestAnimationFrame(loop);
      });
    }

    layout();
    if (reduce) {
      cur = target = 0.58;
      place();
      return;
    }

    cur = target = prog();
    place();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      layout();
      onScroll();
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Interactive Hero Phone in Stage
  const handleSelectStop = (idx, e) => {
    e.stopPropagation();
    setHasInteracted(true);
    sound.playTap();
    setSelectedStopIdx(idx);
  };

  const handlePay = (e) => {
    e.stopPropagation();
    setHasInteracted(true);
    const chosenStop = STOPS[selectedStopIdx];
    const fare = chosenStop.fare;
    setBalance((prev) => Math.max(0, prev - fare));
    sound.playSuccess();
    setStep(2);

    // Update floating chip with the stop name, fare and flash coin
    const chip = document.getElementById('chipRecv');
    if (chip) {
      const str = chip.querySelector('strong');
      const sp = chip.querySelector('span');
      if (str) str.textContent = fmt(fare) + ' received';
      if (sp) sp.textContent = chosenStop.stop + ' · just now';
      chip.classList.remove('flash');
      void chip.offsetWidth;
      chip.classList.add('flash');
    }
  };

  const handlePhoneClick = () => {
    setHasInteracted(true);
    sound.playTap();
    setStep((prev) => (prev + 1) % 3);
  };

  return (
    <section className="hero" id="top" data-tod={todInfo.key}>
      <div className="tod" aria-hidden="true" />
      <div className="hero-inner">
        {/* Badges */}
        <div className="badges rv">
          <span className="pill">
            <i className="dot" />
            Starting in Lagos
          </span>
          <span className="pill">Drivers first</span>
          <span className="pill">Every kind of ride</span>
          <button
            className="pill tod-pill"
            id="todPill"
            type="button"
            onClick={handleCycleTod}
            aria-label={`Lagos time of day: ${todInfo.name}. Press to preview other times`}
          >
            <i className="ti" />
            <span id="todTxt">
              {todOverride >= 0 ? (
                'Preview · '
              ) : (
                <>
                  <span className="tl">Lagos · </span>
                  {todInfo.time} ·{' '}
                </>
              )}
              {todInfo.name}
            </span>
            <span className="rf" aria-hidden="true">
              ↻
            </span>
          </button>
        </div>

        {/* Hero Headline & HeroMan Character Vector */}
        <div className="hero-hw" ref={heroHwRef}>
          <HeroMan />
          <h1 className="disp hero-h">
            <span className="w" style={{ '--i': 0 }}>
              Get
            </span>{' '}
            <span className="w" style={{ '--i': 1 }}>
              there.
            </span>
            <br />
            <span className="w ink" style={{ '--i': 2 }}>
              Get
            </span>{' '}
            <span className="w ink" style={{ '--i': 3 }}>
              paid.
            </span>
          </h1>
          <canvas className="coins" id="coins" ref={coinsCanvasRef} aria-hidden="true" />
        </div>

        <p className="hero-sub rv" style={{ '--d': '.5s' }}>
          Scan to pay your fare. Get paid the second someone pays you. No cash, no lost change, no wahala.
        </p>

        {/* Interactive Slide-to-Join and Link */}
        <div className="hero-cta rv" style={{ '--d': '.65s' }}>
          <div
            className={`slj ${isSlideDragging ? 'drag' : ''} ${isSlideDone ? 'done' : ''} ${isSlideNudge ? 'nudge' : ''}`}
            id="slj"
            ref={sljRef}
            role="button"
            tabIndex={0}
            aria-label="Join the waitlist. Slide, or press Enter, to continue to the sign-up form"
            onClick={() => {
              if (!isSlideDone) {
                setIsSlideNudge(true);
                setTimeout(() => setIsSlideNudge(false), 650);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsSlideDone(true);
                sound.playSuccess();
                const joinEl = document.getElementById('join');
                if (joinEl) joinEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <span className="slj-fill" />
            <span className="slj-lab">Slide to join the waitlist</span>
            <span className="slj-done">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  fill="none"
                  stroke="#F2B705"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              You're in. Add your email
            </span>
            <span className="slj-thumb" ref={sljThumbRef}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 12h13M13 6l6 6-6 6"
                  fill="none"
                  stroke="#0B1410"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <noscript>
            <a className="btn btn-ink btn-lg" href="#join">
              Join the waitlist
            </a>
          </noscript>
          <a className="link" href="#pay" onClick={() => sound.playClick()}>
            See how it works ↓
          </a>
        </div>

        {/* App Stores */}
        <div className="stores hero-st rv" style={{ '--d': '.8s' }} role="group" aria-label="App store availability">
          <span className="sb-soon">Coming soon · join the waitlist</span>
          <a className="sb" href="#join" aria-label="App Store, coming soon. Join the waitlist to be notified">
            <svg className="sb-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#fff"
                d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
              />
            </svg>
            <span className="sb-t">
              <small>Coming soon on the</small>
              <b>App Store</b>
            </span>
          </a>
          <a className="sb" href="#join" aria-label="Google Play, coming soon. Join the waitlist to be notified">
            <svg className="sb-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#00A0FF" d="M3.6 2.6L13.2 12 3.6 21.4z" />
              <path fill="#00E27A" d="M3.6 2.6L16.4 9.1 13.2 12z" />
              <path fill="#FFCE00" d="M16.4 9.1l4.2 2.4c.8.5.8 1.5 0 2l-4.2 2.4L13.2 12z" />
              <path fill="#FF3A44" d="M3.6 21.4L13.2 12l3.2 2.9z" />
            </svg>
            <span className="sb-t">
              <small>Coming soon on</small>
              <b>Google Play</b>
            </span>
          </a>
        </div>
      </div>

      {/* Interactive Danfo Road with Animated Bus */}
      <div className="road" id="road" ref={roadRef} aria-hidden="true">
        <div className="road-line" />
        <div className="stop" style={{ '--x': '15%' }}>
          <b>Ojota</b>
          <i />
        </div>
        <div className="stop" style={{ '--x': '38%' }}>
          <b>Maryland</b>
          <i />
        </div>
        <div className="stop" style={{ '--x': '61%' }}>
          <b>Yaba</b>
          <i />
        </div>
        <div className="stop" style={{ '--x': '82%' }}>
          <b>Oshodi</b>
          <i />
        </div>
        <div className="bus" id="bus" ref={busRef}>
          <svg viewBox="0 0 132 70" aria-hidden="true">
            <ellipse cx="66" cy="67" rx="54" ry="4" fill="rgba(0,0,0,.22)" />
            <path
              d="M6 54 V26 Q6 15 17 15 H90 Q101 15 108 26 L122 40 Q128 44 128 50 V58 H6 Z"
              fill="#F2B705"
              stroke="#0B1410"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M7 38 H118" stroke="#0B1410" strokeWidth="6" />
            <g fill="#D7F3E6" stroke="#0B1410" strokeWidth="2.4">
              <rect x="14" y="21" width="17" height="13" rx="3" />
              <rect x="35" y="21" width="17" height="13" rx="3" />
              <rect x="56" y="21" width="17" height="13" rx="3" />
              <rect x="77" y="21" width="17" height="13" rx="3" />
              <path d="M98 21 H104 Q107 21 109 25 L116 34 H98 Z" strokeLinejoin="round" />
            </g>
            <rect x="46" y="6" width="38" height="9" rx="3" fill="#0E9D5C" stroke="#0B1410" strokeWidth="2.4" />
            <text
              x="65"
              y="13.4"
              textAnchor="middle"
              fontFamily="Baloo 2,Inter,Arial,sans-serif"
              fontWeight="800"
              fontSize="7"
              fill="#fff"
            >
              OyaPay
            </text>
            <circle cx="124" cy="48" r="3" fill="#FFF3B0" stroke="#0B1410" strokeWidth="1.5" />
            <g className="wh" data-cx="30">
              <circle cx="30" cy="56" r="10" fill="#0B1410" />
              <circle cx="30" cy="56" r="4.2" fill="#8c9a93" />
              <path d="M30 47.5 V64.5 M21.5 56 H38.5" stroke="#8c9a93" strokeWidth="2" />
            </g>
            <g className="wh" data-cx="100">
              <circle cx="100" cy="56" r="10" fill="#0B1410" />
              <circle cx="100" cy="56" r="4.2" fill="#8c9a93" />
              <path d="M100 47.5 V64.5 M91.5 56 H108.5" stroke="#8c9a93" strokeWidth="2" />
            </g>
          </svg>
        </div>
        <div className="road-tot">
          <small>Driver today</small>
          <b id="roadTot">₦0</b>
        </div>
      </div>

      {/* 3D Parallax Stage */}
      <div className="stage" id="heroStage" ref={stageRef}>
        <svg className="wave wave-back" viewBox="0 0 1600 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none" stroke="rgba(247,245,239,.26)" strokeWidth="2.4">
            <path d="M-80 600 C 220 470, 480 720, 800 570 S 1380 400, 1700 540" />
            <path d="M-80 540 C 220 410, 480 660, 800 510 S 1380 340, 1700 480" />
            <path d="M-80 480 C 220 350, 480 600, 800 450 S 1380 280, 1700 420" />
            <path id="route1" d="M-80 420 C 220 290, 480 540, 800 390 S 1380 220, 1700 360" />
            <path d="M-80 360 C 220 230, 480 480, 800 330 S 1380 160, 1700 300" />
            <path d="M-80 300 C 220 170, 480 420, 800 270 S 1380 100, 1700 240" />
            <path d="M-80 240 C 220 110, 480 360, 800 210 S 1380 40, 1700 180" />
          </g>
          <g id="waveStops" />
          <circle r="11" fill="#F2B705" stroke="#0B1410" strokeWidth="4">
            <animateMotion dur="16s" repeatCount="indefinite">
              <mpath href="#route1" />
            </animateMotion>
          </circle>
        </svg>

        {/* Floating Parallax Chips */}
        <div className="px c1" data-depth="0.7" ref={(el) => (chipRefs.current[0] = el)}>
          <div className="chip" id="chipRecv">
            <i>₦</i>
            <div>
              <strong>₦250 received</strong>
              <span>Maryland · just now</span>
            </div>
          </div>
        </div>

        <div className="px c2" data-depth="1" ref={(el) => (chipRefs.current[1] = el)}>
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

        <div className="px c3" data-depth="0.45" ref={(el) => (chipRefs.current[2] = el)}>
          <div className="chip">
            <i className="k">₦</i>
            <div>
              <strong>Net today</strong>
              <span>₦14,240 after fuel &amp; levies</span>
            </div>
          </div>
        </div>

        <div className="px c4" data-depth="0.6" ref={(el) => (chipRefs.current[3] = el)}>
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

        <div className="px try" id="tryHint">
          <div className={`tryl ${hasInteracted ? 'gone' : ''}`}>← Tap the phone. It works.</div>
        </div>

        {/* Hero Interactive Phone Demo */}
        <div className={`hero-phone ${hasInteracted ? '' : 'hint'}`} id="heroPhone" data-depth="0" ref={phoneRef}>
          <div className="phone" onClick={handlePhoneClick}>
            <div className="notch" />
            <div
              className={`screen stepper ${hasInteracted ? 'touched' : ''}`}
              id="heroScreen"
              data-step={step}
              tabIndex={0}
              role="group"
              aria-label="Interactive demo. Press Enter to move to the next screen."
            >
              {/* Scene 0: Scan */}
              <div className="scene s0">
                <div className="sc-top">
                  <span>Scan to pay</span>
                  <span>OyaPay</span>
                </div>
                <div className="vf">
                  <i />
                  <i />
                  <i />
                  <i />
                  <div className="qr">
                    <QRCode value="21" size={150} />
                  </div>
                  <div className="line" />
                </div>
                <div className="rchip">
                  <span>Route detected</span>
                  <b>IKORODU → TBS</b>
                </div>
              </div>

              {/* Scene 1: Stop Selection */}
              <div className="scene s1" onClick={(e) => e.stopPropagation()}>
                <div className="ttl">
                  Where are you
                  <br />
                  dropping?
                </div>
                {STOPS.map((st, idx) => (
                  <button
                    key={st.stop}
                    type="button"
                    className={`row ${selectedStopIdx === idx ? 'sel' : ''}`}
                    onClick={(e) => handleSelectStop(idx, e)}
                  >
                    <div>
                      {st.stop}
                      <small>{st.distance}</small>
                    </div>
                    <b>{fmt(st.fare)}</b>
                  </button>
                ))}
                <button type="button" className="pbtn" id="hpPay" onClick={handlePay}>
                  Pay {fmt(STOPS[selectedStopIdx].fare)}
                </button>
              </div>

              {/* Scene 2: Paid Success Receipt */}
              <div className="scene s2">
                <div className="check">
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0B1410" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                </div>
                <div className="amt" id="hpAmt">
                  {fmt(STOPS[selectedStopIdx].fare)}
                </div>
                <div className="amt-sub">paid · instant</div>
                <div className="ticket">
                  <h5 id="hpRoute">Ikorodu → {STOPS[selectedStopIdx].stop}</h5>
                  <p>Bus · LND 412 XA · 7:42 AM</p>
                  <div className="tf">
                    <span>Wallet balance</span>
                    <b id="hpBal">{fmt(balance)}</b>
                  </div>
                </div>
                <div className="again">Tap to try another stop</div>
              </div>

              {/* Stepper Dots */}
              <div className="pdots">
                <i />
                <i />
                <i />
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

export default Hero;
