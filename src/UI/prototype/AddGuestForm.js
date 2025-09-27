import React, { useState, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import useStore from '../../Utilities/store';
import { fetchTimeZone } from '../../Utilities/api';
import useSubjectCreation from '../../hooks/useSubjectCreation';
import '../landingPage/UserSignUpForm.css';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY;

const AddGuestForm = ({ onGuestAdded, title = "Add New Profile" }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const userId = useStore(state => state.userId);
  const { createGuest, loading, error } = useSubjectCreation();

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
  const [submitMessage, setSubmitMessage] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState(null);

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

    setFormErrors({});
    setSubmitMessage('');
    setWorkflowStatus(null);

    try {
      // Calculate timezone offset
      const timeForTimezone = unknownTime ? '12:00' : time;
      const dateTimeString = `${date}T${timeForTimezone}:00`;
      const dateTime = new Date(dateTimeString);
      const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
      const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

      // Prepare data for direct API
      const guestData = {
        firstName,
        lastName,
        dateOfBirth: date,
        placeOfBirth,
        time: unknownTime ? 'unknown' : time,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        tzone: parseFloat(totalOffsetHours),
        gender
      };

      console.log('Creating guest with direct API:', guestData);
      const result = await createGuest(guestData, userId);
      
      if (result.success) {
        // Show success message
        setSubmitMessage('Profile added successfully!');
        setWorkflowStatus('completed');
        
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
        setFormErrors({});
        
        // Notify parent component to refresh guest table
        if (onGuestAdded) {
          onGuestAdded();
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitMessage('');
          setWorkflowStatus(null);
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error creating guest:', error);
      setSubmitMessage(error.message || 'Error creating profile. Please try again.');
    }
  };

  const handlePlaceSelected = (place) => {
    try {
      if (!place || !place.geometry || !place.geometry.location) {
        console.error("Invalid place object or missing geometry:", place);
        return;
      }
      
      const lat = place.geometry.location.lat();
      const lon = place.geometry.location.lng();
      
      setLat(lat);
      setLon(lon);
      setPlaceOfBirth(place.formatted_address);
      setFormErrors(prev => ({ ...prev, location: null }));
    } catch (error) {
      console.error("Error processing place selection:", error);
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

  return (
    <div className="email_form" style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <form onSubmit={handleSubmit}>
        <h2 style={headerStyle}>{title}</h2>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Name</label>
          <input 
            type="text" 
            placeholder="First Name" 
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            style={inputStyle}
            className="input-dark-placeholder"
            disabled={loading}
          />
          <input 
            type="text" 
            placeholder="Last Name" 
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            style={inputStyle}
            className="input-dark-placeholder"
            disabled={loading}
          />
        </div>

        <div style={formGroupStyle}>
          <label htmlFor="location" style={labelStyle}>Born in</label>
          {isGoogleLoaded ? (
            <Autocomplete
              apiKey={GOOGLE_API}
              onPlaceSelected={handlePlaceSelected}
              options={{
                types: ['(cities)']
              }}
              style={{
                ...inputStyle,
                width: '290px',
                backgroundColor: 'white'
              }}
              placeholder="City, Country"
              disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
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
            value={loading ? "Adding..." : "Add Profile"}
            style={{ 
              ...inputStyle, 
              width: 'auto', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              backgroundColor: loading ? '#ccc' : 'white', 
              color: 'black', 
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
            disabled={loading}
          />
        </div>
      </form>
      
      {/* Loading Status Display */}
      {loading && (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          padding: '15px', 
          borderRadius: '6px', 
          margin: '15px 0',
          textAlign: 'center'
        }}>
          <p style={{ color: 'white', margin: '0' }}>Creating guest profile and generating overview...</p>
        </div>
      )}
      
      {submitMessage && (
        <div style={{ color: submitMessage.includes('Error') ? 'red' : 'green', marginTop: '15px', textAlign: 'center' }}>
          <p>{submitMessage}</p>
        </div>
      )}
      
      {(Object.keys(formErrors).length > 0 || error) && (
        <div style={{ color: 'red', marginTop: '15px' }}>
          {Object.values(formErrors).map((err, index) => (
            <p key={index}>{err}</p>
          ))}
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default AddGuestForm;