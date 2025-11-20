import React from 'react';
import { useNavigate } from 'react-router-dom';
import stelliumIcon from '../assets/StelliumIcon.svg';
import UserSignUpForm from '../UI/landingPage/UserSignUpForm';
import './signUpPage.css';

const SignUpPage = () => {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="signup-page">
            {/* Back button */}
            <button className="back-button" onClick={handleBackToHome}>
                ← Back to Home
            </button>

            <div className="signup-container">
                {/* Header */}
                <div className="signup-header">
                    <img className="signup-logo" src={stelliumIcon} alt="Stellium logo" />
                    <h1 className="signup-title">Create Your Birth Chart and Get A Short Personality Overview</h1>
                    <p className="signup-subtitle">
                        Enter your birth information to unlock your personalized astrological insights
                    </p>
                </div>

                {/* Sign up form */}
                <div className="signup-form-container">
                    <UserSignUpForm />
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;
