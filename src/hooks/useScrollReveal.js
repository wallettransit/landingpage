import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const hasIO = 'IntersectionObserver' in window;
    const rvEls = Array.from(document.querySelectorAll('.rv'));

    // Reveal elements already in viewport immediately on mount
    rvEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('in');
      }
    });

    let io = null;
    if (hasIO) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '40px 0px 40px 0px' }
      );

      rvEls.forEach((el) => {
        if (!el.classList.contains('in')) {
          io.observe(el);
        }
      });
    } else {
      rvEls.forEach((el) => el.classList.add('in'));
    }

    // Count-up animation
    function count(el) {
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';
      const to = +(el.dataset.count || 0);
      const pre = el.dataset.pre || '';
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

    return () => {
      if (io) io.disconnect();
      if (cio) cio.disconnect();
    };
  }, []);
}
