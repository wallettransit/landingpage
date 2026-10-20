import React, { useMemo } from 'react';

export const QRCode = ({ n = 21 }) => {
  const rects = useMemo(() => {
    let s = 2291;
    const r = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const items = [];
    const addFinder = (fx, fy) => {
      items.push(<rect key={`f1-${fx}-${fy}`} x={fx} y={fy} width="7" height="7" fill="#0B1410" />);
      items.push(<rect key={`f2-${fx}-${fy}`} x={fx + 1} y={fy + 1} width="5" height="5" fill="#F7F5EF" />);
      items.push(<rect key={`f3-${fx}-${fy}`} x={fx + 2} y={fy + 2} width="3" height="3" fill="#0B1410" />);
    };

    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const isFinder =
          (x < 8 && y < 8) ||
          (x > n - 9 && y < 8) ||
          (x < 8 && y > n - 9);

        if (!isFinder && r() > 0.52) {
          items.push(<rect key={`p-${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0B1410" />);
        }
      }
    }

    addFinder(0, 0);
    addFinder(n - 7, 0);
    addFinder(0, n - 7);

    return items;
  }, [n]);

  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#F7F5EF" />
      {rects}
    </svg>
  );
};
