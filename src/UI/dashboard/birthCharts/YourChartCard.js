import React from 'react';
import { SignIcon } from '../../shared/AstroIcon';
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

  const fullName = `${chart?.firstName || ''} ${chart?.lastName || ''}`.trim();
  const sunSign = getSunSign();
  const moonSign = getMoonSign();

  return (
    <div className="your-chart-card" onClick={onClick}>
      <div className="your-chart-card__avatar">
        {chart?.profilePhotoUrl ? (
          <img src={chart.profilePhotoUrl} alt={fullName} />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>

      <h4 className="your-chart-card__name">{fullName}</h4>

      <div className="your-chart-card__signs">
        {sunSign && (
          <span className="your-chart-card__glyph" title={`Sun in ${sunSign}`}>
            <SignIcon name={sunSign} size={18} />
          </span>
        )}
        {sunSign && moonSign && (
          <span className="your-chart-card__separator">•</span>
        )}
        {moonSign && (
          <span className="your-chart-card__glyph" title={`Moon in ${moonSign}`}>
            <SignIcon name={moonSign} size={18} />
          </span>
        )}
      </div>

      <button className="your-chart-card__cta">View</button>
    </div>
  );
}

export default YourChartCard;
