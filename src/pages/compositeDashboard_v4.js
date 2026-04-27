import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../Utilities/store';
import SynastryBirthChartComparison_v2 from '../UI/birthChart/tables/SynastryBirthChartComparison_v2'
import RelationshipScoresRadarChart from '../UI/prototype/RelationshipScoresRadarChart';
import {
  fetchUser,
  fetchRelationshipAnalysis,
  fetchAnalysis,
  startRelationshipWorkflow,
  getRelationshipWorkflowStatus,
  resumeRelationshipWorkflow,
  startFullRelationshipAnalysis
} from '../Utilities/api';
import RelationshipEnhancedChat from '../UI/prototype/RelationshipEnhancedChat';
import RelationshipAnalysis from '../UI/prototype/RelationshipAnalysis';
import DetailedAnalysisPanels from '../UI/prototype/DetailedAnalysisPanels';
import TabMenu from '../UI/shared/TabMenu';
import './compositeDashboard_v4.css';


// Replace "Partner A" / "Partner B" with actual names in description strings
const replacePartnerNames = (text, nameA, nameB) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/Partner A's/g, `${nameA}'s`)
    .replace(/Partner B's/g, `${nameB}'s`)
    .replace(/Partner A/g, nameA)
    .replace(/Partner B/g, nameB);
};

// Recursively replace partner names in all "description" fields of an object
const replacePartnerNamesInData = (data, nameA, nameB) => {
  if (!data || !nameA || !nameB) return data;
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    return data.map(item => replacePartnerNamesInData(item, nameA, nameB));
  }
  if (typeof data === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'description' && typeof value === 'string') {
        result[key] = replacePartnerNames(value, nameA, nameB);
      } else {
        result[key] = replacePartnerNamesInData(value, nameA, nameB);
      }
    }
    return result;
  }
  return data;
};

