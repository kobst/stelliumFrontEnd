import React from 'react';
import { useNavigate } from 'react-router-dom';
import lightLogo from '../assets/Light logo.png';
import UserSignUpForm from '../UI/landingPage/UserSignUpForm';
import './signUpPage.css';

const SignUpPage = () => {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                {/* Back button */}
                <button className="back-button" onClick={handleBackToHome}>
                    ← Back to Home
                </button>

                {/* Header */}
                <div className="signup-header">
                    <img className="signup-logo" src={lightLogo} alt="Stellium logo" />
                    <h1 className="signup-title">Create Your Birth Chart</h1>
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
