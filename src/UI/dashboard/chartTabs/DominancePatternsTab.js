import React, { useState } from 'react';
import SimplifiedPatternWheel from '../../astrology/SimplifiedPatternWheel';
import AnalysisPromptCard from '../../shared/AnalysisPromptCard';
import GravityChatPanel from '../../gravityChat/GravityChatPanel';
import GravityChatCta from './GravityChatCta';
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

const PLANET_GLYPHS = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640', Mars: '\u2642',
  Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645', Neptune: '\u2646', Pluto: '\u2647',
  Ascendant: '\u271B', Midheaven: 'Mc', Node: '\u260A', 'North Node': '\u260A', Chiron: '\u26B7',
};

const ELEMENT_NOTES = {
  Water: 'Feeling, memory, instinct \u2014 knowledge arriving before evidence.',
  Air: 'Language, pattern, perspective \u2014 the distance that makes sense of things.',
  Earth: 'Form, patience, the body \u2014 what can actually be built and kept.',
  Fire: 'Impulse, faith, momentum \u2014 the willingness to begin before it is safe.',
};

// Quadrant naming follows the backend house grouping (NorthEast = houses 1-3, etc.)
const QUADRANT_META = {
  NorthEast: {
    title: 'First \u00B7 Self', houses: 'Houses 1\u20133', corner: 'll',
  },
  NorthWest: {
    title: 'Second \u00B7 Ground', houses: 'Houses 4\u20136', corner: 'lr',
  },
  SouthWest: {
    title: 'Third \u00B7 Others', houses: 'Houses 7\u20139', corner: 'ur',
  },
  SouthEast: {
    title: 'Fourth \u00B7 World', houses: 'Houses 10\u201312', corner: 'ul',
  },
};

// Quarter-circle wedge paths in a 340x340 viewBox (center 170, radius 135)
const QUADRANT_WEDGES = {
  ul: 'M170 170 L35 170 A135 135 0 0 1 170 35 Z',
  ur: 'M170 170 L170 35 A135 135 0 0 1 305 170 Z',
  lr: 'M170 170 L305 170 A135 135 0 0 1 170 305 Z',
  ll: 'M170 170 L170 305 A135 135 0 0 1 35 170 Z',
};

const QUADRANT_LABEL_POS = {
  ul: { x: 113, y: 120 }, ur: { x: 227, y: 120 }, lr: { x: 227, y: 228 }, ll: { x: 113, y: 228 },
};

