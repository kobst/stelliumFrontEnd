import React, { useState, useEffect } from 'react';
import Autocomplete from 'react-google-autocomplete';
import {
  fetchTimeZone,
  getProfilePhotoPresignedUrl,
  uploadProfilePhotoToS3,
  confirmProfilePhotoUpload
} from '../../Utilities/api';
import useSubjectCreation from '../../hooks/useSubjectCreation';
import '../landingPage/UserSignUpForm.css';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY

const AddCelebrityForm = ({ onCelebrityAdded }) => {
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const { createCelebrity, loading, error } = useSubjectCreation();

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
    const [workflowStatus, setWorkflowStatus] = useState(null);

    // Profile photo state
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoError, setPhotoError] = useState(null);

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

    // Photo validation constants
    const VALID_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const MAX_PHOTO_SIZE_MB = 5;
    const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

    const handlePhotoSelect = (e) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setPhotoError(null);

      // Validate file type
      if (!VALID_PHOTO_TYPES.includes(selectedFile.type)) {
        setPhotoError('Please upload a JPEG, PNG, GIF, or WebP image');
        setPhotoFile(null);
        setPhotoPreview(null);
        return;
      }

      // Validate file size
      if (selectedFile.size > MAX_PHOTO_SIZE_BYTES) {
        setPhotoError(`File size must be less than ${MAX_PHOTO_SIZE_MB}MB`);
        setPhotoFile(null);
        setPhotoPreview(null);
        return;
      }

      setPhotoFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    };

    const clearPhoto = () => {
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoError(null);
    };


    const handleSubmit = async (event) => {
      event.preventDefault();
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors({});
      setSuccessMessage('');
      setWorkflowStatus(null);

      try {
        // Calculate timezone offset
        const timeForTimezone = unknownTime ? '12:00' : time;
        const dateTimeString = `${date}T${timeForTimezone}:00`;
        const dateTime = new Date(dateTimeString);
        const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
        const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

        // Prepare data for direct API
        const celebrityData = {
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

        console.log('Creating celebrity with direct API:', celebrityData);
        const result = await createCelebrity(celebrityData);
        
        if (result.success) {
          const celebId = result.userId || result.celeb?._id;

          // Upload photo if one was selected (using presigned URL approach)
          if (photoFile && celebId) {
            setPhotoUploading(true);
            try {
              console.log('Step 1: Getting presigned URL for celebrity:', celebId);
              const { uploadUrl, photoKey } = await getProfilePhotoPresignedUrl(celebId, photoFile.type);

              console.log('Step 2: Uploading to S3');
              await uploadProfilePhotoToS3(uploadUrl, photoFile);

              console.log('Step 3: Confirming upload');
              await confirmProfilePhotoUpload(celebId, photoKey);

              console.log('Profile photo uploaded successfully');
            } catch (photoErr) {
              console.error('Error uploading profile photo:', photoErr);
              setPhotoError('Celebrity created but photo upload failed. You can add the photo later.');
            } finally {
              setPhotoUploading(false);
            }
          }

          // Show success message
          setSuccessMessage(`${firstName} ${lastName} has been added successfully!`);
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
          clearPhoto();

          // Notify parent component to refresh celebrity table
          if (onCelebrityAdded) {
            onCelebrityAdded();
          }
        }
        
      } catch (error) {
        console.error('Error creating celebrity:', error);
        setFormErrors({ submit: error.message || 'Error creating celebrity. Please try again.' });
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

          {/* Profile Photo Upload */}
          <div style={{ ...formGroupStyle, alignItems: 'flex-start' }}>
            <label style={labelStyle}>Profile Photo</label>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Photo Preview */}
                {photoPreview && (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid white'
                      }}
                    />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      disabled={loading || photoUploading}
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
                {/* File Input */}
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handlePhotoSelect}
                    disabled={loading || photoUploading}
                    style={{
                      padding: '5px',
                      border: '1px solid white',
                      borderRadius: '3px',
                      backgroundColor: 'transparent',
                      color: 'white',
                      fontSize: '12px',
                      cursor: loading || photoUploading ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <p style={{ color: '#888', fontSize: '11px', marginTop: '5px', marginBottom: 0 }}>
                    Optional. JPEG, PNG, GIF, WebP (max 5MB)
                  </p>
                </div>
              </div>
              {photoError && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', marginBottom: 0 }}>
                  {photoError}
                </p>
              )}
            </div>
          </div>

          <div style={formGroupStyle}>
            <input
              className="email-submit-btn"
              type="submit"
              value={loading ? "Adding..." : photoUploading ? "Uploading Photo..." : "Add Celebrity"}
              style={{
                ...inputStyle,
                width: 'auto',
                cursor: (loading || photoUploading) ? 'not-allowed' : 'pointer',
                backgroundColor: (loading || photoUploading) ? '#ccc' : 'white',
                color: 'black',
                fontWeight: 'bold',
                opacity: (loading || photoUploading) ? 0.6 : 1
              }}
              disabled={loading || photoUploading}
            />
          </div>
        </form>
        
        {/* Loading Status Display */}
        {(loading || photoUploading) && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '6px',
            margin: '15px 0',
            textAlign: 'center'
          }}>
            <p style={{ color: 'white', margin: '0' }}>
              {photoUploading
                ? 'Uploading profile photo to S3...'
                : 'Creating celebrity profile and generating overview...'}
            </p>
          </div>
        )}
        
        {successMessage && (
          <div style={{ color: 'green', marginTop: '15px', textAlign: 'center' }}>
            <p>{successMessage}</p>
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
  
  export default AddCelebrityForm;