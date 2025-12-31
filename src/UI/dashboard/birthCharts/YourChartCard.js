import React from 'react';
import './YourChartCard.css';

function YourChartCard({ chart, onClick }) {
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

  const getMoonSign = () => {
    if (!chart?.birthChart?.planets) return null;
    const moon = chart.birthChart.planets.find(p => p.name === 'Moon');
    return moon?.sign || null;
  };

  const getRisingSign = () => {
    if (!chart?.birthChart?.houses) return null;
    const firstHouse = chart.birthChart.houses.find(h => h.house === 1);
    return firstHouse?.sign || null;
  };

  const fullName = `${chart?.firstName || ''} ${chart?.lastName || ''}`.trim();

  return (
    <div className="your-chart-card" onClick={onClick}>
      <div className="your-chart-card__avatar">
        {chart?.profilePhotoUrl ? (
          <img src={chart.profilePhotoUrl} alt={fullName} />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>

      <h3 className="your-chart-card__name">{fullName}</h3>

      <div className="your-chart-card__placements">
        {getSunSign() && (
          <div className="your-chart-card__placement">
            <span className="your-chart-card__placement-label">Sun</span>
            <span className="your-chart-card__placement-value">{getSunSign()}</span>
          </div>
        )}
        {getMoonSign() && (
          <div className="your-chart-card__placement">
            <span className="your-chart-card__placement-label">Moon</span>
            <span className="your-chart-card__placement-value">{getMoonSign()}</span>
          </div>
        )}
        {getRisingSign() && (
          <div className="your-chart-card__placement">
            <span className="your-chart-card__placement-label">Rising</span>
            <span className="your-chart-card__placement-value">{getRisingSign()}</span>
          </div>
        )}
      </div>

      <button className="your-chart-card__cta">
        View Details
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default YourChartCard;
