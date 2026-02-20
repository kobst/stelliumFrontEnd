import React, { useState } from 'react';
import SimplifiedPatternWheel from '../../astrology/SimplifiedPatternWheel';
import AnalysisPromptCard from '../../shared/AnalysisPromptCard';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
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

function DominancePatternsTab({ birthChart, basicAnalysis, elements, modalities, quadrants, planetaryDominance, hasAnalysis, onNavigateToAnalysis, creditCost, creditsRemaining, chartId }) {
  const [activeTab, setActiveTab] = useState('elements');
  const [chatOpen, setChatOpen] = useState(false);

  const patterns = birthChart?.patterns?.patterns || birthChart?.patterns || [];
  const planets = birthChart?.planets || [];

  // Element icon SVGs
  const ElementIcon = ({ element }) => {
    const icons = {
      Fire: (
        <svg width="14" height="14" viewBox="0 0 14 14" className="elements-bar__icon">
          <path d="M7 1C4.5 4.5 3 7 3 9a4 4 0 008 0c0-2-1.5-4.5-4-8z" fill={elementColors.Fire} />
        </svg>
      ),
      Earth: (
        <svg width="14" height="14" viewBox="0 0 14 14" className="elements-bar__icon">
          <path d="M7 2l5 10H2z" fill={elementColors.Earth} />
        </svg>
      ),
      Air: (
        <svg width="14" height="14" viewBox="0 0 14 14" className="elements-bar__icon">
          <path d="M1 4h9M1 7h6M1 10h11" stroke={elementColors.Air} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      Water: (
        <svg width="14" height="14" viewBox="0 0 14 14" className="elements-bar__icon">
          <path d="M7 1L3.5 7a4 4 0 007 0L7 1z" fill={elementColors.Water} />
        </svg>
      )
    };
    return icons[element] || null;
  };

  // Elements: Horizontal Stacked Bar
  const ElementsBar = ({ data }) => {
    if (!data || data.length === 0) return null;
    return (
      <div className="elements-bar">
        <div className="elements-bar__track">
          {data.map((item, i) => (
            <div
              key={i}
              className="elements-bar__segment"
              style={{
                flex: item.percentage || 0,
                backgroundColor: elementColors[item.name] || '#8b5cf6'
              }}
            />
          ))}
        </div>
        <div className="elements-bar__legend">
          {data.map((item, i) => (
            <div key={i} className="elements-bar__legend-item">
              <div className="elements-bar__legend-row">
                <ElementIcon element={item.name} />
                <span className="elements-bar__dot" style={{ backgroundColor: elementColors[item.name] }} />
                <span className="elements-bar__name">{item.name}</span>
                <span className="elements-bar__pct">{item.percentage?.toFixed(1)}%</span>
              </div>
              {item.planets && item.planets.length > 0 && (
                <div className="elements-bar__planets">
                  {item.planets.map((p, j) => (
                    <span key={j} className="elements-bar__planet-tag">{p}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Modalities: Three Semi-Circle Arc Gauges
  const ModalityGauges = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxPct = Math.max(...data.map(d => d.percentage || 0));

    return (
      <div className="modality-gauges">
        {data.map((item, i) => {
          const pct = item.percentage || 0;
          const isDominant = pct === maxPct && pct > 0;
          const sweepAngle = (pct / 100) * 180;
          const endAngleRad = ((180 + sweepAngle) * Math.PI) / 180;
          const r = 40;
          const cx = 60;
          const cy = 50;
          const x2 = cx + r * Math.cos(endAngleRad);
          const y2 = cy + r * Math.sin(endAngleRad);
          const color = modalityColors[item.name] || '#8b5cf6';

          return (
            <div key={i} className={`modality-gauge${isDominant ? ' modality-gauge--dominant' : ''}`}>
              <svg viewBox="0 0 120 65" className="modality-gauge__svg">
                <path
                  d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {pct > 0 && (
                  <path
                    d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    style={isDominant ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
                  />
                )}
                <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" className="modality-gauge__value">
                  {pct.toFixed(1)}%
                </text>
              </svg>
              <div className="modality-gauge__label">{item.name}</div>
              {item.planets && item.planets.length > 0 && (
                <div className="modality-gauge__planets">
                  {item.planets.map((p, j) => (
                    <span key={j} className="modality-gauge__planet-tag">{p}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Quadrants: 2x2 Spatial Grid
  const QuadrantGrid = ({ data }) => {
    if (!data || data.length === 0) return null;

    const byName = {};
    data.forEach(d => { byName[d.name] = d; });

    const cells = [
      { key: 'SouthEast', label: 'South East' },
      { key: 'SouthWest', label: 'South West' },
      { key: 'NorthEast', label: 'North East' },
      { key: 'NorthWest', label: 'North West' }
    ];

    const maxPct = Math.max(...data.map(d => d.percentage || 0));

    const hexToRgba = (hex, alpha) => {
      const rv = parseInt(hex.slice(1, 3), 16);
      const gv = parseInt(hex.slice(3, 5), 16);
      const bv = parseInt(hex.slice(5, 7), 16);
      return `rgba(${rv}, ${gv}, ${bv}, ${alpha})`;
    };

    return (
      <div className="quadrant-grid">
        <div className="quadrant-grid__axis quadrant-grid__axis--top">S</div>
        <div className="quadrant-grid__axis quadrant-grid__axis--bottom">N</div>
        <div className="quadrant-grid__axis quadrant-grid__axis--left">E</div>
        <div className="quadrant-grid__axis quadrant-grid__axis--right">W</div>
        <div className="quadrant-grid__wrapper">
          {cells.map(({ key, label }) => {
            const item = byName[key] || { percentage: 0, planets: [] };
            const pct = item.percentage || 0;
            const color = quadrantColors[key] || '#8b5cf6';
            const alpha = maxPct > 0 && pct > 0 ? 0.12 + (pct / maxPct) * 0.38 : 0.06;

            return (
              <div
                key={key}
                className="quadrant-grid__cell"
                style={{ backgroundColor: hexToRgba(color, alpha) }}
              >
                <span className="quadrant-grid__name">{label}</span>
                <span className="quadrant-grid__pct">{pct.toFixed(1)}%</span>
                {item.planets && item.planets.length > 0 && (
                  <div className="quadrant-grid__planets">
                    {item.planets.map((p, j) => (
                      <span key={j} className="quadrant-grid__planet-tag">{p}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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

  // Render Elements section
  const renderElementsSection = (data, interpretation) => {
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
          {interpretation ? (
            <div className="patterns-interpretation">
              {interpretation.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : !hasAnalysis ? (
            <AnalysisPromptCard
              message="Discover what your elemental balance means for your personality and how it shapes your strengths."
              onNavigate={onNavigateToAnalysis}
              creditCost={creditCost}
              creditsRemaining={creditsRemaining}
            />
          ) : null}
        </div>
        <div className="patterns-section-right">
          <ElementsBar data={data} />
        </div>
      </div>
    );
  };

  // Render Modalities section
  const renderModalitiesSection = (data, interpretation) => {
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
          {interpretation ? (
            <div className="patterns-interpretation">
              {interpretation.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : !hasAnalysis ? (
            <AnalysisPromptCard
              message="Learn how your Cardinal, Fixed, and Mutable energies influence your approach to life."
              onNavigate={onNavigateToAnalysis}
              creditCost={creditCost}
              creditsRemaining={creditsRemaining}
            />
          ) : null}
        </div>
        <div className="patterns-section-right">
          <ModalityGauges data={data} />
        </div>
      </div>
    );
  };

  // Render Quadrants section
  const renderQuadrantsSection = (data, interpretation) => {
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
          {interpretation ? (
            <div className="patterns-interpretation">
              {interpretation.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : !hasAnalysis ? (
            <AnalysisPromptCard
              message="Understand what your chart emphasis reveals about where you focus your energy."
              onNavigate={onNavigateToAnalysis}
              creditCost={creditCost}
              creditsRemaining={creditsRemaining}
            />
          ) : null}
        </div>
        <div className="patterns-section-right">
          <QuadrantGrid data={data} />
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
        {interpretation ? (
          <div className="patterns-interpretation patterns-interpretation--below">
            {interpretation.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : !hasAnalysis ? (
          <AnalysisPromptCard
            message="See what your planetary strengths and weaknesses reveal about your character."
            onNavigate={onNavigateToAnalysis}
            creditCost={creditCost}
            creditsRemaining={creditsRemaining}
          />
        ) : null}
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
        {patternInterpretation ? (
          <div className="patterns-interpretation patterns-interpretation--full">
            {patternInterpretation.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : !hasAnalysis && patternVisuals.length > 0 ? (
          <AnalysisPromptCard
            message="Uncover the deeper meaning behind your chart patterns and how they interact."
            onNavigate={onNavigateToAnalysis}
            creditCost={creditCost}
            creditsRemaining={creditsRemaining}
          />
        ) : null}
      </div>
    );
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'elements':
        return renderElementsSection(
          elements?.elements,
          basicAnalysis?.dominance?.elements?.interpretation
        );
      case 'modalities':
        return renderModalitiesSection(
          modalities?.modalities,
          basicAnalysis?.dominance?.modalities?.interpretation
        );
      case 'quadrants':
        return renderQuadrantsSection(
          quadrants?.quadrants,
          basicAnalysis?.dominance?.quadrants?.interpretation
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
        <button
          className="ask-stellium-trigger"
          onClick={() => setChatOpen(true)}
        >
          <span className="ask-stellium-trigger__icon">&#10024;</span>
          Ask Stellium
        </button>
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
        {!hasAnalysis && (
          <button className="patterns-tabs__pill" onClick={onNavigateToAnalysis}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L9.2 5.3L14.5 4L10.6 8L14.5 12L9.2 10.7L8 16L6.8 10.7L1.5 12L5.4 8L1.5 4L6.8 5.3L8 0Z" fill="#a78bfa" />
            </svg>
            Get Interpretations
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="patterns-content">
        {renderTabContent()}
      </div>

      <AskStelliumPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        contentType="birthchart"
        contentId={chartId}
        birthChart={birthChart}
        contextLabel="About your birth chart"
        placeholderText="Ask about your birth chart..."
        suggestedQuestions={[
          "What are my greatest strengths?",
          "How does my Moon sign affect my emotions?",
          "What should I focus on for personal growth?"
        ]}
      />
    </div>
  );
}

export default DominancePatternsTab;
