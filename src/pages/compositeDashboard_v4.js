import React, { useEffect, useState } from 'react';
import useStore from '../Utilities/store';
import { heading_map, planetCodes } from '../Utilities/constants';
import { identifyBirthChartPattern } from '../Utilities/generatePatternDescription'
import SynastryAspectsDescriptionsTable from '../UI/birthChart/tables/SynastryAspectsDescriptionsTable'
import SynastryBirthChartComparison from '../UI/birthChart/tables/SynastryBirthChartComparison'
import SynastryBirthChartComparison_v2 from '../UI/birthChart/tables/SynastryBirthChartComparison_v2'
import SynastryHousePositionsTable from '../UI/birthChart/tables/SynastryHousePositionsTable'
import RelationshipScores from '../UI/prototype/RelationshipScores';
import RelationshipAspects from '../UI/prototype/RelationshipAspects';
import RelationshipAnalysis from '../UI/prototype/RelationshipAnalysis';
import { CompositeChartHeadingEnums, planet_headings } from '../Utilities/constants';
import { 
  generatePlanetPromptDescription,
  findPlanetsInQuadrant, 
  findPlanetsInElements, 
  findPlanetsInModalities } from '../Utilities/generateBirthDataDescriptions'
import StatusList from '../UI/prototype/StatusList';
import {
  fetchBirthChartInterpretation,
  fetchCompositeChartInterpretation,
  postPromptGeneration,
  postPromptGenerationCompositeChart,
  postPromptGenerationSynastry,
  postGptResponseCompositeChartPlanet,
  postGptResponseCompositeChart,
  postGptResponseSynastry,
  fetchUser,
  saveCompositeChartInterpretation,
  saveSynastryChartInterpretation,
  getCompositeChartInterpretation,
  getSynastryInterpretation,
  getRelationshipScore,
  fetchRelationshipScores,
  generateRelationshipAnalysis,
  processAndVectorizeRelationshipAnalysis
  } from '../Utilities/api';
import { handleFetchDailyTransits, handleFetchRetrogradeTransits } from '../Utilities/generateUserTranstiDescriptions';
import { addAspectDescriptionComputed, describePlanets, getSynastryAspectDescription, findHouseSynastry } from '../Utilities/generateBirthDataDescriptions'

function CompositeDashboard_v4({}) {
  
    const [relationshipScores, setRelationshipScores] = useState(null);
    const [synastryAspects, setSynastryAspects] = useState([]);
    const compositeChart = useStore(state => state.compositeChart)
    const [userA, setUserA] = useState(null);
    const [userB, setUserB] = useState(null);
    const [scoreDebugInfo, setScoreDebugInfo] = useState(null);
    const [detailedRelationshipAnalysis, setDetailedRelationshipAnalysis] = useState(null);
    const [relationshipAnalysisProcessingStatus, setRelationshipAnalysisProcessingStatus] = useState({
        isProcessing: false,
        error: null
    });
    
    useEffect(() => {
        const initializeCompositeChartData = async () => {
            try {
                if (!compositeChart || !compositeChart._id) {
                    console.log("No composite chart available yet");
                    return;
                }

                if (compositeChart.userA_id && compositeChart.userB_id) {
                    // Fetch users and generate chart descriptions
                    const [userA, userB] = await Promise.all([
                        fetchUser(compositeChart.userA_id),
                        fetchUser(compositeChart.userB_id)
                    ]);
                    console.log("Users fetched:", { userA, userB });

                    // Fetch relationship scores
                    const relationshipScores = await fetchRelationshipScores(compositeChart._id);
                    
                    // Update all state values
                    setUserA(userA);
                    setUserB(userB);
                   setSynastryAspects(compositeChart.synastryAspects);
                    
                    if (relationshipScores?.scores) {
                        setRelationshipScores(relationshipScores.scores);
                    }
                    if (relationshipScores?.debug) {
                        setScoreDebugInfo(relationshipScores.debug);
                    }

                    if (relationshipScores?.analysis) {
                        console.log("relationshipScores.analysis available ", relationshipScores.analysis);
                        setDetailedRelationshipAnalysis({
                            analysis: relationshipScores.analysis,
                            userAName: relationshipScores?.debug?.inputSummary?.userAName || userA?.firstName,
                            userBName: relationshipScores?.debug?.inputSummary?.userBName || userB?.firstName
                        });
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
      console.error("No composite chart ID available");
      return;
    }
    
    console.log("Starting relationship analysis processing for compositeChartId:", compositeChart._id);
    
    setRelationshipAnalysisProcessingStatus(prev => ({
      ...prev,
      isProcessing: true,
      error: null
    }));

    try {
      const response = await processAndVectorizeRelationshipAnalysis(compositeChart._id);
      console.log("Processing response:", response);
      
      if (response.success) {
        // Update vectorization status to reflect completion
        setRelationshipAnalysisProcessingStatus(prev => ({
          ...prev,
          relationshipAnalysis: {
            OVERALL_ATTRACTION_CHEMISTRY: true,
            EMOTIONAL_SECURITY_CONNECTION: true,
            SEX_AND_INTIMACY: true,
            COMMUNICATION_AND_MENTAL_CONNECTION: true,
            COMMITMENT_LONG_TERM_POTENTIAL: true,
            KARMIC_LESSONS_GROWTH: true,
            PRACTICAL_GROWTH_SHARED_GOALS: true,
            isComplete: true
          },
          lastUpdated: new Date().toISOString()
        }));
      } else {
        throw new Error(response.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Error processing relationship analysis:', error);
      setRelationshipAnalysisProcessingStatus(prev => ({
        ...prev,
        error: error.message
      }));
    } finally {
      setRelationshipAnalysisProcessingStatus(prev => ({
        ...prev,
        isProcessing: false,
        currentCategory: null
      }));
    }
  };
  

return (
    <div>
      <h1>Composite Dashboard</h1>
      <div className="composite-chart">
        {userA && userB && (
          <>
            <h2 className="logotxt">User A: {userA.firstName} {userA.lastName}</h2>
            <h2 className="logotxt">User B: {userB.firstName} {userB.lastName}</h2>
            
            {!relationshipScores && (
              <button onClick={() => generateCompatabilityScore()}>
                Generate Compatibility Score
              </button>
            )}
            {relationshipScores && (
              <>
                <button onClick={() => generateRelationshipAnalysisForCompositeChart()}>
                  Generate Relationship Analysis
                </button>
                
                {/* Add the new button for vectorization process */}
                {detailedRelationshipAnalysis && (
                  <button 
                    onClick={() => processRelationshipAnalysis()}
                    disabled={relationshipAnalysisProcessingStatus?.isProcessing}
                    style={{ marginLeft: '10px' }}
                  >
                    {relationshipAnalysisProcessingStatus?.isProcessing 
                      ? "Processing Analysis..." 
                      : "Vectorize Relationship Analysis"}
                  </button>
                )}
                
                {/* Optional: Add processing status indicator */}
                {relationshipAnalysisProcessingStatus?.isProcessing && (
                  <div style={{ marginTop: '10px', color: '#666' }}>
                    Processing category: {relationshipAnalysisProcessingStatus.currentCategory?.replace(/_/g, ' ').toLowerCase() || '...'}
                  </div>
                )}
                
                {/* Optional: Add error message display */}
                {relationshipAnalysisProcessingStatus?.error && (
                  <div style={{ marginTop: '10px', color: 'red' }}>
                    Error: {relationshipAnalysisProcessingStatus.error}
                  </div>
                )}
              </>
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

      </div>
    </div>
  )
}

export default CompositeDashboard_v4;