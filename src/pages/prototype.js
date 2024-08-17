import React from 'react';
import SimpleForm from '../UI/birthChart/SimpleForm';
import UserSignUpForm from '../UI/birthChart/UserSignUpForm';
import RawBirthDataComponent from '../UI/birthChart/RawBirthDataComponent';
import TabbedBigFourMenu from '../UI/birthChart/TabbedBigFourComponent';
import UsersTable from '../UI/prototype/UsersTable';
import Ephemeris from '../UI/shared/Ephemeris';
import useStore from '../Utilities/store';
import { postPromptGeneration } from '../Utilities/api';
import { generateResponse } from '../Utilities/generatePrompts'
import { findAspectsComputed, describePlanets, describeHouses, findPlanetsInQuadrant, findPlanetsInElements, findPlanetsInModalities } from '../Utilities/generateBirthDataDescriptions'
import BirthChartSummary from '../UI/birthChart/BirthChartSummary';

function PrototypePage() {
  const rawBirthData = useStore(state => state.rawBirthData)
  const ascendantDegree = useStore(state => state.ascendantDegree)
  const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
  const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
  // const setRawBirthData = useStore(state => state.setRawBirthData)

  const userPlanets = useStore(state => state.userPlanets)
  const userHouses = useStore(state => state.userHouses)
  const userAspects = useStore(state => state.userAspects)  
  const selectedUser = useStore(state => state.selectedUser);



  const isDataPopulated = userPlanets.length > 1 && userHouses.length > 1 && ascendantDegree

  const generateDescriptions = async (event) => { 
    console.log('userPlanets before API call:', userPlanets);
    try {
     
        const birthData = { planets: userPlanets, houses: userHouses, aspectsComputed: userAspects };

        const response = describePlanets(birthData)
        const houseResponse = describeHouses(birthData)
        const aspects = findAspectsComputed(birthData)
        const quadrantResponse = findPlanetsInQuadrant(birthData)
        const elementResponse = findPlanetsInElements(birthData)
        const modalityResponse = findPlanetsInModalities(birthData)

        const everythingResponse = response.concat(houseResponse, aspects)
        console.log(everythingResponse)
        console.log(quadrantResponse)
        console.log(elementResponse)
        console.log(modalityResponse) 

        setPromptDescriptionsMap('everything', everythingResponse)
        setPromptDescriptionsMap('Elements', elementResponse)
        setPromptDescriptionsMap('Modalities', modalityResponse)
        setPromptDescriptionsMap('Quadrants', quadrantResponse)


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
          <div className="user-info">
            <h2>Selected User: {selectedUser.name}</h2>
          </div>
        )}
  
        {isDataPopulated ? (
          <div>
            <Ephemeris planets={userPlanets} houses={userHouses} transits={[]} ascendantDegree={ascendantDegree} />
            <button 
              onClick={generateDescriptions}
              disabled={!isDataPopulated}
              className="generate-prompts-btn"
            >
              Generate Birth Chart Descriptions
            </button>
          </div>
        ) : (
          <Ephemeris />
        )} 
  
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