import React, { useState, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { fetchTimeZone } from '../../Utilities/api';
import { CREDIT_COSTS } from '../../Utilities/creditCosts';
import './AddChartModal.css';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY;

function AddChartModal({ isOpen, onClose, userId, onSubmit }) {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);

  // UI state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFirstName('');
      setLastName('');
      setGender('');
      setPlaceOfBirth('');
      setLat('');
      setLon('');
      setDate('');
      setTime('');
      setUnknownTime(false);
      setFormErrors({});
      setSubmitError('');
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!gender) errors.gender = "Gender is required";
    if (!lat || !lon) errors.location = "Birth location is required";
    if (!date) errors.date = "Birth date is required";
    if (!unknownTime && !time) errors.time = "Birth time is required";
    return errors;
  };

  const handlePlaceSelect = (place) => {
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
    } catch (error) {
      console.error("Error processing place selection:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    try {
      // Calculate timezone offset
      const timeForTimezone = unknownTime ? '12:00' : time;
      const dateTimeString = `${date}T${timeForTimezone}:00`;
      const dateTime = new Date(dateTimeString);
      const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
      const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

      // Prepare guest data
      const guestData = {
        ownerUserId: userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: date,
        placeOfBirth,
        time: unknownTime ? 'unknown' : time,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        tzone: parseFloat(totalOffsetHours),
        gender,
        unknownTime
      };

      // Close modal immediately and let parent handle the API call
      onClose();
      onSubmit(guestData);
    } catch (error) {
      console.error('Error preparing guest data:', error);
      setSubmitError(error.message || 'Failed to prepare chart data. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header__text">
            <h2>Add Birth Chart</h2>
            <p className="modal-subtitle">Costs {CREDIT_COSTS.GUEST_CHART} credit</p>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Name fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                disabled={isSubmitting}
                className={formErrors.firstName ? 'error' : ''}
              />
              {formErrors.firstName && (
                <span className="field-error">{formErrors.firstName}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                disabled={isSubmitting}
                className={formErrors.lastName ? 'error' : ''}
              />
              {formErrors.lastName && (
                <span className="field-error">{formErrors.lastName}</span>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={isSubmitting}
              className={formErrors.gender ? 'error' : ''}
            >
              <option value="">Select gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="nonbinary">Non-binary</option>
            </select>
            {formErrors.gender && (
              <span className="field-error">{formErrors.gender}</span>
            )}
          </div>

          {/* Birth Location */}
          <div className="form-group">
            <label htmlFor="location">Birth Location</label>
            {isGoogleLoaded ? (
              <Autocomplete
                apiKey={GOOGLE_API}
                onPlaceSelected={handlePlaceSelect}
                options={{ types: ['(cities)'] }}
                placeholder="City, Country"
                disabled={isSubmitting}
                className={`location-input ${formErrors.location ? 'error' : ''}`}
              />
            ) : (
              <input
                type="text"
                placeholder="Loading location search..."
                disabled
                className="location-input"
              />
            )}
            {formErrors.location && (
              <span className="field-error">{formErrors.location}</span>
            )}
          </div>

          {/* Birth Date */}
          <div className="form-group">
            <label htmlFor="date">Birth Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
              className={formErrors.date ? 'error' : ''}
            />
            {formErrors.date && (
              <span className="field-error">{formErrors.date}</span>
            )}
          </div>

          {/* Birth Time */}
          <div className="form-group">
            <label>Birth Time</label>
            <div className="time-row">
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
                disabled={isSubmitting}
                className="time-select"
              >
                <option value="known">Known Time</option>
                <option value="unknown">Unknown</option>
              </select>
              {!unknownTime && (
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={isSubmitting}
                  className={`time-input ${formErrors.time ? 'error' : ''}`}
                />
              )}
            </div>
            {formErrors.time && (
              <span className="field-error">{formErrors.time}</span>
            )}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="submit-error">{submitError}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Chart...' : 'Create Birth Chart'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddChartModal;
