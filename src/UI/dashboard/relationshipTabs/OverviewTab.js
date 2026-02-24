import React, { useState } from 'react';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './RelationshipTabs.css';

function OverviewTab({ relationship, compositeId, isCelebrity = false }) {
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

  const panel = !isCelebrity ? (
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
  ) : null;

  if (!overview) {
    return (
      <div className="overview-tab-redesign">
        <div className="overview-header">
          <h2 className="overview-header__title">Relationship Overview</h2>
          {!isCelebrity && (
            <button
              className="ask-stellium-trigger"
              onClick={() => setChatOpen(true)}
            >
              <span className="ask-stellium-trigger__icon">&#10024;</span>
              Ask Stellium
            </button>
          )}
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
        {!isCelebrity && (
          <button
            className="ask-stellium-trigger"
            onClick={() => setChatOpen(true)}
          >
            <span className="ask-stellium-trigger__icon">&#10024;</span>
            Ask Stellium
          </button>
        )}
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
