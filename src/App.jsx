import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AudioButton } from './components/AudioButton';

// Pages
import { Home } from './pages/Home';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { DriversPage } from './pages/DriversPage';
import { RidersPage } from './pages/RidersPage';
import { TrustPage } from './pages/TrustPage';

export function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/riders" element={<RidersPage />} />
          <Route path="/trust" element={<TrustPage />} />
        </Routes>
      </main>
      <AudioButton />
      <Footer />
    </div>
  );
}

export default App;
