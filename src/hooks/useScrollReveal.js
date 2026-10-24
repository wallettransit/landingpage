import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const hasIO = 'IntersectionObserver' in window;

    // Split headings into masked words if motion is not reduced
    if (!reduceMotion) {
      const splitEls = Array.from(document.querySelectorAll('.split:not([data-split-done])'));
      splitEls.forEach((node) => {
        node.setAttribute('data-split-done', 'true');
        const counter = { n: 0 };

        function splitNode(curr) {
          Array.from(curr.childNodes).forEach((ch) => {
            if (ch.nodeType === 3) {
              const parts = ch.textContent.split(/(\s+)/);
              const frag = document.createDocumentFragment();
              parts.forEach((p) => {
                if (!p) return;
                if (/^\s+$/.test(p)) {
                  frag.appendChild(document.createTextNode(' '));
                  return;
                }
                const w = document.createElement('span');
                w.className = 'sw';
                const i = document.createElement('i');
                i.textContent = p;
                i.style.setProperty('--k', counter.n++);
                w.appendChild(i);
                frag.appendChild(w);
              });
              curr.replaceChild(frag, ch);
            } else if (ch.nodeType === 1) {
              splitNode(ch);
            }
          });
        }

        splitNode(node);
      });
    }

    const pending = Array.from(document.querySelectorAll('.rv, .split'));
    const prog = document.getElementById('prog');

    let ticking = false;

    function sweep() {
      ticking = false;
      const vh = window.innerHeight;

      for (let i = pending.length - 1; i >= 0; i--) {
        const r = pending[i].getBoundingClientRect();
        if (r.top < vh * 0.93) {
          pending[i].classList.add('in');
          pending.splice(i, 1);
        }
      }

      if (prog) {
        const scrollH = document.documentElement.scrollHeight - vh;
        prog.style.transform = `scaleX(${scrollH > 0 ? Math.min(1, window.scrollY / scrollH) : 0})`;
      }
    }

    function queueSweep() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sweep);
      }
    }

    window.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', queueSweep);

    sweep();
    const tSweep = setTimeout(sweep, 350);

    // Number count-up animations for data-count
    function count(el) {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';
      const to = +(el.dataset.count || 0);
      const pre = el.dataset.pre || '';

      if (reduceMotion) {
        el.textContent = pre + to.toLocaleString('en-NG');
        return;
      }

      const t0 = performance.now();
      const dur = 1000;

      function step(now) {
        const k = Math.min(1, (now - t0) / dur);
        const ease = 1 - Math.pow(1 - k, 3);
        el.textContent = pre + Math.round(to * ease).toLocaleString('en-NG');
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    let cio = null;
    const countEls = Array.from(document.querySelectorAll('[data-count]'));

    if (hasIO) {
      cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              count(e.target);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      countEls.forEach((el) => {
        if (!el.closest('.panel:not(.on)')) {
          cio.observe(el);
        }
      });
    } else {
      countEls.forEach((el) => {
        const to = +(el.dataset.count || 0);
        const pre = el.dataset.pre || '';
        el.textContent = pre + to.toLocaleString('en-NG');
      });
    }

    // Magnetic buttons & Spotlight on hover
    let handlePointerMove = null;
    let handlePointerLeave = null;

    if (!reduceMotion && !coarsePointer) {
      handlePointerMove = (e) => {
        const spot = e.target.closest && e.target.closest('.spot');
        if (spot) {
          const r = spot.getBoundingClientRect();
          spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
          spot.style.setProperty('--my', `${e.clientY - r.top}px`);
        }

        const mag = e.target.closest && e.target.closest('.mag');
        if (mag) {
          const r = mag.getBoundingClientRect();
          mag.style.setProperty('--tx', `${(e.clientX - r.left - r.width / 2) * 0.2}px`);
          mag.style.setProperty('--ty', `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
        }
      };

      handlePointerLeave = (e) => {
        const mag = e.target.closest && e.target.closest('.mag');
        if (mag) {
          mag.style.setProperty('--tx', '0px');
          mag.style.setProperty('--ty', '0px');
        }
      };

      document.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerout', handlePointerLeave, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', queueSweep);
      window.removeEventListener('resize', queueSweep);
      clearTimeout(tSweep);
      if (cio) cio.disconnect();
      if (handlePointerMove) document.removeEventListener('pointermove', handlePointerMove);
      if (handlePointerLeave) document.removeEventListener('pointerout', handlePointerLeave);
    };
  }, []);
}

export default useScrollReveal;
