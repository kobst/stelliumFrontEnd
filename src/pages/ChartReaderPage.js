import React, { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import useChartData from '../hooks/useChartData';
import SkyStage from '../UI/shared/SkyStage';
import {
  toChartScenePlacements,
  toChartSceneAspects,
  toSceneBodyNames,
  fromSceneBodyName,
} from '../Utilities/chartSceneAdapter';
import OverviewTab from '../UI/dashboard/chartTabs/OverviewTab';
import DominancePatternsTab from '../UI/dashboard/chartTabs/DominancePatternsTab';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import AskStelliumPanel, { formatPositionData } from '../UI/askStellium/AskStelliumPanel';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import './ChartReaderPage.css';

/**
 * The birth chart as a stage — same structure the horoscope settled on:
 * a chapter bar on top (the page's master variable), the natal sky
 * full-bleed, the reading docked beside it (Reading | Ask voices), and
 * planet selection detail as a bottom-left overlay. No scrubber: a
 * birth chart has no time axis.
 */

// Which natal bodies each chapter emphasizes by default. Patterns and
// Planets drive their own emphasis through hover/selection callbacks.
const CHAPTERS = [
  { id: 'overview', label: 'Overview', bodies: ['sun', 'moon'] },
  { id: 'patterns', label: 'Patterns', bodies: null },
  { id: 'planets', label: 'Planets', bodies: null },
  { id: 'analysis', label: '360 Analysis', bodies: null },
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

  const [activeChapter, setActiveChapter] = useState('overview');
  const [dockMode, setDockMode] = useState('reading');

  // emphasis channels (backend body names): transient hover wins over
  // the Planets picker's persistent selection, which wins over the Ask
  // selection, which wins over the chapter default
  const [hoverNames, setHoverNames] = useState(null);
  const [planetsSelectionNames, setPlanetsSelectionNames] = useState(null);

  // Ask bridge: one-shot pushes in, live selection mirrored out
  const [askElements, setAskElements] = useState([]);
  const [askSelection, setAskSelection] = useState([]);

  // hover tooltip pinned to the cursor; click selection detail overlay
  const mousePos = useRef({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedBody, setSelectedBody] = useState(null);

  const natal = useMemo(
    () => toChartScenePlacements(birthChart.planets),
    [birthChart.planets]
  );
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart.aspects),
    [birthChart.aspects]
  );

  // scene body name ("sun") → backend planet record (sign/house/degree)
  const sceneBodyLookup = useMemo(() => {
    const map = {};
    (birthChart.planets || []).forEach((p) => {
      const scene = toSceneBodyNames([p.name])?.[0];
      if (scene) map[scene] = p;
    });
    return map;
  }, [birthChart.planets]);

  const selectedInfo = useMemo(() => {
    if (!selectedBody) return null;
    const planet = sceneBodyLookup[selectedBody.body];
    if (!planet) return null;
    const aspects = (birthChart.aspects || [])
      .filter(
        (a) =>
          a.aspectedPlanet === planet.name || a.aspectingPlanet === planet.name
      )
      .map((a) => ({
        other:
          a.aspectedPlanet === planet.name ? a.aspectingPlanet : a.aspectedPlanet,
        type: a.aspectType,
        orb: typeof a.orb === 'number' ? a.orb : Number(a.orb),
      }))
      .sort((x, y) => (x.orb ?? 99) - (y.orb ?? 99))
      .slice(0, 4);
    return { planet, aspects };
  }, [selectedBody, sceneBodyLookup, birthChart.aspects]);

  const askHighlightNames = useMemo(() => {
    const names = (askSelection || [])
      .map((el) => el.payload?.planet || el.planet)
      .filter(Boolean);
    return names.length ? names : null;
  }, [askSelection]);

  const highlightBodies = useMemo(() => {
    if (hoverNames) return toSceneBodyNames(hoverNames);
    if (activeChapter === 'planets' && planetsSelectionNames) {
      return toSceneBodyNames(planetsSelectionNames);
    }
    if (askHighlightNames) return toSceneBodyNames(askHighlightNames);
    const chapter = CHAPTERS.find((c) => c.id === activeChapter);
    return chapter?.bodies || undefined;
  }, [hoverNames, planetsSelectionNames, askHighlightNames, activeChapter]);

  const isCelebrity =
    chart?.isCelebrity === true || chart?.kind === 'celebrity' || chart?.isReadOnly === true;
  const canUseAskStellium = isAnalysisComplete;

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

  const chapterContent = {
    overview: (
      <OverviewTab
        basicAnalysis={basicAnalysis}
        chartId={chartId}
        birthChart={birthChart}
        canUseAskStellium={false}
      />
    ),
    patterns: (
      <DominancePatternsTab
        birthChart={birthChart}
        basicAnalysis={basicAnalysis}
        elements={elements}
        modalities={modalities}
        quadrants={quadrants}
        planetaryDominance={planetaryDominance}
        hasAnalysis={hasAnalysis}
        onNavigateToAnalysis={() => setActiveChapter('analysis')}
        creditCost={CREDIT_COSTS.FULL_NATAL}
        creditsRemaining={entitlements.credits?.total}
        chartId={chartId}
        canUseAskStellium={false}
        onHoverBodies={setHoverNames}
      />
    ),
    planets: (
      <PlanetsTab
        birthChart={birthChart}
        basicAnalysis={basicAnalysis}
        hasAnalysis={hasAnalysis}
        onNavigateToAnalysis={() => setActiveChapter('analysis')}
        creditCost={CREDIT_COSTS.FULL_NATAL}
        creditsRemaining={entitlements.credits?.total}
        chartId={chartId}
        canUseAskStellium={false}
        onEmphasizeBodies={setPlanetsSelectionNames}
        onHoverBodies={setHoverNames}
      />
    ),
    analysis: (
      <AnalysisTab
        broadCategoryAnalyses={broadCategoryAnalyses}
        analysisStatus={analysisStatus}
        onStartAnalysis={handleStartAnalysis}
        chartId={chartId}
        birthChart={birthChart}
        userId={userId}
        isCelebrity={isCelebrity}
      />
    ),
  };

  // ── chapter bar (the page's master variable) ─────────────────────
  const chapterBar = (
    <>
      <div className="reader-bar__left">
        <button
          className="reader-bar__back"
          onClick={() => navigate(`/dashboard/${userId}/chart/${chartId}`)}
        >
          ← Classic view
        </button>
        <span className="reader-bar__subject">
          {subjectName} <span className="dim">· The 360 Reading</span>
        </span>
      </div>
      <div className="horizon-tabs" role="tablist">
        {CHAPTERS.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={activeChapter === c.id}
            className={`horizon-tab${activeChapter === c.id ? ' active' : ''}`}
            onClick={() => {
              setActiveChapter(c.id);
              setDockMode('reading');
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="reader-bar__right" />
    </>
  );

  // ── dock voices ───────────────────────────────────────────────────
  const dockTabs = (
    <div className="md-dock-tabs" role="tablist">
      <button
        role="tab"
        aria-selected={dockMode === 'reading'}
        className={`md-dock-tab${dockMode === 'reading' ? ' active' : ''}`}
        onClick={() => setDockMode('reading')}
      >
        Reading
      </button>
      {canUseAskStellium && (
        <button
          role="tab"
          aria-selected={dockMode === 'ask'}
          className={`md-dock-tab${dockMode === 'ask' ? ' active' : ''}`}
          onClick={() => setDockMode('ask')}
        >
          ✦ Ask
        </button>
      )}
    </div>
  );

  const askPanel = (
    <div className="reader-dock-ask">
      <AskStelliumPanel
        variant="dock"
        isOpen
        onClose={() => setDockMode('reading')}
        contentType="birthchart"
        contentId={chartId}
        birthChart={birthChart}
        externalElements={askElements}
        onSelectionChange={setAskSelection}
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

  const readingPanel = (
    <div className="reader-panel">{chapterContent[activeChapter]}</div>
  );

  // ── selection detail overlay (bottom-left) ────────────────────────
  const detailOverlay = selectedInfo && (
    <div className="reader-detail-card">
      <div className="chart-reader-sky-detail-head">
        <span className="nm">
          {selectedInfo.planet.name}
          {selectedInfo.planet.is_retro === 'true' && <span className="retro">℞</span>}
        </span>
        <span className="pos">
          {selectedInfo.planet.sign}
          {typeof selectedInfo.planet.norm_degree === 'number' &&
            ` · ${selectedInfo.planet.norm_degree.toFixed(1)}°`}
          {selectedInfo.planet.house ? ` · House ${selectedInfo.planet.house}` : ''}
        </span>
      </div>
      {selectedInfo.aspects.map((a, i) => (
        <div key={i} className="chart-reader-sky-detail-asp">
          <span>
            {a.type?.toLowerCase()} {a.other}
          </span>
          {Number.isFinite(a.orb) && <span className="orb">{a.orb.toFixed(1)}°</span>}
        </div>
      ))}
      {canUseAskStellium && (
        <button
          className="reader-detail-ask"
          onClick={() => {
            const data = formatPositionData(selectedInfo.planet);
            setAskElements([{ ...data, key: data.code, payload: data }]);
            setDockMode('ask');
          }}
        >
          ✦ Ask about this placement
        </button>
      )}
      <div className="chart-reader-sky-detail-hint">click empty space to dismiss</div>
    </div>
  );

  const hoveredPlanet = hoverInfo ? sceneBodyLookup[hoverInfo.body] : null;

  return (
    <div
      className="chart-reader-page chart-reader-page--stage"
      onMouseMove={(e) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
      }}
    >
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

      {natal.length > 0 && (
        <SkyStage
          sceneProps={{
            natal,
            natalAspects,
            fitRadius: 5.9,
            highlightBodies,
            onHoverBody: (h) =>
              setHoverInfo(
                h ? { body: h.body, x: mousePos.current.x, y: mousePos.current.y } : null
              ),
            onSelectBody: setSelectedBody,
          }}
          subnav={chapterBar}
          panelHeader={dockTabs}
          panel={dockMode === 'ask' ? askPanel : readingPanel}
          overlay={detailOverlay}
        />
      )}
    </div>
  );
}

export default ChartReaderPage;
