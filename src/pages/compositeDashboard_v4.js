import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../Utilities/store';
import SynastryBirthChartComparison_v2 from '../UI/birthChart/tables/SynastryBirthChartComparison_v2'
import RelationshipScores from '../UI/prototype/RelationshipScores';
import RelationshipAnalysis from '../UI/prototype/RelationshipAnalysis';
import {
  fetchUser,
  getRelationshipScore,
  fetchRelationshipAnalysis,
  fetchAnalysis,
  generateRelationshipAnalysis,
  processAndVectorizeRelationshipAnalysis,
  chatForUserRelationship,
  fetchUserChatRelationshipAnalysis
} from '../Utilities/api';
import UserChatBirthChart from '../UI/prototype/UserChatBirthChart'; // Reuse the same component
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
    const [processingStatus, setProcessingStatus] = useState({
        isProcessing: false,
        error: null,
        currentCategory: null
    });
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
    
    // Add chat-related state
    const [chatMessages, setChatMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
    const [scoreLoading, setScoreLoading] = useState(false);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [workflowStarted, setWorkflowStarted] = useState(false);

    useEffect(() => {
        const initializeCompositeChartData = async () => {
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
                    if (fetchedData?.analysis) {
                        console.log("Detailed analysis available: ", fetchedData.analysis);
                        setDetailedRelationshipAnalysis({
                            analysis: fetchedData.analysis,
                            userAName: fetchedData.debug?.inputSummary?.userAName || userA?.firstName,
                            userBName: fetchedData.debug?.inputSummary?.userBName || userB?.firstName
                        });
                    }

                    // Handle vectorization status from the backend
                    if (fetchedData?.vectorizationStatus) {
                        console.log("Vectorization status received:", fetchedData.vectorizationStatus);
                        
                        // Update the vectorization status state with the structure from backend
                        setVectorizationStatus({
                            categories: fetchedData.vectorizationStatus.categories || {},
                            lastUpdated: fetchedData.vectorizationStatus.lastUpdated || null,
                            relationshipAnalysis: Boolean(fetchedData.vectorizationStatus.relationshipAnalysis)
                        });
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
        };


            initializeCompositeChartData();

    }, [compositeChart]);


  const generateCompatabilityScore = async () => {
    if (synastryAspects.length > 0 && compositeChart && userA && userB) {
      try {
        const compatabilityScore = await getRelationshipScore(synastryAspects, compositeChart.compositeChart, userA, userB, compositeChart._id);
        console.log("compatabilityScore: ", JSON.stringify(compatabilityScore));
        
        if (compatabilityScore?.relationshipScore?.scores) {
          setRelationshipScores(compatabilityScore.relationshipScore.scores);
          
          // If you want to store the debug information for displaying aspects later
          if (compatabilityScore.relationshipScore.debug) {
            // Store the debug information in state if needed
            setScoreDebugInfo(compatabilityScore.relationshipScore.debug);
          }
        } else {
          console.error("Unexpected response structure:", compatabilityScore);
        }
      } catch (error) {
        console.error("Error generating compatibility score:", error);
      }
    } else {
      console.log("Not enough data to generate compatibility score");
    }
  }

  const generateRelationshipAnalysisForCompositeChart = async () => {
    if (compositeChart) {
      const relationshipAnalysis = await generateRelationshipAnalysis(compositeChart._id);
      setDetailedRelationshipAnalysis(relationshipAnalysis);
      console.log("relationshipAnalysis: ", JSON.stringify(relationshipAnalysis));
    }
  }

  const processRelationshipAnalysis = async () => {
    if (!compositeChart || !compositeChart._id) {
      console.error("No composite chart ID available for vectorization.");
      setProcessingStatus({ isProcessing: false, error: "Composite chart ID is missing.", currentCategory: null });
      return;
    }
    
    console.log("Starting relationship analysis vectorization for compositeChartId:", compositeChart._id);
    
    setProcessingStatus({
      isProcessing: true,
      error: null,
      currentCategory: null
    });

    try {
      const response = await processAndVectorizeRelationshipAnalysis(compositeChart._id);
      console.log("Vectorization processing response:", response);
      
      if (response.success && response.isComplete) {
        // Update vectorization status to reflect completion
        setVectorizationStatus({
          categories: {
            OVERALL_ATTRACTION_CHEMISTRY: true,
            EMOTIONAL_SECURITY_CONNECTION: true,
            SEX_AND_INTIMACY: true,
            COMMUNICATION_AND_MENTAL_CONNECTION: true,
            COMMITMENT_LONG_TERM_POTENTIAL: true,
            KARMIC_LESSONS_GROWTH: true,
            PRACTICAL_GROWTH_SHARED_GOALS: true,
          },
          lastUpdated: new Date().toISOString(),
          relationshipAnalysis: true
        });
        console.log("Relationship analysis vectorization completed successfully.");
      } else {
        throw new Error(response.error || 'Vectorization processing failed or did not complete.');
      }
    } catch (error) {
      console.error('Error processing relationship analysis vectorization:', error);
      setProcessingStatus(prev => ({
        ...prev,
        error: error.message,
        isProcessing: false
      }));
    } finally {
      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: false,
        currentCategory: null
      }));
    }
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
    if (vectorizationStatus.relationshipAnalysis && userA?._id && compositeChart?._id) {
      loadRelationshipChatHistory();
    }
  }, [vectorizationStatus.relationshipAnalysis, loadRelationshipChatHistory]);

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

  const startWorkflow = () => {
    setWorkflowStarted(true);
    handleWorkflow();
  };

  const getNextAction = () => {
    if (!relationshipScores) return 'generateScore';
    if (!detailedRelationshipAnalysis) {
      return userAVectorizationStatus && userBVectorizationStatus
        ? 'generateAnalysis'
        : 'awaitUserVectorization';
    }
    if (!vectorizationStatus.relationshipAnalysis) return 'vectorizeAnalysis';
    return 'complete';
  };

  const handleWorkflow = async () => {
    const action = getNextAction();
    switch (action) {
      case 'generateScore':
        setScoreLoading(true);
        await generateCompatabilityScore();
        setScoreLoading(false);
        break;
      case 'generateAnalysis':
        setAnalysisLoading(true);
        await generateRelationshipAnalysisForCompositeChart();
        setAnalysisLoading(false);
        break;
      case 'vectorizeAnalysis':
        await processRelationshipAnalysis();
        break;
      default:
        break;
    }
  };

  const computeProgressStep = () => {
    let step = 0;
    if (relationshipScores) step++;
    if (detailedRelationshipAnalysis) step++;
    if (vectorizationStatus.relationshipAnalysis) step++;
    return step;
  };

  const getButtonLabel = () => {
    const action = getNextAction();
    switch (action) {
      case 'generateScore':
        return scoreLoading ? 'Generating Score...' : 'Run Relationship Workflow';
      case 'generateAnalysis':
        return analysisLoading ? 'Generating Analysis...' : 'Run Relationship Workflow';
      case 'vectorizeAnalysis':
        return processingStatus.isProcessing ? 'Vectorizing Analysis...' : 'Run Relationship Workflow';
      case 'awaitUserVectorization':
        return 'Birth Chart Analysis Required';
      default:
        return 'Workflow Complete';
    }
  };

  useEffect(() => {
    if (!workflowStarted) return;
    const next = getNextAction();
    if (
      next !== 'complete' &&
      next !== 'awaitUserVectorization' &&
      !scoreLoading &&
      !analysisLoading &&
      !processingStatus.isProcessing
    ) {
      handleWorkflow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    relationshipScores,
    detailedRelationshipAnalysis,
    vectorizationStatus.relationshipAnalysis,
    userAVectorizationStatus,
    userBVectorizationStatus,
    scoreLoading,
    analysisLoading,
    processingStatus.isProcessing,
    workflowStarted
  ]);

  return (
    <div>
      <h1>Composite Dashboard</h1>
      <div className="composite-chart">
        {userA && userB && (
          <>
            <h2 className="logotxt">User A: {userA.firstName} {userA.lastName}</h2>
            <h2 className="logotxt">User B: {userB.firstName} {userB.lastName}</h2>
            <h2 className="logotxt">Composite Chart: {compositeChart._id}</h2>
            <div className="progress-tracker">
              {['Score', 'Analysis', 'Vectorize'].map((stage, index) => (
                <div
                  key={stage}
                  className={`progress-step ${computeProgressStep() > index ? 'completed' : ''} ${computeProgressStep() === index ? 'current' : ''}`}
                >
                  {stage}
                </div>
              ))}
            </div>
            <button
              onClick={startWorkflow}
              disabled={
                scoreLoading ||
                analysisLoading ||
                processingStatus.isProcessing ||
                getNextAction() === 'awaitUserVectorization' ||
                getNextAction() === 'complete'
              }
            >
              {getButtonLabel()}
            </button>

            {getNextAction() === 'awaitUserVectorization' && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', color: '#856404' }}>
                <strong>Prerequisites Required:</strong>{' '}
                {(() => {
                  const incompleteUsers = [];
                  if (!userAVectorizationStatus) incompleteUsers.push(userA?.firstName || 'User A');
                  if (!userBVectorizationStatus) incompleteUsers.push(userB?.firstName || 'User B');
                  if (incompleteUsers.length === 1) {
                    return `${incompleteUsers[0]} requires their birth chart analysis to be processed before relationship analysis can be generated.`;
                  } else {
                    return `${incompleteUsers.join(' and ')} require their birth chart analysis to be processed before relationship analysis can be generated.`;
                  }
                })()}
              </div>
            )}

            {processingStatus.error && (
              <div style={{ marginTop: '10px', color: 'red' }}>
                Vectorization Error: {processingStatus.error}
              </div>
            )}

            {vectorizationStatus.relationshipAnalysis && (
              <div style={{ marginTop: '10px', color: 'red' }}>
                Relationship analysis has been successfully vectorized. (Last updated: {vectorizationStatus.lastUpdated ? new Date(vectorizationStatus.lastUpdated).toLocaleString() : 'N/A'})
              </div>
            )}
            
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

{relationshipScores && scoreDebugInfo && (
        <>
      <RelationshipScores scores={relationshipScores} />
      {/* <RelationshipAspects debugInfo={scoreDebugInfo} userA={userA} userB={userB} /> */}
      </>
    )}

{detailedRelationshipAnalysis && userA && userB && (
        <RelationshipAnalysis 
          analysis={detailedRelationshipAnalysis.analysis} 
          userAName={detailedRelationshipAnalysis.userAName || userA.firstName}
          userBName={detailedRelationshipAnalysis.userBName || userB.firstName}
        />
      )}

        {/* Relationship Chat Interface - Only show when vectorization is complete */}
        {vectorizationStatus.relationshipAnalysis && userA && userB && compositeChart && (
          <UserChatBirthChart
              chatMessages={chatMessages}
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              isChatLoading={isChatLoading}
              isChatHistoryLoading={isChatHistoryLoading}
              handleSendMessage={handleSendMessage}
              handleKeyPress={handleKeyPress}
              // You can customize the title by passing it as a prop if needed
            />
        )}
      </div>
    </div>
  )
}

export default CompositeDashboard_v4;