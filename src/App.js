import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useParams } from 'react-router-dom';
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
import PublicCelebrityRelationship from './pages/PublicCelebrityRelationship';
import PublicCelebrityRelationships from './pages/PublicCelebrityRelationships';
import PublicWeeklyHoroscopesPage from './pages/PublicWeeklyHoroscopesPage';

// Onboarding pages (auth required, no profile required)
import OnboardingPage from './pages/OnboardingPage';
import OnboardingConfirmation from './pages/OnboardingConfirmation';

// Protected pages (auth + profile required)
import MainDashboard from './pages/MainDashboard';
import CreateRelationshipPage from './pages/CreateRelationshipPage';
import UserSelectionPage from './pages/UserSelectionPage';
import CelebsPage from './pages/CelebsPage';
import GuestDashboard from './UI/prototype/GuestDashboard';
import Chart3DPage from './pages/Chart3DPage';
import ChartReaderPage from './pages/ChartReaderPage';
import RelationshipJourneyPage from './pages/RelationshipJourneyPage';

import './App.css';

function DefaultChartView() {
  const { userId, chartId } = useParams();
  return <Navigate to={`/dashboard/${userId}/chart/${chartId}/reader`} replace />;
}

function DefaultRelationshipView() {
  const { userId, compositeId } = useParams();
  return <Navigate to={`/dashboard/${userId}/relationship/${compositeId}/journey`} replace />;
}

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
            <Route path="/celebrity-relationships" element={<PublicCelebrityRelationships />} />
            <Route path="/celebrity-relationships/:compositeId" element={<PublicCelebrityRelationship />} />
            <Route path="/horoscopes/weekly" element={<PublicWeeklyHoroscopesPage />} />
            <Route path="/horoscopes/weekly/:sign" element={<PublicWeeklyHoroscopesPage />} />
            {/* 3D chart scaffold (PR 1) — renders the logged-in chart when
                store data exists, sample data otherwise */}
            <Route path="/chart-3d" element={<Chart3DPage />} />

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
                  <DefaultChartView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:userId/chart/:chartId/classic"
              element={
                <ProtectedRoute>
                  <DefaultChartView />
                </ProtectedRoute>
              }
            />
            {/* 3D reader layout (PR 2) — same data, chaptered read with
                the chart as a scroll-following margin */}
            <Route
              path="/dashboard/:userId/chart/:chartId/reader"
              element={
                <ProtectedRoute>
                  <ChartReaderPage />
                </ProtectedRoute>
              }
            />
            {/* relationship journey — two skies merge into synastry,
                then collapse to the composite */}
            <Route
              path="/dashboard/:userId/relationship/:compositeId/journey"
              element={
                <ProtectedRoute>
                  <RelationshipJourneyPage />
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
                  <DefaultRelationshipView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:userId/relationship/:compositeId/classic"
              element={
                <ProtectedRoute>
                  <DefaultRelationshipView />
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
