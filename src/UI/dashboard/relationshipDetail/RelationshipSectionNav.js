import React from 'react';
import './RelationshipSectionNav.css';

const SECTIONS = [
  { id: 'scores', label: 'Scores', icon: '\u2661' },
  { id: 'overview', label: 'Overview', icon: '\u{1F4D6}' },
  { id: 'charts', label: 'Charts', icon: '\u25CE' },
  { id: 'analysis', label: '360\u00B0', icon: '\u{1F52E}' }
];

function RelationshipSectionNav({ activeSection, onSectionChange, lockedSections = [] }) {
  return (
    <nav className="relationship-section-nav">
      <div className="relationship-section-nav__list">
        {SECTIONS.map(section => {
          const isLocked = lockedSections.includes(section.id);
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              className={`relationship-section-nav__btn ${isActive ? 'relationship-section-nav__btn--active' : ''} ${isLocked ? 'relationship-section-nav__btn--locked' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <span className="relationship-section-nav__icon">{section.icon}</span>
              <span className="relationship-section-nav__label">{section.label}</span>
              {isLocked && (
                <svg className="relationship-section-nav__lock" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default RelationshipSectionNav;
