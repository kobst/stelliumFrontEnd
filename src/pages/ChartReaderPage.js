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
} from '../Utilities/chartSceneAdapter';
import OverviewTab from '../UI/dashboard/chartTabs/OverviewTab';
import DominancePatternsTab from '../UI/dashboard/chartTabs/DominancePatternsTab';
import PlanetsTab from '../UI/dashboard/chartTabs/PlanetsTab';
import AnalysisTab from '../UI/dashboard/chartTabs/AnalysisTab';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import './ChartReaderPage.css';

/**
 * Reader layout for the birth chart (PR 2a): the analysis sections
 * composed as chapters of one continuous read, with the 3D chart as a
 * sticky margin that follows the scroll. The classic tabbed page at
 * /dashboard/:userId/chart/:chartId is untouched.
 */

// Which natal bodies each chapter emphasizes in the margin sky.
// Chapters without a natural set leave the sky neutral for now; the
// per-section hover grammar lands in the next PR.
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
  const chapterRefs = useRef({});

  // emphasis channels from the section components (backend body names):
  // transient hover (chips, aspect rows) wins over the Planets picker's
  // persistent selection, which wins over the chapter default
  const [hoverNames, setHoverNames] = useState(null);
  const [planetsSelectionNames, setPlanetsSelectionNames] = useState(null);

  // expand-in-place: the same scene instance, just given the viewport
  const [skyExpanded, setSkyExpanded] = useState(false);
  useEffect(() => {
    if (!skyExpanded) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSkyExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [skyExpanded]);

  // margin sky data
  const natal = useMemo(
    () => toChartScenePlacements(birthChart.planets),
    [birthChart.planets]
  );
  const natalAspects = useMemo(
    () => toChartSceneAspects(birthChart.aspects),
    [birthChart.aspects]
  );

  const highlightBodies = useMemo(() => {
    if (hoverNames) return toSceneBodyNames(hoverNames);
    if (activeChapter === 'planets' && planetsSelectionNames) {
      return toSceneBodyNames(planetsSelectionNames);
    }
    const chapter = CHAPTERS.find((c) => c.id === activeChapter);
    return chapter?.bodies || undefined;
  }, [hoverNames, planetsSelectionNames, activeChapter]);

  // the chart follows the scroll
  useEffect(() => {
    const sections = Object.values(chapterRefs.current).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveChapter(visible.target.dataset.chapter);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.2, 0.5] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
    // re-observe once content is actually rendered
  }, [loading]);

  const scrollToChapter = (id) => {
    chapterRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isCelebrity =
    chart?.isCelebrity === true || chart?.kind === 'celebrity' || chart?.isReadOnly === true;
  const canUseAskStellium = isAnalysisComplete;

  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading) {
    return (
      <div className="chart-reader-page">
        <div className="chart-reader-loading">Loading chart…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-reader-page">
        <div className="chart-reader-loading">{error}</div>
      </div>
    );
  }

  const activeLabel = CHAPTERS.find((c) => c.id === activeChapter)?.label;

  const chapterContent = {
    overview: (
      <OverviewTab
        basicAnalysis={basicAnalysis}
        chartId={chartId}
        birthChart={birthChart}
        canUseAskStellium={canUseAskStellium}
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
        onNavigateToAnalysis={() => scrollToChapter('analysis')}
        creditCost={CREDIT_COSTS.FULL_NATAL}
        creditsRemaining={entitlements.credits?.total}
        chartId={chartId}
        canUseAskStellium={canUseAskStellium}
        onHoverBodies={setHoverNames}
      />
    ),
    planets: (
      <PlanetsTab
        birthChart={birthChart}
        basicAnalysis={basicAnalysis}
        hasAnalysis={hasAnalysis}
        onNavigateToAnalysis={() => scrollToChapter('analysis')}
        creditCost={CREDIT_COSTS.FULL_NATAL}
        creditsRemaining={entitlements.credits?.total}
        chartId={chartId}
        canUseAskStellium={canUseAskStellium}
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

  return (
    <div className={`chart-reader-page${skyExpanded ? ' chart-reader-page--sky-open' : ''}`}>
      <div className="chart-reader-grid">
        <aside className="chart-reader-toc">
          <div className="chart-reader-stick">
            <button
              className="chart-reader-back"
              onClick={() => navigate(`/dashboard/${userId}/chart/${chartId}`)}
            >
              ← Classic view
            </button>
            <div className="chart-reader-subject">
              <div className="chart-reader-subject-name">
                {chart?.firstName
                  ? `${chart.firstName} ${chart.lastName || ''}`.trim()
                  : 'Birth Chart'}
              </div>
              <div className="chart-reader-subject-meta">The 360 Reading</div>
            </div>
            <nav className="chart-reader-chapters">
              {CHAPTERS.map((c, i) => (
                <button
                  key={c.id}
                  className={activeChapter === c.id ? 'on' : ''}
                  onClick={() => scrollToChapter(c.id)}
                >
                  {c.label}
                  <span className="num">{['I', 'II', 'III', 'IV'][i]}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="chart-reader-book">
          {CHAPTERS.map((c) => (
            <section
              key={c.id}
              data-chapter={c.id}
              className="chart-reader-chapter"
              ref={(el) => {
                chapterRefs.current[c.id] = el;
              }}
            >
              {chapterContent[c.id]}
            </section>
          ))}
        </main>

        <aside className="chart-reader-sky">
          <div className="chart-reader-stick">
            <div className={`chart-reader-sky-card${skyExpanded ? ' chart-reader-sky-card--expanded' : ''}`}>
              <div className="chart-reader-sky-head">
                <span>The Sky · Natal</span>
                <button
                  className="chart-reader-sky-expand"
                  onClick={() => setSkyExpanded((v) => !v)}
                >
                  {skyExpanded ? 'Collapse ⤡' : 'Expand ⤢'}
                </button>
              </div>
              <div className="chart-reader-sky-holder">
                {natal.length > 0 && (
                  <ChartScene
                    natal={natal}
                    natalAspects={natalAspects}
                    highlightBodies={highlightBodies}
                    topDown
                  />
                )}
              </div>
              <div className="chart-reader-sky-foot">Reading: {activeLabel}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ChartReaderPage;
