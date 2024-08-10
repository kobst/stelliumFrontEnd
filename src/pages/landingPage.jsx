
import React, { useEffect, useState } from 'react';
// import './landingPage.css'
// import SimpleForm from '../UI/SimpleForm';

import GoogleAutocomplete from 'react-google-autocomplete'; // Make sure to import GoogleAutocomplete
import { fetchTimeZone, postDailyTransit } from '../Utilities/api'; 
import { updateObjectKeys } from '../Utilities/helpers';

import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import useStore from '../Utilities/store';
import DailyReading from '../UI/landingPage/DailyReading'

import Ephemeris from '../UI/shared/Ephemeris';
import { TransitAspects } from '../UI/landingPage/transitAspects';

import transitsData from '../data/transits.json';
import aspectsData from '../data/groupedTransitAspects.json';

import UserSignUpForm from '../UI/birthChart/UserSignUpForm';


import { postDailyTransits, postDailyAspects, postPeriodAspects, postDailyRetrogrades } from '../Utilities/api'

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY


const LandingPageComponent = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [lat, setLat] = useState(38.8995914);
    const [lng, setLng] = useState(-77.0679584);
    const [todaysDate, setTodaysDate] = useState('')

    const [dailyTransitAspects, setDailyTransitAspects] = useState([]);
    const [periodTransitAspects, setPeriodTransitAspects] = useState([]);
    const [retrogrades, setRetrogrades] = useState([]);

    const [errorState, setError] = useState('');


    const setDailyTransits = useStore(state => state.setDailyTransits)
    const dailyTransits = useStore(state => state.dailyTransits)
    // const setDailyTransitAspects = useStore(state => state.setDailyTransits)
    // const dailyTransitAspects = useStore(state => state.dailyTransits)

 
    const handleFetchDailyTransits = async (date) => {
        try {
          const transitsData = await postDailyTransits(date);
          const cleanedTransits = updateObjectKeys(transitsData);
          setDailyTransits(cleanedTransits);
        } catch (error) {
          setError(error.message);
        }
      };
    
    const handleFetchDailyAspects = async (date) => {
    try {
        const aspectsData = await postDailyAspects(date);
        console.log("aspectsData", aspectsData);

        setDailyTransitAspects(aspectsData);
    } catch (error) {
        setError(error.message);
    }
    };

    const handleFetchPeriodAspects = async (startDate, endDate) => {
    try {
        const periodAspectsData = await postPeriodAspects(startDate, endDate);
        setPeriodTransitAspects(periodAspectsData);
    } catch (error) {
        setError(error.message);
    }
    };
    

    const handleFetchRetrogrades = async (startDate) => {
        try {
            const retrogrades = await postDailyRetrogrades(startDate);
            setRetrogrades(retrogrades);
            console.log("retrogrades ----")
            console.log(retrogrades)
        } catch (error) {
            setError(error.message);
        }
        };

    useEffect(() => {
        async function getTodaysData() {
          try {
            
            // const closestDateKey = "2024-07-01T09:00:00Z"; // Use ISO 8601 format
            // const laterDateKey = "2025-03-30T09:00:00Z"; // Use ISO 8601 format
    
            const currentDateISO = new Date().toISOString();
            const oneMonthLater = new Date();
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
           const oneMonthLaterISO = oneMonthLater.toISOString();
            await handleFetchDailyTransits(currentDateISO);
            await handleFetchDailyAspects(currentDateISO);
            await handleFetchRetrogrades(currentDateISO)
            await handleFetchPeriodAspects(currentDateISO, oneMonthLaterISO);
            // Optionally, fetch period aspects if needed
            // await handleFetchPeriodAspects(closestDateKey, laterDateKey);
    
            // Set today's date (you might want to format it as needed)
            setTodaysDate(currentDateISO);
  
          } catch (error) {
            setError(error.message);
          }
        }
    
        getTodaysData();
      }, []);
      
    return (
        <div className="container">

            {/* Main Text */}
            <img className="lightlogo" src={lightLogo} alt="Stellium logo" />
            <div className="maintxt mont-font">
                <h1 className="logotxt">STELLIUM</h1>
                <h3 className="logosubtxt">ancient wisdom of the stars, the technology of the future</h3>
                <h2 className="soon">coming soon</h2>
            </div>
            <img src={whiteLine} alt="" />

            {/* Form */}

            <Ephemeris transits={dailyTransits}/>
            <span>
                <div style={{color:'whitesmoke'}}>
                    <p>{todaysDate}</p>
                </div>
            </span>
            <div>
                <h2>Daily Transits</h2>
                <TransitAspects transits={dailyTransitAspects}/>
            </div>
    
            <div>
                <h2>Monthly Transits</h2>
                <TransitAspects transits={periodTransitAspects} isMonthly={true} />
            </div>

            <DailyReading transitAspectObjects={dailyTransitAspects} transits={dailyTransits} />


            <UserSignUpForm />
        </div>
    );
}

export default LandingPageComponent;








   // async function loadTransits() {
    //     const totalOffsetHours = await fetchTimeZone(lat, lng, 1719677677);
    //         console.log(`Time Zone Offset in Hours: ${totalOffsetHours}`);
    //         // const birthData = {
    //         //     date: date,
    //         //     time: time,
    //         //     lat: lat,
    //         //     lon: lng,
    //         //     tzone: totalOffsetHours,
    //         // };
    //         // return the transitsData
    //         // const todaysPositions = await postDailyTransit(birthData);
    //     return transitsData;
    //   }

    // function getTransitsForDate(transits, targetDate) {
    //     // Convert targetDate to a Date object if it's a string
    //     const date = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      
    //     return transits.filter(transit => {
    //       const startDate = new Date(transit["date_range"][0]);
    //       const endDate = new Date(transit["date_range"][1]);
    //       return date >= startDate && date <= endDate;
    //     });
    // }

    // function getTransitsForDateSpan(transits, dateSpan) {
    //     // Convert dateSpan start and end to Date objects if they are strings
    //     const dateSpanStart = typeof dateSpan[0] === 'string' ? new Date(dateSpan[0]) : dateSpan[0];
    //     const dateSpanEnd = typeof dateSpan[1] === 'string' ? new Date(dateSpan[1]) : dateSpan[1];
    
    //     return transits.filter(transit => {
    //         const transitStart = new Date(transit["date_range"][0]);
    //         const transitEnd = new Date(transit["date_range"][1]);
    
    //         // Check if the date spans overlap
    //         return (dateSpanStart <= transitEnd) && (dateSpanEnd >= transitStart);
    //     });
    // }


