
import React, { useState, useEffect, useContext } from 'react';


import GoogleAutocomplete from 'react-google-autocomplete';
import { fetchTimeZone, postBirthData, postDailyTransit, postProgressedChart, postPromptGeneration, postPeriodTransits, postPeriodAspectsForUserChart} from '../../Utilities/api'; 
import useStore from '../../Utilities/store';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY

const SimpleForm = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const setRawBirthData = useStore(state => state.setRawBirthData);
  const setBirthDate = useStore(state => state.setBirthDate);
  const setProgressedBirthData = useStore(state => state.setProgressedBirthData);
  const setDailyTransits = useStore(state => state.setDailyTransits)
  const setDailyTransitDescriptions = useStore(state => state.setDailyTransitDescriptions)

  const setPromptDescriptionsMap = useStore(state => state.setPromptDescriptionsMap)

  function getStartAndEndDate() {
    const currentDate = new Date();
    const startDate = currentDate.toISOString();

    const endDate = new Date(currentDate);
    endDate.setMonth(endDate.getMonth() + 1);
    const endDateString = endDate.toISOString();

    return { startDate, endDate: endDateString };
}


  const handleSubmit = async (event) => {
    event.preventDefault();
    setRawBirthData('')
    setBirthDate({})
 
    try {
        const dateTimeString = `${date}T${time}:00`; // Adding ':00' for seconds
        const dateTime = new Date(dateTimeString);
        const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
        const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);
        console.log(`Time Zone Offset in Hours: ${totalOffsetHours}`);
    
       
        const birthData = {
            date: date,
            time: time,
            lat: lat,
            lon: lon,
            tzone: totalOffsetHours,
        };
        setBirthDate(birthData)

        const { startDate, endDate } = getStartAndEndDate();


        const response = await postBirthData(birthData)
        const responseProgressed = await postProgressedChart(birthData)
        const todaysPositions = await postDailyTransit(birthData);
        const promptMapResponse = await postPromptGeneration(response.chartData)
        const promptDescriptionsMap = promptMapResponse.promptDescriptionsMap
        
        setPromptDescriptionsMap('personality', promptDescriptionsMap['personality'])
        setPromptDescriptionsMap('home', promptDescriptionsMap['home'])
        setPromptDescriptionsMap('relationships', promptDescriptionsMap['relationships'])
        setPromptDescriptionsMap('career', promptDescriptionsMap['career'])
        setPromptDescriptionsMap('everything', promptDescriptionsMap['everything'])
        setPromptDescriptionsMap('unconscious', promptDescriptionsMap['unconscious'])
        setPromptDescriptionsMap('communication', promptDescriptionsMap['communication'])
        setPromptDescriptionsMap('Quadrants', promptDescriptionsMap['quadrants'])
        setPromptDescriptionsMap('Elements', promptDescriptionsMap['elements'])
        setPromptDescriptionsMap('Modalities', promptDescriptionsMap['modalities'])
        setPromptDescriptionsMap('Pattern', promptDescriptionsMap['pattern'])

        console.log(" CHART DATA ")
        console.log(response.chartData)
        const periodTransitsTest = await postPeriodAspectsForUserChart(startDate, endDate, response.chartData.planets)
        console.log(periodTransitsTest)

        setDailyTransits(todaysPositions.chartData)
        setDailyTransitDescriptions(todaysPositions.transitAspects)
        setProgressedBirthData(responseProgressed.chartData)
        setRawBirthData(response.chartData);


    } catch (error) {
      console.error('Error submitting form:', error);
      setRawBirthData(`Error: ${error.message}`);
    }
  };
  

  return (
    <div className="email_form">
      <form onSubmit={handleSubmit}>
      `<div>
          <span style={{ color: 'white' }}>I'm </span>
          <input type="text" id="fname" name="fname" placeholder="Enter your Full Name" style={{ color: 'white' }}/>
          <span style={{ color: 'white' }}>. My Email is </span>
          <input type="text" id="email" name="email" placeholder="Email Address" style={{ color: 'white' }}/>
        </div>
        <label htmlFor="date" style={{ color: 'white' }}>Date:</label>
        <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} /><br /><br />

        <label htmlFor="time" style={{ color: 'white' }}>Time:</label>
        <input type="time" id="time" name="time" value={time} onChange={e => setTime(e.target.value)} /><br /><br />

        <label htmlFor="location" style={{ color: 'white' }}>Location:</label>

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
                setLat(lat)
                setLon(lon)
                }}
            />
            
        </div>
        <input type="submit" value="Submit" style={{ color: 'black' }}/>
      </form>
    </div>
  );
};

export default SimpleForm;



