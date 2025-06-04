import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Autocomplete from 'react-google-autocomplete';
import useStore from '../../Utilities/store';
import './UserSignUpForm.css';  // Add this line



const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY

const UserSignUpForm = () => {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [unknownTime, setUnknownTime] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const setRawBirthData = useStore(state => state.setRawBirthData);
    const setBirthDate = useStore(state => state.setBirthDate);
    const setUserData = useStore(state => state.setUserData);
    const setUserId = useStore(state => state.setUserId);
    const setUserPlanets = useStore(state => state.setUserPlanets);
    const setUserHouses = useStore(state => state.setUserHouses);
    const setUserAspects = useStore(state => state.setUserAspects);
  
    const validateForm = () => {
      const errors = {};
      if (!firstName.trim()) errors.firstName = "First name is required";
      if (!lastName.trim()) errors.lastName = "Last name is required";
      if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email is invalid";
      if (!date) errors.date = "Date is required";
      if (!unknownTime && !time) errors.time = "Time is required";
      if (!lat || !lon) errors.location = "Location is required";
      if (!gender) errors.gender = "Gender/Sex is required";
      return errors;
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const userData = {
        firstName,
        lastName,
        email,
        date,
        time: unknownTime ? '' : time,
        lat,
        lon,
        placeOfBirth,
        gender,
        unknownTime
      };

      setUserData(userData);
      navigate('/signUpConfirmation');
      setRawBirthData({});
      setBirthDate('');
    };

    const headerStyle = {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '24px',
      textAlign: 'center',
      width: '100%',
      marginBottom: '20px',
      padding: '10px 0',
      borderBottom: '1px solid white'
    };    
    
    const inputStyle = {
      color: '#5116b5',
      width: '140px',
      marginRight: '10px',
      backgroundColor: 'transparent',
      border: '1px solid white',
      padding: '5px',
      borderRadius: '3px'
    };


    const labelStyle = {
      color: 'white',
      width: '140px',
      display: 'inline-block',
      marginRight: '10px'
    };

    const formGroupStyle = {
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center'
    };



    return (
      <div className="email_form">
        <form onSubmit={handleSubmit}>
        <h2 style={headerStyle}>Hello Stellium!</h2>

          <div style={formGroupStyle}>
            <label style={labelStyle}>My name is</label>
            <input 
              type="text" 
              id="fname" 
              name="fname" 
              placeholder="First Name" 
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              style={inputStyle}
              className="input-dark-placeholder"
            />
            <input 
              type="text" 
              id="lname" 
              name="lname" 
              placeholder="Last Name" 
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              style={inputStyle}
              className="input-dark-placeholder"
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="location" style={labelStyle}>I was born in</label>
            <Autocomplete
              placeholder="City, Country"
              textInputProps={{ placeholderTextColor: '#fff' }}
              styles={{
                textInputContainer: {
                  backgroundColor: '#5116b5',
                },
                textInput: {
                  height: 38,
                  color: '#5116b5',
                  fontSize: 16,
                },
                predefinedPlacesDescription: {
                  color: '#1faadb',
                },
              }}
              apiKey={GOOGLE_API}
              onPlaceSelected={(place) => {
                console.log("place: ", place)
                
                // Check if place and geometry exist
                if (!place || !place.geometry || !place.geometry.location) {
                  console.error("Invalid place object or missing geometry:", place);
                  return;
                }
                
                var lat = place.geometry.location.lat();
                var lon = place.geometry.location.lng();
                console.log(lat + "lat" + lon + "lon");
                setLat(lat);
                setLon(lon);
                setPlaceOfBirth(place.formatted_address);
              }}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>on this date</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              style={inputStyle}
              // className="input-dark-placeholder"
            />
            <label style={{ ...labelStyle, width: 'auto' }}>at</label>
            <input
              type="time"
              id="time"
              name="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={inputStyle}
              disabled={unknownTime}
            />
            <label style={{ color: 'white', marginLeft: '10px' }}>
              <input
                type="checkbox"
                checked={unknownTime}
                onChange={(e) => {
                  setUnknownTime(e.target.checked);
                  if (e.target.checked) {
                    setTime('');
                  }
                }}
                style={{ marginRight: '4px' }}
              />
              Time Unknown
            </label>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>My gender/sex is</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                ...inputStyle,
                width: '140px',
                backgroundColor: 'transparent',
                color: '#5116b5',
                border: '1px solid white',
                padding: '5px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="nonbinary">Non-binary</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>My email is</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email Address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ ...inputStyle, width: '290px' }}
              className="input-dark-placeholder"
            />
          </div>

          <div style={formGroupStyle}>
            <input 
              className="email-submit-btn" 
              type="submit" 
              value="Submit" 
              style={{ 
                ...inputStyle, 
                width: 'auto', 
                cursor: 'pointer', 
                backgroundColor: 'white', 
                color: 'black', 
                fontWeight: 'bold' 
              }}
            />
          </div>
        </form>
        {Object.keys(formErrors).length > 0 && (
          <div style={{ color: 'red', marginTop: '15px' }}>
            {Object.values(formErrors).map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default UserSignUpForm;



