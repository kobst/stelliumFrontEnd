import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useWeeklySunSignHoroscope from '../hooks/useWeeklySunSignHoroscope';
import { formatDateRange, formatLocalDateParam, parseDateInput } from '../Utilities/horoscopeDates';
import { DEFAULT_ZODIAC_SIGN, getZodiacLabel, normalizeZodiacSign } from '../Utilities/zodiac';
import WeeklySignSelector from '../UI/horoscopes/WeeklySignSelector';
import stelliumIcon from '../assets/StelliumIcon.svg';
import './PublicWeeklyHoroscopesPage.css';

const formatTheme = (theme) => {
  if (typeof theme === 'string') {
    return theme;
  }

  if (!theme || typeof theme !== 'object') {
    return '';
  }

  const { transitingPlanet, aspect, targetPlanet } = theme;
  return [transitingPlanet, aspect, targetPlanet].filter(Boolean).join(' ');
};

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

  const weekRange = formatDateRange(
    horoscope?.startDate || details?.startDate,
    horoscope?.endDate || details?.endDate
  );
  const keyThemes = useMemo(
    () => (horoscope?.analysis?.keyThemes || []).map(formatTheme).filter(Boolean),
    [horoscope]
  );

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

  const handleSelectSign = (nextSign) => {
    const params = new URLSearchParams(searchParams);
    navigate(`/horoscopes/weekly/${nextSign}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="public-weekly-horoscope-page">
      <div className="public-weekly-horoscope-page__shell">
        <button type="button" className="public-weekly-horoscope-page__back" onClick={handleBackToHome}>
          Back to Home
        </button>

        <header className="public-weekly-horoscope-page__header">
          <img
            className="public-weekly-horoscope-page__logo"
            src={stelliumIcon}
            alt="Stellium logo"
          />
          <p className="public-weekly-horoscope-page__eyebrow">Public editorial horoscope</p>
          <h1 className="public-weekly-horoscope-page__title">Weekly Horoscopes</h1>
          <p className="public-weekly-horoscope-page__subtitle">
            Pick your sun sign to read the current week&apos;s pre-generated horoscope.
          </p>
        </header>

        <WeeklySignSelector selectedSign={selectedSign} onSelect={handleSelectSign} />

        <section className="public-weekly-horoscope-card">
          <div className="public-weekly-horoscope-card__heading">
            <div>
              <p className="public-weekly-horoscope-card__label">{signLabel}</p>
              <h2 className="public-weekly-horoscope-card__title">{signLabel} Weekly Horoscope</h2>
            </div>
            {weekRange && <p className="public-weekly-horoscope-card__range">{weekRange}</p>}
          </div>

          {loading && (
            <div className="public-weekly-horoscope-state">
              <div className="public-weekly-horoscope-state__spinner" />
              <p>Loading this week&apos;s horoscope...</p>
            </div>
          )}

          {!loading && notReady && (
            <div className="public-weekly-horoscope-state">
              <h3>This week&apos;s horoscope isn&apos;t available yet.</h3>
              <p>Please check back soon.</p>
            </div>
          )}

          {!loading && error && (
            <div className="public-weekly-horoscope-state public-weekly-horoscope-state--error">
              <h3>Unable to load horoscope right now.</h3>
              <p>Please try again.</p>
              <button type="button" onClick={refetch}>Try Again</button>
            </div>
          )}

          {!loading && !notReady && !error && horoscope && (
            <>
              <div className="public-weekly-horoscope-card__body">
                {(horoscope.interpretation || '').split('\n').map((paragraph, index) => (
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : null
                ))}
              </div>

              {keyThemes.length > 0 && (
                <div className="public-weekly-horoscope-card__themes">
                  <h3>Key Themes</h3>
                  <div className="public-weekly-horoscope-card__theme-list">
                    {keyThemes.map((theme, index) => (
                      <span key={`${theme}-${index}`} className="public-weekly-horoscope-card__theme-pill">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="public-weekly-horoscope-page__disclaimer">
          These weekly horoscopes are based on sun-sign transits and are broader than a full natal-chart reading.
        </aside>
      </div>
    </div>
  );
}

export default PublicWeeklyHoroscopesPage;
