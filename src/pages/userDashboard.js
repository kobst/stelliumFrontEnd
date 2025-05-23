import React, { useEffect, useState } from 'react';
import UserHoroscopeContainer from '../UI/prototype/UserHoroscopeContainer';
import useStore from '../Utilities/store';
import { BroadTopicsEnum, ERROR_API_CALL } from '../Utilities/constants';
import {
  getFullBirthChartAnalysis,
  processAndVectorizeBasicAnalysis,
  processAndVectorizeTopicAnalysis,
  generateTopicAnalysis,
  fetchAnalysis } from '../Utilities/api';


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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState({
    isProcessing: false,
    currentTopic: null,
    currentSubtopic: null,
    error: null
  });
  
  const [vectorizationStatus, setVectorizationStatus] = useState({
    overview: false,
    planets: {
      Sun: false,
      Moon: false,
      Mercury: false,
      Venus: false,
      Mars: false,
      Jupiter: false,
      Saturn: false,
      Uranus: false,
      Neptune: false,
      Pluto: false,
      Ascendant: false
    },
    dominance: {
      elements: false,
      modalities: false,
      quadrants: false
    },
    basicAnalysis: false,
    topicAnalysis: {
      PERSONALITY_IDENTITY: {
        PERSONAL_IDENTITY: false,
        OUTWARD_EXPRESSION: false,
        INNER_EMOTIONAL_SELF: false,
        CHALLENGES_SELF_EXPRESSION: false
      },
      EMOTIONAL_FOUNDATIONS_HOME: {
        EMOTIONAL_FOUNDATIONS: false,
        FAMILY_DYNAMICS: false,
        HOME_ENVIRONMENT: false,
        FAMILY_CHALLENGES: false
      },
      RELATIONSHIPS_SOCIAL: {
        RELATIONSHIP_PATTERNS: false,
        SOCIAL_CONNECTIONS: false,
        RELATIONSHIP_CHALLENGES: false,
        PARTNERSHIP_NEEDS: false
      },
      CAREER_PURPOSE_PUBLIC_IMAGE: {
        CAREER_PATH: false,
        LIFE_PURPOSE: false,
        PUBLIC_IMAGE: false,
        SKILLS_TALENTS: false
      },
      UNCONSCIOUS_SPIRITUALITY: {
        SPIRITUAL_PATH: false,
        UNCONSCIOUS_PATTERNS: false,
        TRANSFORMATIVE_EVENTS: false,
        HEALING_GROWTH: false
      },
      COMMUNICATION_BELIEFS: {
        COMMUNICATION_STYLE: false,
        LEARNING_PATTERNS: false,
        BELIEF_SYSTEMS: false,
        MENTAL_GROWTH_CHALLENGES: false
      },
      isComplete: false
    },
    lastUpdated: null
  });

  useEffect(() => {
    if (userId) {
      console.log('userId')
      console.log(userId)
      if (userAspects.length !== 0 || userHouses.length !== 0 || userPlanets.length !== 0) {
      setIsDataPopulated(true);
      }
    }
  }, [userId]);



  // check if user has analysis already
  useEffect(() => {
    //
    if (userId) {
      fetchAnalysisForUser()
    }
  }, [])

  const fetchAnalysisForUser = async () => {
    try {
      const response = await fetchAnalysis(userId);
      console.log("response", response);
      
      const { interpretation, vectorizationStatus } = response;
      console.log("interpretation", interpretation);
      console.log("vectorizationStatus", vectorizationStatus);
      
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
      } else {
        setSubTopicAnalysis({});
      }

      // Set vectorization status
      setVectorizationStatus({
        overview: vectorizationStatus?.overview || false,
        planets: vectorizationStatus?.planets || {
          Sun: false,
          Moon: false,
          Mercury: false,
          Venus: false,
          Mars: false,
          Jupiter: false,
          Saturn: false,
          Uranus: false,
          Neptune: false,
          Pluto: false,
          Ascendant: false
        },
        dominance: vectorizationStatus?.dominance || {
          elements: false,
          modalities: false,
          quadrants: false
        },
        basicAnalysis: vectorizationStatus?.basicAnalysis || false,
        topicAnalysis: {
          PERSONALITY_IDENTITY: vectorizationStatus?.topicAnalysis?.PERSONALITY_IDENTITY || {
            PERSONAL_IDENTITY: false,
            OUTWARD_EXPRESSION: false,
            INNER_EMOTIONAL_SELF: false,
            CHALLENGES_SELF_EXPRESSION: false
          },
          EMOTIONAL_FOUNDATIONS_HOME: vectorizationStatus?.topicAnalysis?.EMOTIONAL_FOUNDATIONS_HOME || {
            EMOTIONAL_FOUNDATIONS: false,
            FAMILY_DYNAMICS: false,
            HOME_ENVIRONMENT: false,
            FAMILY_CHALLENGES: false
          },
          RELATIONSHIPS_SOCIAL: vectorizationStatus?.topicAnalysis?.RELATIONSHIPS_SOCIAL || {
            RELATIONSHIP_PATTERNS: false,
            SOCIAL_CONNECTIONS: false,
            RELATIONSHIP_CHALLENGES: false,
            PARTNERSHIP_NEEDS: false
          },
          CAREER_PURPOSE_PUBLIC_IMAGE: vectorizationStatus?.topicAnalysis?.CAREER_PURPOSE_PUBLIC_IMAGE || {
            CAREER_PATH: false,
            LIFE_PURPOSE: false,
            PUBLIC_IMAGE: false,
            SKILLS_TALENTS: false
          },
          UNCONSCIOUS_SPIRITUALITY: vectorizationStatus?.topicAnalysis?.UNCONSCIOUS_SPIRITUALITY || {
            SPIRITUAL_PATH: false,
            UNCONSCIOUS_PATTERNS: false,
            TRANSFORMATIVE_EVENTS: false,
            HEALING_GROWTH: false
          },
          COMMUNICATION_BELIEFS: vectorizationStatus?.topicAnalysis?.COMMUNICATION_BELIEFS || {
            COMMUNICATION_STYLE: false,
            LEARNING_PATTERNS: false,
            BELIEF_SYSTEMS: false,
            MENTAL_GROWTH_CHALLENGES: false
          },
          isComplete: vectorizationStatus?.topicAnalysis?.isComplete || false
        },
        lastUpdated: vectorizationStatus?.lastUpdated || null
      });

    } catch (error) {
      console.error(ERROR_API_CALL, error);
      setError(error.message);
      
      // Set default states on error
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
      setVectorizationStatus({
        overview: false,
        planets: {
          Sun: false,
          Moon: false,
          Mercury: false,
          Venus: false,
          Mars: false,
          Jupiter: false,
          Saturn: false,
          Uranus: false,
          Neptune: false,
          Pluto: false,
          Ascendant: false
        },
        dominance: {
          elements: false,
          modalities: false,
          quadrants: false
        },
        basicAnalysis: false,
        topicAnalysis: {
          PERSONALITY_IDENTITY: {
            PERSONAL_IDENTITY: false,
            OUTWARD_EXPRESSION: false,
            INNER_EMOTIONAL_SELF: false,
            CHALLENGES_SELF_EXPRESSION: false
          },
          EMOTIONAL_FOUNDATIONS_HOME: {
            EMOTIONAL_FOUNDATIONS: false,
            FAMILY_DYNAMICS: false,
            HOME_ENVIRONMENT: false,
            FAMILY_CHALLENGES: false
          },
          RELATIONSHIPS_SOCIAL: {
            RELATIONSHIP_PATTERNS: false,
            SOCIAL_CONNECTIONS: false,
            RELATIONSHIP_CHALLENGES: false,
            PARTNERSHIP_NEEDS: false
          },
          CAREER_PURPOSE_PUBLIC_IMAGE: {
            CAREER_PATH: false,
            LIFE_PURPOSE: false,
            PUBLIC_IMAGE: false,
            SKILLS_TALENTS: false
          },
          UNCONSCIOUS_SPIRITUALITY: {
            SPIRITUAL_PATH: false,
            UNCONSCIOUS_PATTERNS: false,
            TRANSFORMATIVE_EVENTS: false,
            HEALING_GROWTH: false
          },
          COMMUNICATION_BELIEFS: {
            COMMUNICATION_STYLE: false,
            LEARNING_PATTERNS: false,
            BELIEF_SYSTEMS: false,
            MENTAL_GROWTH_CHALLENGES: false
          },
          isComplete: false
        },
        lastUpdated: null
      });
    }
  };


  const generateShortOverview = async () => {
    try {
        const responseObject = await getFullBirthChartAnalysis(selectedUser);
        
        // Debug logs
        console.log("Full response object:", responseObject);
        
        // Parse response if needed
        let parsedResponse = typeof responseObject === 'string' 
            ? JSON.parse(responseObject) 
            : responseObject;

        if (parsedResponse && typeof parsedResponse === 'object') {
            const responseData = parsedResponse.data;
            
            // Update the basicAnalysis state with all data at once
            setBasicAnalysis({
                overview: responseData.overview || 'No overview available',
                dominance: {
                    elements: {
                        interpretation: responseData.dominance?.elements?.interpretation || ''
                    },
                    modalities: {
                        interpretation: responseData.dominance?.modalities?.interpretation || ''
                    },
                    quadrants: {
                        interpretation: responseData.dominance?.quadrants?.interpretation || ''
                    }
                },
                planets: {
                    Sun: { interpretation: responseData.planets?.Sun?.interpretation || '' },
                    Moon: { interpretation: responseData.planets?.Moon?.interpretation || '' },
                    Ascendant: { interpretation: responseData.planets?.Ascendant?.interpretation || '' },
                    Mercury: { interpretation: responseData.planets?.Mercury?.interpretation || '' },
                    Venus: { interpretation: responseData.planets?.Venus?.interpretation || '' },
                    Mars: { interpretation: responseData.planets?.Mars?.interpretation || '' },
                    Jupiter: { interpretation: responseData.planets?.Jupiter?.interpretation || '' },
                    Saturn: { interpretation: responseData.planets?.Saturn?.interpretation || '' },
                    Uranus: { interpretation: responseData.planets?.Uranus?.interpretation || '' },
                    Neptune: { interpretation: responseData.planets?.Neptune?.interpretation || '' },
                    Pluto: { interpretation: responseData.planets?.Pluto?.interpretation || '' }
                }
            });

        } else {
            console.warn("Invalid response object:", parsedResponse);
            setBasicAnalysis({
                overview: 'Unable to generate overview at this time',
                dominance: {
                    elements: { interpretation: '' },
                    modalities: { interpretation: '' },
                    quadrants: { interpretation: '' }
                },
                planets: {}
            });
        }
    } catch (error) {
        console.error('Error generating overview:', error);
        setBasicAnalysis({
            overview: 'Error generating overview. Please try again.',
            dominance: {
                elements: { interpretation: '' },
                modalities: { interpretation: '' },
                quadrants: { interpretation: '' }
            },
            planets: {}
        });
    }
};

