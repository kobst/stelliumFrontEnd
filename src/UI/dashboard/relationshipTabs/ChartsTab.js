import React, { useState, useMemo } from 'react';
import Ephemeris from '../../shared/Ephemeris';
import BirthChartSummaryTable from '../../birthChart/tables/BirthChartSummaryTable';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './RelationshipTabs.css';

// Planet symbols for display
const planetSymbols = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'Ascendant': 'AC',
  'Midheaven': 'MC',
  'Chiron': '⚷',
  'Node': '☊',
  'North Node': '☊',
  'South Node': '☋'
};

// Format aspect name
const getAspectName = (aspectType) => {
  if (typeof aspectType !== 'string' || !aspectType) {
    return 'Unknown';
  }
  switch (aspectType.toLowerCase()) {
    case 'conjunction': return 'Conjunction';
    case 'opposition': return 'Opposition';
    case 'trine': return 'Trine';
    case 'square': return 'Square';
    case 'sextile': return 'Sextile';
    case 'quincunx': return 'Quincunx';
    default: return aspectType;
  }
};

// Get aspect color class
const getAspectColorClass = (aspectType) => {
  if (!aspectType) return '';
  switch (aspectType.toLowerCase()) {
    case 'conjunction': return 'aspect-conjunction';
    case 'trine':
    case 'sextile': return 'aspect-harmonious';
    case 'opposition':
    case 'square': return 'aspect-challenging';
    default: return '';
  }
};

