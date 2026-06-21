import React from 'react';
import './ChartDetailHeader.css';

function ChartDetailHeader({ onBackClick }) {
  return (
    <header className="bcd-page-top">
      <button type="button" className="bcd-back-link" onClick={onBackClick}>
        <span className="bcd-back-link__arrow">←</span> Back to Dashboard
      </button>
    </header>
  );
}

export default ChartDetailHeader;
