import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  fetchUser,
  getUserSubjects,
  getUserCompositeCharts,
  getTransitWindows,
  generateDailyHoroscope,
  generateWeeklyHoroscope,
  generateMonthlyHoroscope,
  createGuestSubject,
  deleteSubject
} from '../Utilities/api';
import useStore from '../Utilities/store';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import { formatLocalDateParam } from '../Utilities/horoscopeDates';
import { getRelationshipCardSummary } from '../Utilities/relationshipSummary';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import AddChartModal from '../UI/dashboard/AddChartModal';
import DashboardNav from '../UI/dashboard/DashboardNav';
import SettingsSection from '../UI/dashboard/SettingsSection';
import AskStelliumPanel from '../UI/askStellium/AskStelliumPanel';
import InsufficientCreditsModal from '../UI/entitlements/InsufficientCreditsModal';
import './MainDashboard.css';
import './MainDashboardTheme.css';

const PORTRAIT_TONES = ['lilac', 'gold', 'cyan', 'rose', 'sage', 'plum'];

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

function Stardust({ seed = 1, density = 70 }) {
  const circles = useMemo(() => generateStardustCircles(density, seed), [density, seed]);
  return (
    <svg className="md-stardust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {circles}
    </svg>
  );
}


function getInitial(name) {
  return (name?.trim()?.charAt(0) || '?').toUpperCase();
}

function formatBirthDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = date.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
  return `${month} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function getSunSign(chart) {
  return chart?.birthChart?.planets?.find((p) => p?.name === 'Sun')?.sign || null;
}

function formatTransitTitle(transit) {
  if (!transit) return '';
  const tp = transit.transitingPlanet || transit.transitingBody || transit.transit?.transitingPlanet;
  const aspect = transit.aspect || transit.transit?.aspect;
  const target = transit.targetPlanet || transit.target || transit.natalPlanet;
  if (transit.title) return transit.title;
  return [tp, aspect, target].filter(Boolean).join(' ');
}

function formatTransitDate(transit) {
  const value =
    transit?.exact ||
    transit?.exactDate ||
    transit?.peakDate ||
    transit?.date ||
    transit?.startDate;
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.toLocaleString('default', { month: 'short', timeZone: 'UTC' })} ${date.getUTCDate()}`;
}

function periodBounds(period) {
  const now = new Date();
  if (period === 'daily') {
    const start = new Date(now);
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() + 1);
    return { start, end };
  }
  if (period === 'weekly') {
    const start = new Date(now);
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() + 7);
    return { start, end };
  }
  const start = new Date(now);
  const end = new Date(now);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

function filterTransitsForPeriod(transits, period) {
  if (!Array.isArray(transits)) return [];
  const { start, end } = periodBounds(period);
  return transits
    .map((t) => {
      const dateValue = t?.exact || t?.exactDate || t?.peakDate || t?.date || t?.startDate;
      if (!dateValue) return null;
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return null;
      if (date < start || date > end) return null;
      return { ...t, _sortDate: date };
    })
    .filter(Boolean)
    .sort((a, b) => a._sortDate - b._sortDate)
    .slice(0, 12);
}

