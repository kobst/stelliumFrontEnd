import React from 'react';
import './ChartDetailHeader.css';

function ChartDetailHeader({ onBackClick, credits = null }) {
  const totalCredits = credits?.total;
  const showCredits = typeof totalCredits === 'number' && Number.isFinite(totalCredits);

  return (
    <header className="bcd-page-top">
      <button type="button" className="bcd-back-link" onClick={onBackClick}>
        <span className="bcd-back-link__arrow">←</span> Back to Dashboard
      </button>
      {showCredits && (
        <span className="bcd-credit-pill" title="Credits remaining">
          <svg width="9" height="9" viewBox="0 0 11 11" aria-hidden="true">
            <path d="M5.5 0.5 L10.5 5.5 L5.5 10.5 L0.5 5.5 Z" fill="#e9c349" />
          </svg>
          {totalCredits.toLocaleString()} {totalCredits === 1 ? 'credit' : 'credits'}
        </span>
      )}
    </header>
  );
}

export default ChartDetailHeader;
