import React, { useState } from 'react';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './RelationshipTabs.css';

function OverviewTab({ relationship, compositeId }) {
  const [chatOpen, setChatOpen] = useState(false);
  const initialOverview = relationship?.initialOverview;
  const holisticOverview = relationship?.completeAnalysis?.holisticOverview;
  const relationshipScoredItems =
    relationship?.scoredItems ||
    relationship?.clusterAnalysis?.scoredItems ||
    relationship?.clusterScoring?.scoredItems ||
    [];

  // Use holistic overview if available (from full analysis), otherwise use initial overview
  const overview = holisticOverview || initialOverview;

  const iconSvg = (
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
  );

  const panel = (
    <AskStelliumPanel
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
      contentType="relationship"
      contentId={compositeId}
      relationshipScoredItems={relationshipScoredItems}
      contextLabel="About your relationship"
      placeholderText="Ask about your relationship..."
      suggestedQuestions={[
        "What are our relationship strengths?",
        "How can we improve our communication?",
        "What challenges should we be aware of?"
      ]}
    />
  );

  if (!overview) {
    return (
      <div className="overview-tab-redesign">
        <div className="overview-header">
          <h2 className="overview-header__title">Relationship Overview</h2>
          <div
            className="overview-header__icon overview-header__icon--clickable"
            onClick={() => setChatOpen(true)}
            title="Ask Stellium"
          >
            {iconSvg}
          </div>
        </div>
        <div className="overview-body">
          <div className="overview-empty-state">
            <span className="empty-icon">&#9825;</span>
            <h3>No Overview Available</h3>
            <p>The relationship overview is not yet available.</p>
          </div>
        </div>
        {panel}
      </div>
    );
  }

  return (
    <div className="overview-tab-redesign">
      <div className="overview-header">
        <h2 className="overview-header__title">Relationship Overview</h2>
        <div
          className="overview-header__icon overview-header__icon--clickable"
          onClick={() => setChatOpen(true)}
          title="Ask Stellium"
        >
          {iconSvg}
        </div>
      </div>

      <div className="overview-body">
        <div className="overview-paragraphs">
          {overview.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
      {panel}
    </div>
  );
}

export default OverviewTab;
