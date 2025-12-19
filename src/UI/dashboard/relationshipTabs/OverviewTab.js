import React from 'react';
import './RelationshipTabs.css';

function OverviewTab({ relationship }) {
  const initialOverview = relationship?.initialOverview;
  const holisticOverview = relationship?.completeAnalysis?.holisticOverview;

  // Use holistic overview if available (from full analysis), otherwise use initial overview
  const overview = holisticOverview || initialOverview;

  if (!overview) {
    return (
      <div className="relationship-tab-content overview-tab">
        <div className="overview-empty">
          <div className="empty-icon">♡</div>
          <h3>No Overview Available</h3>
          <p>The relationship overview is not yet available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relationship-tab-content overview-tab">
      <div className="overview-section">
        <h3 className="overview-title">Relationship Overview</h3>
        <div className="overview-content">
          {overview.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* If we have both, show initial as a separate section */}
      {holisticOverview && initialOverview && (
        <div className="overview-section initial-overview">
          <h3 className="overview-title">Initial Impression</h3>
          <div className="overview-content">
            {initialOverview.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OverviewTab;
