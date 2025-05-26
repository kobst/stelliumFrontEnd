import React, { useEffect, useState } from 'react';

import { updateObjectKeys } from '../../Utilities/generateUserTranstiDescriptions';

import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import useStore from '../../Utilities/store';
// import DailyReading from '../../UI/landingPage/DailyReading'
// import DailyReadingFromDb from '../../UI/landingPage/DailyReadingFromDb';
// import DailySignHoroscopeMenu from '../../UI/landingPage/DailySignHoroscopeMenu';
// import { PeriodTransits } from '../../UI/landingPage/PeriodTransits';
import Ephemeris from '../../UI/shared/Ephemeris';
// import { TransitAspects } from '../../UI/landingPage/transitAspects';
import TodaysAspectsTable from '../../UI/landingPage/archived/TodaysAspectsTable';
import UserSignUpForm from '../../UI/landingPage/UserSignUpForm';
import { formatTransitDataForTable, 
  // handleFetchDailyAspects, 
  handleFetchDailyTransits,
  handleFetchPeriodAspects,
  handleFetchRetrogrades,
  handleFetchInstantAspects,
  handleFetchPeriodTransits  } from '../../Utilities/generateUserTranstiDescriptions';



import { postDailyTransits, postPeriodTransits, postDailyAspects, postPeriodAspects, postDailyRetrogrades } from '../../Utilities/api'


const LandingPageComponent = () => {
    const [todaysDate, setTodaysDate] = useState('')

    const [dailyTransitAspects, setDailyTransitAspects] = useState([]);
    const [periodAspects, setPeriodAspects] = useState([]);
    const [periodTransits, setPeriodTransits] = useState([]);
    const [dailyTransitDescriptionsForTable, setDailyTransitDescriptionsForTable] = useState([]);
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

    useEffect(() => {
        async function getTodaysData() {
          try {
            const currentDateISO = new Date().toISOString();
            const oneMonthLater = new Date();
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
            const oneMonthLaterISO = oneMonthLater.toISOString();
            const cleanedTransits = await handleFetchDailyTransits(currentDateISO);
            const dailyAspects = await handleFetchInstantAspects(currentDateISO);
            const retrogrades = await handleFetchRetrogrades(currentDateISO);
            const periodAspects = await handleFetchPeriodAspects(currentDateISO, oneMonthLaterISO);
            const periodTransits = await handleFetchPeriodTransits(currentDateISO, oneMonthLaterISO);

            setTodaysDate(currentDateISO);
            setDailyTransits(cleanedTransits);
            setDailyTransitAspects(dailyAspects);
            setRetrogrades(retrogrades);
            setPeriodTransits(periodTransits);
            setPeriodAspects(periodAspects);
            console.log("periodAspects")
            console.log(periodAspects)    
            console.log("dailyAspects")
            console.log(dailyAspects)
            console.log("retrogrades")
            console.log(retrogrades)
            console.log("periodTransits")
            console.log(periodTransits)
            console.log("cleanedTransits")
            console.log(cleanedTransits)



            const descriptionsForTable = dailyAspects.map(aspect => 
              formatTransitDataForTable(aspect, cleanedTransits)
            );
            
            console.log("descriptionsForTable")
            console.log(descriptionsForTable) 
            setDailyTransitDescriptionsForTable(descriptionsForTable);
  
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

   
            <div>
                 <div style={{ marginTop: '40px', marginBottom: '10px', color: 'whitesmoke' }}>
                    {todaysDate && formatDate(todaysDate)}
                </div>
                {
                    dailyTransitDescriptionsForTable.length > 0 && dailyTransits.length > 0 && (
                      <div>
                        <Ephemeris planets={dailyTransits} houses={[]} aspects={dailyTransitDescriptionsForTable} transits={[]} />
                        <TodaysAspectsTable aspectsArray={dailyTransitDescriptionsForTable} />
                      </div>
                    )
                }
            </div>    

            {/* <div>
              <DailyReadingFromDb transitAspectObjects={dailyTransitAspects} transits={dailyTransits} risingSign={null} />
            </div> */}

                {/* <div>
                <div className="daily-reading-container">
                  <h2>Aspect of the day</h2>
                  <DailyReading transitAspectObjects={dailyTransitAspects} transits={dailyTransits} risingSign={null} />
                </div>
                </div>
                <div style={{color: 'white'}}>
                    <h2>Daily Aspects</h2>
                    <TransitAspects transits={dailyTransitAspects}/>
                </div> */}
                {/* <div style={{color: 'white'}}>
                    <h2>Monthly Transits</h2>
                    <PeriodTransits periodTransits={periodTransits} />
                </div>
                <div style={{color: 'white'}}>
                    <h2>Monthly Aspects</h2>
                    <TransitAspects transits={periodAspects} isMonthly={true} />
                </div> */}

            {/* <DailySignHoroscopeMenu transitAspectObjects={dailyTransitAspects} transits={dailyTransits} /> */}

            {/* <DailyReading transitAspectObjects={dailyTransitAspects} transits={dailyTransits} /> */}


            <div>
                <h2>Cast your Chart, Get Your Free Horoscope</h2>
                <p>Enter your birth information and let Stellium translate the tapestry of the Cosmos into a personalized guide to your life's destiny</p>
            </div>

            <UserSignUpForm />
        </div>
    );
}

export default LandingPageComponent;
