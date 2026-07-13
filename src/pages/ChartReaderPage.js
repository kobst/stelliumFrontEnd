import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import useChartData from '../hooks/useChartData';
import { ChartScene } from '../UI/shared/chartScene';
import {
  fromSceneBodyName,
  toChartSceneAspects,
  toChartScenePlacements,
  toSceneBodyNames,
} from '../Utilities/chartSceneAdapter';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import { PlanetIcon } from '../UI/shared/AstroIcon';
import {
  ElementsLens,
  extractShapeCards,
  InfluenceLens,
  ModalitiesLens,
  QuadrantsLens,
  ShapesLens,
} from '../UI/journey/PatternLenses';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import { AnalysisStepBody, flattenAnalysis } from '../UI/journey/AnalysisFlow';
import DetailNavigator from '../UI/journey/DetailNavigator';
import ChapterHeader from '../UI/journey/ChapterHeader';
import AskStelliumPanel, {
  formatAspectData,
  formatPositionData,
} from '../UI/askStellium/AskStelliumPanel';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import './ChartReaderPage.css';
import './BirthChartJourneyPage.css';

const CHAPTERS = [
  { id: 'overview', label: 'Overview' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'planets', label: 'Chart & Planets' },
  { id: 'analysis', label: '360 Analysis' },
  { id: 'ask', label: 'Ask Stellium' },
];

const PLANET_ORDER = [
  'Ascendant', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Midheaven', 'Node', 'North Node',
];

const paragraphs = (text) =>
  String(text || '')
    .split(/\n\s*\n|\n/)
    .map((part) => part.trim())
    .filter(Boolean);

const degreeLabel = (planet) => {
  const degree = Number(planet?.norm_degree);
  return Number.isFinite(degree) ? `${degree.toFixed(1)}°` : null;
};

const formatChartDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const formatChartTime = (value) => {
  if (!value) return null;
  const raw = String(value);
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${suffix}`;
};

function ChartStage({
  natal,
  natalAspects,
  fitNonce,
  highlightBodies,
  relatedBodies,
  isolateSelection,
  selectedBody,
  selectedPlanet,
  selectedAspects,
  activeAspectBody,
  onHoverAspect,
  onToggleAspect,
  onHoverBody,
  onSelectBody,
  onSelectAspect,
  onRecenter,
  compact = false,
  showRecenter = true,
}) {
  return (
    <div className={`birth-journey-chart${compact ? ' birth-journey-chart--compact' : ''}`}>
      {selectedPlanet && (
        <div
          className={`birth-journey-chart__selection${
            selectedAspects?.length ? ' birth-journey-chart__selection--expanded' : ''
          }`}
          aria-live="polite"
        >
          <div className="birth-journey-chart__selection-head">
            <span>{selectedPlanet.name}</span>
            <strong>
              {[degreeLabel(selectedPlanet), selectedPlanet.sign, selectedPlanet.house && `House ${selectedPlanet.house}`]
                .filter(Boolean)
                .join(' · ')}
            </strong>
          </div>
          {selectedAspects?.length > 0 && (
            <div className="birth-journey-chart__aspects">
              <div className="birth-journey-chart__aspects-label">Aspects</div>
              {selectedAspects.map((aspect, index) => (
                <button
                  type="button"
                  key={`${aspect.otherPlanet}-${aspect.aspectType}-${index}`}
                  className={activeAspectBody === aspect.otherPlanet ? 'on' : ''}
                  aria-pressed={activeAspectBody === aspect.otherPlanet}
                  onMouseEnter={() =>
                    onHoverAspect?.([selectedPlanet.name, aspect.otherPlanet])
                  }
                  onMouseLeave={() => onHoverAspect?.(null)}
                  onFocus={() =>
                    onHoverAspect?.([selectedPlanet.name, aspect.otherPlanet])
                  }
                  onBlur={() => onHoverAspect?.(null)}
                  onClick={() => onToggleAspect?.(aspect.otherPlanet)}
                >
                  <PlanetIcon name={aspect.otherPlanet} size={14} />
                  <span>
                    {String(aspect.aspectType || '').toLowerCase()}{' '}
                    {aspect.otherPlanet}
                  </span>
                  <small>
                    {Number.isFinite(Number(aspect.orb))
                      ? `${Number(aspect.orb).toFixed(1)}°`
                      : ''}
                  </small>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="birth-journey-chart__scene">
        <ChartScene
          natal={natal}
          natalAspects={natalAspects}
          fitRadius={5.9}
          fitNonce={fitNonce}
          disableZoom
          highlightBodies={highlightBodies}
          relatedBodies={relatedBodies}
          isolateSelection={isolateSelection}
          selectedBody={selectedBody}
          onHoverBody={onHoverBody}
          onSelectBody={onSelectBody}
          onSelectAspect={onSelectAspect}
        />
      </div>
      {showRecenter && (
        <button
          type="button"
          className="birth-journey-chart__recenter"
          title="Recenter the chart"
          onClick={onRecenter}
        >
          <span aria-hidden="true">⌖</span>
          <span>Recenter</span>
        </button>
      )}
    </div>
  );
}

function ChapterFooter({ activeChapter, onNavigate }) {
  const index = CHAPTERS.findIndex((chapter) => chapter.id === activeChapter);
  const previous = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];
  return (
    <div className="birth-journey-footer">
      {previous ? (
        <button type="button" className="birth-journey-footer__back" onClick={() => onNavigate(previous.id)}>
          <span aria-hidden="true">←</span> {previous.label}
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button type="button" className="birth-journey-footer__next" onClick={() => onNavigate(next.id)}>
          Continue to {next.label} <span aria-hidden="true">→</span>
        </button>
      )}
    </div>
  );
}

function ChartReaderPage() {
  const { userId, chartId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();
  const entitlements = useEntitlements(stelliumUser);
  const {
    chart,
    loading,
    error,
    birthChart,
    analysisStatus,
    basicAnalysis,
    broadCategoryAnalyses,
    elements,
    modalities,
    quadrants,
    planetaryDominance,
    hasAnalysis,
    isAnalysisComplete,
    handleStartAnalysis,
  } = useChartData(userId, chartId);

  const [activeChapter, setActiveChapter] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return CHAPTERS.some((chapter) => chapter.id === hash) ? hash : 'overview';
  });
  const [selectedPatternKey, setSelectedPatternKey] = useState(null);
  const [showCompositionChart, setShowCompositionChart] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [hoverNames, setHoverNames] = useState(null);
  const [pinnedNames, setPinnedNames] = useState(null);
  const [planetsSelectionNames, setPlanetsSelectionNames] = useState(null);
  const [externalPlanet, setExternalPlanet] = useState(null);
  const [skySelection, setSkySelection] = useState(null);
  const [askElements, setAskElements] = useState([]);
  const [askSelection, setAskSelection] = useState([]);
  const [askExternalToggle, setAskExternalToggle] = useState(null);
  const [fitNonce, setFitNonce] = useState(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = useState(null);

  const planets = useMemo(() => birthChart?.planets || [], [birthChart?.planets]);
  const aspects = useMemo(() => birthChart?.aspects || [], [birthChart?.aspects]);
  const natal = useMemo(() => toChartScenePlacements(planets), [planets]);
  const natalAspects = useMemo(() => toChartSceneAspects(aspects), [aspects]);
  const sceneBodyLookup = useMemo(() => {
    const map = {};
    planets.forEach((planet) => {
      const body = toSceneBodyNames([planet.name])?.[0];
      if (body) map[body] = planet;
    });
    return map;
  }, [planets]);
  const placementByName = useMemo(
    () => Object.fromEntries(planets.map((planet) => [planet.name, planet])),
    [planets]
  );
  const planetChoices = useMemo(
    () =>
      [...planets]
        .filter((planet) => toSceneBodyNames([planet.name])?.length)
        .sort((a, b) => {
          const aIndex = PLANET_ORDER.indexOf(a.name);
          const bIndex = PLANET_ORDER.indexOf(b.name);
          return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex);
        }),
    [planets]
  );

  const shapeCards = useMemo(
    () => extractShapeCards(birthChart?.patterns?.patterns || birthChart?.patterns || [], planets),
    [birthChart?.patterns, planets]
  );
  const compositionCards = useMemo(() => {
    const makeCard = (key, label, description, data) => {
      const items = [...(data || [])].sort(
        (a, b) => Number(b.percentage || 0) - Number(a.percentage || 0)
      );
      const leader = items[0];
      return {
        key,
        label,
        description,
        items,
        focus:
          key === 'composition-influence'
            ? items.slice(0, 3).map((item) => item.name).filter(Boolean)
            : leader?.planets || [],
        summary: leader
          ? `${leader.name} · ${Number(leader.percentage || 0).toFixed(0)}%`
          : 'Explore this chart lens',
      };
    };
    return [
      {
        key: 'composition-shapes',
        label: 'Shapes',
        description: 'How several placements combine into larger geometric patterns.',
        items: shapeCards,
        focus: shapeCards[0]?.members || [],
        summary: shapeCards.length
          ? `${shapeCards.length} detected pattern${shapeCards.length === 1 ? '' : 's'}`
          : 'No major shape detected',
      },
      makeCard(
        'composition-elements',
        'Elements',
        'How fire, earth, air, and water distribute the chart’s energy.',
        elements?.elements
      ),
      makeCard(
        'composition-modalities',
        'Modalities',
        'How the chart initiates, sustains, and adapts to change.',
        modalities?.modalities
      ),
      makeCard(
        'composition-quadrants',
        'Quadrants',
        'Where the chart concentrates attention between self, others, and the wider world.',
        quadrants?.quadrants
      ),
      makeCard(
        'composition-influence',
        'Planetary Influence',
        'Which planets carry the greatest weight across the chart.',
        planetaryDominance?.planets
      ),
    ];
  }, [elements?.elements, modalities?.modalities, planetaryDominance?.planets, quadrants?.quadrants, shapeCards]);
  const selectedComposition = useMemo(() => {
    if (activeChapter !== 'patterns') return null;
    return compositionCards.find((card) => card.key === selectedPatternKey) || compositionCards[0] || null;
  }, [activeChapter, compositionCards, selectedPatternKey]);

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
  const selectedAnalysis = useMemo(() => {
    if (activeChapter !== 'analysis') return null;
    return analysisGroups.find((group) => group.domain.id === selectedAnalysisId) || analysisGroups[0] || null;
  }, [activeChapter, analysisGroups, selectedAnalysisId]);
  const compositionPagerItems = useMemo(
    () => compositionCards.map((card) => ({ id: card.key, title: card.label, payload: card })),
    [compositionCards]
  );
  const analysisPagerItems = useMemo(
    () => analysisGroups.map((group) => ({
      id: group.domain.id,
      title: group.domain.label,
      payload: group,
    })),
    [analysisGroups]
  );
  const planetPagerItems = useMemo(
    () => planetChoices.map((planet) => ({ id: planet.name, title: planet.name, payload: planet })),
    [planetChoices]
  );

  const highlightBodies = useMemo(() => {
    if (hoverNames) return toSceneBodyNames(hoverNames);
    if (pinnedNames) return toSceneBodyNames(pinnedNames);
    if (activeChapter === 'patterns' && selectedComposition?.focus?.length) {
      return toSceneBodyNames(selectedComposition.focus);
    }
    if (activeChapter === 'analysis' && selectedAnalysis) {
      const focus = [...new Set(selectedAnalysis.steps.flatMap((step) => step.focus || []))];
      return focus.length ? toSceneBodyNames(focus) : undefined;
    }
    if (activeChapter === 'planets' && planetsSelectionNames) {
      return toSceneBodyNames(planetsSelectionNames);
    }
    return undefined;
  }, [
    activeChapter,
    hoverNames,
    pinnedNames,
    planetsSelectionNames,
    selectedAnalysis,
    selectedComposition,
  ]);

  const selectedPlanet = skySelection ? sceneBodyLookup[skySelection.body] : null;
  const focusedPlanetName =
    planetsSelectionNames?.[0] || selectedPlanet?.name || planetChoices[0]?.name || null;
  const relatedPlanetBodies = useMemo(() => {
    if (activeChapter !== 'planets' || !focusedPlanetName) return undefined;
    const names = new Set();
    aspects.forEach((aspect) => {
      if (aspect.aspectingPlanet === focusedPlanetName) names.add(aspect.aspectedPlanet);
      if (aspect.aspectedPlanet === focusedPlanetName) names.add(aspect.aspectingPlanet);
    });
    return toSceneBodyNames([...names]);
  }, [activeChapter, aspects, focusedPlanetName]);
  const focusedPlanetAspects = useMemo(() => {
    if (activeChapter !== 'planets' || !focusedPlanetName) return [];
    return aspects
      .filter(
        (aspect) =>
          aspect.aspectingPlanet === focusedPlanetName ||
          aspect.aspectedPlanet === focusedPlanetName
      )
      .map((aspect) => ({
        ...aspect,
        otherPlanet:
          aspect.aspectingPlanet === focusedPlanetName
            ? aspect.aspectedPlanet
            : aspect.aspectingPlanet,
      }))
      .sort((a, b) => Number(a.orb) - Number(b.orb));
  }, [activeChapter, aspects, focusedPlanetName]);
  const hoveredPlanet = hoverInfo ? sceneBodyLookup[hoverInfo.body] : null;
  const canUseAskStellium = isAnalysisComplete;
  const isCelebrity =
    chart?.isCelebrity === true || chart?.kind === 'celebrity' || chart?.isReadOnly === true;

  const applyChapterState = useCallback((chapterId) => {
    setActiveChapter(chapterId);
    setSelectedPatternKey(null);
    setShowCompositionChart(false);
    setSelectedAnalysisId(null);
    if (chapterId !== 'planets') setSkySelection(null);
    setPinnedNames(null);
  }, []);

  const goToChapter = useCallback((chapterId) => {
    applyChapterState(chapterId);
    if (window.location.hash !== `#${chapterId}`) {
      navigate(
        { pathname: location.pathname, search: location.search, hash: `#${chapterId}` },
        { state: location.state }
      );
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    window.requestAnimationFrame(() => {
      document
        .querySelector(`.birth-journey-nav [data-chapter="${chapterId}"]`)
        ?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'center',
        });
    });
  }, [applyChapterState, location.pathname, location.search, location.state, navigate]);

  const togglePinnedNames = useCallback((names) => {
    const next = (names || []).filter(Boolean);
    if (!next.length) {
      setPinnedNames(null);
      return;
    }
    setPinnedNames((current) =>
      current?.length === next.length && current.every((name, index) => name === next[index])
        ? null
        : next
    );
  }, []);

  const handleSkySelect = useCallback(
    (selection) => {
      setSkySelection(selection);
      if (!selection) return;
      const name = fromSceneBodyName(selection.body);
      const planet = name && planets.find((item) => item.name === name);
      if (!planet) return;
      setExternalPlanet({ name, nonce: Date.now() });
      if (activeChapter !== 'planets') goToChapter('planets');
      if (canUseAskStellium) {
        const data = formatPositionData(planet);
        setAskElements([{ ...data, key: data.code, payload: data }]);
      }
    },
    [activeChapter, canUseAskStellium, goToChapter, planets]
  );

  const askHighlightBodies = useMemo(() => {
    const names = askSelection.flatMap((element) => {
      const payload = element.payload || element;
      if (element.type === 'position' || payload.type === 'position') {
        return [payload.planet || element.planet].filter(Boolean);
      }
      if (element.type === 'aspect' || payload.type === 'aspect') {
        return [
          payload.planet1 || element.planet1,
          payload.planet2 || element.planet2,
        ].filter(Boolean);
      }
      return [];
    });
    return toSceneBodyNames([...new Set(names)]);
  }, [askSelection]);

  const toggleAskContext = useCallback((element) => {
    if (!element) return;
    setAskExternalToggle({ element, nonce: Date.now() });
  }, []);

  const handleAskSkySelect = useCallback((selection) => {
    if (!selection) return;
    const name = fromSceneBodyName(selection.body);
    const planet = name && planets.find((item) => item.name === name);
    if (!planet) return;
    const data = formatPositionData(planet);
    toggleAskContext({ ...data, key: data.code, payload: data });
  }, [planets, toggleAskContext]);

  const handleAskAspectSelect = useCallback((sceneAspect) => {
    const nameA = fromSceneBodyName(sceneAspect.bodyA);
    const nameB = fromSceneBodyName(sceneAspect.bodyB);
    if (!nameA || !nameB) return;
    const rawAspect = aspects.find((aspect) => {
      const samePair =
        (aspect.aspectedPlanet === nameA && aspect.aspectingPlanet === nameB) ||
        (aspect.aspectedPlanet === nameB && aspect.aspectingPlanet === nameA);
      return samePair && String(aspect.aspectType || '').toLowerCase() === sceneAspect.type;
    }) || {
      aspectedPlanet: nameA,
      aspectingPlanet: nameB,
      aspectType: sceneAspect.type,
      orb: sceneAspect.orb,
    };
    const planet1 = planets.find((planet) => planet.name === rawAspect.aspectedPlanet);
    const planet2 = planets.find((planet) => planet.name === rawAspect.aspectingPlanet);
    if (!planet1 || !planet2) return;
    const data = formatAspectData(rawAspect, planet1, planet2);
    toggleAskContext({ ...data, key: data.code, payload: data });
  }, [aspects, planets, toggleAskContext]);

  const handleSkyHover = useCallback((hover) => {
    setHoverInfo(
      hover
        ? { body: hover.body, x: mousePos.current.x, y: mousePos.current.y }
        : null
    );
  }, []);

  const selectPlanet = useCallback(
    (name) => {
      const body = toSceneBodyNames([name])?.[0];
      const planet = placementByName[name];
      if (!body || !planet) return;
      setPlanetsSelectionNames([name]);
      setExternalPlanet({ name, nonce: Date.now() });
      setSkySelection({
        body,
        layer: 'natal',
        longitude: Number(planet.full_degree) || 0,
      });
    },
    [placementByName]
  );

  const handlePlanetsEmphasis = useCallback(
    (names) => {
      setPlanetsSelectionNames(names);
      const primary = names?.[0];
      const body = primary ? toSceneBodyNames([primary])?.[0] : null;
      const planet = primary ? placementByName[primary] : null;
      if (body && planet) {
        setSkySelection({
          body,
          layer: 'natal',
          longitude: Number(planet.full_degree) || 0,
        });
      }
    },
    [placementByName]
  );

  const togglePlanetAspect = useCallback(
    (otherPlanet) => {
      if (!focusedPlanetName) return;
      handlePlanetsEmphasis(
        planetsSelectionNames?.[1] === otherPlanet
          ? [focusedPlanetName]
          : [focusedPlanetName, otherPlanet]
      );
    },
    [focusedPlanetName, handlePlanetsEmphasis, planetsSelectionNames]
  );

  useEffect(() => {
    if (activeChapter === 'planets' && focusedPlanetName && !skySelection) {
      selectPlanet(focusedPlanetName);
    }
  }, [activeChapter, focusedPlanetName, selectPlanet, skySelection]);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const chapterId = CHAPTERS.some((chapter) => chapter.id === hash) ? hash : 'overview';
    if (chapterId !== activeChapter) {
      applyChapterState(chapterId);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeChapter, applyChapterState, location.hash]);

  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading || error) {
    return (
      <div className="chart-reader-page">
        <div className="chart-reader-loading">{error || 'Loading chart…'}</div>
      </div>
    );
  }

  const subjectName = chart?.firstName
    ? `${chart.firstName} ${chart.lastName || ''}`.trim()
    : 'Birth Chart';
  const birthMeta = [
    formatChartDate(chart?.dateOfBirth || chart?.birthDate),
    formatChartTime(chart?.timeOfBirth || chart?.birthTime),
    chart?.placeOfBirth || chart?.birthPlace,
  ]
    .filter(Boolean)
    .join(' · ');
  const overviewParagraphs = paragraphs(basicAnalysis?.overview);
  const overviewPlacements = ['Sun', 'Moon', 'Ascendant']
    .map((name) => placementByName[name])
    .filter(Boolean);
  const chartStage = (
    <ChartStage
      natal={natal}
      natalAspects={natalAspects}
      fitNonce={fitNonce}
      highlightBodies={highlightBodies}
      relatedBodies={relatedPlanetBodies}
      isolateSelection={activeChapter === 'planets'}
      selectedBody={skySelection}
      selectedPlanet={selectedPlanet}
      selectedAspects={focusedPlanetAspects}
      activeAspectBody={planetsSelectionNames?.[1]}
      onHoverAspect={setHoverNames}
      onToggleAspect={togglePlanetAspect}
      onHoverBody={handleSkyHover}
      onSelectBody={handleSkySelect}
      onRecenter={() => setFitNonce((value) => value + 1)}
    />
  );
  const compactChartStage = (
    <ChartStage
      natal={natal}
      natalAspects={natalAspects}
      fitNonce={fitNonce}
      highlightBodies={highlightBodies}
      relatedBodies={relatedPlanetBodies}
      isolateSelection={false}
      selectedBody={null}
      selectedPlanet={null}
      selectedAspects={[]}
      onHoverBody={handleSkyHover}
      onSelectBody={handleSkySelect}
      onRecenter={() => setFitNonce((value) => value + 1)}
      compact
      showRecenter={false}
    />
  );
  const askChartStage = (
    <ChartStage
      natal={natal}
      natalAspects={natalAspects}
      fitNonce={fitNonce}
      highlightBodies={askHighlightBodies}
      isolateSelection={false}
      selectedBody={null}
      selectedPlanet={null}
      selectedAspects={[]}
      onHoverBody={handleSkyHover}
      onSelectBody={handleAskSkySelect}
      onSelectAspect={handleAskAspectSelect}
      onRecenter={() => setFitNonce((value) => value + 1)}
    />
  );

  return (
    <div
      className="birth-journey"
      style={{ '--birth-nebula': 'url(/NewNebulae.png)' }}
      onMouseMove={(event) => {
        mousePos.current = { x: event.clientX, y: event.clientY };
      }}
    >
      <header className="birth-journey-header">
        <div className="birth-journey-header__main">
          <button
            type="button"
            className="birth-journey-brand"
            onClick={() => navigate(`/dashboard/${userId}`, { state: { section: 'home' } })}
            title="Go to Horoscope"
          >
            <span aria-hidden="true">☼</span> Stellium
          </button>
          <div className="birth-journey-identity">
            <strong>{subjectName}</strong>
            {birthMeta && <span>{birthMeta}</span>}
          </div>
          <button
            type="button"
            className="birth-journey-ask"
            onClick={() => goToChapter('ask')}
            disabled={!canUseAskStellium}
          >
            <span aria-hidden="true">✦</span> Ask Stellium
          </button>
        </div>
        <nav className="birth-journey-nav" aria-label="Birth chart reading chapters">
          {CHAPTERS.map((chapter, index) => (
            <button
              type="button"
              key={chapter.id}
              className={activeChapter === chapter.id ? 'on' : ''}
              aria-current={activeChapter === chapter.id ? 'step' : undefined}
              data-chapter={chapter.id}
              onClick={() => goToChapter(chapter.id)}
            >
              <span>{index + 1}</span>
              <strong>{chapter.label}</strong>
            </button>
          ))}
        </nav>
      </header>

      {hoverInfo && (
        <div
          className="chart-reader-tooltip"
          style={{ left: hoverInfo.x + 14, top: hoverInfo.y - 10 }}
        >
          {hoveredPlanet ? (
            <>
              {hoveredPlanet.name}
              <span className="dim">
                {' '}· {hoveredPlanet.sign}
                {degreeLabel(hoveredPlanet) && ` ${degreeLabel(hoveredPlanet)}`}
              </span>
            </>
          ) : (
            hoverInfo.body
          )}
        </div>
      )}

      <main className="birth-journey-main">
        {activeChapter === 'overview' && (
          <article className="birth-journey-chapter">
            <ChapterHeader label="Overview" />
            <div className="birth-journey-split birth-journey-split--overview">
              <section className="birth-journey-copy">
                <h1>Your chart, brought into focus.</h1>
                {overviewParagraphs.slice(0, 3).map((text, index) => (
                  <p key={index}>{text}</p>
                ))}
                <button type="button" className="birth-journey-primary" onClick={() => goToChapter('patterns')}>
                  Explore your patterns <span aria-hidden="true">→</span>
                </button>
              </section>
              {compactChartStage}
            </div>
            {overviewPlacements.length > 0 && (
              <section className="birth-journey-glance" aria-labelledby="glance-title">
                <div className="birth-journey-sectionhead">
                  <h2 id="glance-title">At a glance</h2>
                  <span>Your three anchors</span>
                </div>
                <div className="birth-journey-glance__grid">
                  {overviewPlacements.map((planet) => (
                    <button
                      type="button"
                      key={planet.name}
                      onClick={() =>
                        handleSkySelect({
                          body: toSceneBodyNames([planet.name])?.[0],
                          layer: 'natal',
                          longitude: Number(planet.full_degree) || 0,
                        })
                      }
                    >
                      <span>{planet.name}</span>
                      <strong>{planet.sign}</strong>
                      <small>
                        {[degreeLabel(planet), planet.house && `House ${planet.house}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}

        {activeChapter === 'patterns' && selectedComposition && (
          <article className="birth-journey-chapter">
            <DetailNavigator
              items={compositionPagerItems}
              activeId={selectedComposition.key}
              groupLabel="Patterns"
              chapterLabel="Patterns"
              onActiveChange={(id) => {
                setSelectedPatternKey(id);
                setShowCompositionChart(false);
                setHoverNames(null);
                setPinnedNames(null);
              }}
              renderItem={({ payload: composition }) => (
                <>
                  <section className="birth-journey-copy birth-composition-intro">
                    <div className="birth-journey-eyebrow">
                      {composition.key === 'composition-shapes' ? 'Detected shapes' : 'Chart composition'}
                    </div>
                    <h1 data-detail-heading tabIndex="-1">{composition.label}</h1>
                    <p>{composition.description}</p>
                    <p>
                      {composition.key === 'composition-shapes'
                        ? `${shapeCards.length} chart pattern${shapeCards.length === 1 ? ' is' : 's are'} detected in this chart.`
                        : `${composition.summary} is a leading signal in this lens.`}
                    </p>
                  </section>
                  {composition.key !== 'composition-shapes' && (
                    <div className="birth-composition-toolbar">
                      <button
                        type="button"
                        onClick={() => setShowCompositionChart((visible) => !visible)}
                        aria-pressed={showCompositionChart}
                      >
                        {showCompositionChart
                          ? `Return to ${composition.label}`
                          : 'View highlighted chart'}
                      </button>
                    </div>
                  )}
                  {showCompositionChart && composition.key !== 'composition-shapes' ? (
                    <section className="birth-composition-chart-only">
                      {chartStage}
                    </section>
                  ) : (
                    <section className="birth-composition-detail">
                      {composition.key === 'composition-shapes' && (
                        <ShapesLens
                          cards={shapeCards}
                          planets={planets}
                          aspects={aspects}
                          interpretation={
                            basicAnalysis?.dominance?.pattern?.interpretation ||
                            basicAnalysis?.dominance?.patterns?.interpretation
                          }
                          onHoverBodies={setHoverNames}
                          onPinBodies={togglePinnedNames}
                          pinnedBodies={pinnedNames}
                        />
                      )}
                      {composition.key === 'composition-elements' && (
                        <ElementsLens
                          data={elements?.elements}
                          interpretation={basicAnalysis?.dominance?.elements?.interpretation}
                          onHoverBodies={setHoverNames}
                          onPinBodies={(names) => {
                            togglePinnedNames(names);
                            setShowCompositionChart(true);
                          }}
                          pinnedBodies={pinnedNames}
                        />
                      )}
                      {composition.key === 'composition-modalities' && (
                        <ModalitiesLens
                          data={modalities?.modalities}
                          interpretation={basicAnalysis?.dominance?.modalities?.interpretation}
                          onHoverBodies={setHoverNames}
                          onPinBodies={(names) => {
                            togglePinnedNames(names);
                            setShowCompositionChart(true);
                          }}
                          pinnedBodies={pinnedNames}
                        />
                      )}
                      {composition.key === 'composition-quadrants' && (
                        <QuadrantsLens
                          data={quadrants?.quadrants}
                          interpretation={basicAnalysis?.dominance?.quadrants?.interpretation}
                          onHoverBodies={setHoverNames}
                          onPinBodies={(names) => {
                            togglePinnedNames(names);
                            setShowCompositionChart(true);
                          }}
                          pinnedBodies={pinnedNames}
                        />
                      )}
                      {composition.key === 'composition-influence' && (
                        <InfluenceLens
                          data={planetaryDominance?.planets}
                          interpretation={basicAnalysis?.dominance?.planetary?.interpretation}
                          onHoverBodies={setHoverNames}
                          onPinBodies={(names) => {
                            togglePinnedNames(names);
                            setShowCompositionChart(true);
                          }}
                          pinnedBodies={pinnedNames}
                        />
                      )}
                    </section>
                  )}
                </>
              )}
            />
          </article>
        )}

        {activeChapter === 'planets' && (
          <article className="birth-journey-chapter">
            <DetailNavigator
              items={planetPagerItems}
              activeId={focusedPlanetName}
              groupLabel="Chart & Planets"
              chapterLabel="Chart & Planets"
              className="detail-navigator--planets"
              onActiveChange={(id) => {
                selectPlanet(id);
                setHoverNames(null);
              }}
              renderLabel={(item) => (
                <>
                  <PlanetIcon name={item.title} size={17} />
                  <span>{item.title}</span>
                </>
              )}
              renderItem={({ payload: planet }) => (
                <div className="birth-journey-split birth-journey-split--workspace">
                  {chartStage}
                  <section className="birth-journey-copy birth-journey-copy--tool">
                    <h1 data-detail-heading tabIndex="-1">
                      {planet ? `${planet.name} in ${planet.sign}` : 'Chart & Planets'}
                    </h1>
                    <p>
                      Select a body to isolate its major aspects and connect the chart to its
                      interpretation.
                    </p>
                    <PlanetsTab
                      birthChart={birthChart}
                      basicAnalysis={basicAnalysis}
                      hasAnalysis={hasAnalysis}
                      onNavigateToAnalysis={() => goToChapter('analysis')}
                      creditCost={CREDIT_COSTS.FULL_NATAL}
                      creditsRemaining={entitlements.credits?.total}
                      chartId={chartId}
                      canUseAskStellium={false}
                      onEmphasizeBodies={handlePlanetsEmphasis}
                      onHoverBodies={setHoverNames}
                      onUserSelectPlanet={selectPlanet}
                      externalPlanet={externalPlanet}
                      showAspectTable={false}
                    />
                  </section>
                </div>
              )}
            />
          </article>
        )}

        {activeChapter === 'analysis' && !selectedAnalysis && (
          <article className="birth-journey-chapter">
            <ChapterHeader label="360 Analysis" />
            <AnalysisTab
              broadCategoryAnalyses={broadCategoryAnalyses}
              analysisStatus={analysisStatus}
              onStartAnalysis={handleStartAnalysis}
              chartId={chartId}
              birthChart={birthChart}
              userId={userId}
              isCelebrity={isCelebrity}
            />
          </article>
        )}

        {activeChapter === 'analysis' && selectedAnalysis && (
          <article className="birth-journey-chapter">
            <DetailNavigator
              items={analysisPagerItems}
              activeId={selectedAnalysis.domain.id}
              groupLabel="Life areas"
              chapterLabel="360 Analysis"
              chapterHelper={`${selectedAnalysis.steps.length} sections in ${selectedAnalysis.domain.label}`}
              className="detail-navigator--analysis"
              onActiveChange={(id) => {
                setSelectedAnalysisId(id);
                setHoverNames(null);
                setPinnedNames(null);
              }}
              renderLabel={(item, selected) => (
                <>
                  <span>{item.title}</span>
                  {selected && <small>{item.payload.steps.length} sections</small>}
                </>
              )}
              renderItem={({ payload: group }) => (
                <div className="birth-journey-split birth-journey-split--analysis-detail">
                  {chartStage}
                  <section className="birth-journey-copy">
                    <h1 data-detail-heading tabIndex="-1">{group.domain.label}</h1>
                    <div className="birth-analysis-reading">
                      {group.steps.map((step) => (
                        <section key={step.id}>
                          <AnalysisStepBody
                            step={step}
                            onHoverBodies={setHoverNames}
                            onPinBodies={togglePinnedNames}
                            pinnedBodies={pinnedNames}
                          />
                        </section>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            />
          </article>
        )}

        <article
          className="birth-journey-chapter birth-journey-askpage"
          hidden={activeChapter !== 'ask'}
        >
          <ChapterHeader label="Ask Stellium" />
          <div className="birth-ask-workspace">
            {activeChapter === 'ask' && askChartStage}
            <section className="birth-ask-chat" aria-label="Ask Stellium conversation">
              <AskStelliumPanel
                variant="dock"
                isOpen={activeChapter === 'ask'}
                onClose={() => goToChapter('analysis')}
                contentType="birthchart"
                contentId={chartId}
                birthChart={birthChart}
                externalElements={askElements}
                externalToggle={askExternalToggle}
                onSelectionChange={setAskSelection}
                contextLabel="About your birth chart"
                placeholderText="Ask about this chart…"
                suggestedQuestions={[
                  'What is the strongest theme in my chart?',
                  'How do my Sun and Moon work together?',
                  'What should I understand about my relationships?',
                ]}
              />
            </section>
          </div>
        </article>

        <ChapterFooter activeChapter={activeChapter} onNavigate={goToChapter} />
      </main>

    </div>
  );
}

export default ChartReaderPage;
