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
  const setUserBirthChart = useStore(state => state.setUserBirthChart);
  const setCompositeChart = useStore(state => state.setCompositeChart)


  const navigate = useNavigate();


  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setUserId(user._id);
    setUserBirthChart(user.birthChart);
    setUserPlanets(user.birthChart.planets );
    setUserHouses(user.birthChart.houses);
    setUserAspects(user.birthChart.aspects);
    // setElements(user.birthChart.elements);
    // setModalities(user.birthChart.modalities);
    // const startDate = new Date();
    // const endDate = new Date();
    // endDate.setDate(endDate.getDate() + 30);
    // fetchUserBirthChartInterpretation(user._id);
    // fetchUserPeriodTransits(user, startDate, endDate)

    navigate(`/userDashboard`);

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