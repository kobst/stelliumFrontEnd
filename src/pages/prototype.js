import React, { useEffect, useState } from 'react';
import TabbedBigFourMenu from '../UI/birthChart/TabbedBigFourComponent';
import UsersTable from '../UI/prototype/UsersTable';
import Ephemeris from '../UI/shared/Ephemeris';
import useStore from '../Utilities/store';
import { identifyBirthChartPattern } from '../Utilities/generatePatternDescription'
import { DominanceEnum, HeadingEnum, dominance_headings } from '../Utilities/constants';
import { formatTransitDataForUser, findWeeklyTransits, generateTransitString } from '../Utilities/helpers';
import { 
  findAspectsComputed, 
  describePlanets, 
  describeHouses, 
  findPlanetsInQuadrant, 
  findPlanetsInElements, 
  findPlanetsInModalities } from '../Utilities/generateBirthDataDescriptions'
import BirthChartSummary from '../UI/birthChart/BirthChartSummary';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';
import TransitsTable from '../UI/birthChart/tables/TransitsTable';
import HouseTransitsTable from '../UI/birthChart/tables/HouseTransitsTable';
import { postGptResponseForFormattedTransits, handleUserInput, postWeeklyTransitInterpretation } from '../Utilities/api';
import { handleFetchDailyTransits } from '../Utilities/helpers';
function PrototypePage() {
  // const ascendantDegree = useStore(state => state.ascendantDegree)
  const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
  const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)
  const userPlanets = useStore(state => state.userPlanets)
  const userHouses = useStore(state => state.userHouses)
  const userAspects = useStore(state => state.userAspects)  
  const userPeriodTransits = useStore(state => state.userPeriodTransits)
  const userPeriodHouseTransits = useStore(state => state.userPeriodHouseTransits)
  const dailyTransits = useStore(state => state.dailyTransits)
  const setDailyTransits = useStore(state => state.setDailyTransits)
  const selectedUser = useStore(state => state.selectedUser);
  const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)
  const isDataPopulated = userPlanets.length > 1 && userHouses.length > 1
  const isTransitsPopulated = userPeriodTransits.length > 1

  const [formattedTransits, setFormattedTransits] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [transitResponse, setTransitResponse] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [weeklyTransitInterpretations, setWeeklyTransitInterpretations] = useState([]);
  const [dailyTransitInterpretations, setDailyTransitInterpretations] = useState([]);


  useEffect(() => {
    if (isDataPopulated) {
      generateDescriptions();
    }
  }, [userPlanets, userHouses, userAspects]);

  useEffect(() => {
    if (isTransitsPopulated) {
      generateTransitDescriptions();
    }
  }, [userPeriodTransits, userPeriodHouseTransits]);

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


  useEffect(() => {
    if (userPeriodTransits.length > 0) {
      console.log('userPeriodTransits:', userPeriodTransits)
      const weeklyTransits = findWeeklyTransits(userPeriodTransits, userPlanets)
      setWeeklyTransitInterpretations(weeklyTransits)
      console.log('weeklyTransits:', weeklyTransits)
    }
  }, [userPeriodTransits])

  const generateTransitDescriptions = async (event) => {
    console.log('userPeriodTransits before API call:', userPeriodTransits);
    console.log('userPeriodHouseTransits before API call:', userPeriodHouseTransits);
  }


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



  const handleSaveSelected = async (selectedTransits) => {
    console.log('Selected Transits:', selectedTransits);
    const formattedTransits = selectedTransits.map(transit => generateTransitString(transit, userPeriodHouseTransits));
    console.log('Formatted Transits:', formattedTransits);
    setFormattedTransits(formattedTransits);
    const everythingData = promptDescriptionsMap['everything'] 
    console.log(everythingData)
    try {
      const response = await postGptResponseForFormattedTransits(everythingData, formattedTransits)
      console.log(response)
      setTransitResponse(response)
    } catch (error) {
      console.log(error.message);
  }

  };


  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleQuestionSubmit = async(event) => {
    event.preventDefault();
    setSubmittedText(userInput);
    setUserInput('');
    // Here you can add any additional logic to handle the submitted text
    console.log('Submitted text:', userInput);
    console.log('formattedTransits', formattedTransits);
    const response = await handleUserInput(selectedUser._id, userInput)
    console.log("vector response:", response.gptResponse)
    setQueryResponse(response.gptResponse)
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
            <BirthChartSummaryTable planets={userPlanets} houses={userHouses} aspects={userAspects} transits={dailyTransits}/>
          </div>
        ) : (
          <Ephemeris />
        )} 

        {isTransitsPopulated ? (
          <div>
            <TransitsTable transits={userPeriodTransits} onSaveSelected={handleSaveSelected} />
          </div>
        ) : (
          <p>Loading period transits...</p>
        )}
        {Object.keys(userPeriodHouseTransits).length > 0 && (
          <div>
            <HouseTransitsTable houseTransits={userPeriodHouseTransits} userHouses={userHouses}/>
          </div>
        )}

        <div>
          <h2>Transit Interpretations</h2>

        </div>

    <div>
        <h2>Selected Transits</h2>
        {formattedTransits.length > 0 ? (
          formattedTransits.map((transit, index) => (
            <p key={index}>{transit}</p>
          ))
        ) : (
          <p>No transits selected</p>
        )}
      </div>

        <div>
          <h2>Transit Response</h2>
          {transitResponse != '' && (
            <p>{transitResponse}</p>
          )}
      </div>


        <div className="user-input-section" style={{ marginTop: '20px' }}>
          <h2>Ask a Question</h2>
          <form onSubmit={handleQuestionSubmit}>
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type your question here..."
            style={{
              marginTop: '10px',
              backgroundColor: 'lightblue',
              color: 'black',
              padding: '10px',
              borderRadius: '5px',
              width: '300px',
              wordWrap: 'break-word'
            }}
          />
          <button type="submit" style={{ padding: '10px 20px' }}>Submit</button>
        </form>
      </div>

      <div>
        <h2>Query Response</h2>
        {queryResponse != '' && (
          <p>{queryResponse}</p>
        )}
        
      </div>

     
     


        <span>
          <h2>birth chart interpretation</h2>
        </span>
  
        {promptDescriptionsMap.everything && (
          <div>
            {/* <BirthChartSummary summary={promptDescriptionsMap.everything} /> */}
            <TabbedBigFourMenu /> 
          </div>
        )}
      </div>
    </div>
  );
}

export default PrototypePage;