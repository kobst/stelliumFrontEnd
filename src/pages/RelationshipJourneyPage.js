import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  fetchRelationshipAnalysis,
  fetchUser,
  getUserCompositeCharts,
} from '../Utilities/api';
import { ChartScene } from '../UI/shared/chartScene';
import {
  fromSceneBodyName,
  toChartSceneAspects,
  toChartScenePlacements,
  toSceneBodyNames,
  toSynastrySceneAspects,
} from '../Utilities/chartSceneAdapter';
import { mentionsIn } from '../UI/journey/AnalysisFlow';
import { getRelationshipCardSummary } from '../Utilities/relationshipSummary';
import GravityChatPanel from '../UI/gravityChat/GravityChatPanel';
import ChapterHeader from '../UI/journey/ChapterHeader';
import DetailNavigator from '../UI/journey/DetailNavigator';
import { PlanetIcon } from '../UI/shared/AstroIcon';
import './ChartReaderPage.css';
import './BirthChartJourneyPage.css';
import './RelationshipJourneyPage.css';

const CHAPTERS = [
  { id: 'overview', label: 'Overview' },
  { id: 'skies', label: 'Two Skies' },
  { id: 'synastry', label: 'Synastry' },
  { id: 'analysis', label: '360 Analysis' },
  { id: 'composite', label: 'Composite' },
  { id: 'ask', label: 'Gravity Chat' },
];

const CLUSTERS = [
  { key: 'Harmony', tone: '#ff8aae' },
  { key: 'Passion', tone: '#ff9d6a' },
  { key: 'Connection', tone: '#7ec9e0' },
  { key: 'Stability', tone: '#65cfa1' },
  { key: 'Growth', tone: '#b48ae8' },
];

const PLACEMENT_ORDER = [
  'Ascendant', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Midheaven', 'Node',
];

const firstName = (value) => String(value || '').trim().split(/\s+/)[0] || 'Partner';

const paragraphs = (value) =>
  String(value || '')
    .split(/\n\s*\n|\n/)
    .map((part) => part.trim())
    .filter(Boolean);

