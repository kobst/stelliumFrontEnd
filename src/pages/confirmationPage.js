import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { heading_map } from '../Utilities/constants';

import useStore from '../Utilities/store';
import Ephemeris from '../UI/shared/Ephemeris';
import {checkResponseAgainstEverything, generateInterpretation} from '../Utilities/checkResponses'
import { postBirthData,postPromptGPT, postGptResponse, createUserProfile, fetchTimeZone, postPromptGeneration} from '../Utilities/api';
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
    const navigate = useNavigate();

    const userId = useStore(state => state.userId);
    const rawBirthData = useStore(state => state.rawBirthData);
    const ascendantDegree = useStore(state => state.ascendantDegree);
    const setRawBirthData = useStore(state => state.setRawBirthData);
    const setUserPlanets = useStore(state => state.setUserPlanets);
    const setUserHouses = useStore(state => state.setUserHouses);
    const setUserAspects = useStore(state => state.setUserAspects);
    const userData = useStore(state => state.userData);
    const userPlanets = useStore(state => state.userPlanets)
    const userHouses = useStore(state => state.userHouses)
    const userAspects = useStore(state => state.userAspects) 
    const setUserId = useStore(state => state.setUserId)
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
    const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);  

    const [randomBigFourType, setRandomBigFourType] = useState(null);
    const [randomHeading, setRandomHeading] = useState(null);
    const [sampleReading, setSampleReading] = useState(null);
    const [relevanceResponse, setRelevanceResponse] = useState(null);


    const [modifiedUserAspects, setModifiedUserAspects] = useState([]);
    const [isDataComplete, setIsDataComplete] = useState(false);

    useEffect(() => {
        const createProfile = async () => {
          try {
            const { firstName, lastName, email, date, time, lat, lon, placeOfBirth } = userData;
    
            const dateTimeString = `${date}T${time}:00`;
            const dateTime = new Date(dateTimeString);
            const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
            const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);
    
            const birthData = {
              date,
              time,
              lat,
              lon,
              tzone: totalOffsetHours,
            };
    
            const response = await postBirthData(birthData);
    
            const userid = await createUserProfile(
              email,
              firstName,
              lastName,
              dateTimeString,
              placeOfBirth,
              time,
              totalOffsetHours,
              response.chartData
            );

            console.log(JSON.stringify(userid) + " userid");
            setRawBirthData(response.chartData);
            setUserPlanets(response.chartData.planets);
            setUserHouses(response.chartData.houses);
            setUserAspects(response.chartData.aspects);
            setUserId(userid);
            setIsLoading(false);
          } catch (error) {
            console.error('Error creating user profile:', error);
            setError('An error occurred while creating your profile. Please try again.');
            setIsLoading(false);
          }
        };
    
        createProfile();
      }, [userData, setUserId]);

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
            // generateBirthChartInterpretation()
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


    // const generateBirthChartInterpretation = async (birthData) => {
    //     // const birthData = { planets: userPlanets, houses: userHouses, aspects: userAspects };
    //     const response = describePlanets(birthData)
    //     const houseResponse = describeHouses(birthData)
    //     const aspects = findAspectsNonComputed(birthData)
    //     // const quadrantResponse = findPlanetsInQuadrant(birthData)
    //     // const elementResponse = findPlanetsInElements(birthData)
    //     // const modalityResponse = findPlanetsInModalities(birthData)
    //     // const patternResponse = identifyBirthChartPattern(birthData)
    //     // const everythingResponse = response.concat(houseResponse, aspects)
    //     const promptMapResponse = await postPromptGeneration(response.chartData)
    //     const promptDescriptionsMap = promptMapResponse.promptDescriptionsMap
    //     setPromptDescriptionsMap('personality', promptDescriptionsMap['personality'])
    //     setPromptDescriptionsMap('home', promptDescriptionsMap['home'])
    //     setPromptDescriptionsMap('relationships', promptDescriptionsMap['relationships'])
    //     setPromptDescriptionsMap('career', promptDescriptionsMap['career'])
    //     setPromptDescriptionsMap('everything', promptDescriptionsMap['everything'])
    //     setPromptDescriptionsMap('unconscious', promptDescriptionsMap['unconscious'])
    //     setPromptDescriptionsMap('communication', promptDescriptionsMap['communication'])
    //     setPromptDescriptionsMap('Quadrants', promptDescriptionsMap['quadrants'])
    //     setPromptDescriptionsMap('Elements', promptDescriptionsMap['elements'])
    //     setPromptDescriptionsMap('Modalities', promptDescriptionsMap['modalities'])
    //     setPromptDescriptionsMap('Pattern', promptDescriptionsMap['pattern'])

    //     console.log(promptDescriptionsMap)
    //     // big fourinterpretations
    //     for (const heading in heading_map) {
    //       const subHeadings = heading_map[heading];
    //       for (const subHeading of subHeadings) {
    //         const promptDescription = promptDescriptionsMap[heading];
    //         // console.log(promptDescription)
    //         const interpretation = await generateInterpretation(subHeading, promptDescription);
    //         console.log(interpretation)
    //         // setHeadingInterpretationMap(subHeading, interpretation)
    //       }
    //     }

    //     // quadrant interpretations
    //     const quadrantInterpretation = await generateInterpretation("Quadrants", promptDescriptionsMap['quadrants'])
    //     const elementInterpretation = await generateInterpretation("Elements", promptDescriptionsMap['elements'])
    //     const modalityInterpretation = await generateInterpretation("Modalities", promptDescriptionsMap['modalities'])
    //     const patternInterpretation = await generateInterpretation("Pattern", promptDescriptionsMap['pattern'])
    //     // setHeadingInterpretationMap('Quadrants', quadrantInterpretation)
    //     // setHeadingInterpretationMap('Elements', elementInterpretation)
    //     // setHeadingInterpretationMap('Modalities', modalityInterpretation)
    //     // setHeadingInterpretationMap('Pattern', patternInterpretation)


    //     // planet interpretations
    //     for ( const planet in userPlanets) {
    //       const planetDescription = describePlanets(birthData, planet)
    //       const houseDescription = describeHouses(birthData, planet)
    //       // const aspectDescription = findAspectsComputed(birthData, planet)

    //       const combinedDescriptions = [
    //           ...(Array.isArray(planetDescription) ? planetDescription : [planetDescription]),
    //           ...houseDescription,
    //           ...aspectDescription
    //       ];

    //       const inputData = {
    //         heading: planet.toUpperCase(),
    //         description: combinedDescriptions.join('\n')
    //       };

    //       // const planetInterpretation = await postGptResponsePlanets(inputData)
    //       // setHeadingInterpretationMap(planet, planetInterpretation)

    //     }

    //   }




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







    if (isLoading) {
        return (
          <div className="confirmation-page">
            <h1>Creating Your Profile</h1>
            {/* <LoadingSpinner /> */}
            <p>Please wait while we create your profile...</p>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="confirmation-page">
            <h1>Error</h1>
            <p>{error}</p>
            <button onClick={() => navigate('/')}>Go Back</button>
          </div>
        );
      }

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