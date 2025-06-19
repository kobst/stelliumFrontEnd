import React, { useState, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import useStore from '../../Utilities/store';
import { createGuestSubject, createGuestSubjectUnknownTime, fetchTimeZone } from '../../Utilities/api';
import '../landingPage/UserSignUpForm.css';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY;

const AddGuestForm = ({ onGuestAdded, title = "Add New Profile" }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const userId = useStore(state => state.userId);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
    setSubmitMessage('');

    try {
      // Calculate timezone offset
      const birthDateTime = new Date(`${date}T${time || '12:00'}:00`);
      const epochTimeSeconds = birthDateTime.getTime() / 1000;
      const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

      const guestData = {
        firstName,
        lastName,
        gender,
        placeOfBirth,
        dateOfBirth: birthDateTime.toISOString(),
        time: unknownTime ? null : time,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        tzone: totalOffsetHours,
        ownerUserId: userId
      };

      // Use appropriate API based on whether time is known
      const response = unknownTime 
        ? await createGuestSubjectUnknownTime(guestData)
        : await createGuestSubject(guestData);

      setSubmitMessage('Profile added successfully!');
      
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

      // Notify parent to refresh the table
      if (onGuestAdded) {
        onGuestAdded();
      }

    } catch (error) {
      console.error('Error creating guest:', error);
      setSubmitMessage('Error creating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
      // Clear message after 3 seconds
      setTimeout(() => {
        setSubmitMessage('');
      }, 3000);
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
      console.log("Selected location:", { lat, lon, address: place.formatted_address });
      
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
          <label style={{ ...labelStyle, width: 'auto' }}>at</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={inputStyle}
            disabled={unknownTime || isSubmitting}
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
              disabled={isSubmitting}
            />
            Time Unknown
          </label>
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
            value={isSubmitting ? "Adding..." : "Add Profile"}
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
      
      {submitMessage && (
        <div style={{ color: submitMessage.includes('Error') ? 'red' : 'green', marginTop: '15px', textAlign: 'center' }}>
          <p>{submitMessage}</p>
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

export default AddGuestForm;