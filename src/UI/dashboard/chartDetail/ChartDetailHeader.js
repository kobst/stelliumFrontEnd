import React from 'react';
import './ChartDetailHeader.css';

function ChartDetailHeader({ chart, onBackClick }) {
  const getFullName = () => {
    if (!chart) return '';
    return `${chart.firstName || ''} ${chart.lastName || ''}`.trim();
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

  const formatBirthInfo = () => {
    const parts = [];

    if (chart?.dateOfBirth) {
      try {
        const date = new Date(chart.dateOfBirth);
        parts.push(date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }));
      } catch {
        parts.push(chart.dateOfBirth);
      }
    }

    if (chart?.timeOfBirth) {
      parts.push(chart.timeOfBirth);
    }

    if (chart?.placeOfBirth) {
      parts.push(chart.placeOfBirth);
    }

    return parts.join(' • ');
  };

  const sunSign = getSunSign();
  const moonSign = getMoonSign();
  const risingSign = getRisingSign();

  const placements = [
    sunSign && `${sunSign} Sun`,
    moonSign && `${moonSign} Moon`,
    risingSign && `${risingSign} Rising`
  ].filter(Boolean).join(' • ');

  return (
    <header className="chart-detail-header">
      <button className="chart-detail-header__back" onClick={onBackClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="chart-detail-header__info">
        <h1 className="chart-detail-header__name">{getFullName()}</h1>

        {placements && (
          <p className="chart-detail-header__placements">{placements}</p>
        )}

        {formatBirthInfo() && (
          <p className="chart-detail-header__birth-info">
            Born: {formatBirthInfo()}
          </p>
        )}
      </div>
    </header>
  );
}

export default ChartDetailHeader;
