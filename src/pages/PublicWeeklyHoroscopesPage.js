import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useWeeklySunSignHoroscope from '../hooks/useWeeklySunSignHoroscope';
import {
  formatDateRange,
  formatLocalDateParam,
  parseDateInput,
  getUtcWeekStartDateString
} from '../Utilities/horoscopeDates';
import {
  DEFAULT_ZODIAC_SIGN,
  getZodiacLabel,
  normalizeZodiacSign,
  ZODIAC_SIGNS
} from '../Utilities/zodiac';
import { useAuth } from '../context/AuthContext';
import './PublicWeeklyHoroscopesPage.css';

const THEME_PILL_TONES = ['gold', '', 'cyan', '', 'gold', ''];

const PLANET_GLYPH_TO_FILE = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  Uranus: 'Uranus',
  Neptune: 'Neptune',
  Pluto: 'Pluto'
};

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
    <svg className="wh-stardust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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

function shiftDateByDays(dateString, days) {
  const parsed = parseDateInput(dateString) || parseDateInput(formatLocalDateParam());
  const shifted = new Date(parsed);
  shifted.setUTCDate(parsed.getUTCDate() + days);
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, '0'),
    String(shifted.getUTCDate()).padStart(2, '0')
  ].join('-');
}

function getIsoWeekNumber(dateString) {
  const parsed = parseDateInput(dateString) || parseDateInput(formatLocalDateParam());
  const tmp = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

function formatStepperRange(startDateStr) {
  const start = parseDateInput(startDateStr);
  if (!start) return '';
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const startMonth = start.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
  const endMonth = end.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
  const year = end.getUTCFullYear();
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${startMonth} ${start.getUTCDate()} – ${end.getUTCDate()}, ${year}`;
  }
  return `${startMonth} ${start.getUTCDate()} – ${endMonth} ${end.getUTCDate()}, ${year}`;
}

function formatThemeText(theme) {
  if (typeof theme === 'string') return theme;
  if (!theme || typeof theme !== 'object') return '';
  const { transitingPlanet, aspect, targetPlanet } = theme;
  return [transitingPlanet, aspect, targetPlanet].filter(Boolean).join(' ');
}

function getThemeGlyphFile(theme) {
  if (theme && typeof theme === 'object' && theme.transitingPlanet) {
    const file = PLANET_GLYPH_TO_FILE[theme.transitingPlanet];
    if (file) return file;
  }
  return null;
}

function splitInterpretationIntoParagraphs(text) {
  if (!text) return [];
  return text
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function PublicWeeklyHoroscopesPage() {
  const navigate = useNavigate();
  const { sign: routeSign } = useParams();
  const [searchParams] = useSearchParams();
  const { stelliumUser } = useAuth();

  const normalizedSign = normalizeZodiacSign(routeSign || DEFAULT_ZODIAC_SIGN);
  const requestedDateParam = searchParams.get('date');
  const requestedDate = parseDateInput(requestedDateParam)
    ? requestedDateParam
    : formatLocalDateParam();

  useEffect(() => {
    const params = searchParams.toString();
    if (!routeSign) {
      navigate(`/horoscopes/weekly/${DEFAULT_ZODIAC_SIGN}${params ? `?${params}` : ''}`, { replace: true });
      return;
    }
    if (!normalizedSign) {
      navigate(`/horoscopes/weekly/${DEFAULT_ZODIAC_SIGN}${params ? `?${params}` : ''}`, { replace: true });
    }
  }, [navigate, normalizedSign, routeSign, searchParams]);

  const selectedSign = normalizedSign || DEFAULT_ZODIAC_SIGN;
  const signLabel = getZodiacLabel(selectedSign);
  const {
    loading,
    horoscope,
    notReady,
    error,
    details,
    refetch
  } = useWeeklySunSignHoroscope(selectedSign, requestedDate);

  const weekStartDate = getUtcWeekStartDateString(requestedDate);
  const weekNumber = getIsoWeekNumber(weekStartDate);
  const weekStepperLabel = formatStepperRange(weekStartDate);

  const weekRange = formatDateRange(
    horoscope?.startDate || details?.startDate,
    horoscope?.endDate || details?.endDate
  );
  const keyThemes = useMemo(
    () => (horoscope?.analysis?.keyThemes || []).slice(0, 6),
    [horoscope]
  );

  const paragraphs = useMemo(
    () => splitInterpretationIntoParagraphs(horoscope?.interpretation || horoscope?.text || ''),
    [horoscope]
  );

  const headline = useMemo(() => {
    if (notReady) return `${signLabel}, the sky for this week is still drafting.`;
    if (error) return `${signLabel}, we can’t read the sky right now.`;
    if (loading) return `${signLabel}, reading the sky for this week…`;
    return (
      <>
        {signLabel}, the week opens <span className="italic">on a held note.</span>
      </>
    );
  }, [signLabel, loading, notReady, error]);

  useEffect(() => {
    const previousTitle = document.title;
    const title = `${signLabel} Weekly Horoscope | Stellium`;
    const description = weekRange
      ? `Read Stellium's ${signLabel} weekly horoscope for ${weekRange}.`
      : `Read Stellium's ${signLabel} weekly horoscope.`;

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `${window.location.origin}/horoscopes/weekly/${selectedSign}`);

    return () => {
      document.title = previousTitle;
    };
  }, [selectedSign, signLabel, weekRange]);

  const navigateWithDate = (sign, dateStr) => {
    const params = new URLSearchParams(searchParams);
    if (dateStr) params.set('date', dateStr);
    const qs = params.toString();
    navigate(`/horoscopes/weekly/${sign}${qs ? `?${qs}` : ''}`);
  };

  const handleSelectSign = (nextSign) => navigateWithDate(nextSign);
  const handleBackToHome = () => navigate('/');

  const handlePrevWeek = () => {
    const prevStart = shiftDateByDays(weekStartDate, -7);
    navigateWithDate(selectedSign, prevStart);
  };
  const handleNextWeek = () => {
    const nextStart = shiftDateByDays(weekStartDate, 7);
    navigateWithDate(selectedSign, nextStart);
  };

  const handleDashboardCta = () => {
    if (stelliumUser) navigate(`/dashboard/${stelliumUser._id}`);
    else navigate('/birthChartEntry');
  };

  // Scroll to top on first mount and whenever the selected sign changes,
  // so deep links like /horoscopes/weekly/scorpio always land at the reading
  // instead of preserving the previous page's scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [selectedSign]);

  return (
    <div className="wh-page">
      {/* ─── NAV ───────────────────────────────────────────── */}
      <nav className="wh-nav">
        <div className="wh-nav__inner">
          <button type="button" className="wh-wordmark" onClick={handleBackToHome} aria-label="Stellium home">
            <span className="wh-wordmark__glyph"><WordmarkGlyph /></span>
            <span className="wh-wordmark__name">Stellium</span>
          </button>
          <div className="wh-nav__links">
            <button type="button" className="wh-nav__link" onClick={handleBackToHome}>Home</button>
            <span className="wh-nav__link active">Horoscopes</span>
            <button type="button" className="wh-nav__link" onClick={() => navigate('/celebrities')}>Charts</button>
            <button type="button" className="wh-nav__link" onClick={() => navigate('/#pricing')}>Pricing</button>
            {stelliumUser ? (
              <button type="button" className="wh-btn wh-btn--primary" onClick={handleDashboardCta}>
                Go to Dashboard <span style={{ opacity: 0.65 }}>→</span>
              </button>
            ) : (
              <>
                <button type="button" className="wh-btn wh-btn--ghost" onClick={() => navigate('/login')}>
                  Sign in
                </button>
                <button type="button" className="wh-btn wh-btn--primary" onClick={handleDashboardCta}>
                  Start free <span style={{ opacity: 0.65 }}>→</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="wh-hero">
        <div className="wh-halo lilac wh-hero__halo-c" />
        <Stardust seed={1} density={80} />

        <div className="wh-wrap">
          <div className="wh-hero__top">
            <button type="button" className="wh-back-link" onClick={handleBackToHome}>
              <span className="wh-back-link__arrow">←</span> Back to home
            </button>
            <span className="wh-hero__top-right">
              <span className="wh-hero__dot" />
              Updated Monday at 6:00 am ET
            </span>
          </div>

          <div className="wh-hero__eyebrow">
            <span className="wh-hero__bar" />
            <span className="wh-eyebrow gold">Public editorial horoscope</span>
            <span className="wh-hero__bar wh-hero__bar--r" />
          </div>

          <h1>This week, <span className="accent">read by the sky.</span></h1>
          <p className="wh-hero__lede">
            Pick your sun sign for the editorial forecast. Then come back with your full chart for the version that actually knows you.
          </p>

          <div className="wh-week-stepper">
            <button
              type="button"
              className="wh-week-stepper__btn"
              onClick={handlePrevWeek}
              aria-label="Previous week"
            >
              ←
            </button>
            <span className="wh-week-stepper__label">
              {weekStepperLabel}
              <span className="wh-week-stepper__small">Week {weekNumber}</span>
            </span>
            <button
              type="button"
              className="wh-week-stepper__btn"
              onClick={handleNextWeek}
              aria-label="Next week"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* ─── READING + SIDEBAR ───────────────────────────────── */}
      <section className="wh-reading-wrap">
        <div className="wh-halo lilac wh-reading-wrap__halo-l" />
        <div className="wh-halo gold wh-reading-wrap__halo-r" />
        <Stardust seed={2} density={50} />

        <div className="wh-wrap">
          <div className="wh-reading-grid">
            <article className="wh-reading">
              <div className="wh-reading__head">
                <div className="wh-eyebrow gold wh-reading__head-sign">
                  <img src={`/assets/signs/${selectedSign}.svg`} alt="" aria-hidden="true" />
                  {signLabel}
                </div>
                {weekRange && <div className="wh-reading__date">{weekRange}</div>}
              </div>

              <h2>{headline}</h2>

              {loading && (
                <div className="wh-reading__state">Reading this week’s sky for {signLabel}…</div>
              )}

              {!loading && notReady && (
                <div className="wh-reading__state">
                  This week’s {signLabel} horoscope hasn’t been published yet. Check back soon — these go up Monday mornings.
                </div>
              )}

              {!loading && error && (
                <div className="wh-reading__state">
                  We couldn’t load the {signLabel} horoscope right now.
                  <div className="wh-reading__state-cta">
                    <button type="button" className="wh-btn wh-btn--ghost" onClick={refetch}>
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {!loading && !notReady && !error && horoscope && (
                <>
                  <div className="wh-reading__body">
                    {paragraphs.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>

                  {keyThemes.length > 0 && (
                    <div className="wh-themes">
                      <div className="wh-themes__label">Key themes</div>
                      <div className="wh-theme-pills">
                        {keyThemes.map((theme, i) => {
                          const text = formatThemeText(theme);
                          if (!text) return null;
                          const glyphFile = getThemeGlyphFile(theme);
                          const tone = THEME_PILL_TONES[i % THEME_PILL_TONES.length];
                          return (
                            <span key={i} className={`wh-theme-pill${tone ? ` ${tone}` : ''}`}>
                              {glyphFile && (
                                <img
                                  className="wh-theme-pill__glyph"
                                  src={`/assets/planets/${glyphFile}.svg`}
                                  alt=""
                                  aria-hidden="true"
                                />
                              )}
                              {text}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </article>

            <aside className="wh-side">
              <div className="wh-side__card cta">
                <div className="wh-eyebrow gold">Personalize this</div>
                <h3>
                  This same week, read for your{' '}
                  <em>whole chart.</em>
                </h3>
                <p className="wh-side__card-body">
                  Sun-sign columns are a start. The full reading uses your actual placements — moon, rising, and transits to your natal chart.
                </p>
                <button type="button" className="wh-btn wh-btn--primary" onClick={handleDashboardCta}>
                  {stelliumUser ? 'Go to your dashboard' : 'Get my full reading'} →
                </button>
                {!stelliumUser && (
                  <div className="wh-side__card-footnote">Takes 60 seconds · No credit card</div>
                )}
              </div>

              <div className="wh-side__card">
                <div className="wh-eyebrow lilac">Other signs</div>
                <div className="wh-quick">
                  {ZODIAC_SIGNS.map((sign) => (
                    <button
                      key={sign.value}
                      type="button"
                      className={`wh-quick__row${selectedSign === sign.value ? ' active' : ''}`}
                      onClick={() => handleSelectSign(sign.value)}
                    >
                      <img
                        className="wh-quick__icon"
                        src={`/assets/signs/${sign.value}.svg`}
                        alt=""
                        aria-hidden="true"
                      />
                      <span className="wh-quick__nm">{sign.label}</span>
                      <span className="wh-quick__ar">{selectedSign === sign.value ? '●' : '→'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="wh-footer">
        <div className="wh-wrap">
          <div className="wh-foot-grid">
            <div className="wh-foot-brand">
              <button type="button" className="wh-wordmark" onClick={handleBackToHome}>
                <span className="wh-wordmark__glyph"><WordmarkGlyph /></span>
                <span className="wh-wordmark__name">Stellium</span>
              </button>
              <p className="wh-foot-brand__blurb">
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
          <div className="wh-foot-bot">
            <span>© {new Date().getFullYear()} Stellium · Personalized astrology, powered by AI.</span>
            <span className="wh-foot-bot__italic">Made under a generous sky.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicWeeklyHoroscopesPage;
