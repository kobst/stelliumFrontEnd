import React from 'react';
import { ZODIAC_SIGNS } from '../../Utilities/zodiac';

function WeeklySignSelector({ selectedSign, onSelect }) {
  return (
    <div className="weekly-sign-selector" aria-label="Zodiac sign selector">
      {ZODIAC_SIGNS.map((sign) => (
        <button
          key={sign.value}
          type="button"
          className={`weekly-sign-selector__pill ${selectedSign === sign.value ? 'is-active' : ''}`}
          onClick={() => onSelect(sign.value)}
        >
          {sign.label}
        </button>
      ))}
    </div>
  );
}

export default WeeklySignSelector;
