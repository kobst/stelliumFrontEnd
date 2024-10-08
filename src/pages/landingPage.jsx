import React, { useEffect, useState } from 'react';

import { updateObjectKeys } from '../Utilities/helpers';

import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import useStore from '../Utilities/store';
import DailyReading from '../UI/landingPage/DailyReading'
import { PeriodTransits } from '../UI/landingPage/PeriodTransits';
import Ephemeris from '../UI/shared/Ephemeris';
import { TransitAspects } from '../UI/landingPage/transitAspects';

import UserSignUpForm from '../UI/birthChart/UserSignUpForm';


import { postDailyTransits, postPeriodTransits, postDailyAspects, postPeriodAspects, postDailyRetrogrades } from '../Utilities/api'


const LandingPageComponent = () => {
    const [todaysDate, setTodaysDate] = useState('')

    const [dailyTransitAspects, setDailyTransitAspects] = useState([]);
    const [periodAspects, setPeriodAspects] = useState([]);
    const [periodTransits, setPeriodTransits] = useState([]);

    const [retrogrades, setRetrogrades] = useState([]);

    const [errorState, setError] = useState('');

    const setDailyTransits = useStore(state => state.setDailyTransits)
    const dailyTransits = useStore(state => state.dailyTransits)

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', options);
        const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        return (
          <>
            <div className="timesubtxt">{formattedDate}</div>
            <div className="timesubtxt">{formattedTime}</div>
          </>
        );
      };

 
    const handleFetchDailyTransits = async (date) => {
        try {
          const transitsData = await postDailyTransits(date);
          const cleanedTransits = updateObjectKeys(transitsData);
          setDailyTransits(cleanedTransits);
        console.log("dailyTransits")
        console.log(dailyTransits)

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

      const handleFetchPeriodTransits = async (startDate, endDate) => {
        try {
          const transitsData = await postPeriodTransits(startDate, endDate);
          console.log("transitsData")
          console.log(transitsData)
        //   const planetaryTransits = trackPlanetaryTransits(transitsData);
        //   console.log("planetaryTransits")
        //   console.log(planetaryTransits)
            setPeriodTransits(transitsData);    
        } catch (error) {
          setError(error.message);
        }
      };

    const handleFetchPeriodAspects = async (startDate, endDate) => {
    try {
        const periodAspectsData = await postPeriodAspects(startDate, endDate);
        console.log("periodAspectsData (before filtering)", periodAspectsData);

        const filteredAspects = periodAspectsData.filter(aspect => {
          // Keep all aspects where Moon is not the transiting planet
          if (aspect.transitingPlanet !== "Moon") {
            return true;
          }
          // For Moon transits, only keep Sun oppositions and conjunctions
          return (
            aspect.aspectingPlanet === "Sun" &&
            (aspect.aspectType === "opposition" || aspect.aspectType === "conjunction")
          );
        });

        console.log("Filtered periodAspectsData", filteredAspects);
        setPeriodAspects(filteredAspects);
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
            const currentDateISO = new Date().toISOString();
            const oneMonthLater = new Date();
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
           const oneMonthLaterISO = oneMonthLater.toISOString();
            await handleFetchDailyTransits(currentDateISO);
            await handleFetchDailyAspects(currentDateISO);
            await handleFetchRetrogrades(currentDateISO);
            await handleFetchPeriodAspects(currentDateISO, oneMonthLaterISO);
            await handleFetchPeriodTransits(currentDateISO, oneMonthLaterISO);

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

            <div>
                 <div style={{ marginTop: '40px', marginBottom: '10px', color: 'whitesmoke' }}>
                    {formatDate(todaysDate)}
                </div>
                <Ephemeris transits={dailyTransits}/>

            </div>
                {/* <div style={{color: 'white'}}>
                    <h2>Daily Aspects</h2>
                    <TransitAspects transits={dailyTransitAspects}/>
                </div>
                <div style={{color: 'white'}}>
                    <h2>Monthly Transits</h2>
                    <PeriodTransits periodTransits={periodTransits} />
                </div>
                <div style={{color: 'white'}}>
                    <h2>Monthly Aspects</h2>
                    <TransitAspects transits={periodAspects} isMonthly={true} />
                </div> */}


            <DailyReading transitAspectObjects={dailyTransitAspects} transits={dailyTransits} />


            <div>
                <h2>Cast your Chart, Get Your Free Horoscope</h2>
                <p>Enter your birth information and let Stellium translate the tapestry of the Cosmos into a personalized guide to your life's destiny</p>
            </div>

            <UserSignUpForm />
        </div>
    );
}

export default LandingPageComponent;
