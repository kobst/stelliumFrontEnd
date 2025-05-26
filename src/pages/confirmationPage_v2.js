import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../Utilities/store';
import { fetchTimeZone, getShortOverview, postUserProfile, postUserProfileUnknownTime, getPlanetOverview} from '../Utilities/api';
import BirthChartSummary from '../UI/birthChart/BirthChartSummary';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';

const ConfirmationV2 = () => {
    const navigate = useNavigate();

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
    
    // Move the ref outside the useEffect
    const profileCreationAttempted = useRef(false);

    const [randomBigFourType, setRandomBigFourType] = useState(null);
    const [randomHeading, setRandomHeading] = useState(null);
    const [sampleReading, setSampleReading] = useState(null);
    const [relevanceResponse, setRelevanceResponse] = useState(null);
    const [sunOverview, setSunOverview] = useState(null);
    const [moonOverview, setMoonOverview] = useState(null);
    const [mercuryOverview, setMercuryOverview] = useState(null);
    const [venusOverview, setVenusOverview] = useState(null);
    const [marsOverview, setMarsOverview] = useState(null);
    const [jupiterOverview, setJupiterOverview] = useState(null);
    const [saturnOverview, setSaturnOverview] = useState(null);
    const [uranusOverview, setUranusOverview] = useState(null);
    const [neptuneOverview, setNeptuneOverview] = useState(null);

    const [modifiedUserAspects, setModifiedUserAspects] = useState([]);
    const [isDataComplete, setIsDataComplete] = useState(false);

    useEffect(() => {
        const createProfile = async () => {
            // Skip if we've already attempted to create the profile or if userData is missing
            if (profileCreationAttempted.current || !userData) {
                return;
            }
            
            // Mark that we've attempted profile creation
            profileCreationAttempted.current = true;
            
            try {
                const { firstName, lastName, email, date, time, lat, lon, placeOfBirth, gender, unknownTime } = userData;
                
                // Check if all required data is present
                if (!firstName || !lastName || !email || !date || (!unknownTime && !time) || !lat || !lon || !placeOfBirth) {
                    console.warn('Missing required user data for profile creation');
                    setIsLoading(false);
                    return;
                }

                if (unknownTime) {
                    const birthData = {
                        firstName,
                        lastName,
                        gender,
                        placeOfBirth,
                        date,
                        email,
                        lat,
                        lon,
                        unknownTime: true,
                    };
                    const response = await postUserProfileUnknownTime(birthData);
                    console.log('Unknown time response: ', JSON.stringify(response));
                    setIsLoading(false);
                    return;
                }

                const dateTimeString = `${date}T${time}:00`;
                const dateTime = new Date(dateTimeString);
                const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
                const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

                const birthData = {
                    firstName,
                    lastName,
                    gender,
                    placeOfBirth,
                    dateOfBirth: dateTimeString,
                    email,
                    date,
                    time,
                    lat,
                    lon,
                    tzone: totalOffsetHours,
                };

                const response = await postUserProfile(birthData);

                console.log("response: ", JSON.stringify(response))
                
                setUserPlanets(response.user.birthChart.planets);
                setUserHouses(response.user.birthChart.houses);
                setUserAspects(response.user.birthChart.aspects);
                setUserId(response.user._id);
                setIsLoading(false);
            } catch (error) {
                console.error('Error creating user profile:', error);
                setError('An error occurred while creating your profile. Please try again.');
                setIsLoading(false);
            }
        };
        
        createProfile();
    }, []); // Empty dependency array to run only once on mount

    useEffect(() => {
        const dataComplete = 
            userPlanets && 
            userHouses && 
            userAspects && 
            Object.keys(userPlanets).length > 0 && 
            Object.keys(userHouses).length > 0 && 
            userAspects.length > 0;

        setIsDataComplete(dataComplete);
    }, [userPlanets, userHouses, userAspects]);


    async function generateShortOverview(birthData) {
        console.log("birthData: ", birthData)
        try {
            const responseObject = await getShortOverview(birthData)
            console.log("Response object:", responseObject)
            // Check if responseObject is an object with a response property
            if (responseObject && typeof responseObject === 'object' && responseObject.response) {
                setSampleReading(responseObject.response) // Set just the response string
            } else {
                setSampleReading(String(responseObject)) // Convert to string as fallback
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function generateAllPlanetOverviews(birthData) {
        for (const planet in userPlanets) {
            generatePlanetOverview(planet.name, birthData)
        }
    }


    // Generate planet overview
    async function generatePlanetOverview(planetName, birthData) {
        console.log("planet: ", planetName)
        try {
            const response = await getPlanetOverview(planetName, birthData)
            console.log("response", response)
            if (response && typeof response === 'object' && response.response) {
                if (planetName === "Sun") {
                    setSunOverview(response)
                }
                if (planetName === "Moon") {
                    setMoonOverview(response)
                }
                if (planetName === "Mercury") {
                    setMercuryOverview(response)
                }
                if (planetName === "Venus") {
                    setVenusOverview(response)
                }
                if (planetName === "Mars") {
                    setMarsOverview(response)
                }
                if (planetName === "Jupiter") {
                    setJupiterOverview(response)
                }
                if (planetName === "Saturn") {
                    setSaturnOverview(response)
                }
                if (planetName === "Uranus") {
                    setUranusOverview(response)
                }
                if (planetName === "Neptune") {
                    setNeptuneOverview(response)
                }
            } else {
                return String(response)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // useEffect(() => {
    //     const isDataComplete = 
    //         userPlanets && 
    //         userHouses && 
    //         userAspects && 
    //         Object.keys(userPlanets).length > 0 && 
    //         Object.keys(userHouses).length > 0 && 
    //         userAspects.length > 0;

    //     if (isDataComplete) {
    //         const birthData = { planets: userPlanets, houses: userHouses, aspects: userAspects };
    //         generateShortOverview(birthData);
    //         for (const planet in userPlanets) {
    //             generatePlanetOverview(planet.name, birthData)
    //         }
    //     }
    // }, [userPlanets, userHouses, userAspects])






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
                <BirthChartSummaryTable planets={userPlanets} houses={userHouses} aspects={userAspects}/>
            )}
            {promptDescriptionsMap.everything && (
                <div>
                    <BirthChartSummary summary={promptDescriptionsMap.everything} />
                </div>
            )}
            <button onClick={() => navigate('/')}>Go Back</button>
            <button onClick={() => generateShortOverview({ planets: userPlanets, houses: userHouses, aspects: userAspects })}>
                Generate Short Overview
            </button>
            <button onClick={() => generateAllPlanetOverviews({ planets: userPlanets, houses: userHouses, aspects: userAspects })}>
                Generate Planets Overview
            </button>
            {sampleReading && (
                <div>
                    <h2 style={{color:'white'}}>Short Romantic Overview</h2>
                    <p style={{color:'white'}}>{sampleReading}</p>
                </div>
            )}
        </div>
    );
};

export default ConfirmationV2;