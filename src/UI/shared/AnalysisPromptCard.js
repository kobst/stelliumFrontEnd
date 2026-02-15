import React from 'react';
import './AnalysisPromptCard.css';

function AnalysisPromptCard({ message, onNavigate, creditCost, creditsRemaining }) {
  return (
    <div className="analysis-prompt-card">
      <div className="analysis-prompt-card__body">
        <svg className="analysis-prompt-card__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0L9.2 5.3L14.5 4L10.6 8L14.5 12L9.2 10.7L8 16L6.8 10.7L1.5 12L5.4 8L1.5 4L6.8 5.3L8 0Z" fill="#a78bfa" />
        </svg>
        <p className="analysis-prompt-card__message">{message}</p>
      </div>
      <button className="analysis-prompt-card__btn" onClick={onNavigate}>
        Get 360° Analysis{creditCost != null ? ` (${creditCost} credits)` : ''}
      </button>
      {creditsRemaining != null && (
        <p className="analysis-prompt-card__credits">You have {creditsRemaining} credits</p>
      )}
    </div>
  );
}

export default AnalysisPromptCard;
