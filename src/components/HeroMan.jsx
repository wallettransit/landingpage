import React, { useEffect, useRef } from 'react';
import { sound } from '../services/sound';

export const HeroMan = () => {
  const figureRef = useRef(null);
  const svgRef = useRef(null);
  const chipRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current || document.getElementById('manSvg');
    if (!svg) {
      console.warn('[HeroMan] svg element not found!');
      return;
    }

    const chip = chipRef.current || document.querySelector('.man-chip');
    const btn = btnRef.current || document.getElementById('manTry');
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- helpers ---------- */
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function f(n) { return n.toFixed(2); }
    function noise(t, s) { return (Math.sin(t + s) + 0.5 * Math.sin(t * 2.17 + s * 1.7) + 0.25 * Math.sin(t * 4.31 + s * 2.9)) / 1.75; }
    function ease(u) { return u * u * (3 - 2 * u); }
    function eio(u) { u = clamp(u, 0, 1); return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }

    function Spring(x, k, d) {
      this.x = x;
      this.v = 0;
      this.t = x;
      this.k = k;
      this.d = d;
    }
    Spring.prototype.step = function(dt) {
      const a = this.k * (this.t - this.x) - this.d * this.v;
      this.v += a * dt;
      this.x += this.v * dt;
      return this.x;
    };

    function T(el, tx, ty, rot, px, py, sx, sy) {
      if (!el) return;
      el.setAttribute('transform', 'translate(' + f(tx + px) + ' ' + f(ty + py) + ') rotate(' + f(rot) + ') scale(' + f(sx) + ' ' + f(sy) + ') translate(' + (-px) + ' ' + (-py) + ')');
    }

    function fitStr(el, size, max, str) {
      if (!el) return;
      const w = str.length * size * 0.62;
      el.setAttribute('font-size', w > max ? (size * max / w).toFixed(2) : size);
    }
    function fit(el, size, max) {
      if (!el) return;
      try {
        el.setAttribute('font-size', size);
        const w = el.getComputedTextLength();
        if (w > max) el.setAttribute('font-size', (size * max / w).toFixed(2));
      } catch (e) {}
    }

    /* ---------- nodes ---------- */
    const N = {};
    const ids = [
      'g-body', 'g-torso', 'g-neck', 'g-collar', 'g-head', 'h-hair', 'h-cheek', 'h-beard', 'h-nose', 'h-eyes', 'h-brows', 'h-mouth', 'h-screenlight',
      'irisL', 'irisR', 'lidL', 'lidR', 'lowL', 'lowR', 'lashL', 'lashR', 'browL', 'browR', 'mouthIn', 'mouthClipPath', 'lipLow', 'teeth', 'tongue',
      'g-armL', 'g-foreL', 'g-armR', 'g-foreR', 'g-phone', 'g-thumb', 'phoneGlow', 'scrFlash', 'scrPing', 'scrAmt', 'scrTotal',
      'fPinky', 'fRing', 'fMid', 'fIdx',
      'scrDemo', 'dmTop', 'dmQRg', 'dmQR', 'dmLine', 'dmSlide', 'dmFill', 'dmLab', 'dmThumb', 'dmOk'
    ];
    ids.forEach(id => {
      N[id] = svg.querySelector('#' + id);
    });

    // Populate pseudo QR in demo screen
    const qr = N['dmQR'];
    if (qr && !qr.hasChildNodes()) {
      let seed = 7;
      const rndQr = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      const Nsize = 9;
      const cs = 5.8;
      const inFinder = (r, c) => (r < 3 && c < 3) || (r < 3 && c >= Nsize - 3) || (r >= Nsize - 3 && c < 3);

      for (let r = 0; r < Nsize; r++) {
        for (let c = 0; c < Nsize; c++) {
          if (inFinder(r, c)) continue;
          if (rndQr() > 0.48) {
            const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            e.setAttribute('x', (c * cs).toFixed(1));
            e.setAttribute('y', (r * cs).toFixed(1));
            e.setAttribute('width', (cs - 0.7).toFixed(1));
            e.setAttribute('height', (cs - 0.7).toFixed(1));
            e.setAttribute('rx', '1');
            qr.appendChild(e);
          }
        }
      }
      [[0, 0], [0, Nsize - 3], [Nsize - 3, 0]].forEach((p) => {
        const o = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        o.setAttribute('x', (p[1] * cs).toFixed(1));
        o.setAttribute('y', (p[0] * cs).toFixed(1));
        o.setAttribute('width', (3 * cs - 0.7).toFixed(1));
        o.setAttribute('height', (3 * cs - 0.7).toFixed(1));
        o.setAttribute('rx', '2');
        qr.appendChild(o);

        const inner = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        inner.setAttribute('x', ((p[1] + 1) * cs + 0.6).toFixed(1));
        inner.setAttribute('y', ((p[0] + 1) * cs + 0.6).toFixed(1));
        inner.setAttribute('width', (cs - 1.9).toFixed(1));
        inner.setAttribute('height', (cs - 1.9).toFixed(1));
        inner.setAttribute('fill', '#F7F5EF');
        qr.appendChild(inner);
      });
    }

    /* ---------- state ---------- */
    const S = {
      t: 0,
      running: true,
      gaze: { x: 0.85, y: 0.3 },
      gazeMode: 'phone',
      gazeUntil: 2.2,
      micro: { x: 0, y: 0 },
      microUntil: 0,
      pointer: { x: 0, y: 0, last: -99, active: false },
      cta: null,
      ex: new Spring(0.85, 420, 30),
      ey: new Spring(0.3, 420, 30),
      yaw: new Spring(0.5, 48, 10),
      pitch: new Spring(0.2, 48, 10),
      smile: new Spring(0, 150, 12),
      brow: new Spring(0, 170, 13),
      nod: new Spring(0, 150, 9),
      ph: new Spring(0, 150, 10),
      pop: new Spring(1, 260, 13),
      glow: 0,
      flash: 0,
      face: 0,
      blinkAt: 1.6,
      blinkU: -1,
      dbl: false,
      drumAt: 4,
      drumStart: -9,
      pingAt: 3.6,
      queue: [],
      total: 12650,
      amt: 250,
      countStart: -9,
      chipOff: 0
    };

    const AMTS = [150, 250, 300, 400, 500, 200, 350];
    const fmtNum = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    /* ---------- events ---------- */
    function onMove(e) {
      S.pointer.x = e.clientX;
      S.pointer.y = e.clientY;
      S.pointer.last = S.t;
      S.pointer.active = true;
    }
    window.addEventListener('pointermove', onMove, { passive: true });

    function onPointerLeave() {
      S.pointer.active = false;
    }
    document.addEventListener('pointerleave', onPointerLeave);

    // Watch CTA buttons to look at them with a smile when hovered
    const ctaBtns = document.querySelectorAll('.hero-cta .btn, .hero-cta .slj, .hero .stores .sb, .nav .btn');
    const handleCtaEnter = (b) => {
      S.cta = b;
      S.smile.t = Math.max(S.smile.t, 0.35);
    };
    const handleCtaLeave = (b) => {
      if (S.cta === b) {
        S.cta = null;
        S.smile.t = 0;
      }
    };
    ctaBtns.forEach((b) => {
      b.addEventListener('pointerenter', () => handleCtaEnter(b));
      b.addEventListener('pointerleave', () => handleCtaLeave(b));
    });

    // Clicking anywhere on the SVG outside the phone triggers ping
    const handleSvgDown = (e) => {
      if (e.target && e.target.closest && e.target.closest('#g-phone')) return;
      ping(true);
    };
    svg.addEventListener('pointerdown', handleSvgDown);

    /* ---------- reaction timeline ---------- */
    function after(dt, fn) {
      S.queue.push({ at: S.t + dt, fn });
    }

    function ping(manual, fixed) {
      const amt = fixed || AMTS[(Math.random() * AMTS.length) | 0];
      S.amt = amt;
      after(0, () => {
        S.gazeMode = 'phone';
        S.gazeUntil = S.t + 3.2;
        S.flash = 0.55;
      });
      after(0.1, () => {
        S.countStart = S.t;
        S.total += amt;
        S.pop.x = 0.55;
        S.pop.v = 0;
        S.glow = 1;
        S.face = 1;
        sound.playCoin();
        try {
          window.dispatchEvent(new CustomEvent('oya:pay', { detail: { amt, manual: !!manual } }));
        } catch (e) {}
        if (chip) {
          const bEl = chip.querySelector('b');
          if (bEl) bEl.textContent = '₦' + fmtNum(amt) + ' received';
          chip.classList.add('on');
          S.chipOff = S.t + 2.6;
        }
      });
      after(0.16, () => { S.brow.t = 1; });
      after(0.26, () => { S.smile.t = 0.5; S.nod.v = -9; S.nod.t = 0; });
      after(0.55, () => { S.ph.v = -7; });
      after(2.4, () => { S.brow.t = 0; });
      after(3.4, () => { S.smile.t = 0; });
      if (!manual) S.pingAt = S.t + rnd(6.2, 9.4);
    }

    function greet() {
      S.gazeMode = 'viewer';
      S.gazeUntil = S.t + 1.7;
      S.smile.t = 0.5;
      S.brow.t = 0.8;
      S.nod.v = -8;
      after(1.8, () => { S.brow.t = 0; S.smile.t = 0; });
    }

    /* ---------- gaze logic ---------- */
    const RC = { t: -9, r: null, c: null, ce: null };
    function rects() {
      if (S.cta !== RC.ce) { RC.t = -9; RC.ce = S.cta; }
      if (!RC.r || S.t - RC.t > 0.3) {
        RC.r = svg.getBoundingClientRect();
        RC.c = S.cta ? S.cta.getBoundingClientRect() : null;
        RC.t = S.t;
      }
      return RC;
    }

    function updateGaze(dt) {
      const g = S.gaze;
      const RR = rects();
      const r = RR.r;
      const hx = r.left + r.width * (260 / 520);
      const hy = r.top + r.height * ((150 - 40) / 430);

      if (S.cta) {
        const c = RR.c || S.cta.getBoundingClientRect();
        g.x = clamp((c.left + c.width / 2 - hx) / (window.innerWidth * 0.38), -1, 1);
        g.y = clamp((c.top + c.height / 2 - hy) / (window.innerHeight * 0.45), -0.2, 1);
      } else if (S.pointer.active && S.t - S.pointer.last < 2.6) {
        g.x = clamp((S.pointer.x - hx) / (window.innerWidth * 0.38), -1, 1);
        g.y = clamp((S.pointer.y - hy) / (window.innerHeight * 0.45), -0.9, 1) * 0.8;
      } else {
        if (S.t > S.gazeUntil) {
          const m = Math.random();
          if (S.gazeMode === 'phone' && m < 0.55) {
            S.gazeMode = 'viewer';
            S.gazeUntil = S.t + rnd(1, 2.2);
          } else if (m < 0.8) {
            S.gazeMode = 'phone';
            S.gazeUntil = S.t + rnd(1.8, 4);
          } else {
            S.gazeMode = 'drift';
            S.gazeUntil = S.t + rnd(0.8, 1.6);
          }
          if (S.gazeMode === 'drift') {
            g.x = rnd(-0.5, 0.3);
            g.y = rnd(-0.25, 0.25);
          }
        }
        if (S.gazeMode === 'phone') { g.x = 0.85; g.y = 0.32; }
        else if (S.gazeMode === 'viewer') { g.x = 0; g.y = -0.04; }
      }

      if (S.t > S.microUntil) {
        S.micro.x = rnd(-0.07, 0.07);
        S.micro.y = rnd(-0.05, 0.05);
        S.microUntil = S.t + rnd(0.35, 1.1);
      }

      S.ex.t = g.x + S.micro.x;
      S.ey.t = g.y + S.micro.y;
      S.yaw.t = clamp(g.x * 0.62 + noise(S.t * 0.23, 4) * 0.08, -1, 1);
      S.pitch.t = clamp(g.y * 0.7, -0.8, 0.9);
    }

    /* ---------- in-phone interactive demo ---------- */
    let demoBusy = false;
    let topSwapped = false;
    const D = N['scrDemo'], QRg = N['dmQRg'], LINE = N['dmLine'], SL = N['dmSlide'],
          FILL = N['dmFill'], THUMB = N['dmThumb'], OK = N['dmOk'], TOP = N['dmTop'];

    function resetDemo() {
      if (!D) return;
      D.setAttribute('opacity', '0');
      if (QRg) QRg.setAttribute('opacity', '1');
      if (LINE) { LINE.setAttribute('opacity', '1'); LINE.setAttribute('y', '-50'); }
      if (SL) SL.setAttribute('opacity', '0');
      if (OK) { OK.setAttribute('opacity', '0'); OK.removeAttribute('transform'); }
      if (FILL) FILL.setAttribute('width', '20');
      if (THUMB) THUMB.setAttribute('transform', 'translate(0 0)');
      if (TOP) { TOP.textContent = 'Rider scans your code'; TOP.setAttribute('opacity', '1'); fit(TOP, 8.6, 72); }
    }

    function drawDemoAt(t) {
      if (!D) return;
      D.setAttribute('opacity', clamp(t / 0.25, 0, 1) * (t > 3.55 ? clamp(1 - (t - 3.55) / 0.3, 0, 1) : 1));
      if (t < 1.6) {
        let u = ((t - 0.25) / 0.62) % 1;
        if (u < 0) u = 0;
        if (LINE) LINE.setAttribute('y', (-50 + 54 * eio(u)).toFixed(2));
        if (QRg) QRg.setAttribute('opacity', '1');
        if (LINE) LINE.setAttribute('opacity', '1');
        if (SL) SL.setAttribute('opacity', '0');
      }
      if (t >= 1.6 && t < 1.85) {
        let k = (t - 1.6) / 0.25;
        if (QRg) QRg.setAttribute('opacity', (1 - k).toFixed(2));
        if (LINE) LINE.setAttribute('opacity', (1 - k).toFixed(2));
        if (SL) SL.setAttribute('opacity', k.toFixed(2));
      }
      if (t >= 1.85) {
        if (QRg) QRg.setAttribute('opacity', '0');
        if (LINE) LINE.setAttribute('opacity', '0');
        if (!topSwapped && TOP) {
          topSwapped = true;
          TOP.textContent = 'Rider slides to pay';
          fit(TOP, 8.6, 72);
        }
      }
      if (t >= 1.85 && t < 3.0) {
        if (SL) SL.setAttribute('opacity', '1');
        let q = eio((t - 2.0) / 0.9);
        if (THUMB) THUMB.setAttribute('transform', 'translate(' + (42 * q).toFixed(2) + ' 0)');
        if (FILL) FILL.setAttribute('width', (20 + 42 * q).toFixed(2));
      }
      if (t >= 3.0) {
        let kk = clamp((t - 3.0) / 0.2, 0, 1);
        if (SL) SL.setAttribute('opacity', (1 - kk).toFixed(2));
        if (TOP) TOP.setAttribute('opacity', (1 - kk).toFixed(2));
        if (OK) OK.setAttribute('opacity', kk.toFixed(2));
        let s = 1 + 0.18 * Math.sin(clamp((t - 3.0) / 0.35, 0, 1) * Math.PI);
        if (OK) OK.setAttribute('transform', 'translate(0 -8) scale(' + s.toFixed(3) + ') translate(0 8)');
      }
    }

    function runDemo() {
      if (demoBusy || !D) return;
      demoBusy = true;
      if (btn) btn.classList.add('busy');
      sound.playTap();
      S.pingAt = S.t + 999;
      S.gazeMode = 'phone';
      S.gazeUntil = S.t + 4.4;
      resetDemo();
      topSwapped = false;
      const t0 = performance.now();
      let fired = false;
      let paid = false;

      (function frame(now) {
        const t = (now - t0) / 1000;
        drawDemoAt(t);
        if (t >= 3.0 && !fired) {
          fired = true;
          S.flash = 0.7;
          sound.playSuccess();
          try { if (navigator.vibrate) navigator.vibrate([20, 40, 20]); } catch (e) {}
        }
        if (t >= 3.55 && !paid) {
          paid = true;
          ping(true, 150);
          S.pingAt = S.t + rnd(6.5, 9.5);
        }
        if (t < 3.9) {
          requestAnimationFrame(frame);
        } else {
          resetDemo();
          demoBusy = false;
          if (btn) {
            btn.classList.remove('busy');
            btn.classList.remove('show');
            setTimeout(() => { if (!demoBusy) btn.classList.add('show'); }, 14000);
          }
        }
      })(t0);
    }

    // Attach click to phone & button
    if (N['g-phone']) N['g-phone'].addEventListener('click', runDemo);
    if (btn) {
      btn.addEventListener('click', runDemo);
      setTimeout(() => btn.classList.add('show'), reduce ? 200 : 2600);
    }

    /* ---------- render function ---------- */
    function render(t, dt) {
      // Spring substeps
      const n = Math.max(1, Math.ceil(dt / 0.012));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        S.ex.step(h); S.ey.step(h); S.yaw.step(h); S.pitch.step(h);
        S.smile.step(h); S.brow.step(h); S.nod.step(h); S.ph.step(h); S.pop.step(h);
      }

      const yaw = S.yaw.x, pit = S.pitch.x, ex = S.ex.x, ey = S.ey.x, nod = S.nod.x;
      const br = Math.sin(t * 2 * Math.PI / 4.6), br2 = Math.sin(t * 2 * Math.PI / 4.6 - 0.7);
      const sway = noise(t * 0.18, 1), sway2 = noise(t * 0.15, 2);

      // Body & posture
      T(N['g-body'], sway * 3, 0, sway2 * 0.35, 260, 470, 1, 1);
      T(N['g-torso'], 0, 0, 0, 260, 470, 1 + 0.003 * br, 1 + 0.007 * br);
      T(N['g-neck'], 0, -0.8 * br2, 0, 260, 300, 1, 1);
      T(N['g-collar'], 0, -0.8 * br2, 0, 260, 330, 1, 1);
      const hx = sway * -1.2 + yaw * 2.2, hy = -1.7 * br2 + pit * 3 + nod * 3.2;
      T(N['g-head'], hx, hy, yaw * 2.4 + noise(t * 0.3, 3) * 0.9 + nod * 2.2, 260, 252, 1, 1);

      // Parallax on facial features
      const P = {
        'h-hair': [2.5, 1.5], 'h-cheek': [6, 4], 'h-beard': [5, 3.5], 'h-nose': [9, 5],
        'h-eyes': [8, 5], 'h-brows': [7, 4.5], 'h-mouth': [7, 4.5]
      };
      for (const k in P) {
        if (N[k]) N[k].setAttribute('transform', 'translate(' + f(yaw * P[k][0]) + ' ' + f(pit * P[k][1]) + ')');
      }

      // Eyes
      const px = clamp(ex, -1.2, 1.2) * 5.2, py = clamp(ey, -1, 1) * 3.2;
      if (N.irisL) N.irisL.setAttribute('transform', 'translate(' + f(px) + ' ' + f(py) + ')');
      if (N.irisR) N.irisR.setAttribute('transform', 'translate(' + f(px) + ' ' + f(py) + ')');

      // Blink
      if (S.blinkU < 0 && t > S.blinkAt) {
        S.blinkU = 0;
        S.blinkAt = t + rnd(2.2, 5.8);
        S.dbl = Math.random() < 0.14;
      }
      let b = 0;
      if (S.blinkU >= 0) {
        S.blinkU += dt / 0.17;
        const u = S.blinkU;
        b = u < 0.4 ? ease(u / 0.4) : ease(1 - (u - 0.4) / 0.6);
        if (u >= 1) {
          S.blinkU = -1;
          b = 0;
          if (S.dbl) { S.dbl = false; S.blinkAt = t + 0.12; }
        }
      }

      // Smile & eyelids
      const smile = clamp(0.6 + 0.06 * noise(t * 0.5, 6) + S.smile.x, 0, 1.15);
      const sq = clamp((smile - 0.5) * 1.5, 0, 1);
      const lidb = clamp(b + 0.05 * Math.max(0, ey) + 0.03 * sq, 0, 1);
      const yc = 139 + 26 * lidb, yc2 = 157 - 9 * sq - 6 * b;
      if (N.lidL) N.lidL.setAttribute('d', 'M219 153 Q236 ' + f(yc) + ' 253 153 L253 128 L219 128 Z');
      if (N.lidR) N.lidR.setAttribute('d', 'M267 153 Q284 ' + f(yc) + ' 301 153 L301 128 L267 128 Z');
      if (N.lashL) N.lashL.setAttribute('d', 'M220 153 Q236 ' + f(yc) + ' 252 153');
      if (N.lashR) N.lashR.setAttribute('d', 'M268 153 Q284 ' + f(yc) + ' 300 153');
      if (N.lowL) N.lowL.setAttribute('d', 'M219 163 Q236 ' + f(yc2) + ' 253 163 L253 176 L219 176 Z');
      if (N.lowR) N.lowR.setAttribute('d', 'M267 163 Q284 ' + f(yc2) + ' 301 163 L301 176 L267 176 Z');

      // Brows
      const bu = -S.brow.x * 5 + noise(t * 0.4, 9) * 0.6;
      if (N.browL) T(N.browL, 0, bu, -S.brow.x * 2, 233, 130, 1, 1);
      if (N.browR) T(N.browR, 0, bu, S.brow.x * 2, 287, 130, 1, 1);

      // Mouth
      const cx = 260, yc0 = 222, mw = 20 + 5 * smile, cy = yc0 - 3.5 * smile, bot = yc0 + 6 + 17 * smile;
      const md = 'M' + f(cx - mw) + ' ' + f(cy) + ' Q' + cx + ' ' + (yc0 - 2) + ' ' + f(cx + mw) + ' ' + f(cy) + ' Q' + cx + ' ' + f(bot) + ' ' + f(cx - mw) + ' ' + f(cy) + ' Z';
      if (N.mouthIn) N.mouthIn.setAttribute('d', md);
      if (N.mouthClipPath) N.mouthClipPath.setAttribute('d', md);
      if (N.lipLow) N.lipLow.setAttribute('d', 'M' + f(cx - mw + 2) + ' ' + f(cy + 1.5) + ' Q' + cx + ' ' + f(bot + 3) + ' ' + f(cx + mw - 2) + ' ' + f(cy + 1.5));
      if (N.teeth) { N.teeth.setAttribute('y', f(cy - 2)); N.teeth.setAttribute('height', f(6.5 + 4 * smile)); }
      if (N.tongue) N.tongue.setAttribute('cy', f((cy + bot) / 2 + 5));

      // Arms
      if (N['g-armL']) T(N['g-armL'], 0, 0, noise(t * 0.2, 5) * 0.3 + br * 0.25, 176, 320, 1, 1);
      if (N['g-foreL']) T(N['g-foreL'], 124, 434, noise(t * 0.3, 7) * 0.25, 0, 0, 1, 1);
      if (N['g-armR']) T(N['g-armR'], 0, 0, noise(t * 0.22, 5) * 0.45 + br * 0.4, 344, 320, 1, 1);
      const fr = -23 + noise(t * 0.35, 6) * 1.1 - S.ph.x * 1.2;
      if (N['g-foreR']) N['g-foreR'].setAttribute('transform', 'translate(418 458) rotate(' + f(fr) + ')');
      const pr = noise(t * 0.5, 8) * 1.1 + S.ph.x * 2.2;
      if (N['g-phone']) N['g-phone'].setAttribute('transform', 'translate(0 -128.2) rotate(' + f(pr) + ') translate(0 128.2) translate(34 -189.4) rotate(29)');

      // Thumb tap reaction
      const tap = clamp(1 - Math.abs((t - S.countStart - 0.05) / 0.12), 0, 1);
      if (N['g-thumb']) N['g-thumb'].setAttribute('transform', 'translate(0 ' + f(tap * 3) + ')');

      // Left-hand finger drum on ledge
      if (t > S.drumAt) { S.drumStart = t; S.drumAt = t + rnd(5, 10); }
      const K = { fPinky: [56, 18], fRing: [56, 6.5], fMid: [56, -5], fIdx: [56, -16.5] };
      const ord = ['fPinky', 'fRing', 'fMid', 'fIdx'];
      for (let i = 0; i < 4; i++) {
        const lt = t - S.drumStart - i * 0.11;
        const a = (lt > 0 && lt < 0.32) ? -11 * Math.sin(Math.PI * lt / 0.32) : 0;
        const kk = K[ord[i]];
        if (N[ord[i]]) N[ord[i]].setAttribute('transform', 'rotate(' + f(a) + ' ' + kk[0] + ' ' + kk[1] + ')');
      }

      // Phone screen
      S.flash = Math.max(0, S.flash - dt * 1.5);
      S.glow = Math.max(0, S.glow - dt * 0.45);
      S.face = Math.max(0, S.face - dt * 0.5);
      if (N.scrFlash) N.scrFlash.setAttribute('opacity', f(S.flash));
      if (N.phoneGlow) N.phoneGlow.setAttribute('opacity', f(0.38 + S.glow * 0.45 + 0.05 * Math.sin(t * 1.7)));
      if (N['h-screenlight']) N['h-screenlight'].setAttribute('opacity', f(0.1 + S.face * 0.5));
      if (N.scrPing) T(N.scrPing, 0, 0, 0, 0, 8, S.pop.x, S.pop.x);

      const cu = clamp((t - S.countStart) / 0.7, 0, 1);
      const ce = 1 - Math.pow(1 - cu, 3);
      const cv = lerp(0, S.amt, ce);
      const tA = '+₦' + fmtNum(S.countStart > -1 && cu < 1 ? cv : S.amt);
      const tT = '₦' + fmtNum(S.total - S.amt + (S.countStart > -1 ? (S.amt * ce) : S.amt));
      if (tA !== S.lastA) {
        if (N.scrAmt) { N.scrAmt.textContent = tA; fitStr(N.scrAmt, 15, 60, tA); }
        S.lastA = tA;
      }
      if (tT !== S.lastT) {
        if (N.scrTotal) { N.scrTotal.textContent = tT; fitStr(N.scrTotal, 15.5, 60, tT); }
        S.lastT = tT;
      }
      if (chip && S.chipOff && t > S.chipOff) {
        chip.classList.remove('on');
        S.chipOff = 0;
      }
    }

    /* ---------- loop ---------- */
    let rafId = 0;
    let t0 = 0;

    function step(t, dt) {
      // Due events
      const q = S.queue;
      S.queue = [];
      for (let j = 0; j < q.length; j++) {
        if (q[j].at <= t) q[j].fn();
        else S.queue.push(q[j]);
      }
      if (t > S.pingAt && t > 4 && !demoBusy) ping(false);
      updateGaze(dt);
      render(t, dt);
    }

    let prevNow = performance.now();
    function loop(now) {
      if (!S.running) return;
      if (!t0) t0 = now / 1000;
      const dt = Math.min(0.05, Math.max(0.001, (now - prevNow) / 1000));
      prevNow = now;
      S.t = now / 1000 - t0;
      step(S.t, dt);
      rafId = requestAnimationFrame(loop);
    }

    // Expose hook
    window.__man = { S, step, render, ping, greet, stop: () => { S.running = false; } };

    S.pingAt = 3.8;
    setTimeout(greet, 1200);
    rafId = requestAnimationFrame(loop);
    if (chip) {
      setTimeout(() => {
        const b = chip.querySelector('b');
        if (b) b.textContent = '₦250 received';
        chip.classList.add('on');
        S.chipOff = S.t + 3.5;
      }, 800);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      svg.removeEventListener('pointerdown', handleSvgDown);
      delete window.__man;
    };
  }, []);

  return (
    <figure className="man" ref={figureRef}><svg ref={svgRef} className="man-svg" id="manSvg" viewBox="0 40 520 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A Nigerian man leaning on the headline, smiling at his phone, which shows a ₦250 payment received"> <defs>   <linearGradient id="gSkin" gradientUnits="userSpaceOnUse" x1="205" y1="70" x2="318" y2="250"><stop offset="0" stopColor="#9E6843"/><stop offset=".5" stopColor="#7C4D31"/><stop offset="1" stopColor="#5B3722"/></linearGradient>   <linearGradient id="gSkinB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8F5C3B"/><stop offset="1" stopColor="#5E3A24"/></linearGradient>   <linearGradient id="gFing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#936041"/><stop offset="1" stopColor="#6A4228"/></linearGradient>   <linearGradient id="gShirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD84E"/><stop offset=".55" stopColor="#F2B705"/><stop offset="1" stopColor="#D49F04"/></linearGradient>   <linearGradient id="gScr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#19CF80"/><stop offset="1" stopColor="#07643C"/></linearGradient>   <radialGradient id="gGlow"><stop offset="0" stopColor="#2BE08F" stopOpacity=".8"/><stop offset="1" stopColor="#2BE08F" stopOpacity="0"/></radialGradient>   <radialGradient id="gScrLight" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#3CFFA6" stopOpacity=".6"/><stop offset=".6" stopColor="#3CFFA6" stopOpacity=".2"/><stop offset="1" stopColor="#3CFFA6" stopOpacity="0"/></radialGradient>   <linearGradient id="gBeardFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#17100c" stopOpacity="0"/><stop offset=".1" stopColor="#17100c" stopOpacity=".92"/><stop offset="1" stopColor="#17100c" stopOpacity=".98"/></linearGradient>   <linearGradient id="gNeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2e1a10"/><stop offset=".3" stopColor="#53321f"/><stop offset="1" stopColor="#6e4529"/></linearGradient>   <linearGradient id="gUnder" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a160b" stopOpacity="0"/><stop offset=".35" stopColor="#2a160b" stopOpacity=".26"/><stop offset="1" stopColor="#2a160b" stopOpacity=".2"/></linearGradient>   <radialGradient id="gHi" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#f1b98c" stopOpacity=".5"/><stop offset="1" stopColor="#f1b98c" stopOpacity="0"/></radialGradient>   <clipPath id="cpFace"><path d="M206 140 C206 96 230 72 260 72 C290 72 314 96 314 140 C314 170 312 190 300 212 C290 230 276 244 260 244 C244 244 230 230 220 212 C208 190 206 170 206 140 Z"/></clipPath>   <clipPath id="cpL"><path d="M221 153 Q236 139 251 153 Q236 163 221 153 Z"/></clipPath>   <clipPath id="cpR"><path d="M269 153 Q284 139 299 153 Q284 163 269 153 Z"/></clipPath>   <clipPath id="cpMouth"><path id="mouthClipPath" d="M240 222 Q260 220 280 222 Q260 240 240 222 Z"/></clipPath>   <clipPath id="cpScr"><rect x="-41" y="-83" width="82" height="166" rx="13"/></clipPath> </defs>  <g id="g-body">      <g id="g-torso">     <path d="M108 470 C104 392 122 338 186 308 L222 292 L260 322 L298 292 L334 308 C398 338 416 392 412 470 Z" fill="url(#gShirt)"/>     <path d="M334 308 C398 338 416 392 412 470 L354 470 C358 410 348 352 318 314 Z" fill="#7a5600" opacity=".26"/>     <path className="rim" d="M412 470 C416 392 398 338 334 308" stroke="#2BE08F" strokeOpacity=".3" strokeWidth="3" fill="none"/>     <path d="M178 324 C148 350 136 404 138 470" stroke="#fff" strokeOpacity=".14" strokeWidth="10" fill="none" strokeLinecap="round"/>     <path d="M208 378 C230 396 290 396 312 378" stroke="#8a6403" strokeOpacity=".22" strokeWidth="3" fill="none"/>     <path d="M170 410 C200 424 230 428 250 430 M350 410 C320 424 292 428 272 430" stroke="#8a6403" strokeOpacity=".16" strokeWidth="3" fill="none" strokeLinecap="round"/>     <path d="M184 318 C198 346 198 382 184 414" stroke="#8a6403" strokeOpacity=".22" strokeWidth="3.4" fill="none" strokeLinecap="round"/><path d="M336 318 C322 346 322 382 336 414" stroke="#8a6403" strokeOpacity=".26" strokeWidth="3.4" fill="none" strokeLinecap="round"/>     <path d="M226 430 q14 9 30 5 M268 436 q16 6 30 -2" stroke="#8a6403" strokeOpacity=".14" strokeWidth="3" fill="none" strokeLinecap="round"/>     <path d="M150 346 C170 338 184 340 194 350" stroke="#fff" strokeOpacity=".12" strokeWidth="5" fill="none" strokeLinecap="round"/>          <g transform="translate(318 376)"><rect x="-15" y="-15" width="30" height="30" rx="8" fill="#0E9D5C"/><rect x="-9" y="-8" width="18" height="14" rx="3.5" fill="#0B1410"/><path d="M2 -5 L7 0 L2 5" stroke="#0E9D5C" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="-10" r="3.4" fill="#F2B705" stroke="#0B1410" strokeWidth="1"/></g>   </g>      <g id="g-neck">     <path d="M228 214 L226 290 Q260 324 294 290 L292 214 Z" fill="url(#gNeck)"/>     <path d="M240 252 Q242 286 254 316" stroke="#c28a62" strokeOpacity=".16" strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M280 252 Q278 286 266 316" stroke="#c28a62" strokeOpacity=".12" strokeWidth="5" fill="none" strokeLinecap="round"/>     <path d="M246 296 Q260 306 274 296" stroke="#2a160b" strokeOpacity=".3" strokeWidth="3" fill="none" strokeLinecap="round"/>     <path d="M236 292 L260 334 L284 292 Z" fill="#41261a"/>   </g>      <g id="g-collar">     <path d="M196 298 L232 284 L260 336 L222 340 Z" fill="#FFD84E" stroke="#B88A04" strokeWidth="2.4" strokeLinejoin="round"/>     <path d="M324 298 L288 284 L260 336 L298 340 Z" fill="#F2B705" stroke="#B88A04" strokeWidth="2.4" strokeLinejoin="round"/>     <path d="M200 301 L230 289 L257 334 M320 301 L290 289 L263 334" stroke="#fff" strokeOpacity=".38" strokeWidth="1.4" strokeDasharray="3 3" fill="none"/>     <path d="M260 336 L260 398" stroke="#B88A04" strokeWidth="3"/>     <circle cx="260" cy="356" r="3.6" fill="#0B1410"/><circle cx="260" cy="380" r="3.6" fill="#0B1410"/>   </g>       <g id="g-head"><g transform="translate(0 11) translate(260 250) scale(1.07) translate(-260 -250)">     <g id="h-ears">       <path d="M208 142 C194 138 190 156 195 172 C198 182 207 188 212 180 Z" fill="#6A4129"/><path d="M205 150 C198 150 198 164 202 172" stroke="#3a2012" strokeOpacity=".5" strokeWidth="2.4" fill="none" strokeLinecap="round"/>       <path d="M312 142 C326 138 330 156 325 172 C322 182 313 188 308 180 Z" fill="#5C3822"/>     </g>     <path id="h-face" d="M206 140 C206 96 230 72 260 72 C290 72 314 96 314 140 C314 170 312 190 300 212 C290 230 276 244 260 244 C244 244 230 230 220 212 C208 190 206 170 206 140 Z" fill="url(#gSkin)"/>     <path d="M314 140 C314 170 312 190 300 212 C290 230 276 244 260 244 C282 232 296 208 298 176 C299 150 296 118 280 92 C300 100 314 118 314 140 Z" fill="#241208" opacity=".18"/>     <path className="rim" d="M313 160 C312 180 307 198 296 216 C288 228 276 240 262 244" stroke="#2BE08F" strokeOpacity=".16" strokeWidth="2" fill="none" strokeLinecap="round"/>     <ellipse id="h-screenlight" cx="306" cy="176" rx="17" ry="38" fill="url(#gScrLight)" opacity="0" clipPath="url(#cpFace)"/>     <ellipse cx="244" cy="108" rx="30" ry="12" fill="url(#gHi)" opacity=".8"/><ellipse cx="226" cy="170" rx="14" ry="8" fill="url(#gHi)" opacity=".32"/><path d="M224 165 Q237 171 251 166" stroke="#2a160b" strokeOpacity=".14" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M270 166 Q284 171 297 165" stroke="#2a160b" strokeOpacity=".12" strokeWidth="3" fill="none" strokeLinecap="round"/>     <g id="h-cheek"><ellipse cx="224" cy="186" rx="12" ry="7" fill="#C58A62" opacity=".12"/><ellipse cx="296" cy="186" rx="11" ry="6" fill="#C58A62" opacity=".08"/>       <path d="M232 192 C230 204 236 214 244 218" stroke="#2a160b" strokeOpacity=".2" strokeWidth="2.4" fill="none" strokeLinecap="round"/><path d="M288 192 C290 204 284 214 276 218" stroke="#2a160b" strokeOpacity=".2" strokeWidth="2.4" fill="none" strokeLinecap="round"/></g>          <g id="h-beard">       <path d="M208 160 C204 214 226 246 260 248 C294 246 316 214 312 160 C310 190 292 202 280 206 L240 206 C228 202 210 190 208 160 Z" fill="url(#gBeardFade)"/>       <path d="M210 150 C206 176 212 196 226 210 C218 192 214 172 214 150 Z" fill="#17100c" opacity=".7"/><path d="M310 150 C314 176 308 196 294 210 C302 192 306 172 306 150 Z" fill="#17100c" opacity=".7"/>       <ellipse cx="260" cy="226" rx="27" ry="13.5" fill="#6B3A28"/><ellipse cx="260" cy="228" rx="27" ry="13.5" fill="#000" opacity=".08"/>     </g>          <g id="h-nose">       <path d="M262 160 C268 180 277 192 275 198 C271 204 262 205 260 205 L260 162 Z" fill="#3a2012" opacity=".22"/>       <path d="M254 150 C252 170 250 184 248 192" stroke="#d29a72" strokeOpacity=".3" strokeWidth="5" fill="none" strokeLinecap="round"/>       <ellipse cx="260" cy="195" rx="9" ry="6.5" fill="#B97D56" opacity=".3"/>       <path d="M244 192 C240 196 242 202 248 204" stroke="#2a160b" strokeOpacity=".38" strokeWidth="2.2" fill="none" strokeLinecap="round"/><path d="M276 192 C280 196 278 202 272 204" stroke="#2a160b" strokeOpacity=".38" strokeWidth="2.2" fill="none" strokeLinecap="round"/>       <ellipse cx="251" cy="203" rx="4.6" ry="2.4" fill="#1b0d05" opacity=".7"/><ellipse cx="269" cy="203" rx="4.6" ry="2.4" fill="#1b0d05" opacity=".7"/>     </g>          <g id="h-eyes">       <g id="eyeL">         <g clipPath="url(#cpL)">           <path d="M221 153 Q236 139 251 153 Q236 163 221 153 Z" fill="#F2ECE2"/>           <g id="irisL"><circle cx="236" cy="152" r="8.6" fill="#2a170c"/><circle cx="236" cy="152" r="6.6" fill="#4b2a14"/><circle cx="236" cy="152" r="3.6" fill="#0c0603"/><circle cx="233" cy="149" r="2" fill="#fff" opacity=".95"/><circle cx="239.5" cy="155" r="1" fill="#fff" opacity=".6"/></g>           <path id="lidL" d="M219 153 Q236 139 253 153 L253 128 L219 128 Z" fill="#835335"/>           <path id="lowL" d="M219 163 Q236 157 253 163 L253 176 L219 176 Z" fill="#835335"/>         </g>         <path id="lashL" d="M220 153 Q236 139 252 153" stroke="#150a05" strokeWidth="2.8" fill="none" strokeLinecap="round"/>         <path d="M222 146 Q236 133 252 143" stroke="#2a160b" strokeOpacity=".35" strokeWidth="2.4" fill="none" strokeLinecap="round"/>       </g>       <g id="eyeR">         <g clipPath="url(#cpR)">           <path d="M269 153 Q284 139 299 153 Q284 163 269 153 Z" fill="#F2ECE2"/>           <g id="irisR"><circle cx="284" cy="152" r="8.6" fill="#2a170c"/><circle cx="284" cy="152" r="6.6" fill="#4b2a14"/><circle cx="284" cy="152" r="3.6" fill="#0c0603"/><circle cx="281" cy="149" r="2" fill="#fff" opacity=".95"/><circle cx="287.5" cy="155" r="1" fill="#fff" opacity=".6"/></g>           <path id="lidR" d="M267 153 Q284 139 301 153 L301 128 L267 128 Z" fill="#7A4B30"/>           <path id="lowR" d="M267 163 Q284 157 301 163 L301 176 L267 176 Z" fill="#7A4B30"/>         </g>         <path id="lashR" d="M268 153 Q284 139 300 153" stroke="#150a05" strokeWidth="2.8" fill="none" strokeLinecap="round"/>         <path d="M268 143 Q284 133 298 146" stroke="#2a160b" strokeOpacity=".35" strokeWidth="2.4" fill="none" strokeLinecap="round"/>       </g>     </g>          <g id="h-brows">       <path id="browL" d="M212 136 Q224 120 254 127 L254 133 Q232 129 217 143 Z" fill="#130d0a"/>       <path id="browR" d="M308 136 Q296 120 266 127 L266 133 Q288 129 303 143 Z" fill="#130d0a"/>     </g>          <g id="h-mouth">       <path d="M229 218 Q245 205 260 211 Q275 205 291 218 Q275 223 260 220 Q245 223 229 218 Z" fill="#14100d"/>       <path id="mouthIn" d="M240 222 Q260 220 280 222 Q260 240 240 222 Z" fill="#40170f"/>       <g clipPath="url(#cpMouth)"><rect id="teeth" x="236" y="219" width="48" height="12" rx="3" fill="#F6F0E6"/><ellipse id="tongue" cx="260" cy="236" rx="13" ry="5" fill="#9b4a3d"/></g>       <path id="lipLow" d="M242 224 Q260 242 278 224" stroke="#7c4030" strokeWidth="3.6" fill="none" strokeLinecap="round" opacity=".85"/>     </g>          <g id="h-hair">       <path d="M207 124 C196 78 230 52 260 52 C290 52 324 78 313 124 C311 106 292 90 260 90 C228 90 209 106 207 124 Z" fill="#15100D"/>       <path d="M207 116 L213 116 C213 126 214 134 216 142 C209 136 207 128 207 116 Z" fill="#15100D"/><path d="M313 116 L307 116 C307 126 306 134 304 142 C311 136 313 128 313 116 Z" fill="#15100D"/>       <g stroke="#3a2f29" strokeWidth="1.6" fill="none" opacity=".6" strokeLinecap="round"><path d="M222 70 Q260 52 298 70"/><path d="M216 80 Q260 60 304 80"/><path d="M212 90 Q260 70 308 90"/></g>            </g>   </g></g>       <g id="g-armL">     <g id="g-foreL" transform="translate(124 434)">       <path d="M0 -20 L62 -19 Q80 -18 90 -17 L90 17 Q80 19 62 20 L0 22 Q-22 22 -22 1 Q-22 -20 0 -20 Z" fill="url(#gSkinB)"/>       <path d="M-4 8 Q50 10 90 9 L90 17 Q80 19 62 20 L0 22 Z" fill="url(#gUnder)"/>       <g id="g-handL" transform="translate(90 0)">         <path d="M18 14 Q48 36 76 30" stroke="url(#gFing)" strokeWidth="11" fill="none" strokeLinecap="round"/>         <g id="fPinky"><g transform="rotate(3 56 18)"><rect x="52" y="12.25" width="27" height="11.5" rx="5.75" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><g transform="rotate(7 73 18)"><rect x="68" y="12.75" width="31" height="10.5" rx="5.25" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><ellipse cx="94" cy="17.5" rx="3.8" ry="2.5" fill="#D6AE92" opacity=".55"/></g><path d="M71 14.25 q2 4.75 0 7.5" stroke="#2a160b" strokeOpacity=".3" strokeWidth="1.2" fill="none" strokeLinecap="round"/></g></g><g id="fRing"><g transform="rotate(2 56 6.5)"><rect x="52" y="0.75" width="32" height="11.5" rx="5.75" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><g transform="rotate(7 78 6.5)"><rect x="73" y="1.25" width="34" height="10.5" rx="5.25" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><ellipse cx="102" cy="6.0" rx="3.8" ry="2.5" fill="#D6AE92" opacity=".55"/></g><path d="M76 2.75 q2 4.75 0 7.5" stroke="#2a160b" strokeOpacity=".3" strokeWidth="1.2" fill="none" strokeLinecap="round"/></g></g><g id="fMid"><g transform="rotate(1 56 -5)"><rect x="52" y="-10.75" width="34" height="11.5" rx="5.75" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><g transform="rotate(6 80 -5)"><rect x="75" y="-10.25" width="37" height="10.5" rx="5.25" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><ellipse cx="107" cy="-5.5" rx="3.8" ry="2.5" fill="#D6AE92" opacity=".55"/></g><path d="M78 -8.75 q2 4.75 0 7.5" stroke="#2a160b" strokeOpacity=".3" strokeWidth="1.2" fill="none" strokeLinecap="round"/></g></g><g id="fIdx"><g transform="rotate(0 56 -16.5)"><rect x="52" y="-22.25" width="33" height="11.5" rx="5.75" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><g transform="rotate(6 79 -16.5)"><rect x="74" y="-21.75" width="35" height="10.5" rx="5.25" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><ellipse cx="104" cy="-17.0" rx="3.8" ry="2.5" fill="#D6AE92" opacity=".55"/></g><path d="M77 -20.25 q2 4.75 0 7.5" stroke="#2a160b" strokeOpacity=".3" strokeWidth="1.2" fill="none" strokeLinecap="round"/></g></g>         <path d="M-2 -19 C14 -26 38 -27 58 -25 L62 24 C40 26 18 23 -2 19 Z" fill="url(#gSkinB)"/>         <path d="M6 -15 C22 -21 40 -21 54 -20" stroke="#c28a62" strokeOpacity=".4" strokeWidth="2.4" fill="none" strokeLinecap="round"/>       </g>       <g transform="translate(74 0)"><rect x="-8" y="-22" width="16" height="44" rx="5" fill="#0B1410"/><rect x="-5" y="-9" width="10" height="16" rx="3" fill="#F2B705"/><rect x="-3.5" y="-6.5" width="3" height="11" rx="1.5" fill="#fff" opacity=".5"/></g>     </g>     <path d="M186 306 C150 314 116 342 104 394 L100 418 L166 426 L172 382 C176 350 184 328 206 312 Z" fill="url(#gShirt)"/>     <path d="M102 404 Q134 416 168 410" stroke="#B88A04" strokeWidth="2.4" fill="none"/>        </g>       <g id="g-armR">     <path d="M388 396 L418 458" stroke="url(#gSkinB)" strokeWidth="50" strokeLinecap="round" fill="none"/>     <path d="M334 308 C370 316 404 344 416 394 L420 418 L354 426 L348 382 C344 350 336 328 314 312 Z" fill="url(#gShirt)"/>     <path d="M352 408 Q386 418 418 412" stroke="#B88A04" strokeWidth="2.4" fill="none"/>     <g id="g-foreR" transform="translate(418 458) rotate(-23)">       <path d="M-22 6 L-18 -112 Q-17 -128 0 -128 Q17 -128 18 -112 L22 6 Q22 22 0 22 Q-22 22 -22 6 Z" fill="url(#gSkinB)"/>       <g id="g-phone" transform="translate(34 -189.4) rotate(29)">         <ellipse id="phoneGlow" cx="0" cy="0" rx="100" ry="120" fill="url(#gGlow)" opacity=".4"/>         <path d="M-42 28 C-50 72 -32 112 4 116 C38 114 58 88 60 50 L58 6 L-30 12 Z" fill="url(#gSkinB)"/>         <path d="M-30 90 C-20 108 0 116 18 114" stroke="#2a160b" strokeOpacity=".2" strokeWidth="3" fill="none" strokeLinecap="round"/>                  <g id="fingsR"><rect x="30" y="48" width="26" height="15" rx="7.5" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><path d="M40 51 Q48 50 52 53" stroke="#c28a62" strokeOpacity=".5" strokeWidth="1.6" fill="none" strokeLinecap="round"/><path d="M36 51 q2 4.5 0 9" stroke="#2a160b" strokeOpacity=".28" strokeWidth="1.1" fill="none" strokeLinecap="round"/><rect x="30" y="32" width="32" height="17" rx="8.5" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><path d="M46 35 Q54 34 58 37" stroke="#c28a62" strokeOpacity=".5" strokeWidth="1.6" fill="none" strokeLinecap="round"/><path d="M42 35 q2 5.5 0 11" stroke="#2a160b" strokeOpacity=".28" strokeWidth="1.1" fill="none" strokeLinecap="round"/><rect x="30" y="15" width="33" height="17" rx="8.5" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><path d="M47 18 Q55 17 59 20" stroke="#c28a62" strokeOpacity=".5" strokeWidth="1.6" fill="none" strokeLinecap="round"/><path d="M43 18 q2 5.5 0 11" stroke="#2a160b" strokeOpacity=".28" strokeWidth="1.1" fill="none" strokeLinecap="round"/><rect x="30" y="-2" width="30" height="17" rx="8.5" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/><path d="M44 1 Q52 0 56 3" stroke="#c28a62" strokeOpacity=".5" strokeWidth="1.6" fill="none" strokeLinecap="round"/><path d="M40 1 q2 5.5 0 11" stroke="#2a160b" strokeOpacity=".28" strokeWidth="1.1" fill="none" strokeLinecap="round"/></g>         <rect x="-46" y="-88" width="92" height="176" rx="17" fill="#0B1410"/>         <rect x="-44.6" y="-86.6" width="89.2" height="173.2" rx="16" fill="none" stroke="#2f3d36" strokeWidth="1.4"/>         <g id="g-screen">           <g clipPath="url(#cpScr)">             <rect x="-41" y="-83" width="82" height="166" fill="url(#gScr)"/>             <text x="-30" y="-58" fontFamily="Baloo 2,Inter,Arial,sans-serif" fontWeight="800" fontSize="9" fill="#fff" opacity=".9">OyaPay</text>             <text x="30" y="-58" textAnchor="end" fontFamily="Inter,Arial,sans-serif" fontWeight="600" fontSize="7.5" fill="#C9F0DB">Today</text>             <text id="scrTotal" x="-30" y="-40" fontFamily="Baloo 2,Inter,Arial,sans-serif" fontWeight="800" fontSize="17" fill="#fff">₦12,650</text>             <g id="scrPing"><circle cx="0" cy="8" r="23" fill="#F2B705" stroke="#0B1410" strokeWidth="2.6"/><path d="M-9 8 l6.5 6.5 l12.5 -14" stroke="#0B1410" strokeWidth="4.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g>             <text id="scrAmt" x="0" y="55" textAnchor="middle" fontFamily="Baloo 2,Inter,Arial,sans-serif" fontWeight="800" fontSize="17" fill="#fff">+₦250</text>             <text x="5" y="67" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontWeight="600" fontSize="7" fill="#C9F0DB">Maryland · just now</text>             <rect x="-26" y="73" width="52" height="5" rx="2.5" fill="#fff" opacity=".25"/>             <g id="scrDemo" opacity="0" style={{ pointerEvents: 'none' }}>             <rect x="-41" y="-83" width="82" height="166" fill="#0B1410"/>             <rect x="-41" y="-83" width="82" height="166" fill="url(#gScr)" opacity=".22"/>             <text id="dmTop" x="0" y="-62" textAnchor="middle" fontFamily="Baloo 2,Inter,Arial,sans-serif" fontWeight="800" fontSize="9.5" fill="#fff">Rider scans your code</text>             <g id="dmQRg"><rect x="-29" y="-52" width="58" height="58" rx="6" fill="#F7F5EF"/><g id="dmQR" transform="translate(-26 -49)" fill="#0B1410"></g></g>             <rect id="dmLine" x="-31" y="-50" width="62" height="2.6" rx="1.3" fill="#2BE08F"/>             <g id="dmSlide" opacity="0">               <rect x="-31" y="38" width="62" height="20" rx="10" fill="#123324" stroke="#2BE08F" strokeWidth="1.2"/>               <rect id="dmFill" x="-31" y="38" width="20" height="20" rx="10" fill="#0E9D5C"/>               <text id="dmLab" x="7" y="51.3" textAnchor="middle" fontFamily="Inter,Arial,sans-serif" fontWeight="700" fontSize="6.6" fill="#C9F0DB">Slide to pay ₦150</text>               <g id="dmThumb"><circle cx="-21" cy="48" r="8" fill="#F2B705" stroke="#0B1410" strokeWidth="1.6"/><path d="M-24 48 h6 m-2.6 -3 l3 3 l-3 3" stroke="#0B1410" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g>             </g>             <g id="dmOk" opacity="0"><circle cx="0" cy="-8" r="19" fill="#F2B705" stroke="#0B1410" strokeWidth="2.4"/><path d="M-8 -8 l5.5 5.5 l11 -12" stroke="#0B1410" strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/><text x="0" y="30" textAnchor="middle" fontFamily="Baloo 2,Inter,Arial,sans-serif" fontWeight="800" fontSize="12" fill="#fff">Paid ₦150</text></g>           </g>           <rect id="scrFlash" x="-41" y="-83" width="82" height="166" fill="#fff" opacity="0"/>             <rect x="-41" y="-83" width="82" height="166" fill="#fff" opacity=".04"/>           </g>           <rect x="-15" y="-80" width="30" height="8" rx="4" fill="#000"/>         </g>                  <g id="g-thumb" >           <path d="M-49 86 C-55 60 -51 36 -46 22 Q-42 12 -36 15 Q-31 20 -34 33 C-36 48 -36 64 -33 80 Z" fill="url(#gFing)" stroke="#5a3820" strokeWidth="1"/>           <path d="M-48 70 C-50 56 -47 40 -44 30" stroke="#c28a62" strokeOpacity=".45" strokeWidth="2.2" fill="none" strokeLinecap="round"/>           <path d="M-45 22 Q-39 13 -34 18 Q-32 24 -35 29 Q-40 31 -45 26 Z" fill="#D8B093" opacity=".6"/>           <path d="M-47 52 q6 3 13 0" stroke="#2a160b" strokeOpacity=".32" strokeWidth="1.3" fill="none" strokeLinecap="round"/>         </g>       </g>     </g>        </g> </g> </svg><button ref={btnRef} className="man-try show" id="manTry" type="button"><i></i>Tap his phone<span className="mt-x"> · try a payment</span></button><div ref={chipRef} className="man-chip" aria-hidden="true"><i>₦</i><div><b>₦250 received</b><small>Maryland · just now</small></div></div></figure>
  );
};

export default HeroMan;

