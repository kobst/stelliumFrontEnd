import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCelebrityRelationships, fetchCelebrities, fetchRelationshipAnalysis } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import { getRelationshipSummary } from '../Utilities/relationshipSummary';
import './PublicCelebrityRelationships.css';

const PORTRAIT_TONES = ['lilac', 'gold', 'cyan', 'rose', 'sage', 'plum'];

const CLUSTER_ICONS = {
  Harmony: '\u{1F495}',
  Passion: '\u{1F525}',
  Connection: '\u{1F9E0}',
  Stability: '\u{1F48E}',
  Growth: '\u{1F331}'
};
const ORDERED_CLUSTERS = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];
const CLUSTER_SHORT = {
  Harmony: 'HAR',
  Passion: 'PAS',
  Connection: 'CON',
  Stability: 'STA',
  Growth: 'GRO'
};

const ARCHETYPE_META = {
  'Lightning in a Bottle': { icon: '⚡', meta: 'High harmony · High passion' },
  'Static Charge':         { icon: '\u{1F525}', meta: 'Magnetic · Highly active · Easy-flowing' },
  'Slow Orbit':            { icon: '\u{1F319}', meta: 'Quiet steadiness · Soft gravity' },
  'Live Wire':             { icon: '⚡', meta: 'Charged · Quick switching' },
  'Quiet Balance':         { icon: '\u{1F4A7}', meta: 'Even tone · Reliable' },
  'Iron & Honey':          { icon: '\u{1F30A}', meta: 'Edge meets ease' },
  'Twin Signal':           { icon: '✦', meta: 'Mirrored minds' },
  'Crossed Skies':         { icon: '❈', meta: 'Different weather · Different rhythms' }
};
const DEFAULT_META = { icon: '✨', meta: 'Cosmic chemistry' };

function scoreBand(score) {
  if (typeof score !== 'number') return 'gold';
  if (score >= 80) return 'green';
  if (score >= 50) return 'gold';
  return 'orange';
}

function getUserName(rel, prefix) {
  const first = rel?.[`${prefix}_firstName`];
  const last = rel?.[`${prefix}_lastName`];
  if (first || last) return `${first || ''} ${last || ''}`.trim();
  return rel?.[`${prefix}_name`] || 'Unknown';
}

function getUserFirstName(rel, prefix) {
  const first = rel?.[`${prefix}_firstName`];
  if (first) return first;
  const name = rel?.[`${prefix}_name`];
  if (name) return String(name).split(' ')[0];
  return 'Unknown';
}

function getUserPhoto(rel, prefix) {
  return rel?.[`${prefix}_profilePhotoUrl`] || rel?.[`${prefix}_photoUrl`] || null;
}

function getClusterScores(rel) {
  const ca = rel?.relationshipAnalysisStatus?.clusterScoring
    || rel?.clusterScoring
    || rel?.clusterAnalysis
    || {};
  const clusters = ca?.clusters || {};
  const out = {};
  ORDERED_CLUSTERS.forEach((c) => {
    const s = clusters?.[c]?.score;
    out[c] = typeof s === 'number' ? Math.round(s) : 0;
  });
  return out;
}

function getOverall(rel) {
  return rel?.relationshipAnalysisStatus?.clusterScoring?.overall
    || rel?.clusterScoring?.overall
    || rel?.clusterAnalysis?.overall
    || null;
}

function getArchetype(rel) {
  const overall = getOverall(rel);
  const { label, blurb } = getRelationshipSummary(overall);
  return { label: label || 'Cosmic Pair', blurb: blurb || '' };
}

function getSunSign(rel, prefix) {
  const planets = rel?.[`${prefix}_planets`] || rel?.[`${prefix}_birthChart`]?.planets;
  if (!Array.isArray(planets)) return null;
  return planets.find((p) => p?.name === 'Sun')?.sign || null;
}

