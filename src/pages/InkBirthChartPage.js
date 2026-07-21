import React, { useCallback, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useChartData from '../hooks/useChartData';
import InkNav from '../UI/ink/InkNav';
import { ChartScene } from '../UI/shared/chartScene';
import AskStelliumPanel from '../UI/askStellium/AskStelliumPanel';
import AnalysisTab, {
  decodeAstroCode,
  formatAspectDetail,
  renderAspectPhrase,
} from '../UI/dashboard/chartTabs/AnalysisTab';
import { flattenAnalysis } from '../UI/journey/AnalysisFlow';
import { extractShapeCards } from '../UI/journey/PatternLenses';
import {
  fromSceneBodyName,
  toChartSceneAspects,
  toChartScenePlacements,
  toSceneBodyNames,
} from '../Utilities/chartSceneAdapter';
import '../styles/ink.css';
import './InkBirthChartPage.css';

const CHAPTERS = [
  { id: 'overview', roman: 'i.', label: 'Overview' },
  { id: 'patterns', roman: 'ii.', label: 'Patterns' },
  { id: 'planets', roman: 'iii.', label: 'Chart & Planets' },
  { id: 'analysis', roman: 'iv.', label: '360 Analysis' },
  { id: 'ask', roman: 'v.', label: 'Ask Stellium' },
];

const PATTERN_LENSES = [
  {
    id: 'shapes',
    label: 'Shapes',
    tag: 'How several placements combine into larger geometric patterns.',
  },
  { id: 'elements', label: 'Elements', tag: "What you're made of." },
  { id: 'modalities', label: 'Modalities', tag: 'How you move.' },
  { id: 'quadrants', label: 'Quadrants', tag: 'Where your weight sits.' },
  {
    id: 'influence',
    label: 'Planetary Influence',
    tag: 'Who leads the orchestra.',
  },
];

const BODY_DEFINITIONS = [
  { name: 'Ascendant', aliases: ['Ascendant'], glyph: '✛' },
  { name: 'Sun', aliases: ['Sun'], glyph: '☉' },
  { name: 'Moon', aliases: ['Moon'], glyph: '☽' },
  { name: 'Mercury', aliases: ['Mercury'], glyph: '☿' },
  { name: 'Venus', aliases: ['Venus'], glyph: '♀' },
  { name: 'Mars', aliases: ['Mars'], glyph: '♂' },
  { name: 'Jupiter', aliases: ['Jupiter'], glyph: '♃' },
  { name: 'Saturn', aliases: ['Saturn'], glyph: '♄' },
  { name: 'Uranus', aliases: ['Uranus'], glyph: '♅' },
  { name: 'Neptune', aliases: ['Neptune'], glyph: '♆' },
  { name: 'Pluto', aliases: ['Pluto'], glyph: '♇' },
  { name: 'Midheaven', aliases: ['Midheaven', 'MC'], glyph: 'Mc' },
  { name: 'Node', aliases: ['Node', 'North Node', 'True Node'], glyph: '☊' },
];

const ASPECT_GLYPHS = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
};

const paragraphs = (text) =>
  String(text || '')
    .split(/\n\s*\n|\n/)
    .map((part) => part.trim())
    .filter(Boolean);

const titleCase = (value) => {
  const text = String(value || 'Aspect').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatChartDate = (value, long = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    month: long ? 'long' : 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const formatChartTime = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const hour = Number(match[1]);
  if (!Number.isFinite(hour)) return raw;
  const suppliedSuffix = raw.match(/\b(AM|PM)\b/i)?.[1]?.toUpperCase();
  const suffix = suppliedSuffix || (hour >= 12 ? 'PM' : 'AM');
  return `${hour % 12 || 12}:${match[2]} ${suffix}`;
};

const formatLocation = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return (
    value.formattedAddress ||
    value.placeName ||
    value.name ||
    [value.city, value.state, value.country].filter(Boolean).join(', ') ||
    null
  );
};

