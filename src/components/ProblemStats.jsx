import React, { useEffect, useRef, useState } from 'react';

const STATS = [
  {
    prefix: '₦',
    num: 82,
    suffix: 'B',
    label: 'paid yearly by Lagos danfo drivers in union levies — cash that leaves no trace, and no way to know real earnings.'
  },
  {
    prefix: '',
    num: 75000,
    suffix: '',
    format: true,
    label: 'danfo buses on Lagos roads today, running entirely on physical cash, every single trip.'
  },
  {
    prefix: '₦',
    num: 50,
    suffix: '–100',
    label: 'lost to disputed or unavailable change, on almost every ride, for almost every passenger.'
  }
];

const AnimatedCounter = ({ stat }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = stat.num;
          const duration = 2000;
          const increment = end / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.ceil(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, [stat.num]);

  return (
    <div className="stat-num" ref={elementRef}>
      {stat.prefix}
      {stat.format ? count.toLocaleString() : count}
      {stat.suffix}
    </div>
  );
};

export const ProblemStats = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          sectionRef.current.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section light reveal-up" ref={sectionRef}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow-plain">THE PROBLEM</span>
          <h2 className="section-title">Cash was never built for this many people.</h2>
        </div>
        <div className="stat-grid">
          {STATS.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <AnimatedCounter stat={stat} />
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
