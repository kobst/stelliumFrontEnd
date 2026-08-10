import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchRelationshipAnalysis,
  fetchUser,
  getUserCompositeCharts,
} from '../Utilities/api';
import { formatCalendarDate } from '../Utilities/dateFormatting';
import { getRelationshipCardSummary } from '../Utilities/relationshipSummary';
import {
  fromSceneBodyName,
  toChartSceneAspects,
  toChartScenePlacements,
  toSceneBodyNames,
  toSynastrySceneAspects,
} from '../Utilities/chartSceneAdapter';
import { ChartScene } from '../UI/shared/chartScene';
import AskStelliumPanel from '../UI/askStellium/AskStelliumPanel';
import InkNav from '../UI/ink/InkNav';
import '../styles/ink.css';
import './InkRelationshipPage.css';

const TABS = [
  { id: 'overview', roman: 'i.', label: 'Overview' },
  { id: 'synastry', roman: 'ii.', label: 'Synastry' },
  { id: 'composite', roman: 'iii.', label: 'Composite' },
  { id: 'analysis', roman: 'iv.', label: '360 Analysis' },
  { id: 'ask', roman: 'v.', label: 'Gravity Chat' },
];

const CLUSTERS = [
  { key: 'Harmony', tone: '#b08d3e' },
  { key: 'Passion', tone: '#a55850' },
  { key: 'Connection', tone: '#4a6e9e' },
  { key: 'Stability', tone: '#557665' },
  { key: 'Growth', tone: '#6f5c98' },
];

const HARMONIOUS_ASPECTS = new Set(['trine', 'sextile']);
const DYNAMIC_ASPECTS = new Set(['square', 'opposition']);

const firstName = (value) => String(value || '').trim().split(/\s+/)[0] || 'Partner';

const paragraphs = (value) => String(value || '')
  .split(/\n\s*\n|\n/)
  .map((part) => part.replace(/\*\*/g, '').trim())
  .filter(Boolean);

const finiteNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
};

