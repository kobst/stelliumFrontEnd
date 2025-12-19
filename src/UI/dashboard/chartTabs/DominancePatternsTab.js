import React from 'react';
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
import './ChartTabs.css';

const elementColors = {
  'Fire': '#ef4444',
  'Earth': '#84cc16',
  'Air': '#38bdf8',
  'Water': '#8b5cf6'
};

const modalityColors = {
  'Cardinal': '#f59e0b',
  'Fixed': '#22c55e',
  'Mutable': '#06b6d4'
};

function DominancePatternsTab({ birthChart, basicAnalysis, elements, modalities, quadrants, planetaryDominance }) {
  const patterns = birthChart?.patterns?.patterns || birthChart?.patterns || [];
  const planets = birthChart?.planets || [];

  // Render distribution section with interpretation below
  const renderDistributionSection = (title, data, colorMap, interpretation) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return (
      <div className="dominance-pattern-section">
        <h3 className="section-title">{title}</h3>
        <div className="distribution-bars">
          {data.map((item, index) => (
            <div key={index} className="distribution-item">
              <div className="distribution-label">
                <span className="distribution-name">{item.name}</span>
                <span className="distribution-percent">{item.percentage}%</span>
              </div>
              <div className="distribution-bar-container">
                <div
                  className="distribution-bar"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colorMap?.[item.name] || '#8b5cf6'
                  }}
                />
              </div>
              {item.planets && item.planets.length > 0 && (
                <div className="distribution-planets">
                  {item.planets.map((planet, pIndex) => (
                    <span key={pIndex} className="planet-tag">{planet}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {interpretation && (
          <div className="section-interpretation">
            <p>{interpretation}</p>
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

  // Check if we have any content to show
  const hasElements = elements?.elements && elements.elements.length > 0;
  const hasModalities = modalities?.modalities && modalities.modalities.length > 0;
  const hasQuadrants = quadrants?.quadrants && quadrants.quadrants.length > 0;
  const hasPatterns = patternVisuals.length > 0 || patternInterpretation;
  const hasPlanetaryDominance = planetaryDominance?.planets?.length > 0 || basicAnalysis?.dominance?.planetary?.interpretation;

  if (!hasElements && !hasModalities && !hasQuadrants && !hasPatterns && !hasPlanetaryDominance) {
    return (
      <div className="chart-tab-empty">
        <h3>Dominance and Patterns</h3>
        <p>No dominance or pattern data available yet.</p>
      </div>
    );
  }

  return (
    <div className="chart-tab-content dominance-patterns-tab">
      {/* Elements Section */}
      {renderDistributionSection(
        'Elements',
        elements?.elements,
        elementColors,
        basicAnalysis?.dominance?.elements?.interpretation
      )}

      {/* Modalities Section */}
      {renderDistributionSection(
        'Modalities',
        modalities?.modalities,
        modalityColors,
        basicAnalysis?.dominance?.modalities?.interpretation
      )}

      {/* Quadrants Section */}
      {renderDistributionSection(
        'Quadrants',
        quadrants?.quadrants,
        null,
        basicAnalysis?.dominance?.quadrants?.interpretation
      )}

      {/* Planetary Dominance Section */}
      {renderDistributionSection(
        'Planetary Influence',
        planetaryDominance?.planets?.map(p => ({
          name: p.name,
          percentage: p.percentage
        })),
        null,
        basicAnalysis?.dominance?.planetary?.interpretation
      )}

      {/* Patterns Section */}
      {hasPatterns && (
        <div className="dominance-pattern-section">
          <h3 className="section-title">Patterns</h3>
          {patternVisuals.length > 0 && (
            <div className="patterns-grid">
              {patternVisuals.map((pattern) => (
                <div key={pattern.key} className="pattern-item">
                  <h4 className="pattern-label">{pattern.label}</h4>
                  <div className="pattern-wheel">
                    {pattern.component}
                  </div>
                  {pattern.description && (
                    <p className="pattern-description">{pattern.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {patternInterpretation && (
            <div className="section-interpretation">
              <p>{patternInterpretation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DominancePatternsTab;
