import React from 'react';

export const Footer = () => {
  return (
    <footer>
      <div className="wrap f-in">
        <a className="brand" href="#top" aria-label="OyaPay home">
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
        <p>Pre-launch. Features and details may change before release. · Lagos, Nigeria · © 2026 OyaPay</p>
        <div className="f-links">
          <a href="#pay">Pay your way</a>
          <a href="#faq">FAQ</a>
          <a href="#join">Join</a>
        </div>
      </div>
    </footer>
  );
};
