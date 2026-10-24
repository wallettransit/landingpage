import React from 'react';

const ROUTES = [
  { from: 'IKORODU', to: 'TBS', fare: 400 },
  { from: 'OJOTA', to: 'YABA', fare: 150 },
  { from: 'MARYLAND', to: 'COSTAIN', fare: 250 },
  { from: 'OSHODI', to: 'AIRPORT', fare: 200 },
  { from: 'CMS', to: 'AJAH', fare: 500 },
  { from: 'BERGER', to: 'MILE 12', fare: 250 },
  { from: 'EPE', to: 'AJAH', fare: 700 },
  { from: 'YABA', to: 'OBALENDE', fare: 300 },
  { from: 'COSTAIN', to: 'IDUMOTA', fare: 150 },
  { from: 'IKEJA', to: 'ALABA', fare: 350 },
];

export const LedBoard = () => {
  const renderGroup = (keyPrefix) => (
    <div className="led-g" key={keyPrefix}>
      {ROUTES.map((r, i) => (
        <div className="led-i" key={`${keyPrefix}-${i}`}>
          <span className="led-lab">LIVE</span>
          <span>
            {r.from} <b>→</b> {r.to}
          </span>
          <b>₦{r.fare}</b>
        </div>
      ))}
    </div>
  );

  return (
    <div className="board" aria-hidden="true">
      <div className="led" id="led">
        {renderGroup('group1')}
        {renderGroup('group2')}
      </div>
    </div>
  );
};

export default LedBoard;
