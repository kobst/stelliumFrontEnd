import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../Utilities/store';
import useSubjectCreation from '../hooks/useSubjectCreation';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';

const ConfirmationV2 = () => {
    const navigate = useNavigate();
    
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
        workflowId, 
        status, 
        isCompleted,
        checkStatus,
        getCompleteData
    } = useSubjectCreation();
    
    const creationStarted = useRef(false);
    const [userId, setLocalUserId] = useState(null);
    const [overviewContent, setOverviewContent] = useState(null);
    const [birthChartData, setBirthChartData] = useState(null);

    // Handle workflow completion - defined early to avoid hoisting issues
    const handleWorkflowCompletion = useCallback(async () => {
        if (!status?.userId || !workflowId) return;

        try {
            const data = await getCompleteData(status.userId, workflowId);
            
            if (data?.subject && data?.analysis) {
                // Store user ID
                const createdUserId = data.subject._id;
                setLocalUserId(createdUserId);
                setUserId(createdUserId);
                
                // Store birth chart data
                const birthChart = data.subject.birthChart;
                if (birthChart) {
                    setBirthChartData(birthChart);
                    setUserPlanets(birthChart.planets || []);
                    setUserHouses(birthChart.houses || []);
                    setUserAspects(birthChart.aspects || []);
                }
                
                // Store overview content
                const overview = data.analysis?.interpretation?.basicAnalysis?.overview;
                if (overview) {
                    setOverviewContent(overview);
                }
                
                // Set selected user for dashboard compatibility
                setSelectedUser({
                    _id: createdUserId,
                    firstName: data.subject.firstName,
                    lastName: data.subject.lastName,
                    email: data.subject.email,
                    kind: data.subject.kind || 'accountSelf'
                });
                
                console.log('Complete data loaded successfully');
            }
        } catch (error) {
            console.error('Error fetching complete data:', error);
        }
    }, [status?.userId, workflowId, getCompleteData, setUserId, setUserPlanets, setUserHouses, setUserAspects, setSelectedUser]);

    // Start user creation when component mounts
    useEffect(() => {
        if (userData && !creationStarted.current && !workflowId) {
            console.log('Starting user creation with data:', userData);
            creationStarted.current = true;
            createUser(userData);
        }
    }, [userData, createUser, workflowId]);

    // Start polling when we get a workflow ID
    useEffect(() => {
        if (workflowId && !isCompleted) {
            console.log('Starting to poll workflow status for:', workflowId);
            let consecutiveErrors = 0;
            let total404s = 0;
            const maxConsecutive404s = 5; // Increased for user creation
            const maxTotal404s = 8; // Stop after many 404s regardless
            const maxConsecutiveOtherErrors = 3;
            
            const interval = setInterval(async () => {
                try {
                    const statusResponse = await checkStatus(workflowId);
                    console.log('Polling status:', statusResponse);
                    consecutiveErrors = 0; // Reset error count on success
                    
                    if (statusResponse.completed) {
                        console.log('Workflow completed!');
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                    consecutiveErrors++;
                    
                    if (error.message?.includes('404')) {
                        total404s++;
                        console.log(`404 error ${consecutiveErrors} consecutive, ${total404s} total`);
                        
                        // Only stop on 404s if we've had many consecutive OR many total 404s
                        // AND we have some indication the workflow might be done
                        const shouldStopOn404 = (
                            (consecutiveErrors >= maxConsecutive404s || total404s >= maxTotal404s) &&
                            (status?.userId || overviewContent || birthChartData)
                        );
                        
                        if (shouldStopOn404) {
                            console.log('Multiple 404s detected with existing data - assuming workflow completed');
                            clearInterval(interval);
                            
                            // Try to get complete data if we have a userId
                            if (status?.userId) {
                                console.log('Attempting to get complete data after multiple 404s...');
                                handleWorkflowCompletion();
                            }
                        } else if (total404s >= maxTotal404s) {
                            console.log('Too many 404s without completion indicators - stopping polling');
                            clearInterval(interval);
                        }
                    } else {
                        // For non-404 errors, stop polling after max consecutive errors
                        if (consecutiveErrors >= maxConsecutiveOtherErrors) {
                            console.log('Max consecutive non-404 errors reached, stopping polling');
                            clearInterval(interval);
                        }
                    }
                }
            }, 3000);

            // Timeout after 5 minutes
            const timeout = setTimeout(() => {
                console.log('Polling timeout reached, stopping polling');
                clearInterval(interval);
                
                // Try to get complete data on timeout if we have userId
                if (status?.userId) {
                    console.log('Attempting to get complete data after timeout...');
                    handleWorkflowCompletion();
                }
            }, 300000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [workflowId, isCompleted, checkStatus, status?.userId, handleWorkflowCompletion, overviewContent, birthChartData]);

    // Handle workflow completion
    useEffect(() => {
        if (isCompleted && status?.userId && !birthChartData) {
            console.log('Workflow completed, fetching complete data...');
            handleWorkflowCompletion();
        }
    }, [isCompleted, status?.userId, birthChartData]);

    // Cleanup is handled by useSubjectCreation hook

    // Show error if no user data
    if (!userData) {
        return (
            <div style={{ padding: '20px' }}>
                <h1 style={{ color: 'white' }}>Error</h1>
                <p style={{ color: 'white' }}>No user data found. Please try signing up again.</p>
                <button onClick={() => navigate('/')}>Go Back to Sign Up</button>
            </div>
        );
    }

    const isCreating = loading || (workflowId && !isCompleted);
    const hasOverview = overviewContent && overviewContent.trim().length > 0;
    const hasBirthChartData = birthChartData && Object.keys(birthChartData).length > 0;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ color: 'white' }}>
                Welcome to Stellium {userData?.firstName || 'User'}!
            </h1>
            <p style={{ color: 'white' }}>
                {isCreating ? 'Creating your profile...' : 'Your profile has been created successfully!'}
            </p>
            
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
                        {!workflowId ? '📝 Creating Your Profile...' : '🔮 Generating Your Personal Overview...'}
                    </h3>
                    <p style={{ color: 'white', margin: '0' }}>
                        {!workflowId 
                            ? 'Setting up your account and birth chart data...'
                            : 'We\'re analyzing your birth chart to create a personalized overview. This will be ready in about 30-60 seconds.'
                        }
                    </p>
                    {status?.progress && (
                        <div style={{ marginTop: '15px' }}>
                            <p style={{ color: '#a78bfa', fontSize: '14px' }}>
                                Progress: {status.progress.completedTasks} of {status.progress.totalTasks} tasks complete
                            </p>
                            <div style={{ 
                                width: '100%', 
                                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                                borderRadius: '4px',
                                height: '8px',
                                margin: '10px 0'
                            }}>
                                <div style={{ 
                                    width: `${status.progress.percentage || 0}%`, 
                                    backgroundColor: '#8b5cf6',
                                    height: '100%',
                                    borderRadius: '4px',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                        </div>
                    )}
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
                    <h3 style={{ color: '#ff6b6b', margin: '0 0 10px 0' }}>Error</h3>
                    <p style={{ color: 'white', margin: '0' }}>{error}</p>
                </div>
            )}
            
            {/* Birth Chart Data */}
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
            
            {/* Generated Overview Display */}
            {hasOverview && (
                <div style={{ 
                    backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    margin: '20px 0',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                    <h2 style={{ color: '#a78bfa', margin: '0 0 15px 0' }}>
                        ✨ Your Personal Birth Chart Overview
                    </h2>
                    <p style={{ 
                        color: 'white', 
                        lineHeight: '1.6', 
                        margin: '0',
                        fontSize: '16px'
                    }}>
                        {overviewContent}
                    </p>
                    <div style={{ marginTop: '15px', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <p style={{ color: '#a78bfa', fontSize: '14px', margin: '0' }}>
                            This is just the beginning! Visit your dashboard to unlock your complete analysis 
                            including detailed planetary interpretations, life area insights, and personalized chat.
                        </p>
                    </div>
                </div>
            )}
            
            {/* Navigation Buttons */}
            <div style={{ marginTop: '30px' }}>
                <button onClick={() => navigate('/')} style={{ marginRight: '10px' }}>
                    Go Back
                </button>
                {userId && userData && !isCreating && (
                    <button 
                        onClick={() => {
                            navigate(`/userDashboard/${userId}`);
                        }} 
                        style={{
                            marginLeft: '10px',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {hasOverview ? 'Explore Your Complete Analysis' : 'Go to Dashboard'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ConfirmationV2;