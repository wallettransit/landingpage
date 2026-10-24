import React from 'react';
import { Hero } from '../components/Hero';
import { LedBoard } from '../components/LedBoard';
import { PayYourWay } from '../components/PayYourWay';
import { TwoPhoneDemo } from '../components/TwoPhoneDemo';
import { AppScreens } from '../components/AppScreens';
import { Features } from '../components/Features';
import { BudgetSection } from '../components/BudgetSection';
import { RouteSection } from '../components/RouteSection';
import { EarningsLedger } from '../components/EarningsLedger';
import { FAQ } from '../components/FAQ';
import { Finale } from '../components/Finale';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const Home = () => {
  useScrollReveal();

  return (
    <>
      <Hero />
      <LedBoard />
      <PayYourWay />
      <TwoPhoneDemo />
      <AppScreens />
      <Features />
      <BudgetSection />
      <RouteSection />
      <EarningsLedger />
      <FAQ />
      <Finale />
    </>
  );
};

export default Home;
