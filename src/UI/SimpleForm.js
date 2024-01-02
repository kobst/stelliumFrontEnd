
import React, { useState, useEffect, useContext } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import ResponseContext from '../Utilities/ResponseContext';

import GoogleAutocomplete from 'react-google-autocomplete';
import { postBirthData } from '../Utilities/api'; 
import useStore from '../Utilities/store';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY

const SimpleForm = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const setRawBirthData = useStore(state => state.setRawBirthData);



  const handleSubmit = async (event) => {
    event.preventDefault();
    setRawBirthData("")
    const birthData = {
      date: date,
      time: time,
      lat: lat,
      lon: lon
    };
  
    console.log(birthData)
    try {
      const response = await postBirthData(birthData)
    //   setRawBirthData(JSON.stringify(response, null, 2));
      setRawBirthData(response.chartData);

    } catch (error) {
      console.error('Error submitting form:', error);
      setRawBirthData(`Error: ${error.message}`);
    }
  };
  

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" value={date} onChange={e => setDate(e.target.value)} /><br /><br />

        <label htmlFor="time">Time:</label>
        <input type="time" id="time" name="time" value={time} onChange={e => setTime(e.target.value)} /><br /><br />

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
                setLat(lat)
                setLon(lon)
                }}
            />
            
        </div>
 
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default SimpleForm;
