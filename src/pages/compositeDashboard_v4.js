import React, { useEffect, useState } from 'react';
import useStore from '../Utilities/store';
import SynastryBirthChartComparison_v2 from '../UI/birthChart/tables/SynastryBirthChartComparison_v2'
import RelationshipScores from '../UI/prototype/RelationshipScores';
import RelationshipAnalysis from '../UI/prototype/RelationshipAnalysis';
import {
  fetchUser,
  getRelationshipScore,
  fetchRelationshipAnalysis,
  fetchAnalysis,
  generateRelationshipAnalysis,
  processAndVectorizeRelationshipAnalysis
  } from '../Utilities/api';

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
    const [processingStatus, setProcessingStatus] = useState({
        isProcessing: false,
        error: null,
        currentCategory: null
    });
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
    
    useEffect(() => {
        const initializeCompositeChartData = async () => {
            try {
                if (!compositeChart || !compositeChart._id) {
                    console.log("No composite chart available yet for initialization");
                    return;
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
                    const userAVectorizationStatus = Boolean(userAResponse?.vectorizationStatus?.topicAnalysis?.isComplete);
                    const userBVectorizationStatus = Boolean(userBResponse?.vectorizationStatus?.topicAnalysis?.isComplete);

                    // Fetch relationship scores
                    const fetchedData = await fetchRelationshipAnalysis(compositeChart._id);
                    
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

                    // Handle vectorization status from the backend
                    if (fetchedData?.vectorizationStatus) {
                        console.log("Vectorization status received:", fetchedData.vectorizationStatus);
                        
                        // Update the vectorization status state with the structure from backend
                        setVectorizationStatus({
                            categories: fetchedData.vectorizationStatus.categories || {},
                            lastUpdated: fetchedData.vectorizationStatus.lastUpdated || null,
                            relationshipAnalysis: Boolean(fetchedData.vectorizationStatus.relationshipAnalysis)
                        });
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
      console.error("No composite chart ID available for vectorization.");
      setProcessingStatus({ isProcessing: false, error: "Composite chart ID is missing.", currentCategory: null });
      return;
    }
    
    console.log("Starting relationship analysis vectorization for compositeChartId:", compositeChart._id);
    
    setProcessingStatus({
      isProcessing: true,
      error: null,
      currentCategory: null
    });

    try {
      const response = await processAndVectorizeRelationshipAnalysis(compositeChart._id);
      console.log("Vectorization processing response:", response);
      
      if (response.success && response.isComplete) {
        // Update vectorization status to reflect completion
        setVectorizationStatus({
          categories: {
            OVERALL_ATTRACTION_CHEMISTRY: true,
            EMOTIONAL_SECURITY_CONNECTION: true,
            SEX_AND_INTIMACY: true,
            COMMUNICATION_AND_MENTAL_CONNECTION: true,
            COMMITMENT_LONG_TERM_POTENTIAL: true,
            KARMIC_LESSONS_GROWTH: true,
            PRACTICAL_GROWTH_SHARED_GOALS: true,
          },
          lastUpdated: new Date().toISOString(),
          relationshipAnalysis: true
        });
        console.log("Relationship analysis vectorization completed successfully.");
      } else {
        throw new Error(response.error || 'Vectorization processing failed or did not complete.');
      }
    } catch (error) {
      console.error('Error processing relationship analysis vectorization:', error);
      setProcessingStatus(prev => ({
        ...prev,
        error: error.message,
        isProcessing: false
      }));
    } finally {
      setProcessingStatus(prev => ({
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
            <h2 className="logotxt">Composite Chart: {compositeChart._id}</h2>
            {!relationshipScores && (
              <button onClick={() => generateCompatabilityScore()}>
                Generate Compatibility Score
              </button>
            )}
            {relationshipScores && (
              <>
                {userAVectorizationStatus && userBVectorizationStatus ? (
                  <>
                    <button onClick={() => generateRelationshipAnalysisForCompositeChart()}>
                      Generate Relationship Analysis
                    </button>
                    
                    {/* Vectorization button:
                        - Show if detailed analysis text exists
                        - AND if it has NOT been fully vectorized yet (relationshipAnalysis is false)
                    */}
                    {detailedRelationshipAnalysis && !vectorizationStatus.relationshipAnalysis && (
                      <button 
                        onClick={processRelationshipAnalysis}
                        disabled={processingStatus.isProcessing}
                        style={{ marginLeft: '10px' }}
                      >
                        {processingStatus.isProcessing 
                          ? "Vectorizing Analysis..." 
                          : "Vectorize Relationship Analysis"}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px', color: '#856404' }}>
                    <strong>Prerequisites Required:</strong> {
                      (() => {
                        const incompleteUsers = [];
                        if (!userAVectorizationStatus) incompleteUsers.push(userA?.firstName || 'User A');
                        if (!userBVectorizationStatus) incompleteUsers.push(userB?.firstName || 'User B');
                        
                        if (incompleteUsers.length === 1) {
                          return `${incompleteUsers[0]} requires their birth chart analysis to be processed before relationship analysis can be generated.`;
                        } else {
                          return `${incompleteUsers.join(' and ')} require their birth chart analysis to be processed before relationship analysis can be generated.`;
                        }
                      })()
                    }
                  </div>
                )}
                
                {/* Display if processing is ongoing */}
                {processingStatus.isProcessing && (
                  <div style={{ marginTop: '10px', color: '#666' }}>
                    Vectorizing analysis, please wait...
                  </div>
                )}
                
                {/* Display error if any during processing */}
                {processingStatus.error && (
                  <div style={{ marginTop: '10px', color: 'red' }}>
                    Vectorization Error: {processingStatus.error}
                  </div>
                )}
                
                {/* Display success message when vectorization is complete */}
                {vectorizationStatus.relationshipAnalysis && (
                  <div style={{ marginTop: '10px', color: 'red' }}>
                    Relationship analysis has been successfully vectorized. (Last updated: {vectorizationStatus.lastUpdated ? new Date(vectorizationStatus.lastUpdated).toLocaleString() : 'N/A'})
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