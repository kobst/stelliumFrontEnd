import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UsersTable from '../UI/prototype/UsersTable';
import CelebritiesTable from '../UI/prototype/CelebritiesTable';
import AddCelebrityForm from '../UI/admin/AddCelebrityForm';
import CelebrityRelationshipsTab from '../UI/admin/CelebrityRelationshipsTab';
import CelebrityHoroscopeModal from '../UI/admin/CelebrityHoroscopeModal';
import HoroscopePreview from '../UI/admin/HoroscopePreview';
import VideoAssetsTab from '../UI/admin/VideoAssetsTab';
import useStore from '../Utilities/store';
import '../styles/admin-theme.css';

function AdminPage() {
  const [refreshCelebrities, setRefreshCelebrities] = useState(0);
  const [horoscopeCelebrity, setHoroscopeCelebrity] = useState(null);
  
  const setSelectedUser = useStore(state => state.setSelectedUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setUserElements = useStore(state => state.setUserElements);
  const setUserModalities = useStore(state => state.setUserModalities);
  const setUserQuadrants = useStore(state => state.setUserQuadrants);
  const setUserPatterns = useStore(state => state.setUserPatterns);
  const setUserPlanetaryDominance = useStore(state => state.setUserPlanetaryDominance);

  const navigate = useNavigate();

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setUserId(user._id);
    setUserPlanets(user.birthChart.planets);
    setUserHouses(user.birthChart.houses);
    setUserAspects(user.birthChart.aspects);
    setUserElements(user.birthChart.elements);
    setUserModalities(user.birthChart.modalities);
    setUserQuadrants(user.birthChart.quadrants);
    setUserPatterns(user.birthChart.patterns);
    setUserPlanetaryDominance(user.birthChart.planetaryDominance);

    navigate(`/userDashboard/${user._id}`);
  };

  const handleCelebritySelect = async (celebrity) => {
    setSelectedUser(celebrity);
    setUserId(celebrity._id);
    setUserPlanets(celebrity.birthChart.planets);
    setUserHouses(celebrity.birthChart.houses);
    setUserAspects(celebrity.birthChart.aspects);
    setUserElements(celebrity.birthChart.elements);
    setUserModalities(celebrity.birthChart.modalities);
    setUserQuadrants(celebrity.birthChart.quadrants);
    setUserPatterns(celebrity.birthChart.patterns);
    setUserPlanetaryDominance(celebrity.birthChart.planetaryDominance);

    navigate(`/userDashboard/${celebrity._id}`);
  };

  const handleCelebrityAdded = () => {
    // Trigger refresh of celebrities table
    setRefreshCelebrities(prev => prev + 1);
  };

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <h1>ADMIN — USER MANAGEMENT</h1>
      </header>

      <UsersTable onUserSelect={handleUserSelect} usePagination={true} adminTheme={true} />
      <CelebritiesTable
        onCelebritySelect={handleCelebritySelect}
        onGenerateHoroscope={setHoroscopeCelebrity}
        key={refreshCelebrities}
        usePagination={true}
        adminTheme={true}
      />
      <AddCelebrityForm onCelebrityAdded={handleCelebrityAdded} />
      <CelebrityRelationshipsTab />
      <HoroscopePreview />
      <VideoAssetsTab />
      {horoscopeCelebrity && (
        <CelebrityHoroscopeModal
          celebrity={horoscopeCelebrity}
          onClose={() => setHoroscopeCelebrity(null)}
        />
      )}
    </main>
  );
}

export default AdminPage;
