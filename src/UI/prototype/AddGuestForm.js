import React, { useState, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import useStore from '../../Utilities/store';
import { fetchTimeZone } from '../../Utilities/api';
import useSubjectCreation from '../../hooks/useSubjectCreation';
import './AddGuestForm.css';

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
      console.log("Selected location:", { lat, lon, address: place.formatted_address });
      
      setLat(lat);
      setLon(lon);
      setPlaceOfBirth(place.formatted_address);
      setFormErrors(prev => ({ ...prev, location: null }));
    } catch (error) {
      console.error("Error processing place selection:", error);
    }
  };

  return (
    <div className="add-guest-form">
      <form onSubmit={handleSubmit}>
        <h2 className="add-guest-form__title">{title}</h2>

        <div className="add-guest-form__row add-guest-form__row--two-col">
          <div className="add-guest-form__field">
            <label className="add-guest-form__label">First Name</label>
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="add-guest-form__input"
              disabled={loading}
            />
          </div>
          <div className="add-guest-form__field">
            <label className="add-guest-form__label">Last Name</label>
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="add-guest-form__input"
              disabled={loading}
            />
          </div>
        </div>

        <div className="add-guest-form__field">
          <label htmlFor="location" className="add-guest-form__label">Birth Location</label>
          {isGoogleLoaded ? (
            <Autocomplete
              apiKey={GOOGLE_API}
              onPlaceSelected={handlePlaceSelected}
              options={{
                types: ['(cities)']
              }}
              className="add-guest-form__input"
              placeholder="City, Country"
              disabled={loading}
            />
          ) : (
            <input
              type="text"
              className="add-guest-form__input"
              placeholder="Loading location search..."
              disabled
            />
          )}
        </div>

        <div className="add-guest-form__field">
          <label className="add-guest-form__label">Birth Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="add-guest-form__input"
            disabled={loading}
          />
        </div>

        <div className="add-guest-form__field">
          <label className="add-guest-form__label">Birth Time</label>
          <div className="add-guest-form__time-row">
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
            className="add-guest-form__input add-guest-form__input--time-mode"
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
              className="add-guest-form__input add-guest-form__input--time"
              disabled={loading}
            />
          )}
          </div>
        </div>

        <div className="add-guest-form__field">
          <label className="add-guest-form__label">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="add-guest-form__input"
            disabled={loading}
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
          </select>
        </div>

        <div className="add-guest-form__actions">
          <input
            className="add-guest-form__submit-btn"
            type="submit"
            value={loading ? "Adding..." : "Add Profile"}
            disabled={loading}
          />
        </div>
      </form>
      
      {/* Loading Status Display */}
      {loading && (
        <div className="add-guest-form__status">
          <p>Creating guest profile and generating overview...</p>
        </div>
      )}
      
      {submitMessage && (
        <div className={`add-guest-form__message ${submitMessage.includes('Error') ? 'add-guest-form__message--error' : 'add-guest-form__message--success'}`}>
          <p>{submitMessage}</p>
        </div>
      )}
      
      {(Object.keys(formErrors).length > 0 || error) && (
        <div className="add-guest-form__message add-guest-form__message--error">
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
