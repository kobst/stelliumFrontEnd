import React from 'react';
import TimeSelector from './TimeSelector';
import HoroscopeCard from './HoroscopeCard';
import PlanetaryInfluences from './PlanetaryInfluences';
import './HoroscopeContent.css';

function HoroscopeContent({
  timePeriod,
  onTimePeriodChange,
  horoscope,
  loading,
  error,
  onRetry,
  onLoad,
  onRefresh
}) {
  // Extract key transits from horoscope data
  const getKeyInfluences = () => {
    if (!horoscope) return [];

    // For daily horoscopes, use keyTransits
    if (timePeriod === 'today' && horoscope.keyTransits) {
      return horoscope.keyTransits;
    }

    // For weekly/monthly, use analysis.keyThemes if available
    if (horoscope.analysis?.keyThemes) {
      return horoscope.analysis.keyThemes;
    }

    return [];
  };

  const influences = getKeyInfluences();

  return (
    <div className="horoscope-content">
      <div className="horoscope-content__time-selector">
        <TimeSelector
          currentPeriod={timePeriod}
          onSelect={onTimePeriodChange}
          disabled={loading}
        />
      </div>

      <div className="horoscope-content__main">
        <HoroscopeCard
          type={timePeriod}
          horoscope={horoscope}
          loading={loading}
          error={error}
          onRetry={onRetry}
          onLoad={onLoad}
          onRefresh={onRefresh}
        />
      </div>

      <div className="horoscope-content__sidebar">
        <PlanetaryInfluences
          influences={influences}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default HoroscopeContent;
