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
import RelationshipsTab from '../UI/prototype/RelationshipsTab';
import OtherProfilesTab from '../UI/prototype/OtherProfilesTab';
import TabMenu from '../UI/shared/TabMenu';
import './userDashboard.css';
import PatternCard from '../UI/prototype/PatternCard';
import PlanetCard from '../UI/prototype/PlanetCard';

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
  'Node',
  'Midheaven'
];

function UserDashboard() {
  const selectedUser = useStore(state => state.selectedUser);
  const userId = useStore(state => state.userId);
  const setCurrentUserContext = useStore(state => state.setCurrentUserContext);
  const setActiveUserContext = useStore(state => state.setActiveUserContext);
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
    workflowStatus: null,
    lastUpdated: null
  });

  // Initialize workflow status as null
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
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [previousWorkflowStatus, setPreviousWorkflowStatus] = useState(null);

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

  // Set user context when dashboard loads
  useEffect(() => {
    if (selectedUser && selectedUser.kind === 'accountSelf') {
      // Set currentUserContext as the dashboard owner for relationship creation
      setCurrentUserContext(selectedUser);
      setActiveUserContext(selectedUser);
    }
  }, [selectedUser, setCurrentUserContext, setActiveUserContext]);

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
            patterns: {
              ...interpretation.basicAnalysis.dominance?.patterns,
              interpretation: interpretation.basicAnalysis.dominance?.patterns?.interpretation || ''
            }
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
        topicAnalysis: {
          ...prevStatus.topicAnalysis,
          ...vectorizationStatus?.topicAnalysis,
          // Check if topic analysis is complete OR workflow is complete
          isComplete: Boolean(
            vectorizationStatus?.topicAnalysis?.isComplete || 
            vectorizationStatus?.workflowStatus?.isComplete
          )
        },
        workflowStatus: vectorizationStatus?.workflowStatus || prevStatus.workflowStatus,
        lastUpdated: vectorizationStatus?.lastUpdated || null
      }));

      // Check actual workflow status from backend
      await checkWorkflowStatus();

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

  // Update checkWorkflowStatus to properly handle initial state
  const checkWorkflowStatus = async () => {
    if (!userId) return;
    
    try {
      const response = await getWorkflowStatus(userId);
      console.log('Workflow status response:', response);
      
      if (response.success) {
        // Set the entire response as the workflow status
        setWorkflowStatus(response);
        setConnectionError(false);
        setRetryCount(0);
        
        if (response.analysisData) {
          updateAnalysisFromWorkflow(response.analysisData);
        }
        
        // Stop polling if workflow is complete or has error
        if (response.workflowStatus?.status === 'completed' || response.workflowStatus?.status === 'error') {
          stopPolling();
        }
        // If workflow is still running, resume polling
        else if (response.workflowStatus?.status === 'running' && !isPolling) {
          startPolling();
        }
      } else {
        // If request failed, ensure workflow is not running
        setWorkflowStatus(null);
        stopPolling();
      }
    } catch (error) {
      console.error('Error checking workflow status:', error);
      setConnectionError(true);
      // On error, ensure workflow is not running
      setWorkflowStatus(null);
      stopPolling();
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
        // Set the entire response as the workflow status
        setWorkflowStatus(response);
        setConnectionError(false);
        setRetryCount(0);
        
        if (response.analysisData) {
          updateAnalysisFromWorkflow(response.analysisData);
        }
        
        // Stop polling if workflow is complete or has error
        if (response.workflowStatus?.status === 'completed' || response.workflowStatus?.status === 'error') {
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
      // Handle both singular and plural forms of pattern data
      const patternData = basicAnalysisData.dominance?.patterns || basicAnalysisData.dominance?.pattern;
      const patternDescriptions = patternData?.descriptions || patternData?.description || [];
      
      setBasicAnalysis({
        overview: basicAnalysisData.overview || '',
        dominance: {
          elements: basicAnalysisData.dominance?.elements || { interpretation: '' },
          modalities: basicAnalysisData.dominance?.modalities || { interpretation: '' },
          quadrants: basicAnalysisData.dominance?.quadrants || { interpretation: '' },
          patterns: {
            ...patternData,
            descriptions: patternDescriptions,
            interpretation: patternData?.interpretation || ''
          }
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
    if (isPolling) return; // Don't start if already polling
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
    if (userId) {
      checkWorkflowStatus();
    }
  }, [userId]);

  // Show temporary completion banner when analysis just completed
  useEffect(() => {
    const currentStatus = workflowStatus?.workflowStatus?.status;
    const prevStatus = previousWorkflowStatus?.workflowStatus?.status;
    
    // If workflow just changed from 'running' to 'completed', show temporary banner
    if (prevStatus === 'running' && currentStatus === 'completed') {
      setShowCompletionBanner(true);
      
      // Hide banner after 5 seconds
      const timer = setTimeout(() => {
        setShowCompletionBanner(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Update previous status for next comparison
    setPreviousWorkflowStatus(workflowStatus);
  }, [workflowStatus, previousWorkflowStatus]);

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
    
    // Check for the new progress structure
    if (workflowStatus.progress.percentage !== undefined) {
      return workflowStatus.progress.percentage;
    }
    
    // Fallback to the old structure if needed
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
    if (!workflowStatus?.progress) return 'Processing your birth chart analysis...';
    
    const progress = workflowStatus.progress;
    
    // Use the new progress structure if available
    if (progress.completed !== undefined && progress.total !== undefined) {
      const completed = progress.completed;
      const total = progress.total;
      
      // Provide more descriptive text based on progress
      if (completed <= total * 0.2) {
        return `Analyzing chart patterns... (${completed}/${total})`;
      } else if (completed <= total * 0.4) {
        return `Interpreting planetary influences... (${completed}/${total})`;
      } else if (completed <= total * 0.8) {
        return `Generating life area insights... (${completed}/${total})`;
      }
      return `Finalizing analysis... (${completed}/${total})`;
    }
    
    // Fallback to the old structure if needed
    const stepProgress = progress.processAllContent;
    if (stepProgress?.total > 0) {
      const completed = stepProgress.completed || 0;
      const total = stepProgress.total;
      
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

  // Build 360 Analysis subtabs from BroadTopicsEnum keys in order
  const analysis360Tabs = [];
  Object.keys(BroadTopicsEnum).forEach(topicKey => {
    if (subTopicAnalysis[topicKey]) {
      const topicData = subTopicAnalysis[topicKey];
      analysis360Tabs.push({
        id: topicKey,
        label: topicData.label,
        content: (
          <div className="subtopics">
            {Object.entries(topicData.subtopics).map(([subtopicKey, content]) => (
              <div key={subtopicKey} className="subtopic">
                <h4>{BroadTopicsEnum[topicKey].subtopics[subtopicKey].replace(/_/g, ' ')}</h4>
                <p>{content}</p>
              </div>
            ))}
          </div>
        )
      });
    }
  });

  // Build analysis tabs
  const analysisTabs = [];

  analysisTabs.push({
    id: 'overview',
    label: 'Overview',
    content: (
      <section className="overview-section">
        <p>{basicAnalysis.overview}</p>
      </section>
    )
  });

  analysisTabs.push({
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

  analysisTabs.push({
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
                description={basicAnalysis.planets[planet].description}
              />
            ))}
        </div>
      </section>
    )
  });

  // Add 360 Analysis tab if there are any subtopic analyses
  if (analysis360Tabs.length > 0) {
    analysisTabs.push({
      id: '360analysis',
      label: '360 Analysis',
      content: <TabMenu tabs={analysis360Tabs} />
    });
  }

  // Add Chat tab if vectorization is complete
  if (birthChartAnalysisId && userId && (
    vectorizationStatus.topicAnalysis.isComplete || 
    vectorizationStatus.workflowStatus?.isComplete
  )) {
    analysisTabs.push({
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

  // Build main tabs
  const mainTabs = [];

  mainTabs.push({
    id: 'analysis',
    label: 'Birth Chart Analysis',
    content: <TabMenu tabs={analysisTabs} />
  });

  if (isDataPopulated) {
    mainTabs.push({
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

  // Add relationships and other profiles tabs only for accountSelf users
  if (selectedUser && selectedUser.kind === 'accountSelf') {
    mainTabs.push({
      id: 'relationships',
      label: 'Relationships',
      content: <RelationshipsTab />
    });

    mainTabs.push({
      id: 'otherProfiles',
      label: 'Other Profiles',
      content: <OtherProfilesTab />
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

      {/* {renderDebugInfo()} */}

      {/* Workflow Control Section */}
      <div className="workflow-section">
        {/* Show start/resume/retry button for not_started, incomplete, or completed_with_failures */}
        {(workflowStatus?.workflowStatus?.status === 'not_started' || 
          workflowStatus?.workflowStatus?.status === 'incomplete' || 
          workflowStatus?.workflowStatus?.status === 'completed_with_failures') && (
          <div>
            <button
              onClick={handleStartWorkflow}
              disabled={isWorkflowRunning || fetchLoading || !userId}
              className="workflow-button primary"
            >
              {workflowStatus?.workflowStatus?.status === 'not_started' && 'Start Analysis'}
              {workflowStatus?.workflowStatus?.status === 'incomplete' && 'Resume Analysis'}
              {workflowStatus?.workflowStatus?.status === 'completed_with_failures' && 'Retry Failed Tasks'}
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

        {/* Show progress for running state */}
        {workflowStatus?.workflowStatus?.status === 'running' && (
          <div className="workflow-progress">
            <div className="progress-header">
              <h3>Generating Your Birth Chart Analysis</h3>
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
            {workflowStatus?.workflowStatus?.progress?.processAllContent && (
              <div className="workflow-steps">
                <div className={`workflow-step ${workflowStatus.workflowStatus.progress.processAllContent.status}`}>
                  <span className="step-name">
                    Processing All Content
                  </span>
                  <span className="step-status">
                    {workflowStatus.workflowStatus.progress.processAllContent.status === 'completed' && '✅'}
                    {workflowStatus.workflowStatus.progress.processAllContent.status === 'running' && '🔄'}
                    {workflowStatus.workflowStatus.progress.processAllContent.status === 'pending' && '⏳'}
                    {workflowStatus.workflowStatus.progress.processAllContent.status === 'error' && '❌'}
                  </span>
                  {workflowStatus.workflowStatus.progress.processAllContent.total > 0 && 
                   workflowStatus.workflowStatus.progress.processAllContent.status === 'running' && (
                    <span className="step-progress">
                      ({workflowStatus.workflowStatus.progress.processAllContent.completed}/
                       {workflowStatus.workflowStatus.progress.processAllContent.total})
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

        {/* Show temporary completion banner when analysis just finished */}
        {showCompletionBanner && (
          <div className="workflow-complete" style={{ 
            position: 'relative',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <h3>✅ Analysis Complete!</h3>
            <p>Your birth chart analysis has been generated and is ready to explore.</p>
            <small style={{ color: '#666', fontStyle: 'italic' }}>This message will disappear in a few seconds...</small>
          </div>
        )}

        {/* Show error message for unknown state */}
        {workflowStatus?.workflowStatus?.status === 'unknown' && (
          <div className="workflow-error">
            <h3>❌ Unexpected Error</h3>
            <p>An unexpected error occurred while processing your birth chart analysis.</p>
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

      <TabMenu tabs={mainTabs} />
    </div>
  );
}

export default UserDashboard;