import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchRelationshipAnalysis,
  fetchUser,
  getCelebrityRelationships,
} from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import { getRelationshipCardSummary } from '../Utilities/relationshipSummary';
import {
  toChartSceneAspects,
  toChartScenePlacements,
  toSynastrySceneAspects,
} from '../Utilities/chartSceneAdapter';
import AskStelliumPanel from '../UI/askStellium/AskStelliumPanel';
import AskStelliumCta from '../UI/dashboard/chartTabs/AskStelliumCta';
import RelationshipAnalysisTab from '../UI/dashboard/relationshipTabs/AnalysisTab';
import ChartsTab from '../UI/dashboard/relationshipTabs/ChartsTab';
import CompositeTab from '../UI/dashboard/relationshipTabs/CompositeTab';
import RelationshipOverviewTab from '../UI/dashboard/relationshipTabs/OverviewTab';
import ScoresTab from '../UI/dashboard/relationshipTabs/ScoresTab';
import InkNav from '../UI/ink/InkNav';
import InkPublicFooter from '../UI/publicInk/InkPublicFooter';
import { ChartScene } from '../UI/shared/chartScene';
import '../styles/ink.css';
import './InkRelationshipPage.css';
import './PublicCelebrityRelationship.css';

const TABS = [
  { id: 'scores', roman: 'i.', label: 'Scores' },
  { id: 'overview', roman: 'ii.', label: 'Overview' },
  { id: 'composite', roman: 'iii.', label: 'Composite' },
  { id: 'charts', roman: 'iv.', label: 'Both Charts' },
  { id: 'analysis', roman: 'v.', label: '360 Analysis' },
];
const MARKETING_LINKS = [
  { label: 'Celebrity charts', href: '/celebrities' },
  { label: 'Relationships', href: '/celebrity-relationships' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/#pricing' },
];

function getRelationshipName(relationship, prefix, fallback) {
  const first = relationship?.[`${prefix}_firstName`];
  const last = relationship?.[`${prefix}_lastName`];
  if (first || last) return `${first || ''} ${last || ''}`.trim();
  return relationship?.[`${prefix}_name`]
    || relationship?.debug?.inputSummary?.[`${prefix}Name`]
    || fallback;
}

function firstName(value) {
  return String(value || '').trim().split(/\s+/)[0] || 'Partner';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function partnerBirthLine(relationship, prefix) {
  const date = relationship?.[`${prefix}_dateOfBirth`] || relationship?.[`${prefix}_birthDate`];
  const place = relationship?.[`${prefix}_placeOfBirth`] || relationship?.[`${prefix}_birthPlace`];
  return [formatDate(date), typeof place === 'string' ? place : place?.formattedAddress || place?.name]
    .filter(Boolean)
    .join(' · ');
}

function getPlanet(chart, name) {
  return chart?.planets?.find((planet) => planet?.name === name);
}

function bigThree(chart) {
  const ascendant = getPlanet(chart, 'Ascendant')?.sign
    || chart?.ascendant?.sign
    || chart?.houses?.find((house) => Number(house?.house) === 1)?.sign;
  return {
    sun: getPlanet(chart, 'Sun')?.sign,
    moon: getPlanet(chart, 'Moon')?.sign,
    ascendant,
  };
}

function PartnerSummary({ name, birthLine, chart }) {
  const placements = bigThree(chart);
  const hasPlacements = placements.sun || placements.moon || placements.ascendant;
  return (
    <article className="ink-relationship__partner">
      <h2>{name}</h2>
      <p className="ink-relationship__partner-birth">{birthLine || 'Birth details unavailable'}</p>
      {hasPlacements ? (
        <p className="ink-relationship__big-three">
          {placements.sun && <strong>☉ {placements.sun}</strong>}
          {placements.moon && <span>☽ {placements.moon}</span>}
          {placements.ascendant && <span>↑ {placements.ascendant}</span>}
        </p>
      ) : (
        <p className="ink-relationship__big-three ink-relationship__muted">Big three unavailable</p>
      )}
    </article>
  );
}

function PageState({ error, children }) {
  return (
    <div className="ink-page public-celeb-relationship">
      <InkNav variant="marketing" marketingLinks={MARKETING_LINKS} />
      <main className={`pcr-state${error ? ' pcr-state--error' : ''}`} role={error ? 'alert' : 'status'}>
        <span aria-hidden="true">✳</span>
        <p>{children}</p>
        {error && (
          <Link className="ink-btn ink-btn--ghost" to="/celebrity-relationships">
            Back to celebrity relationships
          </Link>
        )}
      </main>
      <InkPublicFooter />
    </div>
  );
}

function ConversionCta() {
  return (
    <aside className="pcr-conversion">
      <div>
        <div className="ink-eyebrow">Make it personal</div>
        <h2>Read the sky <span className="ink-italic">between you.</span></h2>
        <p>Add two birth charts to explore your own synastry, composite, and relationship themes.</p>
      </div>
      <Link className="ink-btn ink-btn--navy" to="/signUp">Get started ✳</Link>
    </aside>
  );
}

function PublicCelebrityRelationship() {
  const { compositeId } = useParams();
  const navigate = useNavigate();
  const { isFullyAuthenticated } = useAuth();
  const [relationship, setRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('scores');
  const [tourIndex, setTourIndex] = useState(0);
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadRelationshipData = async () => {
      try {
        setLoading(true);
        const relationships = await getCelebrityRelationships();
        const found = relationships?.find((item) => item._id === compositeId);
        if (!found) {
          if (!cancelled) setError('Relationship not found.');
          return;
        }

        let analysisData = null;
        let userABirthChart = null;
        let userBBirthChart = null;
        try {
          const promises = [fetchRelationshipAnalysis(compositeId)];
          if (found.userA_id && found.userB_id) {
            promises.push(
              fetchUser(found.userA_id).then((user) => user?.birthChart).catch(() => null),
              fetchUser(found.userB_id).then((user) => user?.birthChart).catch(() => null)
            );
          }
          const [analysis, chartA, chartB] = await Promise.all(promises);
          analysisData = analysis;
          userABirthChart = chartA || null;
          userBBirthChart = chartB || null;
        } catch (analysisError) {
          console.warn('Could not fetch analysis data:', analysisError);
        }

        if (!cancelled) {
          setRelationship({
            ...found,
            ...(analysisData || {}),
            ...(userABirthChart && { userA_birthChart: userABirthChart }),
            ...(userBBirthChart && { userB_birthChart: userBBirthChart }),
          });
        }
      } catch (fetchError) {
        console.error('Error loading celebrity relationship:', fetchError);
        if (!cancelled) setError('Failed to load relationship data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (compositeId) loadRelationshipData();
    else {
      setError('Relationship not found.');
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [compositeId]);

  const chartA = relationship?.userA_birthChart || null;
  const chartB = relationship?.userB_birthChart || null;
  const compositeChart = relationship?.compositeChart || null;
  const placementsA = useMemo(() => toChartScenePlacements(chartA?.planets || []), [chartA?.planets]);
  const placementsB = useMemo(() => toChartScenePlacements(chartB?.planets || []), [chartB?.planets]);
  const synastryAspects = useMemo(
    () => toSynastrySceneAspects(relationship?.synastryAspects || []),
    [relationship?.synastryAspects]
  );

  // idle tour: cycle partner A's planets, lighting each one's aspect web
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

  useEffect(() => {
    if (activeSection !== 'scores' || tourBodies.length === 0) return undefined;
    const id = setInterval(
      () => setTourIndex((index) => (index + 1) % tourBodies.length),
      3200
    );
    return () => clearInterval(id);
  }, [activeSection, tourBodies.length]);

  const tourBody =
    activeSection === 'scores' && tourBodies.length
      ? tourBodies[tourIndex % tourBodies.length]
      : null;
  const compositePlacements = useMemo(
    () => toChartScenePlacements(compositeChart?.planets || []),
    [compositeChart?.planets]
  );
  const compositeAspects = useMemo(
    () => toChartSceneAspects(compositeChart?.aspects || []),
    [compositeChart?.aspects]
  );

  if (loading) return <PageState>Bringing the two skies together…</PageState>;
  if (error || !relationship) return <PageState error>{error || 'Relationship not found.'}</PageState>;

  const hasAnalysis = Boolean(
    relationship?.completeAnalysis && Object.keys(relationship.completeAnalysis).length > 0
  );
  const relationshipScoredItems = relationship?.scoredItems
    || relationship?.clusterAnalysis?.scoredItems
    || relationship?.clusterScoring?.scoredItems
    || [];
  const userAName = getRelationshipName(relationship, 'userA', 'Partner A');
  const userBName = getRelationshipName(relationship, 'userB', 'Partner B');
  const shortA = firstName(userAName);
  const shortB = firstName(userBName);
  const overall = relationship?.relationshipAnalysisStatus?.clusterScoring?.overall
    || relationship?.clusterScoring?.overall
    || relationship?.clusterAnalysis?.overall;
  const archetype = getRelationshipCardSummary(overall);
  const archetypeLabel = archetype.cardHeadline || archetype.cardLabel || archetype.label;
  const canDrawRelationship = placementsA.length > 0 && placementsB.length > 0;

  const handleAsk = () => {
    if (!isFullyAuthenticated) {
      navigate('/signUp');
      return;
    }
    setAskOpen((open) => !open);
  };

  const tabContent = {
    scores: (
      <ScoresTab
        relationship={relationship}
        hasAnalysis={hasAnalysis}
        onNavigateToAnalysis={() => setActiveSection('analysis')}
        compositeId={compositeId}
        isCelebrity
      />
    ),
    overview: <RelationshipOverviewTab relationship={relationship} compositeId={compositeId} isCelebrity />,
    composite: <CompositeTab relationship={relationship} compositeId={compositeId} isCelebrity />,
    charts: <ChartsTab relationship={relationship} compositeId={compositeId} isCelebrity />,
    analysis: (
      <RelationshipAnalysisTab
        relationship={relationship}
        compositeId={compositeId}
        onAnalysisComplete={() => {}}
        isCelebrity
      />
    ),
  };

  return (
    <div className="ink-page ink-relationship public-celeb-relationship">
      <InkNav variant="marketing" marketingLinks={MARKETING_LINKS} />

      <header className="ink-relationship__header pcr-header">
        <Link className="pcr-back" to="/celebrity-relationships">← Celebrity relationships</Link>
        <h1>{shortA} <span>&amp;</span> {shortB}</h1>
        <p>Public synastry &amp; composite reading</p>
      </header>

      <nav className="ink-tabs ink-relationship__tabs pcr-tabs" role="tablist" aria-label="Celebrity relationship sections">
        {TABS.map((tab) => (
          <button
            type="button"
            role="tab"
            id={`pcr-tab-${tab.id}`}
            aria-controls={`pcr-panel-${tab.id}`}
            aria-selected={activeSection === tab.id}
            className={`ink-tab${activeSection === tab.id ? ' on' : ''}`}
            onClick={() => setActiveSection(tab.id)}
            key={tab.id}
          >
            <span className="ink-tab-roman">{tab.roman}</span>
            <span className="ink-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main>
        {TABS.map((tab) => (
          <section
            className={`ink-panel pcr-panel${activeSection === tab.id ? ' show' : ''}`}
            id={`pcr-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`pcr-tab-${tab.id}`}
            aria-hidden={activeSection !== tab.id}
            key={tab.id}
          >
            {tab.id === 'scores' ? (
              <div className="ink-wrap">
                <div className="ink-relationship__partners pcr-partners">
                  <PartnerSummary
                    name={userAName}
                    birthLine={partnerBirthLine(relationship, 'userA')}
                    chart={chartA}
                  />
                  <div className="ink-relationship__knot" aria-hidden="true">
                    <svg viewBox="0 0 120 120">
                      <circle cx="45" cy="60" r="34" fill="none" stroke="#b08d3e" strokeWidth="1.3" />
                      <circle cx="75" cy="60" r="34" fill="none" stroke="#4a6e9e" strokeWidth="1.3" />
                      <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fontSize="15" fill="#3437a8">✦</text>
                    </svg>
                  </div>
                  <PartnerSummary
                    name={userBName}
                    birthLine={partnerBirthLine(relationship, 'userB')}
                    chart={chartB}
                  />
                </div>

                <div className="ink-relationship__overview-grid pcr-overview-grid">
                  <article className="pcr-overview-copy">
                    <div className="ink-eyebrow">Relationship portrait</div>
                    <h2>Two charts, <span className="ink-italic">one weather system.</span></h2>
                    {archetypeLabel && <p className="ink-relationship__archetype">“{archetypeLabel}”</p>}
                    {archetype.blurb && <p className="pcr-archetype-blurb">{archetype.blurb}</p>}
                    <p className="pcr-score-intro">
                      The five relationship themes below show where this pairing flows, intensifies,
                      steadies, and asks both people to grow.
                    </p>
                  </article>

                  <div className="ink-relationship__wheel-column">
                    <div className="ink-relationship__medallion ink-relationship__medallion--overview">
                      {canDrawRelationship ? (
                        <div className="ink-relationship__scene" aria-label={`${userAName} and ${userBName} relationship chart`}>
                          <ChartScene
                            background="#f5eee5"
                            theme="ink"
                            natal={[]}
                            natalAspects={[]}
                            topDown
                            disableZoom
                            paused={activeSection !== 'scores'}
                            relationship={{
                              a: placementsA,
                              b: placementsB,
                              nameA: shortA,
                              nameB: shortB,
                              blend: 1,
                              comp: 0,
                              synastryAspects,
                              compositePlacements,
                              compositeAspects,
                              highlightA: tourBody ? [tourBody] : undefined,
                            }}
                          />
                        </div>
                      ) : (
                        <div className="ink-relationship__scene-empty">
                          <span aria-hidden="true">✦</span>
                          <p>Both birth charts are needed to draw this relationship wheel.</p>
                        </div>
                      )}
                      <span className="ink-annot pcr-wheel-annot">{shortA} inner, {shortB} outer ↓</span>
                    </div>
                    <p className="pcr-wheel-caption"><span aria-hidden="true" /> Real ephemeris · synastry bi-wheel</p>
                  </div>
                </div>
                <div className="pcr-score-content">{tabContent.scores}</div>
              </div>
            ) : (
              <div className="ink-wrap pcr-tab-content">{tabContent[tab.id]}</div>
            )}

            <div className="ink-wrap">
              {isFullyAuthenticated ? (
                <div className="pcr-ask-inline"><AskStelliumCta hasFullAccess onActivate={handleAsk} /></div>
              ) : (
                (tab.id === 'scores' || tab.id === 'analysis') && <ConversionCta />
              )}
            </div>
          </section>
        ))}
      </main>

      <section className="pcr-bottom-cta">
        <div className="ink-wrap pcr-bottom-cta__inner">
          <p>There is a chart between every two people.</p>
          <Link className="ink-btn ink-btn--navy" to="/signUp">Get started ✳</Link>
        </div>
      </section>

      <InkPublicFooter />

      {isFullyAuthenticated && (
        <AskStelliumPanel
          isOpen={askOpen}
          onClose={() => setAskOpen(false)}
          contentType="relationship"
          contentId={compositeId}
          disableHistory
          relationshipScoredItems={relationshipScoredItems}
          contextLabel={`${userAName} & ${userBName}`}
          placeholderText="Ask about this celebrity relationship..."
          suggestedQuestions={[
            'What are the strongest dynamics in this relationship?',
            'Where is the most creative chemistry?',
            'What tension defines this pairing?',
          ]}
        />
      )}
    </div>
  );
}

export default PublicCelebrityRelationship;
