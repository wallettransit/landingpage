import React, { useState } from 'react';
import { sound } from '../services/sound';

const FAQS = [
  {
    q: 'What is OyaPay?',
    a: 'OyaPay is a wallet for everyday transport in Nigeria, for any ride where you pay a fare. Passengers pay fares by scanning a code in the vehicle, and drivers get paid instantly and see their real daily earnings.',
  },
  {
    q: 'How do I pay a fare?',
    a: "Scan the code in the vehicle, pick the stop you're getting off at, and confirm. The exact fare comes out of your wallet balance instantly, and you get a receipt.",
  },
  {
    q: 'Do I need a smartphone?',
    a: "At launch, scanning needs a smartphone. We're planning tap and dial options for people without data or a camera, but those come after launch.",
  },
  {
    q: 'How do drivers get paid?',
    a: "Every fare lands in your OyaPay wallet the moment it's paid. You can cash out to your bank account, and we only ask for your bank details the first time you actually withdraw.",
  },
  {
    q: "What if I'm charged the wrong fare?",
    a: 'Raise a dispute from the ride receipt. The driver gets a short window to confirm, and if they do, the money goes straight back to your wallet.',
  },
  {
    q: 'Does it cost anything?',
    a: "Joining is free. Any fees, for example when you top up or cash out, will be shown before you confirm, and we'll publish pricing before launch.",
  },
  {
    q: 'Is my money safe?',
    a: "Every transaction is written to a permanent ledger that can't be edited after the fact, and payments will run through licensed payment partners. OyaPay is pre-launch, and we'll publish our licensing and compliance details before it opens.",
  },
  {
    q: 'When does it launch?',
    a: "We're starting in Lagos, drivers first, one corridor at a time. Join the waitlist below and tell us whether you drive or ride, and we'll reach out when it opens near you.",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    sound.playClick();
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <div className="faq-grid">
          <div>
            <h2 className="disp sec-h split">
              A few things you might be <span className="em">wondering.</span>
            </h2>
            <p className="intro rv" style={{ '--d': '.1s' }}>
              The short version of how OyaPay works, who it's for, and where we are right now.
            </p>
          </div>

          <div id="faqList">
            {FAQS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className={`fq rv ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="q"
                    aria-expanded={isOpen}
                    onClick={() => toggle(idx)}
                  >
                    <span>{item.q}</span>
                    <i className="plus" aria-hidden="true" />
                  </button>
                  <div className="a">
                    <div>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
