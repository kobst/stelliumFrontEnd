import React from 'react';
import './SectionNav.css';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'chart', label: 'Chart' },
  { id: 'dominance', label: 'Patterns' },
  { id: 'planets', label: 'Planets' },
  { id: 'houses', label: 'Houses' },
  { id: 'aspects', label: 'Aspects' },
  { id: 'analysis', label: '360°' },
  { id: 'chat', label: 'Ask Stellium' }
];

function SectionNav({ activeSection, onSectionChange, lockedSections = [] }) {
  return (
    <nav className="section-nav">
      <div className="section-nav__list">
        {SECTIONS.map(section => {
          const isLocked = lockedSections.includes(section.id);
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              className={`section-nav__btn ${isActive ? 'section-nav__btn--active' : ''} ${isLocked ? 'section-nav__btn--locked' : ''}`}
              onClick={() => onSectionChange(section.id)}
              disabled={false}
            >
              <span className="section-nav__label">{section.label}</span>
              {isLocked && (
                <svg className="section-nav__lock" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
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

export default SectionNav;
