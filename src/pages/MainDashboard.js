import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { fetchUser } from '../Utilities/api';
import useStore from '../Utilities/store';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import DashboardLayout from '../UI/layout/DashboardLayout';
import WelcomeBanner from '../UI/dashboard/WelcomeBanner';
import LowCreditsBanner from '../UI/entitlements/LowCreditsBanner';
import HoroscopeSection from '../UI/dashboard/HoroscopeSection';
import BirthChartsSection from '../UI/dashboard/BirthChartsSection';
import RelationshipsSection from '../UI/dashboard/RelationshipsSection';
import SettingsSection from '../UI/dashboard/SettingsSection';
import './MainDashboard.css';

function MainDashboard() {
  const { userId } = useParams();
  const location = useLocation();
  const { stelliumUser } = useAuth();

  // Get section from navigation state (when coming from detail pages)
  const sectionFromState = location.state?.section;
  const [user, setUser] = useState(null);
  const entitlements = useEntitlements(user);
  const credits = useEntitlementsStore((state) => state.credits);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Zustand store setters
  const setSelectedUser = useStore(state => state.setSelectedUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setCurrentUserContext = useStore(state => state.setCurrentUserContext);
  const setActiveUserContext = useStore(state => state.setActiveUserContext);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUser(userId);
        setUser(userData);

        // Update Zustand store
        setSelectedUser(userData);
        setUserId(userData._id);
        setCurrentUserContext(userData);
        setActiveUserContext(userData);

        // Set birth chart data if available
        if (userData?.birthChart) {
          if (userData.birthChart.planets) {
            setUserPlanets(userData.birthChart.planets);
          }
          if (userData.birthChart.houses) {
            setUserHouses(userData.birthChart.houses);
          }
          if (userData.birthChart.aspects) {
            setUserAspects(userData.birthChart.aspects);
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId, setSelectedUser, setUserId, setUserPlanets, setUserHouses, setUserAspects, setCurrentUserContext, setActiveUserContext]);

  // Security check: Redirect if user tries to access a different user's dashboard
  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading) {
    return (
      <div className="main-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-dashboard">
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render section based on current navigation state
  const renderSection = (currentSection) => {
    switch (currentSection) {
      case 'horoscope':
        return <HoroscopeSection userId={userId} user={user} entitlements={entitlements} />;
      case 'birth-charts':
        return <BirthChartsSection userId={userId} user={user} />;
      case 'relationships':
        return <RelationshipsSection userId={userId} />;
      case 'settings':
        return <SettingsSection userId={userId} user={user} entitlements={entitlements} />;
      default:
        return <HoroscopeSection userId={userId} user={user} entitlements={entitlements} />;
    }
  };

  return (
    <DashboardLayout user={user} defaultSection={sectionFromState || 'horoscope'}>
      {({ currentSection, setCurrentSection }) => (
        <div className="main-dashboard__content">
          <WelcomeBanner
            isTrialActive={entitlements.isTrialActive}
            trialDaysRemaining={entitlements.trialDaysRemaining}
          />
          <LowCreditsBanner
            credits={credits}
            onGetMore={() => setCurrentSection('settings')}
          />
          {renderSection(currentSection)}
        </div>
      )}
    </DashboardLayout>
  );
}

export default MainDashboard;
