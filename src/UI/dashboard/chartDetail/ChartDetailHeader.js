import React from 'react';
import './ChartDetailHeader.css';

function ChartDetailHeader({ onBackClick, backLabel = 'Back to Dashboard', rightContent }) {
  return (
    <header className="bcd-page-top">
      <button type="button" className="bcd-back-link" onClick={onBackClick}>
        <span className="bcd-back-link__arrow">←</span> {backLabel}
      </button>
      {rightContent}
    </header>
  );
}

export default ChartDetailHeader;
