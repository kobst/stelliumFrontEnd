import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getUserCompositeCharts,
  fetchRelationshipAnalysis,
  fetchUser,
} from '../Utilities/api';
import { ChartScene } from '../UI/shared/chartScene';
import {
  toChartScenePlacements,
  toChartSceneAspects,
  toSynastrySceneAspects,
  toSceneBodyNames,
} from '../Utilities/chartSceneAdapter';
import { mentionsIn } from '../UI/journey/AnalysisFlow';
import AskStelliumPanel from '../UI/askStellium/AskStelliumPanel';
import './ChartReaderPage.css';
import './RelationshipJourneyPage.css';

/**
 * The relationship reading as one continuous scroll — same journey
 * grammar as the birth chart, plus the two signature transformations:
 *   merge track     — scroll drives the partner's planets from the
 *                     center out onto the synastry ring (secondaryBlend)
 *   composite morph — crossing the composite track swaps the wheel to
 *                     the composite chart; markers glide to midpoints
 * Acts: hero → I Overview → II Two Skies → (merge) → III Synastry →
 * IV 360 Analysis (five pillars) → (composite) → V Composite → VI Ask.
 */

const ACT_TITLES = {
  overview: 'I · Overview',
  skies: 'II · Two Skies',
  synastry: 'III · Synastry',
  pillars: 'IV · 360 Analysis',
  composite: 'V · Composite',
  ask: 'VI · Ask Stellium',
};

const ACTS = [
  { id: 'hero', rail: null, mode: 'hidden' },
  { id: 'overview', rail: 'Overview', mode: 'hidden' },
  { id: 'skies', rail: 'Two Skies', mode: 'full' },
  { id: 'synastry', rail: 'Synastry', mode: 'full' },
  { id: 'pillars', rail: '360 Analysis', mode: 'full' },
  { id: 'composite', rail: 'Composite', mode: 'full' },
  { id: 'ask', rail: 'Ask Stellium', mode: 'recede' },
];

const CLUSTERS = [
  { key: 'Harmony', emoji: '💕', tone: '#ff8aae' },
  { key: 'Passion', emoji: '🔥', tone: '#ff9d6a' },
  { key: 'Connection', emoji: '🧠', tone: '#ffa6a6' },
  { key: 'Stability', emoji: '💎', tone: '#7ec9e0' },
  { key: 'Growth', emoji: '🌱', tone: '#5dd6a0' },
];

const firstName = (full) => String(full || '').trim().split(/\s+/)[0] || 'Partner';

const PLACEMENT_ORDER = [
  'Ascendant', 'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Midheaven', 'Node',
];
const orderedPlacements = (planets) =>
  [...(planets || [])].sort((x, y) => {
    const ix = PLACEMENT_ORDER.indexOf(x.name);
    const iy = PLACEMENT_ORDER.indexOf(y.name);
    return (ix === -1 ? 99 : ix) - (iy === -1 ? 99 : iy);
  });

