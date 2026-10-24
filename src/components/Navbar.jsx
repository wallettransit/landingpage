import React, { useState, useEffect } from 'react';
import { sound } from '../services/sound';

export const Navbar = () => {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolledDown(y > 100 && y > lastY);
      lastY = y;

      const sections = ['pay', 'demo', 'app', 'moves', 'budget', 'earn', 'faq'];
      const scrollPos = y + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveHash('#' + sections[i]);
          break;
        }
      }
      if (y < 200) {
        setActiveHash('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`nav ${isScrolledDown ? 'hide' : ''}`} id="nav">
      <a className="brand" href="#top" aria-label="OyaPay home" onClick={() => sound.playClick()}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <rect width="200" height="200" rx="46" fill="#0E9D5C" />
          <rect x="44" y="56" width="112" height="86" rx="18" fill="#0B1410" />
          <path
            d="M118 78 L142 99 L118 120"
            fill="none"
            stroke="#0E9D5C"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="140" cy="56" r="15" fill="#F2B705" stroke="#0B1410" strokeWidth="3" />
        </svg>
        OyaPay
      </a>

      <nav className="nav-links" aria-label="Primary" id="navLinks">
        <a
          href="#pay"
          className={activeHash === '#pay' ? 'act' : ''}
          onClick={() => sound.playClick()}
        >
          Pay your way
        </a>
        <a
          href="#demo"
          className={activeHash === '#demo' ? 'act' : ''}
          onClick={() => sound.playClick()}
        >
          Live demo
        </a>
        <a
          href="#app"
          className={activeHash === '#app' ? 'act' : ''}
          onClick={() => sound.playClick()}
        >
          The app
        </a>
        <a
          href="#moves"
          className={activeHash === '#moves' ? 'act' : ''}
          onClick={() => sound.playClick()}
        >
          Features
        </a>
        <a
          href="#budget"
          className={activeHash === '#budget' ? 'act' : ''}
          onClick={() => sound.playClick()}
        >
          Budget
        </a>
        <a
          href="#earn"
          className={activeHash === '#earn' ? 'act' : ''}
          onClick={() => sound.playClick()}
        >
          For drivers
        </a>
        <a
          href="#faq"
          className={activeHash === '#faq' ? 'act' : ''}
          onClick={() => sound.playClick()}
        >
          FAQ
        </a>
      </nav>

      <a className="btn btn-em mag" href="#join" onClick={() => sound.playTap()}>
        Join the waitlist
      </a>
    </header>
  );
};

export default Navbar;
