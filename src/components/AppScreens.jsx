import React, { useState, useRef } from 'react';
import { sound } from '../services/sound';

const RIDER_SCREENS = [
  { img: '/screens/01-home.webp', alt: 'OyaPay rider home screen showing wallet balance', title: 'Home', desc: 'Your balance and your next ride, one tap apart.' },
  { img: '/screens/02-scan.webp', alt: 'Scan to pay screen locking onto a vehicle code', title: 'Scan', desc: 'Point at the code in the vehicle. It locks on by itself.' },
  { img: '/screens/03-pick-your-stop.webp', alt: 'Stop picker listing fares per stop', title: 'Pick your stop', desc: 'See the exact fare before you pay.' },
  { img: '/screens/04-slide-to-pay.webp', alt: 'Slide to pay confirmation screen', title: 'Slide to pay', desc: 'A deliberate slide, so no accidental charges.' },
  { img: '/screens/05-your-ticket.webp', alt: 'Paid ticket with live stripe', title: 'Your ticket', desc: 'A live stripe shows it is real, not a screenshot.' },
  { img: '/screens/06-wallet.webp', alt: 'Wallet screen with balance and top-up', title: 'Wallet', desc: 'Top up once, ride all week.' },
  { img: '/screens/07-rides-and-spend.webp', alt: 'Rides and spend history', title: 'Rides and spend', desc: 'Every fare and receipt in one list.' },
];

const DRIVER_SCREENS = [
  { img: '/screens/08-today.webp', alt: 'Driver today screen with live payments', title: 'Today', desc: 'Fares land live, with a chime.' },
  { img: '/screens/09-net-income.webp', alt: 'Driver net income screen', title: 'Net income', desc: 'Fuel and levies out, real take-home in.' },
  { img: '/screens/10-cash-out.webp', alt: 'Driver cash out screen', title: 'Cash out', desc: 'Money in your wallet, bank when you are ready.' },
  { img: '/screens/11-withdraw.webp', alt: 'Driver withdraw screen', title: 'Withdraw', desc: 'Slide to send it to your bank.' },
];

const DARK_SCREENS = [
  { img: '/screens/12-home.webp', alt: 'Rider home in dark mode', title: 'Home', desc: 'Easy on the eyes for night rides.' },
  { img: '/screens/13-scan.webp', alt: 'Scan screen in dark mode', title: 'Scan', desc: 'Same lock-on, darker frame.' },
  { img: '/screens/14-slide-to-pay.webp', alt: 'Slide to pay in dark mode', title: 'Slide to pay', desc: 'Clear contrast, big targets.' },
  { img: '/screens/15-ticket.webp', alt: 'Ticket in dark mode', title: 'Ticket', desc: 'Readable at a glance on a night ride.' },
  { img: '/screens/16-wallet.webp', alt: 'Wallet in dark mode', title: 'Wallet', desc: 'Balance first, always.' },
  { img: '/screens/17-driver-today.webp', alt: 'Driver today screen in dark mode', title: 'Driver today', desc: 'Live fares after dark.' },
];

const TABS = [
  { id: 'rider', label: 'Rider', screens: RIDER_SCREENS },
  { id: 'driver', label: 'Driver', screens: DRIVER_SCREENS },
  { id: 'dark', label: 'Dark mode', screens: DARK_SCREENS },
];

export const AppScreens = () => {
  const [activeTab, setActiveTab] = useState('rider');
  const railRefs = {
    rider: useRef(null),
    driver: useRef(null),
    dark: useRef(null),
  };

  const handleTabSwitch = (tabId) => {
    sound.playTap();
    setActiveTab(tabId);
    const rail = railRefs[tabId]?.current;
    if (rail) rail.scrollLeft = 0;
  };

  const handleScroll = (dir) => {
    sound.playClick();
    const rail = railRefs[activeTab]?.current;
    if (!rail) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({ left: dir * 560, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <section className="apps" id="app">
      <div className="wrap">
        <div className="apps-hd">
          <span className="eyebrow rv">The app</span>
          <h2 className="disp big split">
            Every screen <span className="em">built for the ride.</span>
          </h2>
          <p className="lede rv" style={{ '--d': '.1s' }}>
            Big buttons, plain words, and a mascot called Kobo who keeps count so you do not have to.
          </p>
          <div className="ap-tabs rv" role="tablist" aria-label="App screens" style={{ '--d': '.15s' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`aptab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`ap-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => handleTabSwitch(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ap-stage rv" style={{ '--d': '.2s' }}>
        <button className="ap-arrow l" id="apPrev" aria-label="Previous screens" onClick={() => handleScroll(-1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <button className="ap-arrow r" id="apNext" aria-label="Next screens" onClick={() => handleScroll(1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={`ap-panel ${activeTab === tab.id ? 'on' : ''}`}
            id={`ap-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`aptab-${tab.id}`}
            tabIndex={0}
          >
            <div className="ap-rail" ref={railRefs[tab.id]}>
              {tab.screens.map((scr, idx) => (
                <figure key={`${scr.title}-${idx}`} className="ap-item">
                  <div className="ap">
                    <span className="ap-notch" />
                    <img
                      src={scr.img}
                      width={480}
                      height={1069}
                      alt={scr.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <figcaption>
                    <b>{scr.title}</b>
                    <span>{scr.desc}</span>
                  </figcaption>
                </figure>
              ))}
              <span className="ap-end" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      <div className="stores app-st" role="group" aria-label="App store availability">
        <span className="sb-soon">Coming soon · join the waitlist</span>
        <a className="sb" href="#join" aria-label="App Store, coming soon. Join the waitlist to be notified">
          <svg className="sb-ic" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#fff"
              d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
            />
          </svg>
          <span className="sb-t">
            <small>Coming soon on the</small>
            <b>App Store</b>
          </span>
        </a>
        <a className="sb" href="#join" aria-label="Google Play, coming soon. Join the waitlist to be notified">
          <svg className="sb-ic" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#00A0FF" d="M3.6 2.6L13.2 12 3.6 21.4z" />
            <path fill="#00E27A" d="M3.6 2.6L16.4 9.1 13.2 12z" />
            <path fill="#FFCE00" d="M16.4 9.1l4.2 2.4c.8.5.8 1.5 0 2l-4.2 2.4L13.2 12z" />
            <path fill="#FF3A44" d="M3.6 21.4L13.2 12l3.2 2.9z" />
          </svg>
          <span className="sb-t">
            <small>Coming soon on</small>
            <b>Google Play</b>
          </span>
        </a>
      </div>

      <p className="ap-note">Pre-launch designs. Screens and details may change before release.</p>
    </section>
  );
};

export default AppScreens;
