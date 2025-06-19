import React, { useState, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { createCelebrity, createCelebrityUnknownTime, fetchTimeZone } from '../../Utilities/api';
import '../landingPage/UserSignUpForm.css';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY

const AddCelebrityForm = ({ onCelebrityAdded }) => {
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [unknownTime, setUnknownTime] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const validateForm = () => {
      const errors = {};
      if (!firstName.trim()) errors.firstName = "First name is required";
      if (!lastName.trim()) errors.lastName = "Last name is required";
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

      setIsSubmitting(true);
      setFormErrors({});
      setSuccessMessage('');

      try {
        if (unknownTime) {
          // Calculate epoch time for timezone lookup (using noon for unknown time)
          const dateTimeString = `${date}T12:00:00`;
          const dateTime = new Date(dateTimeString);
          const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
          const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

          const birthData = {
            firstName,
            lastName,
            gender,
            placeOfBirth,
            dateOfBirth: date,
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            tzone: parseFloat(totalOffsetHours)
          };
          
          await createCelebrityUnknownTime(birthData);
        } else {
          const dateTimeString = `${date}T${time}:00`;
          const dateTime = new Date(dateTimeString);
          const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
          const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

          const birthData = {
            firstName,
            lastName,
            gender,
            placeOfBirth,
            dateOfBirth: dateTimeString,
            date,
            time,
            lat,
            lon,
            tzone: totalOffsetHours,
          };

          await createCelebrity(birthData);
        }

        setSuccessMessage(`${firstName} ${lastName} has been added successfully!`);
        
        // Clear form
        setFirstName('');
        setLastName('');
        setDate('');
        setTime('');
        setLat('');
        setLon('');
        setPlaceOfBirth('');
        setGender('');
        setUnknownTime(false);

        // Notify parent component if callback provided
        if (onCelebrityAdded) {
          onCelebrityAdded();
        }

      } catch (error) {
        console.error('Error creating celebrity:', error);
        setFormErrors({ submit: 'Error creating celebrity. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    };

    const headerStyle = {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '20px',
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
      <div className="email_form" style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <form onSubmit={handleSubmit}>
        <h2 style={headerStyle}>Add New Celebrity</h2>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Name</label>
            <input 
              type="text" 
              placeholder="First Name" 
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              style={inputStyle}
              className="input-dark-placeholder"
              disabled={isSubmitting}
            />
            <input 
              type="text" 
              placeholder="Last Name" 
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              style={inputStyle}
              className="input-dark-placeholder"
              disabled={isSubmitting}
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="location" style={labelStyle}>Born in</label>
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
                    disabled={isSubmitting}
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
            <label style={labelStyle}>Born on</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              style={inputStyle}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              <option value="known">Known Time</option>
              <option value="unknown">Unknown</option>
            </select>
            {!unknownTime && (
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                style={{
                  ...inputStyle,
                  margin: 0
                }}
                disabled={isSubmitting}
              />
            )}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Gender/Sex</label>
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
              disabled={isSubmitting}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="nonbinary">Non-binary</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <input 
              className="email-submit-btn" 
              type="submit" 
              value={isSubmitting ? "Adding..." : "Add Celebrity"}
              style={{ 
                ...inputStyle, 
                width: 'auto', 
                cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                backgroundColor: isSubmitting ? '#ccc' : 'white', 
                color: 'black', 
                fontWeight: 'bold',
                opacity: isSubmitting ? 0.6 : 1
              }}
              disabled={isSubmitting}
            />
          </div>
        </form>
        
        {successMessage && (
          <div style={{ color: 'green', marginTop: '15px', textAlign: 'center' }}>
            <p>{successMessage}</p>
          </div>
        )}
        
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
  
  export default AddCelebrityForm;