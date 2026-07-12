import React from 'react';
import './ChapterHeader.css';

export default function ChapterHeader({ label, helper, rightSlot, className = '' }) {
  return (
    <header className={`chapter-header ${className}`.trim()}>
      <div className="chapter-header__identity">
        <span>{label}</span>
        {helper && <small>{helper}</small>}
      </div>
      {rightSlot && <div className="chapter-header__right">{rightSlot}</div>}
    </header>
  );
}
