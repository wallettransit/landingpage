import React from 'react';
import '../styles/keke.css';

/**
 * Traffic fleet decorating the bottom wave of the hero section:
 * 1. Yellow Keke Marwa (side view) driving across to the right
 * 2. Yellow & Black Lagos Danfo Bus (side view) driving across with realistic staggered timing
 * 3. Compact Green/Teal Taxi (side view) driving across with slight speed offset
 *
 * All drive cleanly horizontally from left to right along the bottom organic wave,
 * looping smoothly with natural engine idle bobbing and rolling wheels.
 */
export const KekeRoad = () => (
  <div className="traffic-road" aria-hidden="true">
    {/* 1. Yellow Keke Marwa */}
    <div className="traffic-vehicle keke-vehicle">
      <div className="traffic-shadow"></div>
      <div className="vehicle-bob">
        <svg viewBox="0 0 130 84" className="vehicle-svg">
          {/* Top roof rack / canopy */}
          <rect x="16" y="6" width="78" height="9" rx="4.5" fill="#0B1410" />
          <rect x="24" y="14" width="4" height="12" fill="#0B1410" />
          <rect x="82" y="14" width="4" height="12" fill="#0B1410" />
          {/* Yellow body */}
          <path
            d="M10 58 V28 Q10 20 20 20 H80 Q96 20 104 42 L110 54 V58 Z"
            fill="#F2B705"
            stroke="#0B1410"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Green accent stripe */}
          <path d="M10 46 H108" stroke="#0E9D5C" strokeWidth="6" />
          {/* Passenger & driver cabin cutouts */}
          <rect x="22" y="27" width="40" height="15" rx="4" fill="#0B1410" opacity=".85" />
          <path d="M70 27 H80 Q90 28 95 40 H70 Z" fill="#0B1410" opacity=".85" />
          {/* Headlamp */}
          <circle cx="108" cy="50" r="3.2" fill="#F7F5EF" stroke="#0B1410" strokeWidth="1.5" />
          {/* Rear Wheel */}
          <g className="vehicle-wheel" style={{ transformOrigin: '30px 62px' }}>
            <circle cx="30" cy="62" r="11" fill="#0B1410" />
            <circle cx="30" cy="62" r="4.5" fill="#0E9D5C" />
            <path d="M30 53 V71 M21 62 H39" stroke="#8FA79A" strokeWidth="1.6" />
          </g>
          {/* Front Wheel */}
          <g className="vehicle-wheel" style={{ transformOrigin: '98px 64px' }}>
            <circle cx="98" cy="64" r="9" fill="#0B1410" />
            <circle cx="98" cy="64" r="3.6" fill="#0E9D5C" />
            <path d="M98 57 V71 M91 64 H105" stroke="#8FA79A" strokeWidth="1.6" />
          </g>
        </svg>
      </div>
    </div>

    {/* 2. Classic Lagos Danfo Bus */}
    <div className="traffic-vehicle danfo-vehicle">
      <div className="traffic-shadow"></div>
      <div className="vehicle-bob" style={{ animationDelay: '0.12s' }}>
        <svg viewBox="0 0 170 84" className="vehicle-svg">
          {/* Main Danfo Yellow Body */}
          <rect x="14" y="16" width="142" height="46" rx="9" fill="#F2B705" stroke="#0B1410" strokeWidth="3" />
          {/* Distinctive Danfo Twin Black Racing Stripes */}
          <rect x="14" y="44" width="142" height="4.5" fill="#0B1410" />
          <rect x="14" y="51.5" width="142" height="4.5" fill="#0B1410" />
          {/* Windshield & Windows */}
          <path d="M126 22 H148 Q152 22 153 26 L154 38 H126 Z" fill="#0B1410" opacity=".88" />
          <rect x="86" y="22" width="34" height="16" rx="3" fill="#0B1410" opacity=".88" />
          <rect x="48" y="22" width="32" height="16" rx="3" fill="#0B1410" opacity=".88" />
          <rect x="18" y="22" width="24" height="16" rx="3" fill="#0B1410" opacity=".88" />
          {/* Front Grille & Headlight */}
          <rect x="153" y="46" width="4" height="12" rx="1.5" fill="#0B1410" />
          <circle cx="152" cy="42" r="3.5" fill="#F7F5EF" stroke="#0B1410" strokeWidth="1.5" />
          {/* Taillight */}
          <rect x="12" y="38" width="3" height="8" rx="1" fill="#FF5252" />
          {/* Back Wheel */}
          <g className="vehicle-wheel" style={{ transformOrigin: '46px 64px' }}>
            <circle cx="46" cy="64" r="11" fill="#0B1410" />
            <circle cx="46" cy="64" r="4.5" fill="#F7F5EF" />
            <path d="M46 55 V73 M37 64 H55" stroke="#8FA79A" strokeWidth="1.6" />
          </g>
          {/* Front Wheel */}
          <g className="vehicle-wheel" style={{ transformOrigin: '130px 64px' }}>
            <circle cx="130" cy="64" r="11" fill="#0B1410" />
            <circle cx="130" cy="64" r="4.5" fill="#F7F5EF" />
            <path d="M130 55 V73 M121 64 H139" stroke="#8FA79A" strokeWidth="1.6" />
          </g>
        </svg>
      </div>
    </div>

    {/* 3. Modern City Taxi / Car */}
    <div className="traffic-vehicle taxi-vehicle">
      <div className="traffic-shadow"></div>
      <div className="vehicle-bob" style={{ animationDelay: '0.24s' }}>
        <svg viewBox="0 0 150 74" className="vehicle-svg">
          {/* Aerodynamic Sedan Body (Emerald / Cyan Green tone) */}
          <path
            d="M10 46 Q12 36 24 36 L44 36 L66 22 L110 22 L132 36 L142 40 Q146 44 146 50 L144 54 Q142 56 136 56 H14 Q10 56 10 46 Z"
            fill="#0E9D5C"
            stroke="#0B1410"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Taxi Roof Sign */}
          <rect x="80" y="16" width="22" height="6.5" rx="2" fill="#F2B705" stroke="#0B1410" strokeWidth="1.5" />
          {/* Sleek Tinted Windows */}
          <path d="M68 24 L50 36 H74 V24 Z" fill="#0B1410" opacity=".85" />
          <path d="M78 24 V36 H102 L98 24 Z" fill="#0B1410" opacity=".85" />
          <path d="M106 24 L110 36 H126 L118 24 Z" fill="#0B1410" opacity=".85" />
          {/* Headlamp & Taillight */}
          <path d="M140 42 L144 44 L141 48 Z" fill="#F7F5EF" stroke="#0B1410" strokeWidth="1.2" />
          <rect x="9" y="42" width="3" height="6" rx="1" fill="#FF5252" />
          {/* Rear Wheel */}
          <g className="vehicle-wheel" style={{ transformOrigin: '36px 54px' }}>
            <circle cx="36" cy="54" r="10" fill="#0B1410" />
            <circle cx="36" cy="54" r="4" fill="#8FA79A" />
            <path d="M36 46 V62 M28 54 H44" stroke="#F7F5EF" strokeWidth="1.4" />
          </g>
          {/* Front Wheel */}
          <g className="vehicle-wheel" style={{ transformOrigin: '118px 54px' }}>
            <circle cx="118" cy="54" r="10" fill="#0B1410" />
            <circle cx="118" cy="54" r="4" fill="#8FA79A" />
            <path d="M118 46 V62 M110 54 H126" stroke="#F7F5EF" strokeWidth="1.4" />
          </g>
        </svg>
      </div>
    </div>
  </div>
);
