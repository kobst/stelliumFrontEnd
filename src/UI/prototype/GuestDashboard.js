import React, { useEffect, useState } from 'react';
import UserBirthChartContainer from './UserBirthChartContainer';
import useStore from '../../Utilities/store';
import { fetchAnalysis, startWorkflow, getWorkflowStatus } from '../../Utilities/api';
import useAsync from '../../hooks/useAsync';
import PatternCard from './PatternCard';
import PlanetCard from './PlanetCard';
import TabMenu from '../shared/TabMenu';
import { BroadTopicsEnum } from '../../Utilities/constants';
import '../../pages/userDashboard.css'; // Reuse existing dashboard styles

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

function GuestDashboard() {
  const activeUserContext = useStore(state => state.activeUserContext);
  const currentUserContext = useStore(state => state.currentUserContext);
  const returnToOwnerContext = useStore(state => state.returnToOwnerContext);
  const userPlanets = useStore(state => state.userPlanets);
  const userHouses = useStore(state => state.userHouses);
  const userAspects = useStore(state => state.userAspects);
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
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [previousWorkflowStatus, setPreviousWorkflowStatus] = useState(null);

  const {
    execute: fetchAnalysisForUserAsync,
    loading: fetchLoading,
    error: fetchError
  } = useAsync(fetchAnalysisForUser);

  const guestId = activeUserContext?._id;
  const guestName = activeUserContext ? `${activeUserContext.firstName} ${activeUserContext.lastName}` : 'Guest';

  useEffect(() => {
    if (guestId) {
      if (userAspects.length !== 0 || userHouses.length !== 0 || userPlanets.length !== 0) {
        setIsDataPopulated(true);
      }
    }
  }, [guestId, userAspects, userHouses, userPlanets]);

  // Check if guest has analysis already
  useEffect(() => {
    if (guestId) {
      fetchAnalysisForUserAsync();
    }
  }, [guestId]);

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

  async function fetchAnalysisForUser() {
    try {
      const response = await fetchAnalysis(guestId);
      
      const { interpretation } = response;
      
      // Set basicAnalysis state if it exists
      if (interpretation?.basicAnalysis) {
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

      // Check workflow status
      await checkWorkflowStatus();

    } catch (error) {
      console.error('Error fetching guest analysis:', error);
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

  const checkWorkflowStatus = async () => {
    if (!guestId) return;
    
    try {
      const response = await getWorkflowStatus(guestId);
      if (response.success) {
        setWorkflowStatus(response);
      }
    } catch (error) {
      console.error('Error checking workflow status:', error);
      setWorkflowStatus(null);
    }
  };

  const handleStartWorkflow = async () => {
    if (!guestId) {
      console.error('Cannot start workflow: guestId is missing');
      return;
    }
    
    try {
      const response = await startWorkflow(guestId);
      if (response.success) {
        setWorkflowStatus(response.status);
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
    }
  };

  const handleReturnToDashboard = () => {
    returnToOwnerContext();
  };

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

  if (basicAnalysis.overview) {
    analysisTabs.push({
      id: 'overview',
      label: 'Overview',
      content: (
        <section className="overview-section">
          <p>{basicAnalysis.overview}</p>
        </section>
      )
    });
  }

  if (userElements || userModalities || userQuadrants || userPatterns) {
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
  }

  if (basicAnalysis.planets && Object.keys(basicAnalysis.planets).length > 0) {
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
  }

  // Add 360 Analysis tab if there are any subtopic analyses
  if (analysis360Tabs.length > 0) {
    analysisTabs.push({
      id: '360analysis',
      label: '360 Analysis',
      content: <TabMenu tabs={analysis360Tabs} />
    });
  }

  return (
    <div className="user-prototype-page">
      {/* Breadcrumb Navigation */}
      <div style={{ 
        padding: '10px 0', 
        borderBottom: '1px solid #eee', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <button 
            onClick={handleReturnToDashboard}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            ← Back to Your Dashboard
          </button>
          <span style={{ margin: '0 10px', color: '#666' }}>|</span>
          <span style={{ fontWeight: 'bold', color: '#333' }}>
            Viewing: {guestName}
          </span>
        </div>
      </div>

      {fetchLoading && (
        <div className="status-banner">Loading guest analysis...</div>
      )}
      {fetchError && (
        <div className="status-banner error">Error: {fetchError}</div>
      )}

      <UserBirthChartContainer
        selectedUser={activeUserContext}
        isDataPopulated={isDataPopulated}
        userPlanets={userPlanets}
        userHouses={userHouses}
        userAspects={userAspects}
        dailyTransits={[]}
      />

      {/* Workflow Control Section */}
      <div className="workflow-section">
        {(!workflowStatus || workflowStatus?.workflowStatus?.status === 'not_started') && (
          <div>
            <h3>Birth Chart Analysis</h3>
            <p>Generate a comprehensive analysis for {guestName}</p>
            <button
              onClick={handleStartWorkflow}
              disabled={fetchLoading || !guestId}
              className="workflow-button primary"
            >
              Start Analysis
            </button>
          </div>
        )}

        {workflowStatus?.workflowStatus?.status === 'running' && (
          <div className="workflow-progress">
            <h3>Generating Analysis for {guestName}</h3>
            <p>Please wait while we process the birth chart...</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${workflowStatus?.workflowStatus?.progress?.percentage || 0}%` }}
              ></div>
            </div>
            <div className="progress-percentage">
              {workflowStatus?.workflowStatus?.progress?.percentage || 0}% Complete
            </div>
          </div>
        )}

        {/* Show temporary completion banner when analysis just finished */}
        {showCompletionBanner && (
          <div className="workflow-complete" style={{ 
            position: 'relative',
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <h3>✅ Analysis Complete!</h3>
            <p>{guestName}'s birth chart analysis is ready to explore.</p>
            <small style={{ color: '#666', fontStyle: 'italic' }}>This message will disappear in a few seconds...</small>
          </div>
        )}
      </div>

      {/* Analysis Content */}
      {analysisTabs.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Birth Chart Analysis for {guestName}</h3>
          <TabMenu tabs={analysisTabs} />
        </div>
      )}
    </div>
  );
}

export default GuestDashboard;