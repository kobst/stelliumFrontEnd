import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUser } from '../Utilities/api';
import useStore from '../Utilities/store';
import DashboardHeader from '../UI/dashboard/DashboardHeader';
import TabMenu from '../UI/shared/TabMenu';
import HoroscopeSection from '../UI/dashboard/HoroscopeSection';
import BirthChartsSection from '../UI/dashboard/BirthChartsSection';
import RelationshipsSection from '../UI/dashboard/RelationshipsSection';
import './MainDashboard.css';

function MainDashboard() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
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

  const mainTabs = [
    {
      id: 'horoscope',
      label: 'Horoscope',
      content: <HoroscopeSection userId={userId} user={user} />
    },
    {
      id: 'birthCharts',
      label: 'Birth Charts',
      content: <BirthChartsSection userId={userId} user={user} />
    },
    {
      id: 'relationships',
      label: 'Relationships',
      content: <RelationshipsSection userId={userId} />
    }
  ];

  return (
    <div className="main-dashboard">
      <DashboardHeader user={user} />
      <div className="dashboard-content">
        <TabMenu tabs={mainTabs} />
      </div>
    </div>
  );
}

export default MainDashboard;
