import React from 'react';
import GuestChartCard from './GuestChartCard';
import './ChartsList.css';

function ChartsList({
  userChart,
  guestCharts,
  onChartClick,
  onAddChart,
  loading,
  error
}) {
  // Combine user chart and guest charts into one array
  const allCharts = [];

  if (userChart) {
    allCharts.push({ ...userChart, isFeatured: true });
  }

  if (!loading && !error && guestCharts) {
    allCharts.push(...guestCharts);
  }

  return (
    <div className="charts-list">
      <h3 className="charts-list__title">My Birth Charts</h3>

      {loading ? (
        <div className="charts-list__status">Loading...</div>
      ) : error ? (
        <div className="charts-list__status charts-list__status--error">{error}</div>
      ) : (
        <div className="charts-list__grid">
          {allCharts.map((chart, index) => (
            <GuestChartCard
              key={chart._id}
              chart={chart}
              onClick={() => onChartClick(chart._id)}
              featured={chart.isFeatured}
              index={index + 1}
            />
          ))}
          <button className="charts-list__add-card" onClick={onAddChart}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add Birth Chart</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ChartsList;
