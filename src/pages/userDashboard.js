import React, { useEffect, useState, useCallback } from 'react';
import UserHoroscopeContainer from '../UI/prototype/UserHoroscopeContainer';
import useStore from '../Utilities/store';
import { BroadTopicsEnum, ERROR_API_CALL } from '../Utilities/constants';
import {
  getFullBirthChartAnalysis,
  processAndVectorizeBasicAnalysis,
  processAndVectorizeTopicAnalysis,
  generateTopicAnalysis,
  fetchAnalysis,
  chatForUserBirthChart,
  fetchUserChatBirthChartAnalysis
} from '../Utilities/api';
import useAsync from '../hooks/useAsync';
import UserChatBirthChart from '../UI/prototype/UserChatBirthChart';
import './userDashboard.css';

function UserDashboard() {
  const selectedUser = useStore(state => state.selectedUser);
  const userId = useStore(state => state.userId);
  const userPlanets = useStore(state => state.userPlanets);
  const userHouses = useStore(state => state.userHouses);
  const userAspects = useStore(state => state.userAspects);
  const dailyTransits = useStore(state => state.dailyTransits);

  const [isDataPopulated, setIsDataPopulated] = useState(false);


 const [basicAnalysis, setBasicAnalysis] = useState({
    overview: '',
    dominance: {
      elements: { interpretation: '' },
      modalities: { interpretation: '' },
      quadrants: { interpretation: '' }
    },
    planets: {}
  });
  const [subTopicAnalysis, setSubTopicAnalysis] = useState({});
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    currentTopic: null,
    currentSubtopic: null,
    error: null
  });
  
  const [vectorizationStatus, setVectorizationStatus] = useState({
    overview: false,
    planets: {
      Sun: false,
      Moon: false,
      Mercury: false,
      Venus: false,
      Mars: false,
      Jupiter: false,
      Saturn: false,
      Uranus: false,
      Neptune: false,
      Pluto: false,
      Ascendant: false
    },
    dominance: {
      elements: false,
      modalities: false,
      quadrants: false
    },
    basicAnalysis: false,
    topicAnalysis: {
      PERSONALITY_IDENTITY: {
        PERSONAL_IDENTITY: false,
        OUTWARD_EXPRESSION: false,
        INNER_EMOTIONAL_SELF: false,
        CHALLENGES_SELF_EXPRESSION: false
      },
      EMOTIONAL_FOUNDATIONS_HOME: {
        EMOTIONAL_FOUNDATIONS: false,
        FAMILY_DYNAMICS: false,
        HOME_ENVIRONMENT: false,
        FAMILY_CHALLENGES: false
      },
      RELATIONSHIPS_SOCIAL: {
        RELATIONSHIP_PATTERNS: false,
        SOCIAL_CONNECTIONS: false,
        RELATIONSHIP_CHALLENGES: false,
        PARTNERSHIP_NEEDS: false
      },
      CAREER_PURPOSE_PUBLIC_IMAGE: {
        CAREER_PATH: false,
        LIFE_PURPOSE: false,
        PUBLIC_IMAGE: false,
        SKILLS_TALENTS: false
      },
      UNCONSCIOUS_SPIRITUALITY: {
        SPIRITUAL_PATH: false,
        UNCONSCIOUS_PATTERNS: false,
        TRANSFORMATIVE_EVENTS: false,
        HEALING_GROWTH: false
      },
      COMMUNICATION_BELIEFS: {
        COMMUNICATION_STYLE: false,
        LEARNING_PATTERNS: false,
        BELIEF_SYSTEMS: false,
        MENTAL_GROWTH_CHALLENGES: false
      },
      isComplete: false
    },
    lastUpdated: null
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [birthChartAnalysisId, setBirthChartAnalysisId] = useState(null);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);

  const {
    execute: fetchAnalysisForUserAsync,
    loading: fetchLoading,
    error: fetchError
  } = useAsync(fetchAnalysisForUser);

  const {
    execute: generateShortOverviewAsync,
    loading: shortOverviewLoading,
    error: shortOverviewError
  } = useAsync(generateShortOverview);

  const {
    execute: processBasicAnalysisAsync,
    loading: basicAnalysisLoading,
    error: basicAnalysisError
  } = useAsync(processBasicAnalysis);

  const {
    execute: handleGenerateTopicAnalysis,
    loading: topicAnalysisLoading,
    error: topicAnalysisError
  } = useAsync(generateAndReturnTopicAnalysis);

  const {
    execute: handleProcessTopicAnalysis,
    loading: topicProcessingLoading,
    error: topicProcessingError
  } = useAsync(processTopicAnalysis);

  const globalLoading =
    fetchLoading ||
    shortOverviewLoading ||
    basicAnalysisLoading ||
    topicAnalysisLoading ||
    topicProcessingLoading;

  const globalError =
    fetchError ||
    shortOverviewError ||
    basicAnalysisError ||
    topicAnalysisError ||
    topicProcessingError ||
    processingStatus.error;



  useEffect(() => {
    if (userId) {
      console.log('userId')
      console.log(userId)
      if (userAspects.length !== 0 || userHouses.length !== 0 || userPlanets.length !== 0) {
      setIsDataPopulated(true);
      }
    }
  }, [userId]);



  // check if user has analysis already
  useEffect(() => {
    if (userId) {
      fetchAnalysisForUserAsync();
    }
  }, [userId])

  async function fetchAnalysisForUser() {
    try {
      const response = await fetchAnalysis(userId);
      console.log("response", response);
      
      const { birthChartAnalysisId, interpretation, vectorizationStatus } = response;
      console.log("birthChartAnalysisId", birthChartAnalysisId);
      console.log("interpretation", interpretation);
      console.log("vectorizationStatus", vectorizationStatus);

      if (birthChartAnalysisId) {
        setBirthChartAnalysisId(birthChartAnalysisId);
      }
      
      // Set basicAnalysis state if it exists
      if (interpretation?.basicAnalysis) {
        setBasicAnalysis({
          overview: interpretation.basicAnalysis.overview || '',
          dominance: {
            elements: interpretation.basicAnalysis.dominance?.elements || { interpretation: '', description: [] },
            modalities: interpretation.basicAnalysis.dominance?.modalities || { interpretation: '', description: [] },
            quadrants: interpretation.basicAnalysis.dominance?.quadrants || { interpretation: '', description: [] }
          },
          planets: interpretation.basicAnalysis.planets || {}
        });
      }

      // Set subTopicAnalysis state only if it exists
      if (interpretation?.SubtopicAnalysis) {
        setSubTopicAnalysis(interpretation.SubtopicAnalysis);
      } else {
        setSubTopicAnalysis({});
      }

      // Set vectorization status
      setVectorizationStatus({
        overview: vectorizationStatus?.overview || false,
        planets: vectorizationStatus?.planets || {
          Sun: false,
          Moon: false,
          Mercury: false,
          Venus: false,
          Mars: false,
          Jupiter: false,
          Saturn: false,
          Uranus: false,
          Neptune: false,
          Pluto: false,
          Ascendant: false
        },
        dominance: vectorizationStatus?.dominance || {
          elements: false,
          modalities: false,
          quadrants: false
        },
        basicAnalysis: vectorizationStatus?.basicAnalysis || false,
        topicAnalysis: {
          PERSONALITY_IDENTITY: vectorizationStatus?.topicAnalysis?.PERSONALITY_IDENTITY || {
            PERSONAL_IDENTITY: false,
            OUTWARD_EXPRESSION: false,
            INNER_EMOTIONAL_SELF: false,
            CHALLENGES_SELF_EXPRESSION: false
          },
          EMOTIONAL_FOUNDATIONS_HOME: vectorizationStatus?.topicAnalysis?.EMOTIONAL_FOUNDATIONS_HOME || {
            EMOTIONAL_FOUNDATIONS: false,
            FAMILY_DYNAMICS: false,
            HOME_ENVIRONMENT: false,
            FAMILY_CHALLENGES: false
          },
          RELATIONSHIPS_SOCIAL: vectorizationStatus?.topicAnalysis?.RELATIONSHIPS_SOCIAL || {
            RELATIONSHIP_PATTERNS: false,
            SOCIAL_CONNECTIONS: false,
            RELATIONSHIP_CHALLENGES: false,
            PARTNERSHIP_NEEDS: false
          },
          CAREER_PURPOSE_PUBLIC_IMAGE: vectorizationStatus?.topicAnalysis?.CAREER_PURPOSE_PUBLIC_IMAGE || {
            CAREER_PATH: false,
            LIFE_PURPOSE: false,
            PUBLIC_IMAGE: false,
            SKILLS_TALENTS: false
          },
          UNCONSCIOUS_SPIRITUALITY: vectorizationStatus?.topicAnalysis?.UNCONSCIOUS_SPIRITUALITY || {
            SPIRITUAL_PATH: false,
            UNCONSCIOUS_PATTERNS: false,
            TRANSFORMATIVE_EVENTS: false,
            HEALING_GROWTH: false
          },
          COMMUNICATION_BELIEFS: vectorizationStatus?.topicAnalysis?.COMMUNICATION_BELIEFS || {
            COMMUNICATION_STYLE: false,
            LEARNING_PATTERNS: false,
            BELIEF_SYSTEMS: false,
            MENTAL_GROWTH_CHALLENGES: false
          },
          isComplete: vectorizationStatus?.topicAnalysis?.isComplete || false
        },
        lastUpdated: vectorizationStatus?.lastUpdated || null
      });

  } catch (error) {
    console.error(ERROR_API_CALL, error);
    // Set default states on error
      setBasicAnalysis({
        overview: '',
        dominance: {
          elements: { interpretation: '', description: [] },
          modalities: { interpretation: '', description: [] },
          quadrants: { interpretation: '', description: [] }
        },
        planets: {}
      });
      setSubTopicAnalysis({});
      setVectorizationStatus({
        overview: false,
        planets: {
          Sun: false,
          Moon: false,
          Mercury: false,
          Venus: false,
          Mars: false,
          Jupiter: false,
          Saturn: false,
          Uranus: false,
          Neptune: false,
          Pluto: false,
          Ascendant: false
        },
        dominance: {
          elements: false,
          modalities: false,
          quadrants: false
        },
        basicAnalysis: false,
        topicAnalysis: {
          PERSONALITY_IDENTITY: {
            PERSONAL_IDENTITY: false,
            OUTWARD_EXPRESSION: false,
            INNER_EMOTIONAL_SELF: false,
            CHALLENGES_SELF_EXPRESSION: false
          },
          EMOTIONAL_FOUNDATIONS_HOME: {
            EMOTIONAL_FOUNDATIONS: false,
            FAMILY_DYNAMICS: false,
            HOME_ENVIRONMENT: false,
            FAMILY_CHALLENGES: false
          },
          RELATIONSHIPS_SOCIAL: {
            RELATIONSHIP_PATTERNS: false,
            SOCIAL_CONNECTIONS: false,
            RELATIONSHIP_CHALLENGES: false,
            PARTNERSHIP_NEEDS: false
          },
          CAREER_PURPOSE_PUBLIC_IMAGE: {
            CAREER_PATH: false,
            LIFE_PURPOSE: false,
            PUBLIC_IMAGE: false,
            SKILLS_TALENTS: false
          },
          UNCONSCIOUS_SPIRITUALITY: {
            SPIRITUAL_PATH: false,
            UNCONSCIOUS_PATTERNS: false,
            TRANSFORMATIVE_EVENTS: false,
            HEALING_GROWTH: false
          },
          COMMUNICATION_BELIEFS: {
            COMMUNICATION_STYLE: false,
            LEARNING_PATTERNS: false,
            BELIEF_SYSTEMS: false,
            MENTAL_GROWTH_CHALLENGES: false
          },
          isComplete: false
        },
    lastUpdated: null
  });
    throw error;
    }
  };


  async function generateShortOverview() {
    try {
        const responseObject = await getFullBirthChartAnalysis(selectedUser);
        
        // Debug logs
        console.log("Full response object:", responseObject);
        
        // Parse response if needed
        let parsedResponse = typeof responseObject === 'string' 
            ? JSON.parse(responseObject) 
            : responseObject;

        if (parsedResponse && typeof parsedResponse === 'object') {
            const responseData = parsedResponse.data;
            
            // Update the basicAnalysis state with all data at once
            setBasicAnalysis({
                overview: responseData.overview || 'No overview available',
                dominance: {
                    elements: {
                        interpretation: responseData.dominance?.elements?.interpretation || ''
                    },
                    modalities: {
                        interpretation: responseData.dominance?.modalities?.interpretation || ''
                    },
                    quadrants: {
                        interpretation: responseData.dominance?.quadrants?.interpretation || ''
                    }
                },
                planets: {
                    Sun: { interpretation: responseData.planets?.Sun?.interpretation || '' },
                    Moon: { interpretation: responseData.planets?.Moon?.interpretation || '' },
                    Ascendant: { interpretation: responseData.planets?.Ascendant?.interpretation || '' },
                    Mercury: { interpretation: responseData.planets?.Mercury?.interpretation || '' },
                    Venus: { interpretation: responseData.planets?.Venus?.interpretation || '' },
                    Mars: { interpretation: responseData.planets?.Mars?.interpretation || '' },
                    Jupiter: { interpretation: responseData.planets?.Jupiter?.interpretation || '' },
                    Saturn: { interpretation: responseData.planets?.Saturn?.interpretation || '' },
                    Uranus: { interpretation: responseData.planets?.Uranus?.interpretation || '' },
                    Neptune: { interpretation: responseData.planets?.Neptune?.interpretation || '' },
                    Pluto: { interpretation: responseData.planets?.Pluto?.interpretation || '' }
                }
            });

        } else {
            console.warn("Invalid response object:", parsedResponse);
            setBasicAnalysis({
                overview: 'Unable to generate overview at this time',
                dominance: {
                    elements: { interpretation: '' },
                    modalities: { interpretation: '' },
                    quadrants: { interpretation: '' }
                },
                planets: {}
            });
        }
    } catch (error) {
        console.error('Error generating overview:', error);
        setBasicAnalysis({
            overview: 'Error generating overview. Please try again.',
            dominance: {
                elements: { interpretation: '' },
                modalities: { interpretation: '' },
                quadrants: { interpretation: '' }
            },
            planets: {}
        });
    }
};

async function processBasicAnalysis() {
  console.log("userId", userId)
  try {
    const response = await processAndVectorizeBasicAnalysis(userId)
    console.log("response", response)
    
    if (response.success) {
      // Update vectorization status to reflect that basic analysis is complete
      setVectorizationStatus(prevStatus => ({
        ...prevStatus,
        basicAnalysis: true,
        // Optionally update other basic analysis related statuses if needed
        overview: true,
        planets: {
          ...prevStatus.planets,
          Sun: true,
          Moon: true,
          Mercury: true,
          Venus: true,
          Mars: true,
          Jupiter: true,
          Saturn: true,
          Uranus: true,
          Neptune: true,
          Pluto: true,
          Ascendant: true
        },
        dominance: {
          elements: true,
          modalities: true,
          quadrants: true
        }
      }));
    } else {
      throw new Error('Failed to process basic analysis');
    }
  } catch (error) {
    console.error('Error processing basic analysis:', error);
    throw error;
  }
}

async function processTopicAnalysis() {
  console.log("Starting topic analysis processing for userId:", userId);
  
  setProcessingStatus(prev => ({
    ...prev,
    isProcessing: true,
    error: null
  }));

  try {
    const response = await processAndVectorizeTopicAnalysis(userId);
    console.log("Processing response:", response);
    
    if (response.success) {
      // Update vectorization status to reflect completion
      setVectorizationStatus(prevStatus => ({
        ...prevStatus,
        topicAnalysis: {
          ...prevStatus.topicAnalysis,
          PERSONALITY_IDENTITY: {
            PERSONAL_IDENTITY: true,
            OUTWARD_EXPRESSION: true,
            INNER_EMOTIONAL_SELF: true,
            CHALLENGES_SELF_EXPRESSION: true
          },
          EMOTIONAL_FOUNDATIONS_HOME: {
            EMOTIONAL_FOUNDATIONS: true,
            FAMILY_DYNAMICS: true,
            HOME_ENVIRONMENT: true,
            FAMILY_CHALLENGES: true
          },
          RELATIONSHIPS_SOCIAL: {
            RELATIONSHIP_PATTERNS: true,
            SOCIAL_CONNECTIONS: true,
            RELATIONSHIP_CHALLENGES: true,
            PARTNERSHIP_NEEDS: true
          },
          CAREER_PURPOSE_PUBLIC_IMAGE: {
            CAREER_PATH: true,
            LIFE_PURPOSE: true,
            PUBLIC_IMAGE: true,
            SKILLS_TALENTS: true
          },
          UNCONSCIOUS_SPIRITUALITY: {
            SPIRITUAL_PATH: true,
            UNCONSCIOUS_PATTERNS: true,
            TRANSFORMATIVE_EVENTS: true,
            HEALING_GROWTH: true
          },
          COMMUNICATION_BELIEFS: {
            COMMUNICATION_STYLE: true,
            LEARNING_PATTERNS: true,
            BELIEF_SYSTEMS: true,
            MENTAL_GROWTH_CHALLENGES: true
          },
          isComplete: true
        },
        lastUpdated: new Date().toISOString()
      }));
    } else {
      throw new Error(response.error || 'Processing failed');
    }
  } catch (error) {
    console.error('Error processing topic analysis:', error);
    setProcessingStatus(prev => ({
      ...prev,
      error: error.message
    }));
    throw error;
  } finally {
    setProcessingStatus(prev => ({
      ...prev,
      isProcessing: false,
      currentTopic: null,
      currentSubtopic: null
    }));
  }
};

async function generateAndReturnTopicAnalysis() {
  console.log("userId", userId);
  try {
    const result = await generateTopicAnalysis(userId);
    if (result.success) {
      setSubTopicAnalysis(result.results);
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

// Function to load chat history
const loadChatHistory = useCallback(async () => {
  if (!userId || !birthChartAnalysisId) {
    return;
  }

  setIsChatHistoryLoading(true);
  try {
    const response = await fetchUserChatBirthChartAnalysis(userId, birthChartAnalysisId);
    console.log("Chat history response:", response);
    
    // Transform the backend messages to match your frontend format
    if (response && response.success && Array.isArray(response.chatHistory)) {
      const transformedMessages = response.chatHistory.map((message, index) => ({
        id: `history-${index}-${Date.now()}`, // Create unique IDs
        type: message.role === 'user' ? 'user' : 'bot',
        content: message.content,
        timestamp: new Date(message.timestamp)
      }));
      
      setChatMessages(transformedMessages);
    } else {
      console.log("No chat history found or invalid response format");
      setChatMessages([]);
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
    // Optionally show an error message to the user
    setChatMessages([{
      id: `error-${Date.now()}`,
      type: 'error',
      content: 'Failed to load chat history',
      timestamp: new Date()
    }]);
  } finally {
    setIsChatHistoryLoading(false);
  }
}, [userId, birthChartAnalysisId]);

// Load chat history when component mounts or when userId/interpretation changes
useEffect(() => {
  if (vectorizationStatus.topicAnalysis.isComplete && userId && birthChartAnalysisId) {
    loadChatHistory();
  }
}, [vectorizationStatus.topicAnalysis.isComplete, userId, birthChartAnalysisId, loadChatHistory]);

const handleSendMessage = async () => {
  if (!currentMessage.trim() || !userId) {
    return;
  }

  const userMessage = currentMessage.trim();
  setCurrentMessage(''); // Clear input immediately
  setIsChatLoading(true);

  // Add user message to chat
  const newUserMessage = {
    id: Date.now(),
    type: 'user',
    content: userMessage,
    timestamp: new Date()
  };

  setChatMessages(prev => [...prev, newUserMessage]);

  try {
    const response = await chatForUserBirthChart(userId, birthChartAnalysisId, userMessage);
    
    // Add API response to chat
    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: response.answer || 'No response received',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, botMessage]);
  } catch (error) {
    console.error('Error sending chat message:', error);
    
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

// Determine which step of the workflow should run next
const getNextAction = () => {
  if (!basicAnalysis.overview) return 'generateBasic';
  if (!vectorizationStatus.basicAnalysis) return 'vectorizeBasic';
  if (Object.keys(subTopicAnalysis).length === 0) return 'generateTopic';
  if (!vectorizationStatus.topicAnalysis.isComplete) return 'vectorizeTopic';
  return 'complete';
};

// Trigger the appropriate function based on the next action
const handleWorkflow = async () => {
  const action = getNextAction();
  switch (action) {
    case 'generateBasic':
      await generateShortOverviewAsync();
      break;
    case 'vectorizeBasic':
      await processBasicAnalysisAsync();
      break;
    case 'generateTopic':
      await handleGenerateTopicAnalysis();
      break;
    case 'vectorizeTopic':
      await handleProcessTopicAnalysis();
      break;
    default:
      break;
  }
};

// Compute progress step for the status tracker
const computeProgressStep = () => {
  let step = 0;
  if (basicAnalysis.overview) step++;
  if (vectorizationStatus.basicAnalysis) step++;
  if (Object.keys(subTopicAnalysis).length > 0) step++;
  if (vectorizationStatus.topicAnalysis.isComplete) step++;
  return step;
};

const getButtonLabel = () => {
  const action = getNextAction();
  switch (action) {
    case 'generateBasic':
      return shortOverviewLoading ? 'Generating Basic Analysis...' : 'Generate Basic Analysis';
    case 'vectorizeBasic':
      return basicAnalysisLoading ? 'Vectorizing Basic Analysis...' : 'Vectorize Basic Analysis';
    case 'generateTopic':
      return topicAnalysisLoading ? 'Generating Topic Analysis...' : 'Generate Topic Analysis';
    case 'vectorizeTopic':
      return topicProcessingLoading ? 'Vectorizing Topic Analysis...' : 'Vectorize Topic Analysis';
    default:
      return 'Workflow Complete';
  }
};

// Automatically progress through the workflow when possible
useEffect(() => {
  const next = getNextAction();
  if (!globalLoading && !globalError && next !== 'complete') {
    handleWorkflow();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  basicAnalysis.overview,
  vectorizationStatus.basicAnalysis,
  subTopicAnalysis,
  vectorizationStatus.topicAnalysis.isComplete,
  globalLoading,
  globalError
]);

  return (
    <div className="user-prototype-page">

        {globalLoading && (
          <div className="status-banner">Loading...</div>
        )}
        {globalError && (
          <div className="status-banner error">Error: {globalError}</div>
        )}
   
        <UserHoroscopeContainer
          selectedUser={selectedUser}
          isDataPopulated={isDataPopulated}
          userPlanets={userPlanets}
          userHouses={userHouses}
          userAspects={userAspects}
          dailyTransits={dailyTransits}
        />

      <div className="progress-tracker">
        {['Basic Analysis', 'Vectorizing Basic Analysis', 'Topic Analysis', 'Vectorizing Topic Analysis'].map((stage, index) => (
          <div
            key={stage}
            className={`progress-step ${computeProgressStep() > index ? 'completed' : ''} ${computeProgressStep() === index ? 'current' : ''}`}
          >
            {stage}
          </div>
        ))}
      </div>
      <button
        onClick={handleWorkflow}
        disabled={globalLoading || getNextAction() === 'complete'}
      >
        {getButtonLabel()}
      </button>

      {processingStatus.error && (
        <div className="error-message">
          Error: {processingStatus.error}
        </div>
      )}

      {birthChartAnalysisId && userId && vectorizationStatus.topicAnalysis.isComplete && (
        <UserChatBirthChart
          chatMessages={chatMessages}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          isChatLoading={isChatLoading}
          isChatHistoryLoading={isChatHistoryLoading}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
        />
      )}

      <div className="basic-analysis">
      <h2>Birth Chart Analysis</h2>
      
      {/* Main Overview */}
      <section className="overview-section">
        <h3>Overview</h3>
        <p>{basicAnalysis.overview}</p>
      </section>

      {/* Dominance Section */}
      <section className="dominance-section">
        <h3>Chart Patterns</h3>
        <div className="pattern-grid">
          <div className="pattern-card">
            <h4>Elements</h4>
            <p>{basicAnalysis.dominance?.elements?.interpretation}</p>
          </div>
          <div className="pattern-card">
            <h4>Modalities</h4>
            <p>{basicAnalysis.dominance?.modalities?.interpretation}</p>
          </div>
          <div className="pattern-card">
            <h4>Quadrants</h4>
            <p>{basicAnalysis.dominance?.quadrants?.interpretation}</p>
          </div>
        </div>
      </section>

      {/* Planets Section */}
      <section className="planets-section">
        <h3>Planetary Influences</h3>
        <div className="planet-grid">
          {Object.entries(basicAnalysis.planets || {}).map(([planet, data]) => (
            <div key={planet} className="planet-card">
              <h4>{planet}</h4>
              <p>{data.interpretation}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    
      <div className="topic-analysis-section">

        {topicAnalysisError && (
          <div className="error-message">
            Error: {topicAnalysisError}
          </div>
        )}

        {Object.entries(subTopicAnalysis).map(([topic, data]) => (
          <div key={topic} className="topic-section">
            <h3>{data.label}</h3>
            <div className="subtopics">
              {Object.entries(data.subtopics).map(([subtopicKey, content]) => (
                <div key={subtopicKey} className="subtopic">
                  <h4>{BroadTopicsEnum[topic].subtopics[subtopicKey].replace(/_/g, ' ')}</h4>
                  <p>{content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;