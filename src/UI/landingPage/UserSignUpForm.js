import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Autocomplete from 'react-google-autocomplete';
import useStore from '../../Utilities/store';
import './UserSignUpForm.css';  // Add this line



const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY

const UserSignUpForm = () => {
    const navigate = useNavigate();
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

    // Load Google Places API script
    useEffect(() => {
        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setIsGoogleLoaded(true);
            document.head.appendChild(script);
        } else {
            setIsGoogleLoaded(true);
        }
    }, []);

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
    // const setRawBirthData = useStore(state => state.setRawBirthData);
    // const setBirthDate = useStore(state => state.setBirthDate);
    const setUserData = useStore(state => state.setUserData);
    // const setUserId = useStore(state => state.setUserId);
    // const setUserPlanets = useStore(state => state.setUserPlanets);
    // const setUserHouses = useStore(state => state.setUserHouses);
    // const setUserAspects = useStore(state => state.setUserAspects);
  
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
      // setRawBirthData({});
      // setBirthDate('');
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

    const handlePlaceSelect = (place) => {
        try {
            if (!place || !place.geometry || !place.geometry.location) {
                console.error("Invalid place object or missing geometry:", place);
                return;
            }
            
            const lat = place.geometry.location.lat();
            const lon = place.geometry.location.lng();
            console.log("Selected location:", { lat, lon, address: place.formatted_address });
            
            setLat(lat);
            setLon(lon);
            setPlaceOfBirth(place.formatted_address);
        } catch (error) {
            console.error("Error processing place selection:", error);
        }
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
            {isGoogleLoaded ? (
                <Autocomplete
                    apiKey={GOOGLE_API}
                    onPlaceSelected={handlePlaceSelect}
                    options={{
                        types: ['(cities)']
                    }}
                    style={{
                        ...inputStyle,
                        width: '290px',
                        backgroundColor: 'white'
                    }}
                    placeholder="City, Country"
                />
            ) : (
                <input
                    type="text"
                    style={{
                        ...inputStyle,
                        width: '290px',
                        backgroundColor: 'white'
                    }}
                    placeholder="Loading location search..."
                    disabled
                />
            )}
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
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>at this time</label>
            <select
              value={unknownTime ? 'unknown' : 'known'}
              onChange={(e) => {
                if (e.target.value === 'unknown') {
                  setUnknownTime(true);
                  setTime('');
                } else {
                  setUnknownTime(false);
                }
              }}
              style={{
                ...inputStyle,
                width: '120px',
                backgroundColor: 'transparent',
                color: '#5116b5',
                border: '1px solid white',
                padding: '5px',
                borderRadius: '3px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              <option value="known">Known Time</option>
              <option value="unknown">Unknown</option>
            </select>
            {!unknownTime && (
              <input
                type="time"
                id="time"
                name="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                style={{
                  ...inputStyle,
                  margin: 0
                }}
              />
            )}
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



