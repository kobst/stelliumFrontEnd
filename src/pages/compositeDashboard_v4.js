import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../Utilities/store';
import SynastryBirthChartComparison_v2 from '../UI/birthChart/tables/SynastryBirthChartComparison_v2'
import RelationshipScores from '../UI/prototype/RelationshipScores';
import { RelationshipCategoriesEnum } from '../Utilities/constants';
import {
  fetchUser,
  fetchRelationshipAnalysis,
  fetchAnalysis,
  chatForUserRelationship,
  fetchUserChatRelationshipAnalysis,
  startRelationshipWorkflow,
  getRelationshipWorkflowStatus
} from '../Utilities/api';
import UserChatBirthChart from '../UI/prototype/UserChatBirthChart'; // Reuse the same component
import TabMenu from '../UI/shared/TabMenu';
import './compositeDashboard_v4.css';


function CompositeDashboard_v4({}) {
  
    const [relationshipScores, setRelationshipScores] = useState(null);
    const [synastryAspects, setSynastryAspects] = useState([]);
    const compositeChart = useStore(state => state.compositeChart)
    const [userA, setUserA] = useState(null);
    const [userB, setUserB] = useState(null);
    const [userAVectorizationStatus, setUserAVectorizationStatus] = useState(false);
    const [userBVectorizationStatus, setUserBVectorizationStatus] = useState(false);
    const [scoreDebugInfo, setScoreDebugInfo] = useState(null);
    const [detailedRelationshipAnalysis, setDetailedRelationshipAnalysis] = useState(null);
    const [vectorizationStatus, setVectorizationStatus] = useState({
        categories: {
            OVERALL_ATTRACTION_CHEMISTRY: false,
            EMOTIONAL_SECURITY_CONNECTION: false,
            SEX_AND_INTIMACY: false,
            COMMUNICATION_AND_MENTAL_CONNECTION: false,
            COMMITMENT_LONG_TERM_POTENTIAL: false,
            KARMIC_LESSONS_GROWTH: false,
            PRACTICAL_GROWTH_SHARED_GOALS: false
        },
        lastUpdated: null,
        relationshipAnalysis: false
    });
    
    // Workflow state
    const [workflowStatus, setWorkflowStatus] = useState(null);
    const [isPolling, setIsPolling] = useState(false);
    const [pollInterval, setPollInterval] = useState(null);
    const [connectionError, setConnectionError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    
    // Add chat-related state
    const [chatMessages, setChatMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);

    const initializeCompositeChartData = useCallback(async () => {
        try {
            if (!compositeChart || !compositeChart._id) {
                console.log("No composite chart available yet for initialization");
                return;
            }

            if (compositeChart.userA_id && compositeChart.userB_id) {
                // Fetch users and generate chart descriptions
                const [userA, userB] = await Promise.all([
                    fetchUser(compositeChart.userA_id),
                    fetchUser(compositeChart.userB_id)
                ]);
                console.log("Users fetched:", { userA, userB });

                const [userAResponse, userBResponse] = await Promise.all([
                    fetchAnalysis(compositeChart.userA_id),
                    fetchAnalysis(compositeChart.userB_id)
                ]);
                const userAVectorizationStatus = Boolean(userAResponse?.vectorizationStatus?.topicAnalysis?.isComplete);
                const userBVectorizationStatus = Boolean(userBResponse?.vectorizationStatus?.topicAnalysis?.isComplete);

                // Fetch relationship scores
                const fetchedData = await fetchRelationshipAnalysis(compositeChart._id);
                console.log("fetchedData: ", fetchedData)
                // Update all state values
                setUserA(userA);
                setUserB(userB);
                setUserAVectorizationStatus(userAVectorizationStatus);
                setUserBVectorizationStatus(userBVectorizationStatus);
                setSynastryAspects(compositeChart.synastryAspects);
                
                // Handle relationship scores
                if (fetchedData?.scores) {
                    setRelationshipScores(fetchedData.scores);
                }
                if (fetchedData?.debug) {
                    setScoreDebugInfo(fetchedData.debug);
                }

                // Handle relationship analysis
                if (fetchedData?.categoryAnalysis) {
                    console.log("Detailed analysis available: ", fetchedData.categoryAnalysis);
                    setDetailedRelationshipAnalysis({
                        analysis: fetchedData.categoryAnalysis,
                        userAName: fetchedData.debug?.inputSummary?.userAName || userA?.firstName,
                        userBName: fetchedData.debug?.inputSummary?.userBName || userB?.firstName
                    });
                }

                // Handle vectorization status from the backend
                if (fetchedData?.vectorizationStatus) {
                    console.log("Vectorization status received:", fetchedData.vectorizationStatus);
                    
                    // Check if this is the new structure with categoryAnalysis keys
                    const isNewStructure = Object.keys(fetchedData.vectorizationStatus).some(key => 
                        key.startsWith('categoryAnalysis.')
                    );
                    
                    if (isNewStructure) {
                        // New structure: extract category statuses and check if all are complete
                        const categoryStatuses = {};
                        let allCategoriesComplete = true;
                        
                        Object.entries(fetchedData.vectorizationStatus).forEach(([key, value]) => {
                            if (key.startsWith('categoryAnalysis.')) {
                                const categoryName = key.replace('categoryAnalysis.', '');
                                categoryStatuses[categoryName] = value;
                                if (!value) allCategoriesComplete = false;
                            }
                        });
                        
                        setVectorizationStatus({
                            categories: categoryStatuses,
                            lastUpdated: new Date().toISOString(),
                            relationshipAnalysis: allCategoriesComplete
                        });
                    } else if (fetchedData.vectorizationStatus.isComplete !== undefined || fetchedData.vectorizationStatus.relationshipAnalysis !== undefined) {
                        // Handle structure with either isComplete or relationshipAnalysis at root level
                        const isComplete = fetchedData.vectorizationStatus.isComplete;
                        const hasRelationshipAnalysis = fetchedData.vectorizationStatus.relationshipAnalysis;
                        
                        console.log("Setting vectorization status with:", {
                            isComplete,
                            hasRelationshipAnalysis,
                            categories: fetchedData.vectorizationStatus.categories
                        });
                        
                        setVectorizationStatus({
                            categories: fetchedData.vectorizationStatus.categories || {},
                            lastUpdated: new Date().toISOString(),
                            relationshipAnalysis: isComplete || hasRelationshipAnalysis // Either flag being true means it's complete
                        });
                    } else {
                        // Legacy structure
                        setVectorizationStatus({
                            categories: fetchedData.vectorizationStatus.categories || {},
                            lastUpdated: fetchedData.vectorizationStatus.lastUpdated || null,
                            relationshipAnalysis: Boolean(fetchedData.vectorizationStatus.relationshipAnalysis)
                        });
                    }
                } else if (fetchedData?.isVectorized !== undefined) {
                    // Fallback to isVectorized flag
                    setVectorizationStatus(prev => ({
                        ...prev,
                        relationshipAnalysis: fetchedData.isVectorized,
                        lastUpdated: new Date().toISOString()
                    }));
                } else if (fetchedData?.categoryAnalysis) {
                    // If we have category analysis but no vectorization status, assume it's vectorized
                    setVectorizationStatus(prev => ({
                        ...prev,
                        relationshipAnalysis: true,
                        lastUpdated: new Date().toISOString()
                    }));
                } else {
                    // If no vectorizationStatus field, assume not vectorized
                    setVectorizationStatus(prev => ({
                        ...prev,
                        relationshipAnalysis: false,
                        lastUpdated: null
                    }));
                }
            }
        } catch (error) {
            console.error("Error initializing composite chart data:", error);
        }
    }, [compositeChart]);

    useEffect(() => {
        initializeCompositeChartData();
    }, [initializeCompositeChartData]);

  // Update analysis data from workflow response
  const updateAnalysisFromWorkflow = (analysisData) => {
    console.log("Updating analysis from workflow:", analysisData);
    
    if (analysisData.scores) {
      setRelationshipScores(analysisData.scores);
    }

    if (analysisData.categoryAnalysis) {
      setDetailedRelationshipAnalysis({
        analysis: analysisData.categoryAnalysis,
        userAName: userA?.firstName,
        userBName: userB?.firstName
      });
    }

    // Handle vectorization status from workflow response
    if (analysisData.vectorizationStatus) {
      console.log("Vectorization status from workflow:", analysisData.vectorizationStatus);
      
      // Check if this is the new structure with categoryAnalysis keys
      const isNewStructure = Object.keys(analysisData.vectorizationStatus).some(key => 
        key.startsWith('categoryAnalysis.')
      );
      
      if (isNewStructure) {
        // New structure: extract category statuses and check if all are complete
        const categoryStatuses = {};
        let allCategoriesComplete = true;
        
        Object.entries(analysisData.vectorizationStatus).forEach(([key, value]) => {
          if (key.startsWith('categoryAnalysis.')) {
            const categoryName = key.replace('categoryAnalysis.', '');
            categoryStatuses[categoryName] = value;
            if (!value) allCategoriesComplete = false;
          }
        });
        
        setVectorizationStatus({
          categories: categoryStatuses,
          lastUpdated: new Date().toISOString(),
          relationshipAnalysis: allCategoriesComplete
        });
      } else {
        // Legacy structure or isVectorized flag
        setVectorizationStatus(prev => ({
          ...prev,
          relationshipAnalysis: analysisData.vectorizationStatus.relationshipAnalysis || analysisData.isVectorized,
          lastUpdated: new Date().toISOString()
        }));
      }
    } else if (analysisData.isVectorized !== undefined) {
      // Fallback to isVectorized flag
      setVectorizationStatus(prev => ({
        ...prev,
        relationshipAnalysis: analysisData.isVectorized,
        lastUpdated: new Date().toISOString()
      }));
    }

    // If workflow is complete, ensure relationshipAnalysis is set to true
    if (workflowStatus?.workflowStatus?.status === 'completed') {
      setVectorizationStatus(prev => ({
        ...prev,
        relationshipAnalysis: true,
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  // Start workflow function
  const handleStartWorkflow = async () => {
    if (!userA?._id || !userB?._id || !compositeChart?._id) {
      console.error('Missing required data to start workflow');
      return;
    }

    try {
      // Reset all workflow state
      console.log('Resetting workflow state');
      setWorkflowStatus(null);
      setIsPolling(false);
      setConnectionError(false);
      setRetryCount(0);
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
      
      console.log('Starting workflow with:', {
        userA: userA._id,
        userB: userB._id,
        compositeChart: compositeChart._id
      });
      
      // Start the workflow
      const startResponse = await startRelationshipWorkflow(userA._id, userB._id, compositeChart._id);
      console.log('Start workflow response:', startResponse);
      
      if (startResponse.success) {
        // Start polling immediately after successful start
        console.log('Workflow started successfully, beginning polling');
        setIsPolling(true);
        
        // Poll immediately
        const pollResponse = await getRelationshipWorkflowStatus(compositeChart._id);
        console.log('Initial poll response:', pollResponse);
        
        if (pollResponse.success) {
          setWorkflowStatus(pollResponse);
          console.log('Set initial workflow status to:', pollResponse);
          
          // Set up interval for subsequent polls
          const interval = setInterval(async () => {
            try {
              const response = await getRelationshipWorkflowStatus(compositeChart._id);
              console.log('Poll response:', response);
              
              if (response.success) {
                setWorkflowStatus(response);
                
                // Update analysis data if available
                if (response.analysisData) {
                  updateAnalysisFromWorkflow(response.analysisData);
                }
                
                // Stop polling if workflow is complete or has error
                if (response.workflowStatus?.status === 'completed' || 
                    response.workflowStatus?.status === 'error' || 
                    response.workflowStatus?.status === 'unknown') {
                  console.log('Workflow finished with status:', response.workflowStatus?.status);
                  setIsPolling(false);
                  clearInterval(interval);
                  setPollInterval(null);
                  
                  // If workflow completed successfully, ensure vectorization status is updated
                  if (response.workflowStatus?.status === 'completed') {
                    setVectorizationStatus(prev => ({
                      ...prev,
                      relationshipAnalysis: true,
                      lastUpdated: new Date().toISOString()
                    }));
                  }
                  
                  // Refresh analysis data
                  await initializeCompositeChartData();
                }
              }
            } catch (error) {
              console.error('Error in polling interval:', error);
              setIsPolling(false);
              clearInterval(interval);
              setPollInterval(null);
            }
          }, 3000);
          
          setPollInterval(interval);
        }
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
      // Reset state on error
      setWorkflowStatus(null);
      setIsPolling(false);
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    }
  };

  // Manual status check function
  const checkWorkflowStatus = async () => {
    if (!compositeChart?._id) return;
    
    try {
      console.log('Manually checking workflow status');
      const response = await getRelationshipWorkflowStatus(compositeChart._id);
      console.log('Manual check response:', response);
      
      if (response.success) {
        // Set the entire response as workflow status
        setWorkflowStatus(response);
        console.log('Updated workflow status to:', response);
        setConnectionError(false);
        setRetryCount(0);
        
        if (response.analysisData) {
          console.log('Updating analysis data:', response.analysisData);
          updateAnalysisFromWorkflow(response.analysisData);
        }
        
        // If workflow is still running, resume polling
        if (response.workflowStatus?.status === 'running' && !isPolling) {
          console.log('Workflow is running, resuming polling');
          handleStartWorkflow();
        }
      }
    } catch (error) {
      console.error('Error checking workflow status:', error);
      setConnectionError(true);
    }
  };

  // Check for existing workflow on component mount
  useEffect(() => {
    if (compositeChart?._id && !workflowStatus) {
      checkWorkflowStatus();
    }
  }, [compositeChart?._id]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Determine workflow status for UI
  const isWorkflowRunning = workflowStatus?.workflowStatus?.status === 'running';
  const workflowComplete = workflowStatus?.workflowStatus?.status === 'completed';
  const workflowError = workflowStatus?.workflowStatus?.status === 'error';

  // Progress calculation with granular step progress
  const computeWorkflowProgress = () => {
    if (!workflowStatus?.progress) return 0;
    
    const stepProgress = workflowStatus.progress.processRelationshipAnalysis;
    if (stepProgress?.status === 'completed') {
      return 100;
    } else if (stepProgress?.status === 'running' && stepProgress?.total > 0) {
      return Math.min((stepProgress.completed / stepProgress.total) * 100, 100);
    }
    
    return 0;
  };

  // Get current step description with progress details
  const getCurrentStepDescription = () => {
    if (!workflowStatus) return '';
    
    const stepProgress = workflowStatus.progress?.processRelationshipAnalysis;
    
    if (stepProgress?.total > 0) {
      const completed = stepProgress.completed || 0;
      const total = stepProgress.total;
      
      // Provide descriptive text based on progress  
      if (completed === 1) {
        return `Calculating compatibility scores... (${completed}/${total})`;
      } else if (completed <= 8) {
        return `Generating relationship insights... (${completed}/${total})`;
      }
      return `Finalizing relationship analysis... (${completed}/${total})`;
    }
    
    return 'Processing your relationship analysis...';
  };

  // Check if users have birth chart analysis complete
  const canStartWorkflow = () => {
    console.log('Checking workflow prerequisites:', {
      userAVectorizationStatus,
      userBVectorizationStatus,
      userA: userA?._id,
      userB: userB?._id,
      compositeChart: compositeChart?._id
    });
    return userAVectorizationStatus && userBVectorizationStatus;
  };
  
  // Function to load chat history for relationship
  const loadRelationshipChatHistory = useCallback(async () => {
    if (!userA?._id || !compositeChart?._id) {
      return;
    }

    setIsChatHistoryLoading(true);
    try {
      const response = await fetchUserChatRelationshipAnalysis(userA._id, compositeChart._id);
      console.log("Relationship chat history response:", response);
      
      // Transform the backend messages to match your frontend format
      if (response && response.success && Array.isArray(response.chatHistory)) {
        const transformedMessages = response.chatHistory.map((message, index) => ({
          id: `history-${index}-${Date.now()}`,
          type: message.role === 'user' ? 'user' : 'bot',
          content: message.content,
          timestamp: new Date(message.timestamp)
        }));
        
        setChatMessages(transformedMessages);
      } else {
        console.log("No relationship chat history found or invalid response format");
        setChatMessages([]);
      }
    } catch (error) {
      console.error('Error loading relationship chat history:', error);
      setChatMessages([{
        id: `error-${Date.now()}`,
        type: 'error',
        content: 'Failed to load chat history',
        timestamp: new Date()
      }]);
    } finally {
      setIsChatHistoryLoading(false);
    }
  }, [userA?._id, compositeChart?._id]);

  // Load chat history when vectorization is complete
  useEffect(() => {
    console.log("Checking chat history load conditions:", {
        relationshipAnalysis: vectorizationStatus.relationshipAnalysis,
        userA: userA?._id,
        compositeChart: compositeChart?._id
    });
    
    if (vectorizationStatus.relationshipAnalysis && userA?._id && compositeChart?._id) {
        console.log("Loading chat history...");
        loadRelationshipChatHistory();
    }
  }, [vectorizationStatus.relationshipAnalysis, userA?._id, compositeChart?._id, loadRelationshipChatHistory]);

  // Handle sending new chat messages
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !userA?._id || !compositeChart?._id) {
      return;
    }

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setIsChatLoading(true);

    // Add user message to chat immediately
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await chatForUserRelationship(userA._id, compositeChart._id, userMessage);
      console.log('Relationship chat API response:', response);
      
      // Extract response content
      let responseContent = 'No response received';
      
      if (typeof response === 'string') {
        responseContent = response;
      } else if (response && typeof response === 'object') {
        responseContent = response.message || 
                         response.response || 
                         response.reply || 
                         response.answer || 
                         response.text || 
                         response.content ||
                         response.result ||
                         JSON.stringify(response);
      }

      // Add API response to chat
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: responseContent,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending relationship chat message:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const tabs = [];

  if (relationshipScores) {
    tabs.push({
      id: 'scores',
      label: 'Scores',
      content: <RelationshipScores scores={relationshipScores} />
    });
  }

  if (detailedRelationshipAnalysis) {
    Object.entries(detailedRelationshipAnalysis.analysis).forEach(([cat, value]) => {
      tabs.push({
        id: cat,
        label: RelationshipCategoriesEnum[cat]?.label || cat.replace(/_/g, ' '),
        content: (
          <div style={{ marginBottom: '10px' }}>
            {value.relevantPositions && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Relevant Astrological Positions:</strong>
                <p style={{ whiteSpace: 'pre-wrap' }}>{value.relevantPositions}</p>
              </div>
            )}
            <div>
              <strong>Interpretation:</strong>
              <p style={{ whiteSpace: 'pre-wrap' }}>{value.interpretation}</p>
            </div>
          </div>
        )
      });
    });
  }

  if (vectorizationStatus.relationshipAnalysis && userA && userB && compositeChart) {
    tabs.push({
      id: 'chat',
      label: 'Chat',
      content: (
        <UserChatBirthChart
          chatMessages={chatMessages}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          isChatLoading={isChatLoading}
          isChatHistoryLoading={isChatHistoryLoading}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
        />
      )
    });
  }

  return (
    <div>
      <h1>Composite Dashboard</h1>
      <div className="composite-chart">
        {userA && userB && (
          <>
            <h2 className="logotxt">User A: {userA.firstName} {userA.lastName}</h2>
            <h2 className="logotxt">User B: {userB.firstName} {userB.lastName}</h2>
            <h2 className="logotxt">Composite Chart: {compositeChart._id}</h2>

            {/* Debug info */}
            <div style={{ margin: '10px 0', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
              <h4>Debug Info:</h4>
              <pre>
                {JSON.stringify({
                  workflowStatus: workflowStatus?.workflowStatus,
                  debug: workflowStatus?.debug,
                  workflowBreakdown: workflowStatus?.workflowBreakdown,
                  jobs: workflowStatus?.jobs,
                  vectorizationStatus,
                  userAVectorizationStatus,
                  userBVectorizationStatus,
                  canStart: canStartWorkflow(),
                  hasUserA: !!userA,
                  hasUserB: !!userB,
                  hasCompositeChart: !!compositeChart
                }, null, 2)}
              </pre>
            </div>

            {/* Workflow Control Section */}
            <div className="workflow-section">
              {/* Show start/resume/retry button for not_started, incomplete, or completed_with_failures */}
              {(workflowStatus?.workflowStatus?.status === 'not_started' || 
                workflowStatus?.workflowStatus?.status === 'incomplete' || 
                workflowStatus?.workflowStatus?.status === 'completed_with_failures') && (
                <div>
                  <button
                    onClick={handleStartWorkflow}
                    disabled={isWorkflowRunning || !canStartWorkflow()}
                    className="workflow-button primary"
                  >
                    {workflowStatus?.workflowStatus?.status === 'not_started' && 'Start Analysis'}
                    {workflowStatus?.workflowStatus?.status === 'incomplete' && 'Resume Analysis'}
                    {workflowStatus?.workflowStatus?.status === 'completed_with_failures' && 'Retry Failed Tasks'}
                  </button>
                  <button
                    onClick={checkWorkflowStatus}
                    disabled={!compositeChart?._id}
                    className="workflow-button"
                    style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}
                  >
                    Check Status
                  </button>
                </div>
              )}

              {/* Show progress for running state */}
              {workflowStatus?.workflowStatus?.status === 'running' && (
                <div className="workflow-progress">
                  <div className="progress-header">
                    <h3>Generating Your Relationship Analysis</h3>
                    <p>{getCurrentStepDescription()}</p>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${workflowStatus?.workflowStatus?.progress?.percentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="progress-percentage">
                    {workflowStatus?.workflowStatus?.progress?.percentage || 0}% Complete
                  </div>
                  {workflowStatus?.workflowBreakdown && (
                    <div className="workflow-steps">
                      {workflowStatus.workflowBreakdown.needsGeneration.length > 0 && (
                        <div className="workflow-step pending">
                          <span className="step-name">Needs Generation:</span>
                          <ul>
                            {workflowStatus.workflowBreakdown.needsGeneration.map((task, index) => (
                              <li key={`gen-${index}`}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {workflowStatus.workflowBreakdown.needsVectorization.length > 0 && (
                        <div className="workflow-step pending">
                          <span className="step-name">Needs Vectorization:</span>
                          <ul>
                            {workflowStatus.workflowBreakdown.needsVectorization.map((task, index) => (
                              <li key={`vec-${index}`}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {workflowStatus.workflowBreakdown.completed.length > 0 && (
                        <div className="workflow-step completed">
                          <span className="step-name">Completed Tasks:</span>
                          <ul>
                            {workflowStatus.workflowBreakdown.completed.map((task, index) => (
                              <li key={`comp-${index}`}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {isPolling && !connectionError && <div className="polling-indicator">Checking status...</div>}
                  {connectionError && (
                    <div className="connection-error">
                      <span>⚠️ Connection lost (Attempt {retryCount}/10)</span>
                      <button 
                        onClick={checkWorkflowStatus}
                        className="workflow-button retry"
                        style={{ marginLeft: '10px', padding: '6px 12px', fontSize: '12px' }}
                      >
                        Retry Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Show completion message for completed state */}
              {workflowStatus?.workflowStatus?.status === 'completed' && (
                <div className="workflow-complete">
                  <h3>✅ Analysis Complete!</h3>
                  <p>Your relationship analysis has been generated and is ready to explore.</p>
                  <button
                    onClick={checkWorkflowStatus}
                    className="workflow-button"
                    style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
                  >
                    Check Status
                  </button>
                </div>
              )}

              {/* Show error message for unknown state */}
              {workflowStatus?.workflowStatus?.status === 'unknown' && (
                <div className="workflow-error">
                  <h3>❌ Unexpected Error</h3>
                  <p>An unexpected error occurred while processing your relationship analysis.</p>
                  <p>Please contact support if this issue persists.</p>
                  <button onClick={handleStartWorkflow} className="workflow-button retry">
                    Retry Analysis
                  </button>
                </div>
              )}

              {/* Show incomplete tasks for incomplete or completed_with_failures states */}
              {(workflowStatus?.workflowStatus?.status === 'incomplete' || 
                workflowStatus?.workflowStatus?.status === 'completed_with_failures') && 
                workflowStatus?.workflowBreakdown && (
                <div className="incomplete-tasks">
                  <h4>Tasks Requiring Attention:</h4>
                  {workflowStatus.workflowBreakdown.needsGeneration.length > 0 && (
                    <div>
                      <h5>Needs Generation:</h5>
                      <ul>
                        {workflowStatus.workflowBreakdown.needsGeneration.map((task, index) => (
                          <li key={`gen-${index}`}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {workflowStatus.workflowBreakdown.needsVectorization.length > 0 && (
                    <div>
                      <h5>Needs Vectorization:</h5>
                      <ul>
                        {workflowStatus.workflowBreakdown.needsVectorization.map((task, index) => (
                          <li key={`vec-${index}`}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </>
        )}
        
        {userA && userB && synastryAspects.length > 0 && compositeChart && (
          <SynastryBirthChartComparison_v2
            birthChartA={userA.birthChart}
            birthChartB={userB.birthChart}
            compositeChart={compositeChart.compositeChart}
            userAName={userA.firstName}
            userBName={userB.firstName}
          />
        )}

        <TabMenu tabs={tabs} />
      </div>
    </div>
  )
}

export default CompositeDashboard_v4;