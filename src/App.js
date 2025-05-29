import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpPage from './pages/signUpPage';
import PrototypePage from './pages/prototype';
import UserDashboard from './pages/userDashboard';
import SynastryPage_v2 from './pages/synastryPage_v2';
import CompositeDashboard_v4 from './pages/compositeDashboard_v4';
import ConfirmationV2 from './pages/confirmationPage_v2';
import PasswordProtection from './pages/passwordProtection';
import NavBar from './UI/shared/NavBar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <PasswordProtection>
          <NavBar />
          <Routes>
            <Route path="/prototype" element={<PrototypePage />} />
            <Route path="/userDashboard" element={<UserDashboard />} />
            <Route path="/synastry" element={<SynastryPage_v2 />} />
            <Route path="/compositeDashboard" element={<CompositeDashboard_v4 />} />

            <Route path="/signUp" element={<SignUpPage />} />
            <Route path="/signUpConfirmation" element={<ConfirmationV2 />} />

          </Routes>
        </PasswordProtection>

      </div>
    </Router>
  );
}

export default App;