import React, { useState, useEffect } from 'react';
import useStore from '../Utilities/store';
import Ephemeris from '../UI/shared/Ephemeris';
import { heading_map } from '../Utilities/constants';
import { postPromptGPT, postGptResponse } from '../Utilities/api';
import { identifyBirthChartPattern } from '../Utilities/generatePatternDescription'
import BirthChartSummary from '../UI/birthChart/BirthChartSummary';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';
import { 
    describePlanets, 
    describeHouses, 
    findAspectsNonComputed, 
    findPlanetsInQuadrant, 
    findPlanetsInElements, 
    findPlanetsInModalities } from '../Utilities/generateBirthDataDescriptions';


const Confirmation = () => {
    const userId = useStore(state => state.userId);
    const rawBirthData = useStore(state => state.rawBirthData);
    const ascendantDegree = useStore(state => state.ascendantDegree);
    const userPlanets = useStore(state => state.userPlanets)
    const userHouses = useStore(state => state.userHouses)
    const userAspects = useStore(state => state.userAspects) 
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
    const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)

    const [randomBigFourType, setRandomBigFourType] = useState(null);
    const [randomHeading, setRandomHeading] = useState(null);
    const [sampleReading, setSampleReading] = useState(null);
    const [relevanceResponse, setRelevanceResponse] = useState(null);


    const [modifiedUserAspects, setModifiedUserAspects] = useState([]);
    const [isDataComplete, setIsDataComplete] = useState(false);

    useEffect(() => {
        const dataComplete = 
            userPlanets && 
            userHouses && 
            userAspects && 
            Object.keys(userPlanets).length > 0 && 
            Object.keys(userHouses).length > 0 && 
            userAspects.length > 0;

        setIsDataComplete(dataComplete);

        if (dataComplete && userAspects.length > 0) {
            const modifiedAspects = userAspects.map(aspect => ({
                ...aspect,
                aspectType: aspect.type,
                transitingPlanet: aspect.aspecting_planet,
                aspectingPlanet: aspect.aspected_planet,
                type: undefined  // Remove the original 'type' field
            }));
            setModifiedUserAspects(modifiedAspects);
        }
    }, [userPlanets, userHouses, userAspects]);


    async function generateSampleInterpretation(relevanceResponse, heading) {
        const modifiedInput = `${relevanceResponse}: ${heading}`;
        try {
            const responseObject = await postGptResponse(modifiedInput)
            console.log(responseObject)
            setSampleReading(responseObject)
        } catch (error) {
          console.error('Error:', error);
        }
    }

    async function generateRelevanceResponse(everythingData) {
        // Get all keys from heading_map
        const bigFourTypes = Object.keys(heading_map);
        const randomBigFourType = bigFourTypes[Math.floor(Math.random() * bigFourTypes.length)];
        const headingsArray = heading_map[randomBigFourType];
        const randomHeading = headingsArray[Math.floor(Math.random() * headingsArray.length)];
        setRandomBigFourType(randomBigFourType)
        setRandomHeading(randomHeading)
        const modifiedInput = `${everythingData}\n${randomBigFourType.toUpperCase()}: ${randomHeading}`;
        
        try {
            const responseObject = await postPromptGPT(modifiedInput);
            console.log(responseObject);
            setRelevanceResponse(responseObject.response)
            generateSampleInterpretation(responseObject.response, randomHeading)
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const generateSampleReading = (birthData) => {
        console.log('generateSampleReading')
        console.log(birthData)
        try {         
            const response = describePlanets(birthData)
            const houseResponse = describeHouses(birthData)
            const aspects = findAspectsNonComputed(birthData)
            const quadrantResponse = findPlanetsInQuadrant(birthData)
            const elementResponse = findPlanetsInElements(birthData)
            const modalityResponse = findPlanetsInModalities(birthData)
            console.log('quadrantResponse')
            console.log(quadrantResponse)
            console.log('modalityResponse')
            console.log(modalityResponse)
            const patternResponse = identifyBirthChartPattern(birthData)
            console.log('patternResponse')
            console.log(patternResponse)
            const everythingResponse = response.concat(houseResponse, aspects)
            generateRelevanceResponse(everythingResponse)
            setPromptDescriptionsMap('everything', everythingResponse)

           

        } catch (error) {
          console.error('Error submitting form:', error);
        }
    }

    useEffect(() => {
        const isDataComplete = 
            userPlanets && 
            userHouses && 
            userAspects && 
            Object.keys(userPlanets).length > 0 && 
            Object.keys(userHouses).length > 0 && 
            userAspects.length > 0;

        if (isDataComplete) {
            const birthData = { planets: userPlanets, houses: userHouses, aspects: userAspects };
            generateSampleReading(birthData);
        }
    }, [userPlanets, userHouses, userAspects])

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ color: 'white' }}>Thank you for signing up!</h1>
            <p style={{ color: 'white' }}>Your profile has been created successfully.</p>
            {isDataComplete && (
                <BirthChartSummaryTable planets={userPlanets} houses={userHouses} aspects={modifiedUserAspects}/>
            )}
            {promptDescriptionsMap.everything && (
                <div>
                    <BirthChartSummary summary={promptDescriptionsMap.everything} />
                </div>
            )}
            {sampleReading && (
                <div>
                    <h2 style={{color:'white'}}>Sample Reading</h2>
                    <p style={{color:'white'}}>Big Four Type: {randomBigFourType}</p>
                    <p style={{color:'white'}}>Heading: {randomHeading}</p>
                    <p style={{color:'white'}}>Relevance Response: {relevanceResponse}</p>
                    <p style={{color:'white'}}>{sampleReading}</p>
                </div>
            )}
        </div>
    );
};

export default Confirmation;