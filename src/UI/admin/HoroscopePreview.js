import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeeklyHoroscopePreview } from '../../Utilities/adminApi';
import './HoroscopePreview.css';

const SIGN_EMOJIS = {
  Aries: '\u2648',
  Taurus: '\u2649',
  Gemini: '\u264A',
  Cancer: '\u264B',
  Leo: '\u264C',
  Virgo: '\u264D',
  Libra: '\u264E',
  Scorpio: '\u264F',
  Sagittarius: '\u2650',
  Capricorn: '\u2651',
  Aquarius: '\u2652',
  Pisces: '\u2653',
};

const SIGN_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(startDate, endDate) {
  const opts = { month: 'short', day: 'numeric' };
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startStr = start.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

function isCurrentWeek(dateStr) {
  const now = new Date();
  const currentMonday = getMonday(now);
  const targetMonday = getMonday(new Date(dateStr));
  return currentMonday.getTime() === targetMonday.getTime();
}

function isFutureWeek(dateStr) {
  const now = new Date();
  const currentMonday = getMonday(now);
  const targetMonday = getMonday(new Date(dateStr));
  return targetMonday.getTime() > currentMonday.getTime();
}

function HoroscopePreview() {
  const [weekOffset, setWeekOffset] = useState(1); // Start on next week (preview)
  const [horoscopes, setHoroscopes] = useState([]);
  const [weekStart, setWeekStart] = useState(null);
  const [weekEnd, setWeekEnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSign, setSelectedSign] = useState(null);

  const fetchWeek = useCallback(async (offset) => {
    setLoading(true);
    setError(null);
    setSelectedSign(null);

    const targetDate = new Date();
    targetDate.setUTCDate(targetDate.getUTCDate() + offset * 7);
    const dateParam = targetDate.toISOString().split('T')[0];

    try {
      const data = await fetchWeeklyHoroscopePreview(dateParam);
      setHoroscopes(data.horoscopes || []);
      setWeekStart(data.weekStartDate);
      setWeekEnd(data.weekEndDate);
    } catch (err) {
      setError(err.message || 'Failed to load horoscopes');
      setHoroscopes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeek(weekOffset);
  }, [weekOffset, fetchWeek]);

  const horoscopeMap = {};
  horoscopes.forEach((h) => {
    horoscopeMap[h.sign] = h;
  });

  const selectedHoroscope = selectedSign ? horoscopeMap[selectedSign] : null;
  const isPreview = weekStart && isFutureWeek(weekStart);
  const isCurrent = weekStart && isCurrentWeek(weekStart);

  return (
    <div className="horoscope-preview">
      <div className="horoscope-preview-header">
        <h2>Weekly Sun Sign Horoscopes</h2>
        <div className="week-nav">
          <button onClick={() => setWeekOffset((o) => o - 1)} disabled={loading}>
            Prev Week
          </button>
          <div className="week-label">
            {weekStart && weekEnd ? formatWeekRange(weekStart, weekEnd) : 'Loading...'}
            {isPreview && <span className="preview-badge">Preview</span>}
            {isCurrent && <span className="preview-badge" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>Live</span>}
          </div>
          <button onClick={() => setWeekOffset((o) => o + 1)} disabled={loading || weekOffset >= 2}>
            Next Week
          </button>
        </div>
      </div>

      <div className="horoscope-status-bar">
        <span className={`status-dot ${horoscopes.length === 12 ? 'complete' : horoscopes.length > 0 ? 'partial' : 'empty'}`} />
        <span>{horoscopes.length}/12 signs generated</span>
      </div>

      {loading && <div className="horoscope-loading">Loading horoscopes...</div>}
      {error && <div className="horoscope-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="signs-grid">
            {SIGN_ORDER.map((sign) => {
              const h = horoscopeMap[sign];
              const isMissing = !h;
              const isSelected = selectedSign === sign;

              return (
                <div
                  key={sign}
                  className={`sign-card ${isSelected ? 'selected' : ''} ${isMissing ? 'missing' : ''}`}
                  onClick={() => !isMissing && setSelectedSign(isSelected ? null : sign)}
                >
                  <div className="sign-card-header">
                    <span className="sign-emoji">{SIGN_EMOJIS[sign]}</span>
                    <span className="sign-name">{sign}</span>
                  </div>
                  <div className="sign-card-snippet">
                    {h ? h.interpretation?.slice(0, 100) + '...' : 'Not yet generated'}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedHoroscope && (
            <div className="sign-detail-panel">
              <div className="sign-detail-header">
                <h3>{SIGN_EMOJIS[selectedSign]} {selectedSign} - Weekly Horoscope</h3>
                <button className="close-detail-btn" onClick={() => setSelectedSign(null)}>
                  &times;
                </button>
              </div>

              <div className="sign-detail-interpretation">
                {selectedHoroscope.interpretation}
              </div>

              {selectedHoroscope.analysis?.keyThemes?.length > 0 && (
                <div className="sign-detail-themes">
                  <h4>Key Transits</h4>
                  {selectedHoroscope.analysis.keyThemes.map((theme, i) => {
                    const label = [theme.transitingPlanet, theme.aspect, theme.targetPlanet]
                      .filter(Boolean)
                      .join(' ') || theme.description || `Transit ${i + 1}`;
                    return (
                      <div key={i} className="theme-item">
                        <span className="theme-priority">P{theme.priority}</span>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="sign-detail-meta">
                <span>Generated: {new Date(selectedHoroscope.generatedAt).toLocaleString()}</span>
                <span>Version: {selectedHoroscope.generationVersion}</span>
                {selectedHoroscope.analysis?.metadata && (
                  <span>
                    Transits: {selectedHoroscope.analysis.metadata.mainThemeCount} main,{' '}
                    {selectedHoroscope.analysis.metadata.immediateEventCount} immediate
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HoroscopePreview;
