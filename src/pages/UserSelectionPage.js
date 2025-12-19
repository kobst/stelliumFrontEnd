import React from 'react';
import { useNavigate } from 'react-router-dom';
import UsersTable from '../UI/prototype/UsersTable';
import useStore from '../Utilities/store';
import './UserSelectionPage.css';

function UserSelectionPage() {
  const navigate = useNavigate();

  // Zustand store setters
  const setSelectedUser = useStore(state => state.setSelectedUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setUserElements = useStore(state => state.setUserElements);
  const setUserModalities = useStore(state => state.setUserModalities);
  const setUserQuadrants = useStore(state => state.setUserQuadrants);
  const setUserPatterns = useStore(state => state.setUserPatterns);
  const setCurrentUserContext = useStore(state => state.setCurrentUserContext);
  const setActiveUserContext = useStore(state => state.setActiveUserContext);

  const handleUserSelect = async (user) => {
    // Set user data in store
    setSelectedUser(user);
    setUserId(user._id);

    // Set birth chart data
    if (user.birthChart) {
      setUserPlanets(user.birthChart.planets || []);
      setUserHouses(user.birthChart.houses || []);
      setUserAspects(user.birthChart.aspects || []);
      setUserElements(user.birthChart.elements || {});
      setUserModalities(user.birthChart.modalities || {});
      setUserQuadrants(user.birthChart.quadrants || {});
      setUserPatterns(user.birthChart.patterns || {});
    }

    // Set user context for dashboard
    setCurrentUserContext(user);
    setActiveUserContext(user);

    // Navigate to dashboard
    navigate(`/dashboard/${user._id}`);
  };

  return (
    <div className="user-selection-page">
      <div className="user-selection-header">
        <h1 className="user-selection-title mont-font">STELLIUM</h1>
        <p className="user-selection-subtitle">Select a user to view their dashboard</p>
      </div>

      <div className="user-selection-content">
        <UsersTable onUserSelect={handleUserSelect} usePagination={true} />
      </div>
    </div>
  );
}

export default UserSelectionPage;
