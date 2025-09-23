import React, { useEffect, useState } from 'react';
import UserBirthChartContainer from './UserBirthChartContainer';
import useStore from '../../Utilities/store';
import { fetchAnalysis } from '../../Utilities/api';
import useAsync from '../../hooks/useAsync';
import PatternCard from './PatternCard';
import PlanetCard from './PlanetCard';
import TabMenu from '../shared/TabMenu';
// BroadTopicsEnum not needed for new category-based rendering
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
  const [broadCategoryAnalyses, setBroadCategoryAnalyses] = useState({});
  // Legacy workflow state removed

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

  // Legacy completion banner removed

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

      // Set broad category analyses (new structure)
      if (interpretation?.broadCategoryAnalyses) {
        setBroadCategoryAnalyses(interpretation.broadCategoryAnalyses);
      } else {
        setBroadCategoryAnalyses({});
      }

      // Legacy workflow status check removed

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
      setBroadCategoryAnalyses({});
      throw error;
    }
  }

  // Legacy workflow actions removed

  const handleReturnToDashboard = () => {
    returnToOwnerContext();
  };

  // Build 360 Analysis subtabs from broadCategoryAnalyses (new structure)
  const analysis360Tabs = [];
  const categoryEntries = Object.entries(broadCategoryAnalyses || {});
  if (categoryEntries.length > 0) {
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

      let subtopicEntries = [];
      if (cat?.editedSubtopics && typeof cat.editedSubtopics === 'object') {
        try {
          subtopicEntries = Object.entries(cat.editedSubtopics).map(([name, md]) => [name, md]);
        } catch (e) {
          subtopicEntries = [];
        }
      } else if (cat?.subtopics && typeof cat.subtopics === 'object') {
        try {
          subtopicEntries = Object.entries(cat.subtopics).map(([name, obj]) => [name, obj?.analysis || '']);
        } catch (e) {
          subtopicEntries = [];
        }
      }

      analysis360Tabs.push({
        id: catKey,
        label,
        content: (
          <div className="subtopics">
            {cat?.overview && (
              <div className="category-overview" style={{ marginBottom: '12px' }}>
                <p>{cat.overview}</p>
              </div>
            )}
            {/* tension flow */}
            {/* Reuse TopicTensionFlowAnalysis if needed in GuestDashboard later */}
            {subtopicEntries.map(([subtopicName, content]) => (
              <div key={subtopicName} className="subtopic">
                <h4>{subtopicName}</h4>
                <p>{content}</p>
              </div>
            ))}
            {cat?.synthesis && (
              <div className="category-synthesis" style={{ marginTop: '16px' }}>
                <h4>Synthesis</h4>
                <p>{cat.synthesis}</p>
              </div>
            )}
          </div>
        )
      });
    });
  }

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

      {/* Legacy workflow controls removed */}

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
