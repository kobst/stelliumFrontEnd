import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCelebrities } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import { ZODIAC_SIGNS } from '../Utilities/zodiac';
import InkNav from '../UI/ink/InkNav';
import InkPublicFooter from '../UI/publicInk/InkPublicFooter';
import '../styles/ink.css';
import './PublicCelebritiesPage.css';

const PORTRAIT_TONES = ['lilac', 'gold', 'blue', 'rose', 'sage', 'plum'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MARKETING_LINKS = [
  { label: 'Celebrity charts', href: '/celebrities' },
  { label: 'Relationships', href: '/celebrity-relationships' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/#pricing' },
];

const SIGN_LABELS = ZODIAC_SIGNS.reduce((labels, sign) => {
  labels[sign.value] = sign.label;
  return labels;
}, {});

function normalizeSign(sign) {
  return sign ? String(sign).trim().toLowerCase() : null;
}

function getPlanetSign(celebrity, name) {
  const planets = celebrity?.birthChart?.planets || celebrity?.planets;
  if (!Array.isArray(planets)) return null;
  return planets.find((planet) => planet?.name === name)?.sign || null;
}

function getFullName(celebrity) {
  return `${celebrity?.firstName || ''} ${celebrity?.lastName || ''}`.trim() || 'Untitled Chart';
}

function getInitials(celebrity) {
  const initials = `${celebrity?.firstName?.[0] || ''}${celebrity?.lastName?.[0] || ''}`;
  return initials.toUpperCase() || '✳';
}

function getProfilePhoto(celebrity) {
  return celebrity?.profilePhotoUrl || celebrity?.photoUrl || null;
}

function getSortLetter(celebrity) {
  const source = celebrity?.lastName?.trim() || celebrity?.firstName?.trim() || '';
  const letter = source.charAt(0).toUpperCase();
  return ALPHABET.includes(letter) ? letter : '#';
}

function formatBirthDate(celebrity) {
  const raw = celebrity?.dateOfBirth || celebrity?.birthDate;
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatSign(sign) {
  return SIGN_LABELS[normalizeSign(sign)] || sign;
}

function buildAlphaGroups(celebrities) {
  const groups = new Map();
  celebrities.forEach((celebrity) => {
    const letter = getSortLetter(celebrity);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(celebrity);
  });
  groups.forEach((list) => {
    list.sort((a, b) => {
      const aKey = `${a.lastName || ''} ${a.firstName || ''}`.trim().toLowerCase();
      const bKey = `${b.lastName || ''} ${b.firstName || ''}`.trim().toLowerCase();
      return aKey.localeCompare(bKey);
    });
  });
  return [...groups.entries()].sort(([a], [b]) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });
}

function CelebrityCard({ celebrity, tone, featured = false }) {
  const name = getFullName(celebrity);
  const photo = getProfilePhoto(celebrity);
  const sun = getPlanetSign(celebrity, 'Sun');
  const moon = getPlanetSign(celebrity, 'Moon');
  const birthDate = formatBirthDate(celebrity);

  return (
    <Link
      className={`pci-card${featured ? ' pci-card--featured' : ''}`}
      to={`/celebrities/${celebrity._id}`}
    >
      <div className={`pci-card__portrait pci-card__portrait--${tone}`}>
        {photo ? (
          <img src={photo} alt={name} loading="lazy" decoding="async" />
        ) : (
          <span aria-hidden="true">{getInitials(celebrity)}</span>
        )}
      </div>
      <div className="pci-card__copy">
        <h3>{name}</h3>
        {(sun || moon) && (
          <p className="pci-card__placements">
            {sun && <>☉ {formatSign(sun)} Sun</>}
            {sun && moon && <span aria-hidden="true"> · </span>}
            {moon && <>☽ {formatSign(moon)} Moon</>}
          </p>
        )}
        {birthDate && <p className="pci-card__date">{birthDate}</p>}
      </div>
      <span className="pci-card__arrow" aria-hidden="true">↗</span>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="pci-card pci-card--skeleton" aria-hidden="true">
      <div className="pci-card__portrait" />
      <div className="pci-card__copy">
        <span />
        <span />
      </div>
    </div>
  );
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
  const searchInputRef = useRef(null);
  const alphaSectionRefs = useRef({});

  const setAlphaRef = useCallback((letter) => (element) => {
    if (element) alphaSectionRefs.current[letter] = element;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCelebrities();
        if (!cancelled) setCelebrities(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        console.error('Error fetching celebrities:', fetchError);
        if (!cancelled) setError('Unable to load celebrity charts right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return celebrities.filter((celebrity) => {
      const matchesSearch = !query || getFullName(celebrity).toLowerCase().includes(query);
      if (!matchesSearch) return false;
      if (signFilter === 'all') return true;
      return normalizeSign(getPlanetSign(celebrity, 'Sun')) === signFilter;
    });
  }, [celebrities, searchTerm, signFilter]);

  const featuredCelebrities = useMemo(() => filtered.slice(0, 5), [filtered]);
  const remainingCelebrities = useMemo(() => filtered.slice(5), [filtered]);
  const alphaGroups = useMemo(() => buildAlphaGroups(remainingCelebrities), [remainingCelebrities]);
  const availableLetters = useMemo(
    () => new Set(alphaGroups.map(([letter]) => letter)),
    [alphaGroups]
  );

  useEffect(() => {
    if (!alphaGroups.length) {
      setActiveLetter(null);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveLetter(entry.target.dataset.letter || null);
      });
    }, { rootMargin: '-160px 0px -65% 0px' });
    Object.values(alphaSectionRefs.current).forEach((element) => {
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [alphaGroups]);

  const focusSearch = useCallback(() => searchInputRef.current?.focus(), []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        focusSearch();
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [focusSearch]);

  const goToConversion = () => {
    if (stelliumUser?._id) navigate(`/dashboard/${stelliumUser._id}`);
    else navigate('/signUp');
  };

  return (
    <div className="ink-page public-celeb-index">
      <InkNav variant="marketing" marketingLinks={MARKETING_LINKS} />

      <main>
        <header className="pci-hero">
          <div className="ink-wrap">
            <div className="ink-eyebrow">Celebrity atlas · {loading ? 'opening the archive' : `${celebrities.length} charts`}</div>
            <h1>The sky they were <span className="ink-italic">born under.</span></h1>
            <p>
              Browse public birth charts and see the Sun and Moon placements behind familiar lives.
            </p>

            <div className="pci-controls">
              <label className="pci-search" htmlFor="celebrity-search">
                <span aria-hidden="true">⌕</span>
                <input
                  id="celebrity-search"
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name…"
                />
                <kbd>⌘ K</kbd>
              </label>

              <div className="pci-filters" aria-label="Filter by Sun sign">
                <button
                  type="button"
                  className={signFilter === 'all' ? 'on' : ''}
                  onClick={() => setSignFilter('all')}
                >
                  All <span>{celebrities.length}</span>
                </button>
                {ZODIAC_SIGNS.map((sign) => (
                  <button
                    type="button"
                    className={signFilter === sign.value ? 'on' : ''}
                    onClick={() => setSignFilter(sign.value)}
                    key={sign.value}
                  >
                    {sign.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="pci-featured ink-band" aria-labelledby="pci-featured-title">
          <div className="ink-wrap">
            <div className="pci-section-head">
              <div>
                <div className="ink-eyebrow">In the spotlight</div>
                <h2 id="pci-featured-title">Five charts to <span className="ink-italic">begin with.</span></h2>
              </div>
              {!loading && <p>{filtered.length} matching</p>}
            </div>

            <div className="pci-grid pci-grid--featured">
              {loading && Array.from({ length: 5 }, (_, index) => <CardSkeleton key={index} />)}
              {!loading && featuredCelebrities.map((celebrity, index) => (
                <CelebrityCard
                  celebrity={celebrity}
                  tone={PORTRAIT_TONES[index % PORTRAIT_TONES.length]}
                  featured
                  key={celebrity._id}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="pci-directory" aria-labelledby="pci-directory-title">
          <div className="ink-wrap">
            <div className="pci-section-head">
              <div>
                <div className="ink-eyebrow">The full index</div>
                <h2 id="pci-directory-title">Browse the archive, <span className="ink-italic">A–Z.</span></h2>
              </div>
            </div>

            {!loading && alphaGroups.length > 0 && (
              <nav className="pci-alphabet" aria-label="Jump to a surname letter">
                {ALPHABET.map((letter) => {
                  const enabled = availableLetters.has(letter);
                  return (
                    <button
                      type="button"
                      disabled={!enabled}
                      className={activeLetter === letter ? 'on' : ''}
                      onClick={() => alphaSectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth' })}
                      key={letter}
                    >
                      {letter}
                    </button>
                  );
                })}
              </nav>
            )}

            {loading && <div className="pci-grid">{Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}</div>}
            {!loading && error && <div className="pci-state" role="alert">{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="pci-state">No charts match this search. Try another name or Sun sign.</div>
            )}
            {!loading && !error && filtered.length > 0 && alphaGroups.length === 0 && featuredCelebrities.length > 0 && (
              <p className="pci-directory-note">Every matching chart is shown in the spotlight above.</p>
            )}
            {!loading && !error && alphaGroups.map(([letter, list], groupIndex) => (
              <section
                className="pci-letter-group"
                id={`letter-${letter}`}
                ref={setAlphaRef(letter)}
                data-letter={letter}
                aria-labelledby={`letter-${letter}-title`}
                key={letter}
              >
                <div className="pci-letter-head">
                  <h3 id={`letter-${letter}-title`}>{letter}</h3>
                  <span>{list.length} {list.length === 1 ? 'chart' : 'charts'}</span>
                </div>
                <div className="pci-grid">
                  {list.map((celebrity, index) => (
                    <CelebrityCard
                      celebrity={celebrity}
                      tone={PORTRAIT_TONES[(groupIndex + index) % PORTRAIT_TONES.length]}
                      key={celebrity._id}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="pci-conversion">
          <div className="ink-wrap pci-conversion__inner">
            <div>
              <div className="ink-eyebrow">Your turn</div>
              <h2>See where your sky <span className="ink-italic">meets theirs.</span></h2>
              <p>Add your birth details, draw your chart, and compare it with anyone in the archive.</p>
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

export default PublicCelebritiesPage;
