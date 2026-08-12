import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import InkNav from '../UI/ink/InkNav';
import InsufficientCreditsModal from '../UI/entitlements/InsufficientCreditsModal';
import {
  createRelationshipDirect,
  fetchCelebritiesPaginated,
  getUserCompositeCharts,
  getUserSubjects,
} from '../Utilities/api';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import { formatCalendarDate } from '../Utilities/dateFormatting';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import { useAuth } from '../context/AuthContext';
import '../styles/ink.css';
import './InkMyRelationshipsPage.css';

const CELEBRITY_TINTS = ['blue', 'gold', 'rose', 'sage'];

function normalizeRecords(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.subjects)) return response.subjects;
  if (Array.isArray(response?.relationships)) return response.relationships;
  return [];
}

function getPersonName(person) {
  return `${person?.firstName || ''} ${person?.lastName || ''}`.trim()
    || person?.name
    || 'Unknown';
}

function getPlanetSign(person, planetName) {
  const planets = person?.birthChart?.planets;
  if (!Array.isArray(planets)) return null;
  return planets.find((planet) => planet?.name === planetName)?.sign || null;
}

function getSunSign(person) {
  return getPlanetSign(person, 'Sun');
}

function getInitials(person) {
  const name = typeof person === 'string' ? person : getPersonName(person);
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || '?';
}

function getPhoto(person) {
  return person?.profilePhotoUrl || person?.photoUrl || null;
}

// Square, etched-ink portrait matching the celebrity-database / landing-page
// card style: a grayscale-sepia photo when available, otherwise tinted initials.
function CelebPortrait({ person, tintClass }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photo = getPhoto(person);
  const showPhoto = photo && !imageFailed;
  return (
    <div className={`ink-relationships__celeb-portrait ink-relationships__celeb-portrait--${tintClass}`}>
      {showPhoto ? (
        <img
          src={photo}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(person)}</span>
      )}
    </div>
  );
}

function sameId(a, b) {
  return a != null && b != null && String(a) === String(b);
}

function getRelationshipNames(relationship) {
  const nameA = `${relationship?.userA_firstName || ''} ${relationship?.userA_lastName || ''}`.trim()
    || relationship?.userA_name
    || 'You';
  const nameB = `${relationship?.userB_firstName || ''} ${relationship?.userB_lastName || ''}`.trim()
    || relationship?.userB_name
    || 'Partner';
  return { nameA, nameB };
}

function getPartnerBirthDate(relationship, userId) {
  if (sameId(relationship?.userB_id, userId)) {
    return relationship?.userA_dateOfBirth || relationship?.userA_birthDate;
  }
  return relationship?.userB_dateOfBirth || relationship?.userB_birthDate;
}

