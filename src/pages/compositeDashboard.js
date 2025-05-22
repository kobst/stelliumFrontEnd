import React, { useEffect, useState } from 'react';
import TabbedBigFourMenu from '../UI/archived/TabbedBigFourComponent';
import UserChat from '../UI/prototype/UserChat';
import UserHoroscopeContainer from '../UI/prototype/UserHoroscopeContainer';
import WeeklyTransitDescriptions from '../UI/prototype/archived/WeeklyTransitDescriptions';
import useStore from '../Utilities/store';
import { heading_map, planetCodes } from '../Utilities/constants';
import { identifyBirthChartPattern } from '../Utilities/generatePatternDescription'
import SynastryAspectsDescriptionsTable from '../UI/birthChart/tables/archived/SynastryAspectsDescriptionsTable'
import SynastryBirthChartComparison from '../UI/birthChart/tables/SynastryBirthChartComparison'
import SynastryHousePositionsTable from '../UI/birthChart/tables/SynastryHousePositionsTable'
import { CompositeChartHeadingEnums, planet_headings } from '../Utilities/constants';
import { 
  generatePlanetPromptDescription,
  findPlanetsInQuadrant, 
  findPlanetsInElements, 
  findPlanetsInModalities } from '../Utilities/generateBirthDataDescriptions'
import StatusList from '../UI/prototype/archived/StatusList';
import {
  fetchBirthChartInterpretation,
  fetchCompositeChartInterpretation,
  postPromptGeneration,
  postPromptGenerationCompositeChart,
  postPromptGenerationSynastry,
  postGptResponseCompositeChartPlanet,
  postGptResponseCompositeChart,
  postGptResponseSynastry,
  fetchUser,
  saveCompositeChartInterpretation,
  saveSynastryChartInterpretation,
  getCompositeChartInterpretation,
  getSynastryInterpretation,
  getRelationshipScore
  } from '../Utilities/api';
import { handleFetchDailyTransits, handleFetchRetrogradeTransits } from '../Utilities/generateUserTranstiDescriptions';
import { addAspectDescriptionComputed, describePlanets, getSynastryAspectDescription, findHouseSynastry } from '../Utilities/generateBirthDataDescriptions'

