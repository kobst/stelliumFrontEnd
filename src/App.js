import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/signUpPage';
import CelebsPage from './pages/CelebsPage';
import GuestDashboard from './UI/prototype/GuestDashboard';
import SynastryPage_v2 from './pages/synastryPage_v2';
import CompositeDashboard_v4 from './pages/compositeDashboard_v4';
import ConfirmationV2 from './pages/confirmationPage_v2';
import PricingTable from './pages/plans';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NavBar from './UI/shared/NavBar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signUp" element={<SignUpPage />} />
          <Route path="/celebs" element={<CelebsPage />} />
          <Route path="/guestDashboard" element={<GuestDashboard />} />
          <Route path="/synastry" element={<SynastryPage_v2 />} />
          <Route path="/compositeDashboard" element={<CompositeDashboard_v4 />} />
          <Route path="/signUpConfirmation" element={<ConfirmationV2 />} />
          <Route path="/pricingTable" element={<PricingTable />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
