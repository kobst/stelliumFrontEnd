import React, { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';

import '../pages/landingPageAdmin.css';
import { updateObjectKeys } from '../Utilities/helpers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import lightLogo from '../assets/Light logo.png'

import whiteLine from '../assets/whiteline.png'
import useStore from '../Utilities/store';
import DailyReadingAdmin from '../UI/landingPage/DailyReadingAdmin'
import DailySignHoroscopeMenu from '../UI/landingPage/DailySignHoroscopeMenu';
import WeeklySignHoroscopeMenu from '../UI/landingPage/WeeklySignHoroscopeMenu';
import { PeriodTransits } from '../UI/landingPage/PeriodTransits';
import Ephemeris from '../UI/shared/Ephemeris';
import { TransitAspects } from '../UI/landingPage/transitAspects';
import TodaysAspectsTableAdmin from '../UI/landingPage/TodaysAspectsTableAdmin';
import WeeklyAspectsTableAdmin from '../UI/landingPage/WeeklyAspectsTableAdmin';
import WeeklyTransitsTableAdmin from '../UI/landingPage/WeeklyTransitsTableAdmin';
import TransitInterpretationTable from '../UI/landingPage/TransitInterpretationTable';
import UserSignUpForm from '../UI/landingPage/UserSignUpForm';
import { formatTransitDataForTable, 
    formatTransitDataForTableWeekly, 
    formatTransitData, 
    findMostRelevantAspects, 
    isValidPeriodTransits,
    formatTransitDataDescriptionsForTableWeekly,
    formatAspecttDataDescriptionForTableDataWeekly, 
    appendHouseDescriptions,
    formatTransitDataDescriptionsForTableWeekl} from '../Utilities/helpers';
import { postGptResponse,
     saveDailyTransitInterpretationData,
    saveWeeklyTransitInterpretationData } from '../Utilities/api';




import { postDailyTransits, postPeriodTransits, postDailyAspects, postPeriodAspects, postDailyRetrogrades } from '../Utilities/api'


const LandingPageAdmin = () => {
    const [todaysDate, setTodaysDate] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedWeeklyDate, setSelectedWeeklyDate] = useState(new Date());
    const [selectedSign, setSelectedSign] = useState('');

    const [dailyTransitAspects, setDailyTransitAspects] = useState([]);
    const [periodAspects, setPeriodAspects] = useState([]);
    const [periodTransits, setPeriodTransits] = useState({});
    const [dailyTransitDescriptionsForTable, setDailyTransitDescriptionsForTable] = useState([]);
    const [weeklyTransitDescriptionsForTable, setWeeklyTransitDescriptionsForTable] = useState([]);
    const [weeklyTransitInterpretation, setWeeklyTransitInterpretation] = useState('');
    const [dailyTransitInterpretation, setDailyTransitInterpretation] = useState('');
    const [combinedDescriptions, setCombinedDescriptions] = useState('');
    const [combinedWeeklyDescriptions, setCombinedWeeklyDescriptions] = useState('');
    const [relevantDailyTransits, setRelevantDailyTransits] = useState([]);
    const [retrogrades, setRetrogrades] = useState([]);
    const [errorState, setError] = useState('');

    const [selectedTransits, setSelectedTransits] = useState([]);
    const [selectedAspects, setSelectedAspects] = useState([]); 

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

    const handleWeeklyDateChange = (date) => {
        setSelectedWeeklyDate(date);
    };

    const handleFetchData = async () => {
        try {
            const currentDateISO = selectedDate.toISOString();
   

            const cleanedDailyTransits = await handleFetchDailyTransits(currentDateISO);
            const dailyAspects = await handleFetchDailyAspects(currentDateISO);
            const retrogrades = await handleFetchRetrogrades(currentDateISO);
            setDailyTransits(cleanedDailyTransits);
            console.log("cleanedTransits")
            console.log(cleanedDailyTransits)
            setDailyTransitAspects(dailyAspects);
            console.log("dailyAspects")
            console.log(dailyAspects)
            setRetrogrades(retrogrades);


            const descriptionsForTable = dailyAspects.map(aspect => 
                formatTransitDataForTable(aspect, cleanedDailyTransits)
            );

            setDailyTransitDescriptionsForTable(descriptionsForTable)


        } catch (error) {
            setError(error.message);
        }
    };

    const handleFetchWeeklyData = async () => {
        try {
            const currentDateISO = selectedWeeklyDate.toISOString();
            const oneWeekLater = new Date(selectedWeeklyDate);
            const oneMonthLater = new Date(selectedWeeklyDate);
            oneWeekLater.setDate(oneWeekLater.getDate() + 8);
            oneMonthLater.setDate(oneMonthLater.getDate() + 30);    
            const oneWeekLaterISO = oneWeekLater.toISOString();
            const oneMonthLaterISO = oneMonthLater.toISOString();

            const retrogrades = await handleFetchRetrogrades(currentDateISO);
            const periodAspects = await handleFetchPeriodAspects(currentDateISO, oneWeekLaterISO);
            const periodTransits = await handleFetchPeriodTransits(currentDateISO, oneWeekLaterISO);


            setRetrogrades(retrogrades);
            setPeriodTransits(periodTransits);
            console.log("periodTransits")
            console.log(periodTransits)
            setPeriodAspects(periodAspects);
            console.log("periodAspects")
            console.log(periodAspects)

            const descriptionsForWeeklyTable = periodAspects.map(aspect => 
                formatTransitDataForTableWeekly(aspect, periodTransits)
            );

     
            // filter descriptionsForWeeklyTable to only aspects where the orbDate is between today and one week from today
            const filteredDescriptionsForWeeklyTable = descriptionsForWeeklyTable.filter(aspect => {
                const orbDate = new Date(aspect.closestOrbDate);
                const startDate = new Date(currentDateISO);
                const endDate = new Date(oneWeekLaterISO);
                return orbDate >= startDate && orbDate <= endDate;
            });

            console.log("filteredDescriptionsForWeeklyTable")
            console.log(filteredDescriptionsForWeeklyTable)
            setWeeklyTransitDescriptionsForTable(filteredDescriptionsForWeeklyTable)


        } catch (error) {
            setError(error.message);
        }
    };


    useEffect(() => {
        handleFetchData();
    }, [selectedDate]);

    useEffect(() => {
        handleFetchWeeklyData();
    }, [selectedWeeklyDate]);

 
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

    const handleSaveWeeklyAspects = (selectedAspects) => {
        console.log('Saved weekly aspects:', selectedAspects);
        setSelectedAspects(selectedAspects)
        // Add any additional logic here
      };

      const handleSaveWeeklyTransits = (selectedTransits) => {
        console.log('Saved weekly transits:', selectedTransits);
        setSelectedTransits(selectedTransits)
        // Add any additional logic here
      };
      
      const handleSelectSign = (sign) => {
        console.log('Selected sign:', sign);
        setSelectedSign(sign)
        console.log("selectedSign") 
        console.log(selectedSign)
        // if selectedTransits and selectedAspects are not empty, save them to the database
        if (selectedTransits.length > 0 && selectedAspects.length > 0) {
            const formattedTransits = selectedTransits.map(transit => formatTransitDataDescriptionsForTableWeekly(transit));
            const formattedAspects = selectedAspects.map(aspect => formatAspecttDataDescriptionForTableDataWeekly(aspect));
            console.log("saving weekly transits and aspects");
            console.log(formattedTransits);
            console.log(formattedAspects);
            const combinedWeeklyDescriptions = [...formattedTransits, ...formattedAspects];
            setCombinedWeeklyDescriptions(combinedWeeklyDescriptions);
            const { updatedTransits, updatedAspects } = appendHouseDescriptions(formattedTransits, formattedAspects, sign);
            console.log("updated weekly transits and aspects with house descriptions");
            console.log(updatedTransits);
            console.log(updatedAspects);
            generateResponseForWeeklySign(combinedWeeklyDescriptions)
          }

      };

    const handleFetchPeriodAspects = async (startDate, endDate) => {
    try {
        const periodAspectsData = await postPeriodAspects(startDate, endDate);
        console.log("periodAspectsData (before filtering)", periodAspectsData);

        const filteredAspects = periodAspectsData.filter(aspect => {
            // return true;
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


      async function generateResponseForWeeklySign(descriptions) {
        console.log(descriptions)
        const prompt = "Above are transits occuring in a specific sign for this week. Please provide me a short horoscope for this sign for this week given these transits and aspects. "
         const modifiedInput = `${descriptions}\n: ${prompt}`;
          const response = await postGptResponse(modifiedInput);
          console.log(response)
          setWeeklyTransitInterpretation(response)
      }

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

      const handleSaveWeeklyInterpretation = async () => {
        console.log("saving weekly interpretation");
        if (weeklyTransitInterpretation && selectedDate) {
          console.log("saving weekly interpretation");
          console.log(weeklyTransitInterpretation);
          console.log(selectedDate);
          const formattedDate = selectedDate.toISOString();
          console.log(formattedDate);
          const combinedAspectsDescription = combinedWeeklyDescriptions;
          try {

            const result = await saveWeeklyTransitInterpretationData(formattedDate, combinedAspectsDescription, weeklyTransitInterpretation, selectedSign);
            console.log('Daily transit data saved:');
            // You might want to show a success message to the user here
          } catch (error) {
            console.error('Failed to save daily transit data:', error);
          } 
        }
      };

      async function handleRegenerateInterpretation() {
        console.log("regenerating interpretation")
        if (combinedDescriptions) { 
          generateResponse(combinedDescriptions)
        }
      }

      async function handleRegenerateWeeklyInterpretation() {
        console.log("regenerating weekly interpretation")
        if (weeklyTransitInterpretation) { 
          generateResponseForWeeklySign(weeklyTransitInterpretation)
        }
      }

      const filterSundays = (date) => {
        return date.getDay() === 0; // 0 represents Sunday
    };

    const formatDateRange = (startDate) => {
        const endDate = addDays(startDate, 6); // End date is 6 days after start (inclusive of start day)
        const startFormatted = format(startDate, 'MMMM d, yyyy');
        const endFormatted = format(endDate, 'MMMM d, yyyy');
        
        return (
          <>
            <div className="timesubtxt">Week of {startFormatted}</div>
            <div className="timesubtxt">to {endFormatted}</div>
          </>
        );
    };

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

            {
                    dailyTransitDescriptionsForTable.length > 0 && dailyTransits.length > 0 && (
                      <div>
                        <Ephemeris planets={dailyTransits} houses={[]} aspects={dailyTransitDescriptionsForTable} transits={[]} />
                        
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
            
                        </div>   
                        
                        <TodaysAspectsTableAdmin aspectsArray={dailyTransitDescriptionsForTable} onSaveAspects={handleSaveAspects}/>
                      </div>
                    )
            }

            <div className="admin-section">
                <TransitInterpretationTable />
            </div>

            <div className="section-divider"></div>







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
                
                <span className="section-divider"></span>
                <h2>WeeklyTransits</h2>
                <span className="section-divider"></span>

                <h2>Select a Sunday</h2>
                <div>
                    <DatePicker
                        selected={selectedWeeklyDate}
                        onChange={handleWeeklyDateChange}
                        filterDate={filterSundays}
                        dateFormat="MMMM d, yyyy"
                        className="date-picker"
                    />
                    <div style={{ marginTop: '40px', marginBottom: '10px', color: 'whitesmoke' }}>
                        {formatDateRange(selectedWeeklyDate)}
                    </div>
                </div>   


                {periodTransits && Object.keys(periodTransits).length > 0 && (
                        <div style={{color: 'white'}}>
                        <PeriodTransits periodTransits={periodTransits} />
                    </div>

                )}

                <div style={{color: 'white'}}>
                    <h2>Weekly Aspects</h2>
                    <TransitAspects transits={periodAspects} />
                </div>

                {isValidPeriodTransits(periodTransits) && (
                    <WeeklyTransitsTableAdmin 
                        transits={periodTransits}
                        startDate={selectedDate}
                        onSaveTransits={handleSaveWeeklyTransits}
                    />
                    )}
    

                {weeklyTransitDescriptionsForTable.length > 0 && (
                <WeeklyAspectsTableAdmin 
                    aspectsArray={weeklyTransitDescriptionsForTable} 
                    startDate={selectedDate}
                    onSaveAspects={handleSaveWeeklyAspects}
                />
                )}

                <WeeklySignHoroscopeMenu selectSign={handleSelectSign} />
                {weeklyTransitInterpretation && (
                    <div>
                        <h2>Weekly Horoscope</h2>
                        <p>{weeklyTransitInterpretation}</p>
                        <button onClick={handleRegenerateWeeklyInterpretation}>Regenerate Weekly Interpretation</button>
                        <button onClick={handleSaveWeeklyInterpretation}>Save Weekly Interpretation</button>
                    </div>
                )}
            {/* <DailySignHoroscopeMenu transitAspectObjects={dailyTransitAspects} transits={dailyTransits} /> */}

            {/* <DailyReading transitAspectObjects={dailyTransitAspects} transits={dailyTransits} /> */}

        </div>
    );
}

export default LandingPageAdmin;
