import React from 'react';
import GuestChartCard from './GuestChartCard';
import './GuestChartsGrid.css';

function GuestChartsGrid({ charts, onChartClick, loading, error }) {
  if (loading) {
    return (
      <div className="guest-charts-grid">
        <div className="guest-charts-grid__loading">
          <div className="guest-charts-grid__spinner"></div>
          <span>Loading guest charts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guest-charts-grid">
        <div className="guest-charts-grid__error">{error}</div>
      </div>
    );
  }

  if (!charts || charts.length === 0) {
    return (
      <div className="guest-charts-grid">
        <div className="guest-charts-grid__empty">
          <p>No guest charts yet</p>
          <p className="guest-charts-grid__empty-hint">
            Add birth charts for friends and family
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-charts-grid">
      <div className="guest-charts-grid__cards">
        {charts.map(chart => (
          <GuestChartCard
            key={chart._id}
            chart={chart}
            onClick={() => onChartClick(chart._id)}
          />
        ))}
      </div>
    </div>
  );
}

export default GuestChartsGrid;
