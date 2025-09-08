// Updated UserDashboard component with polling workflow

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import UserBirthChartContainer from '../UI/prototype/UserBirthChartContainer';
import useStore from '../Utilities/store';
import { BroadTopicsEnum, ERROR_API_CALL } from '../Utilities/constants';
import {
  fetchAnalysis,
  getTransitWindows,
  startWorkflow,
  getWorkflowStatus,
  resumeWorkflow,
  getSubtopicAstroData
} from '../Utilities/api';
import useAsync from '../hooks/useAsync';
import useSubjectCreation from '../hooks/useSubjectCreation';
import HoroscopeContainer from '../UI/prototype/HoroscopeContainer';
import RelationshipsTab from '../UI/prototype/RelationshipsTab';
import OtherProfilesTab from '../UI/prototype/OtherProfilesTab';
import TabMenu from '../UI/shared/TabMenu';
import './userDashboard.css';
import PatternCard from '../UI/prototype/PatternCard';
import PlanetCard from '../UI/prototype/PlanetCard';
import TopicTensionFlowAnalysis from '../UI/prototype/TopicTensionFlowAnalysis';
import EnhancedChatBirthChart from '../UI/prototype/EnhancedChatBirthChart';

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
  const userPlanetaryDominance = useStore(state => state.userPlanetaryDominance);
  const workflowState = useStore(state => state.workflowState);
  const setWorkflowState = useStore(state => state.setWorkflowState);

  // Store setter functions for clearing data when switching users
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setUserElements = useStore(state => state.setUserElements);
  const setUserModalities = useStore(state => state.setUserModalities);
  const setUserQuadrants = useStore(state => state.setUserQuadrants);
  const setUserPatterns = useStore(state => state.setUserPatterns);
  const setUserPlanetaryDominance = useStore(state => state.setUserPlanetaryDominance);

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
  
  // Debug subtopic astro data button state
  const [isDebugLoading, setIsDebugLoading] = useState(false);
  const [basicAnalysis, setBasicAnalysis] = useState({
    overview: '',
    dominance: {
      elements: { interpretation: '' },
      modalities: { interpretation: '' },
      quadrants: { interpretation: '' },
      patterns: { interpretation: '' },
      planetary: { interpretation: '' }
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

  const [enhancedChatMessages, setEnhancedChatMessages] = useState([]);
  const [transitWindows, setTransitWindows] = useState([]);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState(null);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [previousWorkflowStatus, setPreviousWorkflowStatus] = useState(null);
  const [hasCheckedAnalysis, setHasCheckedAnalysis] = useState(false);

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
      
      // Reset analysis check flag for new user
      setHasCheckedAnalysis(false);
      
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
          patterns: { interpretation: '' },
          planetary: { interpretation: '' }
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

      // Clear store state to prevent data from previous user persisting
      console.log('Clearing store state for new user');
      setUserPlanets([]);
      setUserHouses([]);
      setUserAspects([]);
      setUserElements({});
      setUserModalities({});
      setUserQuadrants({});
      setUserPatterns({});
      setUserPlanetaryDominance({});
      
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
      setHasCheckedAnalysis(true);
      
      const { interpretation, vectorizationStatus } = response;
      
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
            },
            planetary: interpretation.basicAnalysis.dominance?.planetary || { interpretation: '' }
          },
          planets: interpretation.basicAnalysis.planets || {}
        });
      }

      // Set subTopicAnalysis state only if it exists
      if (interpretation?.SubtopicAnalysis) {
        // Add a concise diagnostic of subtopic readiness per topic
        try {
          const subtopicSummary = Object.entries(interpretation.SubtopicAnalysis).map(([k, v]) => ({
            topic: k,
            hasEdited: v && typeof v.editedSubtopics === 'object' && v.editedSubtopics !== null,
            hasSubtopics: v && typeof v.subtopics === 'object' && v.subtopics !== null,
            keys: v ? Object.keys(v) : []
          }));
          console.log('Subtopic analysis summary:', subtopicSummary);
        } catch (e) {
          console.warn('Unable to summarize SubtopicAnalysis:', e?.message);
        }
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
      // Skip if we already have complete analysis (indicates new workflow user)
      const hasCompleteAnalysis = interpretation?.basicAnalysis && 
                                   interpretation?.SubtopicAnalysis && 
                                   vectorizationStatus?.topicAnalysis?.isComplete;
      
      if (!hasCompleteAnalysis) {
        // Only check legacy workflow if analysis is not complete
        await checkWorkflowStatus();
      } else {
        console.log('Complete analysis detected - skipping legacy workflow check');
      }

    } catch (error) {
      console.error(ERROR_API_CALL, error);
      setHasCheckedAnalysis(true);
      // Reset to defaults on error
      setBasicAnalysis({
        overview: '',
        dominance: {
          elements: { interpretation: '', description: [] },
          modalities: { interpretation: '', description: [] },
          quadrants: { interpretation: '', description: [] },
          patterns: { interpretation: '', description: [] },
          planetary: { interpretation: '', description: [] }
        },
        planets: {}
      });
      setSubTopicAnalysis({});
      throw error;
    }
  }

  // Debug subtopic astro data handler
  const handleDebugSubtopicAstroData = async () => {
    if (!userId) {
      console.error('Cannot get subtopic astro data: userId is missing');
      return;
    }

    setIsDebugLoading(true);
    try {
      console.log('🔍 Getting subtopic astro data for userId:', userId);
      const response = await getSubtopicAstroData(userId);
      console.log('✅ Debug subtopic astro data response:', response);
      alert('Debug data retrieved successfully! Check console for details.');
    } catch (error) {
      console.error('❌ Error getting subtopic astro data:', error);
      alert(`Error getting debug data: ${error.message}`);
    } finally {
      setIsDebugLoading(false);
    }
  };

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
      
      // Handle new workflow users gracefully
      if (response.isNewWorkflowUser) {
        console.log('User created with new workflow system - legacy workflow not applicable');
        setWorkflowStatus(null);
        stopPolling();
        return;
      }
      
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
      
      // Handle new workflow users gracefully
      if (response.isNewWorkflowUser) {
        console.log('User created with new workflow system - stopping legacy polling');
        stopPolling();
        return;
      }
      
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
          },
          planetary: basicAnalysisData.dominance?.planetary || { interpretation: '' }
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

  // Note: We check workflow status in fetchAnalysisForUser, so no need for a separate useEffect

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

      // Choose the source for subtopics (prefer editedSubtopics)
      const subtopicsSource = (topicData && (topicData.editedSubtopics ?? topicData.subtopics)) || null;

      // Guard against null/undefined and add targeted diagnostics
      let subtopicEntries = [];
      if (subtopicsSource && typeof subtopicsSource === 'object') {
        try {
          subtopicEntries = Object.entries(subtopicsSource);
        } catch (e) {
          console.error('[UserDashboard] Failed to read subtopics entries', {
            topicKey,
            error: e?.message,
            hasTopicData: Boolean(topicData),
            topicDataKeys: topicData ? Object.keys(topicData) : [],
            editedType: typeof topicData?.editedSubtopics,
            subtopicsType: typeof topicData?.subtopics,
            subtopicsSource
          });
          subtopicEntries = [];
        }
      } else {
        // Log once per render for topics missing subtopics to help trace source data
        console.warn('[UserDashboard] Missing or invalid subtopics for topic', {
          topicKey,
          hasTopicData: Boolean(topicData),
          topicDataKeys: topicData ? Object.keys(topicData) : [],
          editedType: typeof topicData?.editedSubtopics,
          subtopicsType: typeof topicData?.subtopics,
          editedSubtopics: topicData?.editedSubtopics ?? '(missing)',
          subtopics: topicData?.subtopics ?? '(missing)'
        });
      }

      analysis360Tabs.push({
        id: topicKey,
        label: topicData.label,
        content: (
          <div className="subtopics">
            {/* Topic Tension Flow Analysis */}
            <TopicTensionFlowAnalysis 
              topicData={{
                ...topicData,
                tensionFlow: topicData.tensionFlowAnalysis
              }}
              topicTitle={topicData.label}
            />
            
            {/* Use entries if available; avoid crashing when none */}
            {subtopicEntries.map(([subtopicKey, content]) => (
              <div key={subtopicKey} className="subtopic">
                <h4>{(BroadTopicsEnum[topicKey].subtopics[subtopicKey] || subtopicKey).replace(/_/g, ' ')}</h4>
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
            <PatternCard
              title="Planetary Dominance"
              data={{
                ...userPlanetaryDominance,
                interpretation: basicAnalysis.dominance?.planetary?.interpretation
              }}
              type="planetary"
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



  // Add Chat tab if analysis is complete
  if (userId && userPlanets && userAspects && (
    vectorizationStatus.topicAnalysis.isComplete || 
    vectorizationStatus.workflowStatus?.isComplete
  )) {
    analysisTabs.push({
      id: 'chat',
      label: 'Chat',
      content: (
        <EnhancedChatBirthChart
          userId={userId}
          userPlanets={userPlanets}
          userAspects={userAspects}
          chatMessages={enhancedChatMessages}
          setChatMessages={setEnhancedChatMessages}
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
            <h3 style={{ color: '#8b5cf6', marginBottom: '15px' }}>💬 AI Chat</h3>
            <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
              Chat with your personal AI astrologer! Select specific aspects or planetary positions, 
              ask targeted questions, or use both together for the most personalized astrological insights.
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

  // Add horoscope tab - only if full analysis is complete
  if (isDataPopulated && isAnalysisPopulated()) {
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
  } else if (isDataPopulated && !isAnalysisPopulated()) {
    // Show unlock message for horoscope if data is populated but analysis isn't complete
    mainTabs.push({
      id: 'horoscope',
      label: 'Horoscope',
      content: (
        <section className="horoscope-section">
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>🌟 Personalized Horoscope</h3>
            <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
              Unlock your personalized horoscope with detailed transit interpretations, timing guidance, 
              and insights into upcoming planetary influences specific to your birth chart.
            </p>
            <button
              onClick={hasPartialAnalysis() ? handleResumeWorkflow : handleStartFullAnalysis}
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
               hasPartialAnalysis() ? 'Complete Analysis to Unlock' :
               'Complete Full Analysis to Unlock'}
            </button>
          </div>
        </section>
      )
    });
  }

  // Add relationships and other profiles tabs only for accountSelf users and if analysis is complete
  if (selectedUser && selectedUser.kind === 'accountSelf') {
    if (isAnalysisPopulated()) {
      mainTabs.push({
        id: 'relationships',
        label: 'Relationships',
        content: <RelationshipsTab />
      });

      mainTabs.push({
        id: 'otherProfiles',
        label: 'Other Profiles',
        content: <OtherProfilesTab usePagination={true} />
      });
    } else {
      // Show unlock message for relationships
      mainTabs.push({
        id: 'relationships',
        label: 'Relationships',
        content: (
          <section className="relationships-section">
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>💕 Relationship Compatibility</h3>
              <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
                Discover relationship compatibility through synastry and composite chart analysis. 
                Compare birth charts with partners, friends, and family to understand your connections and dynamics.
              </p>
              <button
                onClick={hasPartialAnalysis() ? handleResumeWorkflow : handleStartFullAnalysis}
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
                 hasPartialAnalysis() ? 'Complete Analysis to Unlock' :
                 'Complete Full Analysis to Unlock'}
              </button>
            </div>
          </section>
        )
      });

      // Show unlock message for other profiles
      mainTabs.push({
        id: 'otherProfiles',
        label: 'Other Profiles',
        content: (
          <section className="other-profiles-section">
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>👥 Other Profiles</h3>
              <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
                Create and manage additional birth chart profiles for family members, friends, or explore 
                celebrity charts. Compare multiple profiles and build your astrological network.
              </p>
              <button
                onClick={hasPartialAnalysis() ? handleResumeWorkflow : handleStartFullAnalysis}
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
                 hasPartialAnalysis() ? 'Complete Analysis to Unlock' :
                 'Complete Full Analysis to Unlock'}
              </button>
            </div>
          </section>
        )
      });
    }
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

      {/* New Full Analysis Workflow Section - Only show when needed */}
      {(!isAnalysisPopulated() || fullAnalysisProgress || isFullAnalysisCompleted) && (
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
              padding: '20px', 
              backgroundColor: 'rgba(34, 197, 94, 0.15)', 
              border: '2px solid rgba(34, 197, 94, 0.4)', 
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease-in-out'
            }}>
              <h3 style={{ 
                color: '#10b981', 
                margin: '0 0 8px 0', 
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                ✅ Analysis Complete!
              </h3>
              <p style={{ 
                color: '#ffffff', 
                margin: '0', 
                fontWeight: '500',
                lineHeight: '1.5',
                fontSize: '1rem'
              }}>
                Your full birth chart analysis is now available. Explore all tabs to discover your personalized insights!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Show subtle message when analysis is already complete */}
      {isAnalysisPopulated() && !fullAnalysisProgress && !isFullAnalysisCompleted && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: 'rgba(34, 197, 94, 0.1)', 
          border: '1px solid rgba(34, 197, 94, 0.3)', 
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'inline-block'
        }}>
          <p style={{ color: '#ffffff', margin: '0', fontSize: '14px', fontWeight: '500' }}>
            ✅ <span style={{ color: '#10b981', fontWeight: 'bold' }}>Analysis Complete</span> - All features unlocked
          </p>
        </div>
      )}

      {/* Debug Subtopic Astro Data Button */}
      {userId && (
        <div style={{ 
          padding: '20px', 
          marginBottom: '20px',
          backgroundColor: '#1f2937', 
          borderRadius: '8px',
          border: '1px solid #374151'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '15px', fontSize: '16px' }}>🔬 Debug Tools</h3>
          <p style={{ color: '#d1d5db', marginBottom: '15px', fontSize: '14px' }}>
            Development tool to retrieve subtopic astro data for this user profile.
          </p>
          <button
            onClick={handleDebugSubtopicAstroData}
            disabled={isDebugLoading || !userId}
            style={{
              backgroundColor: isDebugLoading ? '#6b7280' : '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isDebugLoading ? 'not-allowed' : 'pointer',
              opacity: isDebugLoading ? 0.6 : 1
            }}
          >
            {isDebugLoading ? '🔄 Loading...' : '🔍 Get Subtopic Astro Data'}
          </button>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            User ID: {userId}
          </div>
        </div>
      )}

      <TabMenu tabs={mainTabs} />
    </div>
  );
}

export default UserDashboard;