function MainDashboard() {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { stelliumUser, signOut } = useAuth();

  const sectionFromState = location.state?.section || 'home';
  const [activeTab, setActiveTab] = useState(sectionFromState);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entitlements = useEntitlements(user);
  const credits = useEntitlementsStore((s) => s.credits);

  // Zustand store setters (keep parity with the previous MainDashboard wiring)
  const setSelectedUser = useStore((state) => state.setSelectedUser);
  const setUserId = useStore((state) => state.setUserId);
  const setUserPlanets = useStore((state) => state.setUserPlanets);
  const setUserHouses = useStore((state) => state.setUserHouses);
  const setUserAspects = useStore((state) => state.setUserAspects);
  const setCurrentUserContext = useStore((state) => state.setCurrentUserContext);
  const setActiveUserContext = useStore((state) => state.setActiveUserContext);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (stelliumUser && userId !== stelliumUser._id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userData = await fetchUser(userId);
        if (cancelled) return;
        setUser(userData);
        setSelectedUser(userData);
        setUserId(userData._id);
        setCurrentUserContext(userData);
        setActiveUserContext(userData);
        if (userData?.birthChart) {
          if (userData.birthChart.planets) setUserPlanets(userData.birthChart.planets);
          if (userData.birthChart.houses) setUserHouses(userData.birthChart.houses);
          if (userData.birthChart.aspects) setUserAspects(userData.birthChart.aspects);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        if (!cancelled) setError('Failed to load user data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, stelliumUser, setSelectedUser, setUserId, setUserPlanets, setUserHouses, setUserAspects, setCurrentUserContext, setActiveUserContext]);

  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading) {
    return (
      <div className="md-page">
        <div className="md-loading">Loading your dashboard…</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="md-page">
        <div className="md-empty">{error || 'Unable to load your dashboard.'}</div>
      </div>
    );
  }

  return (
    <DashboardContent
      user={user}
      userId={userId}
      entitlements={entitlements}
      credits={credits}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={signOut}
      onNavigate={navigate}
    />
  );
}

function DashboardContent({ user, userId, entitlements, credits, activeTab, onTabChange, onSignOut, onNavigate }) {
  const handleSignOut = async () => {
    await onSignOut();
    onNavigate('/login');
  };

  return (
    <div className="md-page">
      <DashboardNav
        user={user}
        entitlements={entitlements}
        credits={credits}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNavigateHome={() => onNavigate('/')}
        onSignOut={handleSignOut}
      />

      <section className="md-shell">
        <div className="md-halo lilac md-shell__halo-c" />
        <div className="md-halo gold md-shell__halo-l" />
        <div className="md-halo lilac md-shell__halo-r" />
        <Stardust seed={5} density={70} />

        <div className="md-wrap">
          {activeTab === 'home' && (
            <HomePane userId={userId} user={user} entitlements={entitlements} />
          )}
          {activeTab === 'charts' && (
            <ChartsPane userId={userId} user={user} entitlements={entitlements} onNavigate={onNavigate} />
          )}
          {activeTab === 'relationships' && (
            <RelationshipsPane userId={userId} onNavigate={onNavigate} />
          )}
          {(activeTab === 'settings' || activeTab.startsWith('settings:')) && (
            <SettingsSection
              userId={userId}
              user={user}
              entitlements={entitlements}
              initialTab={activeTab.startsWith('settings:') ? activeTab.split(':')[1] : 'profile'}
            />
          )}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── HOME PANE ───────────────────────── */

const PERIOD_OPTIONS = [
  { id: 'daily',   label: 'Daily',   storeKey: 'today',  fetcher: generateDailyHoroscope, supportsDate: true },
  { id: 'weekly',  label: 'Weekly',  storeKey: 'week',   fetcher: generateWeeklyHoroscope, supportsDate: false },
  { id: 'monthly', label: 'Monthly', storeKey: 'month',  fetcher: generateMonthlyHoroscope, supportsDate: false }
];

function HomePane({ userId, user, entitlements }) {
  const [period, setPeriod] = useState('daily');
  const [horoscopes, setHoroscopes] = useState({ daily: null, weekly: null, monthly: null });
  const [horoLoading, setHoroLoading] = useState({ daily: false, weekly: false, monthly: false });
  const [horoErrors, setHoroErrors] = useState({ daily: null, weekly: null, monthly: null });
  const [transits, setTransits] = useState([]);
  const [askOpen, setAskOpen] = useState(false);

  // Daily horoscope is gated; allow others to load freely
  const canAccessDaily = entitlements?.canAccessDaily !== false;

  // Fetch transit windows (covers the next two months)
  useEffect(() => {
    let cancelled = false;
    if (!userId) return undefined;
    (async () => {
      try {
        const now = new Date();
        const fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const toDate = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
        const response = await getTransitWindows(userId, fromDate, toDate);
        if (cancelled) return;
        if (Array.isArray(response)) {
          setTransits(response);
        } else if (response) {
          const merged = [
            ...(response.transitEvents || []),
            ...(response.transitToTransitEvents || [])
          ];
          setTransits(merged);
        }
      } catch (err) {
        console.error('Error loading transits:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const loadHoroscope = useCallback(async (periodId) => {
    if (!userId) return;
    if (horoscopes[periodId]) return;
    if (periodId === 'daily' && !canAccessDaily) return;
    setHoroLoading((prev) => ({ ...prev, [periodId]: true }));
    setHoroErrors((prev) => ({ ...prev, [periodId]: null }));
    try {
      const config = PERIOD_OPTIONS.find((p) => p.id === periodId);
      const response = config.supportsDate
        ? await config.fetcher(userId, formatLocalDateParam())
        : await config.fetcher(userId);
      if (response?.success && response?.horoscope) {
        setHoroscopes((prev) => ({ ...prev, [periodId]: response.horoscope }));
      } else {
        throw new Error('No horoscope returned');
      }
    } catch (err) {
      console.error(`Error loading ${periodId} horoscope:`, err);
      setHoroErrors((prev) => ({ ...prev, [periodId]: 'We couldn’t load this reading right now.' }));
    } finally {
      setHoroLoading((prev) => ({ ...prev, [periodId]: false }));
    }
  }, [userId, horoscopes, canAccessDaily]);

  useEffect(() => {
    loadHoroscope(period);
  }, [period, loadHoroscope]);

  const todayLabel = useMemo(() => {
    const d = new Date();
    return `${d.getUTCDate()} ${d.toLocaleString('default', { month: 'long', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;
  }, []);

  const currentHoroscope = horoscopes[period];
  const currentLoading = horoLoading[period];
  const currentError = horoErrors[period];

  const filteredTransits = useMemo(() => filterTransitsForPeriod(transits, period), [transits, period]);

  const paragraphs = useMemo(() => {
    const text = currentHoroscope?.interpretation || currentHoroscope?.text || '';
    return text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);
  }, [currentHoroscope]);

  const dailyLocked = period === 'daily' && !canAccessDaily;

  return (
    <div className="md-home-layout">
      <article className="md-horo-card">
        <div className="md-horo-head">
          <div>
            <h1 className="md-horo-title">Horoscopes by Stellium</h1>
            <div className="md-horo-date">{todayLabel}</div>
          </div>
          <button type="button" className="md-ask-btn" onClick={() => setAskOpen(prev => !prev)}>
            <span className="md-ask-btn__sparkle">✦</span> Ask Stellium about this chart
          </button>
        </div>

        <div className="md-horo-period" role="tablist">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              className={`md-period-tab${period === p.id ? ' active' : ''}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="md-horo-body">
          {dailyLocked && (
            <div className="md-horo-empty">
              Daily horoscopes are part of Plus. Upgrade in <em>Settings → Subscription</em> to read today’s sky.
            </div>
          )}
          {!dailyLocked && currentLoading && (
            <div className="md-horo-empty">Reading the sky for {period === 'daily' ? 'today' : `this ${period.replace('ly', '')}`}…</div>
          )}
          {!dailyLocked && !currentLoading && currentError && (
            <div className="md-horo-error">{currentError}</div>
          )}
          {!dailyLocked && !currentLoading && !currentError && currentHoroscope && paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {!dailyLocked && !currentLoading && !currentError && currentHoroscope && filteredTransits.length > 0 && (
            <>
              <div className="md-horo-divider" />
              <div className="md-key-influences-label">Key Planetary Influences</div>
              <div className="md-influences-grid">
                {filteredTransits.map((t, i) => {
                  const title = formatTransitTitle(t);
                  const dateLabel = formatTransitDate(t);
                  if (!title) return null;
                  return (
                    <span className="md-influence-pill" key={i}>
                      {title}
                      {dateLabel && (
                        <>
                          <span className="md-influence-pill__sep">·</span>
                          <span className="md-influence-pill__date">{dateLabel}</span>
                        </>
                      )}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </article>

      <AskStelliumPanel
        isOpen={askOpen}
        onClose={() => setAskOpen(false)}
        contentType="horoscope"
        contentId={userId}
        birthChart={user?.birthChart}
        contextLabel="About your horoscope"
        placeholderText="Ask about your horoscope…"
        suggestedQuestions={[
          'What should I focus on today?',
          'How will this transit affect me?',
          'What energy should I watch for this week?'
        ]}
      />
    </div>
  );
}

/* ───────────────────────── CHARTS PANE ───────────────────────── */

function ChartsPane({ userId, user, entitlements, onNavigate }) {
  const [guestCharts, setGuestCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const fetchEntitlements = useEntitlementsStore((s) => s.fetchEntitlements);
  const applyOptimisticCreditSpend = useEntitlementsStore((s) => s.applyOptimisticCreditSpend);
  const restoreCredits = useEntitlementsStore((s) => s.restoreCredits);
  const credits = useEntitlementsStore((s) => s.credits);

  const loadCharts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserSubjects(userId);
      const guests = (response || []).filter((s) => s.kind !== 'accountSelf');
      setGuestCharts(guests);
    } catch (err) {
      console.error('Error fetching guest charts:', err);
      setError('Failed to load birth charts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadCharts();
  }, [userId, loadCharts]);

  const handleChartClick = (chartId) => {
    onNavigate(`/dashboard/${userId}/chart/${chartId}`);
  };

  const handleDelete = async (e, chart) => {
    e.stopPropagation();
    e.preventDefault();
    const name = `${chart.firstName || ''} ${chart.lastName || ''}`.trim() || 'this birth chart';
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteSubject(chart._id, userId);
      setGuestCharts((curr) => curr.filter((c) => c._id !== chart._id));
    } catch (err) {
      console.error('Error deleting chart:', err);
    }
  };

  const handleAddChartSubmit = async (guestData) => {
    const cost = CREDIT_COSTS.GUEST_CHART;
    if (!entitlements?.isPlus && (credits?.total ?? 0) < cost) {
      setShowPaywall(true);
      return;
    }
    const { photoFile, ...apiData } = guestData;
    setCreating({ firstName: guestData.firstName, lastName: guestData.lastName });
    let snapshot = null;
    try {
      if (!entitlements?.isPlus) snapshot = applyOptimisticCreditSpend(cost);
      const result = await createGuestSubject(apiData);
      if (result.success || result.userId || result.guestSubject) {
        await loadCharts();
        fetchEntitlements(userId);
      } else {
        throw new Error(result.error || 'Failed to create chart');
      }
    } catch (err) {
      console.error('Error creating guest chart:', err);
      restoreCredits(snapshot);
      if (err?.statusCode === 402) setShowPaywall(true);
    } finally {
      setCreating(null);
    }
  };

  // Show the user's own chart as #1 (active), then guests
  const allCharts = useMemo(() => {
    const own = user ? [{ ...user, isOwn: true }] : [];
    return [...own, ...guestCharts];
  }, [user, guestCharts]);

  return (
    <>
      <div className="md-charts-head">
        <h1>My Birth Charts</h1>
        <span className="md-charts-head__meta">
          {allCharts.length} {allCharts.length === 1 ? 'chart' : 'charts'} · 1 active
        </span>
      </div>

      {loading && <div className="md-loading">Loading your birth charts…</div>}
      {error && <div className="md-empty">{error}</div>}

      {!loading && !error && (
        <div className="md-charts-grid">
          {allCharts.map((chart, i) => {
            const tone = PORTRAIT_TONES[i % PORTRAIT_TONES.length];
            const name = `${chart.firstName || ''} ${chart.lastName || ''}`.trim();
            const sunSign = getSunSign(chart);
            const photo = chart.profilePhotoUrl;
            const initials = `${chart.firstName?.[0] || ''}${chart.lastName?.[0] || ''}`.toUpperCase();
            return (
              <button
                key={chart._id}
                type="button"
                className={`md-chart-card${chart.isOwn ? ' active' : ''}`}
                onClick={() => handleChartClick(chart._id)}
              >
                <div className="md-chart-card__num">{i + 1}</div>
                <div className={`md-chart-card__face ${tone}`}>
                  {photo ? (
                    <img className="md-chart-card__img" src={photo} alt={name} />
                  ) : (
                    <span className="md-chart-card__initials">{initials || '✦'}</span>
                  )}
                </div>
                {chart.isOwn && <div className="md-chart-card__star" title="Your chart">✦</div>}
                {!chart.isOwn && (
                  <button
                    type="button"
                    className="md-chart-card__delete"
                    aria-label={`Delete ${name || 'chart'}`}
                    onClick={(e) => handleDelete(e, chart)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                <div className="md-chart-card__info">
                  <div className="md-chart-card__nm">{name || 'Untitled'}</div>
                  {sunSign && <div className="md-chart-card__sg">{sunSign}</div>}
                </div>
              </button>
            );
          })}

          <button type="button" className="md-add-card" onClick={() => setIsAddModalOpen(true)}>
            <div className="md-add-card__wrap">
              <div className="md-add-card__plus">+</div>
              <div className="md-add-card__lbl">Add Birth Chart</div>
            </div>
          </button>
        </div>
      )}

      {creating && (
        <div className="md-loading" style={{ marginTop: 24 }}>
          Creating chart for {creating.firstName} {creating.lastName}…
        </div>
      )}

      <AddChartModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userId={userId}
        onSubmit={handleAddChartSubmit}
      />

      <InsufficientCreditsModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        creditsNeeded={CREDIT_COSTS.GUEST_CHART}
        creditsAvailable={credits?.total ?? 0}
        onBuyCredits={() => { setShowPaywall(false); onNavigate('/pricingTable'); }}
        onSubscribe={() => { setShowPaywall(false); onNavigate('/pricingTable'); }}
      />
    </>
  );
}

/* ───────────────────────── RELATIONSHIPS PANE ───────────────────────── */

function getRelationshipPartnerName(relationship, userId) {
  // Figure out which side is the partner (not the logged-in user)
  if (relationship?.userA_id === userId) {
    return (
      `${relationship?.userB_firstName || ''} ${relationship?.userB_lastName || ''}`.trim() ||
      relationship?.userB_name || 'Partner'
    );
  }
  if (relationship?.userB_id === userId) {
    return (
      `${relationship?.userA_firstName || ''} ${relationship?.userA_lastName || ''}`.trim() ||
      relationship?.userA_name || 'Partner'
    );
  }
  // Fallback: pick A first
  return (
    `${relationship?.userA_firstName || ''} ${relationship?.userA_lastName || ''}`.trim() ||
    relationship?.userA_name || 'Partner'
  );
}

function getPartnerBirthDate(relationship, userId) {
  if (relationship?.userA_id === userId) return relationship?.userB_dateOfBirth || relationship?.userB_birthDate;
  if (relationship?.userB_id === userId) return relationship?.userA_dateOfBirth || relationship?.userA_birthDate;
  return relationship?.userA_dateOfBirth || relationship?.userA_birthDate;
}

function getPartnerPhoto(relationship, userId) {
  if (relationship?.userA_id === userId) return relationship?.userB_profilePhotoUrl || relationship?.userB_photoUrl;
  if (relationship?.userB_id === userId) return relationship?.userA_profilePhotoUrl || relationship?.userA_photoUrl;
  return relationship?.userA_profilePhotoUrl || relationship?.userA_photoUrl;
}

function RelationshipsPane({ userId, onNavigate }) {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const composites = await getUserCompositeCharts(userId);
        if (cancelled) return;
        setRelationships(composites || []);
      } catch (err) {
        console.error('Error fetching relationships:', err);
        if (!cancelled) setError('Failed to load relationships');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const handleClick = (relationship) => {
    onNavigate(`/dashboard/${userId}/relationship/${relationship._id}`);
  };

  const handleAdd = () => {
    onNavigate(`/dashboard/${userId}/relationship/create`);
  };

  return (
    <>
      <div className="md-rel-head">
        <h1>My Relationships</h1>
        <button type="button" className="md-add-rel-btn" onClick={handleAdd}>
          <span className="md-add-rel-btn__pl">+</span> Add New Relationship
        </button>
      </div>

      {loading && <div className="md-loading">Loading your relationships…</div>}
      {!loading && error && <div className="md-empty">{error}</div>}
      {!loading && !error && relationships.length === 0 && (
        <div className="md-empty">
          You don’t have any relationships yet. Add one to see how your sky meets theirs.
        </div>
      )}

      {!loading && !error && relationships.length > 0 && (
        <div className="md-rel-list">
          {relationships.map((rel, i) => {
            const partnerName = getRelationshipPartnerName(rel, userId);
            const partnerFirst = partnerName.split(' ')[0];
            const photo = getPartnerPhoto(rel, userId);
            const date = formatBirthDate(getPartnerBirthDate(rel, userId));
            const overall =
              rel?.relationshipAnalysisStatus?.clusterScoring?.overall ||
              rel?.clusterScoring?.overall ||
              rel?.clusterAnalysis?.overall;
            const { cardHeadline, blurb } = getRelationshipCardSummary(overall);
            const tone = PORTRAIT_TONES[i % PORTRAIT_TONES.length];
            return (
              <button
                key={rel._id}
                type="button"
                className="md-rel-row"
                onClick={() => handleClick(rel)}
              >
                <div className={`md-rel-avatar ${tone}`}>
                  {photo ? (
                    <img className="md-rel-avatar__img" src={photo} alt={partnerName} />
                  ) : (
                    <span className="md-rel-avatar__initial">{getInitial(partnerFirst)}</span>
                  )}
                </div>
                <div className="md-rel-body">
                  <div className="md-rel-firstname">{partnerFirst}</div>
                  {cardHeadline && <div className="md-rel-arche">{cardHeadline}</div>}
                  {date && <div className="md-rel-date">{date}</div>}
                  {blurb && <p className="md-rel-summary">{blurb}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default MainDashboard;
