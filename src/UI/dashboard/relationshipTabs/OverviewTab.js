import React, { useState } from 'react';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import AskStelliumCta from '../chartTabs/AskStelliumCta';
import './RelationshipTabs.css';

function OverviewTab({ relationship, compositeId, isCelebrity = false, canUseAskStellium = false }) {
  const [chatOpen, setChatOpen] = useState(false);

  const initialOverview = relationship?.initialOverview;
  const holisticOverview = relationship?.completeAnalysis?.holisticOverview;
  const overview = holisticOverview || initialOverview;

  const relationshipScoredItems =
    relationship?.scoredItems ||
    relationship?.clusterAnalysis?.scoredItems ||
    relationship?.clusterScoring?.scoredItems ||
    [];

  const panel = !isCelebrity && canUseAskStellium ? (
    <AskStelliumPanel
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
      contentType="relationship"
      contentId={compositeId}
      relationshipScoredItems={relationshipScoredItems}
      contextLabel="About your relationship"
      placeholderText="Ask about your relationship..."
      suggestedQuestions={[
        'What are our relationship strengths?',
        'How can we improve our communication?',
        'What challenges should we be aware of?'
      ]}
    />
  ) : null;

  const paragraphs = (overview || '')
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="overview-tab-redesign">
      <div className="rd-section-head">
        <h2>Relationship Overview</h2>
      </div>

      {paragraphs.length > 0 ? (
        <article className="rd-overview-reading">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>
      ) : (
        <div className="rd-empty">The relationship overview is not yet available.</div>
      )}

      {!isCelebrity && (
        <div style={{ padding: '24px 30px 0' }}>
          <AskStelliumCta
            hasFullAccess={canUseAskStellium}
            onActivate={() => setChatOpen(prev => !prev)}
            label="Ask Stellium about this relationship"
          />
        </div>
      )}

      {panel}
    </div>
  );
}

export default OverviewTab;
