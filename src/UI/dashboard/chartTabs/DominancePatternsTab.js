import React, { useState } from 'react';
import SimplifiedPatternWheel from '../../astrology/SimplifiedPatternWheel';
import {
  calculateStelliumSpanFromPlanets,
  generateTSquareLinesFromStructured,
  generateYodLinesFromStructured,
  generateGrandTrineLinesFromStructured,
  generateGrandCrossLinesFromStructured,
  generateKiteLinesFromStructured,
  generateMysticRectangleLinesFromStructured
} from '../../../utils/patternHelpers';
import './DominancePatternsTab.css';

const TABS = [
  { id: 'elements', label: 'Elements' },
  { id: 'modalities', label: 'Modalities' },
  { id: 'quadrants', label: 'Quadrants' },
  { id: 'planetary', label: 'Planetary Influence' },
  { id: 'patterns', label: 'Patterns' }
];

const elementColors = {
  'Fire': '#ef4444',
  'Earth': '#a3a042',
  'Air': '#38bdf8',
  'Water': '#8b5cf6'
};

const modalityColors = {
  'Cardinal': '#f59e0b',
  'Fixed': '#22c55e',
  'Mutable': '#06b6d4'
};

const quadrantColors = {
  'SouthEast': '#f472b6',
  'SouthWest': '#a78bfa',
  'NorthWest': '#60a5fa',
  'NorthEast': '#34d399'
};

