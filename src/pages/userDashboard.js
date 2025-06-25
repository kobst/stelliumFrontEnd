// Updated UserDashboard component with polling workflow

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import UserBirthChartContainer from '../UI/prototype/UserBirthChartContainer';
import useStore from '../Utilities/store';
import { BroadTopicsEnum, ERROR_API_CALL } from '../Utilities/constants';
import {
  fetchAnalysis,
  chatForUserBirthChart,
  fetchUserChatBirthChartAnalysis,
  getTransitWindows,
  startWorkflow,
  getWorkflowStatus,
  resumeWorkflow
} from '../Utilities/api';
import useAsync from '../hooks/useAsync';
import useSubjectCreation from '../hooks/useSubjectCreation';
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
  const { userId } = useParams(); // Get userId from URL parameter
  const selectedUser = useStore(state => state.selectedUser);
  const storeUserId = useStore(state => state.userId);
  const setCurrentUserContext = useStore(state => state.setCurrentUserContext);
  const setActiveUserContext = useStore(state => state.setActiveUserContext);
  const setUserId = useStore(state => state.setUserId);
  const userPlanets = useStore(state => state.userPlanets);
  const userHouses = useStore(state => state.userHouses);
  const userAspects = useStore(state => state.userAspects);
  const dailyTransits = useStore(state => state.dailyTransits);
  const userElements = useStore(state => state.userElements);
  const userModalities = useStore(state => state.userModalities);
  const userQuadrants = useStore(state => state.userQuadrants);
  const userPatterns = useStore(state => state.userPatterns);
  const workflowState = useStore(state => state.workflowState);
  const setWorkflowState = useStore(state => state.setWorkflowState);

  // New workflow system hook
  const {
    startFullAnalysisWorkflow,
    startFullAnalysisPolling,
    fullAnalysisLoading,
    fullAnalysisProgress,
    isFullAnalysisCompleted,
    waitForFullAnalysisComplete,
    resetFullAnalysisState
  } = useSubjectCreation();

  const [isDataPopulated, setIsDataPopulated] = useState(false);
  const [workflowStarted, setWorkflowStarted] = useState(false);
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

  // Sync URL userId with store and clear previous user's data
  useEffect(() => {
    if (userId && userId !== storeUserId) {
      console.log('Setting userId from URL parameter:', userId);
      setUserId(userId);
      
      // Reset full analysis workflow state for new user
      resetFullAnalysisState();
      
      // Clear previous user's analysis data to prevent contamination
      console.log('Clearing previous user analysis data');
      setBasicAnalysis({
        overview: '',
        dominance: {
          elements: { interpretation: '' },
          modalities: { interpretation: '' },
          quadrants: { interpretation: '' },
          patterns: { interpretation: '' }
        },
        planets: {}
      });
      setSubTopicAnalysis({});
      setWorkflowStatus(null);
      setVectorizationStatus({
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
      
      // Also clear workflow state from store
      setWorkflowState({
        isPaused: false,
        hasOverview: false,
        overviewContent: '',
        startedFromSignup: false
      });
    }
  }, [userId, storeUserId, setUserId, setWorkflowState, resetFullAnalysisState]);

  useEffect(() => {
    if (userId) {
      if (userAspects.length !== 0 || userHouses.length !== 0 || userPlanets.length !== 0) {
        setIsDataPopulated(true);
      }
    }
  }, [userId, userAspects, userHouses, userPlanets]);

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
              // Handle both 'pattern' (new backend) and 'patterns' (legacy) for backward compatibility
              ...(interpretation.basicAnalysis.dominance?.pattern || interpretation.basicAnalysis.dominance?.patterns),
              interpretation: (interpretation.basicAnalysis.dominance?.pattern?.interpretation || 
                              interpretation.basicAnalysis.dominance?.patterns?.interpretation || '')
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

      // Check actual workflow status from backend (legacy system)
      // Skip for users created with new workflow system to avoid 400 errors
      try {
        await checkWorkflowStatus();
      } catch (workflowError) {
        console.log('Legacy workflow status check failed (expected for new workflow users):', workflowError.message);
        // Don't throw - this is expected for new workflow system users
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

  // Check if analysis is already complete/populated
  const isAnalysisPopulated = () => {
    const hasOverview = basicAnalysis.overview && basicAnalysis.overview.trim().length > 0;
    const hasPlanets = basicAnalysis.planets && Object.keys(basicAnalysis.planets).length > 0;
    const hasSubTopics = subTopicAnalysis && Object.keys(subTopicAnalysis).length > 0;
    const isTopicAnalysisComplete = vectorizationStatus.topicAnalysis.isComplete;
    
    // Analysis is only complete if we have ALL major components: overview AND planets AND subtopics
    return hasOverview && hasPlanets && hasSubTopics && isTopicAnalysisComplete;
  };

  // Check if we have partial analysis (overview only) - Stage 1 complete, Stage 2 needed
  const hasPartialAnalysis = () => {
    const hasOverview = basicAnalysis.overview && basicAnalysis.overview.trim().length > 0;
    const hasPlanets = basicAnalysis.planets && Object.keys(basicAnalysis.planets).length > 0;
    const hasSubTopics = subTopicAnalysis && Object.keys(subTopicAnalysis).length > 0;
    
    return hasOverview && !hasPlanets && !hasSubTopics;
  };

  // New full analysis workflow function
  const handleStartFullAnalysis = async () => {
    if (!userId) {
      console.error('Cannot start full analysis: userId is missing');
      return;
    }
    
    console.log('Starting full analysis workflow with userId:', userId);
    
    try {
      // Set workflow started flag to prevent button reappearing
      setWorkflowStarted(true);
      
      // Start the full analysis workflow
      const response = await startFullAnalysisWorkflow(userId);
      console.log('Full analysis started:', response);
      
      // Start polling for progress updates without blocking
      const pollInterval = startFullAnalysisPolling(
        userId,
        response.workflowId,
        3000, // Poll every 3 seconds for faster updates
        async (progressData) => {
          console.log('Full analysis progress:', progressData);
          
          // Check if completed and refresh data
          if (progressData.completed) {
            console.log('Full analysis completed! Refreshing data...');
            clearInterval(pollInterval);
            setWorkflowStarted(false); // Reset workflow started flag
            // Force refresh the analysis data
            setTimeout(async () => {
              await fetchAnalysisForUserAsync();
            }, 1000); // Small delay to ensure backend is ready
          }
        }
      );
      
    } catch (error) {
      console.error('Error in full analysis workflow:', error);
      setWorkflowStarted(false); // Reset flag on error
      // You could add error state handling here
    }
  };

  // Legacy workflow functions (keeping for backward compatibility during transition)
  const handleStartWorkflow = async () => {
    if (!userId) {
      console.error('Cannot start workflow: userId is missing');
      return;
    }
    
    console.log('Starting legacy workflow with userId:', userId, 'type:', typeof userId);
    
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

  // Legacy resume workflow function
  const handleResumeWorkflow = async () => {
    if (!userId) {
      console.error('Cannot resume workflow: userId is missing');
      return;
    }
    
    console.log('🔄 Resuming legacy workflow with userId:', userId);
    
    try {
      const response = await resumeWorkflow(userId);
      console.log('📥 Resume workflow response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ Workflow resumed successfully, starting polling');
        setWorkflowState({
          isPaused: false
        });
        startPolling();
      } else {
        console.log('❌ Resume response success was false:', response.success);
      }
    } catch (error) {
      console.error('Error resuming workflow:', error);
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
        
        // Stop polling if workflow is complete, paused after overview, or has error
        if (response.workflowStatus?.status === 'completed' || 
            response.workflowStatus?.status === 'error' ||
            response.workflowStatus?.status === 'paused_after_overview') {
          stopPolling();
          
          // If paused after overview, update workflow state
          if (response.workflowStatus?.status === 'paused_after_overview') {
            const overviewContent = response.analysisData?.interpretation?.basicAnalysis?.overview;
            if (overviewContent) {
              setWorkflowState({
                isPaused: true,
                hasOverview: true,
                overviewContent: overviewContent,
                startedFromSignup: workflowState.startedFromSignup // preserve existing value
              });
            }
          }
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
        
        // Stop polling if workflow is complete, paused after overview, or has error
        if (response.workflowStatus?.status === 'completed' || 
            response.workflowStatus?.status === 'error' ||
            response.workflowStatus?.status === 'paused_after_overview') {
          stopPolling();
          
          // If paused after overview, update workflow state
          if (response.workflowStatus?.status === 'paused_after_overview') {
            const overviewContent = response.analysisData?.interpretation?.basicAnalysis?.overview;
            if (overviewContent) {
              setWorkflowState({
                isPaused: true,
                hasOverview: true,
                overviewContent: overviewContent,
                startedFromSignup: workflowState.startedFromSignup // preserve existing value
              });
            }
          }
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
    console.log('🚀 startPolling called. Current isPolling:', isPolling);
    if (isPolling) {
      console.log('⏭️ Already polling, skipping');
      return; // Don't start if already polling
    }
    console.log('✅ Starting polling for workflow status');
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
        {hasPartialAnalysis() && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '8px'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#a78bfa' }}>
              ✨ This is your personalized overview! To unlock detailed planetary interpretations, 
              life area insights, and personalized chat, complete your full analysis above.
            </p>
          </div>
        )}
      </section>
    )
  });

  analysisTabs.push({
    id: 'patterns',
    label: 'Chart Patterns',
    content: (
      <section className="dominance-section">
        {/* Show complete analysis prompt if we have partial analysis and no dominance data */}
        {hasPartialAnalysis() ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>🔍 Chart Patterns Analysis</h3>
            <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
              Discover how the elements, modalities, and quadrants in your birth chart shape your personality, 
              approach to life, and core patterns of behavior.
            </p>
            <button
              onClick={handleStartFullAnalysis}
              disabled={fullAnalysisLoading || (fullAnalysisProgress && !isFullAnalysisCompleted)}
              style={{
                backgroundColor: (fullAnalysisLoading || (fullAnalysisProgress && !isFullAnalysisCompleted)) ? '#6c757d' : '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {fullAnalysisLoading ? 'Starting Analysis...' : 
               (fullAnalysisProgress && !isFullAnalysisCompleted) ? 'Analysis in Progress...' : 
               'Complete Full Analysis to Unlock'}
            </button>
          </div>
        ) : (
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
        )}
      </section>
    )
  });

  analysisTabs.push({
    id: 'planets',
    label: 'Planets',
    content: (
      <section className="planets-section">
        {/* Show complete analysis prompt if we have partial analysis and no planetary data */}
        {hasPartialAnalysis() ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>🪐 Planetary Influences</h3>
            <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
              Explore detailed interpretations of how each planet in your birth chart influences different 
              aspects of your personality, relationships, career, and life path.
            </p>
            <button
              onClick={handleStartFullAnalysis}
              disabled={fullAnalysisLoading || (fullAnalysisProgress && !isFullAnalysisCompleted)}
              style={{
                backgroundColor: (fullAnalysisLoading || (fullAnalysisProgress && !isFullAnalysisCompleted)) ? '#6c757d' : '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {fullAnalysisLoading ? 'Starting Analysis...' : 
               (fullAnalysisProgress && !isFullAnalysisCompleted) ? 'Analysis in Progress...' : 
               'Complete Full Analysis to Unlock'}
            </button>
          </div>
        ) : (
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
        )}
      </section>
    )
  });

  // Add 360 Analysis tab - show complete analysis prompt if partial analysis and no subtopic data
  if (analysis360Tabs.length > 0) {
    analysisTabs.push({
      id: '360analysis',
      label: '360 Analysis',
      content: <TabMenu tabs={analysis360Tabs} />
    });
  } else if (hasPartialAnalysis()) {
    analysisTabs.push({
      id: '360analysis',
      label: '360 Analysis',
      content: (
        <section className="analysis-360-section">
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>🌟 360-Degree Life Analysis</h3>
            <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
              Unlock comprehensive insights into every area of your life - personality, relationships, 
              career, spirituality, communication, and more. Get detailed analysis across 6 major life themes 
              with 24 specific subtopics.
            </p>
            <button
              onClick={handleStartFullAnalysis}
              disabled={fullAnalysisLoading || (fullAnalysisProgress && !isFullAnalysisCompleted)}
              style={{
                backgroundColor: (fullAnalysisLoading || (fullAnalysisProgress && !isFullAnalysisCompleted)) ? '#6c757d' : '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {fullAnalysisLoading ? 'Starting Analysis...' : 
               (fullAnalysisProgress && !isFullAnalysisCompleted) ? 'Analysis in Progress...' : 
               'Complete Full Analysis to Unlock'}
            </button>
          </div>
        </section>
      )
    });
  }

  // Add Chat tab if vectorization is complete or show complete analysis prompt if paused
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
  } else if (workflowState.isPaused) {
    analysisTabs.push({
      id: 'chat',
      label: 'Chat',
      content: (
        <section className="chat-section">
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>💬 Personalized AI Chat</h3>
            <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
              Chat with your personal AI astrologer about your birth chart! Ask questions about your 
              personality, relationships, career path, or any aspect of your astrological profile. 
              Available after your complete analysis is ready.
            </p>
            <button
              onClick={handleResumeWorkflow}
              style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Complete Analysis to Unlock Chat
            </button>
          </div>
        </section>
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

      {/* New Full Analysis Workflow Section */}
      <div className="workflow-section">
        <h3>🚀 New Analysis System (Recommended)</h3>
        {!isAnalysisPopulated() && (
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleStartFullAnalysis}
              disabled={fullAnalysisLoading || !userId || workflowStarted || (fullAnalysisProgress && !isFullAnalysisCompleted)}
              className="workflow-button primary"
              style={{
                backgroundColor: (fullAnalysisLoading || workflowStarted || (fullAnalysisProgress && !isFullAnalysisCompleted)) ? '#6c757d' : '#8b5cf6',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {fullAnalysisLoading || workflowStarted ? 'Starting Analysis...' : 
               (fullAnalysisProgress && !isFullAnalysisCompleted) ? 'Analysis in Progress...' : 
               'Start Complete Analysis'}
            </button>
          
            {fullAnalysisProgress && !isFullAnalysisCompleted && (
              <div style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
                {fullAnalysisProgress.percentage}% Complete 
                {fullAnalysisProgress.currentPhase && ` - ${fullAnalysisProgress.currentPhase}`}
              </div>
            )}
          </div>
        )}

        {/* Show message when analysis is already complete */}
        {isAnalysisPopulated() && !fullAnalysisProgress && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid rgba(34, 197, 94, 0.3)', 
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#22c55e', margin: '0', fontWeight: 'bold' }}>
              ✅ Analysis Complete! Your birth chart analysis is ready to explore below.
            </p>
          </div>
        )}

        {/* Full Analysis Progress Bar */}
        {fullAnalysisProgress && !isFullAnalysisCompleted && (
          <div className="workflow-progress" style={{ marginBottom: '20px' }}>
            <div className="progress-header">
              <h4>
                Generating Complete Birth Chart Analysis
              </h4>
              <p>
                Phase: {fullAnalysisProgress.currentPhase || 'Processing'} 
                ({fullAnalysisProgress.completedTasks}/{fullAnalysisProgress.totalTasks} tasks)
              </p>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${fullAnalysisProgress.percentage || 0}%`,
                  backgroundColor: '#8b5cf6'
                }}
              ></div>
            </div>
            <div className="progress-percentage">
              {fullAnalysisProgress.percentage || 0}% Complete
            </div>
          </div>
        )}

        {isFullAnalysisCompleted && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid rgba(34, 197, 94, 0.3)', 
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#22c55e', margin: '0', fontWeight: 'bold' }}>
              ✅ Complete analysis finished! Your full birth chart analysis is now available.
            </p>
          </div>
        )}
      </div>

    

      <TabMenu tabs={mainTabs} />
    </div>
  );
}

export default UserDashboard;