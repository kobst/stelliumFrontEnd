import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UsersTable from '../UI/prototype/UsersTable';
import useStore from '../Utilities/store';

import CompositesTable from '../UI/prototype/CompositesTable';


function PrototypePage() {

  const setSelectedUser = useStore(state => state.setSelectedUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setCompositeChart = useStore(state => state.setCompositeChart)
  const setUserElements = useStore(state => state.setUserElements);
  const setUserModalities = useStore(state => state.setUserModalities);
  const setUserQuadrants = useStore(state => state.setUserQuadrants);
  const setUserPatterns = useStore(state => state.setUserPatterns);

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
    // const startDate = new Date();
    // const endDate = new Date();
    // endDate.setDate(endDate.getDate() + 30);
    // fetchUserBirthChartInterpretation(user._id);
    // fetchUserPeriodTransits(user, startDate, endDate)

    navigate(`/userDashboard/${user._id}`);

  };

  const handleCompositeChartSelect = (compositeChart) => {
    console.log("compositeChart", compositeChart._id)
    setCompositeChart(compositeChart)
    navigate(`/compositeDashboard`);
  }




  return (
    <div className="prototype-page" style={{ marginBottom: '50px' }}>
      <div className="maintxt mont-font">
        <h1 className="logotxt">STELLIUM USERS</h1>
      </div>
  
      <UsersTable onUserSelect={handleUserSelect} />
      <CompositesTable onCompositeChartSelect={handleCompositeChartSelect} />
    </div>
  );
}

export default PrototypePage;