import React from 'react';

const DEFAULT_ROUTES = [
  'IKORODU → TBS',
  'OJOTA → YABA',
  'MILE 12 → CMS',
  'AJAH → OBALENDE',
  'IKEJA → OSHODI',
  'MARYLAND → ANTHONY',
  'KETU → CMS',
  'AGEGE → OYINGBO'
];

export const RouteTicker = ({ routes = DEFAULT_ROUTES }) => {
  // Duplicate array to ensure seamless infinite looping ticker
  const displayRoutes = [...routes, ...routes];

  return (
    <div className="ticker-shell" aria-label="Active transit corridors">
      <div className="wrap" style={{ padding: 0, maxWidth: '100%' }}>
        <div className="ticker-track">
          {displayRoutes.map((route, index) => {
            const [from, to] = route.split(' → ');
            return (
              <span key={`${route}-${index}`} className="ticker-item">
                <span>{from}</span>
                <span className="sep">›</span>
                <span>{to}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
