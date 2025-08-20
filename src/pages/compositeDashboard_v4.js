import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../Utilities/store';
import SynastryBirthChartComparison_v2 from '../UI/birthChart/tables/SynastryBirthChartComparison_v2'
import RelationshipScoresRadarChart from '../UI/prototype/RelationshipScoresRadarChart';
import { RelationshipCategoriesEnum, orderedCategoryKeys } from '../Utilities/constants';
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


// Helper functions for filtering consolidated scored items
const getAspectsForCategory = (items, category) => {
  return items.filter(item => 
    item.categoryData.some(cd => cd.category === category)
  );
};

const getSupportAspects = (items, category) => {
  return getAspectsForCategory(items, category)
    .filter(item => 
      item.categoryData.some(cd => 
        cd.category === category && cd.valence === 1
      )
    )
    .sort((a, b) => {
      const aScore = a.categoryData.find(cd => cd.category === category)?.score || 0;
      const bScore = b.categoryData.find(cd => cd.category === category)?.score || 0;
      return bScore - aScore;
    });
};

const getChallengeAspects = (items, category) => {
  return getAspectsForCategory(items, category)
    .filter(item => 
      item.categoryData.some(cd => 
        cd.category === category && cd.valence === -1
      )
    )
    .sort((a, b) => {
      const aScore = Math.abs(a.categoryData.find(cd => cd.category === category)?.score || 0);
      const bScore = Math.abs(b.categoryData.find(cd => cd.category === category)?.score || 0);
      return bScore - aScore;
    });
};

const getHeatAspects = (items, category) => {
  return getAspectsForCategory(items, category)
    .filter(item => 
      item.categoryData.some(cd => 
        cd.category === category && (cd.spark === true || cd.intensity > 1.5)
      )
    )
    .sort((a, b) => {
      const aIntensity = a.categoryData.find(cd => cd.category === category)?.intensity || 0;
      const bIntensity = b.categoryData.find(cd => cd.category === category)?.intensity || 0;
      return bIntensity - aIntensity;
    });
};

const getActivityAspects = (items, category) => {
  return getAspectsForCategory(items, category)
    .filter(item => 
      item.categoryData.some(cd => 
        cd.category === category && cd.weight > 0
      )
    )
    .sort((a, b) => {
      const aWeight = a.categoryData.find(cd => cd.category === category)?.weight || 0;
      const bWeight = b.categoryData.find(cd => cd.category === category)?.weight || 0;
      return bWeight - aWeight;
    });
};

const getSparkIcon = (sparkType) => {
  switch (sparkType) {
    case 'sexual': return '🔥';
    case 'transformative': return '💫';
    case 'intellectual': return '🧠';
    case 'emotional': return '💝';
    case 'power': return '⚡';
    default: return '✨';
  }
};

