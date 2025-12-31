import React from 'react';
import './HoroscopeCard.css';

function HoroscopeCard({
  type,
  horoscope,
  loading,
  error,
  onRetry,
  onLoad,
  onRefresh,
  onShare,
  onSave
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
      case 'today':
        return 'Your Daily Horoscope';
      case 'week':
        return 'Your Weekly Horoscope';
      case 'month':
        return 'Your Monthly Horoscope';
      default:
        return 'Your Horoscope';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="horoscope-card">
        <div className="horoscope-card__loading">
          <div className="horoscope-card__spinner" />
          <p>Loading your horoscope...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="horoscope-card">
        <div className="horoscope-card__error">
          <h3>Failed to Load Horoscope</h3>
          <p>{error}</p>
          <button className="horoscope-card__retry-btn" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No horoscope yet - prompt to load
  if (!horoscope) {
    return (
      <div className="horoscope-card">
        <div className="horoscope-card__empty">
          <h3>{getTitle()}</h3>
          <p>Click below to generate your personalized horoscope.</p>
          <button className="horoscope-card__load-btn" onClick={onLoad}>
            Generate Horoscope
          </button>
        </div>
      </div>
    );
  }

  // Horoscope content
  const horoscopeText = horoscope.text || horoscope.interpretation || 'No horoscope content available.';
  const dateRange = formatDateRange(horoscope.startDate, horoscope.endDate);

  return (
    <div className="horoscope-card">
      <h2 className="horoscope-card__title">{getTitle()}</h2>

      <div className="horoscope-card__content">
        {horoscopeText.split('\n').map((paragraph, index) => (
          paragraph.trim() && <p key={index}>{paragraph}</p>
        ))}
      </div>

      {dateRange && (
        <div className="horoscope-card__date-range">
          {dateRange}
        </div>
      )}

      <div className="horoscope-card__actions">
        {onRefresh && (
          <button className="horoscope-card__action-btn" onClick={onRefresh}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Refresh
          </button>
        )}
        {onShare && (
          <button className="horoscope-card__action-btn" onClick={onShare}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
        )}
        {onSave && (
          <button className="horoscope-card__action-btn" onClick={onSave}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17,21 17,13 7,13 7,21" />
              <polyline points="7,3 7,8 15,8" />
            </svg>
            Save
          </button>
        )}
      </div>
    </div>
  );
}

export default HoroscopeCard;