function CompositeDashboard_v4({}) {

    const [relationshipScores, setRelationshipScores] = useState(null);
    const [synastryAspects, setSynastryAspects] = useState([]);
    const compositeChart = useStore(state => state.compositeChart)
    const [userA, setUserA] = useState(null);
    const [userB, setUserB] = useState(null);
    const [userAVectorizationStatus, setUserAVectorizationStatus] = useState(false);
    const [userBVectorizationStatus, setUserBVectorizationStatus] = useState(false);
    const [scoreDebugInfo, setScoreDebugInfo] = useState(null);
    
    // Add state for holistic overview
    const [holisticOverview, setHolisticOverview] = useState(null);
    
    // Add state for cluster scoring (numerical data)
    const [clusterScoring, setClusterScoring] = useState(null);
    
    // Add state for complete analysis (LLM-generated text panels) - 6-panel format
    const [completeAnalysis, setCompleteAnalysis] = useState(null);
    
    // Add state for overall compatibility data (new API structure)
    const [overall, setOverall] = useState(null);
    
    // Add state for tension flow analysis
    const [tensionFlowAnalysis, setTensionFlowAnalysis] = useState(null);
    
    // Add state for initial overview
    const [initialOverview, setInitialOverview] = useState(null);
    
    // Add V2 state management
    const [consolidatedScoredItems, setConsolidatedScoredItems] = useState([]);
    
    // Preview mode state
    const relationshipWorkflowState = useStore(state => state.relationshipWorkflowState);
    const setRelationshipWorkflowState = useStore(state => state.setRelationshipWorkflowState);
    const [isGeneratingScores, setIsGeneratingScores] = useState(false);
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
    const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
    
    // Legacy chat-related state (keeping for potential future use)
    // const [chatMessages, setChatMessages] = useState([]);
    // const [currentMessage, setCurrentMessage] = useState('');
    // const [isChatLoading, setIsChatLoading] = useState(false);
    // const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
    
    // Enhanced chat state
    const [relationshipEnhancedChatMessages, setRelationshipEnhancedChatMessages] = useState([]);

    // Helper function to determine if full analysis is complete
    const isFullAnalysisComplete = useCallback(() => {
        // Check if we have completeAnalysis with LLM-generated panels (indicates full analysis workflow complete)
        if (completeAnalysis) {
            const hasDetailedPanels = Object.values(completeAnalysis).some(cluster => 
                cluster.synastry?.supportPanel && 
                cluster.synastry?.challengePanel &&
                cluster.composite?.supportPanel &&
                cluster.composite?.synthesisPanel
            );
            console.log("🔍 isFullAnalysisComplete check - NEW 6-PANEL STRUCTURE:", {
                hasCompleteAnalysis: !!completeAnalysis,
                completeAnalysisKeys: completeAnalysis ? Object.keys(completeAnalysis) : 'none',
                hasDetailedPanels,
                firstCompleteAnalysisSample: completeAnalysis ? Object.values(completeAnalysis)[0] : 'none'
            });
            return hasDetailedPanels;
        }
        console.log("🔍 isFullAnalysisComplete: No completeAnalysis available - analysis not complete");
        return false;
    }, [completeAnalysis]);

    const initializeCompositeChartData = useCallback(async () => {
        try {
            if (!compositeChart || !compositeChart._id) {
                console.log("No composite chart available yet for initialization");
                return;
            }

            // Check if we have immediate data from direct API response
            if (compositeChart.scores) {
                console.log("Found immediate scores from direct API:", compositeChart.scores);
                setRelationshipScores(compositeChart.scores);
                
                // Store in workflow state for consistency
                setRelationshipWorkflowState({
                    hasScores: true,
                    scores: compositeChart.scores,
                    scoreAnalysis: compositeChart.scoreAnalysis || {},
                    startedFromCreation: true,
                    isPaused: false
                });
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
                const userAVectorizationStatus = Boolean(userAResponse?.vectorizationStatus?.topicAnalysis?.isComplete || userAResponse?.vectorizationStatus?.workflowStatus?.isComplete);
                const userBVectorizationStatus = Boolean(userBResponse?.vectorizationStatus?.topicAnalysis?.isComplete || userBResponse?.vectorizationStatus?.workflowStatus?.isComplete);

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

                // Handle holistic overview
                if (fetchedData?.holisticOverview) {
                    console.log("Holistic overview available: ", fetchedData.holisticOverview);
                    setHolisticOverview(fetchedData.holisticOverview);
                }

                // Handle cluster analysis (NEW API: clusterAnalysis contains cluster data)
                if (fetchedData?.clusterAnalysis) {
                    console.log("Cluster analysis available: ", fetchedData.clusterAnalysis);
                    setClusterScoring(replacePartnerNamesInData(fetchedData.clusterAnalysis, userA?.firstName, userB?.firstName));
                }

                // Handle overall compatibility data (NEW API field)
                if (fetchedData?.overall) {
                    console.log("Overall compatibility data available: ", fetchedData.overall);
                    setOverall(fetchedData.overall);
                }

                // Handle complete analysis (LLM-generated 6-panel text)
                if (fetchedData?.completeAnalysis) {
                    console.log("Complete analysis available: ", fetchedData.completeAnalysis);
                    setCompleteAnalysis(replacePartnerNamesInData(fetchedData.completeAnalysis, userA?.firstName, userB?.firstName));
                }

                // Handle initial overview
                if (fetchedData?.initialOverview) {
                    console.log("Initial overview available: ", fetchedData.initialOverview);
                    setInitialOverview(fetchedData.initialOverview);
                } else if (fetchedData?.clusterAnalysis?.initialOverview) {
                    console.log("Initial overview from cluster analysis: ", fetchedData.clusterAnalysis.initialOverview);
                    setInitialOverview(fetchedData.clusterAnalysis.initialOverview);
                }

                // Handle tension flow analysis
                if (fetchedData?.tensionFlowAnalysis) {
                    console.log("Tension flow analysis available: ", fetchedData.tensionFlowAnalysis);
                    setTensionFlowAnalysis(replacePartnerNamesInData(fetchedData.tensionFlowAnalysis, userA?.firstName, userB?.firstName));
                }

                // Handle Scored Items (NEW API: direct scoredItems field)
                console.log("🔍 CHECKING FOR scoredItems in response:");
                console.log("🎯 fetchedData.scoredItems:", fetchedData?.scoredItems);

                if (fetchedData?.scoredItems && Array.isArray(fetchedData.scoredItems)) {
                    console.log("✅ Scored Items found in response (length: " + fetchedData.scoredItems.length + ")");
                    setConsolidatedScoredItems(replacePartnerNamesInData(fetchedData.scoredItems, userA?.firstName, userB?.firstName));
                } else if (fetchedData?.clusterAnalysis?.scoredItems && Array.isArray(fetchedData.clusterAnalysis.scoredItems)) {
                    // Fallback for nested structure
                    console.log("✅ Scored Items found in clusterAnalysis (length: " + fetchedData.clusterAnalysis.scoredItems.length + ")");
                    setConsolidatedScoredItems(replacePartnerNamesInData(fetchedData.clusterAnalysis.scoredItems, userA?.firstName, userB?.firstName));
                } else {
                    console.log("❌ scoredItems NOT FOUND in response or not an array");
                }

                // Handle vectorization status from the backend
                if (fetchedData?.vectorizationStatus) {
                    console.log("Vectorization status received:", fetchedData.vectorizationStatus);
                    
                    // Define required categories
                    const requiredCategories = [
                        'COMMITMENT_LONG_TERM_POTENTIAL',
                        'COMMUNICATION_AND_MENTAL_CONNECTION',
                        'EMOTIONAL_SECURITY_CONNECTION',
                        'KARMIC_LESSONS_GROWTH',
                        'OVERALL_ATTRACTION_CHEMISTRY',
                        'PRACTICAL_GROWTH_SHARED_GOALS',
                        'SEX_AND_INTIMACY'
                    ];
                    
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
                    } else if (fetchedData.vectorizationStatus.categories) {
                        // Check if all required categories are present and true
                        const categories = fetchedData.vectorizationStatus.categories;
                        const allCategoriesComplete = requiredCategories.every(category => 
                            categories[category] === true
                        );
                        
                        console.log("Checking categories completion:", {
                            categories,
                            requiredCategories,
                            allCategoriesComplete,
                            missingCategories: requiredCategories.filter(cat => !categories[cat]),
                            falseCategories: requiredCategories.filter(cat => categories[cat] === false)
                        });
                        
                        setVectorizationStatus({
                            categories: categories,
                            lastUpdated: new Date().toISOString(),
                            relationshipAnalysis: allCategoriesComplete
                        });
                    } else {
                        // No categories found, assume not complete
                        console.log("No categories found in vectorization status");
                        setVectorizationStatus({
                            categories: {},
                            lastUpdated: new Date().toISOString(),
                            relationshipAnalysis: false
                        });
                    }
                } else if (fetchedData?.isVectorized !== undefined) {
                    // Fallback to isVectorized flag
                    setVectorizationStatus(prev => ({
                        ...prev,
                        relationshipAnalysis: fetchedData.isVectorized,
                        lastUpdated: new Date().toISOString()
                    }));
                } else if (fetchedData?.analysis) {
                    // If we have analysis but no vectorization status, assume it's vectorized
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

    // Handle holistic overview from workflow response
    if (analysisData.holisticOverview) {
      console.log("Holistic overview from workflow:", analysisData.holisticOverview);
      setHolisticOverview(analysisData.holisticOverview);
    }

    // Handle cluster analysis from workflow response (NEW API structure)
    if (analysisData.clusterAnalysis) {
      console.log("Cluster analysis from workflow:", analysisData.clusterAnalysis);
      setClusterScoring(replacePartnerNamesInData(analysisData.clusterAnalysis, userA?.firstName, userB?.firstName));
    }

    // Handle overall compatibility data from workflow response
    if (analysisData.overall) {
      console.log("Overall compatibility from workflow:", analysisData.overall);
      setOverall(analysisData.overall);
    }

    // Handle complete analysis from workflow response (6-panel structure)
    if (analysisData.completeAnalysis) {
      console.log("Complete analysis from workflow:", analysisData.completeAnalysis);
      setCompleteAnalysis(replacePartnerNamesInData(analysisData.completeAnalysis, userA?.firstName, userB?.firstName));
    }

    // Handle initial overview from workflow response
    if (analysisData.initialOverview) {
      console.log("Initial overview from workflow:", analysisData.initialOverview);
      setInitialOverview(analysisData.initialOverview);
    } else if (analysisData.clusterAnalysis?.initialOverview) {
      console.log("Initial overview from workflow cluster analysis:", analysisData.clusterAnalysis.initialOverview);
      setInitialOverview(analysisData.clusterAnalysis.initialOverview);
    }

    // Handle tension flow analysis from workflow response
    if (analysisData.tensionFlowAnalysis) {
      console.log("Tension flow analysis from workflow:", analysisData.tensionFlowAnalysis);
      setTensionFlowAnalysis(replacePartnerNamesInData(analysisData.tensionFlowAnalysis, userA?.firstName, userB?.firstName));
    }

    // Handle Scored Items from workflow (NEW API: direct scoredItems field)
    console.log("🔍 WORKFLOW: Checking for scoredItems in response:");
    console.log("🎯 WORKFLOW: analysisData.scoredItems:", analysisData?.scoredItems);

    if (analysisData?.scoredItems && Array.isArray(analysisData.scoredItems)) {
      console.log("✅ WORKFLOW: Scored Items found in response (length: " + analysisData.scoredItems.length + ")");
      setConsolidatedScoredItems(replacePartnerNamesInData(analysisData.scoredItems, userA?.firstName, userB?.firstName));
    } else if (analysisData?.clusterAnalysis?.scoredItems && Array.isArray(analysisData.clusterAnalysis.scoredItems)) {
      // Fallback for nested structure
      console.log("✅ WORKFLOW: Scored Items found in clusterAnalysis (length: " + analysisData.clusterAnalysis.scoredItems.length + ")");
      setConsolidatedScoredItems(replacePartnerNamesInData(analysisData.clusterAnalysis.scoredItems, userA?.firstName, userB?.firstName));
    } else {
      console.log("❌ WORKFLOW: scoredItems NOT FOUND in response or not an array");
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

  // Start workflow function (full analysis) - Enhanced for Stage 2
  const handleStartWorkflow = async () => {
    console.log("🚀🚀🚀 BUTTON CLICKED! Starting workflow...");
    console.log("🔍 compositeChart._id:", compositeChart?._id);
    
    if (!compositeChart?._id) {
      console.error('Missing composite chart ID to start full analysis workflow');
      return;
    }

    try {
      // Set starting state immediately
      console.log("Setting isStartingAnalysis to true");
      setIsStartingAnalysis(true);
      
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
      
      console.log('Starting full relationship analysis workflow for composite:', compositeChart._id);
      console.log('compositeChart object:', compositeChart);
      console.log('userA:', userA?._id);
      console.log('userB:', userB?._id);
      
      // Use the new enhanced API for starting full analysis from existing relationship
      const startResponse = await startFullRelationshipAnalysis(compositeChart._id);
      console.log('Start full analysis response:', startResponse);
      
      if (startResponse.success) {
        // Start polling immediately after successful start
        console.log('Full analysis workflow started successfully, beginning polling');
        startPolling();
      } else {
        // Reset starting state if failed
        setIsStartingAnalysis(false);
      }
    } catch (error) {
      console.error('Error starting full analysis workflow:', error);
      // Reset state on error
      setWorkflowStatus(null);
      setIsPolling(false);
      setIsStartingAnalysis(false);
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    }
  };

  // Start preview mode workflow (scores only)
  const handleStartPreviewWorkflow = async () => {
    if (!userA?._id || !userB?._id || !compositeChart?._id) {
      console.error('Missing required data to start preview workflow');
      return;
    }

    try {
      setIsGeneratingScores(true);
      console.log('🚀 STARTING PREVIEW WORKFLOW for composite:', compositeChart._id);
      
      // Start workflow with immediate=false for scores only
      const startResponse = await startRelationshipWorkflow(userA._id, userB._id, compositeChart._id, false);
      console.log('📥 PREVIEW WORKFLOW START RESPONSE:', JSON.stringify(startResponse, null, 2));
      
      if (startResponse.success) {
        setRelationshipWorkflowState({
          startedFromCreation: true,
          isPaused: false
        });
        
        // Wait 8 seconds before starting to poll (as recommended in API guide)
        console.log('⏰ Waiting 8 seconds before starting to poll...');
        setTimeout(() => {
          console.log('🔄 Starting to poll relationship workflow status');
          startRelationshipPolling();
        }, 8000);
      } else {
        console.error('Preview workflow start failed:', startResponse);
        setIsGeneratingScores(false);
      }
    } catch (error) {
      console.error('Error starting preview workflow:', error);
      setIsGeneratingScores(false);
      stopRelationshipPolling();
    }
  };

  // Resume workflow function for paused analyses
  const handleResumeWorkflow = async () => {
    if (!compositeChart?._id) {
      console.error('Cannot resume workflow: compositeChartId is missing');
      return;
    }
    
    console.log('🔄 Resuming relationship workflow for composite:', compositeChart._id);
    
    try {
      const response = await resumeRelationshipWorkflow(compositeChart._id);
      console.log('📥 Resume relationship workflow response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ Relationship workflow resumed successfully, starting polling');
        // Update workflow state to no longer be paused while preserving existing data
        setRelationshipWorkflowState(prev => ({
          ...prev,
          isPaused: false
        }));
        // Start polling to track progress
        startPolling();
      } else {
        console.log('❌ Resume response success was false:', response.success);
      }
    } catch (error) {
      console.error('Error resuming relationship workflow:', error);
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
        
        // Check for scores in manual check regardless of workflow status
        const scores = response.analysisData?.scores;
        const scoreAnalysis = response.analysisData?.scoreAnalysis;
        
        if (scores && !relationshipScores) {
          console.log('🎯 Found scores in manual check - setting immediately');
          console.log('📊 Workflow Status:', response.workflowStatus?.status);
          console.log('📊 Scores:', scores);
          console.log('📝 Score Analysis:', scoreAnalysis);
          
          setRelationshipScores(scores);
          setRelationshipWorkflowState({
            isPaused: response.workflowStatus?.status === 'paused_after_scores',
            hasScores: true,
            scores: scores,
            scoreAnalysis: scoreAnalysis || {},
            startedFromCreation: true
          });
          console.log('✅ Set scores from manual check');
        }
        
        // If workflow is still running, resume polling
        if (response.workflowStatus?.status === 'running' && !isPolling) {
          console.log('Workflow is running, resuming polling');
          startPolling();
        }
      }
    } catch (error) {
      console.error('Error checking workflow status:', error);
      setConnectionError(true);
    }
  };

  // Polling functions for preview workflow
  const pollRelationshipStatus = async () => {
    if (!compositeChart?._id) return;

    try {
      const response = await getRelationshipWorkflowStatus(compositeChart._id);
      console.log('📊 RELATIONSHIP WORKFLOW STATUS RESPONSE:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        setWorkflowStatus(response);
        
        // Check for scores regardless of workflow status
        const scores = response.analysisData?.scores;
        const scoreAnalysis = response.analysisData?.scoreAnalysis;
        
        if (scores && !relationshipScores) {
          console.log('🎯 FOUND SCORES IN RESPONSE!');
          console.log('📊 Workflow Status:', response.workflowStatus?.status);
          console.log('📊 Scores:', scores);
          console.log('📝 Score Analysis:', scoreAnalysis);
          
          setRelationshipScores(scores);
          setRelationshipWorkflowState({
            isPaused: response.workflowStatus?.status === 'paused_after_scores',
            hasScores: true,
            scores: scores,
            scoreAnalysis: scoreAnalysis || {},
            startedFromCreation: true
          });
          console.log('✅ Set scores in workflow state');
          
          setIsGeneratingScores(false);
          
          // Only stop polling if truly paused, not if still running
          if (response.workflowStatus?.status === 'paused_after_scores') {
            stopRelationshipPolling();
          }
        }
        // If workflow completed fully, also stop polling
        else if (response.workflowStatus?.status === 'completed') {
          if (response.analysisData) {
            updateAnalysisFromWorkflow(response.analysisData);
          }
          setIsGeneratingScores(false);
          stopRelationshipPolling();
        }
      }
    } catch (error) {
      console.error('Error polling relationship workflow status:', error);
      setRetryCount(prev => prev + 1);
      if (retryCount >= 3) {
        console.log('Too many polling errors, stopping polling');
        stopRelationshipPolling();
        setIsGeneratingScores(false);
      }
    }
  };

  // Start relationship polling
  const startRelationshipPolling = () => {
    if (pollInterval) return; // Don't start if already polling
    
    const interval = setInterval(pollRelationshipStatus, 3000); // Poll every 3 seconds
    setPollInterval(interval);
  };

  // Stop relationship polling
  const stopRelationshipPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  // Start full analysis polling
  const startPolling = () => {
    if (isPolling) return; // Don't start if already polling
    
    setIsPolling(true);
    // Don't clear isStartingAnalysis here - let it be cleared when we get the first status
    
    const interval = setInterval(async () => {
      try {
        const response = await getRelationshipWorkflowStatus(compositeChart._id);
        console.log('Poll response:', response);
        
        if (response.success) {
          setWorkflowStatus(response);
          setIsStartingAnalysis(false); // Clear starting state once we have a workflow status
          
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
        setIsStartingAnalysis(false); // Clear on error too
        clearInterval(interval);
        setPollInterval(null);
      }
    }, 3000);
    
    setPollInterval(interval);
  };

  // Track if we came from preview mode
  const [cameFromPreview, setCameFromPreview] = useState(false);
  
  // Auto-start preview workflow if coming from relationship creation
  useEffect(() => {
    // Check if we should auto-start preview workflow
    const params = new URLSearchParams(window.location.search);
    const autoStartPreview = params.get('preview') === 'true';
    
    if (autoStartPreview) {
      setCameFromPreview(true);
      
      if (compositeChart?._id && userA?._id && userB?._id && !relationshipScores && !isGeneratingScores && !workflowStatus) {
        console.log('🚀 Auto-starting preview workflow from URL parameter');
        handleStartPreviewWorkflow();
        
        // Remove the preview parameter from URL to avoid re-triggering
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('preview');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [compositeChart?._id, userA?._id, userB?._id, relationshipScores, isGeneratingScores, workflowStatus]);

  // Check for existing scores in workflow state when component mounts or when workflow state changes
  useEffect(() => {
    if (relationshipWorkflowState.hasScores && relationshipWorkflowState.scores && !relationshipScores) {
      console.log('🔄 Loading existing scores from workflow state');
      console.log('📊 Workflow state scores:', relationshipWorkflowState.scores);
      setRelationshipScores(relationshipWorkflowState.scores);
    }
  }, [relationshipWorkflowState.hasScores, relationshipWorkflowState.scores, relationshipScores]);
  
  // Also check for scores immediately when workflowStatus updates
  useEffect(() => {
    if (workflowStatus?.analysisData?.scores && !relationshipScores) {
      console.log('🚀 Setting scores immediately from workflowStatus update');
      console.log('📊 Workflow Status:', workflowStatus?.workflowStatus?.status);
      const scores = workflowStatus.analysisData.scores;
      const scoreAnalysis = workflowStatus.analysisData.scoreAnalysis;
      
      setRelationshipScores(scores);
      setRelationshipWorkflowState({
        isPaused: workflowStatus?.workflowStatus?.status === 'paused_after_scores',
        hasScores: true,
        scores: scores,
        scoreAnalysis: scoreAnalysis || {},
        startedFromCreation: true
      });
    }
  }, [workflowStatus?.analysisData?.scores, relationshipScores]);

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
  
  // Legacy chat functions removed - now using RelationshipEnhancedChat component

  // Check for scores in either relationshipScores state or workflow state  
  const availableScores = relationshipScores || relationshipWorkflowState.scores;
  const availableScoreAnalysis = relationshipWorkflowState.scoreAnalysis;

  const mainTabs = [];

  console.log('🔍 Building main tabs - relationshipScores:', relationshipScores);
  console.log('🔍 relationshipWorkflowState:', relationshipWorkflowState);
  console.log('🔍 tensionFlowAnalysis:', tensionFlowAnalysis);
  
  if (availableScores) {
    console.log('✅ Adding Scores tab to mainTabs');
    console.log('📊 Available scores:', availableScores);
    console.log('📝 Available score analysis:', availableScoreAnalysis);
    
    // Transform score analysis to match component expectations
    const formattedScoreDebugInfo = availableScoreAnalysis ? {
      categories: Object.keys(availableScores).reduce((acc, categoryKey) => {
        const analysis = availableScoreAnalysis[categoryKey];
        if (analysis) {
          // Check if this is the new structure (has analysis and scoredItems)
          if (analysis.analysis && analysis.scoredItems) {
            acc[categoryKey] = {
              scoreAnalysis: analysis // Pass the entire analysis object
            };
          } else {
            // Legacy structure (has scoreAnalysis, greenFlags, redFlags)
            acc[categoryKey] = {
              scoreAnalysis: analysis
            };
          }
        }
        return acc;
      }, {})
    } : scoreDebugInfo;
    
    mainTabs.push({
      id: 'scores',
      label: 'Scores',
      content: <RelationshipScoresRadarChart 
        clusterAnalysis={clusterScoring} 
        tensionFlowAnalysis={tensionFlowAnalysis}
        holisticOverview={holisticOverview}
        initialOverview={initialOverview}
        isFullAnalysisComplete={isFullAnalysisComplete()}
        onStartFullAnalysis={handleStartWorkflow}
        isStartingAnalysis={isStartingAnalysis}
      />
    });
  } else {
    console.log('❌ No scores available, Scores tab not added');
    console.log('❌ relationshipScores:', relationshipScores);
    console.log('❌ relationshipWorkflowState.scores:', relationshipWorkflowState.scores);
  }

  // Add Enhanced Relationship Analysis tab (shows cluster analysis and initial overview)
  if (clusterScoring?.clusters || initialOverview) {
    mainTabs.push({
      id: 'overview',
      label: 'Overview',
      content: <RelationshipAnalysis 
        userAName={userA?.firstName || 'User A'} 
        userBName={userB?.firstName || 'User B'} 
        scoreAnalysis={relationshipWorkflowState.scoreAnalysis}
        clusterAnalysis={clusterScoring}
        overall={overall}
        completeAnalysis={completeAnalysis}
        initialOverview={initialOverview}
        isFullAnalysisComplete={isFullAnalysisComplete()}
        onStartFullAnalysis={handleStartWorkflow}
        isStartingAnalysis={isStartingAnalysis}
      />
    });
  }

  // Add Detailed Analysis Panels tab (only when complete analysis is available)
  if (isFullAnalysisComplete() && completeAnalysis) {
    mainTabs.push({
      id: 'detailed-analysis',
      label: 'Detailed Analysis',
      content: <DetailedAnalysisPanels 
        completeAnalysis={completeAnalysis}
        userAName={userA?.firstName || 'User A'} 
        userBName={userB?.firstName || 'User B'} 
      />
    });
  }

  // V2 Analysis uses keystone aspects integrated into the scores tab

  // Holistic overview is now integrated into the radar chart component

  console.log("🔍 Chat Tab Conditions Check:", {
    vectorizationStatus: vectorizationStatus?.relationshipAnalysis,
    workflowComplete,
    isFullAnalysisComplete: isFullAnalysisComplete(),
    hasUserA: !!userA,
    hasUserB: !!userB,
    hasCompositeChart: !!compositeChart,
    shouldShowChat: (vectorizationStatus.relationshipAnalysis || workflowComplete || isFullAnalysisComplete()) && userA && userB && compositeChart
  });
  
  if ((vectorizationStatus.relationshipAnalysis || workflowComplete || isFullAnalysisComplete()) && userA && userB && compositeChart) {
    mainTabs.push({
      id: 'chat',
      label: 'Chat',
      content: (
        <RelationshipEnhancedChat
          compositeChartId={compositeChart._id}
          synastryAspects={synastryAspects}
          compositeChart={compositeChart}
          consolidatedScoredItems={consolidatedScoredItems}
          userAName={userA.firstName}
          userBName={userB.firstName}
          chatMessages={relationshipEnhancedChatMessages}
          setChatMessages={setRelationshipEnhancedChatMessages}
        />
      )
    });
  } else if (relationshipWorkflowState.isPaused) {
    mainTabs.push({
      id: 'chat',
      label: 'Chat',
      content: (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>💬 Relationship AI Chat</h3>
          <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
            Chat with your personal AI relationship astrologer! Ask questions about your compatibility, 
            relationship dynamics, or any aspect of your astrological connection. 
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
      )
    });
  }

  // Holistic overview placeholder is no longer needed - integrated into radar chart

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
            {/* <div style={{ margin: '10px 0', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
              <h4>Debug Info:</h4>
              <pre>
                {JSON.stringify({
                  relationshipScores: !!relationshipScores,
                  relationshipWorkflowState: relationshipWorkflowState,
                  isGeneratingScores,
                  cameFromPreview,
                  workflowStatus: workflowStatus?.workflowStatus?.status,
                  hasWorkflowStatus: !!workflowStatus,
                  shouldShowWorkflowControl: !relationshipScores && !relationshipWorkflowState.hasScores && !isGeneratingScores && !cameFromPreview && !workflowStatus
                }, null, 2)}
              </pre>
            </div> */}

            {/* Preview Mode - Generating Scores Status */}
            {isGeneratingScores && (
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
                <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>💕 Generating Your Compatibility Scores...</h3>
                <p style={{ color: 'white', margin: '0' }}>
                  We're analyzing your relationship dynamics to create personalized compatibility scores. This will be ready in about 30-45 seconds.
                </p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}

            {/* Starting Analysis State - Show this when isStartingAnalysis is true */}
            {isStartingAnalysis && (
              <div style={{ 
                backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                padding: '20px', 
                borderRadius: '8px', 
                margin: '20px 0',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a78bfa',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    border: '3px solid rgba(167, 139, 250, 0.3)',
                    borderTop: '3px solid #a78bfa',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '12px'
                  }} />
                  Starting your relationship analysis...
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
                <p style={{ color: 'white', margin: '15px 0 0 0', fontSize: '14px' }}>
                  Please wait while we initialize your comprehensive compatibility analysis.
                </p>
              </div>
            )}

            {/* Scores Available - Start Full Analysis State */}
            {(() => {
              const hasScores = relationshipScores || (relationshipWorkflowState.isPaused && relationshipWorkflowState.hasScores);
              const noVectorization = !vectorizationStatus?.relationshipAnalysis;
              const notComplete = !workflowComplete;
              const notRunning = !isWorkflowRunning;
              const notStarting = !isStartingAnalysis;
              
              console.log("🔍 Start Full Analysis Button Conditions:", {
                hasScores,
                noVectorization,
                notComplete,
                notRunning,
                notStarting,
                shouldShow: hasScores && noVectorization && notComplete && notRunning && notStarting,
                relationshipScores: !!relationshipScores,
                vectorizationStatus: vectorizationStatus,
                workflowComplete,
                isWorkflowRunning,
                isStartingAnalysis
              });
              
              return hasScores && noVectorization && notComplete && notRunning && notStarting;
            })() && (
              <div style={{ 
                backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                padding: '20px', 
                borderRadius: '8px', 
                margin: '20px 0',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <h2 style={{ color: '#a78bfa', margin: '0 0 15px 0' }}>✨ Your Compatibility Scores Are Ready!</h2>
                <p style={{ 
                  color: 'white', 
                  lineHeight: '1.6', 
                  margin: '0 0 15px 0',
                  fontSize: '16px'
                }}>
                  Your relationship scores have been calculated and are displayed below. This is just the beginning! 
                  Complete your full analysis to unlock detailed insights for each category.
                </p>
                <div style={{ marginTop: '15px', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <button
                    onClick={handleStartWorkflow}
                    style={{
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      marginRight: '10px'
                    }}
                  >
                    {console.log("🎯 RENDERING Start Full Analysis button in 'Scores Available' section")}
                    {relationshipWorkflowState.isPaused ? 'Complete Full Analysis' : 'Start Full Analysis'}
                  </button>
                  <p style={{ color: '#a78bfa', fontSize: '14px', margin: '10px 0 0 0' }}>
                    Unlock detailed category analyses, personalized insights, and AI chat about your relationship.
                  </p>
                </div>
              </div>
            )}

            {/* Workflow Control Section - only show if no scores, not generating, not from preview, and no existing workflow */}
            {!relationshipScores && 
             !relationshipWorkflowState.hasScores && 
             !isGeneratingScores && 
             !cameFromPreview && 
             !workflowStatus && (
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
              </div>
            )}

            {/* Show progress for running state - always visible when running */}
            {workflowStatus?.workflowStatus?.status === 'running' && (
              <div className="workflow-section">
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
                    {workflowStatus?.workflowStatus?.progress?.percentage === 100 
                      ? 'Finalizing your relationship analysis...' 
                      : `${workflowStatus?.workflowStatus?.progress?.percentage || 0}% Complete`
                    }
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

              {/* Show incomplete tasks for incomplete or completed_with_failures states - only when no scores */}
              {!relationshipScores && !relationshipWorkflowState.hasScores && 
                (workflowStatus?.workflowStatus?.status === 'incomplete' || 
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

        {/* Start Full Analysis Button - positioned above tabs */}
        {(() => {
          const hasClusterData = clusterScoring?.clusters;
          const hasScores = relationshipScores || relationshipWorkflowState.hasScores;
          const hasInitialOverview = initialOverview;
          const hasBasicData = hasClusterData || hasScores || hasInitialOverview;
          const needsFullAnalysis = !isFullAnalysisComplete();
          const notCurrentlyRunning = !isWorkflowRunning && !isStartingAnalysis;
          
          console.log("🔍 Button Display Logic - NEW STRUCTURE:", {
            hasClusterData: !!hasClusterData,
            hasScores,
            hasInitialOverview: !!hasInitialOverview,
            hasBasicData,
            needsFullAnalysis,
            notCurrentlyRunning,
            hasCompleteAnalysis: !!completeAnalysis,
            isFullAnalysisComplete: isFullAnalysisComplete(),
            shouldShow: hasBasicData && needsFullAnalysis && notCurrentlyRunning
          });
          
          return hasBasicData && needsFullAnalysis && notCurrentlyRunning;
        })() && (
          <div style={{ 
            margin: '20px 0', 
            padding: '20px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            borderRadius: '12px', 
            textAlign: 'center',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '18px' }}>🚀 Ready for Your Complete Analysis?</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '15px', fontSize: '14px' }}>
              Unlock detailed cluster insights, personalized compatibility analysis, and AI chat about your relationship.
            </p>
            <button
              onClick={handleStartWorkflow}
              disabled={isStartingAnalysis}
              style={{
                backgroundColor: isStartingAnalysis ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)',
                color: isStartingAnalysis ? 'rgba(255, 255, 255, 0.7)' : '#1f2937',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isStartingAnalysis ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isStartingAnalysis ? (
                <>
                  <span style={{ marginRight: '8px' }}>🔄</span>
                  Starting Complete Analysis...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '8px' }}>✨</span>
                  Start Complete Analysis
                </>
              )}
            </button>
            
            {/* Temporary debug refresh button */}
            <button
              onClick={async () => {
                console.log('🔄 Manual refresh triggered');
                await initializeCompositeChartData();
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                marginLeft: '10px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Data
            </button>
          </div>
        )}

        <TabMenu tabs={mainTabs} />
      </div>
    </div>
  )
}

export default CompositeDashboard_v4;