function RelationshipJourneyPage() {
  const { userId, compositeId } = useParams();
  const navigate = useNavigate();

  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const composites = await getUserCompositeCharts(userId);
        const found = composites?.find((c) => c._id === compositeId);
        if (!found) {
          if (!cancelled) setError('Relationship not found');
          return;
        }
        let analysis = null;
        let chartA = null;
        let chartB = null;
        try {
          [analysis, chartA, chartB] = await Promise.all([
            fetchRelationshipAnalysis(compositeId).catch(() => null),
            found.userA_id ? fetchUser(found.userA_id).then((u) => u?.birthChart).catch(() => null) : null,
            found.userB_id ? fetchUser(found.userB_id).then((u) => u?.birthChart).catch(() => null) : null,
          ]);
        } catch (e) {
          // analysis optional; charts fall back to the composite doc
        }
        if (cancelled) return;
        setRelationship({
          ...found,
          ...(analysis || {}),
          ...(chartA && { userA_birthChart: chartA }),
          ...(chartB && { userB_birthChart: chartB }),
        });
      } catch (e) {
        if (!cancelled) setError('Failed to load relationship data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, compositeId]);

  // ── scroll state ───────────────────────────────────────────────────
  const [activeAct, setActiveAct] = useState('hero');
  const [liveStep, setLiveStep] = useState('hero');
  const [mergeBlend, setMergeBlend] = useState(0);
  const [compBlend, setCompBlend] = useState(0);
  const [hoverAB, setHoverAB] = useState(null); // {a:[], b:[]} from rows
  const [askOpen, setAskOpen] = useState(false);
  const [fitNonce, setFitNonce] = useState(0);

  const scrollRef = useRef(null);
  const stepRefs = useRef({});
  const stepFocus = useRef({});
  const mergeTrackRef = useRef(null);
  const compTrackRef = useRef(null);

  const aName = firstName(relationship?.userA_name);
  const bName = firstName(relationship?.userB_name);

  // ── chart data ─────────────────────────────────────────────────────
  const aPlanets = relationship?.userA_birthChart?.planets;
  const bPlanets = relationship?.userB_birthChart?.planets;
  const aPlacements = useMemo(() => toChartScenePlacements(aPlanets), [aPlanets]);
  const bPlacements = useMemo(() => toChartScenePlacements(bPlanets), [bPlanets]);
  const synAspects = useMemo(
    () => toSynastrySceneAspects(relationship?.synastryAspects),
    [relationship?.synastryAspects]
  );
  const compositePlacements = useMemo(
    () => toChartScenePlacements(relationship?.compositeChart?.planets),
    [relationship?.compositeChart?.planets]
  );
  const compositeAspects = useMemo(
    () => toChartSceneAspects(relationship?.compositeChart?.aspects),
    [relationship?.compositeChart?.aspects]
  );

  const knownNames = useMemo(() => {
    const names = new Set();
    (aPlanets || []).forEach((p) => names.add(p.name));
    (bPlanets || []).forEach((p) => names.add(p.name));
    return [...names];
  }, [aPlanets, bPlanets]);

  // ── analysis data ──────────────────────────────────────────────────
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;
  const scoredItems = useMemo(
    () =>
      relationship?.scoredItems ||
      relationship?.clusterAnalysis?.scoredItems ||
      relationship?.clusterScoring?.scoredItems ||
      [],
    [relationship]
  );
  const completeAnalysis = relationship?.completeAnalysis;
  // per-cluster analysis arrives as three panels:
  // completeAnalysis[cluster].synastry.{supportPanel,challengePanel,synthesisPanel}
  const clusterPanels = useCallback(
    (key) => {
      if (!completeAnalysis) return null;
      const hit = Object.entries(completeAnalysis).find(([k]) =>
        k.toLowerCase().includes(key.toLowerCase())
      );
      const v = hit?.[1];
      if (!v) return null;
      if (typeof v === 'string') return { synthesis: v };
      const syn = v.synastry || v;
      const panels = {
        support: syn.supportPanel || null,
        challenge: syn.challengePanel || null,
        synthesis: syn.synthesisPanel || v.analysis || v.interpretation || null,
      };
      return panels.support || panels.challenge || panels.synthesis ? panels : null;
    },
    [completeAnalysis]
  );


  const pillarData = useMemo(() => {
    if (!clusters) return [];
    return CLUSTERS.map((c) => {
      const score = Math.round(clusters?.[c.key]?.score || 0);
      const factors = scoredItems
        .map((item) => {
          const contribution = item.clusterContributions?.find((x) => x.cluster === c.key);
          if (!contribution || contribution.score === 0) return null;
          return { ...item, clusterScore: contribution.score };
        })
        .filter(Boolean)
        .sort((x, y) => Math.abs(y.clusterScore) - Math.abs(x.clusterScore))
        .slice(0, 4);
      return { ...c, score, factors, panels: clusterPanels(c.key) };
    });
  }, [clusters, scoredItems, clusterPanels]);

  const synastryTop = useMemo(() => {
    const rows = (relationship?.synastryAspects || [])
      .map((a) => ({
        nameA: a.transitingPlanet || a.aspectedPlanet || a.planet1,
        nameB: a.aspectingPlanet || a.planet2,
        type: a.aspectType,
        orb: Number(a.orb),
      }))
      .filter((r) => r.nameA && r.nameB && Number.isFinite(r.orb))
      .sort((x, y) => x.orb - y.orb);
    return rows;
  }, [relationship?.synastryAspects]);

  // ── emphasis: hover > centered step's focus ────────────────────────
  const focus = hoverAB || stepFocus.current[liveStep] || null;
  const highlightBodies = useMemo(
    () => (focus?.a?.length ? toSceneBodyNames(focus.a) : undefined),
    [focus]
  );
  const highlightSecondaryBodies = useMemo(
    () => (focus?.b?.length ? toSceneBodyNames(focus.b) : undefined),
    [focus]
  );

  // ── scroll spy + continuous tracks ─────────────────────────────────
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || loading) return undefined;
    let ticking = false;
    const trackP = (el) => {
      if (!el) return 0;
      const vh = container.clientHeight;
      const r = el.getBoundingClientRect();
      return Math.max(0, Math.min(1, (vh * 0.62 - r.top) / Math.max(1, r.height - vh * 0.25)));
    };
    const spy = () => {
      ticking = false;
      setMergeBlend(trackP(mergeTrackRef.current));
      setCompBlend(trackP(compTrackRef.current));
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

  // the wheel always scrolls the story
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

  const setStepRef = (id, act, focusAB) => (el) => {
    stepRefs.current[id] = el;
    if (el) el.dataset.act = act || id;
    if (focusAB) stepFocus.current[id] = focusAB;
  };

  const hoverRow = (a, b) => ({
    onMouseEnter: () => setHoverAB({ a: a || [], b: b || [] }),
    onMouseLeave: () => setHoverAB(null),
  });

  // factor prose names both partners' planets; light them on both rings
  const factorHover = (item) => {
    const text = item.description || item.reason || item.label || '';
    const names = mentionsIn(text, knownNames);
    return hoverRow(names, names);
  };

  if (loading || error) {
    return (
      <div className="chart-reader-page">
        <div className="chart-reader-loading">{error || 'Loading relationship…'}</div>
      </div>
    );
  }

  const act = ACTS.find((x) => x.id === activeAct) || ACTS[0];
  const sceneMode = act.mode;
  const hasScene = aPlacements.length > 0 && bPlacements.length > 0;
  const overallLabel = Number.isFinite(overall) ? `${Math.round(overall)}% overall` : null;

  // camera widens to hold both separated wheels, tightens as they merge
  const fitRadius = 10.8 - (10.8 - 5.9) * mergeBlend;

  const sceneProps = {
    natal: [],
    natalAspects: [],
    relationship: {
      a: aPlacements,
      b: bPlacements,
      nameA: aName,
      nameB: bName,
      blend: mergeBlend,
      comp: compBlend,
      compositePlacements,
      compositeAspects,
      synastryAspects: synAspects,
      highlightA: compBlend > 0.5 ? highlightBodies : highlightBodies,
      highlightB: compBlend > 0.5 ? undefined : highlightSecondaryBodies,
    },
  };

  return (
    <div className="journey-page">
      <div className={`journey-scene journey-scene--${sceneMode}`}>
        {hasScene && (
          <ChartScene
            {...sceneProps}
            fitRadius={fitRadius}
            fitNonce={fitNonce}
            disableZoom
            coveredRightPx={sceneMode === 'full' ? Math.min(560, window.innerWidth * 0.46) : 0}
          />
        )}
      </div>

      <div className="journey-topbar">
        <button
          className="reader-bar__back"
          onClick={() => navigate(`/dashboard/${userId}/relationship/${compositeId}`)}
        >
          ← Classic view
        </button>
        <div className="journey-identity">
          <span className="journey-identity__name">
            {aName} <span className="rj-amp">&amp;</span> {bName}
          </span>
          {overallLabel && <span className="journey-identity__meta">{overallLabel}</span>}
        </div>
        <span className="journey-brand">Stellium</span>
      </div>

      {activeAct !== 'hero' && (
        <div className="journey-actbar" key={ACT_TITLES[activeAct]}>
          <span>{ACT_TITLES[activeAct]}</span>
        </div>
      )}

      <nav className="journey-rail">
        {ACTS.filter((a) => a.rail).map((a) => (
          <button
            key={a.id}
            className={
              activeAct === a.id || (activeAct === 'hero' && a.id === 'overview') ? 'on' : ''
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

      <div
        className={`journey-scroll${sceneMode === 'hidden' ? '' : ' journey-scroll--passthrough'}`}
        ref={scrollRef}
      >
        <div className="journey-body">
          <section
            className={`journey-step journey-step--hero${liveStep === 'hero' ? ' live' : ''}`}
            ref={setStepRef('hero')}
          >
            <div className="journey-chapter">The Relationship Reading</div>
            <h1>
              {aName} <span className="rj-amp">&amp;</span> {bName}
            </h1>
            {overallLabel && <div className="journey-meta">{overallLabel}</div>}
            <p className="journey-lede">Two charts. Scroll, and watch them meet.</p>
          </section>

          <section
            className={`journey-step journey-step--wide${liveStep === 'overview' ? ' live' : ''}`}
            ref={setStepRef('overview')}
          >
            <div className="journey-chapter">I · Overview</div>
            {(relationship?.initialOverview || clusterPanels('overview')?.synthesis || '')
              .split(/\n\s*\n|\n/)
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            <p className="journey-lede">Those are the claims. First, meet the two skies.</p>
          </section>

          {/* ── II · Two Skies ── */}
          <section
            className={`journey-step journey-step--panel${liveStep === 'sky-a' ? ' live' : ''}`}
            ref={setStepRef('sky-a', 'skies')}
          >
            <div className="rj-pname rj-pname--a">{aName}</div>
            <p>
              This is {aName}&rsquo;s sky, whole — every placement below sits on the wheel
              to the left. Hover a row to find it.
            </p>
            {orderedPlacements(aPlanets).map((p) => (
              <div className="arow" key={p.name} {...hoverRow([p.name], [])}>
                <span className="at">{p.name}</span>
                <span className="an">{p.sign}</span>
                <span className="orb">{p.house ? `House ${p.house}` : ''}</span>
              </div>
            ))}
          </section>

          <section
            className={`journey-step journey-step--panel${liveStep === 'sky-b' ? ' live' : ''}`}
            ref={setStepRef('sky-b', 'skies')}
          >
            <div className="rj-pname rj-pname--b">{bName}</div>
            <p>
              And this is {bName}&rsquo;s — her wheel turns beside {aName}&rsquo;s, complete
              in itself. Keep scrolling, and the two skies merge.
            </p>
            {orderedPlacements(bPlanets).map((p) => (
              <div className="arow" key={p.name} {...hoverRow([], [p.name])}>
                <span className="at">{p.name}</span>
                <span className="an">{p.sign}</span>
                <span className="orb">{p.house ? `House ${p.house}` : ''}</span>
              </div>
            ))}
          </section>

          {/* merge track: scroll drives the blend */}
          <div className="rj-track" ref={mergeTrackRef}>
            <section
              className={`journey-step journey-step--panel rj-capstep${liveStep === 'cap-merge-1' ? ' live' : ''}`}
              ref={setStepRef('cap-merge-1', 'skies')}
            >
              <p className="rj-cap">Now bring them together.</p>
            </section>
            <section
              className={`journey-step journey-step--panel rj-capstep${liveStep === 'cap-merge-2' ? ' live' : ''}`}
              ref={setStepRef('cap-merge-2', 'synastry')}
            >
              <p className="rj-cap">
                {bName}&rsquo;s sky settles into the inner ring. Every line you see is a
                conversation between one of {aName}&rsquo;s planets and one of {bName}&rsquo;s.
              </p>
            </section>
          </div>

          {/* ── III · Synastry ── */}
          <section
            className={`journey-step journey-step--panel${liveStep === 'synastry' ? ' live' : ''}`}
            ref={setStepRef('synastry', 'synastry')}
          >
            <div className="journey-chapter">III · Synastry</div>
            <p>
              All {relationship?.synastryAspects?.length || 0} cross-aspects between{' '}
              {aName}&rsquo;s planets and {bName}&rsquo;s, tightest first — hover any row
              to isolate that thread in the sky:
            </p>
            {synastryTop.map((r, i) => (
              <div className="arow" key={i} {...hoverRow([r.nameA], [r.nameB])}>
                <span className="at">{String(r.type || '').toLowerCase()}</span>
                <span className="an">
                  {aName}&rsquo;s {r.nameA} → {bName}&rsquo;s {r.nameB}
                </span>
                <span className="orb">{r.orb.toFixed(1)}°</span>
              </div>
            ))}
          </section>

          {/* ── IV · 360 Analysis: five pillars ── */}
          <section
            className={`journey-step journey-step--panel${liveStep === 'pillars' ? ' live' : ''}`}
            ref={setStepRef('pillars', 'pillars')}
          >
            <div className="journey-chapter">IV · 360 Analysis</div>
            <p className="journey-lede">
              Five dimensions of the same sky. Each score is an argument — its key factors
              light up the exact lines that make it.
            </p>
          </section>

          {pillarData.map((pl) => {
            const focusNames = [
              ...new Set(
                pl.factors.flatMap((f) =>
                  mentionsIn(f.description || f.reason || f.label || '', knownNames)
                )
              ),
            ];
            return (
              <div className="journey-domain-group" key={pl.key}>
                <div className="journey-domain-sticky">
                  <span>{pl.key}</span>
                </div>
                <section
                  className={`journey-step journey-step--panel${liveStep === `pillar-${pl.key}` ? ' live' : ''}`}
                  ref={setStepRef(`pillar-${pl.key}`, 'pillars', { a: focusNames, b: focusNames })}
                >
                  <div className="rj-pillar" style={{ '--tc': pl.tone }}>
                    <div className="ph">
                      <span className="pe">{pl.emoji}</span>
                      <span className="pn">{pl.key}</span>
                      <span className="pv">{pl.score}%</span>
                    </div>
                    <div className="pbar">
                      <span style={{ width: `${pl.score}%` }} />
                    </div>
                    {pl.factors.length > 0 && <div className="fk">Key factors</div>}
                    {pl.factors.map((f, i) => (
                      <div className="rj-factor" key={i} {...factorHover(f)}>
                        <span className="fx">{f.description || f.reason || f.label}</span>
                        <span className={`fs${f.clusterScore < 0 ? ' neg' : ''}`}>
                          {f.clusterScore > 0 ? '+' : ''}
                          {Math.round(f.clusterScore)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {pl.panels?.support && (
                    <div className="rj-panelblock rj-panelblock--support">
                      <div className="pk">Support Patterns</div>
                      {pl.panels.support.split(/\n\s*\n|\n/).map((t) => t.trim()).filter(Boolean).map((t, i) => (
                        <p key={i}>{t}</p>
                      ))}
                    </div>
                  )}
                  {pl.panels?.challenge && (
                    <div className="rj-panelblock rj-panelblock--challenge">
                      <div className="pk">Growth Challenges</div>
                      {pl.panels.challenge.split(/\n\s*\n|\n/).map((t) => t.trim()).filter(Boolean).map((t, i) => (
                        <p key={i}>{t}</p>
                      ))}
                    </div>
                  )}
                  {pl.panels?.synthesis && (
                    <div className="rj-panelblock rj-panelblock--synthesis">
                      <div className="pk">Synthesis</div>
                      {pl.panels.synthesis.split(/\n\s*\n|\n/).map((t) => t.trim()).filter(Boolean).map((t, i) => (
                        <p key={i}>{t}</p>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            );
          })}

          {/* composite track: pairs collapse to midpoints */}
          <div className="rj-track" ref={compTrackRef}>
            <section
              className={`journey-step journey-step--panel rj-capstep${liveStep === 'cap-comp-1' ? ' live' : ''}`}
              ref={setStepRef('cap-comp-1', 'pillars')}
            >
              <p className="rj-cap">
                One more transformation. Every pair of planets — {aName}&rsquo;s Sun and{' '}
                {bName}&rsquo;s, his Moon and hers — collapses to its midpoint…
              </p>
            </section>
            <section
              className={`journey-step journey-step--panel rj-capstep${liveStep === 'cap-comp-2' ? ' live' : ''}`}
              ref={setStepRef('cap-comp-2', 'composite')}
            >
              <p className="rj-cap">
                …and what remains is the composite chart: not {aName}&rsquo;s sky, not{' '}
                {bName}&rsquo;s, but the relationship&rsquo;s own.
              </p>
            </section>
          </div>

          {/* ── V · Composite ── */}
          <section
            className={`journey-step journey-step--panel${liveStep === 'composite' ? ' live' : ''}`}
            ref={setStepRef('composite', 'composite')}
          >
            <div className="journey-chapter">V · Composite</div>
            <div className="rj-chips">
              {['Sun', 'Moon', 'Ascendant'].map((n) => {
                const p = (relationship?.compositeChart?.planets || []).find(
                  (x) => x.name === n
                );
                if (!p) return null;
                return (
                  <div className="rj-chip" key={n} {...hoverRow([n], [])}>
                    <div>
                      <div className="k">Composite {n}</div>
                      <div className="v">
                        {p.sign}
                        {typeof p.norm_degree === 'number' && ` · ${Math.round(p.norm_degree)}°`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {(clusterPanels('composite')?.synthesis || '')
              .split(/\n\s*\n|\n/)
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 5)
              .map((t, i) => (
                <p key={i}>{t}</p>
              ))}
          </section>

          {/* ── VI · Ask ── */}
          <section
            className={`journey-step journey-step--panel journey-step--syn${liveStep === 'ask' ? ' live' : ''}`}
            ref={setStepRef('ask', 'ask')}
          >
            <div className="journey-chapter">VI · Ask Stellium</div>
            <p>
              The reading ends; the sky doesn&rsquo;t. Anything above — his, hers, or the
              relationship&rsquo;s own — can be questioned.
            </p>
            <button className="journey-open-ask" onClick={() => setAskOpen(true)}>
              ✦ Ask Stellium about this relationship
            </button>
          </section>
        </div>
      </div>

      <button className="journey-ask-fab" onClick={() => setAskOpen(true)}>
        <span className="sp">✦</span> Ask
      </button>

      <AskStelliumPanel
        isOpen={askOpen}
        onClose={() => setAskOpen(false)}
        contentType="relationship"
        contentId={compositeId}
        relationshipScoredItems={scoredItems}
        contextLabel="About your relationship"
        placeholderText="Ask about this relationship…"
        suggestedQuestions={[
          'What are our relationship strengths?',
          'How can we improve our communication?',
          'What challenges should we be aware of?',
        ]}
      />
    </div>
  );
}

export default RelationshipJourneyPage;
