import React from 'react';
import './GuestChartCard.css';

function GuestChartCard({ chart, onClick, featured, index }) {
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

  return (
    <div className={`guest-chart-card ${featured ? 'guest-chart-card--featured' : ''}`} onClick={onClick}>
      <div className="guest-chart-card__photo">
        {chart?.profilePhotoUrl ? (
          <img src={chart.profilePhotoUrl} alt={fullName} />
        ) : (
          <div className="guest-chart-card__initials">{getInitials()}</div>
        )}
        {index && <span className="guest-chart-card__badge">{index}</span>}
      </div>

      <div className="guest-chart-card__info">
        <h4 className="guest-chart-card__name">{fullName}</h4>
        {sunSign && <span className="guest-chart-card__sign">{sunSign}</span>}
        {birthDate && <span className="guest-chart-card__date">{birthDate}</span>}
      </div>
    </div>
  );
}

export default GuestChartCard;
