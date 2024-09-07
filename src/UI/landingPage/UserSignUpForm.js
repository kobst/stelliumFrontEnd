import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Autocomplete from 'react-google-autocomplete';
import { fetchTimeZone, postBirthData, postDailyTransit, postProgressedChart, postPromptGeneration, postPeriodTransits, postPeriodAspectsForUserChart, createUserProfile} from '../../Utilities/api'; 
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
      if (!time) errors.time = "Time is required";
      if (!lat || !lon) errors.location = "Location is required";
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
      time,
      lat,
      lon,
      placeOfBirth
    };

    setUserData(userData);
    navigate('/confirmation');
  
      setRawBirthData({});
      setBirthDate('');
   
      // try {
      //     const dateTimeString = `${date}T${time}:00`;
      //     const dateTime = new Date(dateTimeString);
      //     const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
      //     const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);
      //     console.log(`Time Zone Offset in Hours: ${totalOffsetHours}`);
      //     const birthData = {
      //         date: date,
      //         time: time,
      //         lat: lat,
      //         lon: lon,
      //         tzone: totalOffsetHours,
      //     };
      //     setBirthDate(birthData);
      //     const response = await postBirthData(birthData);
      //     console.log(" CHART DATA ");
      //     console.log(response.chartData);

      //     const dateOfBirth = dateTimeString
      //     console.log("date of birth " + dateOfBirth)

      //     // pass in response.chartData.houses (and maybe response.chartData.aspects) to createUserProfile
      //     const userid = await createUserProfile(
      //       email, 
      //       firstName, 
      //       lastName, 
      //       dateOfBirth, 
      //       placeOfBirth, 
      //       time, 
      //       totalOffsetHours, 
      //       response.chartData
      //   );
      //     console.log(JSON.stringify(userid) + " userid");
      //     setRawBirthData(response.chartData);
      //     setUserPlanets(response.chartData.planets);
      //     setUserHouses(response.chartData.houses);
      //     setUserAspects(response.chartData.aspects);
      //     if (userid) {
      //       console.log('User profile created successfully');
      //       setUserId(userid);
      //       navigate('/confirmation');
      //     } else {
      //       console.error('Failed to create user profile');
      //     }
      // } catch (error) {
      //   console.error('Error submitting form:', error);
      // }
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
              // className="input-dark-placeholder"
            />
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



