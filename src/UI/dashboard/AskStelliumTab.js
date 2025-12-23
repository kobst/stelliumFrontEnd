import React, { useState, useMemo } from 'react';
import { generateCustomHoroscope } from '../../Utilities/api';
import './AskStelliumTab.css';

function AskStelliumTab({ userId, transitWindows = [] }) {
  const [query, setQuery] = useState('');
  const [selectedTransits, setSelectedTransits] = useState(new Set());
  const [customHoroscope, setCustomHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePeriod, setActivePeriod] = useState('weekly');

  // Date range helpers
  const getTodayRange = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return { start: startOfDay, end: endOfDay };
  };

  const getCurrentWeekRange = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };

  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return { start: startOfMonth, end: endOfMonth };
  };

  // Filter transits based on active period
  const filteredTransits = useMemo(() => {
    if (!transitWindows || transitWindows.length === 0) return [];

    let dateRange;
    switch (activePeriod) {
      case 'daily':
        dateRange = getTodayRange();
        break;
      case 'weekly':
        dateRange = getCurrentWeekRange();
        break;
      case 'monthly':
        dateRange = getCurrentMonthRange();
        break;
      default:
        dateRange = getCurrentWeekRange();
    }

    return transitWindows.filter(transit => {
      const transitStart = new Date(transit.start);
      const transitEnd = new Date(transit.end);
      return (transitStart <= dateRange.end && transitEnd >= dateRange.start);
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [transitWindows, activePeriod]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Format transit date range with exact date
  const formatTransitDateRange = (transit) => {
    const start = formatDate(transit.start);
    const end = formatDate(transit.end);
    const exact = formatDate(transit.exact);

    if (!start && !end) {
      return exact || '';
    }

    // If start and end are the same day, just show that date
    if (start === end) {
      return start;
    }

    // Show range with exact date if available
    if (exact && exact !== start && exact !== end) {
      return `${start} - ${end} (exact: ${exact})`;
    }

    return `${start} - ${end}`;
  };

  // Get transit description
  const getTransitDescription = (transit) => {
    if (transit.description) return transit.description;

    let description = `${transit.transitingPlanet}`;

    if (transit.transitingSign) {
      description += ` in ${transit.transitingSign}`;
    }

    if (transit.type === 'transit-to-natal') {
      description += ` ${transit.aspect || ''} natal ${transit.targetPlanet || ''}`;
      if (transit.targetSign) description += ` in ${transit.targetSign}`;
    } else if (transit.type === 'transit-to-transit') {
      description += ` ${transit.aspect || ''} ${transit.targetPlanet || ''}`;
      if (transit.targetSign) description += ` in ${transit.targetSign}`;
    }

    return description;
  };

  // Handle transit selection
  const handleTransitToggle = (index) => {
    setSelectedTransits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Handle generate custom horoscope
  const handleGenerate = async () => {
    const hasQuery = query.trim().length > 0;
    const selectedTransitEvents = filteredTransits
      .filter((_, index) => selectedTransits.has(index))
      .map(transit => ({
        type: transit.type,
        transitingPlanet: transit.transitingPlanet,
        exact: transit.exact,
        targetPlanet: transit.targetPlanet,
        aspect: transit.aspect,
        start: transit.start,
        end: transit.end,
        description: transit.description,
        transitingSign: transit.transitingSign,
        targetSign: transit.targetSign,
        transitingHouse: transit.transitingHouse,
        targetHouse: transit.targetHouse,
        moonPhaseData: transit.moonPhaseData
      }));

    if (!hasQuery && selectedTransitEvents.length === 0) {
      setError('Please enter a question or select at least one transit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Cap selection to 8 transits max
      const MAX_EVENTS = 8;
      const cappedEvents = selectedTransitEvents.slice(0, MAX_EVENTS);

      const requestBody = {
        period: activePeriod,
      };
      if (hasQuery) requestBody.query = query.trim();
      if (cappedEvents.length > 0) requestBody.selectedTransits = cappedEvents;

      const response = await generateCustomHoroscope(userId, requestBody);

      const hasSuccess = response && typeof response.success === 'boolean';
      const gotHoroscope = response?.horoscope || (!hasSuccess && response && (response.interpretation || response.text));

      if ((hasSuccess && response.success) || gotHoroscope) {
        const incoming = response?.horoscope || response;
        setCustomHoroscope(incoming);
        if (hasQuery) setQuery('');
      } else {
        throw new Error(response?.error || 'Failed to generate custom horoscope');
      }
    } catch (err) {
      console.error('Error generating custom horoscope:', err);
      setError(err.message || 'Failed to generate custom horoscope');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-stellium-tab">
      <div className="ask-stellium-header">
        <h3>Ask Stellium</h3>
        <p>Ask a question about your transits or generate a custom horoscope reading.</p>
      </div>

      {/* Query Input */}
      <div className="ask-stellium-query">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            selectedTransits.size > 0
              ? 'Optionally add a question to guide the reading...'
              : 'Ask a question about your transits or horoscope...'
          }
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Period Selector */}
      <div className="ask-stellium-period">
        <span className="period-label">Time Period:</span>
        <div className="period-buttons">
          {['daily', 'weekly', 'monthly'].map(period => (
            <button
              key={period}
              className={`period-button ${activePeriod === period ? 'active' : ''}`}
              onClick={() => {
                setActivePeriod(period);
                setSelectedTransits(new Set());
              }}
              disabled={loading}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transit Selection */}
      {filteredTransits.length > 0 && (
        <div className="ask-stellium-transits">
          <h4>Select Transits (optional)</h4>
          <div className="transits-list">
            {filteredTransits.map((transit, index) => (
              <div
                key={index}
                className={`transit-item ${selectedTransits.has(index) ? 'selected' : ''}`}
                onClick={() => !loading && handleTransitToggle(index)}
              >
                <input
                  type="checkbox"
                  checked={selectedTransits.has(index)}
                  onChange={() => handleTransitToggle(index)}
                  disabled={loading}
                />
                <span className="transit-description">
                  {getTransitDescription(transit)}
                </span>
                <span className="transit-date">
                  {formatTransitDateRange(transit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredTransits.length === 0 && (
        <div className="ask-stellium-no-transits">
          <p>No significant transits found for the selected period.</p>
        </div>
      )}

      {/* Status and Generate Button */}
      <div className="ask-stellium-actions">
        <div className="ask-stellium-status">
          {selectedTransits.size > 0
            ? `${selectedTransits.size} transit${selectedTransits.size > 1 ? 's' : ''} selected`
            : 'No transits selected'}
          {' '}&bull;{' '}
          Period: {activePeriod}
        </div>
        <button
          className="generate-button"
          onClick={handleGenerate}
          disabled={loading || (!query.trim() && selectedTransits.size === 0)}
        >
          {loading ? 'Generating...' : 'Generate Custom Horoscope'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="ask-stellium-error">
          {error}
        </div>
      )}

      {/* Custom Horoscope Result */}
      {customHoroscope && (
        <div className="ask-stellium-result">
          <h4>Your Custom Reading</h4>
          <div className="result-text">
            {(customHoroscope.text || customHoroscope.interpretation || '').split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            ))}
          </div>
          {customHoroscope.metadata && (
            <div className="result-meta">
              Mode: {customHoroscope.metadata.mode}
              {customHoroscope.metadata.transitEventCount != null && (
                <> &bull; {customHoroscope.metadata.transitEventCount} events</>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AskStelliumTab;
