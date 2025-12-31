import React from 'react';
import YourChartCard from './YourChartCard';
import GuestChartsGrid from './GuestChartsGrid';
import './ChartsList.css';

function ChartsList({
  userChart,
  guestCharts,
  onChartClick,
  onAddChart,
  loading,
  error
}) {
  return (
    <div className="charts-list">
      <div className="charts-list__layout">
        {/* Featured User Chart */}
        <div className="charts-list__featured">
          <h3 className="charts-list__section-title">Your Chart</h3>
          <YourChartCard
            chart={userChart}
            onClick={() => onChartClick(userChart?._id)}
          />
        </div>

        {/* Guest Charts Grid */}
        <div className="charts-list__guests">
          <h3 className="charts-list__section-title">Guest Charts</h3>
          <GuestChartsGrid
            charts={guestCharts}
            onChartClick={onChartClick}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      {/* Add Chart Button */}
      <button className="charts-list__add-btn" onClick={onAddChart}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add Birth Chart
      </button>
    </div>
  );
}

export default ChartsList;