function formatBirthDate(value) {
  if (!value) return 'Birth date unavailable';
  return formatCalendarDate(value, 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function hashSeed(value) {
  const stringValue = String(value || 'relationship');
  let hash = 2166136261;
  for (let index = 0; index < stringValue.length; index += 1) {
    hash ^= stringValue.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 233279 + 1;
}

function polar(cx, cy, radius, degrees) {
  const angle = (degrees - 90) * Math.PI / 180;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function makeWheel(seed, cx, cy, radius, includeStars = false) {
  let state = seed;
  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  const points = Array.from({ length: 6 }, () => (
    polar(cx, cy, radius * (0.25 + random() * 0.52), random() * 360)
  ));
  const stars = includeStars
    ? Array.from({ length: 14 }, () => {
        const point = polar(cx, cy, radius * 0.8 * Math.sqrt(random()), random() * 360);
        return { point, radius: random() * 0.7 + 0.3 };
      })
    : [];
  return { points, stars };
}

function Wheel({ cx, cy, radius, seed, dark }) {
  const { points, stars } = useMemo(
    () => makeWheel(seed, cx, cy, radius, dark),
    [cx, cy, dark, radius, seed]
  );
  const fill = dark ? 'rgba(27,33,64,0.9)' : 'rgba(52,55,168,0.14)';
  const tick = dark ? 'rgba(216,186,116,0.6)' : 'rgba(35,40,64,0.4)';
  const dot = dark ? '#d8ba74' : '#3437a8';

  return (
    <g>
      <g style={{ mixBlendMode: 'multiply' }}>
        <circle cx={cx} cy={cy} r={radius} fill={fill} opacity="0.92" />
        {Array.from({ length: 12 }, (_, index) => {
          const outer = polar(cx, cy, radius, index * 30);
          const inner = polar(cx, cy, radius * 0.86, index * 30);
          return (
            <line
              x1={outer[0]}
              y1={outer[1]}
              x2={inner[0]}
              y2={inner[1]}
              stroke={tick}
              strokeWidth="0.7"
              key={`tick-${index}`}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={radius * 0.86} fill="none" stroke={tick} strokeWidth="0.7" />
        {points.map((point, index) => (
          <circle cx={point[0]} cy={point[1]} r="1.8" fill={dot} key={`point-${index}`} />
        ))}
        {points.slice(0, -1).map((point, index) => (
          <line
            x1={point[0]}
            y1={point[1]}
            x2={points[index + 1][0]}
            y2={points[index + 1][1]}
            stroke="#b08d3e"
            strokeWidth="0.55"
            opacity="0.7"
            key={`aspect-${index}`}
          />
        ))}
        <circle cx={cx} cy={cy} r="2.4" fill="#b08d3e" />
      </g>
      {stars.map((star, index) => (
        <circle
          cx={star.point[0]}
          cy={star.point[1]}
          r={star.radius}
          fill="rgba(240,235,220,0.7)"
          key={`star-${index}`}
        />
      ))}
    </g>
  );
}

function RelationshipDuo({ relationshipId, nameA, nameB }) {
  const seed = useMemo(() => hashSeed(relationshipId), [relationshipId]);
  return (
    <svg
      className="ink-relationships__duo"
      viewBox="0 0 220 120"
      role="img"
      aria-label={`${nameA}'s and ${nameB}'s charts interlocking`}
    >
      <Wheel cx={68} cy={60} radius={52} seed={seed} dark={false} />
      <Wheel cx={152} cy={60} radius={52} seed={seed + 5} dark />
      <text x="110" y="66" textAnchor="middle" fontSize="20" fill="#3437a8">♥︎</text>
    </svg>
  );
}

function StatusMessage({ children, actionLabel, onAction }) {
  return (
    <div className="ink-relationships__status" role="status">
      <span className="ink-relationships__status-mark" aria-hidden="true">✳</span>
      <p>{children}</p>
      {onAction && (
        <button type="button" className="ink-relationships__text-button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function InkMyRelationshipsPage({ userId: userIdOverride }) {
  const params = useParams();
  const navigate = useNavigate();
  const { stelliumUser, loading: authLoading } = useAuth();
  const userId = userIdOverride || params.userId || stelliumUser?._id;

  const credits = useEntitlementsStore((state) => state.credits);
  const fetchEntitlements = useEntitlementsStore((state) => state.fetchEntitlements);
  const applyOptimisticCreditSpend = useEntitlementsStore((state) => state.applyOptimisticCreditSpend);
  const restoreCredits = useEntitlementsStore((state) => state.restoreCredits);
  const isPlus = useEntitlementsStore((state) => (
    (state.plan === 'PLUS' || state.plan === 'PREMIUM') && state.isSubscriptionActive
  ));
  const isSimple = useEntitlementsStore((state) => state.pricingModel === 'simple');

  const [showCreate, setShowCreate] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [relationshipsLoading, setRelationshipsLoading] = useState(true);
  const [relationshipsError, setRelationshipsError] = useState(null);
  const [relationshipReload, setRelationshipReload] = useState(0);

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState(null);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  const [celebrities, setCelebrities] = useState([]);
  const [celebritiesLoading, setCelebritiesLoading] = useState(false);
  const [celebritiesError, setCelebritiesError] = useState(null);
  const [celebritiesLoaded, setCelebritiesLoaded] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRelationships() {
      if (!userId) {
        setRelationshipsLoading(false);
        return;
      }
      try {
        setRelationshipsLoading(true);
        setRelationshipsError(null);
        const response = await getUserCompositeCharts(userId);
        if (!cancelled) setRelationships(normalizeRecords(response));
      } catch (error) {
        console.error('Error fetching relationships:', error);
        if (!cancelled) setRelationshipsError('We couldn’t open your relationships just now.');
      } finally {
        if (!cancelled) setRelationshipsLoading(false);
      }
    }

    loadRelationships();
    return () => { cancelled = true; };
  }, [relationshipReload, userId]);

  const loadSubjects = useCallback(async () => {
    if (!userId) return;
    try {
      setSubjectsLoading(true);
      setSubjectsError(null);
      const response = await getUserSubjects(userId);
      const records = normalizeRecords(response).filter((subject) => subject?.kind !== 'accountSelf');
      setSubjects(records);
      setSubjectsLoaded(true);
    } catch (error) {
      console.error('Error fetching saved charts:', error);
      setSubjectsError('Your saved charts couldn’t be loaded.');
    } finally {
      setSubjectsLoaded(true);
      setSubjectsLoading(false);
    }
  }, [userId]);

  const loadCelebrities = useCallback(async () => {
    try {
      setCelebritiesLoading(true);
      setCelebritiesError(null);
      const response = await fetchCelebritiesPaginated({ usePagination: false, limit: 100 });
      setCelebrities(normalizeRecords(response));
      setCelebritiesLoaded(true);
    } catch (error) {
      console.error('Error fetching celebrities:', error);
      setCelebritiesError('The celebrity roster couldn’t be loaded.');
    } finally {
      setCelebritiesLoaded(true);
      setCelebritiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!showCreate) return;
    if (!subjectsLoaded && !subjectsLoading) loadSubjects();
    if (!celebritiesLoaded && !celebritiesLoading) loadCelebrities();
  }, [
    celebritiesLoaded,
    celebritiesLoading,
    loadCelebrities,
    loadSubjects,
    showCreate,
    subjectsLoaded,
    subjectsLoading,
  ]);

  const filteredCelebrities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return celebrities.filter((celebrity) => {
      const gender = String(celebrity?.gender || '').toLowerCase();
      const matchesGender = genderFilter === 'all' || gender === genderFilter;
      const matchesSearch = !query || getPersonName(celebrity).toLowerCase().includes(query);
      return matchesGender && matchesSearch;
    });
  }, [celebrities, genderFilter, searchTerm]);

  const selectPerson = (person, type) => {
    setSelectedPerson(person);
    setSelectedType(type);
    setCreateError(null);
  };

  const toggleCreate = () => {
    setShowCreate((current) => !current);
    setCreateError(null);
  };

  const handleCreateRelationship = async () => {
    if (!stelliumUser?._id || !selectedPerson?._id || !userId || creating) return;

    // Relationship overview is free for everyone under simple pricing; only the
    // legacy credit model gates it. Skip the paywall/credit spend when simple.
    const cost = CREDIT_COSTS.RELATIONSHIP_OVERVIEW;
    if (!isSimple && !isPlus && (credits?.total || 0) < cost) {
      setShowPaywall(true);
      return;
    }

    let creditsSnapshot = null;
    try {
      setCreating(true);
      setCreateError(null);
      if (!isSimple && !isPlus) creditsSnapshot = applyOptimisticCreditSpend(cost);

      const response = await createRelationshipDirect(
        stelliumUser._id,
        selectedPerson._id,
        userId,
        selectedType === 'celebrity'
      );
      if (!response?.compositeChartId) throw new Error('Failed to create relationship');

      fetchEntitlements(userId);
      navigate(`/dashboard/${userId}/relationship/${response.compositeChartId}`);
    } catch (error) {
      console.error('Error creating relationship:', error);
      restoreCredits(creditsSnapshot);
      if (error?.statusCode === 402) {
        setShowPaywall(true);
      } else {
        setCreateError(error?.message || 'We couldn’t create this relationship. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  if (!authLoading && stelliumUser?._id && userId && !sameId(stelliumUser._id, userId)) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  const userName = getPersonName(stelliumUser);
  const userSign = getSunSign(stelliumUser);

  return (
    <div className="ink-page ink-relationships">
      <InkNav variant="app" activeSegment="relationships" user={stelliumUser} />

      <main className="ink-wrap ink-relationships__main">
        <header className="ink-relationships__page-head">
          <div className="ink-relationships__heading-group">
            <span className="ink-eyebrow">Your connections</span>
            <h1>My <span className="ink-italic">Relationships</span></h1>
            <span className="ink-relationships__gold-rule" aria-hidden="true" />
          </div>
          <button type="button" className="ink-btn ink-btn--navy" onClick={toggleCreate}>
            {showCreate ? '← Back to relationships' : '＋ Add New Relationship ✳'}
          </button>
        </header>

        {!showCreate && (
          <section className="ink-relationships__list" aria-label="Your relationships">
            {(authLoading || relationshipsLoading) && (
              <StatusMessage>Gathering your connections…</StatusMessage>
            )}
            {!authLoading && !relationshipsLoading && relationshipsError && (
              <StatusMessage
                actionLabel="Try again"
                onAction={() => setRelationshipReload((value) => value + 1)}
              >
                {relationshipsError}
              </StatusMessage>
            )}
            {!authLoading && !relationshipsLoading && !relationshipsError && relationships.length === 0 && (
              <div className="ink-relationships__empty">
                <span aria-hidden="true">♡</span>
                <h2>Your first shared sky is waiting.</h2>
                <p>Choose someone close to you—or someone famous—and start your first reading together.</p>
                <button type="button" className="ink-btn ink-btn--navy" onClick={toggleCreate}>
                  Start your first reading ✳
                </button>
              </div>
            )}
            {!relationshipsLoading && !relationshipsError && relationships.map((relationship) => {
              const { nameA, nameB } = getRelationshipNames(relationship);
              return (
                <Link
                  className="ink-relationships__row"
                  to={`/dashboard/${userId}/relationship/${relationship._id}`}
                  key={relationship._id}
                >
                  <RelationshipDuo relationshipId={relationship._id} nameA={nameA} nameB={nameB} />
                  <span className="ink-relationships__row-copy">
                    <span className="ink-relationships__couple-name">
                      {nameA} <span>&amp;</span> {nameB}
                    </span>
                    <span className="ink-relationships__birth-date">
                      {formatBirthDate(getPartnerBirthDate(relationship, userId))}
                    </span>
                  </span>
                  <span className="ink-relationships__open">Open reading →</span>
                </Link>
              );
            })}
          </section>
        )}

        {showCreate && (
          <section className="ink-relationships__create" aria-label="Create relationship">
            <header className="ink-relationships__create-head">
              <span className="ink-eyebrow">Create relationship</span>
              <h2>Who are we <span className="ink-italic">reading together?</span></h2>
              <p>Analyze your compatibility with someone.</p>
            </header>

            <div className="ink-relationships__you-wrap">
              <div className="ink-relationships__you-chip">
                <b>{userName}</b>
                <span>{userSign ? `${userSign} Sun` : 'Your birth chart'}</span>
              </div>
              <span className="ink-relationships__heart" aria-hidden="true">♡</span>
            </div>

            <section className="ink-relationships__pick-card">
              <h3>Your Charts</h3>
              <p className="ink-relationships__hint">
                Anyone you’ve added as a birth chart can be read with you —{' '}
                <Link to={`/dashboard/${userId}`} state={{ section: 'charts' }}>add a person first →</Link>
              </p>
              {subjectsLoading && <StatusMessage>Opening your saved charts…</StatusMessage>}
              {!subjectsLoading && subjectsError && (
                <StatusMessage actionLabel="Try again" onAction={loadSubjects}>{subjectsError}</StatusMessage>
              )}
              {!subjectsLoading && !subjectsError && subjectsLoaded && subjects.length === 0 && (
                <p className="ink-relationships__inline-empty">
                  No saved people yet. Add a chart first, or choose a celebrity below.
                </p>
              )}
              {!subjectsLoading && !subjectsError && subjects.length > 0 && (
                <div className="ink-relationships__subject-grid">
                  {subjects.map((subject) => {
                    const selected = selectedType === 'subject' && sameId(selectedPerson?._id, subject._id);
                    return (
                      <button
                        type="button"
                        className={`ink-relationships__person-chip${selected ? ' is-selected' : ''}`}
                        aria-pressed={selected}
                        onClick={() => selectPerson(subject, 'subject')}
                        key={subject._id}
                      >
                        <b>{getPersonName(subject)}</b>
                        <span>{getSunSign(subject) ? `${getSunSign(subject)} Sun` : 'Birth chart'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="ink-relationships__pick-card">
              <h3>Or Choose a Celebrity</h3>
              <p className="ink-relationships__hint">Run your chemistry against a famous chart.</p>
              <div className="ink-relationships__tools">
                <input
                  className="ink-relationships__search"
                  type="search"
                  placeholder="Search celebrities by name…"
                  aria-label="Search celebrities"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <div className="ink-relationships__filters" aria-label="Filter celebrities by gender">
                  {[
                    ['all', 'All'],
                    ['male', 'Male'],
                    ['female', 'Female'],
                  ].map(([value, label]) => (
                    <button
                      type="button"
                      className={genderFilter === value ? 'is-active' : ''}
                      aria-pressed={genderFilter === value}
                      onClick={() => setGenderFilter(value)}
                      key={value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {celebritiesLoading && <StatusMessage>Consulting the celebrity roster…</StatusMessage>}
              {!celebritiesLoading && celebritiesError && (
                <StatusMessage actionLabel="Try again" onAction={loadCelebrities}>{celebritiesError}</StatusMessage>
              )}
              {!celebritiesLoading && !celebritiesError && celebritiesLoaded && filteredCelebrities.length === 0 && (
                <p className="ink-relationships__inline-empty">No celebrities match that search.</p>
              )}
              {!celebritiesLoading && !celebritiesError && filteredCelebrities.length > 0 && (
                <div className="ink-relationships__celebrity-grid">
                  {filteredCelebrities.map((celebrity, index) => {
                    const selected = selectedType === 'celebrity' && sameId(selectedPerson?._id, celebrity._id);
                    const sun = getPlanetSign(celebrity, 'Sun');
                    const moon = getPlanetSign(celebrity, 'Moon');
                    return (
                      <button
                        type="button"
                        className={`ink-relationships__celeb-card${selected ? ' is-selected' : ''}`}
                        aria-pressed={selected}
                        onClick={() => selectPerson(celebrity, 'celebrity')}
                        key={celebrity._id}
                      >
                        <CelebPortrait
                          person={celebrity}
                          tintClass={CELEBRITY_TINTS[index % CELEBRITY_TINTS.length]}
                        />
                        <div className="ink-relationships__celeb-copy">
                          <b>{getPersonName(celebrity)}</b>
                          {(sun || moon) ? (
                            <span className="ink-relationships__celeb-placements">
                              {sun && <>☉ {sun} Sun</>}
                              {sun && moon && <span> · </span>}
                              {moon && <>☽ {moon} Moon</>}
                            </span>
                          ) : (
                            <span className="ink-relationships__celeb-placements"><span>Birth chart</span></span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {createError && (
              <div className="ink-relationships__create-error" role="alert">{createError}</div>
            )}

            {selectedPerson && (
              <div className="ink-relationships__cta-wrap">
                <div className="ink-relationships__cta">
                  <span className="ink-relationships__pair-label">
                    {userName} <span>♡</span> <b>{getPersonName(selectedPerson)}</b>
                  </span>
                  <span className="ink-relationships__cost">
                    {isSimple
                      ? 'FREE'
                      : isPlus
                        ? 'INCLUDED WITH PLUS'
                        : `${CREDIT_COSTS.RELATIONSHIP_OVERVIEW} CREDITS`}
                  </span>
                  <button
                    type="button"
                    className="ink-btn ink-btn--navy"
                    onClick={handleCreateRelationship}
                    disabled={creating}
                  >
                    {creating ? 'Reading the skies…' : 'Create Relationship ✳'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <InsufficientCreditsModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        creditsNeeded={CREDIT_COSTS.RELATIONSHIP_OVERVIEW}
        creditsAvailable={credits?.total || 0}
        onBuyCredits={() => { setShowPaywall(false); navigate('/pricingTable'); }}
        onSubscribe={() => { setShowPaywall(false); navigate('/pricingTable'); }}
      />
    </div>
  );
}

export default InkMyRelationshipsPage;
