import React from 'react';
import { Hero } from '../components/Hero';
import { PayYourWay } from '../components/PayYourWay';
import { Features } from '../components/Features';
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
      <PayYourWay />
      <Features />
      <RouteSection />
      <EarningsLedger />
      <FAQ />
      <Finale />
    </>
  );
};

export default Home;
