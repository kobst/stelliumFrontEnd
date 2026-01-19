import React from 'react';
import './ChartTabs.css';

function OverviewTab({ basicAnalysis }) {
  // If no overview data
  if (!basicAnalysis?.overview) {
    return (
      <div className="chart-tab-empty">
        <h3>Overview</h3>
        <p>No overview data available yet.</p>
      </div>
    );
  }

  return (
    <div className="chart-tab-content overview-tab">
      <div className="overview-section">
        <div className="overview-section-header">
          <h3 className="overview-section-title">Overview</h3>
          <div className="overview-gradient-icon" />
        </div>
        <div className="overview-text">
          {basicAnalysis.overview.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
