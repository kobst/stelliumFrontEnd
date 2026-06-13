import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import AskStelliumShowcase from '../UI/landingPage/AskStelliumShowcase';
import { useAuth } from '../context/AuthContext';
import { useCheckout } from '../hooks/useCheckout';
import { ZODIAC_SIGNS } from '../Utilities/zodiac';
import { trackLandingCTAClicked } from '../Utilities/analytics';
import { fetchCelebrities, getCelebrityRelationships, fetchRelationshipAnalysis } from '../Utilities/api';
import { getRelationshipSummary } from '../Utilities/relationshipSummary';

const SIGN_DATES = {
  aries: 'Mar 21 – Apr 19',
  taurus: 'Apr 20 – May 20',
  gemini: 'May 21 – Jun 20',
  cancer: 'Jun 21 – Jul 22',
  leo: 'Jul 23 – Aug 22',
  virgo: 'Aug 23 – Sep 22',
  libra: 'Sep 23 – Oct 22',
  scorpio: 'Oct 23 – Nov 21',
  sagittarius: 'Nov 22 – Dec 21',
  capricorn: 'Dec 22 – Jan 19',
  aquarius: 'Jan 20 – Feb 18',
  pisces: 'Feb 19 – Mar 20'
};

const PORTRAIT_TONES = ['lilac', 'gold', 'cyan', 'rose'];
const PAIR_AV_GRADIENTS = [
  'linear-gradient(135deg, #cabeff, #8a7ad4)',
  'linear-gradient(135deg, #f3d27a, #b88d2a)',
  'linear-gradient(135deg, #b5708a, #6b3a4f)',
  'linear-gradient(135deg, #3da3aa, #1d4a52)'
];

const CHEMISTRY_ARCHETYPES = [
  { min: 85, label: 'Lightning in a Bottle' },
  { min: 75, label: 'Live Wire' },
  { min: 65, label: 'Slow Orbit' },
  { min: 55, label: 'Quiet Balance' },
  { min: 0,  label: 'Crossed Skies' }
];

function archetypeForScore(score) {
  return CHEMISTRY_ARCHETYPES.find((a) => score >= a.min)?.label || CHEMISTRY_ARCHETYPES[CHEMISTRY_ARCHETYPES.length - 1].label;
}

function getInitial(name) {
  return (name?.charAt(0) || '?').toUpperCase();
}

