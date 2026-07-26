import React, { useState } from 'react';
import {
  fetchTimeZone,
  getProfilePhotoPresignedUrl,
  uploadProfilePhotoToS3,
  confirmProfilePhotoUpload
} from '../../Utilities/api';
import useSubjectCreation from '../../hooks/useSubjectCreation';
import GooglePlaceAutocomplete from '../shared/GooglePlaceAutocomplete';
import './AddCelebrityForm.css';

const AddCelebrityForm = ({ onCelebrityAdded }) => {
    const { createCelebrity, startFullAnalysisWorkflowAdmin, loading, error } = useSubjectCreation();

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
    const [locationInputKey, setLocationInputKey] = useState(0);

    // Profile photo state
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoError, setPhotoError] = useState(null);

    const validateForm = () => {
      const errors = {};
      if (!firstName.trim()) errors.firstName = "First name is required";
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

          // Auto-start the full birth chart analysis (admin, credit-free) so
          // creating a celebrity is a single step. Fail-soft: the celebrity is
          // still created if the analysis fails to kick off.
          let analysisStarted = false;
          if (celebId) {
            try {
              await startFullAnalysisWorkflowAdmin(celebId);
              analysisStarted = true;
            } catch (analysisErr) {
              console.error('Celebrity created but full analysis failed to start:', analysisErr);
            }
          }

          // Show success message
          const celebName = [firstName, lastName].map(p => p.trim()).filter(Boolean).join(' ');
          setSuccessMessage(
            analysisStarted
              ? `${celebName} added — full birth chart analysis started (running in the background).`
              : `${celebName} added, but the full analysis didn't start. Open the celebrity and start it from its dashboard.`
          );
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
          setLocationInputKey((current) => current + 1);
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

    const handlePlaceSelect = ({ formattedAddress, lat, lon }) => {
        try {
            if (lat == null || lon == null) {
                console.error('Invalid place object or missing coordinates:', { formattedAddress, lat, lon });
                return;
            }

            setLat(lat);
            setLon(lon);
            setPlaceOfBirth(formattedAddress);
        } catch (error) {
            console.error('Error processing place selection:', error);
        }
    };

    return (
      <section className="admin-card add-celebrity-form">
        <form className="admin-form" onSubmit={handleSubmit}>
        <h2 className="admin-section-title">Add New Celebrity</h2>

          <div className="add-celebrity-form__group">
            <label className="add-celebrity-form__label">Name</label>
            <div className="add-celebrity-form__fields">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="admin-input"
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Last Name (optional)"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="admin-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="add-celebrity-form__group">
            <label htmlFor="location" className="add-celebrity-form__label">Born in</label>
            <div className="add-celebrity-form__location">
              <GooglePlaceAutocomplete
                key={locationInputKey}
                onPlaceSelected={handlePlaceSelect}
                className="celebrity-location-autocomplete admin-input"
                placeholder="City, Country"
                disabled={loading}
              />
            </div>
          </div>

          <div className="add-celebrity-form__group">
            <label className="add-celebrity-form__label">Born on</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="admin-input"
              disabled={loading}
            />
          </div>

          <div className="add-celebrity-form__group">
            <label className="add-celebrity-form__label">At this time</label>
            <div className="add-celebrity-form__fields">
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
                className="admin-select"
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
                  className="admin-input"
                  disabled={loading}
                />
              )}
            </div>
          </div>

          <div className="add-celebrity-form__group">
            <label className="add-celebrity-form__label">Gender/Sex</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="admin-select"
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="nonbinary">Non-binary</option>
            </select>
          </div>

          {/* Profile Photo Upload */}
          <div className="add-celebrity-form__group add-celebrity-form__group--top">
            <label className="add-celebrity-form__label">Profile Photo</label>
            <div>
              <div className="add-celebrity-form__photo-row">
                {/* Photo Preview */}
                {photoPreview && (
                  <div className="add-celebrity-form__preview">
                    <img
                      src={photoPreview}
                      alt="Preview"
                    />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      disabled={loading || photoUploading}
                      className="add-celebrity-form__remove-photo"
                      aria-label="Remove selected profile photo"
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
                    className="admin-input add-celebrity-form__file-input"
                  />
                  <p className="add-celebrity-form__help">
                    Optional. JPEG, PNG, GIF, WebP (max 5MB)
                  </p>
                </div>
              </div>
              {photoError && (
                <p className="add-celebrity-form__error">
                  {photoError}
                </p>
              )}
            </div>
          </div>

          <div className="add-celebrity-form__actions">
            <button
              className="admin-btn admin-btn--primary"
              type="submit"
              disabled={loading || photoUploading}
            >
              {loading ? 'Adding...' : photoUploading ? 'Uploading Photo...' : 'Add Celebrity'}
            </button>
          </div>
        </form>
        
        {/* Loading Status Display */}
        {(loading || photoUploading) && (
          <div className="admin-status">
            <p style={{ margin: 0 }}>
              {photoUploading
                ? 'Uploading profile photo to S3...'
                : 'Creating celebrity profile and generating overview...'}
            </p>
          </div>
        )}
        
        {successMessage && (
          <div className="admin-status admin-status--success">
            <p>{successMessage}</p>
          </div>
        )}
        
        {(Object.keys(formErrors).length > 0 || error) && (
          <div className="admin-status admin-status--danger">
            {Object.values(formErrors).map((err, index) => (
              <p key={index}>{err}</p>
            ))}
            {error && <p>{error}</p>}
          </div>
        )}
      </section>
    );
  };
  
  export default AddCelebrityForm;
