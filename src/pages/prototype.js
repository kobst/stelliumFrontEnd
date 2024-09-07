import React, { useEffect } from 'react';
import TabbedBigFourMenu from '../UI/birthChart/TabbedBigFourComponent';
import UsersTable from '../UI/prototype/UsersTable';
import Ephemeris from '../UI/shared/Ephemeris';
import useStore from '../Utilities/store';
import { identifyBirthChartPattern } from '../Utilities/generatePatternDescription'
import { DominanceEnum, HeadingEnum, dominance_headings } from '../Utilities/constants';
import { 
  findAspectsComputed, 
  describePlanets, 
  describeHouses, 
  findPlanetsInQuadrant, 
  findPlanetsInElements, 
  findPlanetsInModalities } from '../Utilities/generateBirthDataDescriptions'
import BirthChartSummary from '../UI/birthChart/BirthChartSummary';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';
import HousePositionTable from '../UI/birthChart/tables/HousePositionTable';

function PrototypePage() {
  // const ascendantDegree = useStore(state => state.ascendantDegree)
  const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
  const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
  const userPlanets = useStore(state => state.userPlanets)
  const userHouses = useStore(state => state.userHouses)
  const userAspects = useStore(state => state.userAspects)  
  const selectedUser = useStore(state => state.selectedUser);
  const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
  const isDataPopulated = userPlanets.length > 1 && userHouses.length > 1

  useEffect(() => {
    if (isDataPopulated) {
      generateDescriptions();
    }
  }, [userPlanets, userHouses, userAspects]);


  const generateDescriptions = async (event) => { 
    console.log('userPlanets before API call:', userPlanets);
    try {
     
        const birthData = { planets: userPlanets, houses: userHouses, aspectsComputed: userAspects };
        console.log('birthData')
        console.log(birthData)
        const response = describePlanets(birthData)
        const houseResponse = describeHouses(birthData)
        const aspects = findAspectsComputed(birthData)
        const quadrantResponse = findPlanetsInQuadrant(birthData)
        const elementResponse = findPlanetsInElements(birthData)
        const modalityResponse = findPlanetsInModalities(birthData)
    
        const patternResponse = identifyBirthChartPattern(birthData)
  

        const everythingResponse = response.concat(houseResponse, aspects)

        setPromptDescriptionsMap('everything', everythingResponse)
        setPromptDescriptionsMap(HeadingEnum.ELEMENTS, elementResponse)
        setPromptDescriptionsMap(HeadingEnum.MODALITIES, modalityResponse)
        setPromptDescriptionsMap(HeadingEnum.QUADRANTS, quadrantResponse)
        setPromptDescriptionsMap(HeadingEnum.PATTERN, patternResponse)
        setSubHeadingsPromptDescriptionsMap('everything', everythingResponse)
        setSubHeadingsPromptDescriptionsMap(HeadingEnum.ELEMENTS, elementResponse)
        setSubHeadingsPromptDescriptionsMap(HeadingEnum.MODALITIES, modalityResponse)
        setSubHeadingsPromptDescriptionsMap(HeadingEnum.QUADRANTS, quadrantResponse)
        setSubHeadingsPromptDescriptionsMap(HeadingEnum.PATTERN, patternResponse)


    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };




  return (
    <div className="prototype-page" style={{ marginBottom: '50px' }}>
      <div className="maintxt mont-font">
        <h1 className="logotxt">STELLIUM</h1>
      </div>
  
      <UsersTable />
  
      <div className="horoscope-container">
        {selectedUser && (
          <div className="user-info" style={{ color: 'white' }}>
            <h2>Selected User: {selectedUser.firstName} {selectedUser.lastName}</h2>
          </div>
        )}
  
        {isDataPopulated ? (
          <div>
            {/* <Ephemeris planets={userPlanets} houses={userHouses} transits={[]} ascendantDegree={ascendantDegree} /> */}
            <BirthChartSummaryTable planets={userPlanets} houses={userHouses} aspects={userAspects}/>
          </div>
        ) : (
          <Ephemeris />
        )} 


        <span>
          <h2>birth chart interpretation</h2>
        </span>
  
        {promptDescriptionsMap.everything && (
          <div>
            <BirthChartSummary summary={promptDescriptionsMap.everything} />
            <TabbedBigFourMenu /> 
          </div>
        )}
      </div>
    </div>
  );
}

export default PrototypePage;