const orderedPlacements = (planets) =>
  [...(planets || [])].sort((a, b) => {
    const ai = PLACEMENT_ORDER.indexOf(a.name);
    const bi = PLACEMENT_ORDER.indexOf(b.name);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

const chapterFromHash = () => {
  const hash = window.location.hash.replace('#', '');
  return CHAPTERS.some((chapter) => chapter.id === hash) ? hash : 'overview';
};

function RelationshipChart({
  relationship,
  fitNonce,
  blend,
  comp = 0,
  highlightA,
  highlightB,
  onHoverBody,
  onSelectBody,
  onSelectAspect,
  compact = false,
  showRecenter = true,
  onRecenter,
}) {
  const pairFitRadius = window.innerWidth > 820 ? 11.4 : 11;
  return (
    <div className={`birth-journey-chart relationship-reader-chart${compact ? ' birth-journey-chart--compact' : ''}`}>
      <div className="birth-journey-chart__scene">
        <ChartScene
          natal={[]}
          natalAspects={[]}
          fitRadius={blend < 0.5 ? pairFitRadius : 6.2}
          fitNonce={fitNonce}
          disableZoom
          selectedBody={null}
          onSelectAspect={onSelectAspect}
          relationship={{
            ...relationship,
            blend,
            comp,
            highlightA,
            highlightB,
            onHoverBody,
            onSelectBody,
          }}
        />
      </div>
      {showRecenter && (
        <button
          type="button"
          className="birth-journey-chart__recenter"
          title="Recenter the relationship chart"
          onClick={onRecenter}
        >
          <span aria-hidden="true">⌖</span>
          <span>Recenter</span>
        </button>
      )}
    </div>
  );
}

function RelationshipFooter({ activeChapter, onNavigate }) {
  const index = CHAPTERS.findIndex((chapter) => chapter.id === activeChapter);
  const previous = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];
  return (
    <footer className="birth-journey-footer">
      {previous ? (
        <button type="button" className="birth-journey-footer__back" onClick={() => onNavigate(previous.id)}>
          ← {previous.label}
        </button>
      ) : <span />}
      {next && (
        <button type="button" className="birth-journey-footer__next" onClick={() => onNavigate(next.id)}>
          Continue to {next.label} →
        </button>
      )}
    </footer>
  );
}

function RelationshipJourneyPage() {
  const { userId, compositeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChapter, setActiveChapter] = useState(chapterFromHash);
  const [activePartner, setActivePartner] = useState('a');
  const [activePillar, setActivePillar] = useState('Harmony');
  const [activeCompositeBody, setActiveCompositeBody] = useState(null);
  const [hoverAB, setHoverAB] = useState(null);
  const [pinnedAB, setPinnedAB] = useState(null);
  const [showAllLines, setShowAllLines] = useState(false);
  const [fitNonce, setFitNonce] = useState(0);
  const [askSelection, setAskSelection] = useState([]);
  const [askExternalToggle, setAskExternalToggle] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const composites = await getUserCompositeCharts(userId);
        const found = composites?.find((item) => item._id === compositeId);
        if (!found) {
          if (!cancelled) setError('Relationship not found');
          return;
        }
        const [analysis, subjectA, subjectB] = await Promise.all([
          fetchRelationshipAnalysis(compositeId).catch(() => null),
          found.userA_id ? fetchUser(found.userA_id).catch(() => null) : null,
          found.userB_id ? fetchUser(found.userB_id).catch(() => null) : null,
        ]);
        if (cancelled) return;
        setRelationship({
          ...found,
          ...(analysis || {}),
          ...(subjectA?.birthChart && { userA_birthChart: subjectA.birthChart }),
          ...(subjectB?.birthChart && { userB_birthChart: subjectB.birthChart }),
          userA_romanticBlurb: subjectA?.relationshipAppProfile?.romanticProfileBlurb || null,
          userB_romanticBlurb: subjectB?.relationshipAppProfile?.romanticProfileBlurb || null,
        });
      } catch (fetchError) {
        if (!cancelled) setError('Failed to load relationship data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [compositeId, userId]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-chapter="${activeChapter}"]`)?.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior: 'auto',
      });
    });
  }, [activeChapter]);

  const aName = firstName(relationship?.userA_name);
  const bName = firstName(relationship?.userB_name);
  const aPlanets = useMemo(
    () => relationship?.userA_birthChart?.planets || [],
    [relationship?.userA_birthChart?.planets]
  );
  const bPlanets = useMemo(
    () => relationship?.userB_birthChart?.planets || [],
    [relationship?.userB_birthChart?.planets]
  );
  const compositePlanets = useMemo(
    () => relationship?.compositeChart?.planets || [],
    [relationship?.compositeChart?.planets]
  );
  const aPlacements = useMemo(() => toChartScenePlacements(aPlanets), [aPlanets]);
  const bPlacements = useMemo(() => toChartScenePlacements(bPlanets), [bPlanets]);
  const synastryAspects = useMemo(
    () => toSynastrySceneAspects(relationship?.synastryAspects),
    [relationship?.synastryAspects]
  );
  const compositePlacements = useMemo(
    () => toChartScenePlacements(compositePlanets),
    [compositePlanets]
  );
  const compositeAspects = useMemo(
    () => toChartSceneAspects(relationship?.compositeChart?.aspects),
    [relationship?.compositeChart?.aspects]
  );
  const knownNames = useMemo(
    () => [...new Set([...aPlanets, ...bPlanets].map((planet) => planet.name))],
    [aPlanets, bPlanets]
  );

  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;
  const archetype = useMemo(() => getRelationshipCardSummary(overall), [overall]);
  const scoredItems = useMemo(
    () => relationship?.scoredItems || relationship?.clusterAnalysis?.scoredItems || relationship?.clusterScoring?.scoredItems || [],
    [relationship]
  );
  const completeAnalysis = relationship?.completeAnalysis;

  const clusterPanels = useCallback((key) => {
    if (!completeAnalysis) return null;
    const entry = Object.entries(completeAnalysis).find(([name]) =>
      name.toLowerCase().includes(key.toLowerCase())
    );
    const value = entry?.[1];
    if (!value) return null;
    if (typeof value === 'string') return { synthesis: value };
    const source = value.synastry || value;
    const panels = {
      support: source.supportPanel || null,
      challenge: source.challengePanel || null,
      synthesis: source.synthesisPanel || value.analysis || value.interpretation || null,
    };
    return panels.support || panels.challenge || panels.synthesis ? panels : null;
  }, [completeAnalysis]);

  const pillarData = useMemo(() => CLUSTERS.map((cluster) => {
    const score = Math.round(clusters?.[cluster.key]?.score || 0);
    const factors = scoredItems
      .map((item) => {
        const contribution = item.clusterContributions?.find((entry) => entry.cluster === cluster.key);
        return contribution?.score ? { ...item, clusterScore: contribution.score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => Math.abs(b.clusterScore) - Math.abs(a.clusterScore))
      .slice(0, 5);
    return { ...cluster, score, factors, panels: clusterPanels(cluster.key) };
  }), [clusterPanels, clusters, scoredItems]);

  const synastryRows = useMemo(() => [...synastryAspects]
    .sort((a, b) => a.orb - b.orb)
    .map((aspect) => ({
      ...aspect,
      nameA: fromSceneBodyName(aspect.bodyA),
      nameB: fromSceneBodyName(aspect.bodyB),
    })), [synastryAspects]);

  const compositeRows = useMemo(() => (relationship?.compositeChart?.aspects || [])
    .map((aspect) => ({
      nameA: aspect.aspectingPlanet || aspect.planet1,
      nameB: aspect.aspectedPlanet || aspect.planet2,
      type: aspect.aspectType,
      orb: Number(aspect.orb),
    }))
    .filter((aspect) => aspect.nameA && aspect.nameB && Number.isFinite(aspect.orb))
    .sort((a, b) => a.orb - b.orb), [relationship?.compositeChart?.aspects]);

  const partnerItems = useMemo(() => [
    { id: 'a', title: aName, payload: { name: aName, planets: aPlanets, blurb: relationship?.userA_romanticBlurb, side: 'a' } },
    { id: 'b', title: bName, payload: { name: bName, planets: bPlanets, blurb: relationship?.userB_romanticBlurb, side: 'b' } },
  ], [aName, aPlanets, bName, bPlanets, relationship]);

  const pillarItems = useMemo(() => pillarData.map((pillar) => ({
    id: pillar.key,
    title: pillar.key,
    payload: pillar,
  })), [pillarData]);

  const compositeItems = useMemo(() => orderedPlacements(compositePlanets).map((planet) => ({
    id: planet.name,
    title: planet.name,
    payload: planet,
  })), [compositePlanets]);

  useEffect(() => {
    if (!activeCompositeBody && compositeItems[0]) setActiveCompositeBody(compositeItems[0].id);
  }, [activeCompositeBody, compositeItems]);

  const applyChapterState = useCallback((chapterId) => {
    setActiveChapter(chapterId);
    setHoverAB(null);
    setPinnedAB(null);
  }, []);

  const goToChapter = useCallback((chapterId) => {
    applyChapterState(chapterId);
    if (window.location.hash !== `#${chapterId}`) {
      navigate(
        { pathname: location.pathname, search: location.search, hash: `#${chapterId}` },
        { state: location.state }
      );
    }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    window.requestAnimationFrame(() => {
      document.querySelector(`[data-chapter="${chapterId}"]`)?.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior: reduced ? 'auto' : 'smooth',
      });
    });
  }, [applyChapterState, location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    const chapterId = chapterFromHash();
    if (chapterId !== activeChapter) {
      applyChapterState(chapterId);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeChapter, applyChapterState, location.hash]);

  const pinFocus = useCallback((key, a = [], b = []) => {
    setPinnedAB((current) => current?.key === key ? null : { key, a, b });
  }, []);

  const focusProps = (key, a = [], b = []) => ({
    onMouseEnter: () => setHoverAB({ a, b }),
    onMouseLeave: () => setHoverAB(null),
    onFocus: () => setHoverAB({ a, b }),
    onBlur: () => setHoverAB(null),
    onClick: () => pinFocus(key, a, b),
    'aria-pressed': pinnedAB?.key === key,
  });

  const activePillarData = pillarData.find((pillar) => pillar.key === activePillar);
  const chapterFocus = useMemo(() => {
    if (activeChapter === 'skies') {
      const names = (activePartner === 'a' ? aPlanets : bPlanets).map((planet) => planet.name);
      return activePartner === 'a' ? { a: names, b: [] } : { a: [], b: names };
    }
    if (activeChapter === 'analysis' && activePillarData) {
      const names = [...new Set(activePillarData.factors.flatMap((item) =>
        mentionsIn(item.description || item.reason || item.label || '', knownNames)
      ))];
      return { a: names, b: names };
    }
    if (activeChapter === 'composite' && activeCompositeBody) {
      return { a: [activeCompositeBody], b: [] };
    }
    return null;
  }, [aPlanets, activeChapter, activeCompositeBody, activePartner, activePillarData, bPlanets, knownNames]);

  const askFocus = useMemo(() => {
    const result = { a: [], b: [] };
    askSelection.forEach((element) => {
      const payload = element.payload || element;
      if (payload.chartFocus) {
        result.a.push(...(payload.chartFocus.a || []));
        result.b.push(...(payload.chartFocus.b || []));
        return;
      }
      const names = mentionsIn(
        `${element.label || ''} ${payload.description || payload.reason || ''}`,
        knownNames
      );
      result.a.push(...names);
      result.b.push(...names);
    });
    return { a: [...new Set(result.a)], b: [...new Set(result.b)] };
  }, [askSelection, knownNames]);

  const focus = useMemo(
    () => hoverAB || pinnedAB || (activeChapter === 'ask' ? askFocus : chapterFocus) || {},
    [activeChapter, askFocus, chapterFocus, hoverAB, pinnedAB]
  );
  const highlightA = focus.a?.length ? toSceneBodyNames(focus.a) : undefined;
  const highlightB = focus.b?.length ? toSceneBodyNames(focus.b) : undefined;
  const sceneBlend = activeChapter === 'overview' || activeChapter === 'skies' ? 0 : 1;
  const sceneComp = activeChapter === 'composite' ? 1 : 0;
  const visibleSynastryAspects = useMemo(() => {
    if (showAllLines || synastryAspects.length <= 10) return synastryAspects;
    const top = new Set([...synastryAspects].sort((a, b) => a.orb - b.orb).slice(0, 10));
    if (focus.a?.length || focus.b?.length) {
      const namesA = new Set(toSceneBodyNames(focus.a || []) || []);
      const namesB = new Set(toSceneBodyNames(focus.b || []) || []);
      synastryAspects.forEach((aspect) => {
        if (namesA.has(aspect.bodyA) && namesB.has(aspect.bodyB)) top.add(aspect);
      });
    }
    return synastryAspects.filter((aspect) => top.has(aspect));
  }, [focus, showAllLines, synastryAspects]);

  const baseScene = {
    a: aPlacements,
    b: bPlacements,
    nameA: aName,
    nameB: bName,
    compositePlacements,
    compositeAspects,
    synastryAspects: visibleSynastryAspects,
  };

  const handleSceneBody = useCallback((placement, side) => {
    const name = fromSceneBodyName(placement.body);
    if (!name) return;
    pinFocus(`chart-${side}-${name}`, side === 'a' ? [name] : [], side === 'b' ? [name] : []);
  }, [pinFocus]);

  const toggleAskContext = useCallback((element) => {
    setAskExternalToggle({ element, nonce: `${Date.now()}-${Math.random()}` });
  }, []);

  const handleAskBody = useCallback((placement, side) => {
    const name = fromSceneBodyName(placement.body);
    if (!name) return;
    const owner = side === 'a' ? aName : bName;
    const sourcePlanet = (side === 'a' ? aPlanets : bPlanets).find((planet) => planet.name === name);
    const payload = {
      source: 'synastryHousePlacement',
      type: 'relationship-placement',
      description: `${owner}'s ${name}${sourcePlanet?.sign ? ` in ${sourcePlanet.sign}` : ''}`,
      owner,
      planet: name,
      chartFocus: side === 'a' ? { a: [name], b: [] } : { a: [], b: [name] },
    };
    toggleAskContext({
      group: 'relationship',
      type: payload.type,
      key: `ask-${side}-${placement.body}`,
      label: payload.description,
      meta: payload.source,
      payload,
    });
  }, [aName, aPlanets, bName, bPlanets, toggleAskContext]);

  const handleAskAspect = useCallback((aspect) => {
    const nameA = fromSceneBodyName(aspect.bodyA);
    const nameB = fromSceneBodyName(aspect.bodyB);
    if (!nameA || !nameB) return;
    const payload = {
      source: 'synastry',
      type: 'relationship-aspect',
      description: `${aName}'s ${nameA} ${aspect.type} ${bName}'s ${nameB}`,
      aspectType: aspect.type,
      orb: aspect.orb,
      chartFocus: { a: [nameA], b: [nameB] },
    };
    toggleAskContext({
      group: 'relationship',
      type: payload.type,
      key: `ask-aspect-${aspect.bodyA}-${aspect.type}-${aspect.bodyB}`,
      label: payload.description,
      meta: payload.source,
      payload,
    });
  }, [aName, bName, toggleAskContext]);

  if (loading || error) {
    return (
      <div className="chart-reader-page">
        <div className="chart-reader-loading">{error || 'Loading relationship…'}</div>
      </div>
    );
  }

  const overallScore = Number.isFinite(overall) ? overall : archetype.score;
  const overallLabel = Number.isFinite(overallScore) ? `Pattern index · ${Math.round(overallScore)}%` : null;
  const chart = (
    <RelationshipChart
      relationship={baseScene}
      fitNonce={fitNonce}
      blend={sceneBlend}
      comp={sceneComp}
      highlightA={highlightA}
      highlightB={highlightB}
      onHoverBody={(placement, side) => {
        if (!placement) setHoverAB(null);
        else {
          const name = fromSceneBodyName(placement.body);
          setHoverAB(side === 'a' ? { a: [name], b: [] } : { a: [], b: [name] });
        }
      }}
      onSelectBody={handleSceneBody}
      onRecenter={() => setFitNonce((value) => value + 1)}
    />
  );
  const compactChart = (
    <RelationshipChart
      relationship={baseScene}
      fitNonce={fitNonce}
      blend={0}
      compact
      showRecenter={false}
    />
  );
  const askChart = (
    <RelationshipChart
      relationship={baseScene}
      fitNonce={fitNonce}
      blend={1}
      highlightA={askFocus.a.length ? toSceneBodyNames(askFocus.a) : undefined}
      highlightB={askFocus.b.length ? toSceneBodyNames(askFocus.b) : undefined}
      onSelectBody={handleAskBody}
      onSelectAspect={handleAskAspect}
      onRecenter={() => setFitNonce((value) => value + 1)}
    />
  );

  return (
    <div className="birth-journey relationship-reader" style={{ '--birth-nebula': 'url(/NewNebulae.png)' }}>
      <header className="birth-journey-header">
        <div className="birth-journey-header__main">
          <button
            type="button"
            className="birth-journey-brand"
            onClick={() => navigate(`/dashboard/${userId}`, { state: { section: 'home' } })}
            title="Go to Horoscope"
          >
            <span aria-hidden="true">☼</span> Astral Gravity
          </button>
          <div className="birth-journey-identity">
            <strong>{aName} <span className="rj-amp">&amp;</span> {bName}</strong>
            {overallLabel && <span>{overallLabel}</span>}
          </div>
          <button type="button" className="birth-journey-ask" onClick={() => goToChapter('ask')}>
            <span aria-hidden="true">✦</span> Gravity Chat
          </button>
        </div>
        <nav className="birth-journey-nav relationship-reader-nav" aria-label="Relationship reading chapters">
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

      <main className="birth-journey-main">
        {activeChapter === 'overview' && (
          <article className="birth-journey-chapter">
            <ChapterHeader label="Overview" />
            <div className="birth-journey-split birth-journey-split--overview">
              <section className="birth-journey-copy">
                <h1>{archetype.cardHeadline || `${aName} and ${bName}`}</h1>
                {archetype.blurb && <p className="relationship-reader-lede">{archetype.blurb}</p>}
                {paragraphs(relationship?.initialOverview || clusterPanels('overview')?.synthesis)
                  .slice(0, 4)
                  .map((text, index) => <p key={index}>{text}</p>)}
                {overallLabel && (
                  <p className="relationship-reader-note">
                    The pattern index summarizes detected themes. It is context, not a verdict on the relationship.
                  </p>
                )}
                <button type="button" className="birth-journey-primary" onClick={() => goToChapter('skies')}>
                  Meet the two skies →
                </button>
              </section>
              {compactChart}
            </div>
          </article>
        )}

        {activeChapter === 'skies' && (
          <article className="birth-journey-chapter">
            <DetailNavigator
              items={partnerItems}
              activeId={activePartner}
              groupLabel="Partner charts"
              chapterLabel="Two Skies"
              chapterHelper="Read each chart before bringing them together"
              onActiveChange={(id) => {
                setActivePartner(id);
                setHoverAB(null);
                setPinnedAB(null);
              }}
              renderItem={({ payload: partner }) => (
                <div className="birth-journey-split birth-journey-split--workspace">
                  {chart}
                  <section className="birth-journey-copy relationship-reader-copy">
                    <h1 data-detail-heading tabIndex="-1">{partner.name}&rsquo;s sky</h1>
                    {partner.blurb && <p className="relationship-reader-lede">{partner.blurb}</p>}
                    <p>Select a placement to locate it on the chart and hold its emphasis.</p>
                    <div className="relationship-placement-list">
                      {orderedPlacements(partner.planets).map((planet) => (
                        <button
                          type="button"
                          key={planet.name}
                          className={pinnedAB?.key === `${partner.side}-${planet.name}` ? 'on' : ''}
                          {...focusProps(
                            `${partner.side}-${planet.name}`,
                            partner.side === 'a' ? [planet.name] : [],
                            partner.side === 'b' ? [planet.name] : []
                          )}
                        >
                          <PlanetIcon name={planet.name} size={17} />
                          <strong>{planet.name}</strong>
                          <span>{planet.sign}</span>
                          <small>{planet.house ? `House ${planet.house}` : ''}</small>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            />
          </article>
        )}

        {activeChapter === 'synastry' && (
          <article className="birth-journey-chapter">
            <ChapterHeader label="Synastry" rightSlot={`${synastryRows.length} cross-chart aspects`} />
            <div className="birth-journey-split birth-journey-split--workspace relationship-reader-direct">
              {chart}
              <section className="birth-journey-copy relationship-reader-copy">
                <h1>Where the two charts meet.</h1>
                <p>
                  These are the strongest conversations between {aName}&rsquo;s chart and {bName}&rsquo;s. Hover to preview a thread; click to keep it isolated.
                </p>
                {synastryAspects.length > 10 && (
                  <button
                    type="button"
                    className="relationship-line-toggle"
                    aria-pressed={showAllLines}
                    onClick={() => setShowAllLines((value) => !value)}
                  >
                    {showAllLines ? 'Show the 10 tightest lines' : `Draw all ${synastryAspects.length} lines`}
                  </button>
                )}
                <div className="relationship-aspect-list">
                  {synastryRows.map((aspect, index) => (
                    <button
                      type="button"
                      key={`${aspect.bodyA}-${aspect.type}-${aspect.bodyB}-${index}`}
                      className={pinnedAB?.key === `syn-${index}` ? 'on' : ''}
                      {...focusProps(`syn-${index}`, [aspect.nameA], [aspect.nameB])}
                    >
                      <span className="relationship-aspect-list__type">{aspect.type}</span>
                      <strong>{aName}&rsquo;s {aspect.nameA}</strong>
                      <span aria-hidden="true">→</span>
                      <strong>{bName}&rsquo;s {aspect.nameB}</strong>
                      <small>{Number(aspect.orb).toFixed(1)}°</small>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </article>
        )}

        {activeChapter === 'analysis' && pillarItems.length > 0 && (
          <article className="birth-journey-chapter">
            <DetailNavigator
              items={pillarItems}
              activeId={activePillar}
              groupLabel="Relationship dimensions"
              chapterLabel="360 Analysis"
              chapterHelper="Five dimensions of the same relationship"
              className="detail-navigator--relationship-analysis"
              onActiveChange={(id) => {
                setActivePillar(id);
                setHoverAB(null);
                setPinnedAB(null);
              }}
              renderLabel={(item, selected) => (
                <>
                  <span>{item.title}</span>
                  {selected && <small>{item.payload.score}%</small>}
                </>
              )}
              renderItem={({ payload: pillar }) => (
                <div className="birth-journey-split birth-journey-split--analysis-detail">
                  {chart}
                  <section className="birth-journey-copy relationship-reader-copy" style={{ '--relationship-tone': pillar.tone }}>
                    <div className="relationship-dimension-heading">
                      <h1 data-detail-heading tabIndex="-1">{pillar.key}</h1>
                      <strong>{pillar.score}%</strong>
                    </div>
                    <p>Key factors light the placements and threads that support this dimension.</p>
                    <div className="relationship-factor-list">
                      {pillar.factors.map((factor, index) => {
                        const names = mentionsIn(factor.description || factor.reason || factor.label || '', knownNames);
                        return (
                          <button
                            type="button"
                            key={index}
                            className={pinnedAB?.key === `factor-${pillar.key}-${index}` ? 'on' : ''}
                            {...focusProps(`factor-${pillar.key}-${index}`, names, names)}
                          >
                            <span>{factor.description || factor.reason || factor.label}</span>
                            <strong className={factor.clusterScore < 0 ? 'negative' : ''}>
                              {factor.clusterScore > 0 ? '+' : ''}{Math.round(factor.clusterScore)}
                            </strong>
                          </button>
                        );
                      })}
                    </div>
                    {[
                      ['Support patterns', pillar.panels?.support, 'support'],
                      ['Growth challenges', pillar.panels?.challenge, 'challenge'],
                      ['Synthesis', pillar.panels?.synthesis, 'synthesis'],
                    ].map(([label, content, kind]) => content && (
                      <section key={kind} className={`relationship-reading-block relationship-reading-block--${kind}`}>
                        <h2>{label}</h2>
                        {paragraphs(content).map((text, index) => <p key={index}>{text}</p>)}
                      </section>
                    ))}
                  </section>
                </div>
              )}
            />
          </article>
        )}

        {activeChapter === 'composite' && compositeItems.length > 0 && (
          <article className="birth-journey-chapter">
            <DetailNavigator
              items={compositeItems}
              activeId={activeCompositeBody || compositeItems[0].id}
              groupLabel="Composite placements"
              chapterLabel="Composite"
              chapterHelper="The relationship's chart, one placement at a time"
              className="detail-navigator--relationship-composite"
              onActiveChange={(id) => {
                setActiveCompositeBody(id);
                setHoverAB(null);
                setPinnedAB(null);
              }}
              renderLabel={(item) => (
                <>
                  <PlanetIcon name={item.title} size={17} />
                  <span>{item.title}</span>
                </>
              )}
              renderItem={({ payload: planet }) => {
                const bodyAspects = compositeRows.filter((aspect) =>
                  aspect.nameA === planet.name || aspect.nameB === planet.name
                );
                return (
                  <div className="birth-journey-split birth-journey-split--workspace">
                    {chart}
                    <section className="birth-journey-copy relationship-reader-copy">
                      <h1 data-detail-heading tabIndex="-1">Composite {planet.name} in {planet.sign}</h1>
                      <p>
                        This placement belongs to the relationship itself: the midpoint created by both charts working as one system.
                      </p>
                      {paragraphs(clusterPanels('composite')?.synthesis).slice(0, 3).map((text, index) => (
                        <p key={index}>{text}</p>
                      ))}
                      {bodyAspects.length > 0 && (
                        <section className="relationship-composite-aspects">
                          <h2>Connected aspects</h2>
                          {bodyAspects.map((aspect, index) => {
                            const other = aspect.nameA === planet.name ? aspect.nameB : aspect.nameA;
                            return (
                              <button
                                type="button"
                                key={`${other}-${aspect.type}-${index}`}
                                className={pinnedAB?.key === `composite-${planet.name}-${index}` ? 'on' : ''}
                                {...focusProps(`composite-${planet.name}-${index}`, [planet.name, other], [])}
                              >
                                <PlanetIcon name={other} size={16} />
                                <strong>{planet.name} {String(aspect.type).toLowerCase()} {other}</strong>
                                <small>{aspect.orb.toFixed(1)}°</small>
                              </button>
                            );
                          })}
                        </section>
                      )}
                    </section>
                  </div>
                );
              }}
            />
          </article>
        )}

        <article className="birth-journey-chapter birth-journey-askpage" hidden={activeChapter !== 'ask'}>
          <ChapterHeader label="Gravity Chat" />
          <div className="birth-ask-workspace">
            {activeChapter === 'ask' && askChart}
            <section className="birth-ask-chat" aria-label="Gravity Chat conversation">
              <GravityChatPanel
                variant="dock"
                isOpen={activeChapter === 'ask'}
                onClose={() => goToChapter('composite')}
                contentType="relationship"
                contentId={compositeId}
                relationshipScoredItems={scoredItems}
                externalToggle={askExternalToggle}
                onSelectionChange={setAskSelection}
                contextLabel="About this relationship"
                placeholderText="Ask about this relationship…"
                suggestedQuestions={[
                  'What are our relationship strengths?',
                  'How can we improve our communication?',
                  'What challenges should we be aware of?',
                ]}
              />
            </section>
          </div>
        </article>

        <RelationshipFooter activeChapter={activeChapter} onNavigate={goToChapter} />
      </main>
    </div>
  );
}

export default RelationshipJourneyPage;