const processBasicAnalysis = async () => {
  console.log("userId", userId)
  try {
    const response = await processAndVectorizeBasicAnalysis(userId)
    console.log("response", response)
    
    if (response.success) {
      // Update vectorization status to reflect that basic analysis is complete
      setVectorizationStatus(prevStatus => ({
        ...prevStatus,
        basicAnalysis: true,
        // Optionally update other basic analysis related statuses if needed
        overview: true,
        planets: {
          ...prevStatus.planets,
          Sun: true,
          Moon: true,
          Mercury: true,
          Venus: true,
          Mars: true,
          Jupiter: true,
          Saturn: true,
          Uranus: true,
          Neptune: true,
          Pluto: true,
          Ascendant: true
        },
        dominance: {
          elements: true,
          modalities: true,
          quadrants: true
        }
      }));
    } else {
      setError('Failed to process basic analysis');
    }
  } catch (error) {
    console.error('Error processing basic analysis:', error);
    setError(error.message);
  }
}

const processTopicAnalysis = async () => {
  console.log("Starting topic analysis processing for userId:", userId);
  
  setProcessingStatus(prev => ({
    ...prev,
    isProcessing: true,
    error: null
  }));

  try {
    const response = await processAndVectorizeTopicAnalysis(userId);
    console.log("Processing response:", response);
    
    if (response.success) {
      // Update vectorization status to reflect completion
      setVectorizationStatus(prevStatus => ({
        ...prevStatus,
        topicAnalysis: {
          ...prevStatus.topicAnalysis,
          PERSONALITY_IDENTITY: {
            PERSONAL_IDENTITY: true,
            OUTWARD_EXPRESSION: true,
            INNER_EMOTIONAL_SELF: true,
            CHALLENGES_SELF_EXPRESSION: true
          },
          EMOTIONAL_FOUNDATIONS_HOME: {
            EMOTIONAL_FOUNDATIONS: true,
            FAMILY_DYNAMICS: true,
            HOME_ENVIRONMENT: true,
            FAMILY_CHALLENGES: true
          },
          RELATIONSHIPS_SOCIAL: {
            RELATIONSHIP_PATTERNS: true,
            SOCIAL_CONNECTIONS: true,
            RELATIONSHIP_CHALLENGES: true,
            PARTNERSHIP_NEEDS: true
          },
          CAREER_PURPOSE_PUBLIC_IMAGE: {
            CAREER_PATH: true,
            LIFE_PURPOSE: true,
            PUBLIC_IMAGE: true,
            SKILLS_TALENTS: true
          },
          UNCONSCIOUS_SPIRITUALITY: {
            SPIRITUAL_PATH: true,
            UNCONSCIOUS_PATTERNS: true,
            TRANSFORMATIVE_EVENTS: true,
            HEALING_GROWTH: true
          },
          COMMUNICATION_BELIEFS: {
            COMMUNICATION_STYLE: true,
            LEARNING_PATTERNS: true,
            BELIEF_SYSTEMS: true,
            MENTAL_GROWTH_CHALLENGES: true
          },
          isComplete: true
        },
        lastUpdated: new Date().toISOString()
      }));
    } else {
      throw new Error(response.error || 'Processing failed');
    }
  } catch (error) {
    console.error('Error processing topic analysis:', error);
    setError(error.message);
    setProcessingStatus(prev => ({
      ...prev,
      error: error.message
    }));
  } finally {
    setProcessingStatus(prev => ({
      ...prev,
      isProcessing: false,
      currentTopic: null,
      currentSubtopic: null
    }));
  }
};

