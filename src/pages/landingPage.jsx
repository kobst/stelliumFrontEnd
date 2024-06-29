
import React, { useEffect, useState } from 'react';
// import './landingPage.css'
// import SimpleForm from '../UI/SimpleForm';

import GoogleAutocomplete from 'react-google-autocomplete'; // Make sure to import GoogleAutocomplete
import { fetchTimeZone,postDailyTransit } from '../Utilities/api'; 

import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import useStore from '../Utilities/store';
import Emphemeris from '../UI/Ephemeris';


const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY


const LandingPageComponent = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [lat, setLat] = useState(38.8995914);
    const [lng, setLng] = useState(-77.0679584);

    const setDailyTransits = useStore(state => state.setDailyTransits)
    const dailyTransits = useStore(state => state.dailyTransits)

    useEffect( () => {
        async function getTodaysData() {
             const totalOffsetHours = await fetchTimeZone(lat, lng, 1719677677);
            console.log(`Time Zone Offset in Hours: ${totalOffsetHours}`);
            const birthData = {
                date: date,
                time: time,
                lat: lat,
                lon: lng,
                tzone: totalOffsetHours,
            };
            const todaysPositions = await postDailyTransit(birthData);
            console.log(todaysPositions.chartData)
            setDailyTransits(todaysPositions.chartData)
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
