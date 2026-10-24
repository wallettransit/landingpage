import React, { useState, useRef } from 'react';
import { sound } from '../services/sound';

const fmt = (n) => (n < 0 ? '-' : '') + '₦' + Math.abs(Math.round(n)).toLocaleString('en-NG');

export const EarningsLedger = () => {
  const [pass, setPass] = useState(72);
  const [fare, setFare] = useState(270);
  const [lev, setLev] = useState(3600);
  const [fuel, setFuel] = useState(1600);

  const gross = pass * fare;
  const net = gross - lev - fuel;
  const monthNet = net * 26;

  const cost = fuel + lev;
  const totalBar = net >= 0 ? gross : Math.max(cost, 1);
  const takeHomePct = totalBar > 0 ? Math.round((Math.max(net, 0) / totalBar) * 100) : 0;
  const fuelPct = totalBar > 0 ? Math.round((fuel / totalBar) * 100) : 0;
  const levPct = totalBar > 0 ? Math.round((lev / totalBar) * 100) : 0;

  const barNetFlex = Math.max(net, 0) / totalBar + 0.0001;
  const barFuelFlex = fuel / totalBar + 0.0001;
  const barLevFlex = lev / totalBar + 0.0001;

  const levPhoneWidth = gross > 0 ? Math.min(100, (lev / gross) * 100) : 0;
  const fuelPhoneWidth = gross > 0 ? Math.min(100, (fuel / gross) * 100) : 0;

  const clampVal = (v, min, max) => Math.min(max, Math.max(min, v));

  // Tile Drag Handlers
  const setupTileDrag = (currentVal, setter, min, max, step, px) => {
    let x0 = 0;
    let v0 = currentVal;
    let dragging = false;

    return {
      onPointerDown: (e) => {
        dragging = true;
        x0 = e.clientX;
        v0 = currentVal;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
        e.currentTarget.parentElement.classList.add('drag');
      },
      onPointerMove: (e) => {
        if (!dragging) return;
        const dx = e.clientX - x0;
        const steps = Math.round(dx / (px + 3));
        const newVal = clampVal(Math.round((v0 + steps * step) / step) * step, min, max);
        if (newVal !== currentVal) {
          sound.playTap();
          setter(newVal);
        }
      },
      onPointerUp: (e) => {
        dragging = false;
        e.currentTarget.parentElement.classList.remove('drag');
      },
      onPointerCancel: (e) => {
        dragging = false;
        e.currentTarget.parentElement.classList.remove('drag');
      },
      onKeyDown: (e) => {
        let delta = 0;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step;
        else if (e.key === 'PageUp') delta = step * 10;
        else if (e.key === 'PageDown') delta = -step * 10;
        else if (e.key === 'Home') { e.preventDefault(); setter(min); return; }
        else if (e.key === 'End') { e.preventDefault(); setter(max); return; }

        if (delta !== 0) {
          e.preventDefault();
          sound.playTap();
          setter((v) => clampVal(v + delta, min, max));
        }
      },
    };
  };

  const getRulerOffset = (val, min, step, px) => ({
    '--o': `${-((val - min) / step) * px}px`,
    '--px': `${px}px`,
  });

  return (
    <section className="earn" id="earn">
      <div className="wrap">
        <div className="earn-top">
          <div>
            <span className="eyebrow rv">Introducing Earnings Ledger</span>
            <h2 className="disp rv" style={{ '--d': '.08s' }}>
              Know what you{' '}
              <span className="em stretch">
                re<span>e</span>ally
              </span>{' '}
              earn
            </h2>
            <p className="sub rv" style={{ '--d': '.16s' }}>
              Most drivers can't say what they made after fuel and levies. OyaPay keeps the books for you, fare by fare, so every day ends with one honest number.
            </p>

            {/* Draggable Day Ledger */}
            <div
              className={`dl spot rv ${net < 0 ? 'neg' : ''}`}
              style={{ '--d': '.2s' }}
              role="group"
              aria-label="Interactive driver day ledger"
            >
              <div className="dl-h">
                <strong>Your day, by the numbers</strong>
                <span>Drag the tiles or tap the buttons to dial in your typical day.</span>
              </div>

              <div className="dl-hero">
                <div>
                  <small>Estimated take-home</small>
                  <b id="oNet">{fmt(net)}</b>
                </div>
                <div className="dl-m">
                  <small>Over 26 days</small>
                  <b id="oMonth">{fmt(monthNet)}</b>
                </div>
              </div>

              {/* Proportional flex bar */}
              <div className="dl-bar" id="dlBar">
                <i className="k" style={{ flexGrow: barNetFlex }} />
                <i className="f" style={{ flexGrow: barFuelFlex }} />
                <i className="l" style={{ flexGrow: barLevFlex }} />
              </div>

              <div className="dl-leg">
                <span className="k">
                  <i />Take-home: <b id="pK">{takeHomePct}%</b>
                </span>
                <span className="f">
                  <i />Fuel: <b id="pF">{fuelPct}%</b>
                </span>
                <span className="l">
                  <i />Levies: <b id="pL">{levPct}%</b>
                </span>
              </div>

              {/* 4 Interactive Draggable Ruler Tiles */}
              <div className="dl-tiles">
                {/* Tile 1: Passengers */}
                <div
                  className="dt"
                  data-k="pass"
                  style={getRulerOffset(pass, 20, 1, 7)}
                >
                  <div
                    className="dt-s"
                    tabIndex={0}
                    role="slider"
                    aria-label="Passengers per day"
                    aria-valuemin={20}
                    aria-valuemax={140}
                    aria-valuenow={pass}
                    aria-valuetext={String(pass)}
                    {...setupTileDrag(pass, setPass, 20, 140, 1, 7)}
                  >
                    <span className="dt-l">Passengers / day</span>
                    <span className="dt-v">{pass}</span>
                    <span className="dt-r" />
                  </div>
                  <button
                    className="dm"
                    type="button"
                    aria-label="Decrease passengers"
                    disabled={pass <= 20}
                    onClick={() => { sound.playTap(); setPass((p) => Math.max(20, p - 1)); }}
                  >
                    −
                  </button>
                  <button
                    className="dp"
                    type="button"
                    aria-label="Increase passengers"
                    disabled={pass >= 140}
                    onClick={() => { sound.playTap(); setPass((p) => Math.min(140, p + 1)); }}
                  >
                    +
                  </button>
                </div>

                {/* Tile 2: Average Fare */}
                <div
                  className="dt"
                  data-k="fare"
                  style={getRulerOffset(fare, 100, 10, 9)}
                >
                  <div
                    className="dt-s"
                    tabIndex={0}
                    role="slider"
                    aria-label="Average fare"
                    aria-valuemin={100}
                    aria-valuemax={600}
                    aria-valuenow={fare}
                    aria-valuetext={fmt(fare)}
                    {...setupTileDrag(fare, setFare, 100, 600, 10, 9)}
                  >
                    <span className="dt-l">Average fare</span>
                    <span className="dt-v">{fmt(fare)}</span>
                    <span className="dt-r" />
                  </div>
                  <button
                    className="dm"
                    type="button"
                    aria-label="Decrease fare"
                    disabled={fare <= 100}
                    onClick={() => { sound.playTap(); setFare((f) => Math.max(100, f - 10)); }}
                  >
                    −
                  </button>
                  <button
                    className="dp"
                    type="button"
                    aria-label="Increase fare"
                    disabled={fare >= 600}
                    onClick={() => { sound.playTap(); setFare((f) => Math.min(600, f + 10)); }}
                  >
                    +
                  </button>
                </div>

                {/* Tile 3: Levies */}
                <div
                  className="dt"
                  data-k="lev"
                  style={getRulerOffset(lev, 0, 100, 9)}
                >
                  <div
                    className="dt-s"
                    tabIndex={0}
                    role="slider"
                    aria-label="Daily levies and union fees"
                    aria-valuemin={0}
                    aria-valuemax={8000}
                    aria-valuenow={lev}
                    aria-valuetext={fmt(lev)}
                    {...setupTileDrag(lev, setLev, 0, 8000, 100, 9)}
                  >
                    <span className="dt-l">Daily levies &amp; fees</span>
                    <span className="dt-v">{fmt(lev)}</span>
                    <span className="dt-r" />
                  </div>
                  <button
                    className="dm"
                    type="button"
                    aria-label="Decrease levies"
                    disabled={lev <= 0}
                    onClick={() => { sound.playTap(); setLev((l) => Math.max(0, l - 100)); }}
                  >
                    −
                  </button>
                  <button
                    className="dp"
                    type="button"
                    aria-label="Increase levies"
                    disabled={lev >= 8000}
                    onClick={() => { sound.playTap(); setLev((l) => Math.min(8000, l + 100)); }}
                  >
                    +
                  </button>
                </div>

                {/* Tile 4: Fuel */}
                <div
                  className="dt"
                  data-k="fuel"
                  style={getRulerOffset(fuel, 0, 100, 9)}
                >
                  <div
                    className="dt-s"
                    tabIndex={0}
                    role="slider"
                    aria-label="Daily fuel"
                    aria-valuemin={0}
                    aria-valuemax={8000}
                    aria-valuenow={fuel}
                    aria-valuetext={fmt(fuel)}
                    {...setupTileDrag(fuel, setFuel, 0, 8000, 100, 9)}
                  >
                    <span className="dt-l">Daily fuel</span>
                    <span className="dt-v">{fmt(fuel)}</span>
                    <span className="dt-r" />
                  </div>
                  <button
                    className="dm"
                    type="button"
                    aria-label="Decrease fuel"
                    disabled={fuel <= 0}
                    onClick={() => { sound.playTap(); setFuel((fl) => Math.max(0, fl - 100)); }}
                  >
                    −
                  </button>
                  <button
                    className="dp"
                    type="button"
                    aria-label="Increase fuel"
                    disabled={fuel >= 8000}
                    onClick={() => { sound.playTap(); setFuel((fl) => Math.min(8000, fl + 100)); }}
                  >
                    +
                  </button>
                </div>
              </div>

              <p className="dl-ins" id="dlIns">
                {net < 0
                  ? 'At these numbers the day costs more than it earns. Try fewer costs or more passengers.'
                  : `Each passenger leaves you about ${fmt(net / pass)} after fuel and levies. OyaPay shows you this every night.`}
              </p>
            </div>

            <a className="btn btn-amber btn-lg mag rv" style={{ '--d': '.24s' }} href="#join">
              Join the waitlist
            </a>
          </div>

          {/* Interactive Driver Phone */}
          <div className="ledger-phone rv" style={{ '--d': '.2s' }}>
            <div className="phone">
              <div className="notch" />
              <div className="screen">
                <div className="scene" style={{ opacity: 1, transform: 'none' }}>
                  <div className="sc-top">
                    <span>Today</span>
                    <span>Ikorodu → TBS</span>
                  </div>
                  <div className="amt-sub" style={{ textAlign: 'left', margin: 0 }}>
                    Net take-home
                  </div>
                  <div className={`ln ${net < 0 ? 'neg' : ''}`} id="lnNet">
                    {fmt(net)}
                  </div>

                  <div className="lrow">
                    <div className="ll">
                      <span>Gross collected</span>
                      <span id="gGross">{fmt(gross)}</span>
                    </div>
                    <div className="tr">
                      <div className="fl" style={{ width: '100%', background: 'var(--em-l)' }} />
                    </div>
                  </div>

                  <div className="lrow">
                    <div className="ll">
                      <span>Levies</span>
                      <span id="gLev">-{fmt(lev)}</span>
                    </div>
                    <div className="tr">
                      <div
                        className="fl"
                        id="bLev"
                        style={{ width: `${levPhoneWidth}%`, background: '#E2733F', animationDelay: '.2s' }}
                      />
                    </div>
                  </div>

                  <div className="lrow">
                    <div className="ll">
                      <span>Fuel</span>
                      <span id="gFuel">-{fmt(fuel)}</span>
                    </div>
                    <div className="tr">
                      <div
                        className="fl"
                        id="bFuel"
                        style={{ width: `${fuelPhoneWidth}%`, background: 'var(--amber)', animationDelay: '.4s' }}
                      />
                    </div>
                  </div>

                  <div className="row" style={{ marginTop: '22px' }}>
                    <div>
                      Auto cash-out<small>Tonight · 9:00 PM</small>
                    </div>
                    <b id="gCash">{fmt(Math.max(0, net))}</b>
                  </div>

                  <button type="button" className="pbtn" onClick={() => sound.playSuccess()}>
                    Cash out now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Dark feature cards */}
        <div className="grid3 dk">
          <div className="dcard rv spot">
            <div className="ico">
              <svg viewBox="0 0 24 24">
                <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
              </svg>
            </div>
            <h3>Net, not guesses</h3>
            <p>
              Gross, deductions and take-home are worked out automatically, every day, with nothing for you to add up.
            </p>
          </div>

          <div className="dcard rv spot" style={{ '--d': '.1s' }}>
            <div className="ico">
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3>Log it once</h3>
            <p>
              Fuel and levies go in with one quick entry for the day, not one per trip. The fares themselves log themselves.
            </p>
          </div>

          <div className="dcard rv spot" style={{ '--d': '.2s' }}>
            <div className="ico">
              <svg viewBox="0 0 24 24">
                <path d="M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" />
              </svg>
            </div>
            <h3>Bank details, only when it matters</h3>
            <p>
              We ask for your account once, on the day you actually have money to withdraw. Not before, and never just to get started.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EarningsLedger;
