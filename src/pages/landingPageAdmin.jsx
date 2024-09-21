import React, { useEffect, useState } from 'react';

import '../pages/landingPageAdmin.css';
import { updateObjectKeys } from '../Utilities/helpers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import useStore from '../Utilities/store';
import DailyReadingAdmin from '../UI/landingPage/DailyReadingAdmin'
import DailySignHoroscopeMenu from '../UI/landingPage/DailySignHoroscopeMenu';
import { PeriodTransits } from '../UI/landingPage/PeriodTransits';
import Ephemeris from '../UI/shared/Ephemeris';
import { TransitAspects } from '../UI/landingPage/transitAspects';
import TodaysAspectsTableAdmin from '../UI/landingPage/TodaysAspectsTableAdmin';
import TransitInterpretationTable from '../UI/landingPage/TransitInterpretationTable';
import UserSignUpForm from '../UI/landingPage/UserSignUpForm';
import { formatTransitDataForTable, formatTransitData, findMostRelevantAspects} from '../Utilities/helpers';
import { postGptResponse, saveDailyTransitInterpretationData } from '../Utilities/api';




import { postDailyTransits, postPeriodTransits, postDailyAspects, postPeriodAspects, postDailyRetrogrades } from '../Utilities/api'


const LandingPageAdmin = () => {
    const [todaysDate, setTodaysDate] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [dailyTransitAspects, setDailyTransitAspects] = useState([]);
    const [periodAspects, setPeriodAspects] = useState([]);
    const [periodTransits, setPeriodTransits] = useState([]);
    const [dailyTransitDescriptionsForTable, setDailyTransitDescriptionsForTable] = useState([]);
    const [dailyTransitInterpretation, setDailyTransitInterpretation] = useState('');
    const [combinedDescriptions, setCombinedDescriptions] = useState('');
    const [relevantDailyTransits, setRelevantDailyTransits] = useState([]);
    const [retrogrades, setRetrogrades] = useState([]);
    const [errorState, setError] = useState('');

    const setDailyTransits = useStore(state => state.setDailyTransits)
    const dailyTransits = useStore(state => state.dailyTransits)

    const formatDate = (date) => {
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

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleFetchData = async () => {
        try {
            const currentDateISO = selectedDate.toISOString();
            const oneMonthLater = new Date(selectedDate);
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
            const oneMonthLaterISO = oneMonthLater.toISOString();

            const cleanedTransits = await handleFetchDailyTransits(currentDateISO);
            const dailyAspects = await handleFetchDailyAspects(currentDateISO);
            const retrogrades = await handleFetchRetrogrades(currentDateISO);
            const periodAspects = await handleFetchPeriodAspects(currentDateISO, oneMonthLaterISO);
            const periodTransits = await handleFetchPeriodTransits(currentDateISO, oneMonthLaterISO);

            setDailyTransits(cleanedTransits);
            setDailyTransitAspects(dailyAspects);
            setRetrogrades(retrogrades);
            setPeriodTransits(periodTransits);
            setPeriodAspects(periodAspects);

            const descriptionsForTable = dailyAspects.map(aspect => 
                formatTransitDataForTable(aspect, cleanedTransits)
            );
            
            setDailyTransitDescriptionsForTable(descriptionsForTable);

        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        handleFetchData();
    }, [selectedDate]);

 
    const handleFetchDailyTransits = async (date) => {
        try {
          const transitsData = await postDailyTransits(date);
          const cleanedTransits = updateObjectKeys(transitsData);
          // console.log("dailyTransits")
          // console.log(dailyTransits)
          return cleanedTransits
        } catch (error) {
          setError(error.message);
        }
      };


    const handleFetchDailyAspects = async (date) => {
        try {
            const aspectsData = await postDailyAspects(date);
            // setDailyTransitAspects(aspectsData);
            return aspectsData
  
            
        } catch (error) {
            setError(error.message);
        }
    };

      const handleFetchPeriodTransits = async (startDate, endDate) => {
        try {
          const transitsData = await postPeriodTransits(startDate, endDate);
        //   const planetaryTransits = trackPlanetaryTransits(transitsData);
        //   console.log("planetaryTransits")
        //   console.log(planetaryTransits)
            // setPeriodTransits(transitsData);   
            return transitsData
        } catch (error) {
          setError(error.message);
        }
      };

    const handleSaveAspects = (selectedAspects) => {
        console.log('Saved aspects:', selectedAspects);
        setRelevantDailyTransits(selectedAspects)
        if (selectedAspects.length > 0 && dailyTransits.length > 0) {
            const descriptions = selectedAspects.map(aspect => 
                formatTransitData(aspect, dailyTransits, null)
              );
              console.log(descriptions)
              const combinedDescriptions = descriptions.join('\n');
              setCombinedDescriptions(combinedDescriptions)
              generateResponse(combinedDescriptions)
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
        return filteredAspects
    } catch (error) {
        setError(error.message);
    }
    };
    

    const handleFetchRetrogrades = async (startDate) => {
        try {
            const retrogrades = await postDailyRetrogrades(startDate);
            return retrogrades
        } catch (error) {
            setError(error.message);
        }
      };


    async function generateResponse(descriptions) {
        console.log(descriptions)
        const prompt = "Above are today's transits. Please provide me a short description of this transit that is occuring today. Please make it applicable generally to all signs and people. "
         const modifiedInput = `${descriptions}\n: ${prompt}`;
          const response = await postGptResponse(modifiedInput);
          console.log(response)
          setDailyTransitInterpretation(response)
      }

      const handleSaveInterpretation = async () => {
        console.log("saving interpretation");
        if (dailyTransitInterpretation && combinedDescriptions && selectedDate) {
          console.log("saving interpretation");
          console.log(dailyTransitInterpretation);
          console.log(combinedDescriptions);
          console.log(selectedDate);
          const formattedDate = selectedDate.toISOString();
          console.log(formattedDate);
          const combinedAspectsDescription = combinedDescriptions;
    
          try {
            const result = await saveDailyTransitInterpretationData(formattedDate, combinedAspectsDescription, dailyTransitInterpretation);
            console.log('Daily transit data saved:', result);
            // You might want to show a success message to the user here
          } catch (error) {
            console.error('Failed to save daily transit data:', error);
            // You might want to show an error message to the user here
          }
        }
      };

      async function handleRegenerateInterpretation() {
        console.log("regenerating interpretation")
        if (combinedDescriptions) { 
          generateResponse(combinedDescriptions)
        }
      }

    // useEffect(() => {
    //     async function getTodaysData() {
    //       try {
    //         const currentDateISO = new Date().toISOString();
    //         const oneMonthLater = new Date();
    //         const oneWeekLater = new Date(currentDateISO);
    //         oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    //         const oneMonthLaterISO = oneMonthLater.toISOString();
    //         const cleanedTransits = await handleFetchDailyTransits(currentDateISO);
    //         const dailyAspects = await handleFetchDailyAspects(currentDateISO);
    //         const retrogrades = await handleFetchRetrogrades(currentDateISO);
    //         const periodAspects = await handleFetchPeriodAspects(currentDateISO, oneMonthLaterISO);
    //         const periodTransits = await handleFetchPeriodTransits(currentDateISO, oneMonthLaterISO);

    //         setTodaysDate(currentDateISO);
    //         setDailyTransits(cleanedTransits);
    //         setDailyTransitAspects(dailyAspects);
    //         setRetrogrades(retrogrades);
    //         setPeriodTransits(periodTransits);
    //         setPeriodAspects(periodAspects);

    //         const descriptionsForTable = dailyAspects.map(aspect => 
    //           formatTransitDataForTable(aspect, cleanedTransits)
    //         );
            
    //         console.log("descriptionsForTable")
    //         console.log(descriptionsForTable) 
    //         setDailyTransitDescriptionsForTable(descriptionsForTable);
  
    //       } catch (error) {
    //         setError(error.message);
    //       }
    //     }
    
    //     getTodaysData();
    //   }, []);


      
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

            <div className="admin-section">
                <h2>Transit Interpretation Table</h2>
                <TransitInterpretationTable />
            </div>

            <div className="section-divider"></div>



            <h2>Todays Date</h2>
            <div>
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="MMMM d, yyyy"
                    className="date-picker"
                />
                <div style={{ marginTop: '40px', marginBottom: '10px', color: 'whitesmoke' }}>
                    {formatDate(selectedDate)}
                </div>
                {
                    dailyTransitDescriptionsForTable.length > 0 && dailyTransits.length > 0 && (
                      <div>
                        <Ephemeris planets={dailyTransits} houses={[]} aspects={dailyTransitDescriptionsForTable} transits={[]} />
                        <TodaysAspectsTableAdmin aspectsArray={dailyTransitDescriptionsForTable} onSaveAspects={handleSaveAspects}/>
                      </div>
                    )
                }
            </div>   



            {dailyTransitInterpretation && combinedDescriptions && (
                <div>
                    <h2>Interpretation of the day</h2>
                    <div>
                        <h3>Aspects of The Day</h3>
                        <p>{combinedDescriptions}</p>
                        <h3>Interpretation</h3>
                        <p>{dailyTransitInterpretation}</p>
                        <button onClick={handleRegenerateInterpretation}>Regenerate Interpretation</button>
                        <button onClick={handleSaveInterpretation}>Save Interpretation</button>
                    </div>
                </div>
            ) }
                {/* <div>
                <div className="daily-reading-container">
                  <h2>Aspect of the day</h2>
                  <DailyReadingAdmin transitAspectObjects={dailyTransitAspects} transits={dailyTransits} risingSign={null} />
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

            <DailySignHoroscopeMenu transitAspectObjects={dailyTransitAspects} transits={dailyTransits} />

            {/* <DailyReading transitAspectObjects={dailyTransitAspects} transits={dailyTransits} /> */}

        </div>
    );
}

export default LandingPageAdmin;
