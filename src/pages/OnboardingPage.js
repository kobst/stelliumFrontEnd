import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OnboardingForm from '../UI/landingPage/OnboardingForm';
import InkNav from '../UI/ink/InkNav';
import '../styles/ink.css';
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
            <div className="ink-page signup-page">
                <InkNav variant="marketing" marketingLinks={[]} />
                <div className="onboarding-loading" aria-live="polite" aria-busy="true">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
                <footer className="onboarding-footer">
                    <div className="ink-wrap onboarding-colophon">
                        <span className="onboarding-colophon__wordmark">Stellium ✳</span>
                        <a href="/privacy-policy">Privacy</a>
                        <a href="/terms-of-service">Terms</a>
                        <span>© 2026</span>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="ink-page signup-page">
            <InkNav variant="marketing" marketingLinks={[]} />

            <main className="onboarding-main">
                <div className="onboarding-shell ink-wrap">
                    <div className="onboarding-nav">
                        <button className="back-button" onClick={handleBackToHome}>
                            ← Back to Home
                        </button>
                        <button className="logout-button" onClick={handleLogout}>
                            Log Out
                        </button>
                    </div>

                    <div className="signup-layout">
                        <header className="signup-header">
                            <span className="ink-eyebrow">Your celestial coordinates</span>
                            <h1 className="signup-title">Complete your <em>profile.</em></h1>
                            <p className="signup-subtitle">
                                Enter your birth information to unlock your personalized astrological insights
                            </p>
                            <aside className="onboarding-note" aria-label="A note about birth details">
                                The more precise your details, the clearer your chart becomes.
                            </aside>
                        </header>

                        <div className="signup-form-container ink-card">
                            <OnboardingForm />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="onboarding-footer">
                <div className="ink-wrap onboarding-colophon">
                    <span className="onboarding-colophon__wordmark">Stellium ✳</span>
                    <a href="/privacy-policy">Privacy</a>
                    <a href="/terms-of-service">Terms</a>
                    <span>© 2026</span>
                </div>
            </footer>
        </div>
    );
}

export default OnboardingPage;
