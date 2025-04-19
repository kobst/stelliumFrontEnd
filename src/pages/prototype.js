import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import UsersTable from '../UI/prototype/UsersTable';
import useStore from '../Utilities/store';
import { fetchBirthChartInterpretation } from '../Utilities/api';
import { postPeriodAspectsForUserChart, postPeriodHouseTransitsForUserChart, postPeriodTransits } from '../Utilities/api';
import { 
  formatTransitDataForUser, 
} from '../Utilities/generateUserTranstiDescriptions';
import CompositesTable from '../UI/prototype/CompositesTable';

import { HeadingEnum } from '../Utilities/constants';

function PrototypePage() {

  const setSelectedUser = useStore(state => state.setSelectedUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const userPlanets = useStore(state => state.userPlanets)
  const userHouses = useStore(state => state.userHouses)
  const userPeriodTransits = useStore(state => state.userPeriodTransits)
  const setUserPeriodTransits = useStore(state => state.setUserPeriodTransits)
  const userPeriodHouseTransits = useStore(state => state.userPeriodHouseTransits)
  const setUserPeriodHouseTransits = useStore(state => state.setUserPeriodHouseTransits)
  const userId = useStore(state => state.userId);
  const dailyTransits = useStore(state => state.dailyTransits)
  const setDailyTransits = useStore(state => state.setDailyTransits)
  const selectedUser = useStore(state => state.selectedUser);
  const setCompositeChart = useStore(state => state.setCompositeChart)
  const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
  const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap)
  const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
  const headingInterpretationMap = useStore(state => state.headingInterpretationMap)
  const isDataPopulated = userPlanets.length > 1 && userHouses.length > 1
  const isTransitsPopulated = userPeriodTransits.length > 1

  const navigate = useNavigate();


  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setUserId(user._id);
    setUserPlanets(user.birthChart.planets );
    setUserHouses(user.birthChart.houses);
    setUserAspects(user.birthChart.aspects);
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

  const fetchUserBirthChartInterpretation = async (userId) => {
    try {
      const fetchedInterpretation = await fetchBirthChartInterpretation(userId);
      console.log('fetchedInterpretation');
      console.log(fetchedInterpretation);
  
      const validHeadings = Object.values(HeadingEnum);
  
      // Clear previous interpretation data for all headings
      validHeadings.forEach(heading => {
        setHeadingInterpretationMap(heading, '');
        setSubHeadingsPromptDescriptionsMap(heading, '');
      });
  
      Object.entries(fetchedInterpretation).forEach(([heading, data]) => {
        if (validHeadings.includes(heading) && typeof data === 'object') {
          setHeadingInterpretationMap(heading, data.interpretation || '');
          setSubHeadingsPromptDescriptionsMap(heading, data.promptDescription || '');
        } else {
          console.warn(`Invalid or unexpected data for heading: ${heading}`);
        }
      });
    } catch (error) {
      console.error('Error fetching birth chart interpretation:', error);
    }
  };

  const fetchUserPeriodTransits = async (user, startDate, endDate) => {
    const birthChartPlanets = user.birthChart.planets
    const birthChartHouses = user.birthChart.houses
    const periodTransitsTest = await postPeriodAspectsForUserChart(startDate, endDate, birthChartPlanets)
    const periodHouseTransitsTest = await postPeriodHouseTransitsForUserChart(startDate, endDate, birthChartHouses)
    // remove transits with Moon as transitingPlanet
    const filteredTransits = periodTransitsTest.filter(transit => transit.transitingPlanet !== 'Moon');
    console.log(" period transits")
    console.log(filteredTransits)
    console.log(" period house transits")
    console.log(periodHouseTransitsTest)
    // setUserPeriodHouseTransits(periodHouseTransitsTest)
    const formattedTransits = await formatUserPeriodTransits(filteredTransits, birthChartPlanets)
    setUserPeriodTransits(formattedTransits)
    setUserPeriodHouseTransits(periodHouseTransitsTest)

  }

  const formatUserPeriodTransits = async (userPeriodTransits, userPlanets) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const periodTransits = await postPeriodTransits(startDate, endDate);
    const formattedTransits = userPeriodTransits.map(transit => {
      return formatTransitDataForUser(transit, periodTransits, userPlanets)
    })
    console.log("formattedTransits")
    console.log(formattedTransits)
    return formattedTransits
    // setUserPeriodTransits(formattedTransits)
    // setUserPeriodTransits(formattedTransits)
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