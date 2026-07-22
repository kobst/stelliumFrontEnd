import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCelebrities,
  fetchRelationshipAnalysis,
  getCelebrityRelationships,
} from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import { getRelationshipCardSummary, relationshipStrengthWord } from '../Utilities/relationshipSummary';
import InkNav from '../UI/ink/InkNav';
import InkPublicFooter from '../UI/publicInk/InkPublicFooter';
import '../styles/ink.css';
import './PublicCelebrityRelationships.css';

const PORTRAIT_TONES = ['lilac', 'gold', 'blue', 'rose', 'sage', 'plum'];
const ORDERED_CLUSTERS = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];
const CLUSTER_GLYPHS = {
  Harmony: '♡',
  Passion: '△',
  Connection: '☌',
  Stability: '◇',
  Growth: '✦',
};
const MARKETING_LINKS = [
  { label: 'Celebrity charts', href: '/celebrities' },
  { label: 'Relationships', href: '/celebrity-relationships' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/#pricing' },
];

function getUserName(relationship, prefix) {
  const first = relationship?.[`${prefix}_firstName`];
  const last = relationship?.[`${prefix}_lastName`];
  if (first || last) return `${first || ''} ${last || ''}`.trim();
  return relationship?.[`${prefix}_name`] || 'Unknown';
}

function getUserFirstName(relationship, prefix) {
  const first = relationship?.[`${prefix}_firstName`];
  if (first) return first;
  const name = relationship?.[`${prefix}_name`];
  return name ? String(name).split(' ')[0] : 'Unknown';
}

function getUserPhoto(relationship, prefix) {
  return relationship?.[`${prefix}_profilePhotoUrl`] || relationship?.[`${prefix}_photoUrl`] || null;
}

function getSunSign(relationship, prefix) {
  const planets = relationship?.[`${prefix}_planets`] || relationship?.[`${prefix}_birthChart`]?.planets;
  if (!Array.isArray(planets)) return null;
  return planets.find((planet) => planet?.name === 'Sun')?.sign || null;
}

function getClusterScores(relationship) {
  const clusterAnalysis = relationship?.relationshipAnalysisStatus?.clusterScoring
    || relationship?.clusterScoring
    || relationship?.clusterAnalysis
    || {};
  const clusters = clusterAnalysis?.clusters || {};
  const scores = {};
  ORDERED_CLUSTERS.forEach((cluster) => {
    const score = clusters?.[cluster]?.score;
    scores[cluster] = typeof score === 'number' ? Math.round(score) : 0;
  });
  return scores;
}

function getOverall(relationship) {
  return relationship?.relationshipAnalysisStatus?.clusterScoring?.overall
    || relationship?.clusterScoring?.overall
    || relationship?.clusterAnalysis?.overall
    || null;
}

function getArchetype(relationship) {
  const overall = getOverall(relationship);
  const { cardHeadline, blurb } = getRelationshipCardSummary(overall);
  const scores = getClusterScores(relationship);
  const fallbackStrength = relationshipStrengthWord(scores.overall);
  return {
    label: cardHeadline || fallbackStrength || 'Cosmic Pair',
    blurb: blurb || '',
  };
}

function getInitials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '✦';
}

function DuoPortrait({ relationship, tones }) {
  return (
    <div className="pcrl-duo" aria-label={`${getUserName(relationship, 'userA')} and ${getUserName(relationship, 'userB')}`}>
      {['userA', 'userB'].map((prefix, index) => {
        const name = getUserName(relationship, prefix);
        const photo = getUserPhoto(relationship, prefix);
        return (
          <div className={`pcrl-duo__portrait pcrl-duo__portrait--${tones[index]}`} key={prefix}>
            {photo ? <img src={photo} alt={name} loading="lazy" decoding="async" /> : <span>{getInitials(name)}</span>}
          </div>
        );
      })}
      <span className="pcrl-duo__join" aria-hidden="true">✦</span>
    </div>
  );
}

function ScoreStrip({ relationship }) {
  const scores = getClusterScores(relationship);
  return (
    <div className="pcrl-scores" aria-label="Relationship theme scores">
      {ORDERED_CLUSTERS.map((cluster) => (
        <span title={cluster} key={cluster}>
          <i aria-hidden="true">{CLUSTER_GLYPHS[cluster]}</i>
          <b>{scores[cluster]}</b>
        </span>
      ))}
    </div>
  );
}