function CompositeDashboard({}) {
  
  const [isDataPopulated, setIsDataPopulated] = useState(false);
  const [dailyTransits, setDailyTransits] = useState([]);
  const [retrogradeTransits, setRetrogradeTransits] = useState([]);
  const [compositeChartDescription, setCompositeChartDescription] = useState([]);
  const [compositeChartPlanetDescriptions, setCompositeChartPlanetDescriptions] = useState([]);
  const [synastryAspectDescriptions, setSynastryAspectDescriptions] = useState([]);
  const [synastryPlanetDescriptions, setSynastryPlanetDescriptions] = useState([]);
  const [combinedDescriptions, setCombinedDescriptions] = useState([]);
  const [synastryAspects, setSynastryAspects] = useState([]);

  const compositeChart = useStore(state => state.compositeChart)
  const [compositeChartHeadingInterpretationMap, setCompositeChartHeadingInterpretationMap] = useStore(state => [state.compositeChartHeadingInterpretationMap, state.setCompositeChartHeadingInterpretationMap]);
  const [compositeChartPromptDescriptionsMap, setCompositeChartPromptDescriptionsMap] = useStore(state => [state.compositeChartPromptDescriptionsMap, state.setCompositeChartPromptDescriptionsMap]);
  const [synastryPromptDescriptionsMap, setSynastryPromptDescriptionsMap] = useStore(state => [state.synastryPromptDescriptionsMap, state.setSynastryPromptDescriptionsMap]);
  const [synastryHeadingInterpretationMap, setSynastryHeadingInterpretationMap] = useStore(state => [state.synastryHeadingInterpretationMap, state.setSynastryHeadingInterpretationMap]);

  const [userA, setUserA] = useState(null);
  const [userB, setUserB] = useState(null);

//   const [combinedDescriptions, setCombinedDescriptions] = useState([]);

//   useEffect(() => {

//     if (compositeChartDescription && compositeChartPlanetDescriptions && compositeChartDescription.length > 0 && compositeChartPlanetDescriptions.length > 0) {
//       console.log('compositeChartDescription')
//       console.log(compositeChartDescription)
//       const combinedDescriptions = compositeChartDescription.concat(compositeChartPlanetDescriptions)
//       console.log('combinedDescriptions')
//       console.log(combinedDescriptions)
//       setCombinedDescriptions(combinedDescriptions)
//     }
//   }, [compositeChartDescription, compositeChartPlanetDescriptions]);

useEffect(() => {
    const getCompositeChartProfile = async (compositeChart) => {
        if (compositeChart.userA_id && compositeChart.userB_id && compositeChart._id) {
            const userA = await fetchUser(compositeChart.userA_id)
            const userB = await fetchUser(compositeChart.userB_id)
            console.log("userA fetched", userA)
            console.log("userB fetched", userB)
            const compositeChartDescription = await generateCompositeChartDescription(compositeChart.compositeBirthChart)
            const compositeChartPlanetDescriptions = await generateCompositeChartPlanetDescriptions(compositeChart.compositeBirthChart)
            setCompositeChartDescription(compositeChartDescription)
            setCompositeChartPlanetDescriptions(compositeChartPlanetDescriptions)
            setCombinedDescriptions(compositeChartDescription.concat(compositeChartPlanetDescriptions))
            fetchCompositeChartInterpretation(compositeChart._id, compositeChartDescription, compositeChartPlanetDescriptions)
            setSynastryAspects(compositeChart.synastryAspects)
            setUserA(userA)
            setUserB(userB)
            const synastryDescriptions= await generateSynastryChartDescription(compositeChart.synastryAspects, userA.birthChart, userB.birthChart, userA.firstName, userB.firstName)
            setSynastryAspectDescriptions(synastryDescriptions.synastryAspectDescriptions)
            setSynastryPlanetDescriptions(synastryDescriptions.synastryPlanetDescriptions)
            fetchSynastryInterpretation(compositeChart._id, synastryDescriptions.synastryAspectDescriptions, synastryDescriptions.synastryPlanetDescriptions)
        }
    }
    getCompositeChartProfile(compositeChart)
  }, [compositeChart]);

//   useEffect( () => {
//     async function getTodaysData() {
//       if (dailyTransits.length === 0) {
//         const currentDateISO = new Date().toISOString();
//         const cleanedTransits = await handleFetchDailyTransits(currentDateISO);
//         setDailyTransits(cleanedTransits)
//       }
//     }

//     async function getRetrogradeTransits() {
//         if (retrogradeTransits.length === 0) {
//         // set date range to 30 days from today
//         const startDate = new Date().toISOString();
//         const endDate = new Date(startDate);
//         endDate.setDate(endDate.getDate() + 30);
//         const retrogradeTransits = await handleFetchRetrogradeTransits(startDate, endDate);
//         setRetrogradeTransits(retrogradeTransits)
//       }
//     }
//     getTodaysData()
//     getRetrogradeTransits()
//   }, [])


const generateSynastryChartDescription = async (synastryAspects, birthchartA, birthchartB, userAName, userBName) => {
  console.log("synastryAspectsObjects: ", synastryAspects)
  const synastryAspectDescriptions = synastryAspects.map(aspect => getSynastryAspectDescription(aspect, birthchartA, birthchartB, userAName, userBName));
    console.log("synastryAspectDescriptions", synastryAspectDescriptions)

    const planetDescriptionsA = birthchartA.planets.map(planet => {
        const house = findHouseSynastry(planet.full_degree, birthchartB.houses);
        const planetCode = planetCodes[planet.name];
        const houseCode = house.toString().padStart(2, '0');
        const retroCode = planet.is_retro === 'true' ? 'R-' : 'P-';
        const code = `SP1-${retroCode}${planetCode}H${houseCode}`; // SP1 = Synastry Planet Chart 1
        return `${planet.name} in ${userBName}'s chart is in the ${house}th house (${code})`;
    });

    const planetDescriptionsB = birthchartB.planets.map(planet => {
        const house = findHouseSynastry(planet.full_degree, birthchartA.houses);
        const planetCode = planetCodes[planet.name];
        const houseCode = house.toString().padStart(2, '0');
        const retroCode = planet.is_retro === 'true' ? 'R-' : 'P-';
        const code = `SP2-${retroCode}${planetCode}H${houseCode}`; // SP2 = Synastry Planet Chart 2
        return `${planet.name} in ${userAName}'s chart is in the ${house}th house (${code})`;
    });

    const synastryPlanetDescriptions = planetDescriptionsA.concat(planetDescriptionsB)

    console.log("synastryAspectDescriptions genereated: ", synastryAspectDescriptions)
    console.log("synastryPlanetDescriptions genereated: ", synastryPlanetDescriptions)
    return {
        synastryAspectDescriptions,
        synastryPlanetDescriptions
    }

}




const generateCompositeChartDescription = async (compositeChart) => {
    // loop through the aspects and generate the description
    console.log('compositeChart', compositeChart)
    const compositeChartDescriptionsArray = []
    for (let i = 0; i < compositeChart.aspects.length; i++) {
        const aspect = compositeChart.aspects[i];
        const aspectDescription = addAspectDescriptionComputed(aspect, compositeChart)
        // console.log("aspectDescription", aspectDescription)
        compositeChartDescriptionsArray.push(aspectDescription)
    }
    return compositeChartDescriptionsArray
}

const generateCompositeChartPlanetDescriptions = async (compositeChart) => {
  const compositeChartPlanetDescriptionsArray = describePlanets(compositeChart)
  return compositeChartPlanetDescriptionsArray
}




  const fetchCompositeChartInterpretation = async (compositeChartId, compositeChartDescription, compositeChartPlanetDescriptions) => {
    const combinedDescriptions = compositeChartDescription.concat(compositeChartPlanetDescriptions)
    try {
        // need to add this api
      const fetchedInterpretation = await getCompositeChartInterpretation(compositeChartId);
      console.log('fetchedInterpretation Composite Chart: ', fetchedInterpretation);
      const validHeadings = Object.values(CompositeChartHeadingEnums);

      // Clear previous interpretation data for all headings
      validHeadings.forEach(heading => {
        setCompositeChartHeadingInterpretationMap(heading, '');
        setCompositeChartPromptDescriptionsMap(heading, '');
      });
    
      for (const heading of validHeadings) {
        console.log("heading: ", heading)
        const fetchedSubHeadingData = fetchedInterpretation[heading];
  
        console.log(heading, " _ fetchedSubHeadingData: ", fetchedSubHeadingData)
        if (fetchedSubHeadingData && typeof fetchedSubHeadingData === 'object') {
            // console.log('saved subHeading: ', subHeading);
            // console.log('saved interpretation: ', fetchedSubHeadingData.interpretation);
            // console.log('saved promptDescription: ', fetchedSubHeadingData.promptDescription);
            setCompositeChartHeadingInterpretationMap(heading, fetchedSubHeadingData.interpretation || '');
            setCompositeChartPromptDescriptionsMap(heading, fetchedSubHeadingData.promptDescription || '');
        } else {
            const promptDescription = await postPromptGenerationCompositeChart(heading, combinedDescriptions);
            console.log("heading: ", heading)
            console.log("promptDescription: ", promptDescription.response)
            setCompositeChartPromptDescriptionsMap(heading, promptDescription.response);
            setCompositeChartHeadingInterpretationMap(heading, '');
        }
    

        // loop thorugh the planets and fill in the interpretations if the exist in the fetchedInterpretation
        for (const planet of planet_headings) {
        //   console.log('planet: ', planet);
          const planetData = fetchedInterpretation[planet];
          if (planetData && typeof planetData === 'object') {
            // console.log('saved planet: ', planet);
            // console.log('saved interpretation: ', planetData.interpretation);
            // console.log('saved promptDescription: ', planetData.promptDescription);
            setCompositeChartHeadingInterpretationMap(planet, planetData.interpretation || '');
            setCompositeChartPromptDescriptionsMap(planet, planetData.promptDescription || '');
          } else {
            // Generate the prompt description if not available in the fetched interpretation
            const planetPromptDescription = generatePlanetPromptDescription(planet, compositeChart.compositeBirthChart.planets, compositeChart.compositeBirthChart.houses, compositeChart.compositeBirthChart.aspects);
            console.log("planetPromptDescription for composite chart: ", planetPromptDescription)
            setCompositeChartPromptDescriptionsMap(planet, planetPromptDescription.join('\n'));
          }
        }





      }
  
    //   // Set additional subheadings prompt descriptions
    //   setSubHeadingsPromptDescriptionsMap(HeadingEnum.ELEMENTS, findPlanetsInElements(compositeChart));
    //   setSubHeadingsPromptDescriptionsMap(HeadingEnum.MODALITIES, findPlanetsInModalities(compositeChart));
    //   setSubHeadingsPromptDescriptionsMap(HeadingEnum.QUADRANTS, findPlanetsInQuadrant(compositeChart));
    //   setSubHeadingsPromptDescriptionsMap(HeadingEnum.PATTERN, identifyBirthChartPattern(compositeChart));
    //   setIsDataPopulated(true);
    } catch (error) {
      console.error('Error fetching birth chart interpretation:', error);
    }
  };


  const fetchSynastryInterpretation = async (compositeChartId, synastryAspectDescriptions, synastryPlanetDescriptions) => {
    console.log("synastryAspectDescriptions: ", synastryAspectDescriptions)
    console.log("synastryPlanetDescriptions: ", synastryPlanetDescriptions)
    const synastryDescriptions = synastryAspectDescriptions.concat(synastryPlanetDescriptions);
    try {
        const fetchedInterpretation = await getSynastryInterpretation(compositeChartId);
        console.log('fetchedInterpretation Synastry');
        console.log(fetchedInterpretation);
        const validHeadings = Object.values(CompositeChartHeadingEnums);

        // Clear previous interpretation data for all headings
        validHeadings.forEach(heading => {
            setSynastryHeadingInterpretationMap(heading, '');
            setSynastryPromptDescriptionsMap(heading, '');
        });

        for (const heading of validHeadings) {
            const fetchedSubHeadingData = fetchedInterpretation[heading];

            console.log("fetchedSubHeadingData: ", fetchedSubHeadingData);
            if (fetchedSubHeadingData && typeof fetchedSubHeadingData === 'object') {
                setSynastryHeadingInterpretationMap(heading, fetchedSubHeadingData.interpretation || '');
                setSynastryPromptDescriptionsMap(heading, fetchedSubHeadingData.promptDescription || '');
            } else {
                const promptDescription = await postPromptGenerationSynastry(heading, synastryDescriptions);
                console.log("heading: ", heading);
                console.log("promptDescription: ", promptDescription.response);
                setSynastryPromptDescriptionsMap(heading, promptDescription.response);
                setSynastryHeadingInterpretationMap(heading, '');
            }

        }

    } catch (error) {
        console.error('Error fetching synastry interpretation:', error);
    }
  };




  const generateInterpretationComposite = async (heading, promptDescription) => {
        if (planet_headings.includes(heading)) {
            const interpretation = await postGptResponseCompositeChartPlanet(heading, promptDescription)
            console.log("interpretation: ", interpretation)
            setCompositeChartHeadingInterpretationMap(heading, interpretation.response);
        } else {    
            const interpretation = await postGptResponseCompositeChart(heading, promptDescription);
            console.log("interpretation: ", interpretation)
            setCompositeChartHeadingInterpretationMap(heading, interpretation.response);
        }
  }

  const generateSynastryInterpretation = async (heading, promptDescription) => {
    console.log("heading synastry: ", heading)
    console.log("promptDescription synastry: ", promptDescription)
    const interpretation = await postGptResponseSynastry(heading, promptDescription);
    console.log("interpretation: ", interpretation)
    setSynastryHeadingInterpretationMap(heading, interpretation.response);
  }



  const saveCompositeInterpretation = async (heading, promptDescription, interpretation) => {
    const savedInterpretation = await saveCompositeChartInterpretation(compositeChart._id, heading, promptDescription, interpretation);
    console.log("savedCompositeInterpretation: ", savedInterpretation)
  }

  const saveSynastryInterpretation = async (heading, promptDescription, interpretation) => {
    const savedInterpretation = await saveSynastryChartInterpretation(compositeChart._id, heading, promptDescription, interpretation);
    console.log("savedSynastryInterpretation: ", savedInterpretation)
  }

  const generateCompatabilityScore = async () => {
    if (synastryAspects.length > 0 && compositeChart && compositeChartDescription && compositeChartPlanetDescriptions && userA && userB) {
      const compatabilityScore = await getRelationshipScore(synastryAspects, compositeChart.compositeBirthChart.aspects, userA.birthChart, userB.birthChart);
      console.log("compatabilityScore: ", compatabilityScore)
    } else {
      console.log("Not enough data to generate compatability score")
    }
  }
  

return (
    <div>
      <h1>Composite Dashboard</h1>
      <div className="composite-chart">
        {userA && userB && (
          <>
            <h2 className="logotxt">User A: {userA.firstName} {userA.lastName}</h2>
            <h2 className="logotxt">User B: {userB.firstName} {userB.lastName}</h2>
          </>
        )}
        
        {userA && userB && synastryAspects.length > 0 && compositeChart && compositeChartDescription && compositeChartPlanetDescriptions && (
          <SynastryBirthChartComparison 
            birthChartA={userA.birthChart} 
            birthChartB={userB.birthChart} 
            compositeChart={compositeChart.compositeBirthChart} 
            userAName={userA.firstName} 
            userBName={userB.firstName} 
            compositeChartDescription={compositeChartDescription}
            compositeChartPlanetDescriptions={compositeChartPlanetDescriptions}
          />
        )}


        {userA && userB && (
          <SynastryHousePositionsTable 
            birthChartA={userA.birthChart} 
            birthChartB={userB.birthChart} 
            userAName={userA.firstName} 
            userBName={userB.firstName} 
          />
        )}

        {synastryAspects.length > 0 && compositeChart && compositeChartDescription && (
          <SynastryAspectsDescriptionsTable 
            synastryAspects={synastryAspects} 
            birthchartA={userA.birthChart} 
            birthchartB={userB.birthChart} 
            userAName={userA.firstName} 
            userBName={userB.firstName} 
          />
        )}

        {compositeChartDescription && compositeChartPlanetDescriptions && compositeChartDescription.length > 0 && compositeChartPlanetDescriptions.length > 0 && (
          <div>
            <h3>Composite Chart</h3>
            <button onClick={() => {
              generateCompatabilityScore()
            }}>
              Generate Compatability Score
            </button>

            <div className="composite-chart-description">
              <h3>Composite Chart Interpretation</h3>
              <table className="composite-chart-description-table">
                <thead>
                  <tr>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {compositeChartDescription.map((description, index) => (
                    <tr key={index}>
                      <td>{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="composite-chart-planet-descriptions">
                <h3>Composite Chart Planet Descriptions</h3>
                {compositeChartPlanetDescriptions.map((description, index) => (
                  <p key={index}>{description}</p>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="composite-chart-interpretation"> 
          <h3>Composite Chart Interpretation</h3>
          {Object.keys(compositeChartHeadingInterpretationMap).length > 0 && Object.keys(compositeChartPromptDescriptionsMap).length > 0 ? (
            <table className="composite-chart-interpretation-table">
              <thead>
                <tr>
                  <th>Heading</th>
                  <th>Prompt Description</th>
                  <th>Interpretation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(compositeChartPromptDescriptionsMap).map(([heading, promptDescription], index) => (
                  <tr key={index}>
                    <td>{heading}</td>
                    <td>{promptDescription}</td>
                    <td>{compositeChartHeadingInterpretationMap[heading] ? compositeChartHeadingInterpretationMap[heading] : ''}</td>
                    <td>
                      <button 
                        onClick={() => generateInterpretationComposite(heading, promptDescription)}
                        disabled={compositeChartHeadingInterpretationMap[heading]}
                      >
                        {compositeChartHeadingInterpretationMap[heading] ? 'Generated' : 'Generate Interpretation'}
                      </button>
                      <button 
                        onClick={() => saveCompositeInterpretation(heading, promptDescription, compositeChartHeadingInterpretationMap[heading])}
                        disabled={!compositeChartHeadingInterpretationMap[heading]}
                      >
                        Save Interpretation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Loading...</p>
          )}
        </div>



          {synastryAspectDescriptions && synastryPlanetDescriptions && (
            <div className="synastry-chart-interpretation">
              <h3>Synastry Aspect Interpretation</h3>
              {synastryAspectDescriptions.map((description, index) => (
                <p key={index}>{description}</p>
              ))}
            </div>
          )}

          {synastryPlanetDescriptions && (
            <div className="synastry-chart-interpretation">
              <h3>Synastry Planet Descriptions</h3>
              {synastryPlanetDescriptions.map((description, index) => (
                <p key={index}>{description}</p>
              ))}
            </div>
          )}

          <div className="synastry-chart-interpretation"> 
            <h3>Synastry Chart Interpretation</h3>
            {Object.keys(synastryHeadingInterpretationMap).length > 0 && Object.keys(synastryPromptDescriptionsMap).length > 0 ? (
                <table className="synastry-chart-interpretation-table">
                    <thead>
                        <tr>
                            <th>Heading</th>
                            <th>Prompt Description</th>
                            <th>Interpretation</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(synastryPromptDescriptionsMap).map(([heading, promptDescription], index) => (
                            <tr key={index}>
                                <td>{heading}</td>
                                <td>{promptDescription}</td>
                                <td>{synastryHeadingInterpretationMap[heading] ? synastryHeadingInterpretationMap[heading] : ''}</td>
                                <td>
                                    <button 
                                        onClick={() => generateSynastryInterpretation(heading, promptDescription)}
                                        disabled={synastryHeadingInterpretationMap[heading]}
                                    >
                                        {synastryHeadingInterpretationMap[heading] ? 'Generated' : 'Generate Interpretation'}
                                    </button>
                                    <button 
                                        onClick={() => saveSynastryInterpretation(heading, promptDescription, synastryHeadingInterpretationMap[heading])}
                                        disabled={!synastryHeadingInterpretationMap[heading]}
                                    >
                                        Save Interpretation
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Loading...</p>
            )}
        </div>
      </div>
    </div>
  )
}

export default CompositeDashboard;