import React from 'react';
import './ChartDetailHeader.css';

function ChartDetailHeader({ onBackClick }) {
  return (
    <header className="chart-detail-header">
      <button className="chart-detail-header__back" onClick={onBackClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>
    </header>
  );
}

export default ChartDetailHeader;
