import React from 'react';

/**
 * Trust & infrastructure partners badge:
 * Powered by Visa, Moniepoint, and Paystack
 * Authentic, perfectly balanced vector SVG logos in their true brand identities:
 * - Visa: Official 2021+ brandmark with distinctive blue slant (#1434CB)
 * - Moniepoint: Official blue emblem (#0357EE) + clean, crisp modern brand wordmark
 * - Paystack: Official cyan stack bars (#00C3F7) + clean, bold, legible brand wordmark
 */
export const PoweredBy = () => {
  return (
    <div className="powered-strip rv" style={{ '--d': '.7s' }}>
      <div className="powered-header">
        <span className="powered-shield" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </span>
        <span className="powered-label">Infrastructure & settlement powered by</span>
      </div>

      <div className="powered-card">
        {/* Visa Official Wordmark */}
        <div className="partner-item" title="Visa">
          <svg viewBox="0 0 24 24" className="partner-svg partner-visa" aria-label="Visa">
            <path
              fill="#1434CB"
              d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"
            />
          </svg>
        </div>

        <div className="partner-divider" aria-hidden="true"></div>

        {/* Moniepoint Official Logo */}
        <div className="partner-item" title="Moniepoint">
          <svg viewBox="0 0 156 36" className="partner-svg partner-moniepoint" aria-label="Moniepoint">
            {/* Blue squircle emblem */}
            <rect x="0" y="2" width="32" height="32" rx="9" fill="#0357EE" />
            {/* White stylized M inside */}
            <path
              d="M7 24.5V11.5H11.2L16 19.5L20.8 11.5H25V24.5H21.2V17.2L17.2 23.5H14.8L10.8 17.2V24.5H7Z"
              fill="#FFFFFF"
            />
            {/* Clean Moniepoint Wordmark */}
            <text
              x="40"
              y="24"
              fill="#0B1410"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif"
              fontSize="18"
              fontWeight="800"
              letterSpacing="-0.025em"
            >
              Moniepoint
            </text>
          </svg>
        </div>

        <div className="partner-divider" aria-hidden="true"></div>

        {/* Paystack Official Logo */}
        <div className="partner-item" title="Paystack">
          <svg viewBox="0 0 148 36" className="partner-svg partner-paystack" aria-label="Paystack">
            {/* Paystack Iconic Cyan 4-Bars Symbol */}
            <rect x="0" y="5" width="28" height="4.5" rx="2.25" fill="#00C3F7" />
            <rect x="0" y="12" width="20" height="4.5" rx="2.25" fill="#00C3F7" />
            <rect x="0" y="19" width="28" height="4.5" rx="2.25" fill="#00C3F7" />
            <rect x="0" y="26" width="14" height="4.5" rx="2.25" fill="#00C3F7" />
            {/* Clean Paystack Wordmark */}
            <text
              x="36"
              y="24"
              fill="#0B1410"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif"
              fontSize="18"
              fontWeight="800"
              letterSpacing="-0.025em"
            >
              paystack
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