function generateStardustCircles(count, seed) {
  const rng = (i, s) => {
    const x = Math.sin((i + s) * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  const circles = [];
  for (let i = 0; i < count; i += 1) {
    const cx = rng(i * 2, seed) * 100;
    const cy = rng(i * 2 + 1, seed) * 100;
    const r = rng(i * 3 + 5, seed) * 0.18 + 0.06;
    const o = rng(i * 4 + 11, seed) * 0.6 + 0.1;
    circles.push(
      <circle key={i} cx={cx.toFixed(2)} cy={cy.toFixed(2)} r={r.toFixed(2)} fill="#cabeff" opacity={o.toFixed(2)} />
    );
  }
  return circles;
}

function Stardust({ seed = 1, density = 80 }) {
  const circles = useMemo(() => generateStardustCircles(density, seed), [density, seed]);
  return (
    <svg className="crl-stardust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {circles}
    </svg>
  );
}

function WordmarkGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="15" cy="6" r="2.2" fill="#cabeff" />
      <ellipse cx="15" cy="6" rx="3.4" ry="0.9" stroke="#cabeff" strokeOpacity="0.55" strokeWidth="0.6" fill="none" transform="rotate(-18 15 6)" />
      <circle cx="11" cy="12" r="3.2" fill="#cabeff" />
      <circle cx="9" cy="17" r="1.1" fill="#cabeff" opacity="0.7" />
      <path d="M3 19 Q11 22 19 19" stroke="#cabeff" strokeWidth="0.6" fill="none" opacity="0.6" />
    </svg>
  );
}