function RelationshipCard({ relationship, tones, featured = false, onClick }) {
  const { label, blurb } = getArchetype(relationship);
  const firstA = getUserFirstName(relationship, 'userA');
  const firstB = getUserFirstName(relationship, 'userB');
  const sunA = getSunSign(relationship, 'userA');
  const sunB = getSunSign(relationship, 'userB');

  return (
    <button
      type="button"
      className={`pcrl-card${featured ? ' pcrl-card--featured' : ''}`}
      onClick={onClick}
    >
      <DuoPortrait relationship={relationship} tones={tones} />
      <div className="pcrl-card__copy">
        <p className="pcrl-card__archetype">“{label}”</p>
        <h3>{firstA} <span>&amp;</span> {firstB}</h3>
        {(sunA || sunB) && (
          <p className="pcrl-card__signs">
            {sunA && `☉ ${sunA}`}{sunA && sunB && ' · '}{sunB && `☉ ${sunB}`}
          </p>
        )}
        {featured && blurb && <p className="pcrl-card__blurb">{blurb}</p>}
        <ScoreStrip relationship={relationship} />
      </div>
      <span className="pcrl-card__arrow" aria-hidden="true">Read the relationship ↗</span>
    </button>
  );
}

function RelationshipSkeleton() {
  return <div className="pcrl-card pcrl-card--skeleton" aria-hidden="true" />;
}

