import React from 'react';
import './RelationshipTabs.css';

function OverviewTab({ relationship }) {
  const initialOverview = relationship?.initialOverview;
  const holisticOverview = relationship?.completeAnalysis?.holisticOverview;

  // Use holistic overview if available (from full analysis), otherwise use initial overview
  const overview = holisticOverview || initialOverview;

  if (!overview) {
    return (
      <div className="overview-tab-redesign">
        <div className="overview-header">
          <h2 className="overview-header__title">Relationship Overview</h2>
          <div className="overview-header__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="24" cy="24" r="12" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div className="overview-body">
          <div className="overview-empty-state">
            <span className="empty-icon">♡</span>
            <h3>No Overview Available</h3>
            <p>The relationship overview is not yet available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overview-tab-redesign">
      <div className="overview-header">
        <h2 className="overview-header__title">Relationship Overview</h2>
        <div className="overview-header__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="24" cy="24" r="12" stroke="url(#gradient)" strokeWidth="1.5" opacity="0.6" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="overview-body">
        <div className="overview-paragraphs">
          {overview.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
