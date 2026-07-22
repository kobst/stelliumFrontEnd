import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import InkNav from '../UI/ink/InkNav';
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
import '../styles/ink.css';
import './PublicWeeklyHoroscopesPage.css';

const MARKETING_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Weekly horoscopes', href: '/horoscopes/weekly' },
  { label: 'Celebrity charts', href: '/celebrities' },
  { label: 'Help', href: '/help' }
];

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
  return Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
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
    return PLANET_GLYPH_TO_FILE[theme.transitingPlanet] || null;
  }
  return null;
}

function splitInterpretationIntoParagraphs(text) {
  if (!text) return [];
  return text
    .split(/\n\s*\n|\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function PublicWeeklyHoroscopesPage() {
  const navigate = useNavigate();
  const { sign: routeSign } = useParams();
  const [searchParams] = useSearchParams();

  const normalizedSign = normalizeZodiacSign(routeSign || DEFAULT_ZODIAC_SIGN);
  const requestedDateParam = searchParams.get('date');
  const requestedDate = parseDateInput(requestedDateParam)
    ? requestedDateParam
    : formatLocalDateParam();

  useEffect(() => {
    const params = searchParams.toString();
    if (!routeSign || !normalizedSign) {
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
        {signLabel}, the week opens <span className="ink-italic">on a held note.</span>
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
    const query = params.toString();
    navigate(`/horoscopes/weekly/${sign}${query ? `?${query}` : ''}`);
  };

  const handlePrevWeek = () => navigateWithDate(selectedSign, shiftDateByDays(weekStartDate, -7));
  const handleNextWeek = () => navigateWithDate(selectedSign, shiftDateByDays(weekStartDate, 7));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [selectedSign]);

  return (
    <div className="ink-page wh-ink-page">
      <InkNav variant="marketing" marketingLinks={MARKETING_LINKS} />

      <main>
        <header className="ink-wrap wh-ink-hero">
          <span className="ink-eyebrow">Public editorial horoscope</span>
          <h1>{signLabel} weekly horoscope</h1>
          <p>
            Pick your sun sign for the week’s editorial forecast, then return with your full chart
            for the reading that knows your placements.
          </p>

          <div className="wh-ink-week" aria-label={`Week ${weekNumber}: ${weekStepperLabel}`}>
            <button type="button" onClick={handlePrevWeek} aria-label="Previous week">←</button>
            <span>
              <b>{weekStepperLabel}</b>
              <small>Week {weekNumber}</small>
            </span>
            <button type="button" onClick={handleNextWeek} aria-label="Next week">→</button>
          </div>
        </header>

        <section className="wh-ink-sign-band" aria-labelledby="choose-sign-heading">
          <div className="ink-wrap">
            <div className="wh-ink-section-heading">
              <span className="ink-eyebrow">The zodiac desk</span>
              <h2 id="choose-sign-heading">Choose your sun sign</h2>
            </div>
            <div className="wh-ink-signs">
              {ZODIAC_SIGNS.map((sign) => {
                const isSelected = selectedSign === sign.value;
                return (
                  <button
                    key={sign.value}
                    type="button"
                    className={`wh-ink-sign${isSelected ? ' is-selected' : ''}`}
                    onClick={() => navigateWithDate(sign.value)}
                    aria-pressed={isSelected}
                  >
                    <img src={`/assets/signs/${sign.value}.svg`} alt="" aria-hidden="true" />
                    <span>{sign.label}</span>
                    <small>{isSelected ? 'Reading now' : 'Read forecast'}</small>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ink-wrap wh-ink-reading-section" aria-label={`${signLabel} horoscope reading`}>
          <article className="ink-card wh-ink-reading">
            <div className="wh-ink-date-strip">
              <span>
                <img src={`/assets/signs/${selectedSign}.svg`} alt="" aria-hidden="true" />
                {signLabel}
              </span>
              <span>{weekRange || weekStepperLabel}</span>
            </div>

            <div className="wh-ink-reading-copy">
              <h2>{headline}</h2>

              {loading && (
                <div className="wh-ink-state" role="status">Reading this week’s sky for {signLabel}…</div>
              )}

              {!loading && notReady && (
                <div className="wh-ink-state">
                  This week’s {signLabel} horoscope hasn’t been published yet. Check back soon — these go up Monday mornings.
                </div>
              )}

              {!loading && error && (
                <div className="wh-ink-state" role="alert">
                  <p>We couldn’t load the {signLabel} horoscope right now.</p>
                  <button type="button" className="ink-btn ink-btn--ghost" onClick={refetch}>Try again</button>
                </div>
              )}

              {!loading && !notReady && !error && !horoscope && (
                <div className="wh-ink-state">No reading is available for this week yet. Please check back soon.</div>
              )}

              {!loading && !notReady && !error && horoscope && (
                <>
                  <div className="wh-ink-article-body">
                    {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>

                  {keyThemes.length > 0 && (
                    <div className="wh-ink-themes">
                      <span className="ink-eyebrow">Key themes</span>
                      <div>
                        {keyThemes.map((theme, index) => {
                          const text = formatThemeText(theme);
                          if (!text) return null;
                          const glyphFile = getThemeGlyphFile(theme);
                          return (
                            <span className="ink-chip wh-ink-theme" key={index}>
                              {glyphFile && <img src={`/assets/planets/${glyphFile}.svg`} alt="" aria-hidden="true" />}
                              {text}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </article>

          <aside className="wh-ink-cta">
            <span className="ink-eyebrow">Beyond your sun sign</span>
            <h2>Your chart makes the week <span className="ink-italic">personal.</span></h2>
            <p>Read the same sky through your moon, rising sign, natal placements, and current transits.</p>
            <Link className="ink-btn ink-btn--navy" to="/signUp">Get your personal reading ✳</Link>
          </aside>
        </section>
      </main>

      <footer className="wh-ink-colophon">
        <div className="ink-wrap">
          <span className="wh-ink-colophon__wordmark">Stellium ✳</span>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms-of-service">Terms</Link>
          <Link to="/help">Help</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

export default PublicWeeklyHoroscopesPage;
