import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import useChartData from '../hooks/useChartData';
import { ChartScene } from '../UI/shared/chartScene';
import {
  toChartScenePlacements,
  toChartSceneAspects,
  toSceneBodyNames,
  fromSceneBodyName,
} from '../Utilities/chartSceneAdapter';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import {
  ElementsLens,
  ModalitiesLens,
  QuadrantsLens,
  InfluenceLens,
  ShapesLens,
  extractShapeCards,
} from '../UI/journey/PatternLenses';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import { AnalysisStepBody, flattenAnalysis } from '../UI/journey/AnalysisFlow';
import AskStelliumPanel, { formatPositionData } from '../UI/askStellium/AskStelliumPanel';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import './ChartReaderPage.css';

/**
 * The birth chart reading as one continuous scroll — a journey. The sky
 * is a fixed backdrop with three postures keyed to the act being read:
 *   hidden  — Acts I–II (Overview, Patterns): prose and the lenses' own
 *             graphics hold the stage; the chart hasn't arrived yet
 *   full    — Act III (Chart & Planets): the reveal; the sky isolates
 *             the selected planet; clicking the ephemeris or the picker
 *             both drive the analysis panel
 *   recede  — Act IV (360 Analysis): the sky dims and steps aside for
 *             the long-form reading
 * Scroll IS the selection state: a scroll-spy watches which step is
 * centered and drives the scene to match. Ask is a floating entry that
 * opens the standard overlay drawer; tapping a planet in the sky adds
 * it as context.
 */

const ACT_TITLES = {
  overview: 'I · Overview',
  patterns: 'II · Patterns',
  planets: 'III · Chart & Planets',
  analysis: 'IV · 360 Analysis',
  ask: 'V · Ask Stellium',
};

// in-flow section labels never render in the scroll: the current
// group's label populates the fixed header (journey-domainbar) instead
const LENS_LABELS = {
  'lens-elements': 'Elements',
  'lens-modalities': 'Modalities',
  'lens-quadrants': 'Quadrants',
  'lens-influence': 'Planetary Influence',
  'lens-shapes': 'Chart Shapes',
};

const ACTS = [
  { id: 'hero', rail: null, mode: 'hidden' },
  { id: 'overview', rail: 'Overview', mode: 'hidden' },
  { id: 'patterns', rail: 'Patterns', mode: 'hidden' },
  { id: 'planets', rail: 'Chart & Planets', mode: 'full' },
  { id: 'analysis', rail: '360 Analysis', mode: 'mirror' },
  { id: 'ask', rail: 'Ask Stellium', mode: 'above' },
];

