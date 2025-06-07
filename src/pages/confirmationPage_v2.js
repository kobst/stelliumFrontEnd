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

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);  
    
    // Move the ref outside the useEffect
    const profileCreationAttempted = useRef(false);
    const [sampleReading, setSampleReading] = useState(null);
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
                    // Calculate epoch time for timezone lookup (using noon for unknown time)
                    const dateTimeString = `${date}T12:00:00`;
                    const dateTime = new Date(dateTimeString);
                    const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
                    const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

                    const birthData = {
                        firstName,
                        lastName,
                        gender,
                        placeOfBirth,
                        dateOfBirth: date,
                        email,
                        lat: parseFloat(lat),
                        lon: parseFloat(lon),
                        tzone: parseFloat(totalOffsetHours)
                    };
                    
                    const response = await postUserProfileUnknownTime(birthData);
                    console.log('Unknown time response: ', JSON.stringify(response));
                    
                    // Update store with user data for unknown time
                    if (response?.user) {
                        setUserPlanets(response.user.birthChart?.planets || []);
                        setUserHouses(response.user.birthChart?.houses || []); // Will be empty for unknown time
                        setUserAspects(response.user.birthChart?.aspects || []);
                        setUserId(response.user._id || response.saveUserResponse?.insertedId);
                    }
                    
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
            <h1 style={{ color: 'white' }}>Welcome to Stellium {userData.firstName}! Thank you for signing up!</h1>
            <p style={{ color: 'white' }}>Your profile has been created successfully.</p>
            {isDataComplete && (
                <BirthChartSummaryTable planets={userPlanets} houses={userHouses} aspects={userAspects}/>
            )}
            <button onClick={() => navigate('/')}>Go Back</button>
            <button onClick={() => generateShortOverview({ planets: userPlanets, houses: userHouses, aspects: userAspects })}>
                Generate Short Overview
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