function getPlanetSign(chart, planetName) {
  return chart?.birthChart?.planets?.find((p) => p.name === planetName)?.sign || null;
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
    <svg className="lp-stardust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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

function StelliumMark() {
  return (
    <svg className="lp-stellium-mark__svg" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <radialGradient id="lpDotMain" cx="40%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#f1ebff" />
          <stop offset="45%"  stopColor="#cabeff" />
          <stop offset="100%" stopColor="#5a4d96" />
        </radialGradient>
        <radialGradient id="lpDotSmall" cx="40%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#e9dcff" />
          <stop offset="60%"  stopColor="#a89adf" />
          <stop offset="100%" stopColor="#46396f" />
        </radialGradient>
        <radialGradient id="lpDotTiny" cx="40%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#fff5d5" />
          <stop offset="60%"  stopColor="#e9c349" />
          <stop offset="100%" stopColor="#7a5a18" />
        </radialGradient>
        <radialGradient id="lpGlowL" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#cabeff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#cabeff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lpGlowG" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#e9c349" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#e9c349" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform="translate(150 70)">
        <circle r="55" fill="url(#lpGlowL)" />
        <ellipse cx="0" cy="-2" rx="30" ry="6" fill="none" stroke="#cabeff" strokeOpacity="0.62" strokeWidth="1" transform="rotate(-16)" />
        <ellipse cx="0" cy="-2" rx="34" ry="7" fill="none" stroke="#cabeff" strokeOpacity="0.18" strokeWidth="0.7" transform="rotate(-16)" />
        <circle r="14" fill="url(#lpDotSmall)" />
      </g>

      <g transform="translate(150 195)">
        <circle r="120" fill="url(#lpGlowL)" />
        <circle r="54" fill="url(#lpDotMain)" />
      </g>

      <g transform="translate(150 300)">
        <circle r="40" fill="url(#lpGlowG)" />
        <circle r="9" fill="url(#lpDotTiny)" />
      </g>

      <path d="M 30 360 Q 150 392 270 360" stroke="rgba(202,190,255,0.55)" strokeWidth="1.2" fill="none" />
      <path d="M 30 372 Q 150 408 270 372" stroke="rgba(202,190,255,0.18)" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function ChartMini() {
  return (
    <svg className="lp-feat__chart-mini" viewBox="0 0 240 240" width="240" height="240" style={{ opacity: 0.9 }} aria-hidden="true">
      <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(202,190,255,0.18)" strokeWidth="0.7" />
      <circle cx="120" cy="120" r="90"  fill="none" stroke="rgba(202,190,255,0.12)" strokeWidth="0.6" />
      <circle cx="120" cy="120" r="40"  fill="none" stroke="rgba(233,195,73,0.18)" strokeWidth="0.5" strokeDasharray="2 3" />
      <g stroke="rgba(202,190,255,0.08)" strokeWidth="0.5">
        <line x1="120" y1="14" x2="120" y2="226" />
        <line x1="14" y1="120" x2="226" y2="120" />
        <line x1="44" y1="44" x2="196" y2="196" />
        <line x1="196" y1="44" x2="44" y2="196" />
      </g>
      <line x1="88" y1="58" x2="170" y2="184" stroke="#cabeff" strokeOpacity="0.5" strokeWidth="0.9" />
      <line x1="180" y1="98" x2="60" y2="160" stroke="#e9c349" strokeOpacity="0.5" strokeWidth="0.7" strokeDasharray="3 3" />
      <image href="/assets/planets/Sun.svg"     x="80"  y="46"  width="18" height="18" />
      <image href="/assets/planets/Venus.svg"   x="170" y="86"  width="16" height="16" />
      <image href="/assets/planets/Mars.svg"    x="162" y="174" width="16" height="16" />
      <image href="/assets/planets/Moon.svg"    x="48"  y="150" width="16" height="16" />
      <image href="/assets/planets/Mercury.svg" x="118" y="80"  width="14" height="14" />
      <image href="/assets/planets/Saturn.svg"  x="64"  y="92"  width="16" height="16" />
      <circle cx="120" cy="120" r="2.5" fill="#e9c349" />
    </svg>
  );
}

function CelebPortrait({ chart, tone }) {
  if (chart?.profilePhotoUrl) {
    const name = `${chart.firstName || ''} ${chart.lastName || ''}`.trim();
    return (
      <div className={`lp-portrait ${tone}`}>
        <img className="lp-portrait__img" src={chart.profilePhotoUrl} alt={name} loading="lazy" />
        <Stardust seed={chart._id?.length || 1} density={40} />
      </div>
    );
  }
  return (
    <div className={`lp-portrait ${tone}`}>
      <Stardust seed={(chart?._id?.length || 1) + 7} density={40} />
      <svg className="lp-portrait__silhouette" viewBox="0 0 280 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id={`lpSil-${chart?._id || tone}`} cx="50%" cy="55%" r="55%">
            <stop offset="0%"  stopColor="rgba(255,255,255,0.22)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <ellipse cx="140" cy="160" rx="78" ry="92" fill={`url(#lpSil-${chart?._id || tone})`} />
        <ellipse cx="140" cy="120" rx="34" ry="42" fill="rgba(0,0,0,0.18)" />
      </svg>
      <span className="lp-portrait__label">{`// ${getInitial(chart?.firstName)}`}</span>
    </div>
  );
}

function CelebCard({ chart, tone, onClick }) {
  const sunSign = getPlanetSign(chart, 'Sun');
  const moonSign = getPlanetSign(chart, 'Moon');
  const fullName = `${chart?.firstName || ''} ${chart?.lastName || ''}`.trim() || 'Untitled Chart';
  const aspect = [
    sunSign ? `${sunSign} Sun` : null,
    moonSign ? `${moonSign} Moon` : null
  ].filter(Boolean).join(' · ') || 'Birth chart';

  return (
    <button type="button" className="lp-celeb-card" onClick={onClick}>
      <CelebPortrait chart={chart} tone={tone} />
      <div className="lp-celeb-body">
        <div className="lp-celeb-body__aspect">{aspect}</div>
        <div className="lp-celeb-body__name">{fullName}</div>
        {chart?.tagline && <div className="lp-celeb-body__caption">{chart.tagline}</div>}
      </div>
    </button>
  );
}

function PairAvatar({ photoUrl, name, gradient }) {
  if (photoUrl) {
    return (
      <div className="lp-pair-avatars__av" style={{ background: gradient }}>
        <img src={photoUrl} alt={name || ''} loading="lazy" />
      </div>
    );
  }
  return (
    <div className="lp-pair-avatars__av" style={{ background: gradient }}>
      {getInitial(name)}
    </div>
  );
}

function PairCard({ relationship, gradients, onClick }) {
  const userAName = `${relationship?.userA_firstName || ''} ${relationship?.userA_lastName || ''}`.trim() || relationship?.userA_name || 'Person A';
  const userBName = `${relationship?.userB_firstName || ''} ${relationship?.userB_lastName || ''}`.trim() || relationship?.userB_name || 'Person B';
  const aPhoto = relationship?.userA_profilePhotoUrl || relationship?.userA_photoUrl;
  const bPhoto = relationship?.userB_profilePhotoUrl || relationship?.userB_photoUrl;

  const scoring =
    relationship?.relationshipAnalysisStatus?.clusterScoring ||
    relationship?.clusterScoring ||
    relationship?.clusterAnalysis ||
    {};
  const overallScore = Math.round(scoring?.overall?.score ?? relationship?.compatibilityScore ?? 0);
  const { label } = getRelationshipSummary(scoring?.overall);
  const archetype = label || archetypeForScore(overallScore);

  const clusters = scoring?.clusters || scoring;
  const findScore = (keys) => {
    for (const key of keys) {
      const direct = clusters?.[key];
      if (direct && typeof direct === 'object' && typeof direct.score === 'number') {
        return Math.round(direct.score);
      }
      if (typeof direct === 'number') return Math.round(direct);
    }
    return null;
  };

  const stats = [
    { label: 'HAR', score: findScore(['Harmony', 'HARMONY', 'harmony']) ?? overallScore },
    { label: 'PAS', score: findScore(['Passion', 'PASSION', 'passion', 'INTIMACY_AND_PASSION']) ?? overallScore },
    { label: 'CON', score: findScore(['Connection', 'CONNECTION', 'connection', 'EMOTIONAL_SECURITY_CONNECTION', 'COMMUNICATION_AND_MENTAL_CONNECTION']) ?? overallScore },
    { label: 'STA', score: findScore(['Stability', 'STABILITY', 'stability', 'PRACTICAL_GROWTH_SHARED_GOALS']) ?? overallScore },
    { label: 'GRO', score: findScore(['Growth', 'GROWTH', 'growth', 'KARMIC_LESSONS_GROWTH']) ?? overallScore }
  ];
  const maxStat = Math.max(...stats.map((s) => s.score));

  return (
    <button type="button" className="lp-pair-card" onClick={onClick}>
      <div className="lp-pair-avatars">
        <PairAvatar photoUrl={aPhoto} name={userAName} gradient={gradients[0]} />
        <PairAvatar photoUrl={bPhoto} name={userBName} gradient={gradients[1]} />
      </div>
      <div className="lp-pair-card__names">{userAName} & {userBName}</div>
      <div className="lp-pair-card__archetype">{archetype}</div>
      <p>Cosmic chemistry across five dimensions — see the full synastry and composite breakdown.</p>
      <div className="lp-stat-strip">
        {stats.map(({ label, score }) => (
          <div className="lp-stat-strip__stat" key={label}>
            <span className={`lp-stat-strip__v${score === maxStat ? ' gold' : ''}`}>{score}</span>
            <span className="lp-stat-strip__l">{label}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

function CelebrityCardSkeleton({ tone }) {
  return (
    <div className="lp-celeb-card lp-skeleton-card" aria-hidden="true">
      <div className={`lp-portrait ${tone}`} />
      <div className="lp-celeb-body">
        <div className="lp-skeleton-line" style={{ width: '40%' }} />
        <div className="lp-skeleton-line" style={{ width: '70%', height: 20 }} />
        <div className="lp-skeleton-line" style={{ width: '90%' }} />
      </div>
    </div>
  );
}

function PairCardSkeleton() {
  return (
    <div className="lp-pair-card lp-skeleton-card" aria-hidden="true">
      <div className="lp-pair-avatars">
        <div className="lp-pair-avatars__av" style={{ background: 'rgba(202,190,255,0.06)' }} />
        <div className="lp-pair-avatars__av" style={{ background: 'rgba(202,190,255,0.06)' }} />
      </div>
      <div className="lp-skeleton-line" style={{ width: '60%', height: 20 }} />
      <div className="lp-skeleton-line" style={{ width: '40%' }} />
      <div className="lp-skeleton-line" style={{ width: '100%' }} />
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();
  const checkout = useCheckout(stelliumUser);

  const [celebrities, setCelebrities] = useState([]);
  const [celebsLoading, setCelebsLoading] = useState(true);
  const [relationships, setRelationships] = useState([]);
  const [relsLoading, setRelsLoading] = useState(true);

  // Fade-in observer
  const pageRef = useRef(null);
  const fadeRefs = useRef([]);
  const addFadeRef = useCallback((el) => {
    if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el);
  }, []);

  useEffect(() => {
    const els = fadeRefs.current;
    const revealAll = () => els.forEach((el) => el.classList.add('is-visible'));

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Without animation support (reduced motion or no IntersectionObserver),
    // show everything immediately — never leave a section hidden.
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      revealAll();
      return undefined;
    }

    // Opt into the hidden start-state only now that JS is driving the reveal.
    if (pageRef.current) pageRef.current.classList.add('lp-anim-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      // Reveal slightly before a section scrolls into view so fast scrolling
      // and slow connections never expose a blank navy band.
      { threshold: 0, rootMargin: '0px 0px 12% 0px' }
    );
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Load celebrities
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fetched = await fetchCelebrities();
        if (cancelled) return;
        const shuffled = [...(fetched || [])].sort(() => Math.random() - 0.5);
        setCelebrities(shuffled.slice(0, 8));
      } catch (err) {
        console.error('Error loading celebrities:', err);
      } finally {
        if (!cancelled) setCelebsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load celebrity relationships
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rels, celebs] = await Promise.all([
          getCelebrityRelationships(6),
          fetchCelebrities()
        ]);
        if (cancelled) return;

        const photoMap = {};
        if (Array.isArray(celebs)) {
          celebs.forEach((c) => {
            if (c._id && c.profilePhotoUrl) photoMap[c._id] = c.profilePhotoUrl;
          });
        }
        const enriched = (rels || []).map((r) => ({
          ...r,
          userA_profilePhotoUrl: r.userA_profilePhotoUrl || photoMap[r.userA_id] || null,
          userB_profilePhotoUrl: r.userB_profilePhotoUrl || photoMap[r.userB_id] || null
        }));
        setRelationships(enriched);
        setRelsLoading(false);

        const analysisResults = await Promise.all(
          enriched.map((rel) =>
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
        if (!cancelled) setRelsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleGetStarted = () => {
    trackLandingCTAClicked('get_started');
    if (stelliumUser) navigate(`/dashboard/${stelliumUser._id}`);
    else navigate('/birthChartEntry');
  };

  const handleStartPlus = () => {
    trackLandingCTAClicked('start_plus');
    if (stelliumUser) checkout.startSubscription();
    else navigate('/birthChartEntry?intent=plus');
  };

  const handleBuyCredits = () => {
    trackLandingCTAClicked('buy_credits');
    if (stelliumUser) checkout.purchaseCreditPack?.();
    else navigate('/birthChartEntry?intent=creditPack');
  };

  const handleSignPick = (sign) => {
    trackLandingCTAClicked(`sign_${sign}`);
    navigate(`/horoscopes/weekly/${sign}`);
  };

  const handleCelebClick = (celeb) => {
    navigate(`/celebrities/${celeb._id}`);
  };

  const handleRelationshipClick = (rel) => {
    navigate(`/celebrity-relationships/${rel._id}`);
  };

  const handleViewAllCelebs = () => navigate('/celebrities');
  const handleViewAllRelationships = () => navigate('/celebrity-relationships');
  const handleViewAllSigns = () => navigate('/horoscopes/weekly');

  const dashboardLabel = stelliumUser ? 'Go to Dashboard' : 'Start free';
  const dashboardCta = () => {
    if (stelliumUser) navigate(`/dashboard/${stelliumUser._id}`);
    else navigate('/birthChartEntry');
  };

  return (
    <div className="landing-page" ref={pageRef}>
      {/* ─── NAV ───────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav__inner">
          <a className="lp-wordmark" href="#top" aria-label="Stellium home">
            <span className="lp-wordmark__glyph"><WordmarkGlyph /></span>
            <span className="lp-wordmark__name">Stellium</span>
          </a>
          <div className="lp-nav__links">
            <a className="lp-nav__link" href="#how">How it works</a>
            <a className="lp-nav__link" href="#features">Features</a>
            <a className="lp-nav__link" href="#discover">Discover</a>
            <a className="lp-nav__link" href="#horoscopes">Horoscopes</a>
            <a className="lp-nav__link" href="#pricing">Pricing</a>
            {stelliumUser ? (
              <button type="button" className="lp-btn lp-btn--primary" onClick={dashboardCta}>
                Go to Dashboard <span style={{ opacity: 0.65 }}>→</span>
              </button>
            ) : (
              <>
                <button type="button" className="lp-nav__link lp-btn lp-btn--ghost" onClick={() => navigate('/login')}>
                  Sign in
                </button>
                <button type="button" className="lp-btn lp-btn--primary" onClick={handleGetStarted}>
                  Start free <span style={{ opacity: 0.65 }}>→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="lp-hero" id="top">
        <Stardust seed={1} density={80} />
        <div className="lp-halo lilac lp-hero__halo-1" />
        <div className="lp-halo gold lp-hero__halo-2" />

        <div className="lp-wrap">
          <div className="lp-hero__grid">
            <div className="lp-hero__copy">
              <div className="lp-hero__eyebrow">
                <span className="lp-hero__dot" />
                <span className="lp-eyebrow gold">Personalized astrology, powered by AI</span>
              </div>
              <h1>
                The stars,<br />
                read <span className="accent">just for you.</span>
              </h1>
              <p className="lp-hero__lede">
                Stellium reads <span className="gold-inline">your actual birth chart</span> — not your sun sign —
                for guidance that genuinely knows you.
              </p>
              <div className="lp-hero__cta">
                <button type="button" className="lp-btn lp-btn--primary" onClick={handleGetStarted}>
                  {dashboardLabel} →
                </button>
                <a className="lp-btn lp-btn--ghost" href="#how">See how it works</a>
                <span className="lp-hero__cta-meta">No credit card · 10 free credits</span>
              </div>
            </div>

            <div className="lp-hero__visual">
              <div className="lp-stellium-mark">
                <div className="lp-stellium-mark__bloom" />
                <StelliumMark />
                <div className="lp-stellium-mark__caption">
                  stellium <span className="lp-stellium-mark__caption-em">—</span> <em>a gathering of light</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────── */}
      <section className="lp-how lp-tonal" id="how" ref={addFadeRef}>
        <div className="lp-halo lilac lp-how__halo-l" />
        <div className="lp-halo gold lp-how__halo-r" />
        <Stardust seed={2} density={60} />

        <div className="lp-wrap">
          <div className="lp-section-head">
            <div className="lp-eyebrow gold">How Stellium gets this personal</div>
            <h2>Three steps from <span className="italic">birth data</span> to readings that actually know you.</h2>
            <p>Stellium reads your actual chart — not your sun sign. The depth you’d expect from a professional, in the language you actually speak.</p>
          </div>

          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step__num">01<span className="lp-step__num-label">Build your chart</span></div>
              <h3>Enter birth date, place, and time.</h3>
              <p>We build a complete model of your planets, houses, and aspects — and clearly flag any time-sensitive assumptions if you’re not sure of the exact minute.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step__num">02<span className="lp-step__num-label">Get a pro-grade reading</span></div>
              <h3>The depth of a real consult.</h3>
              <p>Hyper-personal birth-chart interpretations, multi-dimension relationship analysis, and transit-tuned horoscopes — all written for <em>your</em> placements, not generic sun-sign blurbs.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step__num">03<span className="lp-step__num-label">Ask anything</span></div>
              <h3>Conversational guidance that knows your chart.</h3>
              <p>Ask follow-ups about yourself, your relationship, or today’s transits. The chat remembers context and turns astro-speak into clear next steps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUICK HOROSCOPE PICKER ────────────────────────── */}
      <section className="lp-quicksigns" ref={addFadeRef}>
        <div className="lp-wrap">
          <div className="lp-quicksigns__inner">
            <div className="lp-quicksigns__copy">
              <div className="lp-eyebrow gold">Try it now — no signup</div>
              <h2>Your week, in <span className="italic">60 seconds.</span></h2>
              <p>Tap your sign for this week’s horoscope.</p>
            </div>
            <div className="lp-quicksigns__grid">
              {ZODIAC_SIGNS.map((sign) => (
                <button
                  key={sign.value}
                  type="button"
                  className="lp-quicksign"
                  onClick={() => handleSignPick(sign.value)}
                  aria-label={`${sign.label} weekly horoscope`}
                >
                  <img
                    src={`/assets/signs/${sign.value}.svg`}
                    alt=""
                    aria-hidden="true"
                    className="lp-quicksign__icon"
                  />
                  <span className="lp-quicksign__nm">{sign.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────── */}
      <section className="lp-features" id="features" ref={addFadeRef}>
        <div className="lp-halo lilac lp-features__halo-1" />

        <div className="lp-wrap">
          <div className="lp-section-head">
            <div className="lp-eyebrow lilac">What Stellium does</div>
            <h2>Four ways the chart <span className="italic">speaks</span> to you.</h2>
          </div>

          <div className="lp-feature-grid">
            <div className="lp-feat lp-feat--hero">
              <div>
                <div className="lp-feat__icon lilac">
                  <img src="/assets/planets/Sun.svg" alt="" aria-hidden="true" />
                </div>
                <h3>Birth Chart, made clear.</h3>
                <p className="lp-feat__tagline">AI deep-dive on every placement.</p>
                <p>Generate your full chart and explore planets, houses, and aspects with an interactive wheel. Tap anything for a plain-English breakdown — and we flag time-sensitive factors when an exact birth time isn’t known.</p>
                <p className="lp-feat__quote">“What does Venus in my 7th mean for relationships?”</p>
              </div>
              <ChartMini />
            </div>

            <div className="lp-feat lp-feat--tier2">
              <div className="lp-feat__icon gold">
                <img src="/assets/planets/Venus.svg" alt="" aria-hidden="true" />
              </div>
              <h3>Compatibility, clarified.</h3>
              <p className="lp-feat__tagline">Beyond a vibe.</p>
              <p>0–100 chemistry across Connection, Communication, Passion, Stability, and Growth — plus synastry & composite for anyone you add.</p>
              <p className="lp-feat__quote">“Where do we clash — and how do we fix it?”</p>
            </div>

            <div className="lp-feat lp-feat--tier3">
              <div className="lp-feat__icon cyan">
                <img src="/assets/planets/Mercury.svg" alt="" aria-hidden="true" />
              </div>
              <h3>Smart Horoscopes.</h3>
              <p className="lp-feat__tagline">Tuned to your placements.</p>
              <p>See how today’s — and any week’s — transits land for <em>you</em>, with clear guidance you can act on.</p>
              <p className="lp-feat__quote">“Is today good for the tough conversation?”</p>
            </div>

            <div className="lp-feat lp-feat--tier2">
              <div className="lp-feat__icon lilac">
                <img src="/assets/planets/Moon.svg" alt="" aria-hidden="true" />
              </div>
              <h3>Ask Anything.</h3>
              <p className="lp-feat__tagline">24/7 chart-aware chat.</p>
              <p>Ask about your placements, your relationship, or today’s transits. Instant, contextual answers — and follow-ups until it clicks.</p>
            </div>

            <div className="lp-feat lp-feat--tier3">
              <div className="lp-feat__icon gold">
                <img src="/assets/planets/Mars.svg" alt="" aria-hidden="true" />
              </div>
              <h3>Anyone you’ve ever wondered about.</h3>
              <p className="lp-feat__tagline">Partner, crush, ex, friend, celebrity.</p>
              <p>Add anyone by birth details — or pick from hundreds of celebrities. Stellium calculates synastry, composite, and a romantic archetype for the pair.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ASK STELLIUM ──────────────────────────────────── */}
      <section className="lp-ask" id="ask-stellium" ref={addFadeRef}>
        <div className="lp-halo cyan lp-ask__halo-c" />
        <Stardust seed={3} density={70} />
        <AskStelliumShowcase />
      </section>

      {/* ─── DISCOVER CHARTS ───────────────────────────────── */}
      <section className="lp-celebs" id="discover" ref={addFadeRef}>
        <div className="lp-halo lilac lp-celebs__halo-1" />

        <div className="lp-wrap">
          <div className="lp-row-head">
            <div>
              <div className="lp-eyebrow gold">Explore celebrity charts</div>
              <h2>See how the stars align for your <span className="italic">favorites.</span></h2>
            </div>
            <button type="button" className="lp-row-head__meta" onClick={handleViewAllCelebs}>
              Browse the database →
            </button>
          </div>
        </div>

        <div className="lp-wrap">
          <div className="lp-celeb-row">
            {celebsLoading
              ? [0, 1, 2, 3].map((i) => (
                  <CelebrityCardSkeleton key={i} tone={PORTRAIT_TONES[i % PORTRAIT_TONES.length]} />
                ))
              : celebrities.map((celeb, i) => (
                  <CelebCard
                    key={celeb._id}
                    chart={celeb}
                    tone={PORTRAIT_TONES[i % PORTRAIT_TONES.length]}
                    onClick={() => handleCelebClick(celeb)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* ─── DISCOVER RELATIONSHIPS ────────────────────────── */}
      <section className="lp-celebs" style={{ paddingTop: 40 }} ref={addFadeRef}>
        <div className="lp-wrap">
          <div className="lp-row-head">
            <div>
              <div className="lp-eyebrow gold">Explore celebrity relationships</div>
              <h2>Cosmic chemistry between <span className="italic">famous couples.</span></h2>
            </div>
            <button type="button" className="lp-row-head__meta" onClick={handleViewAllRelationships}>
              All relationships →
            </button>
          </div>
        </div>

        <div className="lp-wrap">
          <div className="lp-celeb-row">
            {relsLoading
              ? [0, 1, 2, 3].map((i) => <PairCardSkeleton key={i} />)
              : relationships.map((rel, i) => (
                  <PairCard
                    key={rel._id}
                    relationship={rel}
                    gradients={[
                      PAIR_AV_GRADIENTS[i % PAIR_AV_GRADIENTS.length],
                      PAIR_AV_GRADIENTS[(i + 1) % PAIR_AV_GRADIENTS.length]
                    ]}
                    onClick={() => handleRelationshipClick(rel)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* ─── SIGN PICKER ───────────────────────────────────── */}
      <section className="lp-signs" id="horoscopes" ref={addFadeRef}>
        <div className="lp-halo lilac lp-signs__halo-c" />
        <Stardust seed={4} density={60} />

        <div className="lp-wrap">
          <div className="lp-section-head">
            <div className="lp-eyebrow gold">This week’s horoscope</div>
            <h2>Pick your sign — or get the <span className="italic">real one.</span></h2>
            <p>Sun-sign blurbs are a starting point. The full reading takes 60 seconds and uses your actual chart.</p>
          </div>

          <div className="lp-sign-grid">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign.value}
                type="button"
                className="lp-sign"
                onClick={() => handleSignPick(sign.value)}
                aria-label={sign.label}
              >
                <img
                  src={`/assets/signs/${sign.value}.svg`}
                  alt=""
                  aria-hidden="true"
                  className="lp-sign__icon"
                />
                <span className="lp-sign__nm">{sign.label}</span>
                <span className="lp-sign__dates">{SIGN_DATES[sign.value]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ───────────────────────────────────────── */}
      <section className="lp-pricing" id="pricing" ref={addFadeRef}>
        <div className="lp-halo lilac lp-pricing__halo-c" />
        <Stardust seed={5} density={50} />

        <div className="lp-wrap">
          <div className="lp-section-head">
            <div className="lp-eyebrow gold">Choose your plan</div>
            <h2>All users use credits for <span className="italic">in-depth</span> analyses.</h2>
            <p>Free and Plus determine how much guidance you get by default — and how many credits arrive each month. Credit packs add more whenever you want them.</p>
          </div>

          <div className="lp-plans">
            <div className="lp-plan">
              <div className="lp-plan__name">Free</div>
              <div className="lp-plan__desc">Explore your chart and sample features.</div>
              <div className="lp-plan__price">$0<span className="lp-plan__per">/forever</span></div>
              <ul className="lp-plan__list">
                <li><span className="lp-plan__check">✓</span> Weekly & monthly horoscopes</li>
                <li><span className="lp-plan__check">✓</span> Unlimited chart & relationship creation</li>
                <li><span className="lp-plan__check">✓</span> <span className="lp-plan__credits-gold">10 credits</span> per month</li>
                <li><span className="lp-plan__check">✓</span> Buy credits anytime</li>
              </ul>
              <button type="button" className="lp-btn lp-btn--ghost lp-plan__btn" onClick={handleGetStarted}>
                Get started free
              </button>
            </div>

            <div className="lp-plan lp-plan--featured">
              <div className="lp-plan__badge">Most popular</div>
              <div className="lp-plan__name">Plus</div>
              <div className="lp-plan__desc">Daily guidance + monthly credits for ongoing insight.</div>
              <div className="lp-plan__price">$20<span className="lp-plan__per">/month</span></div>
              <ul className="lp-plan__list">
                <li className="bold"><span className="lp-plan__check">✓</span> Everything in Free, plus —</li>
                <li><span className="lp-plan__check">✓</span> Daily horoscopes tuned to your chart</li>
                <li><span className="lp-plan__check">✓</span> <span className="lp-plan__credits-gold">200 credits</span> per month</li>
                <li><span className="lp-plan__check">✓</span> Credits roll over (up to 400)</li>
                <li><span className="lp-plan__check">✓</span> Priority access to new features</li>
              </ul>
              <button type="button" className="lp-btn lp-btn--primary lp-plan__btn" onClick={handleStartPlus}>
                Start Plus
              </button>
              <div className="lp-plan__footnote">Cancel anytime.</div>
            </div>

            <div className="lp-plan">
              <div className="lp-plan__name">Credit Pack</div>
              <div className="lp-plan__desc">One-time credits. No subscription.</div>
              <div className="lp-plan__price">$10<span className="lp-plan__per">→ 100 credits</span></div>
              <ul className="lp-plan__list">
                <li><span className="lp-plan__check">✓</span> 100 credits, one-time purchase</li>
                <li><span className="lp-plan__check">✓</span> Never expire</li>
                <li><span className="lp-plan__check">✓</span> Use for any analysis or question</li>
                <li><span className="lp-plan__check">✓</span> Stack with Free or Plus</li>
              </ul>
              <button type="button" className="lp-btn lp-btn--gold lp-plan__btn" onClick={handleBuyCredits}>
                Buy credits
              </button>
            </div>
          </div>

          <div className="lp-compare">
            <h3>What’s <em>in</em> each plan</h3>
            <table>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>&nbsp;</th>
                  <th>Free</th>
                  <th className="plus">Plus</th>
                  <th>One credit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="row-label">Daily horoscope</td>
                  <td><span className="no">—</span></td>
                  <td><span className="yes">✓</span></td>
                  <td>—</td>
                </tr>
                <tr>
                  <td className="row-label">Weekly & monthly horoscopes</td>
                  <td><span className="yes">✓</span></td>
                  <td><span className="yes">✓</span></td>
                  <td>—</td>
                </tr>
                <tr>
                  <td className="row-label">Full birth-chart analysis</td>
                  <td colSpan="2" style={{ color: 'var(--lp-text-muted)' }}>Uses credits</td>
                  <td className="credit">75</td>
                </tr>
                <tr>
                  <td className="row-label">Relationship analysis</td>
                  <td colSpan="2" style={{ color: 'var(--lp-text-muted)' }}>Uses credits</td>
                  <td className="credit">60</td>
                </tr>
                <tr>
                  <td className="row-label">Ask Stellium (1 question)</td>
                  <td colSpan="2" style={{ color: 'var(--lp-text-muted)' }}>Uses credits</td>
                  <td className="credit">1</td>
                </tr>
                <tr>
                  <td className="row-label">Credits per month</td>
                  <td className="credit">10</td>
                  <td className="credit credit-lilac">200</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─────────────────────────────────────── */}
      <section className="lp-final-cta" ref={addFadeRef}>
        <div className="lp-halo lilac lp-final-cta__halo-c" />
        <Stardust seed={6} density={70} />

        <div className="lp-wrap">
          <div className="lp-eyebrow gold" style={{ marginBottom: 24, display: 'inline-block' }}>
            Ready when you are
          </div>
          <h2>Your first reading <span className="italic">is waiting.</span></h2>
          <p>60 seconds of birth data. A lifetime of context for everything that follows.</p>
          <button type="button" className="lp-btn lp-btn--primary" onClick={handleGetStarted}>
            {stelliumUser ? 'Go to your dashboard' : 'Start free'} →
          </button>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          <div className="lp-foot-grid">
            <div className="lp-foot-brand">
              <a className="lp-wordmark" href="#top">
                <span className="lp-wordmark__glyph"><WordmarkGlyph /></span>
                <span className="lp-wordmark__name">Stellium</span>
              </a>
              <p className="lp-foot-brand__blurb">
                Personalized astrology, powered by AI. Your chart, read like a person — not a horoscope column.
              </p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#discover">Discover</a></li>
                <li>
                  <a
                    href="/horoscopes/weekly"
                    onClick={(e) => { e.preventDefault(); handleViewAllSigns(); }}
                  >
                    Weekly horoscopes
                  </a>
                </li>
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
          <div className="lp-foot-bot">
            <span>© {new Date().getFullYear()} Stellium · Personalized astrology, powered by AI.</span>
            <span className="lp-foot-bot__italic">Made under a generous sky.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
