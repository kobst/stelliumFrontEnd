import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrototypePage from './pages/prototype';
import ProtectedRoute from './pages/protectedRoute'
import LandingPageComponent from './pages/landingPage';
import Confirmation from './pages/confirmationPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPageComponent />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/prototype" element={<PrototypePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;