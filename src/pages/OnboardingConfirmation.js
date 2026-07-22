import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../Utilities/store';
import { useAuth } from '../context/AuthContext';
import useSubjectCreation from '../hooks/useSubjectCreation';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';
import { formatCalendarDate } from '../Utilities/dateFormatting';
import { trackSignupCompleted, identifyUser } from '../Utilities/analytics';
import InkNav from '../UI/ink/InkNav';
import '../styles/ink.css';
import './OnboardingConfirmation.css';

const OnboardingConfirmation = () => {
    const navigate = useNavigate();
    const { firebaseUser, refreshStelliumUser } = useAuth();

    const userData = useStore(state => state.userData);
    const setUserId = useStore(state => state.setUserId);
    const setSelectedUser = useStore(state => state.setSelectedUser);
    const setUserPlanets = useStore(state => state.setUserPlanets);
    const setUserHouses = useStore(state => state.setUserHouses);
    const setUserAspects = useStore(state => state.setUserAspects);

    const {
        createUser,
        loading,
        error,
        completeData
    } = useSubjectCreation();

    const creationInFlight = useRef(false);
    const [creationResult, setCreationResult] = useState(null);
    const [userId, setLocalUserId] = useState(null);
    const [overviewContent, setOverviewContent] = useState(null);
    const [birthChartData, setBirthChartData] = useState(null);
    const [creationAttempt, setCreationAttempt] = useState(0);

    // Redirect if not authenticated
    useEffect(() => {
        if (!firebaseUser) {
            navigate('/login', { replace: true });
        }
    }, [firebaseUser, navigate]);

    // Start user creation when component mounts
    useEffect(() => {
        if (!userData || !firebaseUser || creationInFlight.current || creationResult?.success) {
            return;
        }

        const performCreation = async () => {
            creationInFlight.current = true;
            try {
                const result = await createUser(userData);
                setCreationResult(result);

                // Store user data immediately (no polling needed)
                if (result.success) {
                    setUserId(result.userId);
                    setLocalUserId(result.userId);

                    // Store birth chart data from direct response
                    if (result.birthChart) {
                        setBirthChartData(result.birthChart);
                        setUserPlanets(result.birthChart.planets || []);
                        setUserHouses(result.birthChart.houses || []);
                        setUserAspects(result.birthChart.aspects || []);
                    }

                    // Store overview content from direct response
                    if (result.overview) {
                        setOverviewContent(result.overview);
                    }

                    // Set selected user for dashboard compatibility
                    setSelectedUser({
                        _id: result.userId,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        email: result.user.email,
                        kind: result.user.kind || 'accountSelf'
                    });

                    // Analytics: identify user and track signup
                    identifyUser(result.userId, {
                        email: result.user.email,
                        name: `${result.user.firstName} ${result.user.lastName}`,
                    });
                    trackSignupCompleted(result.userId, userData);

                    // Auto-navigate to birth chart dashboard view
                    await refreshStelliumUser();
                    navigate(`/dashboard/${result.userId}/chart/${result.userId}`, { replace: true });
                }
            } catch (creationError) {
                console.error('Error creating user:', creationError);
                setCreationResult(null);
            } finally {
                creationInFlight.current = false;
            }
        };

        performCreation();
    }, [creationAttempt, userData, firebaseUser, creationResult?.success, createUser, setUserId, setUserPlanets, setUserHouses, setUserAspects, setSelectedUser]);

    // Update local state when creation completes
    useEffect(() => {
        if (completeData?.subject && completeData?.analysis) {
            const subject = completeData.subject;
            const analysis = completeData.analysis;

            setLocalUserId(subject._id);
            setBirthChartData(subject.birthChart);
            setOverviewContent(analysis.interpretation?.basicAnalysis?.overview);
        }
    }, [completeData]);

    // Show error if no user data
    if (!userData) {
        return (
            <div className="ink-page onboarding-confirmation">
                <InkNav variant="marketing" marketingLinks={[]} />
                <main className="onboarding-confirmation__main ink-wrap">
                    <section className="onboarding-confirmation__card onboarding-confirmation__card--error ink-card">
                        <span className="ink-eyebrow">Something went astray</span>
                        <h1>Error</h1>
                        <p>No user data found. Please complete the onboarding form.</p>
                        <button className="ink-btn ink-btn--navy" onClick={() => navigate('/onboarding')}>Go to Onboarding</button>
                    </section>
                </main>
                <footer className="onboarding-confirmation__footer">
                    <div className="ink-wrap onboarding-confirmation__colophon">
                        <span className="onboarding-confirmation__wordmark">Stellium ✳</span>
                        <a href="/privacy-policy">Privacy</a>
                        <a href="/terms-of-service">Terms</a>
                        <span>© 2026</span>
                    </div>
                </footer>
            </div>
        );
    }

    const isCreating = loading;
    const hasOverview = overviewContent && overviewContent.trim().length > 0;
    const hasBirthChartData = birthChartData && Object.keys(birthChartData).length > 0;

    // Derive userId from multiple sources
    const effectiveUserId = userId ||
        creationResult?.userId ||
        creationResult?.user?._id ||
        completeData?.subject?._id;
    const isComplete = creationResult?.success && !loading;
    const canGoToDashboard = Boolean(isComplete && effectiveUserId);

    const handleRetryCreation = () => {
        if (loading) return;

        setCreationResult(null);
        setLocalUserId(null);
        setOverviewContent(null);
        setBirthChartData(null);
        setCreationAttempt((prev) => prev + 1);
    };

    const handleGoToDashboard = async () => {
        if (effectiveUserId) {
            // Refresh auth context so ProtectedRoute knows user has a profile
            await refreshStelliumUser();
            navigate(`/dashboard/${effectiveUserId}`);
        }
    };

    return (
        <div className="ink-page onboarding-confirmation">
            <InkNav variant="marketing" marketingLinks={[]} />

            <main className="onboarding-confirmation__main ink-wrap">
                <header className="onboarding-confirmation__header">
                    <span className="ink-eyebrow">Your chart is taking shape</span>
                    <h1>
                        Welcome to Stellium, <em>{userData?.firstName || firebaseUser?.displayName || 'User'}.</em>
                    </h1>
                    <p>
                        {isCreating ? 'Creating your profile...' : isComplete ? 'Your profile has been created successfully!' : error ? 'Profile creation failed. Please retry.' : 'Processing...'}
                    </p>
                </header>

                {/* Birth Date Display */}
                {userData?.dateOfBirth && (
                    <div className="onboarding-confirmation__birth-date ink-card">
                        <span className="ink-eyebrow">Birth date</span>
                        <p>
                        Birth Date: {formatCalendarDate(userData.dateOfBirth, 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                        </p>
                    </div>
                )}

                {/* Creating User Status */}
                {isCreating && (
                    <section className="onboarding-confirmation__status ink-card" aria-live="polite" aria-busy="true">
                        <div className="onboarding-confirmation__spinner" />
                        <h3>Creating Your Profile &amp; Overview...</h3>
                        <p>Generating your birth chart and personalized overview...</p>
                    </section>
                )}

                {/* Error Display */}
                {error && (
                    <section className="onboarding-confirmation__error ink-card" role="alert">
                        <h3>
                        {error.includes('Email already in use') ? 'Email Already Registered' : 'Error'}
                        </h3>
                        <p>
                        {error.includes('Email already in use')
                            ? `An account with the email "${userData?.email}" already exists. This may mean you already have a profile.`
                            : error.includes('Invalid email format')
                                ? 'Please enter a valid email address.'
                                : error
                        }
                        </p>
                        {error.includes('Email already in use') && (
                            <button
                                className="ink-btn ink-btn--navy"
                                onClick={() => refreshStelliumUser().then(() => {
                                    // Try to get user ID from the refresh
                                    navigate('/login');
                                })}
                            >
                                Try Logging In
                            </button>
                        )}
                        {!error.includes('Email already in use') && (
                            <button
                                className="ink-btn ink-btn--navy"
                                onClick={handleRetryCreation}
                                disabled={loading}
                            >
                                {loading ? 'Retrying...' : 'Retry Profile Creation'}
                            </button>
                        )}
                    </section>
                )}


            {/* Birth Chart Data (table) */}
                {hasBirthChartData && (
                    <section className="onboarding-confirmation__chart-data">
                        <h3>Your Birth Chart Data</h3>
                    <BirthChartSummaryTable
                        planets={birthChartData.planets || []}
                        houses={birthChartData.houses || []}
                        aspects={birthChartData.aspects || []}
                    />
                    </section>
                )}

            {/* Generated Overview Display (short overview only) */}
                {hasOverview && (
                    <section className="onboarding-confirmation__overview ink-card">
                        <span className="ink-eyebrow">First reading</span>
                        <h2>Your Personal Birth Chart Overview</h2>
                        <p>{overviewContent}</p>
                    </section>
                )}

            {/* Navigation Buttons */}
                <div className="onboarding-confirmation__actions">
                    {canGoToDashboard && (
                        <button
                            className="ink-btn ink-btn--navy"
                            onClick={handleGoToDashboard}
                            disabled={!canGoToDashboard}
                        >
                            Go to My Dashboard
                        </button>
                    )}
                </div>
            </main>

            <footer className="onboarding-confirmation__footer">
                <div className="ink-wrap onboarding-confirmation__colophon">
                    <span className="onboarding-confirmation__wordmark">Stellium ✳</span>
                    <a href="/privacy-policy">Privacy</a>
                    <a href="/terms-of-service">Terms</a>
                    <span>© 2026</span>
                </div>
            </footer>
        </div>
    );
};

export default OnboardingConfirmation;
