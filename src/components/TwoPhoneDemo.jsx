import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../services/sound';

const FARES = [150, 250, 300, 400];
const NAMES = ['Ojota', 'Maryland', 'Anthony', 'TBS'];
const STOPS = [
  { name: 'Ojota', distance: '3 stops away', fare: 150 },
  { name: 'Maryland', distance: '6 stops away', fare: 250 },
  { name: 'Anthony', distance: '8 stops away', fare: 300 },
  { name: 'TBS (end)', distance: '11 stops away', fare: 400 },
];

const INITIAL_STATE = {
  total: 4850,
  count: 18,
  list: [
    { name: 'Anthony', time: '7:38 AM', fare: 300, isNew: false },
    { name: 'Ojota', time: '7:31 AM', fare: 150, isNew: false },
    { name: 'TBS', time: '7:22 AM', fare: 400, isNew: false },
  ],
};

const fmt = (n) => '₦' + Math.abs(Math.round(n)).toLocaleString('en-NG');

export const TwoPhoneDemo = () => {
  const [selectedIdx, setSelectedIdx] = useState(1); // default Maryland ₦250
  const [total, setTotal] = useState(INITIAL_STATE.total);
  const [count, setCount] = useState(INITIAL_STATE.count);
  const [txList, setTxList] = useState(INITIAL_STATE.list);
  const [isPaidShown, setIsPaidShown] = useState(false);
  const [paidAmt, setPaidAmt] = useState(250);
  const [isToastShown, setIsToastShown] = useState(false);
  const [toastData, setToastData] = useState({ amount: 250, stop: 'Maryland' });
  const [isTotBump, setIsTotBump] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const duoRef = useRef(null);
  const payBtnRef = useRef(null);
  const totRef = useRef(null);
  const toastTimerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  const avgFare = Math.round(total / count);

  // Self-play when section enters viewport if not yet touched
  useEffect(() => {
    if (!duoRef.current || hasInteracted) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasInteracted) {
            obs.disconnect();
            autoPlayTimerRef.current = setTimeout(() => {
              if (!hasInteracted) {
                triggerPayment(selectedIdx);
              }
            }, 1400);
          }
        });
      },
      { threshold: 0.55 }
    );

    observer.observe(duoRef.current);

    return () => {
      observer.disconnect();
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [hasInteracted, selectedIdx]);

  const handleSelectStop = (idx) => {
    setHasInteracted(true);
    sound.playTap();
    setSelectedIdx(idx);
  };

  const triggerPayment = (idxToPay = selectedIdx) => {
    if (isBusy) return;
    setIsBusy(true);

    const fare = FARES[idxToPay];
    const name = NAMES[idxToPay];

    // Flying coin animation
    sound.playCoin();

    const duoEl = duoRef.current;
    const payEl = payBtnRef.current;
    const totEl = totRef.current;

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const executeLand = () => {
      sound.playSuccess();
      setTotal((prev) => prev + fare);
      setCount((prev) => prev + 1);
      setIsTotBump(true);
      setTimeout(() => setIsTotBump(false), 450);

      // Add to driver transaction list
      setTxList((prev) => [
        { name, time: 'just now', fare, isNew: true },
        ...prev.slice(0, 2),
      ]);

      // Trigger notification toast on driver's phone
      setToastData({ amount: fare, stop: name });
      setIsToastShown(true);
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        setIsToastShown(false);
      }, 2300);

      // Show passenger success overlay
      setPaidAmt(fare);
      setIsPaidShown(true);
      setTimeout(() => {
        setIsPaidShown(false);
        setIsBusy(false);
      }, 1600);
    };

    if (reduceMotion || !duoEl || !payEl || !totEl) {
      executeLand();
      return;
    }

    // Parabolic coin physics
    const coin = document.createElement('div');
    coin.className = 'coin-fly';
    coin.textContent = '₦';
    duoEl.appendChild(coin);

    const dr = duoEl.getBoundingClientRect();
    const from = payEl.getBoundingClientRect();
    const to = totEl.getBoundingClientRect();

    const fx = from.left + from.width / 2 - dr.left;
    const fy = from.top + from.height / 2 - dr.top;
    const tx = to.left + to.width / 2 - dr.left;
    const ty = to.top + to.height / 2 - dr.top;
    const mx = (fx + tx) / 2;
    const my = Math.min(fy, ty) - 110;

    const anim = coin.animate(
      [
        { transform: `translate(${fx}px, ${fy}px) scale(.5)`, opacity: 0 },
        { transform: `translate(${fx}px, ${fy}px) scale(1)`, opacity: 1, offset: 0.12 },
        { transform: `translate(${mx}px, ${my}px) scale(1.25) rotate(180deg)`, offset: 0.55 },
        { transform: `translate(${tx}px, ${ty}px) scale(.8) rotate(360deg)`, opacity: 1, offset: 0.92 },
        { transform: `translate(${tx}px, ${ty}px) scale(.2)`, opacity: 0 },
      ],
      { duration: 900, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' }
    );

    anim.onfinish = () => {
      coin.remove();
      executeLand();
    };
  };

  const handlePayClick = () => {
    setHasInteracted(true);
    triggerPayment();
  };

  const handleReset = () => {
    setHasInteracted(true);
    sound.playClick();
    setTotal(INITIAL_STATE.total);
    setCount(INITIAL_STATE.count);
    setTxList(INITIAL_STATE.list);
    setSelectedIdx(1);
    setIsPaidShown(false);
    setIsToastShown(false);
  };

  return (
    <section className="demo" id="demo">
      <div className="wrap">
        <h2 className="disp big split">
          One tap. <span className="em">Two phones.</span> Zero change.
        </h2>
        <p className="lede rv" style={{ '--d': '.1s' }}>
          Pick a stop, hit Pay, and watch the money land on the driver's phone before you can say &quot;oya&quot;.
        </p>

        <div className="duo" id="duo" ref={duoRef}>
          {/* Passenger Phone */}
          <div className="duo-col rv">
            <span className="duo-lab">
              <i />
              Passenger
            </span>
            <div className="phone">
              <div className="notch" />
              <div className="screen">
                <div
                  className="scene"
                  style={{
                    opacity: 1,
                    transform: 'none',
                    pointerEvents: 'auto',
                    paddingBottom: '26px',
                  }}
                >
                  <div className="sc-top">
                    <span>Ikorodu → TBS</span>
                    <span>LND 412 XA</span>
                  </div>
                  <div className="ttl">
                    Where are you
                    <br />
                    dropping?
                  </div>
                  {STOPS.map((st, i) => (
                    <button
                      key={st.name}
                      type="button"
                      className={`row ${selectedIdx === i ? 'sel' : ''}`}
                      aria-pressed={selectedIdx === i}
                      onClick={() => handleSelectStop(i)}
                    >
                      <div>
                        {st.name}
                        <small>{st.distance}</small>
                      </div>
                      <b>{fmt(st.fare)}</b>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="pbtn"
                    id="duoPay"
                    ref={payBtnRef}
                    onClick={handlePayClick}
                    disabled={isBusy}
                  >
                    Pay {fmt(FARES[selectedIdx])}
                  </button>
                </div>

                <div
                  className={`paidov ${isPaidShown ? 'show' : ''}`}
                  id="duoPaid"
                  aria-live="polite"
                >
                  <div className="check">
                    <svg
                      width="38"
                      height="38"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0B1410"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  </div>
                  <div className="amt" id="duoPaidAmt">
                    {fmt(paidAmt)}
                  </div>
                  <div className="amt-sub">paid · instant</div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle dashed connector */}
          <div className="duo-mid" aria-hidden="true">
            <div className="dash" />
            <span>Under a second</span>
          </div>

          {/* Driver Phone */}
          <div className="duo-col drv rv" style={{ '--d': '.12s' }}>
            <span className="duo-lab">
              <i />
              Driver
            </span>
            <div className="phone">
              <div className="notch" />
              <div className="screen">
                <div
                  className="scene"
                  style={{
                    opacity: 1,
                    transform: 'none',
                    pointerEvents: 'auto',
                    paddingBottom: '20px',
                  }}
                >
                  <div className="sc-top">
                    <span>Today</span>
                    <span>Ikorodu → TBS</span>
                  </div>
                  <div className="amt-sub" style={{ textAlign: 'left', margin: 0 }}>
                    Collected so far
                  </div>
                  <div className={`ln ${isTotBump ? 'bump' : ''}`} id="duoTot" ref={totRef}>
                    {fmt(total)}
                  </div>
                  <div className="dsub">
                    <b id="duoCnt">{count}</b> fares · avg ₦<span id="duoAvg">{avgFare}</span>
                  </div>
                  <ul className="dlist" id="duoList">
                    {txList.map((tx, idx) => (
                      <li key={`${tx.name}-${tx.time}-${idx}`} className={tx.isNew ? 'new' : ''}>
                        <div>
                          {tx.name}
                          <small>{tx.time}</small>
                        </div>
                        <b>{fmt(tx.fare)}</b>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dropdown notification toast on driver's screen */}
                <div className={`dtoast ${isToastShown ? 'show' : ''}`} id="duoToast">
                  <i>₦</i>
                  <div>
                    <strong id="duoToastA">{fmt(toastData.amount)} received</strong>
                    <span id="duoToastB">{toastData.stop} · just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="duo-foot">
          Tap a stop on the passenger phone, then Pay.{' '}
          <button type="button" id="duoReset" onClick={handleReset}>
            Reset demo
          </button>
        </p>
      </div>
    </section>
  );
};

export default TwoPhoneDemo;
