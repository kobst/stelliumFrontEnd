import React, { useState } from 'react';
import GoogleAutocomplete from 'react-google-autocomplete'; // Make sure to import GoogleAutocomplete

const EmailForm = () => {
 const [date, setDate] = useState('');
 const [time, setTime] = useState('');
 const [location, setLocation] = useState('');
 const [lat, setLat] = useState(null);
 const [lon, setLon] = useState(null);

 const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY

 const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(date, time, location, lat, lon);
 };

 return (
    <div className="email_form">
      <h2>Hi Stellium, Let me know when you're online</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <span>I'm </span>
          <input type="text" id="fname" name="fname" placeholder="Enter your Full Name" />
          <span>. My Email is </span>
          <input type="text" id="email" name="email" placeholder="Email Address" />
        </div>
        <br />
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
            apiKey={GOOGLE_API} // Make sure to replace GOOGLE_API with your actual API key
            onPlaceSelected={(place) => {
              var lat = place.geometry.location.lat();
              var lon = place.geometry.location.lng();
              console.log(lat + "lat" + lon + "lon");
              setLat(lat);
              setLon(lon);
              setLocation(place.formatted_address); // Set the location to the formatted address
            }}
          />
        </div>
        <br />
        <input type="submit" value="Submit" />
      </form>
    </div>
 );
};

export default EmailForm;