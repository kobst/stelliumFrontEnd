import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const ACTS = [
  { id: 'hero', rail: null, mode: 'hidden' },
  { id: 'overview', rail: 'Overview', mode: 'hidden' },
  { id: 'patterns', rail: 'Patterns', mode: 'hidden' },
  // chart shapes: the sky arrives a chapter early to point the figures
  // out on the big wheel (rail-wise still "Patterns")
  { id: 'shapes', rail: null, railAs: 'patterns', mode: 'full' },
  { id: 'planets', rail: 'Chart & Planets', mode: 'full' },
  { id: 'analysis', rail: '360 Analysis', mode: 'recede' },
  { id: 'ask', rail: 'Ask Stellium', mode: 'recede' },
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

  // Chart Shapes: which pattern the big wheel is pointing out
  const [selectedShape, setSelectedShape] = useState(null);

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
    if (activeAct === 'shapes') {
      const focus = selectedShape || shapeCards[0];
      return focus ? toSceneBodyNames(focus.members) : undefined;
    }
    if (activeAct === 'planets' && planetsSelectionNames) {
      return toSceneBodyNames(planetsSelectionNames);
    }
    return undefined;
  }, [hoverNames, planetsSelectionNames, activeAct, selectedShape, shapeCards]);

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
        const d = Math.abs((r.top + r.bottom) / 2 - mid);
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

  const scrollToAct = (id) => {
    const container = scrollRef.current;
    const el =
      stepRefs.current[id] ||
      Object.values(stepRefs.current).find((e) => e && e.dataset.act === id);
    if (el && container) {
      container.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
    }
  };

  const isCelebrity =
    chart?.isCelebrity === true || chart?.kind === 'celebrity' || chart?.isReadOnly === true;
  const canUseAskStellium = isAnalysisComplete;

  const handleSkyPick = (sel) => {
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
  };

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
            coveredRightPx={sceneMode === 'full' ? Math.min(560, window.innerWidth * 0.46) : 0}
            highlightBodies={highlightBodies}
            onHoverBody={(h) =>
              setHoverInfo(
                h ? { body: h.body, x: mousePos.current.x, y: mousePos.current.y } : null
              )
            }
            onSelectBody={handleSkyPick}
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
        <span className="journey-brand">Stellium</span>
      </div>

      {/* progress rail — a journey map, not tabs */}
      <nav className="journey-rail">
        {ACTS.filter((a) => a.rail).map((a) => (
          <button
            key={a.id}
            className={
              activeAct === a.id ||
              (activeAct === 'hero' && a.id === 'overview') ||
              (activeAct === 'shapes' && a.id === 'patterns')
                ? 'on'
                : ''
            }
            onClick={() => scrollToAct(a.id)}
          >
            <span className="dot" />
            <span className="nm">{a.rail}</span>
          </button>
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

          <section
            className={`journey-step journey-step--wide${liveStep === 'lens-elements' ? ' live' : ''}`}
            ref={setStepRef('lens-elements', 'patterns')}
          >
            <div className="journey-subchapter">Elements</div>
            <ElementsLens
              data={elements?.elements}
              interpretation={basicAnalysis?.dominance?.elements?.interpretation}
              onHoverBodies={setHoverNames}
            />
          </section>

          <section
            className={`journey-step journey-step--wide${liveStep === 'lens-modalities' ? ' live' : ''}`}
            ref={setStepRef('lens-modalities', 'patterns')}
          >
            <div className="journey-subchapter">Modalities</div>
            <ModalitiesLens
              data={modalities?.modalities}
              interpretation={basicAnalysis?.dominance?.modalities?.interpretation}
              onHoverBodies={setHoverNames}
            />
          </section>

          <section
            className={`journey-step journey-step--wide${liveStep === 'lens-quadrants' ? ' live' : ''}`}
            ref={setStepRef('lens-quadrants', 'patterns')}
          >
            <div className="journey-subchapter">Quadrants</div>
            <QuadrantsLens
              data={quadrants?.quadrants}
              interpretation={basicAnalysis?.dominance?.quadrants?.interpretation}
              onHoverBodies={setHoverNames}
            />
          </section>

          <section
            className={`journey-step journey-step--wide${liveStep === 'lens-influence' ? ' live' : ''}`}
            ref={setStepRef('lens-influence', 'patterns')}
          >
            <div className="journey-subchapter">Planetary Influence</div>
            <InfluenceLens
              data={planetaryDominance?.planets}
              interpretation={basicAnalysis?.dominance?.planetary?.interpretation}
              onHoverBodies={setHoverNames}
            />
          </section>

          <section
            className={`journey-step journey-step--panel${liveStep === 'lens-shapes' ? ' live' : ''}`}
            ref={setStepRef('lens-shapes', 'shapes')}
          >
            <div className="journey-subchapter">Chart Shapes</div>
            <p className="journey-lede">
              The figures your sky draws when you step back — each card points its
              pattern out on the big wheel. Hover to trace one; click to hold it.
            </p>
            <ShapesLens
              cards={shapeCards}
              planets={birthChart?.planets || []}
              aspects={birthChart?.aspects || []}
              interpretation={basicAnalysis?.dominance?.pattern?.interpretation}
              onHoverBodies={setHoverNames}
              selectedKey={(selectedShape || shapeCards[0])?.key}
              onSelectCard={(c) =>
                setSelectedShape((prev) => (prev?.key === c.key ? null : c))
              }
            />
          </section>

          <section
            className={`journey-step journey-step--panel${liveStep === 'planets' ? ' live' : ''}`}
            ref={setStepRef('planets')}
          >
            <div className="journey-chapter">III · Chart &amp; Planets</div>
            <p className="journey-lede">
              Here is the sky the reading has been describing — and from here it stays.
              Pick a body (or click one in the sky): the chart isolates it, and the lines
              you see are exactly its aspects.
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
              externalPlanet={externalPlanet}
            />
          </section>

          <section
            className={`journey-step journey-step--panel${liveStep === 'analysis' ? ' live' : ''}`}
            ref={setStepRef('analysis')}
          >
            <div className="journey-chapter">IV · 360 Analysis</div>
            <p className="journey-lede">
              The long reading, life-area by life-area. The sky steps back — the text
              carries it from here.
            </p>
            <AnalysisTab
              broadCategoryAnalyses={broadCategoryAnalyses}
              analysisStatus={analysisStatus}
              onStartAnalysis={handleStartAnalysis}
              chartId={chartId}
              birthChart={birthChart}
              userId={userId}
              isCelebrity={isCelebrity}
            />
          </section>

          <section
            className={`journey-step journey-step--panel journey-step--close${liveStep === 'ask' ? ' live' : ''}`}
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
