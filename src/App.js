import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrototypePage from './pages/prototype';
import ProtectedRoute from './pages/protectedRoute'
import LandingPageComponent from './pages/landingPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPageComponent />} />
          <Route
            path="/prototype"
            element={
              <ProtectedRoute>
                <PrototypePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;