function PublicCelebrityRelationships() {
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [archetypeFilter, setArchetypeFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [relationshipData, celebrities] = await Promise.all([
          getCelebrityRelationships(100),
          fetchCelebrities(),
        ]);
        if (cancelled) return;

        const photoMap = {};
        const planetMap = {};
        if (Array.isArray(celebrities)) {
          celebrities.forEach((celebrity) => {
            if (!celebrity?._id) return;
            if (celebrity.profilePhotoUrl) photoMap[celebrity._id] = celebrity.profilePhotoUrl;
            if (Array.isArray(celebrity.birthChart?.planets)) planetMap[celebrity._id] = celebrity.birthChart.planets;
          });
        }

        const baseEnriched = (relationshipData || []).map((relationship) => ({
          ...relationship,
          userA_profilePhotoUrl: relationship.userA_profilePhotoUrl || photoMap[relationship.userA_id] || null,
          userB_profilePhotoUrl: relationship.userB_profilePhotoUrl || photoMap[relationship.userB_id] || null,
          userA_planets: relationship.userA_planets || planetMap[relationship.userA_id] || null,
          userB_planets: relationship.userB_planets || planetMap[relationship.userB_id] || null,
        }));

        setRelationships(baseEnriched);
        setLoading(false);

        const analysisResults = await Promise.all(baseEnriched.map((relationship) =>
          fetchRelationshipAnalysis(relationship._id)
            .then((analysis) => ({ relationship, analysis }))
            .catch(() => ({ relationship, analysis: null }))
        ));
        if (!cancelled) {
          setRelationships(analysisResults.map(({ relationship, analysis }) => ({
            ...relationship,
            ...(analysis || {}),
          })));
        }
      } catch (fetchError) {
        console.error('Error loading celebrity relationships:', fetchError);
        if (!cancelled) {
          setError('Unable to load celebrity relationships right now.');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return relationships.filter((relationship) => {
      const { label } = getArchetype(relationship);
      if (archetypeFilter !== 'all' && label !== archetypeFilter) return false;
      if (!query) return true;
      const terms = [
        getUserFirstName(relationship, 'userA'),
        getUserFirstName(relationship, 'userB'),
        getUserName(relationship, 'userA'),
        getUserName(relationship, 'userB'),
        label,
      ];
      return terms.some((term) => term.toLowerCase().includes(query));
    });
  }, [relationships, searchTerm, archetypeFilter]);

  const archetypeCounts = useMemo(() => {
    const counts = {};
    relationships.forEach((relationship) => {
      const { label } = getArchetype(relationship);
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }, [relationships]);

  const archetypeOptions = useMemo(
    () => Object.keys(archetypeCounts).sort((a, b) => archetypeCounts[b] - archetypeCounts[a]),
    [archetypeCounts]
  );

  const featured = filtered[0];
  const remaining = filtered.slice(1);
  const groupedByArchetype = useMemo(() => {
    const groups = new Map();
    remaining.forEach((relationship) => {
      const { label } = getArchetype(relationship);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(relationship);
    });
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [remaining]);

  const tonesForIndex = (index) => [
    PORTRAIT_TONES[(index * 2) % PORTRAIT_TONES.length],
    PORTRAIT_TONES[(index * 2 + 1) % PORTRAIT_TONES.length],
  ];

  const goToConversion = () => {
    if (stelliumUser?._id) navigate(`/dashboard/${stelliumUser._id}`);
    else navigate('/signUp');
  };

  return (
    <div className="ink-page public-celeb-relationships">
      <InkNav variant="marketing" marketingLinks={MARKETING_LINKS} />

      <main>
        <header className="pcrl-hero">
          <div className="ink-wrap">
            <div className="ink-eyebrow">Public relationship archive</div>
            <h1>The sky <span className="ink-italic">between two people.</span></h1>
            <p>Synastry, composite charts, and the archetypes behind relationships watched by the world.</p>

            <div className="pcrl-controls">
              <label className="pcrl-search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search couples or archetypes…"
                  aria-label="Search celebrity relationships"
                />
              </label>

              {archetypeOptions.length > 0 && (
                <div className="pcrl-filters" aria-label="Filter by relationship archetype">
                  <button
                    type="button"
                    className={archetypeFilter === 'all' ? 'on' : ''}
                    onClick={() => setArchetypeFilter('all')}
                  >
                    All <span>{relationships.length}</span>
                  </button>
                  {archetypeOptions.map((label) => (
                    <button
                      type="button"
                      className={archetypeFilter === label ? 'on' : ''}
                      onClick={() => setArchetypeFilter(label)}
                      key={label}
                    >
                      {label} <span>{archetypeCounts[label]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="pcrl-featured ink-band" aria-labelledby="pcrl-featured-title">
          <div className="ink-wrap">
            <div className="pcrl-section-head">
              <div className="ink-eyebrow">A relationship in focus</div>
              <h2 id="pcrl-featured-title">Begin with <span className="ink-italic">one shared orbit.</span></h2>
            </div>
            {loading && <RelationshipSkeleton />}
            {!loading && featured && (
              <RelationshipCard
                relationship={featured}
                tones={tonesForIndex(0)}
                featured
                onClick={() => navigate(`/celebrity-relationships/${featured._id}`)}
              />
            )}
            {!loading && error && <div className="pcrl-state" role="alert">{error}</div>}
            {!loading && !error && !featured && (
              <div className="pcrl-state">No relationships match this search or archetype.</div>
            )}
          </div>
        </section>

        <section className="pcrl-directory" aria-labelledby="pcrl-directory-title">
          <div className="ink-wrap">
            <div className="pcrl-section-head">
              <div className="ink-eyebrow">All relationships</div>
              <h2 id="pcrl-directory-title">Every pair has its <span className="ink-italic">own weather.</span></h2>
            </div>

            {loading && <div className="pcrl-grid">{Array.from({ length: 6 }, (_, i) => <RelationshipSkeleton key={i} />)}</div>}
            {!loading && !error && filtered.length === 1 && (
              <p className="pcrl-directory-note">The only matching relationship is featured above.</p>
            )}
            {!loading && !error && groupedByArchetype.map(([archetype, group], groupIndex) => (
              <section className="pcrl-archetype-group" aria-labelledby={`pcrl-${groupIndex}`} key={archetype}>
                <div className="pcrl-archetype-head">
                  <h3 id={`pcrl-${groupIndex}`}>“{archetype}”</h3>
                  <span>{group.length} {group.length === 1 ? 'relationship' : 'relationships'}</span>
                </div>
                <div className="pcrl-grid">
                  {group.map((relationship, index) => (
                    <RelationshipCard
                      relationship={relationship}
                      tones={tonesForIndex(groupIndex * 7 + index + 1)}
                      onClick={() => navigate(`/celebrity-relationships/${relationship._id}`)}
                      key={relationship._id}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="pcrl-conversion">
          <div className="ink-wrap pcrl-conversion__inner">
            <div>
              <div className="ink-eyebrow">Make it personal</div>
              <h2>Where does <span className="ink-italic">your sky</span> meet someone else’s?</h2>
              <p>Add a partner, friend, or crush and read the relationship between both charts.</p>
            </div>
            <button type="button" className="ink-btn ink-btn--navy" onClick={goToConversion}>
              {stelliumUser?._id ? 'Go to your dashboard ✳' : 'Get started ✳'}
            </button>
          </div>
        </section>
      </main>

      <InkPublicFooter />
    </div>
  );
}

export default PublicCelebrityRelationships;
