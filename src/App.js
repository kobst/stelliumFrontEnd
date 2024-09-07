import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPageComponent from './pages/landingPage';
import LandingPageAdmin from './pages/landingPageAdmin';
import PrototypePage from './pages/prototype';
import Confirmation from './pages/confirmationPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPageComponent />} />
          <Route path="/admin" element={<LandingPageAdmin />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/prototype" element={<PrototypePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;