import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import stelliumIcon from '../assets/StelliumIcon.svg';
import OnboardingForm from '../UI/landingPage/OnboardingForm';
import './signUpPage.css';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const { firebaseUser, stelliumUser, loading, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/login', { replace: true });
    };

    // Redirect if not authenticated or already has profile
    useEffect(() => {
        if (!loading) {
            if (!firebaseUser) {
                // Not authenticated - go to login
                navigate('/login', { replace: true });
            } else if (stelliumUser) {
                // Already has profile - go to dashboard
                navigate(`/dashboard/${stelliumUser._id}`, { replace: true });
            }
        }
    }, [firebaseUser, stelliumUser, loading, navigate]);

    const handleBackToHome = () => {
        navigate('/');
    };

    if (loading || !firebaseUser) {
        return (
            <div className="signup-page">
                <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
                    <div className="loading-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255, 255, 255, 0.2)',
                        borderTopColor: '#d138d4',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }}></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="signup-page">
            {/* Navigation buttons */}
            <div className="onboarding-nav">
                <button className="back-button" onClick={handleBackToHome}>
                    Back to Home
                </button>
                <button className="logout-button" onClick={handleLogout}>
                    Log Out
                </button>
            </div>

            <div className="signup-container">
                {/* Header */}
                <div className="signup-header">
                    <img className="signup-logo" src={stelliumIcon} alt="Stellium logo" />
                    <h1 className="signup-title">Complete Your Profile</h1>
                    <p className="signup-subtitle">
                        Enter your birth information to unlock your personalized astrological insights
                    </p>
                </div>

                {/* Onboarding form */}
                <div className="signup-form-container">
                    <OnboardingForm />
                </div>
            </div>
        </div>
    );
}

export default OnboardingPage;
