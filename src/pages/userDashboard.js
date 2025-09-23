// Updated UserDashboard component with polling workflow

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import UserBirthChartContainer from '../UI/prototype/UserBirthChartContainer';
import useStore from '../Utilities/store';
import { ERROR_API_CALL } from '../Utilities/constants';
import {
  fetchAnalysis,
  getTransitWindows,
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
  // New broad category analyses state (replaces SubtopicAnalysis)
  const [broadCategoryAnalyses, setBroadCategoryAnalyses] = useState({});
  const [selectionData, setSelectionData] = useState(null);
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

  // Legacy workflow status removed

  const [enhancedChatMessages, setEnhancedChatMessages] = useState([]);
  const [transitWindows, setTransitWindows] = useState([]);
  const [transitLoading, setTransitLoading] = useState(false);
  const [transitError, setTransitError] = useState(null);
  // Legacy banners and checks removed

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
          patterns: { interpretation: '' },
          planetary: { interpretation: '' }
        },
        planets: {}
      });
      setBroadCategoryAnalyses({});
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
    }
  }, [userId, storeUserId, setUserId, resetFullAnalysisState]);

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
      const { interpretation, vectorizationStatus, selectionData: selData } = response;
      
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

      // Set broad category analyses (new structure)
      if (interpretation?.broadCategoryAnalyses) {
        const cats = interpretation.broadCategoryAnalyses;
        // Log a quick summary
        try {
          const summary = Object.entries(cats).map(([key, cat]) => ({
            key,
            name: cat?.categoryName || key,
            isCore: !!cat?.isCore,
            hasOverview: !!cat?.overview,
            hasEdited: !!cat?.editedSubtopics && typeof cat.editedSubtopics === 'object',
            hasSubtopics: !!cat?.subtopics && typeof cat.subtopics === 'object',
            hasTensionFlow: !!cat?.tensionFlow
          }));
          console.log('Broad category analyses summary:', summary);
        } catch (e) {
          console.warn('Unable to summarize broadCategoryAnalyses:', e?.message);
        }
        setBroadCategoryAnalyses(cats);
      } else {
        setBroadCategoryAnalyses({});
      }

      // Selection data for optional categories highlighting
      if (interpretation?.selectionData || selData) {
        setSelectionData(interpretation?.selectionData || selData);
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

    } catch (error) {
      console.error(ERROR_API_CALL, error);
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
      setBroadCategoryAnalyses({});
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
    const hasCategories = broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0;
    // Treat analysis complete if overview + planets + categories present
    return hasOverview && hasPlanets && hasCategories;
  };

  // Check if we have partial analysis (overview only) - Stage 1 complete, Stage 2 needed
  const hasPartialAnalysis = () => {
    const hasOverview = basicAnalysis.overview && basicAnalysis.overview.trim().length > 0;
    const hasPlanets = basicAnalysis.planets && Object.keys(basicAnalysis.planets).length > 0;
    const hasCategories = broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0;
    return hasOverview && !hasPlanets && !hasCategories;
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

  // Legacy workflow functions removed

  // Update checkWorkflowStatus to properly handle initial state
  // Legacy workflow status checks removed

  // Polling function with retry logic
  const pollWorkflowStatus = useCallback(async () => {}, []);

  // Update analysis data from workflow response
  const updateAnalysisFromWorkflow = () => {};

  // Start polling
  const startPolling = () => {};

  // Stop polling
  const stopPolling = () => {};

  // Note: We check workflow status in fetchAnalysisForUser, so no need for a separate useEffect

  // Legacy completion banner removed

  // Cleanup polling on unmount
  // Legacy polling cleanup removed

  // Determine workflow status for UI
  // Legacy workflow status flags removed

  // Progress calculation with granular step progress
  const computeWorkflowProgress = () => 0;

  // Get current step description with progress details
  const getCurrentStepDescription = () => 'Processing your birth chart analysis...';


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

  // Build 360 Analysis subtabs from broadCategoryAnalyses (new structure)
  const analysis360Tabs = [];
  const categoryEntries = Object.entries(broadCategoryAnalyses || {});
  if (categoryEntries.length > 0) {
    // Sort: core categories first in a preferred order, then optional by name
    const CORE_ORDER = ['IDENTITY', 'EMOTIONAL_FOUNDATIONS', 'PARTNERSHIPS', 'CAREER'];
    const orderIndex = (key, isCore) => isCore ? (CORE_ORDER.indexOf(key) >= 0 ? CORE_ORDER.indexOf(key) : 999) : 1000;
    const sorted = categoryEntries.sort((a, b) => {
      const [keyA, catA] = a; const [keyB, catB] = b;
      const coreA = !!catA?.isCore; const coreB = !!catB?.isCore;
      if (coreA !== coreB) return coreA ? -1 : 1;
      const idxA = orderIndex(keyA, coreA); const idxB = orderIndex(keyB, coreB);
      if (idxA !== idxB) return idxA - idxB;
      const nameA = catA?.categoryName || keyA; const nameB = catB?.categoryName || keyB;
      return nameA.localeCompare(nameB);
    });

    sorted.forEach(([catKey, cat]) => {
      const label = cat?.categoryName || catKey;
      const selectedOptional = selectionData?.selectedCategories?.includes?.(catKey);

      // Determine subtopic entries: prefer editedSubtopics (string content), else subtopics.analysis
      let subtopicEntries = [];
      if (cat?.editedSubtopics && typeof cat.editedSubtopics === 'object') {
        try {
          subtopicEntries = Object.entries(cat.editedSubtopics).map(([name, md]) => [name, md]);
        } catch (e) {
          console.warn('Failed reading editedSubtopics for', catKey, e?.message);
          subtopicEntries = [];
        }
      } else if (cat?.subtopics && typeof cat.subtopics === 'object') {
        try {
          subtopicEntries = Object.entries(cat.subtopics).map(([name, obj]) => [name, obj?.analysis || '']);
        } catch (e) {
          console.warn('Failed reading subtopics for', catKey, e?.message);
          subtopicEntries = [];
        }
      }

      analysis360Tabs.push({
        id: catKey,
        label,
        content: (
          <div className="subtopics">
            {/* Category overview */}
            {cat?.overview && (
              <div className="category-overview" style={{ marginBottom: '12px' }}>
                <p>{cat.overview}</p>
              </div>
            )}

            {/* Tension Flow for category */}
            <TopicTensionFlowAnalysis
              topicData={{ tensionFlow: cat?.tensionFlow }}
              topicTitle={label}
            />

            {/* Subtopics */}
            {subtopicEntries.map(([subtopicName, content]) => (
              <div key={subtopicName} className="subtopic">
                <h4>{subtopicName}</h4>
                <p>{content}</p>
              </div>
            ))}

            {/* Synthesis if present */}
            {cat?.synthesis && (
              <div className="category-synthesis" style={{ marginTop: '16px' }}>
                <h4>Synthesis</h4>
                <p>{cat.synthesis}</p>
              </div>
            )}

            {/* Optional category indicator */}
            {selectedOptional && !cat?.isCore && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#a78bfa' }}>
                Included optional category
              </div>
            )}
          </div>
        )
      });
    });
  }

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
  if (userId && userPlanets && userAspects && (broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0)) {
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

      {/* Show subtle message when analysis content is available */}
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
            ✅ <span style={{ color: '#10b981', fontWeight: 'bold' }}>Analysis Available</span> - Explore your insights while processing finishes
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
