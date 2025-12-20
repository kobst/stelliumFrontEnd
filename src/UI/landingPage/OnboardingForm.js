import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Autocomplete from 'react-google-autocomplete';
import useStore from '../../Utilities/store';
import { useAuth } from '../../context/AuthContext';
import { fetchTimeZone } from '../../Utilities/api';
import './UserSignUpForm.css';

const GOOGLE_API = process.env.REACT_APP_GOOGLE_API_KEY;

const OnboardingForm = () => {
    const navigate = useNavigate();
    const { firebaseUser } = useAuth();
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

    // Parse display name from Firebase
    const parseDisplayName = (displayName) => {
        if (!displayName) return { first: '', last: '' };
        const parts = displayName.trim().split(' ');
        if (parts.length === 1) {
            return { first: parts[0], last: '' };
        }
        return {
            first: parts[0],
            last: parts.slice(1).join(' ')
        };
    };

    const parsedName = parseDisplayName(firebaseUser?.displayName);

    const [firstName, setFirstName] = useState(parsedName.first);
    const [lastName, setLastName] = useState(parsedName.last);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [unknownTime, setUnknownTime] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const setUserData = useStore(state => state.setUserData);

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
        setIsSubmitting(true);

        try {
            // Calculate timezone offset
            const timeForTimezone = unknownTime ? '12:00' : time;
            const dateTimeString = `${date}T${timeForTimezone}:00`;
            const dateTime = new Date(dateTimeString);
            const epochTimeSeconds = Math.floor(dateTime.getTime() / 1000);
            const totalOffsetHours = await fetchTimeZone(lat, lon, epochTimeSeconds);

            // Prepare data for confirmation page - include firebaseUid
            const userData = {
                firebaseUid: firebaseUser.uid,
                firstName,
                lastName,
                email: firebaseUser.email,
                dateOfBirth: date,
                placeOfBirth,
                time: unknownTime ? 'unknown' : time,
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                tzone: parseFloat(totalOffsetHours),
                gender,
                unknownTime
            };

            // Store form data in Zustand
            setUserData(userData);

            // Navigate to confirmation page
            navigate('/onboarding/confirmation');

        } catch (error) {
            console.error('Error preparing user data:', error);
            setFormErrors({ submit: error.message || 'An error occurred while preparing your profile. Please try again.' });
            setIsSubmitting(false);
        }
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
        color: '#ffffff',
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
                <h2 style={headerStyle}>
                    Welcome, {firebaseUser?.displayName || firebaseUser?.email}!
                </h2>

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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                                width: '290px'
                            }}
                            placeholder="City, Country"
                            className="input-dark-placeholder"
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
                    <label style={labelStyle}>on this date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={inputStyle}
                        className="input-dark-placeholder"
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
                            color: '#ffffff',
                            border: '1px solid white',
                            padding: '5px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            marginRight: '8px'
                        }}
                        className="input-dark-placeholder"
                        disabled={isSubmitting}
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
                            className="input-dark-placeholder"
                            disabled={isSubmitting}
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
                            color: '#ffffff',
                            border: '1px solid white',
                            padding: '5px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                        className="input-dark-placeholder"
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
                        value={isSubmitting ? "Please wait..." : "Create My Birth Chart"}
                        disabled={isSubmitting}
                        style={{
                            ...inputStyle,
                            width: 'auto',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            backgroundColor: 'white',
                            color: 'black',
                            fontWeight: 'bold',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    />
                </div>
            </form>
            {Object.keys(formErrors).length > 0 && (
                <div style={{ color: 'red', marginTop: '15px' }}>
                    {Object.values(formErrors).map((err, index) => (
                        <p key={index}>{err}</p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OnboardingForm;