// AspectTable component for displaying filtered aspects
const AspectTable = ({ aspects, category, metricType, themeColor }) => {
  if (!aspects || aspects.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#9ca3af',
        fontStyle: 'italic'
      }}>
        No {metricType.toLowerCase()} aspects found for this category
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: `${themeColor}15`, 
      border: `1px solid ${themeColor}40`,
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: `${themeColor}25`,
        padding: '12px 16px',
        borderBottom: `1px solid ${themeColor}40`,
        fontWeight: 'bold',
        color: themeColor,
        fontSize: '14px'
      }}>
        {metricType} Aspects ({aspects.length})
      </div>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {aspects.map((aspect, index) => {
          const categoryData = aspect.categoryData.find(cd => cd.category === category);
          const starRating = categoryData?.starRating || 0;
          const stars = '⭐'.repeat(Math.min(starRating, 5));
          
          return (
            <div key={aspect.id || index} style={{
              padding: '12px 16px',
              borderBottom: index < aspects.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              fontSize: '14px'
            }}>
              <div style={{ 
                color: 'white', 
                marginBottom: '6px',
                lineHeight: '1.4'
              }}>
                {aspect.description}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#9ca3af'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ 
                    backgroundColor: (aspect.source === 'synastry' || aspect.source === 'synastryHousePlacement') ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {(aspect.source === 'synastry' || aspect.source === 'synastryHousePlacement') ? 'SYN' : 'COMP'}
                  </span>
                  {starRating > 0 && <span>{stars}</span>}
                  {categoryData?.spark && (
                    <span style={{ fontSize: '14px' }}>
                      {getSparkIcon(categoryData.sparkType)}
                    </span>
                  )}
                  {categoryData?.isKeystone && (
                    <span style={{ 
                      color: '#fbbf24',
                      fontWeight: 'bold',
                      fontSize: '11px'
                    }}>
                      KEY
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span>Score: <strong style={{color: categoryData?.score >= 0 ? '#10b981' : '#ef4444'}}>{categoryData?.score}</strong></span>
                  {metricType === 'Heat' && <span>Intensity: <strong>{categoryData?.intensity?.toFixed(1)}</strong></span>}
                  {metricType === 'Activity' && <span>Weight: <strong>{categoryData?.weight?.toFixed(1)}</strong></span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// MetricCard component for expandable metrics
const MetricCard = ({ title, value, color, aspects, category, metricType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAspects = aspects && aspects.length > 0;
  
  return (
    <div style={{ textAlign: 'center' }}>
      <div 
        onClick={() => hasAspects && setIsExpanded(!isExpanded)}
        style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: color,
          cursor: hasAspects ? 'pointer' : 'default',
          padding: '8px',
          borderRadius: '8px',
          transition: 'background-color 0.2s',
          ':hover': hasAspects ? { backgroundColor: `${color}20` } : {}
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
        {title}
      </div>
      {hasAspects && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: `1px solid ${color}`,
            color: color,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '4px'
          }}
        >
          {isExpanded ? '▼ Hide' : '▶ View'} {aspects.length} aspects
        </button>
      )}
    </div>
  );
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
    const [detailedRelationshipAnalysis, setDetailedRelationshipAnalysis] = useState(null);
    
    // Add state for holistic overview
    const [holisticOverview, setHolisticOverview] = useState(null);
    
    // Add state for profile analysis
    const [profileAnalysis, setProfileAnalysis] = useState(null);
    
    // Add state for cluster scoring (numerical data)
    const [clusterScoring, setClusterScoring] = useState(null);
    
    // Add state for complete analysis (LLM-generated text panels) - 6-panel format
    const [completeAnalysis, setCompleteAnalysis] = useState(null);
    
    // Extract scored items from cluster analysis
    const extractScoredItemsFromClusters = useCallback((clusterData) => {
        if (!clusterData?.clusters) return [];
        
        const allScoredItems = [];
        Object.values(clusterData.clusters).forEach(cluster => {
            if (cluster.keystoneAspects) {
                cluster.keystoneAspects.forEach(keystoneAspect => {
                    if (keystoneAspect.item) {
                        allScoredItems.push(keystoneAspect.item);
                    }
                });
            }
        });
        
        console.log("🔍 Extracted scored items from clusters:", allScoredItems);
        return allScoredItems;
    }, []);
    
    // Add state for tension flow analysis
    const [tensionFlowAnalysis, setTensionFlowAnalysis] = useState(null);
    
    // Add state for initial overview
    const [initialOverview, setInitialOverview] = useState(null);
    
    // Add V2 state management
    const [v2Analysis, setV2Analysis] = useState(null);
    const [v2Metrics, setV2Metrics] = useState(null);
    const [v2KeystoneAspects, setV2KeystoneAspects] = useState([]);
    const [isV2Analysis, setIsV2Analysis] = useState(false);
    const [consolidatedScoredItems, setConsolidatedScoredItems] = useState([]);
    
    // State for expanded metrics in each category
    const [expandedMetrics, setExpandedMetrics] = useState({});
    
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

                // Handle relationship analysis
                if (fetchedData?.analysis) {
                    console.log("Detailed analysis available: ", fetchedData.analysis);
                    setDetailedRelationshipAnalysis({
                        analysis: fetchedData.analysis,
                        userAName: fetchedData.debug?.inputSummary?.userAName || userA?.firstName,
                        userBName: fetchedData.debug?.inputSummary?.userBName || userB?.firstName
                    });
                }

                // Handle holistic overview
                if (fetchedData?.holisticOverview) {
                    console.log("Holistic overview available: ", fetchedData.holisticOverview);
                    setHolisticOverview(fetchedData.holisticOverview);
                }

                // Handle profile analysis
                if (fetchedData?.profileAnalysis) {
                    console.log("Profile analysis available: ", fetchedData.profileAnalysis);
                    setProfileAnalysis(fetchedData.profileAnalysis);
                }

                // Handle cluster scoring (numerical data)
                if (fetchedData?.clusterScoring) {
                    console.log("Cluster scoring available: ", fetchedData.clusterScoring);
                    setClusterScoring(fetchedData.clusterScoring);
                } else if (fetchedData?.clusterAnalysis) {
                    // Fallback for old field name
                    console.log("Cluster analysis (legacy field) available: ", fetchedData.clusterAnalysis);
                    setClusterScoring(fetchedData.clusterAnalysis);
                }
                
                // Handle complete analysis (LLM-generated 6-panel text)
                if (fetchedData?.completeAnalysis) {
                    console.log("Complete analysis available: ", fetchedData.completeAnalysis);
                    setCompleteAnalysis(fetchedData.completeAnalysis);
                }
                
                // Handle initial overview
                if (fetchedData?.initialOverview) {
                    console.log("Initial overview available: ", fetchedData.initialOverview);
                    setInitialOverview(fetchedData.initialOverview);
                } else if (fetchedData?.clusterScoring?.initialOverview) {
                    console.log("Initial overview from cluster scoring: ", fetchedData.clusterScoring.initialOverview);
                    setInitialOverview(fetchedData.clusterScoring.initialOverview);
                } else if (fetchedData?.clusterAnalysis?.initialOverview) {
                    console.log("Initial overview from cluster analysis (legacy): ", fetchedData.clusterAnalysis.initialOverview);
                    setInitialOverview(fetchedData.clusterAnalysis.initialOverview);
                }

                // Handle tension flow analysis
                if (fetchedData?.tensionFlowAnalysis) {
                    console.log("Tension flow analysis available: ", fetchedData.tensionFlowAnalysis);
                    setTensionFlowAnalysis(fetchedData.tensionFlowAnalysis);
                }

                // Handle legacy V2 Analysis data (if present)
                if (fetchedData?.v2Analysis) {
                    console.log("✅ Legacy V2 Analysis available: ", fetchedData.v2Analysis);
                    setV2Analysis(fetchedData.v2Analysis);
                    setIsV2Analysis(true);
                }

                // Handle V2 Metrics
                if (fetchedData?.v2Metrics) {
                    console.log("V2 Metrics available: ", fetchedData.v2Metrics);
                    setV2Metrics(fetchedData.v2Metrics);
                }

                // Handle V2 Keystone Aspects
                if (fetchedData?.v2KeystoneAspects) {
                    console.log("V2 Keystone Aspects available: ", fetchedData.v2KeystoneAspects);
                    setV2KeystoneAspects(fetchedData.v2KeystoneAspects);
                }

                // Handle Scored Items (new structure - nested in clusterAnalysis)
                console.log("🔍 CHECKING FOR scoredItems in clusterAnalysis:");
                console.log("🎯 fetchedData.clusterAnalysis?.scoredItems:", fetchedData?.clusterAnalysis?.scoredItems);
                
                if (fetchedData?.clusterAnalysis?.scoredItems && Array.isArray(fetchedData.clusterAnalysis.scoredItems)) {
                    console.log("✅ Scored Items found in clusterAnalysis (length: " + fetchedData.clusterAnalysis.scoredItems.length + ")");
                    setConsolidatedScoredItems(fetchedData.clusterAnalysis.scoredItems);
                } else {
                    console.log("❌ scoredItems NOT FOUND in clusterAnalysis or not an array");
                }

                // Set V2 flag if we detected it
                if (fetchedData?.isV2Analysis) {
                    console.log("🚀 SETTING isV2Analysis to TRUE");
                    setIsV2Analysis(true);
                } else {
                    console.log("❌ isV2Analysis flag NOT found in response");
                    console.log("📊 Available keys:", Object.keys(fetchedData || {}));
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

    if (analysisData.analysis) {
      setDetailedRelationshipAnalysis({
        analysis: analysisData.analysis,
        userAName: userA?.firstName,
        userBName: userB?.firstName
      });
    }

    // Handle holistic overview from workflow response
    if (analysisData.holisticOverview) {
      console.log("Holistic overview from workflow:", analysisData.holisticOverview);
      setHolisticOverview(analysisData.holisticOverview);
    }

    // Handle profile analysis from workflow response
    if (analysisData.profileAnalysis) {
      console.log("Profile analysis from workflow:", analysisData.profileAnalysis);
      setProfileAnalysis(analysisData.profileAnalysis);
    }

    // Handle cluster scoring from workflow response
    if (analysisData.clusterScoring) {
      console.log("Cluster scoring from workflow:", analysisData.clusterScoring);
      setClusterScoring(analysisData.clusterScoring);
    } else if (analysisData.clusterAnalysis) {
      // Fallback for legacy field name
      console.log("Cluster analysis (legacy) from workflow:", analysisData.clusterAnalysis);
      setClusterScoring(analysisData.clusterAnalysis);
    }

    // Handle complete analysis from workflow response (6-panel structure)
    if (analysisData.completeAnalysis) {
      console.log("Complete analysis from workflow:", analysisData.completeAnalysis);
      setCompleteAnalysis(analysisData.completeAnalysis);
    }

    // Handle initial overview from workflow response
    if (analysisData.initialOverview) {
      console.log("Initial overview from workflow:", analysisData.initialOverview);
      setInitialOverview(analysisData.initialOverview);
    } else if (analysisData.clusterScoring?.initialOverview) {
      console.log("Initial overview from workflow cluster scoring:", analysisData.clusterScoring.initialOverview);
      setInitialOverview(analysisData.clusterScoring.initialOverview);
    } else if (analysisData.clusterAnalysis?.initialOverview) {
      console.log("Initial overview from workflow cluster analysis (legacy):", analysisData.clusterAnalysis.initialOverview);
      setInitialOverview(analysisData.clusterAnalysis.initialOverview);
    }

    // Handle tension flow analysis from workflow response
    if (analysisData.tensionFlowAnalysis) {
      console.log("Tension flow analysis from workflow:", analysisData.tensionFlowAnalysis);
      setTensionFlowAnalysis(analysisData.tensionFlowAnalysis);
    }

    // Handle V2 Analysis data from workflow
    if (analysisData.v2Analysis) {
      console.log("V2 Analysis from workflow:", analysisData.v2Analysis);
      setV2Analysis(analysisData.v2Analysis);
      setIsV2Analysis(true);
    }

    // Handle V2 Metrics from workflow
    if (analysisData.v2Metrics) {
      console.log("V2 Metrics from workflow:", analysisData.v2Metrics);
      setV2Metrics(analysisData.v2Metrics);
    }

    // Handle V2 Keystone Aspects from workflow
    if (analysisData.v2KeystoneAspects) {
      console.log("V2 Keystone Aspects from workflow:", analysisData.v2KeystoneAspects);
      setV2KeystoneAspects(analysisData.v2KeystoneAspects);
    }

    // Handle Scored Items from workflow (new structure - nested in clusterScoring)
    console.log("🔍 WORKFLOW: Checking for scoredItems in clusterScoring:");
    console.log("🎯 WORKFLOW: analysisData.clusterScoring?.scoredItems:", analysisData?.clusterScoring?.scoredItems);
    
    if (analysisData?.clusterScoring?.scoredItems && Array.isArray(analysisData.clusterScoring.scoredItems)) {
      console.log("✅ WORKFLOW: Scored Items found in clusterScoring (length: " + analysisData.clusterScoring.scoredItems.length + ")");
      setConsolidatedScoredItems(analysisData.clusterScoring.scoredItems);
    } else {
      console.log("❌ WORKFLOW: scoredItems NOT FOUND in clusterScoring or not an array");
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

  const analysisTabs = [];

  if (detailedRelationshipAnalysis) {
    orderedCategoryKeys.forEach(cat => {
      const value = detailedRelationshipAnalysis.analysis[cat];
      if (!value) return;
      analysisTabs.push({
        id: cat,
        label: RelationshipCategoriesEnum[cat]?.label || cat.replace(/_/g, ' '),
        content: (
          <div style={{ padding: '20px' }}>
            {v2Metrics?.[cat] && (() => {
              const expandedMetric = expandedMetrics[cat];
              const setExpandedMetric = (metricKey) => {
                setExpandedMetrics(prev => ({
                  ...prev,
                  [cat]: prev[cat] === metricKey ? null : metricKey
                }));
              };
              
              const supportAspects = getSupportAspects(consolidatedScoredItems, cat);
              const challengeAspects = getChallengeAspects(consolidatedScoredItems, cat);
              const heatAspects = getHeatAspects(consolidatedScoredItems, cat);
              const activityAspects = getActivityAspects(consolidatedScoredItems, cat);
              
              console.log(`=== DEBUGGING ASPECTS FOR CATEGORY ${cat} ===`);
              console.log('consolidatedScoredItems length:', consolidatedScoredItems?.length || 0);
              console.log('supportAspects:', supportAspects?.length || 0);
              console.log('challengeAspects:', challengeAspects?.length || 0);
              console.log('heatAspects:', heatAspects?.length || 0);
              console.log('activityAspects:', activityAspects?.length || 0);
              
              const metricsData = [
                {
                  key: 'support',
                  title: 'Support',
                  value: `${v2Metrics[cat].supportPct}%`,
                  color: '#10b981',
                  aspects: supportAspects,
                  metricType: 'Support'
                },
                {
                  key: 'challenge', 
                  title: 'Challenge',
                  value: `${v2Metrics[cat].challengePct}%`,
                  color: '#ef4444',
                  aspects: challengeAspects,
                  metricType: 'Challenge'
                },
                {
                  key: 'heat',
                  title: 'Heat', 
                  value: `${v2Metrics[cat].heatPct}%`,
                  color: '#f59e0b',
                  aspects: heatAspects,
                  metricType: 'Heat'
                },
                {
                  key: 'activity',
                  title: 'Activity',
                  value: `${v2Metrics[cat].activityPct}%`,
                  color: '#3b82f6', 
                  aspects: activityAspects,
                  metricType: 'Activity'
                }
              ];

              return (
                <div style={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: '#8b5cf6', margin: '0 0 15px 0' }}>📊 Relationship Dynamics</h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '15px'
                  }}>
                    {metricsData.map(metric => {
                      const hasAspects = metric.aspects && metric.aspects.length > 0;
                      const isExpanded = expandedMetric === metric.key;
                      
                      return (
                        <div key={metric.key} style={{ textAlign: 'center' }}>
                          <div 
                            onClick={() => {
                              console.log(`Clicked ${metric.title} - hasAspects: ${hasAspects}, aspects count: ${metric.aspects?.length || 0}`);
                              if (hasAspects) {
                                setExpandedMetric(metric.key);
                              } else {
                                console.log(`No aspects found for ${metric.title} in category ${cat}`);
                                alert(`Debug: No ${metric.title.toLowerCase()} aspects found for this category. Check console for details.`);
                              }
                            }}
                            style={{ 
                              fontSize: '24px', 
                              fontWeight: 'bold', 
                              color: metric.color,
                              cursor: 'pointer', // Always show pointer cursor for debugging
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: isExpanded ? `${metric.color}20` : 'transparent',
                              transition: 'background-color 0.2s',
                              border: hasAspects ? `2px solid transparent` : `2px dashed ${metric.color}40` // Show visual indicator
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = `${metric.color}20`;
                            }}
                            onMouseLeave={(e) => {
                              if (!isExpanded) e.target.style.backgroundColor = 'transparent';
                            }}
                          >
                            {metric.value}
                          </div>
                          <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
                            {metric.title}
                          </div>
                          {/* Always show button for debugging */}
                          <button
                            onClick={() => {
                              console.log(`Button clicked for ${metric.title}`);
                              if (hasAspects) {
                                setExpandedMetric(metric.key);
                              } else {
                                alert(`Debug: Found ${metric.aspects?.length || 0} ${metric.title.toLowerCase()} aspects`);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: `1px solid ${metric.color}`,
                              color: metric.color,
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              marginTop: '4px',
                              opacity: hasAspects ? 1 : 0.5
                            }}
                          >
                            {hasAspects 
                              ? `${isExpanded ? '▼ Hide' : '▶ View'} ${metric.aspects.length} aspects`
                              : `Debug: ${metric.aspects?.length || 0} aspects`
                            }
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Spark Elements and Quadrant */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '15px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#9ca3af' }}>Spark Elements:</span>
                      <span style={{ 
                        color: '#fbbf24', 
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {v2Metrics[cat].sparkElements > 0 ? '⚡'.repeat(Math.min(v2Metrics[cat].sparkElements, 5)) : '—'}
                      </span>
                    </div>
                    <div style={{ 
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#a78bfa'
                    }}>
                      {v2Metrics[cat].quadrant}
                    </div>
                  </div>

                  {/* Show expanded aspect table below the metrics grid */}
                  {expandedMetric && (() => {
                    const selectedMetric = metricsData.find(m => m.key === expandedMetric);
                    return selectedMetric && selectedMetric.aspects ? (
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <AspectTable 
                          aspects={selectedMetric.aspects}
                          category={cat}
                          metricType={selectedMetric.metricType}
                          themeColor={selectedMetric.color}
                        />
                      </div>
                    ) : null;
                  })()}
                </div>
              );
            })()}

            {value.v3MetricsInterpretation && (
              <div style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#22c55e', margin: '0 0 15px 0' }}>💫 Quick Analysis Overview</h3>
                <p style={{ 
                  color: 'white', 
                  lineHeight: '1.6', 
                  margin: '0',
                  fontSize: '16px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {value.v3MetricsInterpretation}
                </p>
              </div>
            )}

            {value.panels?.synastry && (
              <div style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#3b82f6', margin: '0 0 15px 0' }}>🔗 Synastry Analysis</h3>
                <p style={{ 
                  color: 'white', 
                  lineHeight: '1.6', 
                  margin: '0',
                  fontSize: '16px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {value.panels.synastry}
                </p>
              </div>
            )}

            {value.panels?.composite && (
              <div style={{ 
                backgroundColor: 'rgba(168, 85, 247, 0.1)', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#a855f7', margin: '0 0 15px 0' }}>🌟 Composite Analysis</h3>
                <p style={{ 
                  color: 'white', 
                  lineHeight: '1.6', 
                  margin: '0',
                  fontSize: '16px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {value.panels.composite}
                </p>
              </div>
            )}

            {value.panels?.fullAnalysis && (
              <div style={{ 
                backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#a78bfa', margin: '0 0 15px 0' }}>💫 Detailed Analysis</h3>
                <p style={{ 
                  color: 'white', 
                  lineHeight: '1.6', 
                  margin: '0',
                  fontSize: '16px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {value.panels.fullAnalysis}
                </p>
              </div>
            )}
          </div>
        )
      });
    });
  } else if (relationshipWorkflowState.isPaused) {
    // Show complete analysis prompts for each category when paused
    orderedCategoryKeys.forEach(cat => {
      analysisTabs.push({
        id: cat,
        label: RelationshipCategoriesEnum[cat]?.label || cat.replace(/_/g, ' '),
        content: (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: '#a78bfa', marginBottom: '15px' }}>💕 {RelationshipCategoriesEnum[cat]?.label} Analysis</h3>
            <p style={{ color: 'white', marginBottom: '20px', lineHeight: '1.6' }}>
              Discover detailed insights about this aspect of your relationship compatibility, 
              including synastry analysis, composite chart interpretation, and personalized guidance.
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
              Complete Analysis to Unlock
            </button>
          </div>
        )
      });
    });
  }

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
  if (clusterScoring?.clusters || initialOverview || detailedRelationshipAnalysis) {
    mainTabs.push({
      id: 'overview',
      label: 'Overview',
      content: <RelationshipAnalysis 
        analysis={detailedRelationshipAnalysis} 
        userAName={userA?.firstName || 'User A'} 
        userBName={userB?.firstName || 'User B'} 
        scoreAnalysis={relationshipWorkflowState.scoreAnalysis}
        clusterAnalysis={clusterScoring}
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

  if (analysisTabs.length > 0) {
    mainTabs.push({
      id: 'analysis',
      label: 'Analysis',
      content: <TabMenu tabs={analysisTabs} />
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