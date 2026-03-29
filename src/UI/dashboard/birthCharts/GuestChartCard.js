import React from 'react';
import './GuestChartCard.css';

function GuestChartCard({ chart, onClick, onDelete, featured, index }) {
  const getInitials = () => {
    const firstName = chart?.firstName || '';
    const lastName = chart?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSunSign = () => {
    if (!chart?.birthChart?.planets) return null;
    const sun = chart.birthChart.planets.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  const formatBirthDate = () => {
    if (!chart?.birthDate) return '';
    const date = new Date(chart.birthDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const fullName = `${chart?.firstName || ''} ${chart?.lastName || ''}`.trim();
  const sunSign = getSunSign();
  const birthDate = formatBirthDate();
  const displayName = fullName || 'Untitled Chart';

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete?.(chart._id, displayName);
  };

  return (
    <div className={`guest-chart-card ${featured ? 'guest-chart-card--featured' : ''}`} onClick={onClick}>
      <div className="guest-chart-card__photo">
        {chart?.profilePhotoUrl ? (
          <img src={chart.profilePhotoUrl} alt={displayName} />
        ) : (
          <div className="guest-chart-card__initials">{getInitials()}</div>
        )}
        {index && <span className="guest-chart-card__badge">{index}</span>}
      </div>

      <div className="guest-chart-card__info">
        <div className="guest-chart-card__header">
          <h4 className="guest-chart-card__name">{displayName}</h4>
          {!featured && onDelete && (
            <button
              type="button"
              className="guest-chart-card__delete-btn"
              aria-label={`Delete ${displayName}`}
              onClick={handleDeleteClick}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 3h6m-9 4h12m-9 0v11m6-11v11M8 7l1 13h6l1-13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
        {sunSign && <span className="guest-chart-card__sign">{sunSign}</span>}
        {birthDate && <span className="guest-chart-card__date">{birthDate}</span>}
      </div>
    </div>
  );
}

export default GuestChartCard;
