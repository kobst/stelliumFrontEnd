import React from 'react';
import './TimeSelector.css';

const TIME_PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' }
];

function TimeSelector({ currentPeriod, onSelect, disabled = false }) {
  return (
    <div className="time-selector">
      <div className="time-selector__buttons">
        {TIME_PERIODS.map(period => (
          <button
            key={period.id}
            className={`time-selector__button ${currentPeriod === period.id ? 'time-selector__button--active' : ''}`}
            onClick={() => onSelect(period.id)}
            disabled={disabled}
            aria-pressed={currentPeriod === period.id}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TimeSelector;