const formatDate = (value, options = {}) => {
  if (!value) return '';
  return formatCalendarDate(value, 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};

const getPlanet = (chart, name) => chart?.planets?.find((planet) => planet?.name === name);

const getAscendantSign = (chart) => {
  const planet = getPlanet(chart, 'Ascendant');
  if (planet?.sign) return planet.sign;
  if (chart?.ascendant?.sign) return chart.ascendant.sign;
  return chart?.houses?.find((house) => Number(house?.house) === 1)?.sign || '';
};

const bigThree = (chart) => ({
  sun: getPlanet(chart, 'Sun')?.sign || '',
  moon: getPlanet(chart, 'Moon')?.sign || '',
  ascendant: getAscendantSign(chart),
});

const placementSummary = (chart) => {
  const placements = bigThree(chart);
  return [
    placements.sun && `☉ Sun in ${placements.sun}`,
    placements.moon && `☽ Moon in ${placements.moon}`,
    placements.ascendant && `↑ Ascendant in ${placements.ascendant}`,
  ].filter(Boolean);
};

const partnerBirthLine = (relationship, subject, side) => {
  const prefix = `user${side.toUpperCase()}`;
  const date = relationship?.[`${prefix}_dateOfBirth`]
    || relationship?.[`${prefix}_birthDate`]
    || subject?.dateOfBirth
    || subject?.birthDate;
  const place = relationship?.[`${prefix}_placeOfBirth`]
    || relationship?.[`${prefix}_birthPlace`]
    || subject?.placeOfBirth
    || subject?.birthPlace;
  return [formatDate(date), place].filter(Boolean).join(' · ');
};

const aspectKind = (type) => {
  const normalized = String(type || '').toLowerCase();
  if (HARMONIOUS_ASPECTS.has(normalized)) return 'harmonious';
  if (DYNAMIC_ASPECTS.has(normalized)) return 'dynamic';
  if (normalized === 'conjunction') return 'binding';
  return 'mixed';
};

const factorLabel = (factor) => factor?.description || factor?.reason || factor?.label || 'Key relationship factor';

function RelationshipScene({
  scene,
  paused,
  label,
  compact = false,
  composite = false,
  highlightA,
  highlightB,
  onHoverBody,
  onSelectBody,
  onSelectAspect,
}) {
  const hasSynastry = scene.a.length > 0 && scene.b.length > 0;
  const hasComposite = scene.compositePlacements.length > 0;
  const canRender = composite ? hasComposite : hasSynastry;

  if (!canRender) {
    return (
      <div className={`ink-relationship__scene-empty${compact ? ' ink-relationship__scene-empty--compact' : ''}`}>
        <span aria-hidden="true">✦</span>
        <p>{composite ? 'Composite chart data is not available yet.' : 'Both birth charts are needed to draw this wheel.'}</p>
      </div>
    );
  }

  return (
    <div className="ink-relationship__scene" role="img" aria-label={label}>
      <ChartScene
        background="#f5eee5"
        theme="ink"
        natal={[]}
        natalAspects={[]}
        paused={paused}
        topDown
        disableZoom
        selectedBody={null}
        onSelectAspect={onSelectAspect}
        relationship={{
          ...scene,
          blend: 1,
          comp: composite ? 1 : 0,
          highlightA,
          highlightB,
          onHoverBody,
          onSelectBody,
        }}
      />
    </div>
  );
}

function PartnerCard({ name, birthLine, chart, blurb }) {
  const placements = bigThree(chart);
  const hasPlacements = placements.sun || placements.moon || placements.ascendant;

  return (
    <article className="ink-relationship__partner">
      <h2>{name}</h2>
      <p className="ink-relationship__partner-birth">
        {birthLine || 'Birth details unavailable'}
      </p>
      {hasPlacements ? (
        <p className="ink-relationship__big-three">
          {placements.sun && <strong>☉ {placements.sun}</strong>}
          {placements.moon && <span>☽ {placements.moon}</span>}
          {placements.ascendant && <span>↑ {placements.ascendant}</span>}
        </p>
      ) : (
        <p className="ink-relationship__big-three ink-relationship__muted">Big three unavailable</p>
      )}
      {blurb && <p className="ink-relationship__romantic-blurb">{blurb}</p>}
    </article>
  );
}

function LoadingState() {
  return (
    <div className="ink-page ink-relationship">
      <InkNav variant="app" activeSegment="relationships" />
      <main className="ink-relationship__status" aria-live="polite">
        <span className="ink-relationship__status-mark" aria-hidden="true">✳</span>
        <h1>Bringing the two skies together…</h1>
        <p>Loading synastry, composite, and relationship analysis.</p>
      </main>
    </div>
  );
}

function FailureState({ userId, notFound, message }) {
  return (
    <div className="ink-page ink-relationship">
      <InkNav variant="app" activeSegment="relationships" />
      <main className="ink-relationship__status">
        <span className="ink-relationship__status-mark" aria-hidden="true">✳</span>
        <h1>{notFound ? 'Relationship not found.' : 'This reading could not be loaded.'}</h1>
        <p>{message || 'Return to your dashboard and try again.'}</p>
        <Link className="ink-btn ink-btn--navy" to={userId ? `/dashboard/${userId}` : '/'} state={{ section: 'relationships' }}>
          Back to relationships
        </Link>
      </main>
    </div>
  );
}

function InkRelationshipPage() {
  const { userId, compositeId } = useParams();
  const [relationship, setRelationship] = useState(null);
  const [subjects, setSubjects] = useState({ a: null, b: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCluster, setActiveCluster] = useState('Harmony');
  const [hoverFocus, setHoverFocus] = useState(null);
  const [pinnedFocus, setPinnedFocus] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!userId || !compositeId) {
        setError('The relationship route is missing its user or relationship ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const composites = await getUserCompositeCharts(userId);
        const found = composites?.find((item) => item._id === compositeId);

        if (!found) {
          if (!cancelled) setNotFound(true);
          return;
        }

        const [analysis, subjectA, subjectB] = await Promise.all([
          fetchRelationshipAnalysis(compositeId).catch(() => null),
          found.userA_id ? fetchUser(found.userA_id).catch(() => null) : null,
          found.userB_id ? fetchUser(found.userB_id).catch(() => null) : null,
        ]);

        if (cancelled) return;

        setSubjects({ a: subjectA, b: subjectB });
        setRelationship({
          ...found,
          ...(analysis || {}),
          ...(subjectA?.birthChart && { userA_birthChart: subjectA.birthChart }),
          ...(subjectB?.birthChart && { userB_birthChart: subjectB.birthChart }),
          userA_romanticBlurb: subjectA?.relationshipAppProfile?.romanticProfileBlurb || null,
          userB_romanticBlurb: subjectB?.relationshipAppProfile?.romanticProfileBlurb || null,
        });
      } catch (fetchError) {
        if (!cancelled) setError('Relationship data is temporarily unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [compositeId, userId]);

  const aFullName = relationship?.userA_name || 'Partner A';
  const bFullName = relationship?.userB_name || 'Partner B';
  const aName = firstName(aFullName);
  const bName = firstName(bFullName);

  const aChart = relationship?.userA_birthChart || null;
  const bChart = relationship?.userB_birthChart || null;
  const compositeChart = relationship?.compositeChart || null;
  const aPlanets = useMemo(() => aChart?.planets || [], [aChart]);
  const bPlanets = useMemo(() => bChart?.planets || [], [bChart]);
  const compositePlanets = useMemo(() => compositeChart?.planets || [], [compositeChart]);

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
    () => toChartSceneAspects(compositeChart?.aspects),
    [compositeChart?.aspects]
  );

  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;
  const archetype = useMemo(() => getRelationshipCardSummary(overall), [overall]);
  const scoredItems = useMemo(
    () => relationship?.scoredItems
      || relationship?.clusterAnalysis?.scoredItems
      || relationship?.clusterScoring?.scoredItems
      || [],
    [relationship]
  );
  const completeAnalysis = relationship?.completeAnalysis;

  const rankedClusters = useMemo(() => CLUSTERS
    .map((cluster) => ({
      ...cluster,
      score: finiteNumber(clusters?.[cluster.key]?.score) ?? 0,
    }))
    .sort((a, b) => b.score - a.score), [clusters]);

  const clusterPanels = useCallback((key, requestedLens = 'synastry') => {
    if (!completeAnalysis || typeof completeAnalysis !== 'object') return null;

    let entry = Object.entries(completeAnalysis).find(([name]) =>
      name.toLowerCase().includes(String(key).toLowerCase())
    );
    let lens = requestedLens;

    if (!entry && String(key).toLowerCase() === 'composite') {
      lens = 'composite';
      const rankedKeys = rankedClusters.map((cluster) => cluster.key);
      const strongestWithComposite = rankedKeys.find((clusterKey) =>
        completeAnalysis?.[clusterKey]?.composite
      );
      if (strongestWithComposite) entry = [strongestWithComposite, completeAnalysis[strongestWithComposite]];
    }

    const value = entry?.[1];
    if (!value) return null;
    if (typeof value === 'string') return { synthesis: value };

    const source = value?.[lens] || value?.synastry || value;
    const panels = {
      support: source?.supportPanel || null,
      challenge: source?.challengePanel || null,
      synthesis: source?.synthesisPanel || value?.analysis || value?.interpretation || null,
    };
    return panels.support || panels.challenge || panels.synthesis ? panels : null;
  }, [completeAnalysis, rankedClusters]);

  const pillarData = useMemo(() => CLUSTERS.map((cluster) => {
    const score = Math.round(finiteNumber(clusters?.[cluster.key]?.score) ?? 0);
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

  useEffect(() => {
    if (!pillarData.some((pillar) => pillar.key === activeCluster)) {
      setActiveCluster(pillarData[0]?.key || 'Harmony');
    }
  }, [activeCluster, pillarData]);

  const activePillar = pillarData.find((pillar) => pillar.key === activeCluster) || pillarData[0];
  const activePillarIndex = Math.max(0, pillarData.findIndex((pillar) => pillar.key === activePillar?.key));

  const scene = useMemo(() => ({
    a: aPlacements,
    b: bPlacements,
    nameA: aName,
    nameB: bName,
    synastryAspects,
    compositePlacements,
    compositeAspects,
  }), [aName, aPlacements, bName, bPlacements, compositeAspects, compositePlacements, synastryAspects]);

  const synastryRows = useMemo(() => [...synastryAspects]
    .sort((a, b) => a.orb - b.orb)
    .map((aspect) => ({
      ...aspect,
      nameA: fromSceneBodyName(aspect.bodyA),
      nameB: fromSceneBodyName(aspect.bodyB),
    }))
    .filter((aspect) => aspect.nameA && aspect.nameB), [synastryAspects]);

  const pinFocus = useCallback((key, a = [], b = []) => {
    setPinnedFocus((current) => current?.key === key ? null : { key, a, b });
  }, []);

  const rowFocusProps = useCallback((key, a, b) => ({
    onMouseEnter: () => setHoverFocus({ a, b }),
    onMouseLeave: () => setHoverFocus(null),
    onFocus: () => setHoverFocus({ a, b }),
    onBlur: () => setHoverFocus(null),
    onClick: () => pinFocus(key, a, b),
    'aria-pressed': pinnedFocus?.key === key,
  }), [pinFocus, pinnedFocus?.key]);

  // idle tour: with no hover/pin, cycle through partner A's planets and
  // light each one's full aspect web in turn
  const tourBodies = useMemo(() => {
    const order = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc', 'node'];
    const seen = [];
    (synastryAspects || []).forEach((aspect) => {
      if (!seen.includes(aspect.bodyA)) seen.push(aspect.bodyA);
    });
    return seen.sort((x, y) => {
      const xi = order.indexOf(x);
      const yi = order.indexOf(y);
      return (xi === -1 ? 99 : xi) - (yi === -1 ? 99 : yi);
    });
  }, [synastryAspects]);
  const [tourIndex, setTourIndex] = useState(0);

  useEffect(() => {
    if (activeTab !== 'synastry' || hoverFocus || pinnedFocus || tourBodies.length === 0) return undefined;
    const id = setInterval(
      () => setTourIndex((index) => (index + 1) % tourBodies.length),
      3200
    );
    return () => clearInterval(id);
  }, [activeTab, hoverFocus, pinnedFocus, tourBodies.length]);

  const tourBody =
    activeTab === 'synastry' && !hoverFocus && !pinnedFocus && tourBodies.length
      ? tourBodies[tourIndex % tourBodies.length]
      : null;

  const focus = hoverFocus || pinnedFocus || {};
  const highlightA = focus.a?.length
    ? toSceneBodyNames(focus.a)
    : tourBody
      ? [tourBody]
      : undefined;
  const highlightB = focus.b?.length ? toSceneBodyNames(focus.b) : undefined;

  const handleSceneHover = useCallback((placement, side) => {
    if (!placement) {
      setHoverFocus(null);
      return;
    }
    const name = fromSceneBodyName(placement.body);
    if (!name) return;
    setHoverFocus(side === 'a' ? { a: [name], b: [] } : { a: [], b: [name] });
  }, []);

  const handleSceneSelect = useCallback((placement, side) => {
    const name = fromSceneBodyName(placement?.body);
    if (!name) return;
    pinFocus(
      `body-${side}-${name}`,
      side === 'a' ? [name] : [],
      side === 'b' ? [name] : []
    );
  }, [pinFocus]);

  const handleAspectSelect = useCallback((selectedAspect) => {
    const index = synastryRows.findIndex((aspect) =>
      aspect.bodyA === selectedAspect?.bodyA
      && aspect.bodyB === selectedAspect?.bodyB
      && aspect.type === selectedAspect?.type
      && aspect.orb === selectedAspect?.orb
    );
    if (index < 0) return;
    const row = synastryRows[index];
    pinFocus(`aspect-${index}`, [row.nameA], [row.nameB]);
  }, [pinFocus, synastryRows]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setHoverFocus(null);
    if (tabId !== 'synastry') setPinnedFocus(null);
    window.requestAnimationFrame(() => {
      document.querySelector('.ink-relationship__tabs')?.scrollIntoView({ block: 'start' });
    });
  };

  if (loading) return <LoadingState />;
  if (error || notFound || !relationship) {
    return <FailureState userId={userId} notFound={notFound} message={error} />;
  }

  const overallScore = finiteNumber(overall?.score, overall, archetype.score);
  const strongest = rankedClusters.filter((cluster) => cluster.score > 0).slice(0, 2);
  const strongestNames = strongest.map((cluster) => cluster.key.toLowerCase()).join(' & ');
  const strongestWithScores = strongest
    .map((cluster) => `${cluster.key} ${Math.round(cluster.score)}%`)
    .join(' · ');
  const overviewCopy = paragraphs(
    relationship?.initialOverview
      || relationship?.holisticOverview
      || clusterPanels(rankedClusters[0]?.key || 'Harmony')?.synthesis
  );
  const compositeCopy = paragraphs(clusterPanels('composite')?.synthesis);
  const synastryCopy = paragraphs(clusterPanels(rankedClusters[0]?.key || 'Harmony')?.synthesis);
  const compositePlacementLine = placementSummary(compositeChart);
  const created = formatDate(relationship?.createdAt);
  const archetypeLabel = archetype.cardHeadline || archetype.cardLabel || archetype.label;
  const overviewDescription = archetype.blurb || relationship?.description;

  return (
    <div className="ink-page ink-relationship">
      <InkNav variant="app" activeSegment="relationships" />

      <header className="ink-relationship__header">
        <h1>{aName} <span>&amp;</span> {bName}</h1>
        <p>Synastry &amp; composite reading{created ? ` · created ${created}` : ''}</p>
      </header>

      <nav className="ink-tabs ink-relationship__tabs" role="tablist" aria-label="Relationship reading sections">
        {TABS.map((tab) => (
          <button
            type="button"
            role="tab"
            id={`ink-relationship-tab-${tab.id}`}
            aria-controls={`ink-relationship-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            className={`ink-tab${activeTab === tab.id ? ' on' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            key={tab.id}
          >
            <span className="ink-tab-roman">{tab.roman}</span>
            <span className="ink-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main>
        <section
          className={`ink-panel${activeTab === 'overview' ? ' show' : ''}`}
          id="ink-relationship-panel-overview"
          role="tabpanel"
          aria-labelledby="ink-relationship-tab-overview"
          aria-hidden={activeTab !== 'overview'}
        >
          <div className="ink-wrap">
            <div className="ink-relationship__partners">
              <PartnerCard
                name={aFullName}
                birthLine={partnerBirthLine(relationship, subjects.a, 'a')}
                chart={aChart}
                blurb={relationship?.userA_romanticBlurb}
              />
              <div className="ink-relationship__knot" aria-hidden="true">
                <svg viewBox="0 0 120 120">
                  <circle cx="45" cy="60" r="34" fill="none" stroke="#b08d3e" strokeWidth="1.3" />
                  <circle cx="75" cy="60" r="34" fill="none" stroke="#4a6e9e" strokeWidth="1.3" />
                  <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fontSize="15" fill="#3437a8">✦</text>
                </svg>
              </div>
              <PartnerCard
                name={bFullName}
                birthLine={partnerBirthLine(relationship, subjects.b, 'b')}
                chart={bChart}
                blurb={relationship?.userB_romanticBlurb}
              />
            </div>

            <div className="ink-relationship__overview-grid">
              <article className="ink-relationship__copy">
                <div className="ink-eyebrow">Overview</div>
                <h2>Two charts, <span className="ink-italic">one weather system.</span></h2>
                {archetypeLabel && (
                  <p className="ink-relationship__archetype">
                    “{archetypeLabel}”
                    {archetype.tier && <span>{archetype.tier}</span>}
                  </p>
                )}
                {overviewDescription && <p className="ink-relationship__lede">{overviewDescription}</p>}
                {overviewCopy.length > 0 ? overviewCopy.slice(0, 4).map((text, index) => (
                  <p key={index}>{text}</p>
                )) : (
                  <p className="ink-relationship__muted">The overview narrative is still being prepared.</p>
                )}
                {overallScore !== null && (
                  <div className="ink-relationship__score-line">
                    <strong>{Math.round(overallScore)}%</strong>
                    <span>
                      overall connection
                      {strongestNames ? ` · strongest in ${strongestNames}` : ''}
                    </span>
                  </div>
                )}
              </article>

            </div>
          </div>
        </section>

        <section
          className={`ink-panel${activeTab === 'synastry' ? ' show' : ''}`}
          id="ink-relationship-panel-synastry"
          role="tabpanel"
          aria-labelledby="ink-relationship-tab-synastry"
          aria-hidden={activeTab !== 'synastry'}
        >
          <div className="ink-wrap ink-relationship__chapter-grid">
            <div className="ink-relationship__wheel-column">
              <div className="ink-relationship__medallion ink-relationship__medallion--large">
                <RelationshipScene
                  scene={scene}
                  paused={activeTab !== 'synastry'}
                  label={`${aName} and ${bName} synastry wheel with cross-chart aspects`}
                  highlightA={highlightA}
                  highlightB={highlightB}
                  onHoverBody={handleSceneHover}
                  onSelectBody={handleSceneSelect}
                  onSelectAspect={handleAspectSelect}
                />
              </div>
              <div className="ink-relationship__legend" aria-label="Partner colors">
                <span><i className="ink-relationship__swatch ink-relationship__swatch--a" />{aName}</span>
                <span><i className="ink-relationship__swatch ink-relationship__swatch--b" />{bName}</span>
              </div>
            </div>

            <article className="ink-relationship__copy ink-relationship__synastry-copy">
              <div className="ink-eyebrow">Synastry</div>
              <h2>How your charts <span className="ink-italic">speak to each other.</span></h2>
              <p className="ink-relationship__subhead">Hover to preview a thread; click to keep it isolated.</p>
              {synastryCopy[0] ? (
                <p>{synastryCopy[0]}</p>
              ) : (
                <p>Synastry lays one chart over the other, tracing where the two skies support, provoke, and bind.</p>
              )}

              {synastryRows.length > 0 ? (
                <div className="ink-relationship__aspect-list" aria-label="Cross-chart aspects, tightest first">
                  {synastryRows.map((aspect, index) => {
                    const kind = aspectKind(aspect.type);
                    return (
                      <button
                        type="button"
                        className={`ink-relationship__aspect-row ink-relationship__aspect-row--${kind}${pinnedFocus?.key === `aspect-${index}` ? ' is-pinned' : ''}`}
                        {...rowFocusProps(`aspect-${index}`, [aspect.nameA], [aspect.nameB])}
                        key={`${aspect.bodyA}-${aspect.type}-${aspect.bodyB}-${index}`}
                      >
                        <span className="ink-relationship__aspect-pair">
                          <i>{aName}’s</i> {aspect.nameA} <b>{aspect.type}</b> <i>{bName}’s</i> {aspect.nameB}
                        </span>
                        <span className="ink-relationship__aspect-orb">{Number(aspect.orb).toFixed(1)}°</span>
                        <span className="ink-relationship__aspect-kind">{kind}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="ink-relationship__inline-empty">No supported cross-chart aspects are available.</div>
              )}
              <p className="ink-relationship__aspect-note">
                Harmonious aspects flow readily; dynamic ones generate energy the relationship can learn to use.
              </p>
            </article>
          </div>
        </section>

        <section
          className={`ink-panel${activeTab === 'composite' ? ' show' : ''}`}
          id="ink-relationship-panel-composite"
          role="tabpanel"
          aria-labelledby="ink-relationship-tab-composite"
          aria-hidden={activeTab !== 'composite'}
        >
          <div className="ink-wrap ink-relationship__chapter-grid ink-relationship__chapter-grid--composite">
            <article className="ink-relationship__copy">
              <div className="ink-eyebrow">Composite</div>
              <h2>The third chart — <span className="ink-italic">the relationship itself.</span></h2>
              <p className="ink-relationship__subhead">A single chart cast from the midpoints of both of yours.</p>
              {compositePlacementLine.length > 0 && (
                <p className="ink-relationship__placement-line">{compositePlacementLine.join(' · ')}</p>
              )}
              {compositeCopy.length > 0 ? compositeCopy.slice(0, 3).map((text, index) => (
                <p key={index}>{text}</p>
              )) : (
                <p className="ink-relationship__muted">Composite interpretation is not available yet.</p>
              )}
            </article>

            <div className="ink-relationship__wheel-column">
              <div className="ink-relationship__medallion ink-relationship__medallion--large">
                <RelationshipScene
                  scene={scene}
                  paused={activeTab !== 'composite'}
                  composite
                  label={`${aName} and ${bName} composite relationship chart`}
                />
                <span className="ink-annot ink-relationship__composite-annot">the chart of the “we” ↑</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`ink-panel${activeTab === 'analysis' ? ' show' : ''}`}
          id="ink-relationship-panel-analysis"
          role="tabpanel"
          aria-labelledby="ink-relationship-tab-analysis"
          aria-hidden={activeTab !== 'analysis'}
        >
          <div className="ink-wrap">
            <nav className="ink-pmenu ink-relationship__pmenu" aria-label="360 Analysis dimensions">
              {pillarData.map((pillar) => (
                <button
                  type="button"
                  className={`ink-pm-item${activePillar?.key === pillar.key ? ' on' : ''}`}
                  aria-pressed={activePillar?.key === pillar.key}
                  onClick={() => setActiveCluster(pillar.key)}
                  key={pillar.key}
                >
                  <span className="ink-pm-label">{pillar.key}</span>
                </button>
              ))}
            </nav>

            <div className="ink-relationship__analysis-count">{activePillarIndex + 1} of {pillarData.length}</div>
            {activePillar && (
              <article className="ink-relationship__analysis" style={{ '--ink-relationship-cluster-tone': activePillar.tone }}>
                <div className="ink-eyebrow">360 Analysis</div>
                <h2>{activePillar.key}</h2>
                <div className="ink-relationship__analysis-score">
                  <strong>{activePillar.score}%</strong>
                  <span><i style={{ width: `${Math.min(100, Math.max(0, activePillar.score))}%` }} /></span>
                </div>

                {activePillar.factors.length > 0 ? (
                  <div className="ink-relationship__chips" aria-label={`${activePillar.key} key factors`}>
                    {activePillar.factors.map((factor, index) => (
                      <span className="ink-chip" key={`${factor.id || factorLabel(factor)}-${index}`}>
                        {factorLabel(factor)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="ink-relationship__muted">No scored factors are available for this dimension.</p>
                )}

                {[
                  ['Support Patterns', activePillar.panels?.support, 'support'],
                  ['Growth Challenges', activePillar.panels?.challenge, 'challenge'],
                  ['Synthesis', activePillar.panels?.synthesis, 'synthesis'],
                ].map(([title, content, kind]) => content && (
                  <section className={`ink-relationship__analysis-section ink-relationship__analysis-section--${kind}`} key={kind}>
                    <h3>{title}</h3>
                    {paragraphs(content).map((text, index) => <p key={index}>{text}</p>)}
                  </section>
                ))}

                {!activePillar.panels && (
                  <div className="ink-relationship__inline-empty">
                    The detailed {activePillar.key.toLowerCase()} reading is still being prepared.
                  </div>
                )}
              </article>
            )}
          </div>
        </section>

        <section
          className={`ink-panel${activeTab === 'ask' ? ' show' : ''}`}
          id="ink-relationship-panel-ask"
          role="tabpanel"
          aria-labelledby="ink-relationship-tab-ask"
          aria-hidden={activeTab !== 'ask'}
        >
          <div className="ink-wrap ink-relationship__ask-grid">
            <aside className="ink-relationship__ask-side">
              <div className="ink-relationship__medallion ink-relationship__medallion--ask">
                <RelationshipScene
                  scene={scene}
                  paused={activeTab !== 'ask'}
                  compact
                  label={`${aName} and ${bName} relationship wheel`}
                />
              </div>
              <div className="ink-card ink-relationship__context-card">
                <div className="ink-eyebrow">Active context</div>
                <p>{aName} &amp; {bName} · Synastry + Composite</p>
                <p>Strongest: {strongestWithScores || 'analysis pending'}</p>
              </div>
            </aside>

            <article className="ink-relationship__ask-main">
              <h2>Gravity Chat <span aria-hidden="true">✳</span></h2>
              <p className="ink-relationship__ask-subhead">
                Astral Gravity has read both charts. Ask about the space between them.
              </p>
              <div className="ink-relationship__ask-chat" aria-label="Gravity Chat conversation">
                <AskStelliumPanel
                  variant="dock"
                  isOpen={activeTab === 'ask'}
                  onClose={() => setActiveTab('composite')}
                  contentType="relationship"
                  contentId={compositeId}
                  relationshipScoredItems={scoredItems}
                  contextLabel={`${aName} and ${bName}`}
                  placeholderText="Ask about this relationship…"
                  suggestedQuestions={[
                    'What are our relationship strengths?',
                    'How can we improve our communication?',
                    'What challenges should we be aware of?',
                  ]}
                />
              </div>
              <p className="ink-relationship__ask-foot">Powered by real astrology + AI · 1 credit per question</p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default InkRelationshipPage;
