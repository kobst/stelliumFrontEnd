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
import { findAspectsComputed, describePlanets, describeHouses } from '../Utilities/generateBirthDataDescriptions'

function PrototypePage() {
  const rawBirthData = useStore(state => state.rawBirthData)
  const ascendantDegree = useStore(state => state.ascendantDegree)
  // const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
  const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
  // const setRawBirthData = useStore(state => state.setRawBirthData)

  const userPlanets = useStore(state => state.userPlanets)
  const userHouses = useStore(state => state.userHouses)
  const userAspects = useStore(state => state.userAspects)  
  const selectedUser = useStore(state => state.selectedUser);



  const isDataPopulated = userPlanets.length > 1 && userHouses.length > 1 && ascendantDegree

  const generatePrompts = async (event) => { 
    console.log('userPlanets before API call:', userPlanets);
    try {
     
        const birthData = { planets: userPlanets, houses: userHouses, aspectsComputed: userAspects };

        const response = describePlanets(birthData)
        const houseResponse = describeHouses(birthData)
        const aspects = findAspectsComputed(birthData)

        console.log(response)
        console.log(aspects)
        console.log(houseResponse)





    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };






  return (
    <div>
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
          <Ephemeris planets={userPlanets} houses={userHouses} transits={[]} ascendantDegree={ascendantDegree} />
        ) : (
          <Ephemeris />
        )} 


        <button 
          onClick={generatePrompts}
          disabled={!isDataPopulated}
          className="generate-prompts-btn"
        >
          Generate Prompts
        </button>

        {/* <RawBirthDataComponent /> */}
        <TabbedBigFourMenu /> 
      </div>
    </div>
  );
}

export default PrototypePage;