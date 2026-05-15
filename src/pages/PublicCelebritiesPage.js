import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCelebrities } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import { ZODIAC_SIGNS } from '../Utilities/zodiac';
import './PublicCelebritiesPage.css';

const PORTRAIT_TONES = ['lilac', 'gold', 'cyan', 'rose', 'sage', 'plum'];

const FEATURED_CAPTIONS = [
  'Quiet magnet — a sun that draws people closer.',
  'Sky-bright voice, ocean-deep stillness.',
  'Iron and honey in equal measure.',
  'Slow orbit, steady gravity.',
  'A chart built like a held breath.',
  'Half horizon, half hearth.'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const SIGN_LABELS = ZODIAC_SIGNS.reduce((acc, s) => {
  acc[s.value] = s.label;
  return acc;
}, {});

function normalizeSign(sign) {
  if (!sign) return null;
  return String(sign).trim().toLowerCase();
}

function getPlanetSign(celeb, name) {
  const planets = celeb?.birthChart?.planets || celeb?.planets;
  if (!Array.isArray(planets)) return null;
  return planets.find((p) => p?.name === name)?.sign || null;
}

function getAscendantSign(celeb) {
  const direct = celeb?.birthChart?.ascendant?.sign || celeb?.ascendant?.sign;
  if (direct) return direct;
  const houses = celeb?.birthChart?.houses;
  if (Array.isArray(houses) && houses[0]?.sign) return houses[0].sign;
  return null;
}

function getFullName(celeb) {
  return `${celeb?.firstName || ''} ${celeb?.lastName || ''}`.trim() || 'Untitled Chart';
}

function getSortLetter(celeb) {
  const last = celeb?.lastName?.trim();
  const first = celeb?.firstName?.trim();
  const source = last || first || '';
  const letter = source.charAt(0).toUpperCase();
  return ALPHABET.includes(letter) ? letter : '#';
}

function formatBirthDate(celeb) {
  const raw = celeb?.dateOfBirth || celeb?.birthDate;
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getUTCDate();
  const month = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function getProfilePhoto(celeb) {
  return celeb?.profilePhotoUrl || celeb?.photoUrl || null;
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
    <svg className="cc-stardust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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

function PortraitInner({ celeb, large }) {
  const photo = getProfilePhoto(celeb);
  const name = getFullName(celeb);
  if (photo) {
    return <img className="cc-portrait__img" src={photo} alt={name} loading="lazy" />;
  }
  const seed = (celeb?._id || name).length;
  const vbY = large ? 350 : 280;
  return (
    <>
      <Stardust seed={seed + 11} density={30} />
      <svg
        className="cc-portrait__silhouette"
        viewBox={`0 0 280 ${vbY}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <ellipse className="head" cx="140" cy={large ? 135 : 130} rx="48" ry={large ? 58 : 56} />
        <ellipse cx="140" cy={large ? 100 : 96} rx="28" ry={large ? 38 : 36} />
        <ellipse className="body" cx="140" cy={large ? 280 : 240} rx={large ? 92 : 84} ry={large ? 60 : 42} />
      </svg>
    </>
  );
}

function SunPill({ sunSign }) {
  if (!sunSign) return null;
  const normalized = normalizeSign(sunSign);
  const label = SIGN_LABELS[normalized] || sunSign;
  const iconPath = `/assets/signs/${normalized}.svg`;
  return (
    <span className="cc-portrait__top-pill">
      <img src={iconPath} alt="" aria-hidden="true" />
      {label} Sun
    </span>
  );
}

function FeatureCard({ celeb, tone, large, caption, onClick }) {
  const sunSign = getPlanetSign(celeb, 'Sun');
  const moonSign = getPlanetSign(celeb, 'Moon');
  const ascSign = getAscendantSign(celeb);
  const venusSign = getPlanetSign(celeb, 'Venus');
  const dateStr = formatBirthDate(celeb);

  return (
    <button
      type="button"
      className={`cc-feat${large ? ' cc-feat--large' : ''}`}
      onClick={onClick}
    >
      <div className={`cc-feat__ports cc-portrait ${tone}`}>
        <PortraitInner celeb={celeb} large={large} />
        <SunPill sunSign={sunSign} />
      </div>
      <div className="cc-feat__body">
        {dateStr && <div className="cc-feat__sub">{dateStr}</div>}
        <h3 className="cc-feat__name">{getFullName(celeb)}</h3>
        {caption && <div className="cc-feat__caption">{caption}</div>}
        {(sunSign || moonSign || ascSign || venusSign) && (
          <div className="cc-feat__meta">
            {sunSign && <span className="pri">☉ {SIGN_LABELS[normalizeSign(sunSign)] || sunSign}</span>}
            {moonSign && <span>☾ {SIGN_LABELS[normalizeSign(moonSign)] || moonSign}</span>}
            {ascSign && <span className="gold">↑ {SIGN_LABELS[normalizeSign(ascSign)] || ascSign}</span>}
            {venusSign && !large && <span>♀ {SIGN_LABELS[normalizeSign(venusSign)] || venusSign}</span>}
            {large && venusSign && <span>♀ {SIGN_LABELS[normalizeSign(venusSign)] || venusSign}</span>}
          </div>
        )}
      </div>
    </button>
  );
}

function GridCelebCard({ celeb, tone, onClick }) {
  const sunSign = getPlanetSign(celeb, 'Sun');
  const dateStr = formatBirthDate(celeb);
  return (
    <button type="button" className="cc-celeb-card" onClick={onClick}>
      <div className={`cc-celeb-card__ports cc-portrait ${tone}`}>
        <PortraitInner celeb={celeb} />
        <SunPill sunSign={sunSign} />
      </div>
      <div className="cc-celeb-card__body">
        <h3 className="cc-celeb-card__name">{getFullName(celeb)}</h3>
        <div className="cc-celeb-card__meta">
          {sunSign && <span className="cc-celeb-card__sign">{SIGN_LABELS[normalizeSign(sunSign)] || sunSign} Sun</span>}
          {dateStr && <span className="cc-celeb-card__date">{dateStr}</span>}
        </div>
      </div>
    </button>
  );
}

function buildAlphaGroups(celebs) {
  const groups = new Map();
  for (const c of celebs) {
    const letter = getSortLetter(c);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(c);
  }
  for (const [, list] of groups) {
    list.sort((a, b) => {
      const aKey = `${a.lastName || ''} ${a.firstName || ''}`.trim().toLowerCase();
      const bKey = `${b.lastName || ''} ${b.firstName || ''}`.trim().toLowerCase();
      return aKey.localeCompare(bKey);
    });
  }
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });
}

function PublicCelebritiesPage() {
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();

  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [signFilter, setSignFilter] = useState('all');
  const [activeLetter, setActiveLetter] = useState(null);

  const alphaSectionRefs = useRef({});
  const setAlphaRef = useCallback((letter) => (el) => {
    if (el) alphaSectionRefs.current[letter] = el;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCelebrities();
        if (cancelled) return;
        setCelebrities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching celebrities:', err);
        if (!cancelled) setError('Unable to load celebrities right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return celebrities.filter((c) => {
      const name = getFullName(c).toLowerCase();
      const matchesSearch = !q || name.includes(q);
      if (!matchesSearch) return false;
      if (signFilter === 'all') return true;
      const sun = normalizeSign(getPlanetSign(c, 'Sun'));
      return sun === signFilter;
    });
  }, [celebrities, searchTerm, signFilter]);

  const featuredCelebs = useMemo(() => filtered.slice(0, 5), [filtered]);
  const restCelebs = useMemo(() => filtered.slice(5), [filtered]);
  const alphaGroups = useMemo(() => buildAlphaGroups(restCelebs), [restCelebs]);
  const availableLetters = useMemo(() => new Set(alphaGroups.map(([letter]) => letter)), [alphaGroups]);

  useEffect(() => {
    if (!alphaGroups.length) {
      setActiveLetter(null);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLetter(entry.target.dataset.letter || null);
          }
        });
      },
      { rootMargin: '-160px 0px -65% 0px' }
    );
    Object.values(alphaSectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [alphaGroups]);

  const handleCelebClick = (celeb) => {
    navigate(`/celebrities/${celeb._id}`);
  };

  const handleSignFilter = (sign) => {
    setSignFilter(sign);
  };

  const handleBackHome = () => navigate('/');
  const handleSignIn = () => navigate('/login');
  const handleDashboard = () => navigate(`/dashboard/${stelliumUser._id}`);
  const handleSignUp = () => navigate('/birthChartEntry');

  const handleJumpLetter = (letter) => {
    const node = alphaSectionRefs.current[letter];
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalCharts = celebrities.length;

  return (
    <div className="cc-page">
      {/* ─── NAV ───────────────────────────────────────────── */}
      <nav className="cc-nav">
        <div className="cc-nav__inner">
          <button type="button" className="cc-wordmark" onClick={handleBackHome} aria-label="Stellium home">
            <span className="cc-wordmark__glyph"><WordmarkGlyph /></span>
            <span className="cc-wordmark__name">Stellium</span>
          </button>
          <div className="cc-nav__links">
            <button type="button" className="cc-nav__link" onClick={handleBackHome}>Home</button>
            <button type="button" className="cc-nav__link" onClick={() => navigate('/horoscopes/weekly')}>Horoscopes</button>
            <span className="cc-nav__link active">Charts</span>
            <button type="button" className="cc-nav__link" onClick={() => navigate('/#pricing')}>Pricing</button>
            {stelliumUser ? (
              <button type="button" className="cc-btn cc-btn--primary" onClick={handleDashboard}>
                Go to Dashboard <span style={{ opacity: 0.65 }}>→</span>
              </button>
            ) : (
              <>
                <button type="button" className="cc-btn cc-btn--ghost" onClick={handleSignIn}>Sign in</button>
                <button type="button" className="cc-btn cc-btn--primary" onClick={handleSignUp}>
                  Start free <span style={{ opacity: 0.65 }}>→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="cc-hero">
        <div className="cc-halo lilac cc-hero__halo-c" />
        <Stardust seed={1} density={80} />

        <div className="cc-wrap">
          <div className="cc-hero__top">
            <button type="button" className="cc-back-link" onClick={handleBackHome}>
              <span className="cc-back-link__arrow">←</span> Back to home
            </button>
            <span className="cc-hero__top-right">
              <span className="cc-hero__dot" />
              {loading ? 'Loading the database…' : `${totalCharts} charts in the database`}
            </span>
          </div>

          <div className="cc-hero__eyebrow">
            <span className="cc-hero__bar" />
            <span className="cc-eyebrow gold">Explore celebrity birth charts</span>
            <span className="cc-hero__bar cc-hero__bar--r" />
          </div>

          <h1>The sky <span className="accent">they were born under.</span></h1>
          <p className="cc-hero__lede">
            Browse the astrological blueprints of people you’ve heard of — and see exactly how their chart lines up with yours.
          </p>

          <div className="cc-controls">
            <label className="cc-search">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(236,232,255,0.5)" strokeWidth="1.6">
                <circle cx="8" cy="8" r="5.5" />
                <line x1="12" y1="12" x2="16" y2="16" />
              </svg>
              <input
                placeholder="Search by name, sign, or placement…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search celebrities"
              />
              <span className="cc-search__kbd">⌘ K</span>
            </label>

            <div className="cc-filters">
              <button
                type="button"
                className={`cc-filter${signFilter === 'all' ? ' active' : ''}`}
                onClick={() => handleSignFilter('all')}
              >
                All <span className="cc-filter__count">{totalCharts}</span>
              </button>
              {ZODIAC_SIGNS.map((sign) => (
                <button
                  key={sign.value}
                  type="button"
                  className={`cc-filter${signFilter === sign.value ? ' active' : ''}`}
                  onClick={() => handleSignFilter(sign.value)}
                >
                  <img className="cc-filter__glyph" src={`/assets/signs/${sign.value}.svg`} alt="" aria-hidden="true" />
                  {sign.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED ──────────────────────────────────────── */}
      {!loading && featuredCelebs.length > 0 && (
        <section className="cc-featured">
          <div className="cc-halo lilac cc-featured__halo-l" />
          <div className="cc-halo gold cc-featured__halo-r" />

          <div className="cc-wrap">
            <div className="cc-row-head">
              <div>
                <div className="cc-eyebrow gold">Featured this week</div>
                <h2>Charts in <span className="italic">the spotlight.</span></h2>
              </div>
              <div className="cc-row-head__count">{filtered.length} matching · {totalCharts} total</div>
            </div>

            <div className="cc-feature-grid">
              {featuredCelebs.map((celeb, i) => (
                <FeatureCard
                  key={celeb._id}
                  celeb={celeb}
                  tone={PORTRAIT_TONES[i % PORTRAIT_TONES.length]}
                  large={i === 0}
                  caption={FEATURED_CAPTIONS[i % FEATURED_CAPTIONS.length]}
                  onClick={() => handleCelebClick(celeb)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── A-Z RAIL ──────────────────────────────────────── */}
      {!loading && alphaGroups.length > 0 && (
        <div className="cc-wrap">
          <nav className="cc-az-rail" aria-label="A to Z jumper">
            {ALPHABET.map((letter) => {
              const enabled = availableLetters.has(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  className={`cc-az-rail__link${activeLetter === letter ? ' active' : ''}${enabled ? '' : ' disabled'}`}
                  onClick={() => enabled && handleJumpLetter(letter)}
                  disabled={!enabled}
                >
                  {letter}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* ─── ALPHA GRID ────────────────────────────────────── */}
      <section className="cc-alpha">
        <div className="cc-wrap">
          {loading && <div className="cc-loading">Loading the database…</div>}
          {!loading && error && <div className="cc-empty">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="cc-empty">No charts match this filter — try clearing your search or picking a different sign.</div>
          )}
          {!loading && !error && alphaGroups.map(([letter, list], gi) => (
            <div
              key={letter}
              ref={setAlphaRef(letter)}
              data-letter={letter}
              className="cc-alpha-section"
              id={`letter-${letter}`}
            >
              <div className="cc-alpha-head">
                <div className="cc-alpha-head__letter">{letter}</div>
                <div className="cc-alpha-head__meta">{list.length} {list.length === 1 ? 'chart' : 'charts'}</div>
              </div>
              <div className="cc-celeb-grid">
                {list.map((celeb, ci) => (
                  <GridCelebCard
                    key={celeb._id}
                    celeb={celeb}
                    tone={PORTRAIT_TONES[(gi + ci) % PORTRAIT_TONES.length]}
                    onClick={() => handleCelebClick(celeb)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────── */}
      <section className="cc-cta-banner">
        <div className="cc-halo lilac cc-cta-banner__halo-c" />
        <Stardust seed={9} density={60} />

        <div className="cc-wrap">
          <div className="cc-eyebrow gold" style={{ marginBottom: 20, display: 'inline-block' }}>
            Want to compare?
          </div>
          {stelliumUser ? (
            <>
              <h2>Add anyone — see where your sky <span className="italic">meets theirs.</span></h2>
              <p>Pick a celebrity above to compare synastry, composite, and aspect chemistry with your chart.</p>
              <button type="button" className="cc-btn cc-btn--primary" onClick={handleDashboard}>
                Go to your dashboard →
              </button>
            </>
          ) : (
            <>
              <h2>Sign up — see where your sky <span className="italic">meets theirs.</span></h2>
              <p>Add yourself to compare synastry, composite, and aspect chemistry with anyone in the database.</p>
              <button type="button" className="cc-btn cc-btn--primary" onClick={handleSignUp}>
                Create your free account →
              </button>
            </>
          )}
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="cc-footer">
        <div className="cc-wrap">
          <div className="cc-foot-grid">
            <div className="cc-foot-brand">
              <button type="button" className="cc-wordmark" onClick={handleBackHome}>
                <span className="cc-wordmark__glyph"><WordmarkGlyph /></span>
                <span className="cc-wordmark__name">Stellium</span>
              </button>
              <p className="cc-foot-brand__blurb">
                Personalized astrology, powered by AI. Your chart, read like a person — not a horoscope column.
              </p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/horoscopes/weekly">Horoscopes</a></li>
                <li><a href="/celebrities">Celebrity charts</a></li>
                <li><a href="/#pricing">Pricing</a></li>
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
          <div className="cc-foot-bot">
            <span>© {new Date().getFullYear()} Stellium · Personalized astrology, powered by AI.</span>
            <span className="cc-foot-bot__italic">Made under a generous sky.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicCelebritiesPage;
