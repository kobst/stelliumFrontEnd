import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { OnboardingRoute } from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PricingTable from './pages/plans';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import HelpCenter from './pages/HelpCenter';
import PublicCelebritiesPage from './pages/PublicCelebritiesPage';
import PublicCelebrityDashboard from './pages/PublicCelebrityDashboard';

// Onboarding pages (auth required, no profile required)
import OnboardingPage from './pages/OnboardingPage';
import OnboardingConfirmation from './pages/OnboardingConfirmation';

// Protected pages (auth + profile required)
import MainDashboard from './pages/MainDashboard';
import ChartDetailPage from './pages/ChartDetailPage';
import RelationshipAnalysisPage from './pages/RelationshipAnalysisPage';
import CreateRelationshipPage from './pages/CreateRelationshipPage';
import UserSelectionPage from './pages/UserSelectionPage';
import SynastryPage_v2 from './pages/synastryPage_v2';
import CompositeDashboard_v4 from './pages/compositeDashboard_v4';
import CelebsPage from './pages/CelebsPage';
import GuestDashboard from './UI/prototype/GuestDashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes - no auth required */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pricingTable" element={<PricingTable />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/celebrities" element={<PublicCelebritiesPage />} />
            <Route path="/celebrities/:celebrityId" element={<PublicCelebrityDashboard />} />

            {/* Onboarding routes - auth required, no profile required */}
            <Route
              path="/onboarding"
              element={
                <OnboardingRoute>
                  <OnboardingPage />
                </OnboardingRoute>
              }
            />
            <Route
              path="/onboarding/confirmation"
              element={
                <OnboardingRoute>
                  <OnboardingConfirmation />
                </OnboardingRoute>
              }
            />

            {/* Legacy routes - redirect to new onboarding flow */}
            <Route
              path="/signUp"
              element={
                <OnboardingRoute>
                  <OnboardingPage />
                </OnboardingRoute>
              }
            />
            <Route
              path="/birthChartEntry"
              element={
                <OnboardingRoute>
                  <OnboardingPage />
                </OnboardingRoute>
              }
            />
            <Route
              path="/signUpConfirmation"
              element={
                <OnboardingRoute>
                  <OnboardingConfirmation />
                </OnboardingRoute>
              }
            />

            {/* Protected routes - auth + profile required */}
            <Route
              path="/dashboard/:userId"
              element={
                <ProtectedRoute>
                  <MainDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:userId/chart/:chartId"
              element={
                <ProtectedRoute>
                  <ChartDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:userId/relationship/create"
              element={
                <ProtectedRoute>
                  <CreateRelationshipPage />
                </ProtectedRoute>
              }
            />
<Route
              path="/dashboard/:userId/relationship/:compositeId"
              element={
                <ProtectedRoute>
                  <RelationshipAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/synastry"
              element={
                <ProtectedRoute>
                  <SynastryPage_v2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compositeDashboard"
              element={
                <ProtectedRoute>
                  <CompositeDashboard_v4 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/celebs"
              element={
                <ProtectedRoute>
                  <CelebsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guestDashboard"
              element={
                <ProtectedRoute>
                  <GuestDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
