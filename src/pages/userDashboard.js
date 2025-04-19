import React, { useEffect, useState } from 'react';
import TabbedBigFourMenu from '../UI/birthChart/TabbedBigFourComponent';
import UserChat from '../UI/prototype/UserChat';
import UserHoroscopeContainer from '../UI/prototype/UserHoroscopeContainer';
import WeeklyTransitDescriptions from '../UI/prototype/WeeklyTransitDescriptions';
import useStore from '../Utilities/store';
import { heading_map } from '../Utilities/constants';
import { identifyBirthChartPattern } from '../Utilities/generatePatternDescription'
import { HeadingEnum, dominance_headings, planet_headings } from '../Utilities/constants';
import { 
  generatePlanetPromptDescription,
  findPlanetsInQuadrant, 
  findPlanetsInElements, 
  findPlanetsInModalities } from '../Utilities/generateBirthDataDescriptions'
import StatusList from '../UI/prototype/StatusList';
import {
  fetchBirthChartInterpretation,
  getShortOverview,
  postPromptGeneration } from '../Utilities/api';
import { handleFetchDailyTransits, handleFetchRetrogradeTransits } from '../Utilities/generateUserTranstiDescriptions';


function UserDashboard() {
  const selectedUser = useStore(state => state.selectedUser);
  const userId = useStore(state => state.userId);
  const userPlanets = useStore(state => state.userPlanets);
  const userHouses = useStore(state => state.userHouses);
  const userAspects = useStore(state => state.userAspects);
  const dailyTransits = useStore(state => state.dailyTransits);
  const retrogradeTransits = useStore(state => state.retrogradeTransits);
  const setRetrogradeTransits = useStore(state => state.setRetrogradeTransits);
  const userPeriodTransits = useStore(state => state.userPeriodTransits);
  const userPeriodHouseTransits = useStore(state => state.userPeriodHouseTransits);

  const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
  const setDailyTransits = useStore(state => state.setDailyTransits)
  const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
  const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap)
  const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
  const headingInterpretationMap = useStore(state => state.headingInterpretationMap)
  const isTransitsPopulated = userPeriodTransits.length > 1

  const [shortOverview, setShortOverview] = useState('');

  const [isDataPopulated, setIsDataPopulated] = useState(false);

  useEffect(() => {
    if (userId) {
      console.log('userId')
      console.log(userId)
      if (userAspects.length !== 0 || userHouses.length !== 0 || userPlanets.length !== 0) {
      // fetchUserBirtishChartInterpretation(userId)
      // generateDescriptions();
      setIsDataPopulated(true);
      }
    }
  }, [userId]);


  useEffect( () => {
    async function getTodaysData() {
      if (dailyTransits.length === 0) {
        const currentDateISO = new Date().toISOString();
        const cleanedTransits = await handleFetchDailyTransits(currentDateISO);
        setDailyTransits(cleanedTransits)
      }
    }

    async function getRetrogradeTransits() {
        if (retrogradeTransits.length === 0) {
        // set date range to 30 days from today
        const startDate = new Date().toISOString();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);
        const retrogradeTransits = await handleFetchRetrogradeTransits(startDate, endDate);
        setRetrogradeTransits(retrogradeTransits)
      }
    }
    getTodaysData()
    getRetrogradeTransits()
  }, [])


  const generateShortOverview = async () => {
    const birthData = { planets: userPlanets, houses: userHouses, aspects: userAspects };
    const responseObject = await getShortOverview(birthData);
    console.log("Response object:", responseObject)
    // Check if responseObject is an object with a response property
    if (responseObject && typeof responseObject === 'object' && responseObject.response) {
        setShortOverview(responseObject.response) // Set just the response string
    } else {
        setShortOverview(String(responseObject)) // Convert to string as fallback
    }
  };

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
  
      // Generate default prompt descriptions
      const birthData = { planets: userPlanets, houses: userHouses, aspectsComputed: userAspects };
      const defaultPromptMapResponse = await postPromptGeneration(userPlanets, userHouses, userAspects);
      const defaultPromptDescriptionsMap = defaultPromptMapResponse.promptDescriptionsMap;
  
      // const everythingResponse = response.concat(userHouses, userAspects)

      // const response = describePlanets(birthData)
      // const houseResponse = describeHouses(birthData)
      // const aspects = findAspectsNonComputed(birthData)
      // const everythingResponse = response.concat(houseResponse, aspects)
      // setPromptDescriptionsMap('everything', everythingResponse)

      // Loop through all subHeadings and populate with fetched or default values
      for (const heading in heading_map) {
        const subHeadings = heading_map[heading];
        const defaultPromptDescription = defaultPromptDescriptionsMap[heading];
  
        for (const subHeading of subHeadings) {
          const fetchedSubHeadingData = fetchedInterpretation[subHeading];
  
          if (fetchedSubHeadingData && typeof fetchedSubHeadingData === 'object') {
            // console.log('saved subHeading: ', subHeading);
            // console.log('saved interpretation: ', fetchedSubHeadingData.interpretation);
            // console.log('saved promptDescription: ', fetchedSubHeadingData.promptDescription);
            setHeadingInterpretationMap(subHeading, fetchedSubHeadingData.interpretation || '');
            setSubHeadingsPromptDescriptionsMap(subHeading, fetchedSubHeadingData.promptDescription || '');
          } else {
            // console.log('using default promptDescription for subHeading: ', subHeading);
            setPromptDescriptionsMap(heading, defaultPromptDescription);
            setSubHeadingsPromptDescriptionsMap(subHeading, defaultPromptDescription);
            setHeadingInterpretationMap(subHeading, '');
          }
        }

        // loop thorugh the planets and fill in the interpretations if the exist in the fetchedInterpretation
        for (const planet of planet_headings) {
        //   console.log('planet: ', planet);
          const planetData = fetchedInterpretation[planet];
          if (planetData && typeof planetData === 'object') {
            // console.log('saved planet: ', planet);
            // console.log('saved interpretation: ', planetData.interpretation);
            // console.log('saved promptDescription: ', planetData.promptDescription);
            setHeadingInterpretationMap(planet, planetData.interpretation || '');
            setSubHeadingsPromptDescriptionsMap(planet, planetData.promptDescription || '');
          } else {
            // Generate the prompt description if not available in the fetched interpretation
            const planetPromptDescription = generatePlanetPromptDescription(planet, userPlanets, userHouses, userAspects);
            // console.log("planetPromptDescription", planetPromptDescription)
            setSubHeadingsPromptDescriptionsMap(planet, planetPromptDescription);
          }
        }

        for (const heading of dominance_headings) {
        //   console.log('heading: ', heading);
          const headingData = fetchedInterpretation[heading];
          if (headingData && typeof headingData === 'object') {
            // console.log('saved heading: ', heading);
            // console.log('saved interpretation: ', headingData.interpretation);
            // console.log('saved promptDescription: ', headingData.promptDescription);
            setHeadingInterpretationMap(heading, headingData.interpretation || '');
            // setSubHeadingsPromptDescriptionsMap(heading, headingData.promptDescription || '');
          }
        }
      }
  
      // Set additional subheadings prompt descriptions
      setSubHeadingsPromptDescriptionsMap(HeadingEnum.ELEMENTS, findPlanetsInElements(birthData));
      setSubHeadingsPromptDescriptionsMap(HeadingEnum.MODALITIES, findPlanetsInModalities(birthData));
      setSubHeadingsPromptDescriptionsMap(HeadingEnum.QUADRANTS, findPlanetsInQuadrant(birthData));
      setSubHeadingsPromptDescriptionsMap(HeadingEnum.PATTERN, identifyBirthChartPattern(birthData));
      setIsDataPopulated(true);
    } catch (error) {
      console.error('Error fetching birth chart interpretation:', error);
    }
  };





  return (
    <div className="user-prototype-page">
   
        <UserHoroscopeContainer
          selectedUser={selectedUser}
          isDataPopulated={isDataPopulated}
          userPlanets={userPlanets}
          userHouses={userHouses}
          userAspects={userAspects}
          dailyTransits={dailyTransits}
        />

      <button onClick={generateShortOverview}>Generate Short Overview</button>
      <p>{shortOverview}</p>

      {/* <WeeklyTransitDescriptions
        userPeriodTransits={userPeriodTransits}
        userPeriodHouseTransits={userPeriodHouseTransits}
        userPlanets={userPlanets}
        retrogradeTransits={retrogradeTransits}
      />

      <UserChat selectedUser={selectedUser} />   

      <span>
        <h2>birth chart interpretation</h2>
      </span>

      <div>
        <StatusList />
        <TabbedBigFourMenu /> 
      </div> */}
    </div>
  );
}

export default UserDashboard;