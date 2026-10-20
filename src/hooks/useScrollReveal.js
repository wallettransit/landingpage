import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasIO = 'IntersectionObserver' in window;

    // Scroll reveal observer
    let io = null;
    const rvEls = Array.from(document.querySelectorAll('.rv'));

    if (hasIO && !reduce) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
      );

      rvEls.forEach((el) => io.observe(el));
    } else {
      rvEls.forEach((el) => el.classList.add('in'));
    }

    // Count-up animation
    function count(el) {
      const to = +(el.dataset.count || 0);
      const pre = el.dataset.pre || '';
      if (reduce) {
        el.textContent = pre + to.toLocaleString('en-NG');
        return;
      }
      const t0 = performance.now();
      const dur = 1200;

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

    if (hasIO && !reduce) {
      cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              count(e.target);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.4 }
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

    return () => {
      if (io) io.disconnect();
      if (cio) cio.disconnect();
    };
  }, []);
}
