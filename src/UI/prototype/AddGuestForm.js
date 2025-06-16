import React, { useState, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import useStore from '../../Utilities/store';
import { createGuestSubject, createGuestSubjectUnknownTime, fetchTimeZone } from '../../Utilities/api';
import './AddGuestForm.css';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY;

const AddGuestForm = ({ onGuestAdded }) => {
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

      setSubmitMessage('Guest added successfully!');
      
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
      setSubmitMessage('Error creating guest. Please try again.');
    } finally {
      setIsSubmitting(false);
      // Clear message after 3 seconds
      setTimeout(() => {
        setSubmitMessage('');
      }, 3000);
    }
  };

  const handlePlaceSelected = (place) => {
    if (place.geometry) {
      setLat(place.geometry.location.lat());
      setLon(place.geometry.location.lng());
      setPlaceOfBirth(place.formatted_address);
      setFormErrors(prev => ({ ...prev, location: null }));
    }
  };

  const inputStyle = {
    color: '#5116b5',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
    fontSize: '16px'
  };

  const labelStyle = {
    color: 'white',
    marginBottom: '5px',
    display: 'block',
    fontWeight: 'bold'
  };

  const errorStyle = {
    color: '#ff6b6b',
    fontSize: '14px',
    marginTop: '5px'
  };

  return (
    <div className="add-guest-form" style={{ 
      backgroundColor: 'rgba(81, 22, 181, 0.8)', 
      padding: '30px', 
      borderRadius: '10px',
      marginTop: '20px',
      maxWidth: '600px',
      margin: '20px auto'
    }}>
      <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Add New Guest</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={inputStyle}
          />
          {formErrors.firstName && <div style={errorStyle}>{formErrors.firstName}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={inputStyle}
          />
          {formErrors.lastName && <div style={errorStyle}>{formErrors.lastName}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Gender/Sex</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {formErrors.gender && <div style={errorStyle}>{formErrors.gender}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Birth Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
          {formErrors.date && <div style={errorStyle}>{formErrors.date}</div>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={unknownTime}
              onChange={(e) => setUnknownTime(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            Birth time unknown
          </label>
          {!unknownTime && (
            <>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={inputStyle}
              />
              {formErrors.time && <div style={errorStyle}>{formErrors.time}</div>}
            </>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Place of Birth</label>
          {isGoogleLoaded ? (
            <Autocomplete
              apiKey={GOOGLE_API}
              onPlaceSelected={handlePlaceSelected}
              types={['(cities)']}
              placeholder="Enter place of birth"
              style={inputStyle}
            />
          ) : (
            <input
              type="text"
              placeholder="Loading Google Places..."
              disabled
              style={inputStyle}
            />
          )}
          {formErrors.location && <div style={errorStyle}>{formErrors.location}</div>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting ? '#ccc' : 'white',
            color: '#5116b5',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            width: '100%',
            marginTop: '20px'
          }}
        >
          {isSubmitting ? 'Adding Guest...' : 'Add Guest'}
        </button>

        {submitMessage && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '5px',
            textAlign: 'center',
            backgroundColor: submitMessage.includes('Error') ? '#ff6b6b' : '#4CAF50',
            color: 'white'
          }}>
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddGuestForm;