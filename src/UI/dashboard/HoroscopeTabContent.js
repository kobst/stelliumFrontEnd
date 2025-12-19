import React from 'react';

function HoroscopeTabContent({
  type,
  horoscope,
  loading,
  error,
  onRetry,
  onLoad
}) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date range
  const formatDateRange = (start, end) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(start);
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Get display title based on type
  const getTitle = () => {
    switch (type) {
      case 'daily':
        return 'Daily Horoscope';
      case 'weekly':
        return 'Weekly Horoscope';
      case 'monthly':
        return 'Monthly Horoscope';
      default:
        return 'Horoscope';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="horoscope-tab-content">
        <div className="horoscope-loading">
          <div className="horoscope-loading-spinner"></div>
          <p>Loading your {getTitle().toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="horoscope-tab-content">
        <div className="horoscope-error">
          <h3>Failed to Load Horoscope</h3>
          <p>{error}</p>
          <button className="horoscope-retry-button" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No horoscope yet - prompt to load
  if (!horoscope) {
    return (
      <div className="horoscope-tab-content">
        <div className="horoscope-empty">
          <h3>Your {getTitle()}</h3>
          <p>Click below to generate your personalized {type} horoscope.</p>
          <button className="horoscope-load-button" onClick={onLoad}>
            Generate Horoscope
          </button>
        </div>
      </div>
    );
  }

  // Horoscope content
  const horoscopeText = horoscope.text || horoscope.interpretation || 'No horoscope content available.';
  const dateRange = formatDateRange(horoscope.startDate, horoscope.endDate);

  // Get key transits or themes based on type
  const keyItems = type === 'daily'
    ? horoscope.keyTransits
    : horoscope.analysis?.keyThemes;

  return (
    <div className="horoscope-tab-content">
      <div className="horoscope-content">
        <h3 className="horoscope-title">Your {getTitle()}</h3>

        <div className="horoscope-text">
          {horoscopeText.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>

        {dateRange && (
          <p className="horoscope-date-range">{dateRange}</p>
        )}

        {keyItems && keyItems.length > 0 && (
          <div className="horoscope-key-items">
            <h4>{type === 'daily' ? 'Key Planetary Influences' : 'Key Themes'}</h4>
            <ul>
              {keyItems.map((item, index) => (
                <li key={index} className="horoscope-key-item">
                  <span className="key-item-planets">
                    <strong>{item.transitingPlanet}</strong> {item.aspect} {item.targetPlanet}
                  </span>
                  {item.exactDate && (
                    <span className="key-item-date">
                      ({formatDate(item.exactDate)})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default HoroscopeTabContent;
