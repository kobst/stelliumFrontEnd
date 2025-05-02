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
  getPlanetOverview,
  getAllPlanetOverview,
  getFullBirthChartAnalysis,
  postPromptGeneration } from '../Utilities/api';
import { handleFetchDailyTransits, handleFetchRetrogradeTransits } from '../Utilities/generateUserTranstiDescriptions';


function UserDashboard() {
  const selectedUser = useStore(state => state.selectedUser);
  const userId = useStore(state => state.userId);
  const userBirthChart = useStore(state => state.userBirthChart);
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
  const [sunOverview, setSunOverview] = useState('');
  const [moonOverview, setMoonOverview] = useState('');
  const [ascendantOverview, setAscendantOverview] = useState('');
  const [mercuryOverview, setMercuryOverview] = useState('');
  const [venusOverview, setVenusOverview] = useState('');
  const [marsOverview, setMarsOverview] = useState('');
  const [jupiterOverview, setJupiterOverview] = useState('');
  const [saturnOverview, setSaturnOverview] = useState('');
  const [uranusOverview, setUranusOverview] = useState('');
  const [neptuneOverview, setNeptuneOverview] = useState('');
  const [plutoOverview, setPlutoOverview] = useState('');
  const [elementsOverview, setElementsOverview] = useState('');
  const [modalitiesOverview, setModalitiesOverview] = useState('');
  const [quadrantsOverview, setQuadrantsOverview] = useState('');

  const [topicAnalysis, setTopicAnalysis] = useState('');

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


  // useEffect( () => {
  //   async function getTodaysData() {
  //     if (dailyTransits.length === 0) {
  //       const currentDateISO = new Date().toISOString();
  //       const cleanedTransits = await handleFetchDailyTransits(currentDateISO);
  //       setDailyTransits(cleanedTransits)
  //     }
  //   }

  //   async function getRetrogradeTransits() {
  //       if (retrogradeTransits.length === 0) {
  //       // set date range to 30 days from today
  //       const startDate = new Date().toISOString();
  //       const endDate = new Date(startDate);
  //       endDate.setDate(endDate.getDate() + 30);
  //       const retrogradeTransits = await handleFetchRetrogradeTransits(startDate, endDate);
  //       setRetrogradeTransits(retrogradeTransits)
  //     }
  //   }
  //   getTodaysData()
  //   getRetrogradeTransits()
  // }, [])


  const generateShortOverview = async () => {
    try {
        const responseObject = await getFullBirthChartAnalysis(selectedUser);
        
        // Debug logs to see the exact structure
        console.log("Full response object:", responseObject);
        console.log("Type of response:", typeof responseObject);
        console.log("Keys in response:", Object.keys(responseObject));
        
        // Check if we need to parse the JSON
        let parsedResponse;
        if (typeof responseObject === 'string') {
            try {
                parsedResponse = JSON.parse(responseObject);
                console.log("Parsed response:", parsedResponse);
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                return;
            }
        } else {
            parsedResponse = responseObject;
        }
        
        if (parsedResponse && typeof parsedResponse === 'object') {
          const responseData = parsedResponse.data
            // Set the main overview
            console.log("Overview content:", responseData.overview);
            setShortOverview(responseData.overview || 'No overview available');
            
            if (responseData.dominance) {
                setElementsOverview(responseData.dominance.elements.interpretation)
                setModalitiesOverview(responseData.dominance.modalities.interpretation)
                setQuadrantsOverview(responseData.dominance.quadrants.interpretation)
            }
            // Set individual planet overviews
            if (responseData.planets) {
                console.log("Planets content:", responseData.planets);
                setSunOverview(responseData.planets['Sun'].interpretation || '')
                setMoonOverview(responseData.planets['Moon'].interpretation || '')
                setAscendantOverview(responseData.planets['Ascendant'].interpretation || '')
                setMercuryOverview(responseData.planets['Mercury'].interpretation || '')
                setVenusOverview(responseData.planets['Venus'].interpretation || '')
                setMarsOverview(responseData.planets['Mars'].interpretation || '')
                setJupiterOverview(responseData.planets['Jupiter'].interpretation || '')
                setSaturnOverview(responseData.planets['Saturn'].interpretation || '')
                setUranusOverview(responseData.planets['Uranus'].interpretation || '')
                setNeptuneOverview(responseData.planets['Neptune'].interpretation || '')
                setPlutoOverview(responseData.planets['Pluto'].interpretation || '')
            }
        } else {
            console.warn("Invalid response object:", parsedResponse)
            setShortOverview('Unable to generate overview at this time')
        }
    } catch (error) {
        console.error('Error generating overview:', error);
        setShortOverview('Error generating overview. Please try again.')
    }
};


const generateTopicAnalysis = async () => {
  try {
    const response = await generateTopicAnalysis(selectedUser)
    console.log("response", response)
  } catch (error) {
    console.error('Error generating topic analysis:', error);
    setTopicAnalysis('Error generating topic analysis. Please try again.')
  }
  
}

// const planetNames = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "ascendant", "Ascendant"];

// async function generateAllPlanetOverviews() {
//   const birthData = { planets: userPlanets, houses: userHouses, aspects: userAspects };
//   console.log("birthData", birthData)
//   for (const planet of birthData.planets) {
//     if (planetNames.includes(planet.name)) {
//       generatePlanetOverview(planet.name, birthData)
//     }
//   }
// }

// async function generateAllPlanetOverviewsAtOnce() {
//     try {
//       // const response = await getPlanetOverview(planetName, birthData)
//       const birthData = { planets: userPlanets, houses: userHouses, aspects: userAspects };
//       const response = await getAllPlanetOverview(birthData)

//       console.log("response", response)
//       if (response && typeof response === 'object' && response.responses) {
//               setSunOverview(response.responses['Sun'])
//               setMoonOverview(response.responses['Moon'])
//               setAscendantOverview(response.responses['Ascendant'])
//               setMercuryOverview(response.responses['Mercury'])
//               setVenusOverview(response.responses['Venus'])
//               setMarsOverview(response.responses['Mars'])
//               setJupiterOverview(response.responses['Jupiter'])
//               setSaturnOverview(response.responses['Saturn'])
//               setUranusOverview(response.responses['Uranus'])
//               setNeptuneOverview(response.responses['Neptune'])
//               setPlutoOverview(response.responses['Pluto'])
//           } else {
//               console.log("response with no responses", response)
//           }
//       } catch (error) {
//           console.error('Error:', error);
//       }
// }

// // Generate planet overview
// async function generatePlanetOverview(planetName, birthData) {
//     console.log("planet: ", planetName)
//     try {
//         const response = await getPlanetOverview(planetName, birthData)
//         // const response = await getAllPlanetOverview(birthData)

//         console.log("response", response)
//         if (response && typeof response === 'object' && response.response) {
//             if (planetName === "Sun") {
//                 setSunOverview(response.response)
//             }
//             if (planetName === "Moon") {
//               setMoonOverview(response.response)
//             }
//             if (planetName === "Ascendant" || planetName === "ascendant") {
//                 setAscendantOverview(response.response)
//             }
//             if (planetName === "Mercury") {
//                 setMercuryOverview(response.response)
//             }
//             if (planetName === "Venus") {
//                 setVenusOverview(response.response)
//             }
//             if (planetName === "Mars") {
//                 setMarsOverview(response.response)
//             }
//             if (planetName === "Jupiter") {
//                 setJupiterOverview(response.response)
//             }
//             if (planetName === "Saturn") {
//                 setSaturnOverview(response.response)
//             }
//             if (planetName === "Uranus") {
//                 setUranusOverview(response.response)
//             }
//             if (planetName === "Neptune") {
//                 setNeptuneOverview(response.response)
//             }
//             if (planetName === "Pluto") {
//                 setPlutoOverview(response.response)
//             }

//         } else {
//             return String(response)
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }


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

      <button onClick={generateTopicAnalysis}>Generate Topic Analysis</button>

      <p>{shortOverview}</p>
      <p>Elements Overview</p>
      <p>{elementsOverview}</p>
      <p>Modalities Overview</p>
      <p>{modalitiesOverview}</p>
      <p>Quadrants Overview</p>
      <p>{quadrantsOverview}</p>
      <p>Sun Overview</p>
      <p>{sunOverview}</p>
      <p>Moon Overview</p>
      <p>{moonOverview}</p>
      <p>Ascendant Overview</p>
      <p>{ascendantOverview}</p>
      <p>Mercury Overview</p>
      <p>{mercuryOverview}</p>
      <p>Venus Overview</p>
      <p>{venusOverview}</p>
      <p>Mars Overview</p>
      <p>{marsOverview}</p>
      <p>Jupiter Overview</p>
      <p>{jupiterOverview}</p>
      <p>Saturn Overview</p>
      <p>{saturnOverview}</p>
      <p>Uranus Overview</p>
      <p>{uranusOverview}</p>
      <p>Neptune Overview</p>
      <p>{neptuneOverview}</p>
      <p>Pluto Overview</p>
      <p>{plutoOverview}</p>
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