import React from 'react';

export const EarningsLedger = () => {
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
            <a className="btn btn-amber btn-lg rv" style={{ '--d': '.24s' }} href="#join">
              Join the waitlist
            </a>
          </div>

          <div className="ledger-phone rv" style={{ '--d': '.2s' }}>
            <div className="phone">
              <div className="notch"></div>
              <div className="screen">
                <div className="scene" style={{ opacity: 1, transform: 'none' }}>
                  <div className="sc-top">
                    <span>Today</span>
                    <span>Ikorodu → TBS</span>
                  </div>
                  <div className="amt-sub" style={{ textAlign: 'left', margin: 0 }}>
                    Net take-home
                  </div>
                  <div className="ln" data-count="14200" data-pre="₦">
                    ₦14,200
                  </div>
                  <div className="lrow">
                    <div className="ll">
                      <span>Gross collected</span>
                      <span>₦19,400</span>
                    </div>
                    <div className="tr">
                      <div className="fl" style={{ width: '100%', background: 'var(--em-l)' }}></div>
                    </div>
                  </div>
                  <div className="lrow">
                    <div className="ll">
                      <span>Levies</span>
                      <span>−₦3,600</span>
                    </div>
                    <div className="tr">
                      <div className="fl" style={{ width: '19%', background: '#E2733F', animationDelay: '.2s' }}></div>
                    </div>
                  </div>
                  <div className="lrow">
                    <div className="ll">
                      <span>Fuel</span>
                      <span>−₦1,600</span>
                    </div>
                    <div className="tr">
                      <div className="fl" style={{ width: '8%', background: 'var(--amber)', animationDelay: '.4s' }}></div>
                    </div>
                  </div>
                  <div className="row" style={{ marginTop: '22px' }}>
                    <div>
                      Auto cash-out<small>Tonight · 9:00 PM</small>
                    </div>
                    <b>₦14,200</b>
                  </div>
                  <div className="pbtn">Cash out now</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid3 dk">
          <div className="dcard rv">
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

          <div className="dcard rv" style={{ '--d': '.1s' }}>
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

          <div className="dcard rv" style={{ '--d': '.2s' }}>
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