// Synastry Aspects Table Component
function SynastryAspectsTable({ aspects, userAName, userBName }) {
  if (!aspects || aspects.length === 0) {
    return (
      <div className="synastry-empty">
        <p>No synastry aspects available.</p>
      </div>
    );
  }

  return (
    <div className="synastry-aspects-container">
      <div className="synastry-header">
        <span className="synastry-person-label">{userAName || 'Person A'}</span>
        <span className="synastry-aspect-label">Aspect</span>
        <span className="synastry-person-label">{userBName || 'Person B'}</span>
        <span className="synastry-orb-label">Orb</span>
      </div>
      <div className="synastry-aspects-list">
        {aspects.map((aspect, index) => {
          // Handle different property names for planets
          const planetA = aspect.transitingPlanet || aspect.aspectedPlanet || aspect.planet1;
          const planetB = aspect.aspectingPlanet || aspect.planet2;
          const orb = aspect.orb || 0;

          return (
            <div key={index} className={`synastry-aspect-row ${getAspectColorClass(aspect.aspectType)}`}>
              <div className="synastry-planet">
                <span className="planet-symbol">
                  {planetSymbols[planetA] || (planetA ? planetA.substring(0, 2) : '??')}
                </span>
                <span className="planet-name">{planetA}</span>
              </div>
              <div className="synastry-aspect-type">
                {getAspectName(aspect.aspectType)}
              </div>
              <div className="synastry-planet">
                <span className="planet-symbol">
                  {planetSymbols[planetB] || (planetB ? planetB.substring(0, 2) : '??')}
                </span>
                <span className="planet-name">{planetB}</span>
              </div>
              <div className="synastry-orb">
                {typeof orb === 'number' ? orb.toFixed(2) : orb} Deg
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartsTab({ relationship, compositeId }) {
  const [activeSubTab, setActiveSubTab] = useState('synastry');
  const [chatOpen, setChatOpen] = useState(false);

  const synastryAspects = relationship?.synastryAspects || [];
  const compositeChart = relationship?.compositeChart || {};
  const userAName = relationship?.userA_name || 'Person A';
  const userBName = relationship?.userB_name || 'Person B';
  const birthChartA = relationship?.userA_birthChart;
  const birthChartB = relationship?.userB_birthChart;

  const hasBothCharts = birthChartA?.planets?.length > 0 && birthChartB?.planets?.length > 0;

  // Stable keys for Ephemeris memoization
  const chartAKey = useMemo(() => {
    if (!birthChartA?.planets) return 'a';
    return JSON.stringify({
      p: birthChartA.planets.map(p => p.name + p.full_degree),
      h: birthChartA.houses?.map(h => h.house + h.degree)
    });
  }, [birthChartA]);

  const chartBKey = useMemo(() => {
    if (!birthChartB?.planets) return 'b';
    return JSON.stringify({
      p: birthChartB.planets.map(p => p.name + p.full_degree),
      h: birthChartB.houses?.map(h => h.house + h.degree)
    });
  }, [birthChartB]);

  // Build synastry aspects with degree data for Ephemeris rendering.
  // Person A's planet is "aspected" (inner ring), Person B's planet is "aspecting" (transit ring),
  // and vice versa for chart B.
  const synastryAspectsForChartA = useMemo(() => {
    if (!hasBothCharts || !synastryAspects.length) return [];
    const degreeMapA = {};
    birthChartA.planets.forEach(p => { degreeMapA[p.name] = p.full_degree; });
    const degreeMapB = {};
    birthChartB.planets.forEach(p => { degreeMapB[p.name] = p.full_degree; });

    return synastryAspects
      .map(a => {
        const planetA = a.transitingPlanet || a.aspectedPlanet || a.planet1;
        const planetB = a.aspectingPlanet || a.planet2;
        const degA = degreeMapA[planetA];
        const degB = degreeMapB[planetB];
        if (degA == null || degB == null) return null;
        return {
          aspectedPlanet: planetA,
          aspectingPlanet: planetB,
          aspectedPlanetDegree: degA,
          aspectingPlanetDegree: degB,
          aspectType: a.aspectType
        };
      })
      .filter(Boolean);
  }, [hasBothCharts, synastryAspects, birthChartA, birthChartB]);

  const synastryAspectsForChartB = useMemo(() => {
    if (!hasBothCharts || !synastryAspects.length) return [];
    const degreeMapA = {};
    birthChartA.planets.forEach(p => { degreeMapA[p.name] = p.full_degree; });
    const degreeMapB = {};
    birthChartB.planets.forEach(p => { degreeMapB[p.name] = p.full_degree; });

    return synastryAspects
      .map(a => {
        const planetA = a.transitingPlanet || a.aspectedPlanet || a.planet1;
        const planetB = a.aspectingPlanet || a.planet2;
        const degA = degreeMapA[planetA];
        const degB = degreeMapB[planetB];
        if (degA == null || degB == null) return null;
        return {
          aspectedPlanet: planetB,
          aspectingPlanet: planetA,
          aspectedPlanetDegree: degB,
          aspectingPlanetDegree: degA,
          aspectType: a.aspectType
        };
      })
      .filter(Boolean);
  }, [hasBothCharts, synastryAspects, birthChartA, birthChartB]);

  const hasCompositeData = compositeChart?.planets && compositeChart.planets.length > 0;

  return (
    <div className="charts-tab-redesign">
      {/* Header */}
      <div className="charts-header">
        <h2 className="charts-header__title">Charts</h2>
        <button className="ask-stellium-trigger" onClick={() => setChatOpen(true)}>
          <span className="ask-stellium-trigger__icon">&#10024;</span>
          Ask Stellium
        </button>
      </div>

      {/* Card containing tabs + content */}
      <div className="charts-card">
        {/* Sub-tabs */}
        <div className="charts-sub-tabs-redesign">
          <button
            className={`charts-sub-tab ${activeSubTab === 'synastry' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('synastry')}
          >
            Synastry - {synastryAspects.length}
          </button>
          <button
            className={`charts-sub-tab ${activeSubTab === 'composite' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('composite')}
          >
            Composite
          </button>
        </div>

        {/* Content */}
        <div className="charts-content-redesign">
        {activeSubTab === 'synastry' ? (
          <div className="synastry-tab-content">
            {hasBothCharts && (
              <>
                <div className="charts-section-header">
                  <h3>Synastry Charts</h3>
                  <p>Each wheel shows one person's birth chart with the other's planets overlaid on the outer ring.</p>
                </div>
                <div className="synastry-biwheels">
                  <div className="synastry-biwheel">
                    <h4 className="synastry-biwheel__label">{userAName}'s Chart</h4>
                    <div className="synastry-biwheel__canvas">
                      <Ephemeris
                        key={chartAKey}
                        planets={birthChartA.planets}
                        houses={birthChartA.houses || []}
                        aspects={synastryAspectsForChartA}
                        transits={birthChartB.planets}
                        instanceId="synastry-a"
                      />
                    </div>
                  </div>
                  <div className="synastry-biwheel">
                    <h4 className="synastry-biwheel__label">{userBName}'s Chart</h4>
                    <div className="synastry-biwheel__canvas">
                      <Ephemeris
                        key={chartBKey}
                        planets={birthChartB.planets}
                        houses={birthChartB.houses || []}
                        aspects={synastryAspectsForChartB}
                        transits={birthChartA.planets}
                        instanceId="synastry-b"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="charts-section-header">
              <h3>Synastry Aspects</h3>
              <p>The Synastry Chart Shows How {userAName}'s Planets Interact With {userBName}'s Planets Through Aspects.</p>
            </div>
            {synastryAspects.length > 0 ? (
              <SynastryAspectsTable
                aspects={synastryAspects}
                userAName={userAName}
                userBName={userBName}
              />
            ) : (
              <div className="chart-placeholder">
                <div className="placeholder-icon">◎</div>
                <h3>No Synastry Aspects</h3>
                <p>Synastry aspect data is not available for this relationship.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="composite-tab-content">
            <div className="charts-section-header">
              <h3>Composite Chart</h3>
              <p>The composite chart represents the relationship itself as a single entity, created from the midpoints of both charts.</p>
            </div>
            {hasCompositeData ? (
              <BirthChartSummaryTable
                planets={compositeChart.planets || []}
                houses={compositeChart.houses || []}
                aspects={compositeChart.aspects || []}
              />
            ) : (
              <div className="chart-placeholder">
                <div className="placeholder-icon">◎</div>
                <h3>No Composite Data</h3>
                <p>Composite chart data is not available for this relationship.</p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      <AskStelliumPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        contentType="relationship"
        contentId={compositeId}
        contextLabel="About your relationship"
        placeholderText="Ask about your relationship..."
        suggestedQuestions={[
          "What are our relationship strengths?",
          "How can we improve our communication?",
          "What challenges should we be aware of?"
        ]}
      />
    </div>
  );
}

export default ChartsTab;
