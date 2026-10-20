import React, { useState, useEffect } from 'react';

export const Navbar = () => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setHide(currentScroll > lastScroll && currentScroll > 160);
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`nav ${hide ? 'hide' : ''}`} id="nav">
      <a className="brand" href="#top" aria-label="OyaPay home">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <rect width="200" height="200" rx="46" fill="#0E9D5C" />
          <rect x="44" y="56" width="112" height="86" rx="18" fill="#0B1410" />
          <path
            d="M118 78 L142 99 L118 120"
            fill="none"
            stroke="#0E9D5C"
            stroke-width="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="140" cy="56" r="15" fill="#F2B705" stroke="#0B1410" stroke-width="3" />
        </svg>
        OyaPay
      </a>
      <nav className="nav-links" aria-label="Primary">
        <a href="#pay">Pay your way</a>
        <a href="#moves">Features</a>
        <a href="#earn">For drivers</a>
        <a href="#faq">FAQ</a>
      </nav>
      <a className="btn btn-em" href="#join">
        Join the waitlist
      </a>
    </header>
  );
};
