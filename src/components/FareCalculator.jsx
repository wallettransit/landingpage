import React, { useState } from 'react';
import { sound } from '../services/sound';

const CORRIDORS = [
  {
    name: 'Ikorodu → TBS (CMS)',
    danfoFare: 400,
    tripsPerDay: 4,
    passengersPerTrip: 14,
    leakagePct: 0.12, // Loss to change scarcity / torn notes / uncollected fares
  },
  {
    name: 'Oshodi → Ikeja Along',
    danfoFare: 250,
    tripsPerDay: 8,
    passengersPerTrip: 14,
    leakagePct: 0.15,
  },
  {
    name: 'Yaba → Obalende',
    danfoFare: 300,
    tripsPerDay: 6,
    passengersPerTrip: 14,
    leakagePct: 0.14,
  },
  {
    name: 'Berger → CMS (Express)',
    danfoFare: 500,
    tripsPerDay: 4,
    passengersPerTrip: 14,
    leakagePct: 0.10,
  },
  {
    name: 'Keke Shuttle (Local)',
    danfoFare: 150,
    tripsPerDay: 16,
    passengersPerTrip: 4,
    leakagePct: 0.15,
  },
];

export const FareCalculator = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [trips, setTrips] = useState(CORRIDORS[0].tripsPerDay);
  const [userRole, setUserRole] = useState('driver'); // 'driver' or 'rider'

  const active = CORRIDORS[selectedIdx];
  const grossDaily = active.danfoFare * active.passengersPerTrip * trips;
  const lostDailyToChange = Math.round(grossDaily * active.leakagePct);
  const netWithOyaPay = grossDaily; // 100% exact fare credited
  const monthlySaved = lostDailyToChange * 26; // 26 working days

  const handleSelectCorridor = (idx) => {
    sound.playTap();
    setSelectedIdx(idx);
    setTrips(CORRIDORS[idx].tripsPerDay);
  };

  return (
    <section className="calc-sec" id="calculator">
      <div className="wrap">
        <div className="calc-header rv">
          <span className="pill-tag">Real Lagos Transit Numbers</span>
          <h2 className="disp sec-h">
            See what exact fares <span className="em">really change.</span>
          </h2>
          <p className="intro">
            No more "enter with your exact change" arguments. Drivers recover uncollected fares, and passengers never lose ₦100 to change disputes.
          </p>

          <div className="calc-toggle">
            <button
              type="button"
              className={`calc-toggle-btn ${userRole === 'driver' ? 'active' : ''}`}
              onClick={() => {
                sound.playClick();
                setUserRole('driver');
              }}
            >
              For Drivers & Conductors
            </button>
            <button
              type="button"
              className={`calc-toggle-btn ${userRole === 'rider' ? 'active' : ''}`}
              onClick={() => {
                sound.playClick();
                setUserRole('rider');
              }}
            >
              For Commuters
            </button>
          </div>
        </div>

        <div className="calc-card rv" style={{ '--d': '.1s' }}>
          {/* Corridor Selection Pills */}
          <div className="calc-corridors">
            <label className="calc-lbl">Select Your Daily Route:</label>
            <div className="corridor-pills">
              {CORRIDORS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  className={`corridor-btn ${selectedIdx === i ? 'active' : ''}`}
                  onClick={() => handleSelectCorridor(i)}
                >
                  <span>{c.name}</span>
                  <small>₦{c.danfoFare} fare</small>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders / Metrics */}
          {userRole === 'driver' ? (
            <div className="calc-body">
              <div className="calc-sliders">
                <div className="calc-slider-group">
                  <div className="slider-top">
                    <span>Daily Trips Completed</span>
                    <b>{trips} trips</b>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={trips}
                    onChange={(e) => {
                      sound.playClick();
                      setTrips(parseInt(e.target.value, 10));
                    }}
                    className="calc-range"
                  />
                  <small className="slider-hint">
                    {active.passengersPerTrip} seats × {trips} trips = {active.passengersPerTrip * trips} passengers today
                  </small>
                </div>

                <div className="driver-insights">
                  <div className="insight-item">
                    <span className="dot yellow"></span>
                    <div>
                      <strong>The "No Change" Trap</strong>
                      <p>Up to 15% of daily revenue is shaved by passengers entering without change or disputes at peak hours.</p>
                    </div>
                  </div>
                  <div className="insight-item">
                    <span className="dot green"></span>
                    <div>
                      <strong>Instant Settlement</strong>
                      <p>Every scanned fare lands in your wallet immediately with zero cash dispute delays.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Display */}
              <div className="calc-results">
                <div className="res-badge">With OyaPay Wallet</div>
                <div className="res-main">
                  <small>Daily Gross Take</small>
                  <h3>₦{grossDaily.toLocaleString()}</h3>
                </div>
                <div className="res-saved">
                  <span>Recovered from change leakage:</span>
                  <strong>+₦{lostDailyToChange.toLocaleString()} / day</strong>
                </div>
                <div className="res-monthly">
                  <div className="m-val">₦{monthlySaved.toLocaleString()}</div>
                  <div className="m-lbl">Extra pocket money saved each month (26 driving days)</div>
                </div>
                <a href="#waitlist" className="btn btn-em btn-calc" onClick={() => sound.playTap()}>
                  Join Drivers Corridor Pilot →
                </a>
              </div>
            </div>
          ) : (
            <div className="calc-body rider-view">
              <div className="rider-perks">
                <div className="perk-card">
                  <div className="perk-icon">⏱️</div>
                  <h4>Zero morning change stress</h4>
                  <p>Never hold up the bus waiting for a conductor to find two ₦50 notes or get paired with a stranger.</p>
                </div>
                <div className="perk-card">
                  <div className="perk-icon">🎟️</div>
                  <h4>Exact fare every time</h4>
                  <p>Pay exactly ₦{active.danfoFare} from your wallet. Not ₦500 because the conductor "doesn't have change".</p>
                </div>
                <div className="perk-card">
                  <div className="perk-icon">🛡️</div>
                  <h4>Receipt & 1-tap refund</h4>
                  <p>Overcharged or bus broke down along the corridor? Dispute straight from your digital trip receipt.</p>
                </div>
              </div>
              <div className="calc-results">
                <div className="res-badge">Rider Peace of Mind</div>
                <div className="res-main">
                  <small>Your Route Fare</small>
                  <h3>₦{active.danfoFare}</h3>
                </div>
                <p className="rider-summary">
                  Instant scan, zero torn notes, and a digital receipt right in your phone.
                </p>
                <a href="#waitlist" className="btn btn-em btn-calc" onClick={() => sound.playTap()}>
                  Join Rider Waitlist →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
