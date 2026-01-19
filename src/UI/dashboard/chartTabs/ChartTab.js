import React from 'react';
import BirthChartSummaryTable from '../../birthChart/tables/BirthChartSummaryTable';
import './ChartTab.css';

function ChartTab({ birthChart }) {
  const planets = birthChart?.planets || [];
  const houses = birthChart?.houses || [];
  const aspects = birthChart?.aspects || [];

  if (!planets.length) {
    return (
      <div className="chart-tab">
        <div className="chart-tab-empty">
          <p>Birth chart data not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-tab">
      <div className="chart-section-header">
        <h2 className="chart-section-title">Chart</h2>
        <div className="chart-gradient-icon"></div>
      </div>
      <BirthChartSummaryTable
        planets={planets}
        houses={houses}
        aspects={aspects}
      />
    </div>
  );
}

export default ChartTab;
