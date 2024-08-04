
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

import Emphemeris from '../UI/shared/Ephemeris';
import { TransitAspects } from '../UI/landingPage/transitAspects';

import transitsData from '../data/transits.json';
import aspectsData from '../data/groupedTransitAspects.json';

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

    async function loadTransits() {
        const totalOffsetHours = await fetchTimeZone(lat, lng, 1719677677);
            console.log(`Time Zone Offset in Hours: ${totalOffsetHours}`);
            // const birthData = {
            //     date: date,
            //     time: time,
            //     lat: lat,
            //     lon: lng,
            //     tzone: totalOffsetHours,
            // };
            // return the transitsData
            // const todaysPositions = await postDailyTransit(birthData);
        return transitsData;
      }

    function getTransitsForDate(transits, targetDate) {
        // Convert targetDate to a Date object if it's a string
        const date = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      
        return transits.filter(transit => {
          const startDate = new Date(transit["date_range"][0]);
          const endDate = new Date(transit["date_range"][1]);
          return date >= startDate && date <= endDate;
        });
    }

    function getTransitsForDateSpan(transits, dateSpan) {
        // Convert dateSpan start and end to Date objects if they are strings
        const dateSpanStart = typeof dateSpan[0] === 'string' ? new Date(dateSpan[0]) : dateSpan[0];
        const dateSpanEnd = typeof dateSpan[1] === 'string' ? new Date(dateSpan[1]) : dateSpan[1];
    
        return transits.filter(transit => {
            const transitStart = new Date(transit["date_range"][0]);
            const transitEnd = new Date(transit["date_range"][1]);
    
            // Check if the date spans overlap
            return (dateSpanStart <= transitEnd) && (dateSpanEnd >= transitStart);
        });
    }



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
            
            const closestDateKey = "2024-07-01T09:00:00Z"; // Use ISO 8601 format
            const laterDateKey = "2025-03-30T09:00:00Z"; // Use ISO 8601 format
    
            await handleFetchDailyTransits(laterDateKey);
            await handleFetchDailyAspects(laterDateKey);
            await handleFetchRetrogrades(laterDateKey)
            // Optionally, fetch period aspects if needed
            // await handleFetchPeriodAspects(closestDateKey, laterDateKey);
    
            // Set today's date (you might want to format it as needed)
            setTodaysDate(laterDateKey);
  
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

            <Emphemeris transits={dailyTransits}/>
            <span>
                <div style={{color:'whitesmoke'}}>
                    <p>{todaysDate}</p>
                </div>
            </span>
            <TransitAspects transits={dailyTransitAspects}/>



            {/* <DailyReading transitAspectObjects={dailyTransitAspects} transits={dailyTransits} /> */}


            <div className="email_form">
                <h2>Hi Stellium, Let me know when you're online</h2>
                <div>
                    <span>I'm </span>
                    <input type="text" id="fname" name="fname" placeholder="Enter your Full Name" />
                    <span>. My Email is </span>
                    <input type="text" id="email" name="email" placeholder="Email Address" />
                    <br />
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} /><br /><br />

                    <label htmlFor="time">Time:</label>
                    <input type="time" id="time" name="time" value={time} onChange={e => setTime(e.target.value)}/><br /><br />

                    <label htmlFor="location">Location:</label>
                    <div>
                        <GoogleAutocomplete
                            inputProps={{
                                name: 'location',
                            }}
                            apiKey={GOOGLE_API}
                            onPlaceSelected={(place) => {
                                var lat = place.geometry.location.lat();
                                var lon = place.geometry.location.lng();
                                console.log(lat + "lat" + lon + "lon")
                                // setLat(lat)
                                // setLon(lon)
                                }}
                            />
            
                        </div>

                    <a href="#" className="email-submit-btn">submit</a>
                </div>
            </div>
        </div>
    );
}

export default LandingPageComponent;
