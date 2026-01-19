import React, { useState } from 'react';
import BirthChartSummaryTable from '../../birthChart/tables/BirthChartSummaryTable';
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

function ChartsTab({ relationship }) {
  const [activeSubTab, setActiveSubTab] = useState('synastry');

  const synastryAspects = relationship?.synastryAspects || [];
  const compositeChart = relationship?.compositeChart || {};
  const userAName = relationship?.userA_name || 'Person A';
  const userBName = relationship?.userB_name || 'Person B';

  const hasCompositeData = compositeChart?.planets && compositeChart.planets.length > 0;

  return (
    <div className="charts-tab-redesign">
      {/* Header */}
      <div className="charts-header">
        <h2 className="charts-header__title">Charts</h2>
        <div className="charts-header__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="url(#chartGradient)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="24" cy="24" r="12" stroke="url(#chartGradient)" strokeWidth="1.5" opacity="0.6" />
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="48" y2="48">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>
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
    </div>
  );
}

export default ChartsTab;