const degreeLabel = (planet) => {
  const degree = Number(planet?.norm_degree);
  return Number.isFinite(degree) ? `${degree.toFixed(1)}°` : null;
};

const getInterpretation = (value) => {
  if (typeof value === 'string') return value;
  return value?.interpretation || value?.analysis || value?.text || '';
};

const ordinal = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value || '');
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = number % 100;
  return `${number}${suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0]}`;
};

const aspectPhase = (aspect) => {
  const direct =
    aspect?.applyingSeparating ||
    aspect?.applyingOrSeparating ||
    aspect?.application ||
    aspect?.phase ||
    aspect?.movement ||
    aspect?.status;
  if (typeof direct === 'string') {
    if (/app/i.test(direct)) return 'Applying';
    if (/sep/i.test(direct)) return 'Separating';
  }
  if (typeof aspect?.isApplying === 'boolean') {
    return aspect.isApplying ? 'Applying' : 'Separating';
  }
  if (typeof aspect?.applying === 'boolean') {
    return aspect.applying ? 'Applying' : 'Separating';
  }
  if (typeof aspect?.is_applying === 'boolean') {
    return aspect.is_applying ? 'Applying' : 'Separating';
  }
  if (typeof aspect?.separating === 'boolean') {
    return aspect.separating ? 'Separating' : 'Applying';
  }
  return 'Phase unavailable';
};

function InkPageState({ message, error = false }) {
  return (
    <div className="ink-page ink-birth-chart">
      <InkNav variant="app" activeSegment="charts" />
      <main className={`ibc-state${error ? ' ibc-state--error' : ''}`} role={error ? 'alert' : 'status'}>
        <span aria-hidden="true">✳</span>
        <p>{message}</p>
      </main>
    </div>
  );
}

function Medallion({
  className = '',
  natal,
  natalAspects,
  paused,
  highlightBodies,
  relatedBodies,
  selectedBody,
  isolateSelection = false,
  onSelectBody,
  label,
}) {
  if (!natal.length) {
    return (
      <div className={`ibc-medallion ibc-medallion--empty ${className}`.trim()} role="status">
        Chart wheel data is unavailable.
      </div>
    );
  }

  return (
    <div className={`ibc-medallion ${className}`.trim()} aria-label={label}>
      <ChartScene
          background="#1b2140"
        natal={natal}
        natalAspects={natalAspects}
        topDown
        disableZoom
        paused={paused}
        highlightBodies={highlightBodies}
        relatedBodies={relatedBodies}
        selectedBody={selectedBody}
        isolateSelection={isolateSelection}
        onSelectBody={onSelectBody}
      />
    </div>
  );
}

function PatternBars({ items, influence = false }) {
  const safeItems = (items || [])
    .map((item) => ({ ...item, percentage: Number(item?.percentage) || 0 }))
    .sort((a, b) => b.percentage - a.percentage);
  const shownItems = influence ? safeItems.slice(0, 6) : safeItems;
  const max = Math.max(...shownItems.map((item) => item.percentage), 1);

  if (!shownItems.length) {
    return <p className="ibc-empty-copy">This pattern data is not available yet.</p>;
  }

  return (
    <div className={`ibc-pattern-bars${influence ? ' ibc-pattern-bars--influence' : ''}`}>
      {shownItems.map((item, index) => (
        <div className="ibc-pattern-bar-item" key={`${item.name}-${index}`}>
          <span className="ibc-pattern-bar-value">
            {influence && index === 0 ? '1st' : `${item.percentage.toFixed(0)}%`}
          </span>
          <span
            className={`ibc-pattern-bar${index === 0 ? ' is-leading' : ''}`}
            style={{ '--ibc-bar-height': `${Math.max(8, (item.percentage / max) * 100)}%` }}
          />
          <span className="ibc-pattern-bar-label">{item.name}</span>
        </div>
      ))}
    </div>
  );
}

