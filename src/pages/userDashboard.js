// Updated UserDashboard component with polling workflow

import React, { useEffect, useState, useCallback } from 'react';

// Order in which planetary interpretations should appear
const PLANET_ORDER = [
  'Sun',
  'Moon',
  'Ascendant',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Node'
];
import UserBirthChartContainer from '../UI/prototype/UserBirthChartContainer';
import useStore from '../Utilities/store';
import { BroadTopicsEnum, ERROR_API_CALL } from '../Utilities/constants';
import {
  fetchAnalysis,
  chatForUserBirthChart,
  fetchUserChatBirthChartAnalysis,
  getTransitWindows,
  startWorkflow,
  getWorkflowStatus
} from '../Utilities/api';
import useAsync from '../hooks/useAsync';
import UserChatBirthChart from '../UI/prototype/UserChatBirthChart';
import HoroscopeContainer from '../UI/prototype/HoroscopeContainer';
import TabMenu from '../UI/shared/TabMenu';
import './userDashboard.css';
import PatternCard from '../UI/prototype/PatternCard';
import PlanetCard from '../UI/prototype/PlanetCard';

function UserDashboard() {
  const selectedUser = useStore(state => state.selectedUser);
  const userId = useStore(state => state.userId);
  const userPlanets = useStore(state => state.userPlanets);
  const userHouses = useStore(state => state.userHouses);
  const userAspects = useStore(state => state.userAspects);
  const dailyTransits = useStore(state => state.dailyTransits);
  const userElements = useStore(state => state.userElements);
  const userModalities = useStore(state => state.userModalities);
  const userQuadrants = useStore(state => state.userQuadrants);
  const userPatterns = useStore(state => state.userPatterns);

  const [isDataPopulated, setIsDataPopulated] = useState(false);
  const [basicAnalysis, setBasicAnalysis] = useState({
    overview: '',
    dominance: {
      elements: { interpretation: '' },
      modalities: { interpretation: '' },
      quadrants: { interpretation: '' },
      patterns: { interpretation: '' }
    },
    planets: {}
  });
  const [subTopicAnalysis, setSubTopicAnalysis] = useState({});
  const [vectorizationStatus, setVectorizationStatus] = useState({
    overview: false,
    planets: {
      Sun: false, Moon: false, Mercury: false, Venus: false, Mars: false,
      Jupiter: false, Saturn: false, Uranus: false, Neptune: false, Pluto: false, Ascendant: false
    },
    dominance: { elements: false, modalities: false, quadrants: false },
    basicAnalysis: false,
    topicAnalysis: {
      PERSONALITY_IDENTITY: { PERSONAL_IDENTITY: false, OUTWARD_EXPRESSION: false, INNER_EMOTIONAL_SELF: false, CHALLENGES_SELF_EXPRESSION: false },
      EMOTIONAL_FOUNDATIONS_HOME: { EMOTIONAL_FOUNDATIONS: false, FAMILY_DYNAMICS: false, HOME_ENVIRONMENT: false, FAMILY_CHALLENGES: false },
      RELATIONSHIPS_SOCIAL: { RELATIONSHIP_DESIRES: false, LOVE_STYLE: false, SEXUAL_NATURE: false, COMMITMENT_APPROACH: false, RELATIONSHIP_CHALLENGES: false },
      CAREER_PURPOSE_PUBLIC_IMAGE: { CAREER_MOTIVATIONS: false, PUBLIC_IMAGE: false, CAREER_CHALLENGES: false, SKILLS_TALENTS: false },
      UNCONSCIOUS_SPIRITUALITY: { PSYCHOLOGICAL_PATTERNS: false, SPIRITUAL_GROWTH: false, KARMIC_LESSONS: false, TRANSFORMATIVE_EVENTS: false },
      COMMUNICATION_BELIEFS: { COMMUNICATION_STYLES: false, PHILOSOPHICAL_BELIEFS: false, TRAVEL_EXPERIENCES: false, MENTAL_GROWTH_CHALLENGES: false },
      isComplete: false
    },
    lastUpdated: null
  });

  // Workflow state
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [birthChartAnalysisId, setBirthChartAnalysisId] = useState(null);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
  const [transitWindows, setTransitWindows] = useState([]);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState(null);

  const {
    execute: fetchAnalysisForUserAsync,
    loading: fetchLoading,
    error: fetchError
  } = useAsync(fetchAnalysisForUser);

  useEffect(() => {
    if (userId) {
      if (userAspects.length !== 0 || userHouses.length !== 0 || userPlanets.length !== 0) {
        setIsDataPopulated(true);
      }
    }
  }, [userId]);

  // Check if user has analysis already
  useEffect(() => {
    if (userId) {
      fetchAnalysisForUserAsync();
    }
  }, [userId]);

  async function fetchAnalysisForUser() {
    try {
      const response = await fetchAnalysis(userId);
      console.log("Analysis response:", response);
      
      const { birthChartAnalysisId, interpretation, vectorizationStatus } = response;

      if (birthChartAnalysisId) {
        setBirthChartAnalysisId(birthChartAnalysisId);
      }
      
      // Set basicAnalysis state if it exists
      if (interpretation?.basicAnalysis) {
        console.log("Basic analysis interpretation:", interpretation.basicAnalysis);
        setBasicAnalysis({
          overview: interpretation.basicAnalysis.overview || '',
          dominance: {
            elements: interpretation.basicAnalysis.dominance?.elements || { interpretation: '' },
            modalities: interpretation.basicAnalysis.dominance?.modalities || { interpretation: '' },
            quadrants: interpretation.basicAnalysis.dominance?.quadrants || { interpretation: '' },
            patterns: interpretation.basicAnalysis.dominance?.patterns || { interpretation: '' }
          },
          planets: interpretation.basicAnalysis.planets || {}
        });
      }

      // Set subTopicAnalysis state only if it exists
      if (interpretation?.SubtopicAnalysis) {
        setSubTopicAnalysis(interpretation.SubtopicAnalysis);
      }

      // Set vectorization status with proper defaults
      setVectorizationStatus(prevStatus => ({
        overview: vectorizationStatus?.overview || false,
        planets: vectorizationStatus?.planets || prevStatus.planets,
        dominance: vectorizationStatus?.dominance || prevStatus.dominance,
        basicAnalysis: vectorizationStatus?.basicAnalysis || false,
        topicAnalysis: vectorizationStatus?.topicAnalysis || prevStatus.topicAnalysis,
        lastUpdated: vectorizationStatus?.lastUpdated || null
      }));

      // Set workflow status if analysis is complete
      if (vectorizationStatus?.topicAnalysis?.isComplete && 
          vectorizationStatus?.basicAnalysis && 
          vectorizationStatus?.overview) {
        setWorkflowStatus({
          status: 'completed',
          progress: {
            processAllContent: { status: 'completed', completed: 48, total: 48 }
          }
        });
      }

    } catch (error) {
      console.error(ERROR_API_CALL, error);
      // Reset to defaults on error
      setBasicAnalysis({
        overview: '',
        dominance: {
          elements: { interpretation: '', description: [] },
          modalities: { interpretation: '', description: [] },
          quadrants: { interpretation: '', description: [] },
          patterns: { interpretation: '', description: [] }
        },
        planets: {}
      });
      setSubTopicAnalysis({});
      throw error;
    }
  }

  // Start workflow function
  const handleStartWorkflow = async () => {
    if (!userId) {
      console.error('Cannot start workflow: userId is missing');
      return;
    }
    
    console.log('Starting workflow with userId:', userId, 'type:', typeof userId);
    
    try {
      const response = await startWorkflow(userId);
      if (response.success) {
        setWorkflowStatus(response.status);
        startPolling();
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
    }
  };

  // Manual status check function
  const checkWorkflowStatus = async () => {
    if (!userId) return;
    
    try {
      const response = await getWorkflowStatus(userId);
      console.log('Workflow status response:', response);
      
      if (response.success) {
        setWorkflowStatus(response.status);
        setConnectionError(false);
        setRetryCount(0);
        
        if (response.analysisData) {
          updateAnalysisFromWorkflow(response.analysisData);
        }
        
        // Stop polling if workflow is complete or has error
        if (response.status.status === 'completed' || response.status.status === 'error') {
          stopPolling();
        }
        // If workflow is still running, resume polling
        else if (response.status.status === 'running' && !isPolling) {
          startPolling();
        }
      }
    } catch (error) {
      console.error('Error checking workflow status:', error);
      setConnectionError(true);
    }
  };

  // Polling function with retry logic
  const pollWorkflowStatus = useCallback(async () => {
    if (!userId) {
      console.error('Cannot poll workflow status: userId is missing');
      stopPolling();
      return;
    }
    
    try {
      const response = await getWorkflowStatus(userId);
      console.log('Polling workflow status:', response);
      
      if (response.success) {
        setWorkflowStatus(response.status);
        setConnectionError(false);
        setRetryCount(0);
        
        if (response.analysisData) {
          updateAnalysisFromWorkflow(response.analysisData);
        }
        
        // Stop polling if workflow is complete or has error
        if (response.status.status === 'completed' || response.status.status === 'error') {
          stopPolling();
        }
      }
    } catch (error) {
      console.error('Error polling workflow status:', error);
      setConnectionError(true);
      setRetryCount(prev => prev + 1);
      
      // Stop polling after 10 retries
      if (retryCount >= 10) {
        stopPolling();
      }
    }
  }, [userId, retryCount]);

  // Update analysis data from workflow response
  const updateAnalysisFromWorkflow = (analysisData) => {
    console.log('Updating analysis from workflow:', analysisData);
    
    // Check if data is nested under interpretation key
    const interpretation = analysisData.interpretation || analysisData;
    
    // Handle basic analysis updates
    const basicAnalysisData = interpretation.basicAnalysis || analysisData.basicAnalysis;
    if (basicAnalysisData) {
      setBasicAnalysis({
        overview: basicAnalysisData.overview || '',
        dominance: {
          elements: basicAnalysisData.dominance?.elements || { interpretation: '' },
          modalities: basicAnalysisData.dominance?.modalities || { interpretation: '' },
          quadrants: basicAnalysisData.dominance?.quadrants || { interpretation: '' },
          patterns: basicAnalysisData.dominance?.patterns || { interpretation: '' }
        },
        planets: basicAnalysisData.planets || {}
      });
    }

    // Handle topic analysis updates (could be SubtopicAnalysis or topicAnalysis)
    const subtopicData = interpretation.SubtopicAnalysis || analysisData.SubtopicAnalysis || 
                        interpretation.topicAnalysis || analysisData.topicAnalysis;
    if (subtopicData) {
      setSubTopicAnalysis(subtopicData);
    }

    // Handle vectorization status updates
    if (analysisData.vectorizationStatus) {
      setVectorizationStatus(prev => ({
        ...prev,
        ...analysisData.vectorizationStatus
      }));
    }

    // Set birthChartAnalysisId if available
    if (analysisData.birthChartAnalysisId) {
      setBirthChartAnalysisId(analysisData.birthChartAnalysisId);
    }
  };

  // Start polling
  const startPolling = () => {
    setIsPolling(true);
    setConnectionError(false);
    setRetryCount(0);
    const interval = setInterval(pollWorkflowStatus, 3000); // Poll every 3 seconds
    setPollInterval(interval);
  };

  // Stop polling
  const stopPolling = () => {
    setIsPolling(false);
    setConnectionError(false);
    setRetryCount(0);
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  // Check for existing workflow on component mount
  useEffect(() => {
    if (userId && !workflowStatus) {
      checkWorkflowStatus();
    }
  }, [userId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Determine workflow status for UI
  const isWorkflowRunning = workflowStatus?.status === 'running';
  const workflowComplete = workflowStatus?.status === 'completed';
  const workflowError = workflowStatus?.status === 'error';

  // Progress calculation with granular step progress
  const computeWorkflowProgress = () => {
    if (!workflowStatus?.progress) return 0;
    
    const stepProgress = workflowStatus.progress.processAllContent;
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
    
    const stepProgress = workflowStatus.progress?.processAllContent;
    
    if (stepProgress?.total > 0) {
      const completed = stepProgress.completed || 0;
      const total = stepProgress.total;
      
      // Provide more descriptive text based on progress
      if (completed <= 5) {
        return `Analyzing chart patterns... (${completed}/${total})`;
      } else if (completed <= 18) {
        return `Interpreting planetary influences... (${completed}/${total})`;
      } else if (completed <= 48) {
        return `Generating life area insights... (${completed}/${total})`;
      }
      return `Finalizing analysis... (${completed}/${total})`;
    }
    
    return 'Processing your birth chart analysis...';
  };

  // Chat functions (simplified)
  const loadChatHistory = useCallback(async () => {
    if (!userId || !birthChartAnalysisId) return;
    
    setIsChatHistoryLoading(true);
    try {
      const response = await fetchUserChatBirthChartAnalysis(userId, birthChartAnalysisId);
      if (response?.success && Array.isArray(response.chatHistory)) {
        const transformedMessages = response.chatHistory.map((message, index) => ({
          id: `history-${index}-${Date.now()}`,
          type: message.role === 'user' ? 'user' : 'bot',
          content: message.content,
          timestamp: new Date(message.timestamp)
        }));
        setChatMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsChatHistoryLoading(false);
    }
  }, [userId, birthChartAnalysisId]);

  useEffect(() => {
    if (vectorizationStatus.topicAnalysis.isComplete && userId && birthChartAnalysisId) {
      loadChatHistory();
    }
  }, [vectorizationStatus.topicAnalysis.isComplete, userId, birthChartAnalysisId, loadChatHistory]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !userId) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setIsChatLoading(true);

    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await chatForUserBirthChart(userId, birthChartAnalysisId, userMessage);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer || 'No response received',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
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

  // Transit windows function (simplified)
  const fetchTransitWindows = async () => {
    if (!userPlanets || userPlanets.length === 0) return;

    setTransitLoading(true);
    setTransitError(null);

    try {
      const now = new Date();
      const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const toDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      const response = await getTransitWindows(userId, fromDate.toISOString(), toDate.toISOString());
      
      if (response && (response.transitEvents || response.transitToTransitEvents)) {
        const allTransitEvents = [
          ...(response.transitEvents || []),
          ...(response.transitToTransitEvents || [])
        ];
        setTransitWindows(allTransitEvents);
      } else {
        setTransitError("Invalid response format from transit API");
      }
    } catch (error) {
      console.error("Error fetching transit windows:", error);
      setTransitError(error.message);
    } finally {
      setTransitLoading(false);
    }
  };

  useEffect(() => {
    if (userPlanets && userPlanets.length > 0 && isDataPopulated) {
      fetchTransitWindows();
    }
  }, [userPlanets, isDataPopulated]);

  // Build tabs
  const tabs = [];

  if (birthChartAnalysisId && userId && vectorizationStatus.topicAnalysis.isComplete) {
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

  tabs.push({
    id: 'overview',
    label: 'Overview',
    content: (
      <section className="overview-section">
        <p>{basicAnalysis.overview}</p>
      </section>
    )
  });

  tabs.push({
    id: 'patterns',
    label: 'Chart Patterns',
    content: (
      <section className="dominance-section">
        <div className="pattern-grid">
          <PatternCard
            title="Elements"
            data={{
              ...userElements,
              interpretation: basicAnalysis.dominance?.elements?.interpretation
            }}
            type="elements"
          />
          <PatternCard
            title="Modalities"
            data={{
              ...userModalities,
              interpretation: basicAnalysis.dominance?.modalities?.interpretation
            }}
            type="modalities"
          />
          <PatternCard
            title="Quadrants"
            data={{
              ...userQuadrants,
              interpretation: basicAnalysis.dominance?.quadrants?.interpretation
            }}
            type="quadrants"
          />
          {console.log('Patterns data:', {
            patterns: userPatterns,
            interpretation: basicAnalysis.dominance?.patterns?.interpretation
          })}
          <PatternCard
            title="Patterns and Structures"
            data={{
              patterns: userPatterns,
              interpretation: basicAnalysis.dominance?.patterns?.interpretation
            }}
            type="patterns"
          />
        </div>
      </section>
    )
  });

  tabs.push({
    id: 'planets',
    label: 'Planets',
    content: (
      <section className="planets-section">
        <div className="planet-grid">
          {PLANET_ORDER.filter(p => basicAnalysis.planets && basicAnalysis.planets[p])
            .map(planet => (
              <PlanetCard
                key={planet}
                planet={planet}
                interpretation={basicAnalysis.planets[planet].interpretation}
              />
            ))}
        </div>
      </section>
    )
  });

  Object.entries(subTopicAnalysis).forEach(([topic, data]) => {
    tabs.push({
      id: topic,
      label: data.label,
      content: (
        <div className="subtopics">
          {Object.entries(data.subtopics).map(([subtopicKey, content]) => (
            <div key={subtopicKey} className="subtopic">
              <h4>{BroadTopicsEnum[topic].subtopics[subtopicKey].replace(/_/g, ' ')}</h4>
              <p>{content}</p>
            </div>
          ))}
        </div>
      )
    });
  });

  if (isDataPopulated) {
    tabs.push({
      id: 'horoscope',
      label: 'Horoscope',
      content: (
        <HoroscopeContainer
          transitWindows={transitWindows}
          loading={transitLoading}
          error={transitError}
          userId={userId}
        />
      )
    });
  }

  return (
    <div className="user-prototype-page">
      {fetchLoading && (
        <div className="status-banner">Loading existing analysis...</div>
      )}
      {fetchError && (
        <div className="status-banner error">Error: {fetchError}</div>
      )}
   
      <UserBirthChartContainer
        selectedUser={selectedUser}
        isDataPopulated={isDataPopulated}
        userPlanets={userPlanets}
        userHouses={userHouses}
        userAspects={userAspects}
        dailyTransits={dailyTransits}
      />

      {/* Workflow Control Section */}
      <div className="workflow-section">
        {!workflowStatus && !workflowComplete && (
          <div>
            <button
              onClick={handleStartWorkflow}
              disabled={isWorkflowRunning || fetchLoading || !userId}
              className="workflow-button primary"
            >
              Start Analysis Workflow
            </button>
            <button
              onClick={checkWorkflowStatus}
              disabled={fetchLoading || !userId}
              className="workflow-button"
              style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}
            >
              Check Status
            </button>
          </div>
        )}

        {isWorkflowRunning && (
          <div className="workflow-progress">
            <div className="progress-header">
              <h3>Generating Your Birth Chart Analysis</h3>
              <p>{getCurrentStepDescription()}</p>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${computeWorkflowProgress()}%` }}
              ></div>
            </div>
            <div className="progress-percentage">
              {Math.round(computeWorkflowProgress())}% Complete
            </div>
            {workflowStatus?.progress?.processAllContent && (
              <div className="workflow-steps">
                <div className={`workflow-step ${workflowStatus.progress.processAllContent.status}`}>
                  <span className="step-name">
                    Processing All Content
                  </span>
                  <span className="step-status">
                    {workflowStatus.progress.processAllContent.status === 'completed' && '✅'}
                    {workflowStatus.progress.processAllContent.status === 'running' && '🔄'}
                    {workflowStatus.progress.processAllContent.status === 'pending' && '⏳'}
                    {workflowStatus.progress.processAllContent.status === 'error' && '❌'}
                  </span>
                  {workflowStatus.progress.processAllContent.total > 0 && workflowStatus.progress.processAllContent.status === 'running' && (
                    <span className="step-progress">
                      ({workflowStatus.progress.processAllContent.completed}/{workflowStatus.progress.processAllContent.total})
                    </span>
                  )}
                </div>
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

        {workflowComplete && (
          <div className="workflow-complete">
            <h3>✅ Analysis Complete!</h3>
            <p>Your birth chart analysis has been generated and is ready to explore.</p>
            <button
              onClick={checkWorkflowStatus}
              className="workflow-button"
              style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
            >
              Check Status
            </button>
          </div>
        )}

        {workflowError && (
          <div className="workflow-error">
            <h3>❌ Workflow Error</h3>
            <p>Error: {workflowStatus?.error || 'Unknown error occurred'}</p>
            <p>Step: {workflowStatus?.currentStep}</p>
            <button onClick={handleStartWorkflow} className="workflow-button retry">
              Retry Workflow
            </button>
          </div>
        )}
      </div>

      <TabMenu tabs={tabs} />
    </div>
  );
}

export default UserDashboard;