function ChartReaderPage() {
  const { userId, chartId } = useParams();
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

  const [activeAct, setActiveAct] = useState('hero');
  const [liveStep, setLiveStep] = useState('hero');

  // emphasis channels (backend names): hover from the section graphics
  // wins over the Planets picker's persistent selection
  const [hoverNames, setHoverNames] = useState(null);
  const [planetsSelectionNames, setPlanetsSelectionNames] = useState(null);

  // sky click → drives the planet analysis (Act III) and Ask context
  const [externalPlanet, setExternalPlanet] = useState(null);

  // the sky's selection is controlled here so the picker and the sky
  // stay two views of one state (a scene-internal selection could
  // otherwise go stale and freeze the aspect lines on an old pick)
  const [skySelection, setSkySelection] = useState(null);

  // Ask drawer (standard overlay variant) + context bridge
  const [askOpen, setAskOpen] = useState(false);
  const [askElements, setAskElements] = useState([]);

  const [fitNonce, setFitNonce] = useState(0);

  // hover tooltip pinned to the cursor
  const mousePos = useRef({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = useState(null);

  const natal = useMemo(
    () => toChartScenePlacements(birthChart.planets),
    [birthChart.planets]
  );
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart.aspects),
    [birthChart.aspects]
  );

  const sceneBodyLookup = useMemo(() => {
    const map = {};
    (birthChart.planets || []).forEach((p) => {
      const scene = toSceneBodyNames([p.name])?.[0];
      if (scene) map[scene] = p;
    });
    return map;
  }, [birthChart.planets]);

  const act = ACTS.find((a) => a.id === activeAct) || ACTS[0];
  const sceneMode = act.mode;

  const knownNames = useMemo(
    () => (birthChart?.planets || []).map((p) => p.name),
    [birthChart?.planets]
  );
  const analysisSteps = useMemo(
    () => flattenAnalysis(broadCategoryAnalyses, knownNames),
    [broadCategoryAnalyses, knownNames]
  );
  const analysisGroups = useMemo(() => {
    const groups = [];
    analysisSteps.forEach((st) => {
      let g = groups[groups.length - 1];
      if (!g || g.domain.id !== st.domain.id) {
        g = { domain: st.domain, steps: [] };
        groups.push(g);
      }
      g.steps.push(st);
    });
    return groups;
  }, [analysisSteps]);

  const analysisFocusById = useMemo(() => {
    const map = {};
    analysisSteps.forEach((st) => {
      map[st.id] = st.focus;
    });
    return map;
  }, [analysisSteps]);

  const liveDomainLabel = useMemo(() => {
    if (LENS_LABELS[liveStep]) return LENS_LABELS[liveStep];
    const g = analysisGroups.find((grp) => grp.steps.some((st) => st.id === liveStep));
    return g ? g.domain.label : null;
  }, [liveStep, analysisGroups]);

  const shapeCards = useMemo(
    () =>
      extractShapeCards(
        birthChart?.patterns?.patterns || birthChart?.patterns || [],
        birthChart?.planets || []
      ),
    [birthChart?.patterns, birthChart?.planets]
  );

  const highlightBodies = useMemo(() => {
    if (hoverNames) return toSceneBodyNames(hoverNames);
    if (activeAct === 'analysis') {
      const focus = analysisFocusById[liveStep];
      return focus?.length ? toSceneBodyNames(focus) : undefined;
    }
    if (activeAct === 'planets' && planetsSelectionNames) {
      return toSceneBodyNames(planetsSelectionNames);
    }
    return undefined;
  }, [hoverNames, planetsSelectionNames, activeAct, analysisFocusById, liveStep]);

  // ── scroll spy: the step nearest the viewport's center is live ────
  const scrollRef = useRef(null);
  const stepRefs = useRef({});
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || loading) return undefined;
    let ticking = false;
    const spy = () => {
      ticking = false;
      const mid = container.clientHeight / 2;
      let best = null;
      let bestDist = Infinity;
      Object.entries(stepRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        // distance to the step's BOUNDS, not its center: a tall step
        // (e.g. Chart & Planets) is live the whole time the viewport
        // center is inside it, instead of losing to a short neighbor
        const d =
          mid >= r.top && mid <= r.bottom
            ? 0
            : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (d < bestDist) {
          bestDist = d;
          best = { id, el };
        }
      });
      if (best) {
        setLiveStep(best.id);
        setActiveAct(best.el.dataset.act || best.id);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(spy);
      }
    };
    container.addEventListener('scroll', onScroll);
    spy();
    return () => container.removeEventListener('scroll', onScroll);
  }, [loading]);

  // scrolling on releases a manual sky pick so each act's own emphasis
  // grammar (shape tracing, analysis steps) leads again; inside the
  // planets act the pick rides along — it IS that act's grammar
  useEffect(() => {
    if (activeAct !== 'planets') setSkySelection(null);
  }, [activeAct, liveStep]);

  // the wheel always scrolls the story: over the sky (outside the
  // scroll column) it forwards to the journey instead of zooming
  useEffect(() => {
    const onWheel = (e) => {
      const scroller = scrollRef.current;
      if (!scroller || scroller.contains(e.target)) return;
      scroller.scrollTop += e.deltaY;
    };
    document.addEventListener('wheel', onWheel, { passive: true });
    return () => document.removeEventListener('wheel', onWheel);
  }, []);

  const scrollToAct = useCallback((id) => {
    const container = scrollRef.current;
    const el =
      stepRefs.current[id] ||
      Object.values(stepRefs.current).find((e) => e && e.dataset.act === id);
    if (el && container) {
      container.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
    }
  }, []);

  const isCelebrity =
    chart?.isCelebrity === true || chart?.kind === 'celebrity' || chart?.isReadOnly === true;
  const canUseAskStellium = isAnalysisComplete;

  // stable identities keep the memoized ChartScene from re-rendering on
  // every scroll-spy state change
  const handleSkySelect = useCallback(
    (sel) => {
      setSkySelection(sel);
      if (!sel) return;
      const name = fromSceneBodyName(sel.body);
      const planet = name && (birthChart.planets || []).find((p) => p.name === name);
      if (!planet) return;
      // the sky and the picker are two views of one selection
      setExternalPlanet({ name, nonce: Date.now() });
      if (activeAct !== 'planets' && activeAct !== 'analysis') scrollToAct('planets');
      if (canUseAskStellium) {
        const data = formatPositionData(planet);
        setAskElements([{ ...data, key: data.code, payload: data }]);
      }
    },
    [birthChart.planets, activeAct, canUseAskStellium, scrollToAct]
  );

  const handleSkyHover = useCallback((h) => {
    setHoverInfo(
      h ? { body: h.body, x: mousePos.current.x, y: mousePos.current.y } : null
    );
  }, []);

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
  const birthMeta = [chart?.dateOfBirth, chart?.placeOfBirth]
    .filter(Boolean)
    .join(' · ');

  const hoveredPlanet = hoverInfo ? sceneBodyLookup[hoverInfo.body] : null;
  const setStepRef = (id, act) => (el) => {
    stepRefs.current[id] = el;
    if (el) el.dataset.act = act || id;
  };

  return (
    <div
      className="journey-page"
      onMouseMove={(e) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
      }}
    >
      {/* the fixed sky, in the posture the current act asks for */}
      <div className={`journey-scene journey-scene--${sceneMode}`}>
        {natal.length > 0 && (
          <ChartScene
            natal={natal}
            natalAspects={natalAspects}
            fitRadius={5.9}
            fitNonce={fitNonce}
            disableZoom
            coveredRightPx={
              sceneMode === 'full'
                ? Math.min(560, window.innerWidth * 0.46)
                : sceneMode === 'mirror'
                  ? -Math.min(560, window.innerWidth * 0.46)
                  : 0
            }
            highlightBodies={highlightBodies}
            selectedBody={skySelection}
            paused={sceneMode === 'hidden'}
            onHoverBody={handleSkyHover}
            onSelectBody={handleSkySelect}
          />
        )}
      </div>

      {hoverInfo && (
        <div
          className="chart-reader-tooltip"
          style={{ left: hoverInfo.x + 14, top: hoverInfo.y - 10 }}
        >
          {hoveredPlanet ? (
            <>
              {hoveredPlanet.name}
              <span className="dim">
                {' '}
                · {hoveredPlanet.sign}
                {typeof hoveredPlanet.norm_degree === 'number' &&
                  ` ${hoveredPlanet.norm_degree.toFixed(1)}°`}
              </span>
            </>
          ) : (
            hoverInfo.body
          )}
        </div>
      )}

      <div className="journey-topbar">
        <button
          className="reader-bar__back"
          onClick={() => navigate(`/dashboard/${userId}/chart/${chartId}`)}
        >
          ← Classic view
        </button>
        <div className="journey-identity">
          <span className="journey-identity__name">{subjectName}</span>
          {birthMeta && <span className="journey-identity__meta">{birthMeta}</span>}
        </div>
        <span className="journey-brand">Stellium</span>
      </div>

      {/* the current act, pinned — you always know where you are */}
      {activeAct !== 'hero' && (
        <div className="journey-actbar" key={ACT_TITLES[activeAct]}>
          <span>{ACT_TITLES[activeAct]}</span>
        </div>
      )}

      {/* the live section's label populates in beneath the act — labels
          never scroll through the view */}
      {activeAct !== 'hero' && liveDomainLabel && (
        <div className="journey-domainbar" key={liveDomainLabel}>
          <span>{liveDomainLabel}</span>
        </div>
      )}

      {/* progress rail — a journey map, not tabs */}
      <nav className="journey-rail">
        {ACTS.filter((a) => a.rail).map((a) => (
          <React.Fragment key={a.id}>
            <button
              className={
                activeAct === a.id || (activeAct === 'hero' && a.id === 'overview')
                  ? 'on'
                  : ''
              }
              onClick={() => scrollToAct(a.id)}
            >
              <span className="dot" />
              <span className="nm">{a.rail}</span>
            </button>
            {/* inside the 360, the rail opens into its life areas — the
                long reading is jumpable, not just scrollable */}
            {a.id === 'analysis' &&
              activeAct === 'analysis' &&
              analysisGroups.length > 0 && (
                <div className="journey-rail__subs">
                  {analysisGroups.map((g) => (
                    <button
                      key={g.domain.id}
                      className={
                        g.steps.some((st) => st.id === liveStep) ? 'sub on' : 'sub'
                      }
                      onClick={() => scrollToAct(g.steps[0].id)}
                    >
                      <span className="dot" />
                      <span className="nm">{g.domain.label}</span>
                    </button>
                  ))}
                </div>
              )}
          </React.Fragment>
        ))}
      </nav>

      {sceneMode !== 'hidden' && (
        <button
          className="journey-recenter"
          title="Recenter the sky"
          onClick={() => setFitNonce((n) => n + 1)}
        >
          ⌖ Recenter
        </button>
      )}

      {/* the journey column */}
      <div
        className={`journey-scroll${sceneMode === 'hidden' ? '' : ' journey-scroll--passthrough'}`}
        ref={scrollRef}
      >
        <div className="journey-body">
          <section
            className={`journey-step journey-step--hero${liveStep === 'hero' ? ' live' : ''}`}
            ref={setStepRef('hero')}
          >
            <div className="journey-chapter">The 360 Reading</div>
            <h1>{subjectName}</h1>
            {birthMeta && <div className="journey-meta">{birthMeta}</div>}
            <p className="journey-lede">Scroll. The sky arrives when it&rsquo;s needed.</p>
          </section>

          <section
            className={`journey-step journey-step--wide${liveStep === 'overview' ? ' live' : ''}`}
            ref={setStepRef('overview')}
          >
            <div className="journey-chapter">I · Overview</div>
            {(basicAnalysis?.overview || '')
              .split(/\n\s*\n|\n/)
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            <p className="journey-lede">Those are the claims. Now, the evidence.</p>
          </section>

          <section
            className={`journey-step journey-step--wide${liveStep === 'patterns' ? ' live' : ''}`}
            ref={setStepRef('patterns')}
          >
            <div className="journey-chapter">II · Patterns</div>
            <p className="journey-lede">
              The weather system of the chart — five lenses on the same sky, each drawing
              its own picture.
            </p>
          </section>

          <div className="journey-domain-group">
            <section
              className={`journey-step journey-step--lens${liveStep === 'lens-elements' ? ' live' : ''}`}
              ref={setStepRef('lens-elements', 'patterns')}
            >
            <ElementsLens
              data={elements?.elements}
              interpretation={basicAnalysis?.dominance?.elements?.interpretation}
              onHoverBodies={setHoverNames}
            />
            </section>
          </div>

          <div className="journey-domain-group">
            <section
              className={`journey-step journey-step--lens${liveStep === 'lens-modalities' ? ' live' : ''}`}
              ref={setStepRef('lens-modalities', 'patterns')}
            >
            <ModalitiesLens
              data={modalities?.modalities}
              interpretation={basicAnalysis?.dominance?.modalities?.interpretation}
              onHoverBodies={setHoverNames}
            />
            </section>
          </div>

          <div className="journey-domain-group">
            <section
              className={`journey-step journey-step--lens${liveStep === 'lens-quadrants' ? ' live' : ''}`}
              ref={setStepRef('lens-quadrants', 'patterns')}
            >
            <QuadrantsLens
              data={quadrants?.quadrants}
              interpretation={basicAnalysis?.dominance?.quadrants?.interpretation}
              onHoverBodies={setHoverNames}
            />
            </section>
          </div>

          <div className="journey-domain-group">
            <section
              className={`journey-step journey-step--lens${liveStep === 'lens-influence' ? ' live' : ''}`}
              ref={setStepRef('lens-influence', 'patterns')}
            >
            <InfluenceLens
              data={planetaryDominance?.planets}
              interpretation={basicAnalysis?.dominance?.planetary?.interpretation}
              onHoverBodies={setHoverNames}
            />
            </section>
          </div>

          <div className="journey-domain-group">
          <section
            className={`journey-step journey-step--lens${liveStep === 'lens-shapes' ? ' live' : ''}`}
            ref={setStepRef('lens-shapes', 'patterns')}
          >
            <p className="journey-lede">
              The figures your sky draws when you step back — each one traced in
              miniature, its members lit and their actual aspects drawn.
            </p>
            <ShapesLens
              cards={shapeCards}
              planets={birthChart?.planets || []}
              aspects={birthChart?.aspects || []}
              interpretation={basicAnalysis?.dominance?.pattern?.interpretation}
              onHoverBodies={setHoverNames}
            />
          </section>
          </div>

          <section
            className={`journey-step journey-step--panel${liveStep === 'planets' ? ' live' : ''}`}
            ref={setStepRef('planets')}
          >
            <div className="journey-chapter">III · Chart &amp; Planets</div>
            <p className="journey-lede">
              Here is the sky the reading has been describing — and from here it stays.
              Pick a body (or click one in the sky): the chart isolates it and lights the
              major aspects it makes; the table below lists every aspect, including the
              subtler ones the wheel leaves undrawn.
            </p>
            <PlanetsTab
              birthChart={birthChart}
              basicAnalysis={basicAnalysis}
              hasAnalysis={hasAnalysis}
              onNavigateToAnalysis={() => scrollToAct('analysis')}
              creditCost={CREDIT_COSTS.FULL_NATAL}
              creditsRemaining={entitlements.credits?.total}
              chartId={chartId}
              canUseAskStellium={false}
              onEmphasizeBodies={setPlanetsSelectionNames}
              onHoverBodies={setHoverNames}
              onUserSelectPlanet={(name) => {
                const scene = toSceneBodyNames([name])?.[0];
                setSkySelection(
                  scene ? { body: scene, layer: 'natal', longitude: 0 } : null
                );
              }}
              externalPlanet={externalPlanet}
            />
          </section>

          <section
            className={`journey-step journey-step--left${liveStep === 'analysis' ? ' live' : ''}`}
            ref={setStepRef('analysis')}
          >
            <div className="journey-chapter">IV · 360 Analysis</div>
            <p className="journey-lede">
              The long reading, life-area by life-area. The sky crosses to your right
              and follows along — each theme lights the placements it speaks of.
            </p>
            {analysisSteps.length === 0 && (
              <AnalysisTab
                broadCategoryAnalyses={broadCategoryAnalyses}
                analysisStatus={analysisStatus}
                onStartAnalysis={handleStartAnalysis}
                chartId={chartId}
                birthChart={birthChart}
                userId={userId}
                isCelebrity={isCelebrity}
              />
            )}
          </section>

          {analysisGroups.map((g) => (
            <div className="journey-domain-group" key={g.domain.id}>
              {g.steps.map((st) => (
                <section
                  key={st.id}
                  className={`journey-step journey-step--left${st.kind === 'synthesis' ? ' journey-step--syn' : ''}${liveStep === st.id ? ' live' : ''}`}
                  ref={setStepRef(st.id, 'analysis')}
                >
                  <AnalysisStepBody step={st} onHoverBodies={setHoverNames} />
                </section>
              ))}
            </div>
          ))}

          <section
            className={`journey-step journey-step--wide journey-step--close${liveStep === 'ask' ? ' live' : ''}`}
            ref={setStepRef('ask')}
          >
            <div className="journey-chapter">V · Ask Stellium</div>
            <p>
              The reading ends; the chart doesn&rsquo;t. Anything above can be questioned —
              tap a planet in the sky, then ask.
            </p>
            {canUseAskStellium && (
              <button className="journey-open-ask" onClick={() => setAskOpen(true)}>
                ✦ Ask Stellium about this chart
              </button>
            )}
          </section>
        </div>
      </div>

      {canUseAskStellium && (
        <button className="journey-ask-fab" onClick={() => setAskOpen(true)}>
          <span className="sp">✦</span> Ask
        </button>
      )}

      <AskStelliumPanel
        isOpen={askOpen}
        onClose={() => setAskOpen(false)}
        contentType="birthchart"
        contentId={chartId}
        birthChart={birthChart}
        externalElements={askElements}
        contextLabel="About your birth chart"
        placeholderText="Ask about this chart…"
        suggestedQuestions={[
          'What are my greatest strengths?',
          'How does my Moon sign affect my emotions?',
          'What does my chart say about my career?',
        ]}
      />
    </div>
  );
}

export default ChartReaderPage;