function DominancePatternsTab({ birthChart, basicAnalysis, elements, modalities, quadrants, planetaryDominance, hasAnalysis, onNavigateToAnalysis, creditCost, creditsRemaining, chartId, isCelebrity, canUseGravityChat = false, onHoverBodies }) {
  const [activeTab, setActiveTab] = useState('elements');
  const [chatOpen, setChatOpen] = useState(false);

  // Reader-margin emphasis: hovering a planet group lights those bodies
  // in the 3D sky. No-op in the classic tabbed page (prop absent).
  const emphasize = (names) => onHoverBodies?.(names && names.length ? names : null);
  const clearEmphasis = () => onHoverBodies?.(null);

  const patterns = birthChart?.patterns?.patterns || birthChart?.patterns || [];
  const planets = birthChart?.planets || [];

  // Element glyphs, alchemical-style, tinted for the leading element
  const ElementGlyph = ({ element }) => {
    const color = '#3437a8';
    const icons = {
      Water: <path d="M14 3C9 10 6 14.5 6 18.5a8 8 0 0016 0C22 14.5 19 10 14 3z" fill={color} />,
      Fire: <path d="M14 3c-4 5.5-8 9.5-8 14a8 8 0 0016 0c0-4.5-4-8.5-8-14z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />,
      Air: (
        <g fill={color}>
          <path d="M14 5L23 19H5z" opacity=".45" />
          <path d="M14 5l6.4 10H7.6z" />
        </g>
      ),
      Earth: (
        <g fill={color}>
          <path d="M5 9h18l-9 14z" opacity=".45" />
          <path d="M7.6 13h12.8L14 23z" />
        </g>
      ),
    };
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        {icons[element] || null}
      </svg>
    );
  };

  // Elements: stacked ink rows — bar, planet chips, one-line note
  const ElementsBar = ({ data }) => {
    if (!data || data.length === 0) return null;
    const sorted = [...data]
      .map((item) => ({ ...item, percentage: Number(item.percentage) || 0 }))
      .sort((a, b) => b.percentage - a.percentage);

    return (
      <div className="elem-ink">
        {sorted.map((item) => {
          const count = item.planets?.length || 0;
          return (
            <div
              className="elem-ink__row"
              key={item.name}
              onMouseEnter={() => emphasize(item.planets)}
              onMouseLeave={clearEmphasis}
            >
              <div className="elem-ink__icon"><ElementGlyph element={item.name} /></div>
              <div className="elem-ink__body">
                <div className="elem-ink__head">
                  <h4>{item.name}</h4>
                  <span className="elem-ink__meta">
                    {Math.round(item.percentage)}% · {count} {count === 1 ? 'planet' : 'planets'}
                  </span>
                </div>
                <div className="elem-ink__track">
                  <span style={{ width: `${Math.min(100, item.percentage)}%` }} />
                </div>
                {count > 0 && (
                  <div className="elem-ink__chips">
                    {item.planets.map((planetName) => (
                      <span key={planetName} className="elem-ink__chip">
                        <span className="elem-ink__chip-glyph" aria-hidden="true">{PLANET_GLYPHS[planetName] || ''}</span>
                        {planetName}
                      </span>
                    ))}
                  </div>
                )}
                {ELEMENT_NOTES[item.name] && <p className="elem-ink__note">{ELEMENT_NOTES[item.name]}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Modalities: Three Semi-Circle Arc Gauges
  // Modality glyphs: Cardinal starts (arrow up), Fixed holds (square),
  // Mutable adapts (turning arrow)
  const ModalityGlyph = ({ modality }) => {
    const color = '#3437a8';
    const icons = {
      Cardinal: <path d="M14 4l7 8h-4v12h-6V12H7z" fill={color} />,
      Fixed: <rect x="7.5" y="8" width="13" height="13" fill={color} />,
      Mutable: (
        <g>
          <path d="M21 5v9H11" fill="none" stroke={color} strokeWidth="2.8" />
          <path d="M12 9.5L4 14l8 4.5z" fill={color} />
        </g>
      ),
    };
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        {icons[modality] || null}
      </svg>
    );
  };

  // Modalities: stacked ink rows — bar + planet chips, same system as Elements
  const ModalityGauges = ({ data }) => {
    if (!data || data.length === 0) return null;
    const sorted = [...data]
      .map((item) => ({ ...item, percentage: Number(item.percentage) || 0 }))
      .sort((a, b) => b.percentage - a.percentage);

    return (
      <div className="elem-ink">
        {sorted.map((item) => {
          const count = item.planets?.length || 0;
          return (
            <div
              className="elem-ink__row"
              key={item.name}
              onMouseEnter={() => emphasize(item.planets)}
              onMouseLeave={clearEmphasis}
            >
              <div className="elem-ink__icon"><ModalityGlyph modality={item.name} /></div>
              <div className="elem-ink__body">
                <div className="elem-ink__head">
                  <h4>{item.name}</h4>
                  <span className="elem-ink__meta">
                    {Math.round(item.percentage)}% · {count} {count === 1 ? 'planet' : 'planets'}
                  </span>
                </div>
                <div className="elem-ink__track">
                  <span style={{ width: `${Math.min(100, item.percentage)}%` }} />
                </div>
                {count > 0 && (
                  <div className="elem-ink__chips">
                    {item.planets.map((planetName) => (
                      <span key={planetName} className="elem-ink__chip">
                        <span className="elem-ink__chip-glyph" aria-hidden="true">{PLANET_GLYPHS[planetName] || ''}</span>
                        {planetName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Quadrants: circle diagram with AC/DC/MC/IC axes + house-group legend
  const QuadrantMini = ({ corner }) => (
    <svg width="26" height="26" viewBox="0 0 340 340" aria-hidden="true" className="quad-ink__mini">
      <circle cx="170" cy="170" r="135" fill="none" stroke="#8d8a80" strokeWidth="14" />
      <path d={QUADRANT_WEDGES[corner]} fill="#2c3260" />
    </svg>
  );

  const QuadrantGrid = ({ data }) => {
    if (!data || data.length === 0) return null;

    const byName = {};
    data.forEach((item) => { byName[item.name] = item; });
    const order = ['NorthEast', 'NorthWest', 'SouthWest', 'SouthEast'];
    const maxPct = Math.max(...data.map((item) => Number(item.percentage) || 0), 1);

    return (
      <div className="quad-ink">
        <svg className="quad-ink__chart" viewBox="0 0 340 340" role="img" aria-label="Planet distribution across the four chart quadrants">
          {order.map((key) => {
            const meta = QUADRANT_META[key];
            const pct = Number(byName[key]?.percentage) || 0;
            const alpha = 0.28 + 0.5 * (pct / maxPct);
            return (
              <path
                d={QUADRANT_WEDGES[meta.corner]}
                fill={`rgba(92, 92, 168, ${alpha.toFixed(2)})`}
                key={key}
                onMouseEnter={() => emphasize(byName[key]?.planets)}
                onMouseLeave={clearEmphasis}
              />
            );
          })}
          <line x1="26" y1="170" x2="314" y2="170" stroke="rgba(35, 40, 64, 0.45)" strokeWidth="1.4" />
          <line x1="170" y1="26" x2="170" y2="314" stroke="rgba(35, 40, 64, 0.45)" strokeWidth="1.4" />
          <text className="quad-ink__axis" x="170" y="14" textAnchor="middle">MC</text>
          <text className="quad-ink__axis" x="170" y="334" textAnchor="middle">IC</text>
          <text className="quad-ink__axis" x="14" y="175" textAnchor="middle">AC</text>
          <text className="quad-ink__axis" x="326" y="175" textAnchor="middle">DC</text>
          {order.map((key) => {
            const meta = QUADRANT_META[key];
            const pos = QUADRANT_LABEL_POS[meta.corner];
            const pct = Number(byName[key]?.percentage) || 0;
            return (
              <text className="quad-ink__pct" x={pos.x} y={pos.y} textAnchor="middle" key={key}>
                {Math.round(pct)}%
              </text>
            );
          })}
        </svg>

        <div className="quad-ink__legend">
          {order.map((key) => {
            const meta = QUADRANT_META[key];
            const item = byName[key] || {};
            const pct = Number(item.percentage) || 0;
            return (
              <div
                className="quad-ink__row"
                key={key}
                onMouseEnter={() => emphasize(item.planets)}
                onMouseLeave={clearEmphasis}
              >
                <QuadrantMini corner={meta.corner} />
                <div className="quad-ink__copy">
                  <p className="quad-ink__title">
                    <strong>{meta.title}</strong>
                    <em>{meta.houses} · {Math.round(pct)}%</em>
                  </p>
                  {item.planets?.length > 0 && (
                    <div className="elem-ink__chips quad-ink__chips">
                      {item.planets.map((planetName) => (
                        <span key={planetName} className="elem-ink__chip">
                          <span className="elem-ink__chip-glyph" aria-hidden="true">{PLANET_GLYPHS[planetName] || ''}</span>
                          {planetName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
            <div
              key={index}
              className="bar-chart-item"
              onMouseEnter={() => emphasize([item.name])}
              onMouseLeave={clearEmphasis}
            >
              <div className="bar-chart-label">{item.name}</div>
              <div className="bar-chart-bar-wrapper">
                <div
                  className="bar-chart-bar"
                  style={{
                    width: `${(item.percentage / maxPercentage) * 100}%`,
                    // deepest ink for the leading planet, fading proportionally
                    backgroundColor: `rgba(52, 55, 168, ${(0.35 + 0.65 * ((item.percentage || 0) / maxPercentage)).toFixed(2)})`
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
            bodies: stelliumPlanets.map(p => p.name),
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
            bodies: tSquarePlanets.map(p => p.name),
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
            bodies: yodPlanets.map(p => p.name),
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
            bodies: grandTrinePlanets.map(p => p.name),
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
            bodies: grandCrossPlanets.map(p => p.name),
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
              <div
                key={pattern.key}
                className="pattern-wheel-item"
                onMouseEnter={() => emphasize(pattern.bodies)}
                onMouseLeave={clearEmphasis}
              >
                <p className="pattern-wheel-note">
                  {(pattern.description || pattern.label).replace(/\.$/, '')} ↓
                </p>
                <div className="pattern-wheel-visual">
                  {pattern.component}
                </div>
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
        {!isCelebrity && (
          <GravityChatCta
            hasFullAccess={canUseGravityChat}
            onActivate={() => setChatOpen(prev => !prev)}
          />
        )}
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

      {!isCelebrity && canUseGravityChat && (
        <GravityChatPanel
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
      )}
    </div>
  );
}

export default DominancePatternsTab;
