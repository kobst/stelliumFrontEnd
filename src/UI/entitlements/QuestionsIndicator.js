import React from 'react';
import './QuestionsIndicator.css';

/**
 * Indicator showing remaining questions count
 */
function QuestionsIndicator({
  questionsRemaining = 0,
  monthlyQuestions = 0,
  purchasedQuestions = 0,
  resetDate = null,
  compact = false,
  onPurchaseClick,
}) {
  const formatResetDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isLow = questionsRemaining <= 2 && questionsRemaining > 0;
  const isEmpty = questionsRemaining === 0;

  return (
    <div className={`questions-indicator ${compact ? 'questions-indicator--compact' : ''}`}>
      <div className="questions-indicator__header">
        <svg
          className="questions-indicator__icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="questions-indicator__label">Questions</span>
      </div>

      <div className={`questions-indicator__count ${isLow ? 'questions-indicator__count--low' : ''} ${isEmpty ? 'questions-indicator__count--empty' : ''}`}>
        <span className="questions-indicator__number">{questionsRemaining}</span>
        <span className="questions-indicator__remaining">remaining</span>
      </div>

      {!compact && (
        <div className="questions-indicator__breakdown">
          {monthlyQuestions > 0 && (
            <span className="questions-indicator__breakdown-item">
              {monthlyQuestions} monthly
            </span>
          )}
          {purchasedQuestions > 0 && (
            <span className="questions-indicator__breakdown-item">
              {purchasedQuestions} purchased
            </span>
          )}
        </div>
      )}

      {!compact && resetDate && monthlyQuestions > 0 && (
        <div className="questions-indicator__reset">
          Resets {formatResetDate(resetDate)}
        </div>
      )}

      {isEmpty && onPurchaseClick && (
        <button className="questions-indicator__purchase-btn" onClick={onPurchaseClick}>
          Get More
        </button>
      )}
    </div>
  );
}

export default QuestionsIndicator;
