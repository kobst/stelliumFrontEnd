import React, { useEffect, useState } from 'react';
import TabbedBigFourMenu from '../UI/birthChart/TabbedBigFourComponent';
import UsersTable from '../UI/prototype/UsersTable';
import UserChat from '../UI/prototype/UserChat';
import UserHoroscopeContainer from '../UI/prototype/UserHoroscopeContainer';
import WeeklyTransitDescriptions from '../UI/prototype/WeeklyTransitDescriptions';
import CombinedTransitsTables from '../UI/prototype/CombinedTransitsTable';
import Ephemeris from '../UI/shared/Ephemeris';
import useStore from '../Utilities/store';
import { HeadingTransitEnum, heading_map } from '../Utilities/constants';
import { identifyBirthChartPattern } from '../Utilities/generatePatternDescription'
import { DominanceEnum, HeadingEnum, dominance_headings, planet_headings } from '../Utilities/constants';
import { formatTransitDataForUser, generateWeeklyTransitDescriptions, generateTransitString, generateHouseTransitStringComplete } from '../Utilities/generateUserTranstiDescriptions';
import { 
  findAspectsComputed, 
  findAspectsNonComputed,
  describePlanets, 
  describeHouses, 
  generatePlanetPromptDescription,
  findPlanetsInQuadrant, 
  findPlanetsInElements, 
  findPlanetsInModalities } from '../Utilities/generateBirthDataDescriptions'
import BirthChartSummary from '../UI/birthChart/BirthChartSummary';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';
import TransitsTable from '../UI/prototype/TransitsTable';
import HouseTransitsTable from '../UI/prototype/HouseTransitsTable';
import StatusList from '../UI/prototype/StatusList';
import {
  fetchBirthChartInterpretation,
  postPromptGeneration } from '../Utilities/api';
import { handleFetchDailyTransits } from '../Utilities/generateUserTranstiDescriptions';
import { set } from 'date-fns';

function PrototypePage() {
  // const ascendantDegree = useStore(state => state.ascendantDegree)
  const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
  const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
  const userPlanets = useStore(state => state.userPlanets)
  const userHouses = useStore(state => state.userHouses)
  const userAspects = useStore(state => state.userAspects)  
  const userPeriodTransits = useStore(state => state.userPeriodTransits)
  const userPeriodHouseTransits = useStore(state => state.userPeriodHouseTransits)
  const userId = useStore(state => state.userId);
  const dailyTransits = useStore(state => state.dailyTransits)
  const setDailyTransits = useStore(state => state.setDailyTransits)
  const selectedUser = useStore(state => state.selectedUser);
  const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
  const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap)
  const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
  const headingInterpretationMap = useStore(state => state.headingInterpretationMap)
  const isDataPopulated = userPlanets.length > 1 && userHouses.length > 1
  const isTransitsPopulated = userPeriodTransits.length > 1
  const isHouseTransitsPopulated = userPeriodHouseTransits.length > 1
  const [formattedTransits, setFormattedTransits] = useState([]);




  const isBirthChartPopulated = isDataPopulated && isTransitsPopulated

  useEffect(() => {
    if (userId) {
      console.log('userId')
      console.log(userId)
      fetchUserBirthChartInterpretation(userId)
      // generateDescriptions();
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
    getTodaysData()
  }, [])


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
          console.log('planet: ', planet);
          const planetData = fetchedInterpretation[planet];
          if (planetData && typeof planetData === 'object') {
            console.log('saved planet: ', planet);
            console.log('saved interpretation: ', planetData.interpretation);
            console.log('saved promptDescription: ', planetData.promptDescription);
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
          console.log('heading: ', heading);
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
  
    } catch (error) {
      console.error('Error fetching birth chart interpretation:', error);
    }
  };





  return (
    <div className="prototype-page" style={{ marginBottom: '50px' }}>
      <div className="maintxt mont-font">
        <h1 className="logotxt">STELLIUM</h1>
      </div>
  
      <UsersTable />
      <UserHoroscopeContainer
        selectedUser={selectedUser}
        isDataPopulated={isDataPopulated}
        userPlanets={userPlanets}
        userHouses={userHouses}
        userAspects={userAspects}
        dailyTransits={dailyTransits}
      />
  
      {/* <div className="horoscope-container"> */}
        <div>
        {/* <div>
          <h2>Selected Transits</h2>
          {formattedTransits.length > 0 ? (
            formattedTransits.map((transit, index) => (
            <p key={index}>{transit}</p>
          ))
        ) : (
          <p>No transits selected</p>
        )}
        </div>

        {isTransitsPopulated && isHouseTransitsPopulated ? (
          <CombinedTransitsTables userPeriodTransits={userPeriodTransits} userPeriodHouseTransits={userPeriodHouseTransits} userHouses={userHouses}/>
        ) : (
          <p>Loading transits...</p>
        )} */}

        <WeeklyTransitDescriptions
          userPeriodTransits={userPeriodTransits}
          userPeriodHouseTransits={userPeriodHouseTransits}
          userPlanets={userPlanets}
        />

        <UserChat selectedUser={selectedUser} />   
   
        <span>
          <h2>birth chart interpretation</h2>
        </span>

          <div>
            {/* <BirthChartSummary summary={promptDescriptionsMap.everything} /> */}
            <StatusList />
            <TabbedBigFourMenu /> 
          </div>
      </div>
    </div>
  );
}

export default PrototypePage;