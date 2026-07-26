import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OnboardingForm from '../UI/landingPage/OnboardingForm';
import InkNav from '../UI/ink/InkNav';
import { loadTrialSession, claimTrialReading, clearTrialSession } from '../Utilities/trialApi';
import '../styles/ink.css';
import './signUpPage.css';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const { firebaseUser, stelliumUser, loading, signOut, refreshStelliumUser } = useAuth();
    const [trialSession, setTrialSession] = useState(null);
    const [claiming, setClaiming] = useState(false);
    const [claimError, setClaimError] = useState('');

    useEffect(() => {
        setTrialSession(loadTrialSession());
    }, []);

    // Claim the chart created anonymously on /try into this new account —
    // carries over the birth chart, overview, and trial chat history.
    const handleClaimTrial = async () => {
        setClaimError('');
        setClaiming(true);
        try {
            await claimTrialReading(trialSession, null, firebaseUser?.email || undefined);
            setTrialSession(null);
            // The redirect effect below navigates once stelliumUser lands
            await refreshStelliumUser();
        } catch (error) {
            setClaimError(error?.message || 'Could not restore your reading. You can enter your details below instead.');
        } finally {
            setClaiming(false);
        }
    };

    const handleDismissTrial = () => {
        clearTrialSession();
        setTrialSession(null);
    };

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

                        {trialSession && (
                            <div className="ink-card onboarding-trial-claim" style={{ padding: '20px 24px', marginBottom: '20px' }}>
                                <p style={{ margin: 0 }}>
                                    <strong>Welcome back{trialSession.firstName ? `, ${trialSession.firstName}` : ''}.</strong>{' '}
                                    Keep the chart and reading you created — no need to re-enter anything.
                                </p>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                                    <button className="ink-btn ink-btn--navy" onClick={handleClaimTrial} disabled={claiming}>
                                        {claiming ? 'Restoring your reading…' : 'Continue with my chart ✳'}
                                    </button>
                                    <button className="ink-btn ink-btn--ghost" onClick={handleDismissTrial} disabled={claiming}>
                                        Start fresh instead
                                    </button>
                                </div>
                                {claimError && <p style={{ color: '#a03232', marginTop: '10px', marginBottom: 0 }}>{claimError}</p>}
                            </div>
                        )}

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