function PatternVisual({
  lens,
  data,
  shapeCards,
  natal,
  natalAspects,
  paused,
}) {
  if (lens.id === 'shapes') {
    const leadShape = shapeCards[0];
    return (
      <div className="ibc-shape-visual">
        <p className="ibc-annotation">
          {leadShape
            ? `${leadShape.label.toLowerCase()} · ${leadShape.members.length} bodies connected ↓`
            : 'no major geometric pattern dominates ↓'}
        </p>
        <Medallion
          className="ibc-pattern-medallion"
          natal={natal}
          natalAspects={natalAspects}
          paused={paused}
          highlightBodies={toSceneBodyNames(leadShape?.members)}
          label="Natal chart highlighting the leading chart shape"
        />
        {shapeCards.length > 1 && (
          <div className="ibc-shape-list" aria-label="Detected chart shapes">
            {shapeCards.slice(0, 3).map((shape) => (
              <span key={shape.key}>{shape.label}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <PatternBars items={data} influence={lens.id === 'influence'} />;
}

function AnalysisReading({ group }) {
  if (!group) return null;
  const intro = group.steps.find((step) => step.kind === 'intro');
  const themes = group.steps.filter((step) => step.kind === 'theme');
  const synthesis = group.steps.find((step) => step.kind === 'synthesis');
  const keystoneAspects = intro?.data?.tensionFlow?.keystoneAspects || [];

  return (
    <article className="ibc-analysis-reading">
      <div className="ink-eyebrow">360 Analysis</div>
      <h2>{group.domain.label}</h2>
      {keystoneAspects.length > 0 && (
        <div className="ibc-chips" aria-label="Key aspects">
          {keystoneAspects.slice(0, 3).map((code, index) => {
            const decoded = decodeAstroCode(code);
            return (
              <span className="ink-chip" title={formatAspectDetail(decoded)} key={`${code}-${index}`}>
                {renderAspectPhrase(decoded)}
              </span>
            );
          })}
        </div>
      )}
      {paragraphs(intro?.data?.overview).map((text, index) => (
        <p className="ibc-analysis-overview" key={`overview-${index}`}>{text}</p>
      ))}
      {themes.map((step) => (
        <section className="ibc-analysis-section" key={step.id}>
          <h3>{step.title}</h3>
          {step.focus?.length > 0 && (
            <div className="ibc-chips ibc-chips--bodies">
              {step.focus.map((body) => (
                <span className="ink-chip" key={`${step.id}-${body}`}>{body}</span>
              ))}
            </div>
          )}
          {paragraphs(step.text).map((text, index) => (
            <p key={`${step.id}-${index}`}>{text}</p>
          ))}
        </section>
      ))}
      {synthesis && (
        <section className="ibc-analysis-section ibc-analysis-section--synthesis">
          <h3>Synthesis <span>✳</span></h3>
          {paragraphs(synthesis.text).map((text, index) => (
            <p key={`synthesis-${index}`}>{text}</p>
          ))}
        </section>
      )}
    </article>
  );
}

function InkBirthChartPage() {
  const { userId, chartId } = useParams();
  const { stelliumUser } = useAuth();
  const {
    chart,
    loading,
    error,
    birthChart,
    basicAnalysis,
    broadCategoryAnalyses,
    elements,
    modalities,
    quadrants,
    planetaryDominance,
    analysisStatus,
    hasAnalysis,
    isAnalysisComplete,
    handleStartAnalysis,
  } = useChartData(userId, chartId);

  const [activeChapter, setActiveChapter] = useState('overview');
  const [activePattern, setActivePattern] = useState('shapes');
  const [selectedPlanetName, setSelectedPlanetName] = useState(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);

  const planets = useMemo(() => birthChart?.planets || [], [birthChart?.planets]);
  const aspects = useMemo(() => birthChart?.aspects || [], [birthChart?.aspects]);
  const natal = useMemo(() => toChartScenePlacements(planets), [planets]);
  const natalAspects = useMemo(() => toChartSceneAspects(aspects), [aspects]);
  const shapeCards = useMemo(
    () => extractShapeCards(birthChart?.patterns?.patterns || birthChart?.patterns || [], planets),
    [birthChart?.patterns, planets]
  );

  const planetChoices = useMemo(
    () => BODY_DEFINITIONS.map((definition) => {
      const planet = planets.find((item) => definition.aliases.includes(item.name));
      return planet ? { ...definition, planet } : null;
    }).filter(Boolean),
    [planets]
  );

  const selectedChoice = useMemo(
    () =>
      planetChoices.find((choice) => choice.name === selectedPlanetName) ||
      planetChoices[0] ||
      null,
    [planetChoices, selectedPlanetName]
  );

  const selectedPlanet = selectedChoice?.planet || null;
  const selectedSceneName = toSceneBodyNames([selectedPlanet?.name])?.[0] || null;
  const selectedSceneBody = selectedSceneName && selectedPlanet
    ? {
        body: selectedSceneName,
        layer: 'natal',
        longitude: Number(selectedPlanet.full_degree) || 0,
      }
    : null;

  const selectedPlanetAspects = useMemo(() => {
    if (!selectedPlanet) return [];
    return aspects
      .filter(
        (aspect) =>
          aspect.aspectedPlanet === selectedPlanet.name ||
          aspect.aspectingPlanet === selectedPlanet.name
      )
      .map((aspect) => ({
        ...aspect,
        otherPlanet:
          aspect.aspectedPlanet === selectedPlanet.name
            ? aspect.aspectingPlanet
            : aspect.aspectedPlanet,
        orbValue: Number(aspect.orb),
      }))
      .sort((a, b) =>
        (Number.isFinite(a.orbValue) ? a.orbValue : 999) -
        (Number.isFinite(b.orbValue) ? b.orbValue : 999)
      );
  }, [aspects, selectedPlanet]);

  const relatedBodies = useMemo(
    () => toSceneBodyNames(selectedPlanetAspects.map((aspect) => aspect.otherPlanet)),
    [selectedPlanetAspects]
  );

  const knownNames = useMemo(() => planets.map((planet) => planet.name), [planets]);
  const analysisSteps = useMemo(
    () => flattenAnalysis(broadCategoryAnalyses, knownNames),
    [broadCategoryAnalyses, knownNames]
  );
  const analysisGroups = useMemo(() => {
    const groups = [];
    analysisSteps.forEach((step) => {
      let group = groups[groups.length - 1];
      if (!group || group.domain.id !== step.domain.id) {
        group = { domain: step.domain, steps: [] };
        groups.push(group);
      }
      group.steps.push(step);
    });
    return groups;
  }, [analysisSteps]);
  const selectedAnalysis =
    analysisGroups.find((group) => group.domain.id === selectedAnalysisId) ||
    analysisGroups[0] ||
    null;

  const activeLens = PATTERN_LENSES.find((lens) => lens.id === activePattern) || PATTERN_LENSES[0];
  const patternData = useMemo(() => ({
    elements: elements?.elements || [],
    modalities: modalities?.modalities || [],
    quadrants: quadrants?.quadrants || [],
    influence: planetaryDominance?.planets || [],
  }), [elements?.elements, modalities?.modalities, planetaryDominance?.planets, quadrants?.quadrants]);
  const patternInterpretations = useMemo(() => ({
    shapes:
      basicAnalysis?.dominance?.pattern?.interpretation ||
      basicAnalysis?.dominance?.patterns?.interpretation,
    elements: basicAnalysis?.dominance?.elements?.interpretation,
    modalities: basicAnalysis?.dominance?.modalities?.interpretation,
    quadrants: basicAnalysis?.dominance?.quadrants?.interpretation,
    influence: basicAnalysis?.dominance?.planetary?.interpretation,
  }), [basicAnalysis?.dominance]);

  const activePatternItems = patternData[activeLens.id] || [];
  const activePatternInterpretation = patternInterpretations[activeLens.id];
  const leadPatternItem = [...activePatternItems].sort(
    (a, b) => Number(b?.percentage || 0) - Number(a?.percentage || 0)
  )[0];

  const handleChapterChange = useCallback((chapterId) => {
    setActiveChapter(chapterId);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, []);

  const handleSceneBodySelect = useCallback((selection) => {
    const backendName = selection ? fromSceneBodyName(selection.body) : null;
    if (!backendName) return;
    const choice = planetChoices.find((item) => item.aliases.includes(backendName));
    if (choice) setSelectedPlanetName(choice.name);
  }, [planetChoices]);

  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading) return <InkPageState message="Drawing your birth chart…" />;
  if (error || !chart) {
    return <InkPageState message={error || 'This chart could not be found.'} error />;
  }

  const subjectName = chart?.firstName
    ? `${chart.firstName} ${chart.lastName || ''}`.trim()
    : chart?.name || 'Birth Chart';
  const dateValue = chart?.dateOfBirth || chart?.birthDate;
  const timeValue = chart?.timeOfBirth || chart?.birthTime;
  const locationValue = chart?.placeOfBirth || chart?.birthPlace;
  const locationText = formatLocation(locationValue);
  const formattedDate = formatChartDate(dateValue);
  const birthMeta = [formattedDate, formatChartTime(timeValue), locationText]
    .filter(Boolean)
    .join(' · ');
  const overviewParagraphs = paragraphs(basicAnalysis?.overview);
  const sun = planets.find((planet) => planet.name === 'Sun');
  const moon = planets.find((planet) => planet.name === 'Moon');
  const ascendant = planets.find((planet) => planet.name === 'Ascendant');
  const chartAnnotation = sun?.sign || moon?.sign
    ? `${sun ? `Sun in ${sun.sign}` : ''}${sun && moon ? ' · ' : ''}${moon ? `Moon in ${moon.sign}` : ''} ↓`
    : 'your chart, drawn from the real sky ↓';
  const selectedInterpretation = getInterpretation(
    basicAnalysis?.planets?.[selectedPlanet?.name] ||
    basicAnalysis?.planets?.[selectedChoice?.name]
  );
  const selectedHouseNumber =
    selectedPlanet?.house ||
    (selectedChoice?.name === 'Ascendant' ? 1 : null) ||
    (selectedChoice?.name === 'Midheaven' ? 10 : null);
  const selectedHouse = selectedHouseNumber
    ? `${ordinal(selectedHouseNumber)} House`
    : 'House placement unavailable';
  const isCelebrity =
    chart?.isCelebrity === true || chart?.kind === 'celebrity' || chart?.isReadOnly === true;
  const activePatternIndex = PATTERN_LENSES.findIndex((lens) => lens.id === activeLens.id);
  const activeAnalysisIndex = analysisGroups.findIndex(
    (group) => group.domain.id === selectedAnalysis?.domain.id
  );

  return (
    <div className="ink-page ink-birth-chart">
      <InkNav variant="app" activeSegment="charts" />

      <header className="ibc-chart-head">
        <h1><span aria-hidden="true">✳</span>{subjectName}</h1>
        {birthMeta && <p>{birthMeta}</p>}
      </header>

      <nav className="ink-tabs ibc-tabs" aria-label="Birth chart sections" role="tablist">
        {CHAPTERS.map((chapter) => (
          <button
            type="button"
            className={`ink-tab${activeChapter === chapter.id ? ' on' : ''}`}
            role="tab"
            aria-selected={activeChapter === chapter.id}
            aria-controls={`ibc-panel-${chapter.id}`}
            id={`ibc-tab-${chapter.id}`}
            onClick={() => handleChapterChange(chapter.id)}
            key={chapter.id}
          >
            <span className="ink-tab-roman">{chapter.roman}</span>
            <span className="ink-tab-label">{chapter.label}</span>
          </button>
        ))}
      </nav>

      <main>
        <section
          className="ibc-panel"
          id="ibc-panel-overview"
          role="tabpanel"
          aria-labelledby="ibc-tab-overview"
          hidden={activeChapter !== 'overview'}
        >
          <div className="ink-wrap ibc-overview-grid">
            <div className="ibc-overview-copy">
              <div className="ink-eyebrow">Overview</div>
              <h2>Your chart, brought <span className="ink-italic">into focus.</span></h2>
              {overviewParagraphs.length > 0 ? (
                overviewParagraphs.map((text, index) => <p key={index}>{text}</p>)
              ) : (
                <p className="ibc-empty-copy">
                  Your overview will appear here when the chart’s interpretation is ready.
                </p>
              )}
            </div>
            <div className="ibc-overview-visual">
              <div className="ibc-medallion-frame">
                <Medallion
                  className="ibc-medallion--overview"
                  natal={natal}
                  natalAspects={natalAspects}
                  paused={activeChapter !== 'overview'}
                  label={`${subjectName}'s natal chart`}
                />
                <span className="ibc-annotation">{chartAnnotation}</span>
              </div>
              <p className="ibc-chart-note">
                <span aria-hidden="true" /> Drawn from your chart{formattedDate ? ` · ${formattedDate}` : ''}
              </p>
            </div>
          </div>
        </section>

        <section
          className="ibc-panel"
          id="ibc-panel-patterns"
          role="tabpanel"
          aria-labelledby="ibc-tab-patterns"
          hidden={activeChapter !== 'patterns'}
        >
          <div className="ink-wrap">
            <nav className="ink-pmenu" aria-label="Chart pattern lenses">
              {PATTERN_LENSES.map((lens) => (
                <button
                  type="button"
                  className={`ink-pm-item${activeLens.id === lens.id ? ' on' : ''}`}
                  aria-pressed={activeLens.id === lens.id}
                  onClick={() => setActivePattern(lens.id)}
                  key={lens.id}
                >
                  <span className="ink-pm-label">{lens.label}</span>
                </button>
              ))}
            </nav>
            <p className="ibc-sub-count">{activePatternIndex + 1} of {PATTERN_LENSES.length}</p>
            <div className="ibc-pattern-grid">
              <div className="ink-card ibc-pattern-card">
                <PatternVisual
                  lens={activeLens}
                  data={activePatternItems}
                  shapeCards={shapeCards}
                  natal={natal}
                  natalAspects={natalAspects}
                  paused={activeChapter !== 'patterns' || activeLens.id !== 'shapes'}
                />
              </div>
              <article className="ibc-pattern-copy">
                <div className="ink-eyebrow">Patterns</div>
                <h2>{activeLens.label}</h2>
                <p className="ibc-pattern-tag">{activeLens.tag}</p>
                {activeLens.id === 'shapes' && shapeCards.length > 0 && (
                  <p>
                    <strong>{shapeCards[0].label}.</strong> {shapeCards[0].description}
                  </p>
                )}
                {activeLens.id !== 'shapes' && leadPatternItem && (
                  <p>
                    <strong>{leadPatternItem.name}</strong> leads this lens at{' '}
                    {Number(leadPatternItem.percentage || 0).toFixed(0)}%.
                  </p>
                )}
                {paragraphs(activePatternInterpretation).length > 0 ? (
                  paragraphs(activePatternInterpretation).map((text, index) => (
                    <p key={index}>{text}</p>
                  ))
                ) : activeLens.id === 'shapes' && !shapeCards.length ? (
                  <p className="ibc-empty-copy">
                    No major chart shapes were detected; this chart distributes its energy more evenly.
                  </p>
                ) : (
                  <p className="ibc-empty-copy">
                    A written interpretation for this pattern is not available yet.
                  </p>
                )}
              </article>
            </div>
          </div>
        </section>

        <section
          className="ibc-panel"
          id="ibc-panel-planets"
          role="tabpanel"
          aria-labelledby="ibc-tab-planets"
          hidden={activeChapter !== 'planets'}
        >
          <div className="ibc-planets-wrap">
            {planetChoices.length > 0 ? (
              <div className="ibc-planets-grid">
                <nav className="ibc-body-menu" aria-label="Chart bodies">
                  {planetChoices.map((choice) => (
                    <button
                      type="button"
                      className={selectedChoice?.name === choice.name ? 'on' : ''}
                      aria-pressed={selectedChoice?.name === choice.name}
                      onClick={() => setSelectedPlanetName(choice.name)}
                      key={choice.name}
                    >
                      <span className="ibc-body-glyph" aria-hidden="true">{choice.glyph}</span>
                      <span>{choice.name}</span>
                    </button>
                  ))}
                </nav>

                <article className="ibc-planet-copy">
                  <div className="ink-eyebrow">{selectedChoice?.name}</div>
                  <h2>
                    {selectedChoice?.name}{' '}
                    <span className="ink-italic">
                      in {selectedPlanet?.sign || 'an unknown sign'}{' '}
                      {degreeLabel(selectedPlanet)}
                    </span>
                  </h2>
                  <p className="ibc-house">{selectedHouse}</p>
                  <div className="ibc-planet-interpretation">
                    {paragraphs(selectedInterpretation).length > 0 ? (
                      paragraphs(selectedInterpretation).map((text, index) => (
                        <p key={index}>{text}</p>
                      ))
                    ) : (
                      <>
                        <p className="ibc-empty-copy">
                          {hasAnalysis
                            ? 'A detailed interpretation for this body is not available yet.'
                            : 'Unlock the 360 Analysis to add a detailed interpretation for this body.'}
                        </p>
                        {!hasAnalysis && (
                          <button
                            type="button"
                            className="ink-btn ink-btn--ghost"
                            onClick={() => handleChapterChange('analysis')}
                          >
                            Explore 360 Analysis
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div className="ibc-aspects" aria-label={`${selectedChoice?.name} aspects`}>
                    {selectedPlanetAspects.length > 0 ? (
                      selectedPlanetAspects.map((aspect, index) => {
                        const aspectType = String(aspect.aspectType || '').toLowerCase();
                        const otherBody = BODY_DEFINITIONS.find((definition) =>
                          definition.aliases.includes(aspect.otherPlanet)
                        );
                        return (
                          <div className="ink-asp-row" key={`${aspectType}-${aspect.otherPlanet}-${index}`}>
                            <span className="ink-asp-glyph" aria-hidden="true">
                              {otherBody?.glyph || ASPECT_GLYPHS[aspectType] || '·'}
                            </span>
                            <span className="ink-asp-label">
                              {titleCase(aspectType)} {aspect.otherPlanet}
                            </span>
                            <span className="ink-asp-orb">
                              {Number.isFinite(aspect.orbValue) ? `${aspect.orbValue.toFixed(1)}°` : '—'}
                            </span>
                            <span className="ink-asp-phase">{aspectPhase(aspect)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="ibc-empty-copy ibc-aspects-empty">No major aspects found.</p>
                    )}
                  </div>
                </article>

                <div className="ibc-planet-visual">
                  <Medallion
                    className="ibc-medallion--planet"
                    natal={natal}
                    natalAspects={natalAspects}
                    paused={activeChapter !== 'planets'}
                    selectedBody={selectedSceneBody}
                    highlightBodies={selectedSceneName ? [selectedSceneName] : undefined}
                    relatedBodies={relatedBodies}
                    isolateSelection
                    onSelectBody={handleSceneBodySelect}
                    label={`Natal chart isolating ${selectedChoice?.name}`}
                  />
                  <p className="ibc-annotation">select a body to isolate its aspects ↑</p>
                </div>
              </div>
            ) : (
              <div className="ibc-empty-panel" role="status">
                <span aria-hidden="true">☉</span>
                <h2>Chart & Planets</h2>
                <p>Planetary placements are not available for this chart yet.</p>
              </div>
            )}
          </div>
        </section>

        <section
          className="ibc-panel"
          id="ibc-panel-analysis"
          role="tabpanel"
          aria-labelledby="ibc-tab-analysis"
          hidden={activeChapter !== 'analysis'}
        >
          <div className="ink-wrap">
            {isAnalysisComplete && analysisGroups.length > 0 ? (
              <>
                <nav className="ink-pmenu" aria-label="360 Analysis life areas">
                  {analysisGroups.map((group) => (
                    <button
                      type="button"
                      className={`ink-pm-item${selectedAnalysis?.domain.id === group.domain.id ? ' on' : ''}`}
                      aria-pressed={selectedAnalysis?.domain.id === group.domain.id}
                      onClick={() => setSelectedAnalysisId(group.domain.id)}
                      key={group.domain.id}
                    >
                      <span className="ink-pm-label">{group.domain.label}</span>
                    </button>
                  ))}
                </nav>
                <p className="ibc-sub-count">
                  {activeAnalysisIndex + 1} of {analysisGroups.length}
                </p>
                <AnalysisReading group={selectedAnalysis} />
              </>
            ) : isAnalysisComplete ? (
              <div className="ibc-empty-panel" role="status">
                <span aria-hidden="true">◎</span>
                <h2>360 Analysis</h2>
                <p>The analysis is complete, but its life-area chapters are not available yet.</p>
              </div>
            ) : (
              <div className="ibc-analysis-gate">
                <AnalysisTab
                  broadCategoryAnalyses={broadCategoryAnalyses}
                  analysisStatus={analysisStatus}
                  onStartAnalysis={handleStartAnalysis}
                  chartId={chartId}
                  birthChart={birthChart}
                  userId={userId}
                  isCelebrity={isCelebrity}
                />
              </div>
            )}
          </div>
        </section>

        <section
          className="ibc-panel"
          id="ibc-panel-ask"
          role="tabpanel"
          aria-labelledby="ibc-tab-ask"
          hidden={activeChapter !== 'ask'}
        >
          <div className="ink-wrap ibc-ask-grid">
            <aside className="ibc-ask-side">
              <Medallion
                className="ibc-medallion--ask"
                natal={natal}
                natalAspects={natalAspects}
                paused={activeChapter !== 'ask'}
                label={`${subjectName}'s active chart context`}
              />
              <div className="ink-card ibc-context-card">
                <div className="ink-eyebrow">Active context</div>
                <p>{subjectName}{ascendant?.sign ? ` (${ascendant.sign} Rising)` : ''}</p>
                {formattedDate && <p>{formattedDate}{timeValue ? ` · ${formatChartTime(timeValue)}` : ''}</p>}
                {locationText && <p>{locationText}</p>}
              </div>
            </aside>

            <div className="ibc-ask-main">
              <h2>Ask Stellium <span className="ink-italic">✳</span></h2>
              <p className="ibc-ask-sub">Stellium has read your chart. Ask about it.</p>
              {isAnalysisComplete ? (
                <div className="ibc-ask-panel-host">
                  <AskStelliumPanel
                    variant="dock"
                    isOpen={activeChapter === 'ask'}
                    onClose={() => handleChapterChange('analysis')}
                    contentType="birthchart"
                    contentId={chartId}
                    birthChart={birthChart}
                    contextLabel="About your birth chart"
                    placeholderText="Ask about your chart..."
                    suggestedQuestions={[
                      'What is the strongest theme in my chart?',
                      'How do my Sun and Moon work together?',
                      'What should I understand about my relationships?',
                    ]}
                  />
                </div>
              ) : (
                <div className="ink-card ibc-ask-locked">
                  <span aria-hidden="true">◎</span>
                  <h3>Complete your 360 Analysis first.</h3>
                  <p>Ask Stellium opens once the full chart reading is ready.</p>
                  <button
                    type="button"
                    className="ink-btn ink-btn--navy"
                    onClick={() => handleChapterChange('analysis')}
                  >
                    Go to 360 Analysis
                  </button>
                </div>
              )}
              <p className="ibc-ask-foot">Powered by real astrology + AI · 1 credit per question</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default InkBirthChartPage;
