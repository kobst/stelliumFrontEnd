// Updated UserDashboard component with polling workflow

import React, { useEffect, useState, useCallback } from 'react';
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
      console.log("response", response);
      
      const { birthChartAnalysisId, interpretation, vectorizationStatus } = response;

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

    } catch (error) {
      console.error(ERROR_API_CALL, error);
      // Reset to defaults on error
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

  // Polling function
  const pollWorkflowStatus = useCallback(async () => {
    if (!userId) {
      console.error('Cannot poll workflow status: userId is missing');
      stopPolling();
      return;
    }
    
    try {
      const response = await getWorkflowStatus(userId);
      console.log('Workflow status response:', response);
      
      if (response.success) {
        setWorkflowStatus(response.status);
        
        // Update analysis data if available in response
        if (response.analysisData) {
          updateAnalysisFromWorkflow(response.analysisData);
        }
        
        // Check if workflow response contains analysis data directly
        if (response.basicAnalysis || response.SubtopicAnalysis || response.vectorizationStatus) {
          updateAnalysisFromWorkflow(response);
        }

        // Stop polling if workflow is complete or has error
        if (response.status.status === 'completed' || response.status.status === 'error') {
          stopPolling();
          console.log('Workflow finished with status:', response.status.status);
          if (response.status.error) {
            console.error('Workflow error:', response.status.error);
          }
          // Note: Don't call fetchAnalysisForUserAsync() here as it hits the wrong endpoint
          // The workflow status response already contains the analysis data
        }
      }
    } catch (error) {
      console.error('Error polling workflow status:', error);
    }
  }, [userId]);

  // Update analysis data from workflow response
  const updateAnalysisFromWorkflow = (analysisData) => {
    console.log('Updating analysis from workflow:', analysisData);
    
    if (analysisData.basicAnalysis) {
      setBasicAnalysis({
        overview: analysisData.basicAnalysis.overview || '',
        dominance: {
          elements: analysisData.basicAnalysis.dominance?.elements || { interpretation: '' },
          modalities: analysisData.basicAnalysis.dominance?.modalities || { interpretation: '' },
          quadrants: analysisData.basicAnalysis.dominance?.quadrants || { interpretation: '' }
        },
        planets: analysisData.basicAnalysis.planets || {}
      });
    }

    if (analysisData.SubtopicAnalysis) {
      setSubTopicAnalysis(analysisData.SubtopicAnalysis);
    }

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
    const interval = setInterval(pollWorkflowStatus, 3000); // Poll every 3 seconds
    setPollInterval(interval);
  };

  // Stop polling
  const stopPolling = () => {
    setIsPolling(false);
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

  // Determine workflow status for UI
  const isWorkflowRunning = workflowStatus?.status === 'running';
  const workflowComplete = workflowStatus?.status === 'completed';
  const workflowError = workflowStatus?.status === 'error';

  // Progress calculation
  const computeWorkflowProgress = () => {
    if (!workflowStatus?.progress) return 0;
    
    const steps = ['generateBasic', 'vectorizeBasic', 'generateTopic', 'vectorizeTopic'];
    const completedSteps = steps.filter(step => 
      workflowStatus.progress[step]?.status === 'completed'
    ).length;
    
    return (completedSteps / steps.length) * 100;
  };

  // Get current step description
  const getCurrentStepDescription = () => {
    if (!workflowStatus) return '';
    
    const currentStep = workflowStatus.currentStep;
    const stepDescriptions = {
      generateBasic: 'Generating basic birth chart analysis...',
      vectorizeBasic: 'Processing basic analysis for search...',
      generateTopic: 'Generating detailed topic analysis...',
      vectorizeTopic: 'Processing topic analysis for search...'
    };
    
    return stepDescriptions[currentStep] || '';
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
    )
  });

  tabs.push({
    id: 'planets',
    label: 'Planets',
    content: (
      <section className="planets-section">
        <div className="planet-grid">
          {Object.entries(basicAnalysis.planets || {}).map(([planet, data]) => (
            <div key={planet} className="planet-card">
              <h4>{planet}</h4>
              <p>{data.interpretation}</p>
            </div>
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
          <button
            onClick={handleStartWorkflow}
            disabled={isWorkflowRunning || fetchLoading || !userId}
            className="workflow-button primary"
          >
            Start Analysis Workflow
          </button>
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
            {isPolling && <div className="polling-indicator">Checking status...</div>}
          </div>
        )}

        {workflowComplete && (
          <div className="workflow-complete">
            <h3>✅ Analysis Complete!</h3>
            <p>Your birth chart analysis has been generated and is ready to explore.</p>
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