function PortraitSilhouette({ size = 'sm', seed }) {
  if (size === 'lg') {
    return (
      <svg className="crl-portrait__silhouette" viewBox="0 0 280 350" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id={`crlSilLg-${seed}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="140" cy="155" rx="58" ry="68" fill={`url(#crlSilLg-${seed})`} />
        <ellipse cx="140" cy="120" rx="34" ry="42" fill="rgba(0,0,0,0.20)" />
        <ellipse cx="140" cy="290" rx="90" ry="48" fill="rgba(0,0,0,0.22)" />
      </svg>
    );
  }
  return (
    <svg className="crl-portrait__silhouette" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <ellipse cx="100" cy="80" rx="42" ry="48" fill="rgba(255,255,255,0.18)" />
      <ellipse cx="100" cy="58" rx="22" ry="28" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

function Portrait({ tone, photoUrl, alt, large, seed }) {
  return (
    <div className={`crl-portrait ${tone}`}>
      {photoUrl ? (
        <img className="crl-portrait__img" src={photoUrl} alt={alt || ''} loading="lazy" />
      ) : (
        <>
          <Stardust seed={seed + 17} density={30} />
          <PortraitSilhouette size={large ? 'lg' : 'sm'} seed={seed} />
        </>
      )}
    </div>
  );
}

function TwinPortraits({ rel, tones, large = false }) {
  const aPhoto = getUserPhoto(rel, 'userA');
  const bPhoto = getUserPhoto(rel, 'userB');
  const aName = getUserName(rel, 'userA');
  const bName = getUserName(rel, 'userB');
  const seedA = (rel?._id || aName).length;
  const seedB = (rel?._id || bName).length + 5;
  return (
    <div className="crl-twin-ports">
      <Portrait tone={tones[0]} photoUrl={aPhoto} alt={aName} large={large} seed={seedA} />
      <Portrait tone={tones[1]} photoUrl={bPhoto} alt={bName} large={large} seed={seedB} />
      <div className="crl-twin-ports__seam" />
      <div className="crl-twin-ports__vignette" />
    </div>
  );
}

function StatsStrip({ scores }) {
  return (
    <div className="crl-stats">
      {ORDERED_CLUSTERS.map((cluster) => {
        const v = scores[cluster];
        const band = scoreBand(v);
        return (
          <div className="crl-stat" key={cluster}>
            <div className="crl-stat__ic">{CLUSTER_ICONS[cluster]}</div>
            <div className={`crl-stat__v ${band}`}>{v}</div>
            <div className="crl-stat__l">{CLUSTER_SHORT[cluster]}</div>
          </div>
        );
      })}
    </div>
  );
}

function HeroCoupleCard({ rel, tones, onClick }) {
  const { label, blurb } = getArchetype(rel);
  const scores = getClusterScores(rel);
  const userAFirst = getUserFirstName(rel, 'userA');
  const userBFirst = getUserFirstName(rel, 'userB');
  return (
    <button type="button" className="crl-hero-couple" onClick={onClick}>
      <TwinPortraits rel={rel} tones={tones} large />
      <div className="crl-hero-couple__body">
        <div>
          <div className="crl-hero-couple__ribbon">{label}</div>
          <h2 className="crl-hero-couple__names">{userAFirst} &amp; {userBFirst}</h2>
          {blurb && <p>{blurb}</p>}
        </div>
        <div>
          <StatsStrip scores={scores} />
          <div>
            <span className="crl-hero-couple__more">Read full analysis →</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function PairCard({ rel, tones, onClick }) {
  const { label } = getArchetype(rel);
  const scores = getClusterScores(rel);
  const userAFirst = getUserFirstName(rel, 'userA');
  const userBFirst = getUserFirstName(rel, 'userB');
  const sunA = getSunSign(rel, 'userA');
  const sunB = getSunSign(rel, 'userB');
  const signs = [sunA, sunB].filter(Boolean);

  return (
    <button type="button" className="crl-pair-card" onClick={onClick}>
      <div style={{ position: 'relative' }}>
        <TwinPortraits rel={rel} tones={tones} />
        <div className="crl-pair-card__arche-pill">{label}</div>
      </div>
      <div className="crl-pair-card__body">
        <h3 className="crl-pair-card__names">{userAFirst} &amp; {userBFirst}</h3>
        {signs.length > 0 && (
          <div className="crl-pair-card__signs">
            {signs[0] && <span className="pri">{signs[0]}</span>}
            {signs.length === 2 && <> · {signs[1]}</>}
          </div>
        )}
        <StatsStrip scores={scores} />
      </div>
    </button>
  );
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
        const [rels, celebs] = await Promise.all([
          getCelebrityRelationships(100),
          fetchCelebrities()
        ]);
        if (cancelled) return;

        const photoMap = {};
        const planetMap = {};
        if (Array.isArray(celebs)) {
          celebs.forEach((c) => {
            if (!c?._id) return;
            if (c.profilePhotoUrl) photoMap[c._id] = c.profilePhotoUrl;
            if (Array.isArray(c.birthChart?.planets)) planetMap[c._id] = c.birthChart.planets;
          });
        }

        const baseEnriched = (rels || []).map((rel) => ({
          ...rel,
          userA_profilePhotoUrl: rel.userA_profilePhotoUrl || photoMap[rel.userA_id] || null,
          userB_profilePhotoUrl: rel.userB_profilePhotoUrl || photoMap[rel.userB_id] || null,
          userA_planets: rel.userA_planets || planetMap[rel.userA_id] || null,
          userB_planets: rel.userB_planets || planetMap[rel.userB_id] || null
        }));

        // Render names + photos immediately while we fetch analyses
        setRelationships(baseEnriched);
        setLoading(false);

        // Fan-out analysis fetches — adds clusterScoring / archetype per relationship.
        // fetchRelationshipAnalysis can throw 404 for relationships without analysis;
        // wrap each call so one failure doesn't sink the rest.
        const analysisResults = await Promise.all(
          baseEnriched.map((rel) =>
            fetchRelationshipAnalysis(rel._id)
              .then((analysis) => ({ rel, analysis }))
              .catch(() => ({ rel, analysis: null }))
          )
        );
        if (cancelled) return;

        const merged = analysisResults.map(({ rel, analysis }) => ({
          ...rel,
          ...(analysis || {})
        }));
        setRelationships(merged);
      } catch (err) {
        console.error('Error loading celebrity relationships:', err);
        if (!cancelled) {
          setError('Unable to load celebrity relationships right now.');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return relationships.filter((rel) => {
      const { label } = getArchetype(rel);
      if (archetypeFilter !== 'all' && label !== archetypeFilter) return false;
      if (!q) return true;
      const aFirst = getUserFirstName(rel, 'userA').toLowerCase();
      const bFirst = getUserFirstName(rel, 'userB').toLowerCase();
      const aName = getUserName(rel, 'userA').toLowerCase();
      const bName = getUserName(rel, 'userB').toLowerCase();
      const arche = label.toLowerCase();
      return (
        aFirst.includes(q) ||
        bFirst.includes(q) ||
        aName.includes(q) ||
        bName.includes(q) ||
        arche.includes(q)
      );
    });
  }, [relationships, searchTerm, archetypeFilter]);

  const archetypeCounts = useMemo(() => {
    const counts = {};
    relationships.forEach((rel) => {
      const { label } = getArchetype(rel);
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }, [relationships]);

  const archetypeOptions = useMemo(() => {
    const labels = Object.keys(archetypeCounts).sort(
      (a, b) => archetypeCounts[b] - archetypeCounts[a]
    );
    return labels;
  }, [archetypeCounts]);

  const featured = filtered[0];
  const remaining = filtered.slice(1);

  const groupedByArchetype = useMemo(() => {
    const groups = new Map();
    remaining.forEach((rel) => {
      const { label } = getArchetype(rel);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(rel);
    });
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [remaining]);

  const tonesForIndex = (i) => [
    PORTRAIT_TONES[(i * 2) % PORTRAIT_TONES.length],
    PORTRAIT_TONES[(i * 2 + 1) % PORTRAIT_TONES.length]
  ];

  const totalCount = relationships.length;

  const handleBackHome = () => navigate('/');
  const handleSignIn = () => navigate('/login');
  const handleDashboard = () => navigate(`/dashboard/${stelliumUser._id}`);
  const handleSignUp = () => navigate('/birthChartEntry');
  const handleRelationshipClick = (rel) => {
    navigate(`/celebrity-relationships/${rel._id}`);
  };

  const todayLabel = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return (
    <div className="crl-page">
      {/* ─── NAV ─────────────────────────────────────────────── */}
      <nav className="crl-nav">
        <div className="crl-nav__inner">
          <button type="button" className="crl-wordmark" onClick={handleBackHome} aria-label="Stellium home">
            <span className="crl-wordmark__glyph"><WordmarkGlyph /></span>
            <span className="crl-wordmark__name">Stellium</span>
          </button>
          <div className="crl-nav__links">
            <button type="button" className="crl-nav__link" onClick={handleBackHome}>Home</button>
            <button type="button" className="crl-nav__link" onClick={() => navigate('/horoscopes/weekly')}>Horoscopes</button>
            <button type="button" className="crl-nav__link" onClick={() => navigate('/celebrities')}>Charts</button>
            <span className="crl-nav__link active">Couples</span>
            <button type="button" className="crl-nav__link" onClick={() => navigate('/#pricing')}>Pricing</button>
            {stelliumUser ? (
              <button type="button" className="crl-btn crl-btn--primary" onClick={handleDashboard}>
                Go to Dashboard <span style={{ opacity: 0.65 }}>→</span>
              </button>
            ) : (
              <>
                <button type="button" className="crl-btn crl-btn--ghost" onClick={handleSignIn}>Sign in</button>
                <button type="button" className="crl-btn crl-btn--primary" onClick={handleSignUp}>
                  Start free <span style={{ opacity: 0.65 }}>→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="crl-hero">
        <div className="crl-halo lilac crl-hero__halo-c" />
        <Stardust seed={1} density={80} />

        <div className="crl-wrap">
          <div className="crl-hero__top">
            <button type="button" className="crl-back-link" onClick={handleBackHome}>
              <span className="crl-back-link__arrow">←</span> Back to home
            </button>
            <span className="crl-hero__top-right">
              <span className="crl-hero__dot" />
              {loading ? 'Loading the database…' : `${totalCount} ${totalCount === 1 ? 'relationship' : 'relationships'} in the database`}
            </span>
          </div>

          <div className="crl-hero__eyebrow">
            <span className="crl-hero__bar" />
            <span className="crl-eyebrow gold">Explore celebrity relationships</span>
            <span className="crl-hero__bar crl-hero__bar--r" />
          </div>

          <h1>The sky <span className="accent">between two people.</span></h1>
          <p className="crl-hero__lede">
            Synastry, composite, and a romantic archetype for some of the most-watched couples in the world.
          </p>

          <div className="crl-controls">
            <label className="crl-search">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(236,232,255,0.5)" strokeWidth="1.6">
                <circle cx="8" cy="8" r="5.5" />
                <line x1="12" y1="12" x2="16" y2="16" />
              </svg>
              <input
                placeholder="Search couples or archetypes…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search celebrity relationships"
              />
              <span className="crl-search__kbd">⌘ K</span>
            </label>

            {archetypeOptions.length > 0 && (
              <div className="crl-filters">
                <button
                  type="button"
                  className={`crl-filter${archetypeFilter === 'all' ? ' active' : ''}`}
                  onClick={() => setArchetypeFilter('all')}
                >
                  All <span className="crl-filter__n">{totalCount}</span>
                </button>
                {archetypeOptions.map((label) => {
                  const meta = ARCHETYPE_META[label] || DEFAULT_META;
                  return (
                    <button
                      key={label}
                      type="button"
                      className={`crl-filter${archetypeFilter === label ? ' active' : ''}`}
                      onClick={() => setArchetypeFilter(label)}
                    >
                      <span className="crl-filter__ic">{meta.icon}</span>
                      {label}
                      <span className="crl-filter__n">{archetypeCounts[label]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── FEATURED ────────────────────────────────────────── */}
      {!loading && featured && (
        <section className="crl-featured">
          <div className="crl-halo lilac crl-featured__halo-l" />
          <div className="crl-halo gold crl-featured__halo-r" />

          <div className="crl-wrap">
            <div className="crl-row-head">
              <div>
                <div className="crl-eyebrow gold">This week’s couple</div>
                <h2>The chart we keep <span className="italic">coming back to.</span></h2>
              </div>
              <div className="crl-row-head__count">Featured · {todayLabel}</div>
            </div>

            <HeroCoupleCard
              rel={featured}
              tones={tonesForIndex(0)}
              onClick={() => handleRelationshipClick(featured)}
            />
          </div>
        </section>
      )}

      {/* ─── GRID ────────────────────────────────────────────── */}
      <section className="crl-grid-section">
        <div className="crl-wrap">
          <div className="crl-row-head">
            <div>
              <div className="crl-eyebrow gold">All relationships</div>
              <h2>{filtered.length} {filtered.length === 1 ? 'couple' : 'couples'}, <span className="italic">{filtered.length === 1 ? 'one weather system.' : `${filtered.length} weather systems.`}</span></h2>
            </div>
            <div className="crl-row-head__count">Sorted by archetype</div>
          </div>

          {loading && <div className="crl-loading">Loading celebrity relationships…</div>}
          {!loading && error && <div className="crl-empty">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="crl-empty">No couples match this filter — try clearing your search or picking a different archetype.</div>
          )}

          {!loading && !error && groupedByArchetype.map(([archetype, group], groupIdx) => {
            const meta = ARCHETYPE_META[archetype] || DEFAULT_META;
            return (
              <div key={archetype}>
                <div className="crl-arche-head">
                  <span className="crl-arche-head__letter">{archetype}</span>
                  <span className="crl-arche-head__meta">{meta.meta}</span>
                </div>
                <div className="crl-pair-grid">
                  {group.map((rel, i) => (
                    <PairCard
                      key={rel._id}
                      rel={rel}
                      tones={tonesForIndex(groupIdx * 7 + i + 1)}
                      onClick={() => handleRelationshipClick(rel)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
      <section className="crl-cta-banner">
        <div className="crl-halo lilac crl-cta-banner__halo-c" />
        <Stardust seed={9} density={60} />

        <div className="crl-wrap">
          <div className="crl-eyebrow gold" style={{ marginBottom: 20, display: 'inline-block' }}>
            Make it personal
          </div>
          {stelliumUser ? (
            <>
              <h2>Add anyone — see where your sky <span className="italic">meets theirs.</span></h2>
              <p>Pick a couple above to read the full archetype, or open your dashboard to add your own.</p>
              <button type="button" className="crl-btn crl-btn--primary" onClick={handleDashboard}>
                Go to your dashboard →
              </button>
            </>
          ) : (
            <>
              <h2>Where does <span className="italic">your sky</span> meet someone else’s?</h2>
              <p>Sign up to compare your chart with anyone — partner, crush, ex, friend — and get a full archetype read.</p>
              <button type="button" className="crl-btn crl-btn--primary" onClick={handleSignUp}>
                Create your free account →
              </button>
            </>
          )}
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="crl-footer">
        <div className="crl-wrap">
          <div className="crl-foot-grid">
            <div className="crl-foot-brand">
              <button type="button" className="crl-wordmark" onClick={handleBackHome}>
                <span className="crl-wordmark__glyph"><WordmarkGlyph /></span>
                <span className="crl-wordmark__name">Stellium</span>
              </button>
              <p className="crl-foot-brand__blurb">
                Personalized astrology, powered by AI. Your chart, read like a person — not a horoscope column.
              </p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/horoscopes/weekly">Horoscopes</a></li>
                <li><a href="/celebrities">Celebrity charts</a></li>
                <li><a href="/celebrity-relationships">Celebrity couples</a></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:hello@stellium.ai">hello@stellium.ai</a></li>
                <li><a href="/help">Help & Support</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="/privacy-policy">Privacy Policy</a></li>
                <li><a href="/terms-of-service">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="crl-foot-bot">
            <span>© {new Date().getFullYear()} Stellium · Personalized astrology, powered by AI.</span>
            <span className="crl-foot-bot__italic">Made under a generous sky.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicCelebrityRelationships;