function DominancePatternsTab({ birthChart, basicAnalysis, elements, modalities, quadrants, planetaryDominance }) {
  const [activeTab, setActiveTab] = useState('elements');

  const patterns = birthChart?.patterns?.patterns || birthChart?.patterns || [];
  const planets = birthChart?.planets || [];

  // Donut Chart Component
  const DonutChart = ({ data, colorMap, title }) => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + (item.percentage || 0), 0);
    let currentAngle = -90; // Start from top

    const radius = 80;
    const strokeWidth = 35;
    const center = 100;

    return (
      <div className="donut-chart-container">
        <svg viewBox="0 0 200 200" className="donut-chart">
          {data.map((item, index) => {
            const percentage = item.percentage || 0;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            // Calculate arc path
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            const pathData = `
              M ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
            `;

            return (
              <path
                key={index}
                d={pathData}
                fill="none"
                stroke={colorMap?.[item.name] || '#8b5cf6'}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
              />
            );
          })}
          <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" className="donut-chart-label">
            {title}
          </text>
        </svg>
        <div className="donut-legend">
          {data.map((item, index) => (
            <div key={index} className="donut-legend-item">
              <div className="donut-legend-row">
                <span
                  className="donut-legend-color"
                  style={{ backgroundColor: colorMap?.[item.name] || '#8b5cf6' }}
                />
                <span className="donut-legend-name">{item.name}</span>
                <span className="donut-legend-percent">{item.percentage?.toFixed(1)}%</span>
              </div>
              {item.planets && item.planets.length > 0 && (
                <div className="donut-legend-planets">
                  {item.planets.map((planet, pIndex) => (
                    <span key={pIndex} className="donut-planet-tag">{planet}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Horizontal Bar Chart Component for Planetary Influence
  const HorizontalBarChart = ({ data, title }) => {
    if (!data || data.length === 0) return null;

    // Sort by percentage descending
    const sortedData = [...data].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    const maxPercentage = Math.max(...sortedData.map(d => d.percentage || 0));

    return (
      <div className="bar-chart-container">
        <h3 className="bar-chart-title">{title}</h3>
        <div className="bar-chart-content">
          {sortedData.map((item, index) => (
            <div key={index} className="bar-chart-item">
              <div className="bar-chart-label">{item.name}</div>
              <div className="bar-chart-bar-wrapper">
                <div
                  className="bar-chart-bar"
                  style={{
                    width: `${(item.percentage / maxPercentage) * 100}%`,
                    backgroundColor: '#8b5cf6'
                  }}
                />
              </div>
              <span className="bar-chart-value">{item.percentage?.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render distribution section with donut chart
  const renderDistributionSection = (data, colorMap, interpretation, chartTitle) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="patterns-empty-section">
          <p>No data available for this section.</p>
        </div>
      );
    }

    return (
      <div className="patterns-section-content">
        <div className="patterns-section-left">
          {interpretation && (
            <div className="patterns-interpretation">
              {interpretation.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
        <div className="patterns-section-right">
          <DonutChart data={data} colorMap={colorMap} title={chartTitle} />
        </div>
      </div>
    );
  };

  // Render Planetary Influence section with full-width bar chart
  const renderPlanetaryInfluenceSection = (data, interpretation) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="patterns-empty-section">
          <p>No planetary influence data available.</p>
        </div>
      );
    }

    return (
      <div className="patterns-section-content patterns-section-content--planetary">
        <HorizontalBarChart data={data} title="PLANETARY INFLUENCE" />
        {interpretation && (
          <div className="patterns-interpretation patterns-interpretation--below">
            {interpretation.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Build pattern visuals
  const buildPatternVisuals = () => {
    const allPatterns = [];

    if (Array.isArray(patterns)) {
      patterns.forEach((pattern, index) => {
        const patternVisual = buildPatternFromStructured(pattern, index);
        if (patternVisual) {
          allPatterns.push(patternVisual);
        }
      });
    }

    return allPatterns;
  };

  const buildPatternFromStructured = (pattern, index) => {
    switch (pattern.type) {
      case 'chart_shape':
        if (planets.length > 0) {
          return {
            key: `chartShape-${pattern.id || index}`,
            type: 'chartShape',
            label: pattern.name || 'Chart Shape',
            description: pattern.description,
            component: (
              <SimplifiedPatternWheel
                planets={planets}
                pattern="chartShape"
                patternData={{
                  label: 'Chart Shape',
                  patternType: pattern.name?.toLowerCase(),
                  description: pattern.description
                }}
                size={140}
              />
            )
          };
        }
        return null;

      case 'stellium':
        const stelliumPlanets = (pattern.vertex?.planets || []).map(p => ({
          name: p.name,
          degree: p.degree,
          full_degree: p.degree
        }));
        if (stelliumPlanets.length > 0) {
          const stelliumSpan = calculateStelliumSpanFromPlanets(stelliumPlanets);
          return {
            key: `stellium-${pattern.id || index}`,
            type: 'stellium',
            label: 'Stellium',
            description: pattern.description,
            component: (
              <SimplifiedPatternWheel
                planets={stelliumPlanets}
                pattern="stellium"
                patternData={{
                  startDeg: stelliumSpan?.startDeg,
                  endDeg: stelliumSpan?.endDeg,
                  label: 'Stellium'
                }}
                size={140}
              />
            )
          };
        }
        return null;

      case 't_square':
        const tSquarePlanets = [
          ...(pattern.opposition?.vertex1?.planets || []),
          ...(pattern.opposition?.vertex2?.planets || []),
          ...(pattern.apex?.planets || [])
        ].map(p => ({ name: p.name, degree: p.degree, full_degree: p.degree }));

        if (tSquarePlanets.length >= 3) {
          const lines = generateTSquareLinesFromStructured(pattern);
          return {
            key: `tSquare-${pattern.id || index}`,
            type: 'tSquare',
            label: 'T-Square',
            description: pattern.description,
            component: (
              <SimplifiedPatternWheel
                planets={tSquarePlanets}
                pattern="tSquare"
                patternData={{ lines, label: 'T-Square' }}
                size={140}
              />
            )
          };
        }
        return null;

      case 'yod':
        const yodPlanets = [
          ...(pattern.base?.vertex1?.planets || []),
          ...(pattern.base?.vertex2?.planets || []),
          ...(pattern.apex?.planets || [])
        ].map(p => ({ name: p.name, degree: p.degree, full_degree: p.degree }));

        if (yodPlanets.length >= 3) {
          const lines = generateYodLinesFromStructured(pattern);
          return {
            key: `yod-${pattern.id || index}`,
            type: 'yod',
            label: 'Yod',
            description: pattern.description,
            component: (
              <SimplifiedPatternWheel
                planets={yodPlanets}
                pattern="yod"
                patternData={{ lines, label: 'Yod' }}
                size={140}
              />
            )
          };
        }
        return null;

      case 'grand_trine':
        const grandTrinePlanets = (pattern.vertices || []).flatMap(vertex =>
          vertex.planets || []
        ).map(p => ({ name: p.name, degree: p.degree, full_degree: p.degree }));

        if (grandTrinePlanets.length >= 3) {
          const lines = generateGrandTrineLinesFromStructured(pattern);
          return {
            key: `grandTrine-${pattern.id || index}`,
            type: 'grandTrine',
            label: 'Grand Trine',
            description: pattern.description,
            component: (
              <SimplifiedPatternWheel
                planets={grandTrinePlanets}
                pattern="grandTrine"
                patternData={{ lines, label: 'Grand Trine' }}
                size={140}
              />
            )
          };
        }
        return null;

      case 'grand_cross':
        const grandCrossPlanets = (pattern.vertices || []).flatMap(vertex =>
          vertex.planets || []
        ).map(p => ({ name: p.name, degree: p.degree, full_degree: p.degree }));

        if (grandCrossPlanets.length >= 4) {
          const lines = generateGrandCrossLinesFromStructured(pattern);
          return {
            key: `grandCross-${pattern.id || index}`,
            type: 'grandCross',
            label: 'Grand Cross',
            description: pattern.description,
            component: (
              <SimplifiedPatternWheel
                planets={grandCrossPlanets}
                pattern="grandCross"
                patternData={{ lines, label: 'Grand Cross' }}
                size={140}
              />
            )
          };
        }
        return null;

      case 'kite':
        const kitePlanets = [
          ...(pattern.grandTrine?.vertices || []).flatMap(vertex => vertex.planets || []),
          ...(pattern.apex?.planets || [])
        ].map(p => ({ name: p.name, degree: p.degree, full_degree: p.degree }));

        if (kitePlanets.length >= 4) {
          const lines = generateKiteLinesFromStructured(pattern);
          return {
            key: `kite-${pattern.id || index}`,
            type: 'kite',
            label: 'Kite',
            description: pattern.description,
            component: (
              <SimplifiedPatternWheel
                planets={kitePlanets}
                pattern="kite"
                patternData={{ lines, label: 'Kite' }}
                size={140}
              />
            )
          };
        }
        return null;

      case 'mystic_rectangle':
        const mysticRectanglePlanets = (pattern.vertices || []).flatMap(vertex =>
          vertex.planets || []
        ).map(p => ({ name: p.name, degree: p.degree, full_degree: p.degree }));

        if (mysticRectanglePlanets.length >= 4) {
          const lines = generateMysticRectangleLinesFromStructured(pattern);
          return {
            key: `mysticRectangle-${pattern.id || index}`,
            type: 'mysticRectangle',
            label: 'Mystic Rectangle',
            description: pattern.description,
            component: (
              <SimplifiedPatternWheel
                planets={mysticRectanglePlanets}
                pattern="mysticRectangle"
                patternData={{ lines, label: 'Mystic Rectangle' }}
                size={140}
              />
            )
          };
        }
        return null;

      default:
        return null;
    }
  };

  const patternVisuals = buildPatternVisuals();
  const patternInterpretation = basicAnalysis?.dominance?.pattern?.interpretation;

  // Render patterns section
  const renderPatternsSection = () => {
    const hasPatterns = patternVisuals.length > 0 || patternInterpretation;

    if (!hasPatterns) {
      return (
        <div className="patterns-empty-section">
          <p>No chart patterns detected.</p>
        </div>
      );
    }

    return (
      <div className="patterns-section-content patterns-section-content--patterns">
        {patternVisuals.length > 0 && (
          <div className="patterns-wheel-grid">
            {patternVisuals.map((pattern) => (
              <div key={pattern.key} className="pattern-wheel-item">
                <h4 className="pattern-wheel-label">{pattern.label}</h4>
                <div className="pattern-wheel-visual">
                  {pattern.component}
                </div>
                {pattern.description && (
                  <p className="pattern-wheel-description">{pattern.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
        {patternInterpretation && (
          <div className="patterns-interpretation patterns-interpretation--full">
            {patternInterpretation.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'elements':
        return renderDistributionSection(
          elements?.elements,
          elementColors,
          basicAnalysis?.dominance?.elements?.interpretation,
          'ELEMENTS'
        );
      case 'modalities':
        return renderDistributionSection(
          modalities?.modalities,
          modalityColors,
          basicAnalysis?.dominance?.modalities?.interpretation,
          'MODALITIES'
        );
      case 'quadrants':
        return renderDistributionSection(
          quadrants?.quadrants,
          quadrantColors,
          basicAnalysis?.dominance?.quadrants?.interpretation,
          'QUADRANTS'
        );
      case 'planetary':
        return renderPlanetaryInfluenceSection(
          planetaryDominance?.planets?.map(p => ({
            name: p.name,
            percentage: p.percentage
          })),
          basicAnalysis?.dominance?.planetary?.interpretation
        );
      case 'patterns':
        return renderPatternsSection();
      default:
        return null;
    }
  };

  return (
    <div className="patterns-tab">
      {/* Header */}
      <div className="patterns-header">
        <h2 className="patterns-header-title">Patterns</h2>
        <div className="patterns-gradient-icon"></div>
      </div>

      {/* Tab Navigation */}
      <div className="patterns-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`patterns-tab-btn ${activeTab === tab.id ? 'patterns-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="patterns-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default DominancePatternsTab;
