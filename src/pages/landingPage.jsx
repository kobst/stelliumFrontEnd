
import React, { useEffect, useState } from 'react';
// import './landingPage.css'
// import SimpleForm from '../UI/SimpleForm';

import GoogleAutocomplete from 'react-google-autocomplete'; // Make sure to import GoogleAutocomplete
import { fetchTimeZone,postDailyTransit } from '../Utilities/api'; 

import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import useStore from '../Utilities/store';
import Emphemeris from '../UI/shared/Ephemeris';
import { TransitAspects } from '../UI/landingPage/transitAspects';

import transitsData from '../data/transits_underscore.json';
import aspectsData from '../data/groupedTransitAspects.json';




const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY


const LandingPageComponent = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [lat, setLat] = useState(38.8995914);
    const [lng, setLng] = useState(-77.0679584);
    const [todaysDate, setTodaysDate] = useState('')

    const [dailyTransitAspects, setDailyTransitAspects] = useState([]);

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
    

    useEffect( () => {
        async function getTodaysData() {
             
            // console.log(todaysPositions.chartData)
            // setDailyTransits(todaysPositions.chartData)
            const closestDateKey = "2024-07-13 09:00:00"
            const laterDateKey = "2024-08-13 09:00:00"
            const transits = await loadTransits();

            const targetDate = new Date(closestDateKey);
            const targetDateLater = new Date(laterDateKey);
            const relevantTransitAspects = getTransitsForDate(aspectsData, targetDate);
            // const relevantTransitAspects = getTransitsForDateSpan(aspectsData, [targetDate, targetDateLater]);

            // Find the closest date key
            // const targetDate = new Date();
            // const closestDateKey = findClosestDateKey(transits, targetDate);

            // Access the corresponding array of transits
            const todaysTransits = transits[closestDateKey];
            console.log(todaysTransits);
            console.log(relevantTransitAspects);
            setTodaysDate(closestDateKey)
            setDailyTransitAspects(relevantTransitAspects)
            setDailyTransits(todaysTransits);
        }

        getTodaysData()

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
