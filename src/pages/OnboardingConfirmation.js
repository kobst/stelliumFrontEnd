import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../Utilities/store';
import { useAuth } from '../context/AuthContext';
import useSubjectCreation from '../hooks/useSubjectCreation';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';

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

    const creationStarted = useRef(false);
    const [creationResult, setCreationResult] = useState(null);
    const [userId, setLocalUserId] = useState(null);
    const [overviewContent, setOverviewContent] = useState(null);
    const [birthChartData, setBirthChartData] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!firebaseUser) {
            navigate('/login', { replace: true });
        }
    }, [firebaseUser, navigate]);

    // Start user creation when component mounts
    useEffect(() => {
        if (userData && firebaseUser && !creationStarted.current) {
            creationStarted.current = true;

            const performCreation = async () => {
                try {
                    // Ensure firebaseUid is included
                    const userDataWithFirebase = {
                        ...userData,
                        firebaseUid: firebaseUser.uid
                    };

                    const result = await createUser(userDataWithFirebase);
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

                        // Refresh the auth context with the new user data
                        await refreshStelliumUser();
                    }
                } catch (error) {
                    console.error('Error creating user:', error);
                }
            };

            performCreation();
        }
    }, [userData, firebaseUser, createUser, setUserId, setUserPlanets, setUserHouses, setUserAspects, setSelectedUser, refreshStelliumUser]);

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
            <div style={{ padding: '20px' }}>
                <h1 style={{ color: 'white' }}>Error</h1>
                <p style={{ color: 'white' }}>No user data found. Please complete the onboarding form.</p>
                <button onClick={() => navigate('/onboarding')}>Go to Onboarding</button>
            </div>
        );
    }

    const isCreating = loading;
    const hasOverview = overviewContent && overviewContent.trim().length > 0;
    const hasBirthChartData = birthChartData && Object.keys(birthChartData).length > 0;
    const isComplete = creationResult?.success && !loading;

    const handleGoToDashboard = () => {
        if (userId) {
            navigate(`/dashboard/${userId}`);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ color: 'white' }}>
                Welcome to Stellium, {userData?.firstName || firebaseUser?.displayName || 'User'}!
            </h1>
            <p style={{ color: 'white' }}>
                {isCreating ? 'Creating your profile...' : isComplete ? 'Your profile has been created successfully!' : 'Processing...'}
            </p>

            {/* Birth Date Display */}
            {userData?.dateOfBirth && (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    margin: '20px 0',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center'
                }}>
                    <p style={{
                        color: 'white',
                        margin: '0',
                        fontSize: '18px',
                        fontWeight: '500'
                    }}>
                        Birth Date: {new Date(userData.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            )}

            {/* Creating User Status */}
            {isCreating && (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    margin: '20px 0',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(139, 92, 246, 0.3)',
                        borderTop: '3px solid #8b5cf6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 15px auto'
                    }} />
                    <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>
                        Creating Your Profile & Overview...
                    </h3>
                    <p style={{ color: 'white', margin: '0' }}>
                        Generating your birth chart and personalized overview...
                    </p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div style={{
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    margin: '20px 0',
                    border: '1px solid rgba(255, 0, 0, 0.3)'
                }}>
                    <h3 style={{ color: '#ff6b6b', margin: '0 0 10px 0' }}>
                        {error.includes('Email already in use') ? 'Email Already Registered' : 'Error'}
                    </h3>
                    <p style={{ color: 'white', margin: '0 0 15px 0' }}>
                        {error.includes('Email already in use')
                            ? `An account with the email "${userData?.email}" already exists. This may mean you already have a profile.`
                            : error.includes('Invalid email format')
                                ? 'Please enter a valid email address.'
                                : error
                        }
                    </p>
                    {error.includes('Email already in use') && (
                        <button
                            onClick={() => refreshStelliumUser().then(() => {
                                // Try to get user ID from the refresh
                                navigate('/login');
                            })}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Try Logging In
                        </button>
                    )}
                </div>
            )}


            {/* Birth Chart Data (table) */}
            {hasBirthChartData && (
                <div style={{ margin: '20px 0' }}>
                    <h3 style={{ color: 'white', marginBottom: '15px' }}>Your Birth Chart Data</h3>
                    <BirthChartSummaryTable
                        planets={birthChartData.planets || []}
                        houses={birthChartData.houses || []}
                        aspects={birthChartData.aspects || []}
                    />
                </div>
            )}

            {/* Generated Overview Display (short overview only) */}
            {hasOverview && (
                <div style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    margin: '20px 0',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                    <h2 style={{ color: '#a78bfa', margin: '0 0 15px 0' }}>
                        Your Personal Birth Chart Overview
                    </h2>
                    <p style={{
                        color: 'white',
                        lineHeight: '1.6',
                        margin: '0',
                        fontSize: '16px'
                    }}>
                        {overviewContent}
                    </p>
                </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                {isComplete && userId && (
                    <button
                        onClick={handleGoToDashboard}
                        style={{
                            padding: '15px 30px',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Go to My Dashboard
                    </button>
                )}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '15px 30px',
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: '1px solid white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default OnboardingConfirmation;
