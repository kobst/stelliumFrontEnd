import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { OnboardingRoute } from './components/ProtectedRoute';

// Public pages
import LoginPage from './pages/LoginPage';
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
import ChartReaderPage from './pages/ChartReaderPage';
import RelationshipJourneyPage from './pages/RelationshipJourneyPage';

// ink design direction — paper/ink re-skins of the core surfaces
import InkLandingPage from './pages/InkLandingPage';
import InkHoroscopePage from './pages/InkHoroscopePage';
import InkBirthChartPage from './pages/InkBirthChartPage';
import InkRelationshipPage from './pages/InkRelationshipPage';
import InkMyChartsPage from './pages/InkMyChartsPage';
import InkMyRelationshipsPage from './pages/InkMyRelationshipsPage';
import HomeInkV7 from './pages/HomeInkV7';
import FreeReadingPage from './pages/FreeReadingPage';

import './App.css';

function DefaultChartView() {
  const { userId, chartId } = useParams();
  return <Navigate to={`/dashboard/${userId}/chart/${chartId}/reader`} replace />;
}

function CreateRelationshipRedirect() {
  const { userId } = useParams();
  return <Navigate to={`/dashboard/${userId}/relationships`} replace />;
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
            <Route path="/" element={<HomeInkV7 />} />
            <Route path="/free-reading" element={<FreeReadingPage />} />
            <Route path="/landing-legacy" element={<InkLandingPage />} />
            <Route path="/try" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<LoginPage />} />
            {/* pricing lives on the landing page now */}
            <Route path="/pricingTable" element={<Navigate to="/#pricing" replace />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/celebrities" element={<PublicCelebritiesPage />} />
            <Route path="/celebrities/:celebrityId" element={<PublicCelebrityDashboard />} />
            <Route path="/celebrity-relationships" element={<PublicCelebrityRelationships />} />
            <Route path="/celebrity-relationships/:compositeId" element={<PublicCelebrityRelationship />} />
            <Route path="/horoscopes/weekly" element={<PublicWeeklyHoroscopesPage />} />
            <Route path="/horoscopes/weekly/:sign" element={<PublicWeeklyHoroscopesPage />} />
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
                  <InkHoroscopePage />
                </ProtectedRoute>
              }
            />
            {/* pre-ink dashboard shell — kept only for the Settings
                section until it gets an ink home */}
            <Route
              path="/dashboard/:userId/legacy"
              element={
                <ProtectedRoute>
                  <MainDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:userId/charts"
              element={
                <ProtectedRoute>
                  <InkMyChartsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:userId/relationships"
              element={
                <ProtectedRoute>
                  <InkMyRelationshipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:userId/chart/:chartId"
              element={
                <ProtectedRoute>
                  <InkBirthChartPage />
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
                  <CreateRelationshipRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:userId/relationship/:compositeId"
              element={
                <ProtectedRoute>
                  <InkRelationshipPage />
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
