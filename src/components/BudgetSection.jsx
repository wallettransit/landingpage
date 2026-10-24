import React, { useState, useEffect, useMemo } from 'react';
import { sound } from '../services/sound';

const PROFILES = [
  { id: 'office', label: 'Office worker', rides: 2, fare: 350, bud: 20000, dows: [1, 2, 3, 4, 5] },
  { id: 'student', label: 'Student', rides: 2, fare: 150, bud: 8000, dows: [1, 2, 3, 4, 5] },
  { id: 'corper', label: 'Corper (NYSC)', rides: 2, fare: 250, bud: 15000, dows: [1, 2, 3, 4, 5, 6] },
  { id: 'trader', label: 'Market trader', rides: 4, fare: 200, bud: 40000, dows: [1, 2, 3, 4, 5, 6] },
];

const FARE_QUICKS = [150, 250, 300, 400, 500];
const RIDE_QUICKS = [1, 2, 4, 6];
const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DOW_NUMS = [1, 2, 3, 4, 5, 6, 0]; // 1=Mon, ..., 0=Sun

const MON_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fmt = (n) => '₦' + Math.abs(Math.round(n)).toLocaleString('en-NG');

export const BudgetSection = () => {
  const [profile, setProfile] = useState('office');
  const [rides, setRides] = useState(2);
  const [fare, setFare] = useState(350);
  const [budgetLimit, setBudgetLimit] = useState(20000);
  const [activeDows, setActiveDows] = useState(new Set([1, 2, 3, 4, 5]));

  // Scenario levers
  const [levers, setLevers] = useState({ ride: false, home: false, route: false });

  // Selected calendar day for inspection
  const [selectedDay, setSelectedDay] = useState(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  const leadDays = (new Date(year, month, 1).getDay() + 6) % 7;

  // Handle Profile Preset Selection
  const handleProfileChange = (pId) => {
    sound.playTap();
    setProfile(pId);
    const p = PROFILES.find((x) => x.id === pId);
    if (p) {
      setRides(p.rides);
      setFare(p.fare);
      setBudgetLimit(p.bud);
      setActiveDows(new Set(p.dows));
      setLevers({ ride: false, home: false, route: false });
    }
  };

  const toggleDow = (dowNum) => {
    sound.playClick();
    setActiveDows((prev) => {
      const next = new Set(prev);
      if (next.has(dowNum)) next.delete(dowNum);
      else next.add(dowNum);
      return next;
    });
  };

  const toggleLever = (leverKey) => {
    sound.playTap();
    setLevers((prev) => ({ ...prev, [leverKey]: !prev[leverKey] }));
  };

  // Run Monthly Simulation
  const simulation = useMemo(() => {
    const effectiveRides = Math.max(1, rides - (levers.ride && rides > 1 ? 1 : 0));
    const effectiveFare = Math.max(50, fare - (levers.route ? 50 : 0));
    const dailyCost = effectiveRides * effectiveFare;

    let cum = 0;
    let trips = 0;
    let m50 = 0;
    let m80 = 0;
    let out = 0;
    const daysData = [];

    for (let d = 1; d <= numDays; d++) {
      const dayOfWeek = new Date(year, month, d).getDay();
      let isCommute = activeDows.has(dayOfWeek);

      // Home lever: skip last commute day of each week
      if (isCommute && levers.home) {
        let isLaterInWeek = false;
        for (let nextDay = d + 1; nextDay <= numDays; nextDay++) {
          const nextDow = new Date(year, month, nextDay).getDay();
          if (nextDow === 1) break; // Reached next Monday
          if (activeDows.has(nextDow)) {
            isLaterInWeek = true;
            break;
          }
        }
        if (!isLaterInWeek) isCommute = false;
      }

      if (isCommute) {
        cum += dailyCost;
        trips += effectiveRides;
      }

      const pct = (cum / budgetLimit) * 100;
      let status = 'ok';
      let tag = null;

      if (isCommute) {
        if (!m50 && pct >= 50) { m50 = d; tag = '50%'; }
        if (!m80 && pct >= 80) { m80 = d; tag = '80%'; }
        if (!out && cum > budgetLimit) { out = d; tag = 'OUT'; }

        if (cum > budgetLimit) status = 'over';
        else if (pct >= 80) status = 'hot';
        else if (pct >= 50) status = 'chk';
        else status = 'ok';
      }

      daysData.push({
        day: d,
        dayOfWeek,
        isCommute,
        dailyCost: isCommute ? dailyCost : 0,
        cum,
        pct,
        status,
        tag,
      });
    }

    // Base simulation without levers for comparison
    const baseDailyCost = rides * fare;
    let baseCum = 0;
    for (let d = 1; d <= numDays; d++) {
      const dow = new Date(year, month, d).getDay();
      if (activeDows.has(dow)) baseCum += baseDailyCost;
    }
    const saved = Math.max(0, baseCum - cum);

    return {
      daysData,
      totalCum: cum,
      totalTrips: trips,
      dailyCost,
      saved,
      buffer: budgetLimit - cum,
      outDay: out,
    };
  }, [rides, fare, budgetLimit, activeDows, levers, numDays, month, year]);

  const selectedDayInfo = selectedDay ? simulation.daysData[selectedDay - 1] : null;

  return (
    <section className="budget" id="budget">
      <div className="wrap">
        <div className="bg-hd">
          <span className="eyebrow rv">Introducing Transport Budget</span>
          <h2 className="disp sec-h split">
            Know your <span className="em">transport spend.</span> Keep every kobo safe.
          </h2>
          <p className="bg-sub rv">
            Commuting in Lagos adds up fast. Set a calm target, see the whole month projected day by day, and rest easy knowing your money is locked down.
          </p>
        </div>

        {/* Main Interactive Budget Planner */}
        <div className="bp spot rv" style={{ '--d': '.1s' }}>
          <div className="bp-top">
            <div className="bp-t">
              <strong>Simulate your month</strong>
              <span>Pick your pattern or customize your numbers.</span>
            </div>
            <div className="pchips" role="radiogroup" aria-label="Preset commuter patterns">
              {PROFILES.map((p) => (
                <label key={p.id}>
                  <input
                    type="radio"
                    name="profile"
                    checked={profile === p.id}
                    onChange={() => handleProfileChange(p.id)}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bp-grid">
            {/* Left Controls */}
            <div className="bp-ctl">
              {/* Daily Rides */}
              <div className="bctl">
                <h5>Rides per day</h5>
                <div className="step">
                  <button
                    type="button"
                    onClick={() => { sound.playTap(); setRides((r) => Math.max(1, r - 1)); }}
                    disabled={rides <= 1}
                  >
                    −
                  </button>
                  <output>{rides}</output>
                  <button
                    type="button"
                    onClick={() => { sound.playTap(); setRides((r) => Math.min(8, r + 1)); }}
                    disabled={rides >= 8}
                  >
                    +
                  </button>
                </div>
                <div className="qk">
                  {RIDE_QUICKS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={rides === q ? 'on' : ''}
                      onClick={() => { sound.playTap(); setRides(q); }}
                    >
                      {q} {q === 1 ? 'ride' : 'rides'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fare per Trip */}
              <div className="bctl">
                <h5>Average fare per ride</h5>
                <div className="step">
                  <button
                    type="button"
                    onClick={() => { sound.playTap(); setFare((f) => Math.max(50, f - 50)); }}
                    disabled={fare <= 50}
                  >
                    −
                  </button>
                  <output>{fmt(fare)}</output>
                  <button
                    type="button"
                    onClick={() => { sound.playTap(); setFare((f) => Math.min(1000, f + 50)); }}
                    disabled={fare >= 1000}
                  >
                    +
                  </button>
                </div>
                <div className="qk">
                  {FARE_QUICKS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={fare === q ? 'on' : ''}
                      onClick={() => { sound.playTap(); setFare(q); }}
                    >
                      {fmt(q)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Riding Days */}
              <div className="bctl">
                <h5>Riding days</h5>
                <div className="dow">
                  {DOW_LABELS.map((lbl, idx) => {
                    const dowNum = DOW_NUMS[idx];
                    const isPressed = activeDows.has(dowNum);
                    return (
                      <button
                        key={idx}
                        type="button"
                        aria-pressed={isPressed}
                        onClick={() => toggleDow(dowNum)}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Budget Input */}
              <div className="bctl">
                <h5>Monthly budget limit</h5>
                <div className="money">
                  <span>₦</span>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    max="100000"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Right Projection & Calendar */}
            <div>
              <div
                className={`bp-read ${
                  simulation.totalCum > budgetLimit ? 'hot' : simulation.totalCum > budgetLimit * 0.8 ? 'mid' : 'ok'
                }`}
              >
                <small>Month total projection</small>
                <b>{fmt(simulation.totalCum)}</b>
                <span>
                  of {fmt(budgetLimit)} target ({Math.round((simulation.totalCum / budgetLimit) * 100)}%)
                </span>
              </div>

              {/* Scenario Optimization Levers */}
              <div className="bp-what">
                <h5>What if you change a habit?</h5>
                <div className="lv">
                  <button
                    type="button"
                    aria-pressed={levers.ride}
                    disabled={rides <= 1}
                    onClick={() => toggleLever('ride')}
                  >
                    Walk the first mile (-1 ride)
                  </button>
                  <button
                    type="button"
                    aria-pressed={levers.home}
                    onClick={() => toggleLever('home')}
                  >
                    Work from home 1 day/wk
                  </button>
                  <button
                    type="button"
                    aria-pressed={levers.route}
                    onClick={() => toggleLever('route')}
                  >
                    Alternative corridor (-₦50/ride)
                  </button>
                </div>
                <div className="lv-r">
                  {simulation.saved > 0 ? (
                    <>
                      <b>+{fmt(simulation.saved)}</b> kept this month
                      <small>About {fmt(simulation.saved * 12)} over a year if you stick with it.</small>
                    </>
                  ) : (
                    <span>Toggle any habit lever above to see instant savings.</span>
                  )}
                </div>
              </div>

              {/* Calendar Projection Grid */}
              <div className="cal wv" id="cal">
                {DOW_LABELS.map((lbl, idx) => (
                  <span key={idx} className="h" aria-hidden="true">
                    {lbl}
                  </span>
                ))}
                {Array.from({ length: leadDays }).map((_, i) => (
                  <span key={`lead-${i}`} />
                ))}
                {simulation.daysData.map((d) => (
                  <button
                    key={d.day}
                    type="button"
                    className={`d ${d.isCommute ? 't' : ''} ${selectedDay === d.day ? 'sel' : ''} ${
                      d.day === now.getDate() ? 'today' : ''
                    }`}
                    data-s={d.isCommute ? d.status : undefined}
                    data-m={d.tag || undefined}
                    style={{ '--i': d.day + leadDays }}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDay(d.day);
                    }}
                  >
                    <span>{d.day}</span>
                    <span className="c">{d.isCommute ? fmt(d.dailyCost) : '—'}</span>
                  </button>
                ))}
              </div>

              {/* Day Details Tip */}
              <div className="bp-tip" id="bTip">
                {selectedDayInfo ? (
                  selectedDayInfo.isCommute ? (
                    <>
                      <b>
                        {DAY_NAMES[selectedDayInfo.dayOfWeek]} {selectedDayInfo.day}
                      </b>
                      : {fmt(selectedDayInfo.dailyCost)} today. <b>{fmt(selectedDayInfo.cum)}</b> cumulative ({Math.round(selectedDayInfo.pct)}% of budget).
                    </>
                  ) : (
                    <>
                      <b>
                        {DAY_NAMES[selectedDayInfo.dayOfWeek]} {selectedDayInfo.day}
                      </b>
                      : a rest day. No commute planned.
                    </>
                  )
                ) : (
                  <span>
                    <b>{MON_NAMES[month]} {year}</b>: Click any calendar day to inspect spend.
                  </span>
                )}
              </div>

              {/* Color Key */}
              <div className="bp-key">
                <span className="k1">On track</span>
                <span className="k2">50% reached</span>
                <span className="k3">80% caution</span>
                <span className="k4">Budget exceeded</span>
              </div>

              {/* Summary Stats */}
              <div className="bg-stats">
                <div>
                  <small>Daily commute cost</small>
                  <b>{fmt(simulation.dailyCost)}</b>
                </div>
                <div>
                  <small>Monthly trips</small>
                  <b>{simulation.totalTrips}</b>
                </div>
                <div>
                  <small>{simulation.buffer >= 0 ? 'Budget buffer' : 'Over budget by'}</small>
                  <b style={{ color: simulation.buffer >= 0 ? 'var(--em-l)' : '#FF8A2B' }}>
                    {fmt(Math.abs(simulation.buffer))}
                  </b>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety & Compliance Section */}
        <div className="safe rv" style={{ '--d': '.2s' }}>
          <div className="safe-hd">
            <div>
              <span className="eyebrow">Safety &amp; Compliance</span>
              <h3 className="disp">
                Every kobo <span className="em">protected.</span>
              </h3>
            </div>
            <p className="safe-sub">
              No surprise deductions, no frozen wallets, and an unalterable paper trail for every single trip.
            </p>
          </div>

          <ul className="safe-list">
            <li>
              <div className="si">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>Non-custodial storage</h4>
              <p>Your money is held in regulated partner banks. OyaPay cannot touch or loan out your deposits.</p>
            </li>

            <li>
              <div className="si">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <h4>Instant digital receipt</h4>
              <p>Every transaction gives an exact digital ticket showing the vehicle reg, timestamp, and stop.</p>
            </li>

            <li>
              <div className="si">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20M2 12h20" />
                </svg>
              </div>
              <h4>GPS corridor locking</h4>
              <p>Drivers can only charge verified fare brackets for the corridor they are physically driving on.</p>
            </li>

            <li>
              <div className="si">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h4>24-hour dispute window</h4>
              <p>Charged the wrong stop? Tap your receipt to dispute. If confirmed, funds refund automatically.</p>
            </li>

            <li>
              <div className="si">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              </div>
              <h4>Offline USSD fallback</h4>
              <p>No 4G in gridlock? Pay using simple USSD codes without needing data or WiFi connectivity.</p>
            </li>
          </ul>

          {/* Licensed Payment Partners */}
          <div className="pp">
            <span className="pp-l">Processed through licensed partners:</span>
            <ul className="pp-r">
              <li data-partner="visa">
                <span style={{ fontWeight: 800, letterSpacing: '1px' }}>VISA</span>
              </li>
              <li data-partner="paystack">
                <span style={{ fontWeight: 800 }}>paystack</span>
              </li>
              <li data-partner="moniepoint">
                <span style={{ fontWeight: 800 }}>Moniepoint</span>
              </li>
              <li data-partner="interswitch">
                <span style={{ fontWeight: 800 }}>Interswitch</span>
              </li>
            </ul>
          </div>

          <p className="safe-note">
            Pre-launch regulatory notice: OyaPay partners with CBN-licensed switches and commercial banks to settle transport fares. Full compliance disclosures will be published before public rollout.
          </p>
        </div>

        {/* Budget 3-Card Footer */}
        <div className="bg-trio">
          <div>
            <h4>No surprise shortfalls</h4>
            <p>Know exactly how much transport will cost you this week before stepping out of your gate.</p>
          </div>
          <div>
            <h4>Calm notifications</h4>
            <p>A gentle heads-up when you reach 80% of your budget, without ever blocking an essential trip.</p>
          </div>
          <div>
            <h4>Never stranded</h4>
            <p>Opt into a small emergency safety buffer so you can always catch that last bus home.</p>
          </div>
        </div>

        <div className="bg-cta">
          <a className="btn btn-em btn-lg mag" href="#join" onClick={() => sound.playTap()}>
            Get early budget access
          </a>
        </div>
      </div>
    </section>
  );
};

export default BudgetSection;
