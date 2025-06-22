import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../Utilities/store';
import { getShortOverview, startWorkflow, getWorkflowStatus } from '../Utilities/api';
import BirthChartSummary from '../UI/birthChart/BirthChartSummary';
import BirthChartSummaryTable from '../UI/birthChart/tables/BirthChartSummaryTable';

const ConfirmationV2 = () => {
    const navigate = useNavigate();
    const { userId } = useParams(); // Get userId from URL parameter
    
    const userData = useStore(state => state.userData);
    const userPlanets = useStore(state => state.userPlanets);
    const userHouses = useStore(state => state.userHouses);
    const userAspects = useStore(state => state.userAspects);
    const setUserId = useStore(state => state.setUserId);
    const setWorkflowState = useStore(state => state.setWorkflowState);
    const workflowState = useStore(state => state.workflowState);
    const setSelectedUser = useStore(state => state.setSelectedUser);

    const [error, setError] = useState(null);
    const workflowStartAttempted = useRef(false);
    const [sampleReading, setSampleReading] = useState(null);
    const [isDataComplete, setIsDataComplete] = useState(false);
    const [workflowStatus, setWorkflowStatus] = useState(null);
    const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);
    const [pollInterval, setPollInterval] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Set userId from URL parameter on mount
    useEffect(() => {
        if (userId) {
            setUserId(userId);
        }
    }, [userId, setUserId]);

    // Hide loading UI if we have overview content (regardless of how we got it)
    useEffect(() => {
        if (workflowState.hasOverview && workflowState.overviewContent && isGeneratingOverview) {
            console.log('📝 Overview content available, hiding loading UI');
            setIsGeneratingOverview(false);
        }
    }, [workflowState.hasOverview, workflowState.overviewContent, isGeneratingOverview]);

    // Simple validation - profile should already be created by signup form
    useEffect(() => {
        if (!userData || !userId) {
            setError('Missing user data. Please try signing up again.');
            return;
        }
        
        console.log('Confirmation page loaded successfully:', { 
            userId, 
            firstName: userData.firstName
        });
    }, [userData, userId]);

    useEffect(() => {
        const dataComplete = 
            userPlanets && 
            userHouses && 
            userAspects && 
            Object.keys(userPlanets).length > 0 && 
            userAspects.length > 0;

        setIsDataComplete(dataComplete);
    }, [userPlanets, userHouses, userAspects]);


    // Start abbreviated workflow after user creation
    useEffect(() => {
        const startAbbreviatedWorkflow = async () => {
            console.log('Workflow start effect triggered. Conditions:', {
                workflowStartAttempted: workflowStartAttempted.current,
                userId,
                userPlanetsLength: userPlanets?.length,
                hasUserData: !!userData
            });
            
            if (workflowStartAttempted.current || !userId) {
                console.log('Workflow start skipped due to conditions');
                return;
            }

            workflowStartAttempted.current = true;
            
            try {
                setIsGeneratingOverview(true);
                console.log('🚀 ATTEMPTING TO START WORKFLOW for userId:', userId);
                console.log('🔧 About to call startWorkflow with immediate=false');
                
                // Start workflow with immediate=false for overview only
                const startResponse = await startWorkflow(userId, false);
                console.log('📥 WORKFLOW START RESPONSE:', JSON.stringify(startResponse, null, 2));
                
                if (startResponse.success) {
                    setWorkflowState({
                        startedFromSignup: true,
                        isPaused: false
                    });
                    
                    // Wait a bit before starting to poll to give Step Functions time to initialize
                    console.log('⏰ Waiting 5 seconds before starting to poll...');
                    setTimeout(() => {
                        console.log('🔄 Starting to poll workflow status');
                        startPolling();
                    }, 5000);
                } else {
                    console.error('Workflow start failed:', startResponse);
                    setIsGeneratingOverview(false);
                }
            } catch (error) {
                console.error('Error starting abbreviated workflow:', error);
                setIsGeneratingOverview(false);
                // Stop polling on error
                stopPolling();
            }
        };

        startAbbreviatedWorkflow();
    }, [userId, setWorkflowState]);

    // Polling function for workflow status
    const pollWorkflowStatus = async () => {
        if (!userId) return;

        try {
            const response = await getWorkflowStatus(userId);
            console.log('📊 FULL WORKFLOW STATUS RESPONSE:', JSON.stringify(response, null, 2));
            
            if (response.success) {
                setWorkflowStatus(response);
                
                // Check if we've reached paused_after_overview state
                if (response.workflowStatus?.status === 'paused_after_overview') {
                    const overviewContent = response.analysisData?.interpretation?.basicAnalysis?.overview;
                    
                    console.log('🎯 FOUND PAUSED_AFTER_OVERVIEW STATE!');
                    console.log('📝 Overview content:', overviewContent);
                    
                    if (overviewContent) {
                        setWorkflowState({
                            isPaused: true,
                            hasOverview: true,
                            overviewContent: overviewContent,
                            startedFromSignup: true
                        });
                        console.log('✅ Set overview content in workflow state');
                    }
                    
                    setIsGeneratingOverview(false);
                    stopPolling();
                }
                // If workflow completed fully, also stop polling
                else if (response.workflowStatus?.status === 'completed') {
                    setIsGeneratingOverview(false);
                    stopPolling();
                }
            }
        } catch (error) {
            console.error('Error polling workflow status:', error);
            // Stop polling after a few errors to prevent spam
            setRetryCount(prev => prev + 1);
            if (retryCount >= 3) {
                console.log('Too many polling errors, stopping polling');
                stopPolling();
                setIsGeneratingOverview(false);
            }
        }
    };

    // Start polling
    const startPolling = () => {
        if (pollInterval) return; // Don't start if already polling
        
        const interval = setInterval(pollWorkflowStatus, 5000); // Poll every 5 seconds initially
        setPollInterval(interval);
    };

    // Stop polling
    const stopPolling = () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            setPollInterval(null);
        }
    };

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [pollInterval]);


    async function generateShortOverview(birthData) {
        console.log("birthData: ", birthData)
        try {
            const responseObject = await getShortOverview(birthData)
            console.log("Response object:", responseObject)
            // Check if responseObject is an object with a response property
            if (responseObject && typeof responseObject === 'object' && responseObject.response) {
                setSampleReading(responseObject.response) // Set just the response string
            } else {
                setSampleReading(String(responseObject)) // Convert to string as fallback
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Show error state if data is missing
    if (error) {
        return (
          <div className="confirmation-page">
            <h1>Error</h1>
            <p>{error}</p>
            <button onClick={() => navigate('/')}>Go Back to Sign Up</button>
          </div>
        );
      }

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ color: 'white' }}>Welcome to Stellium {userData?.firstName || 'User'}! Thank you for signing up!</h1>
            <p style={{ color: 'white' }}>Your profile has been created successfully.</p>
            
            {/* Generating Overview Status */}
            {isGeneratingOverview && (
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
                    <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>🔮 Generating Your Personal Overview...</h3>
                    <p style={{ color: 'white', margin: '0' }}>
                        We're analyzing your birth chart to create a personalized overview. This will be ready in about 30-60 seconds.
                    </p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
            
            {/* Birth Chart Data */}
            {isDataComplete && (
                <div style={{ margin: '20px 0' }}>
                    <h3 style={{ color: 'white', marginBottom: '15px' }}>Your Birth Chart Data</h3>
                    <BirthChartSummaryTable planets={userPlanets} houses={userHouses} aspects={userAspects}/>
                </div>
            )}
            
            {/* Generated Overview Display */}
            {workflowState.hasOverview && workflowState.overviewContent && (
                <div style={{ 
                    backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    margin: '20px 0',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                    <h2 style={{ color: '#a78bfa', margin: '0 0 15px 0' }}>✨ Your Personal Birth Chart Overview</h2>
                    <p style={{ 
                        color: 'white', 
                        lineHeight: '1.6', 
                        margin: '0',
                        fontSize: '16px'
                    }}>
                        {workflowState.overviewContent}
                    </p>
                    {workflowState.isPaused && (
                        <div style={{ marginTop: '15px', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <p style={{ color: '#a78bfa', fontSize: '14px', margin: '0' }}>
                                This is just the beginning! Visit your dashboard to unlock your complete analysis including detailed planetary interpretations, life area insights, and personalized chat.
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Navigation Buttons */}
            <div style={{ marginTop: '30px' }}>
                <button onClick={() => navigate('/')} style={{ marginRight: '10px' }}>Go Back</button>
                {userId && userData && !isGeneratingOverview && (
                    <button 
                        onClick={() => {
                            // Set selectedUser for the dashboard to display user info
                            setSelectedUser({
                                _id: userId,
                                firstName: userData.firstName,
                                lastName: userData.lastName,
                                email: userData.email,
                                kind: 'accountSelf'
                            });
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
                        {workflowState.hasOverview ? 'Explore Your Complete Analysis' : 'Go to Dashboard'}
                    </button>
                )}
            </div>
            
            {/* Legacy Short Overview Button - Keep for testing */}
            {/* <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
                <button onClick={() => generateShortOverview({ planets: userPlanets, houses: userHouses, aspects: userAspects })}>
                    Generate Legacy Short Overview
                </button>
                {sampleReading && (
                    <div style={{ marginTop: '15px' }}>
                        <h3 style={{color:'white'}}>Legacy Short Overview</h3>
                        <p style={{color:'white'}}>{sampleReading}</p>
                    </div>
                )}
            </div> */}
        </div>
    );
};

export default ConfirmationV2;