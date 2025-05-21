import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import LandingPageComponent from './pages/landingPage';
import SignUpPage from './pages/signUpPage';
// import LandingPageAdmin from './pages/landingPageAdmin';
import PrototypePage from './pages/prototype';
import UserDashboard from './pages/userDashboard';
import SynastryPage_v2 from './pages/synastryPage_v2';
import CompositeDashboard_v4 from './pages/compositeDashboard_v4';
import ConfirmationV2 from './pages/confirmationPage_v2';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* <Route path="/" element={<LandingPageComponent />} /> */}
          {/* <Route path="/admin" element={<LandingPageAdmin />} /> */}
          {/* <Route path="/confirmation" element={<Confirmation />} /> */}
          <Route path="/prototype" element={<PrototypePage />} />
          <Route path="/userDashboard" element={<UserDashboard />} />
          <Route path="/synastry" element={<SynastryPage_v2 />} />
          <Route path="/compositeDashboard" element={<CompositeDashboard_v4 />} />

          <Route path="/signUp" element={<SignUpPage />} />
          <Route path="/signUpConfirmation" element={<ConfirmationV2 />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;