const generateAndReturnTopicAnalysis = async () => {
  console.log("userId", userId)
  try {
    setIsLoading(true);
    setError(null);
    const result = await generateTopicAnalysis(userId);
    if (result.success) {
      setSubTopicAnalysis(result.results);
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
  
}


  return (
    <div className="user-prototype-page">
   
        <UserHoroscopeContainer
          selectedUser={selectedUser}
          isDataPopulated={isDataPopulated}
          userPlanets={userPlanets}
          userHouses={userHouses}
          userAspects={userAspects}
          dailyTransits={dailyTransits}
        />

      <button 
        onClick={generateShortOverview}
        disabled={vectorizationStatus.basicAnalysis}
      >
        Generate Short Overview
      </button>
      <button 
        onClick={processBasicAnalysis}
        disabled={
          !basicAnalysis.overview ||
          vectorizationStatus.basicAnalysis
        }
      >
        Process Basic Analysis
      </button>
      <button 
        onClick={generateAndReturnTopicAnalysis}
        disabled={
          !vectorizationStatus.basicAnalysis ||
          vectorizationStatus.topicAnalysis.isComplete
        }
      >
        Generate Topic Analysis
      </button>
      <button 
        onClick={processTopicAnalysis}
        disabled={
          Object.keys(subTopicAnalysis).length === 0 ||
          vectorizationStatus.topicAnalysis.isComplete ||
          processingStatus.isProcessing
        }
        className={`
          ${vectorizationStatus.topicAnalysis.isComplete ? 'completed' : ''}
          ${processingStatus.isProcessing ? 'processing' : ''}
        `}
      >
        {vectorizationStatus.topicAnalysis.isComplete 
          ? 'Topic Analysis Processed'
          : processingStatus.isProcessing
            ? `Processing ${processingStatus.currentTopic} - ${processingStatus.currentSubtopic}...`
            : Object.keys(subTopicAnalysis).length === 0 
              ? 'Generate Topic Analysis First'
              : 'Process Topic Analysis'
        }
      </button>

      {processingStatus.error && (
        <div className="error-message">
          Error: {processingStatus.error}
        </div>
      )}

      <div className="basic-analysis">
      <h2>Birth Chart Analysis</h2>
      
      {/* Main Overview */}
      <section className="overview-section">
        <h3>Overview</h3>
        <p>{basicAnalysis.overview}</p>
      </section>

      {/* Dominance Section */}
      <section className="dominance-section">
        <h3>Chart Patterns</h3>
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

      {/* Planets Section */}
      <section className="planets-section">
        <h3>Planetary Influences</h3>
        <div className="planet-grid">
          {Object.entries(basicAnalysis.planets || {}).map(([planet, data]) => (
            <div key={planet} className="planet-card">
              <h4>{planet}</h4>
              <p>{data.interpretation}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    
      <div className="topic-analysis-section">
        <button 
          onClick={generateAndReturnTopicAnalysis}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Generate Topic Analysis'}
        </button>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {Object.entries(subTopicAnalysis).map(([topic, data]) => (
          <div key={topic} className="topic-section">
            <h3>{data.label}</h3>
            <div className="subtopics">
              {Object.entries(data.subtopics).map(([subtopicKey, content]) => (
                <div key={subtopicKey} className="subtopic">
                  <h4>{BroadTopicsEnum[topic].subtopics[subtopicKey].replace(/_/g, ' ')}</h4>
                  <p>{content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;