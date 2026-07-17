import React, { useState } from 'react';
import AnalysisPromptCard from '../../shared/AnalysisPromptCard';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import AskStelliumCta from '../chartTabs/AskStelliumCta';
import { getRelationshipSummary } from '../../../Utilities/relationshipSummary';
import './RelationshipTabs.css';

const CLUSTER_ICONS = {
  Harmony: '\u{1F495}',
  Passion: '\u{1F525}',
  Connection: '\u{1F9E0}',
  Stability: '\u{1F48E}',
  Growth: '\u{1F331}'
};

const CLUSTER_DESCRIPTIONS = {
  Harmony: 'Overall compatibility and ease in the relationship',
  Passion: 'Sexual chemistry and physical attraction',
  Connection: 'Emotional and mental bonding',
  Stability: 'Long-term potential and commitment',
  Growth: 'Transformative potential and personal evolution'
};

const ORDERED_CLUSTERS = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

function AspectLine({ description, polarity }) {
  const tone = polarity > 0 ? 'flowing' : polarity < 0 ? 'tension' : 'moon';
  if (!description) return null;
  return (
    <div className={`rd-aspect-line ${tone}`}>
      <span className="rd-aspect-line__dot" />
      <span>{description}</span>
    </div>
  );
}

function ScoresTab({
  relationship,
  hasAnalysis,
  onNavigateToAnalysis,
  creditCost,
  creditsRemaining,
  compositeId,
  isCelebrity = false,
  canUseAskStellium = false
}) {
  const [openCluster, setOpenCluster] = useState('Harmony');
  const [chatOpen, setChatOpen] = useState(false);

  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;
  const allScoredItems = clusterAnalysis?.scoredItems || [];
  const { label, blurb } = getRelationshipSummary(overall);

  const relationshipScoredItems =
    relationship?.scoredItems ||
    relationship?.clusterAnalysis?.scoredItems ||
    relationship?.clusterScoring?.scoredItems ||
    [];

  const chatPanel = !isCelebrity && canUseAskStellium ? (
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

  if (!clusters) {
    return (
      <div className="scores-tab-redesign">
        <div className="rd-section-head">
          <h2>Relationship Pattern</h2>
        </div>
        <div className="rd-empty">
          Pattern details are not yet available for this relationship.
        </div>
        {chatPanel}
      </div>
    );
  }

  return (
    <div className="scores-tab-redesign">
      <div className="rd-section-head">
        <h2>Relationship Pattern</h2>
      </div>

      {(label || blurb) && (
        <div className="rd-score-summary rd-score-summary--detail">
          <div className="rd-score-summary__label">Relationship Pattern</div>
          {label && <h3 className="rd-score-summary__title">{label}</h3>}
          {blurb && <p>{blurb}</p>}
        </div>
      )}

      <div className="rd-bars-stack">
        {ORDERED_CLUSTERS.map((cluster) => {
          const isOpen = openCluster === cluster;
          const clusterItems = allScoredItems
            .map((item) => {
              const contribution = item.clusterContributions?.find((c) => c.cluster === cluster);
              if (!contribution || contribution.score === 0) return null;
              return { ...item, clusterScore: contribution.score };
            })
            .filter(Boolean)
            .sort((a, b) => Math.abs(b.clusterScore) - Math.abs(a.clusterScore));
          const topSupport = clusterItems.find((i) => i.clusterScore > 0);
          const topChallenge = clusterItems.find((i) => i.clusterScore < 0);

          return (
            <div key={cluster} className={`rd-bar-card${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="rd-bar-card__summary rd-bar-card__summary--plain"
                onClick={() => setOpenCluster(isOpen ? null : cluster)}
                aria-expanded={isOpen}
              >
                <div className="rd-bar-row__nm">
                  <div className="rd-bar-row__ic">{CLUSTER_ICONS[cluster]}</div>
                  {cluster}
                </div>
                <div className="rd-bar-card__chev">▾</div>
              </button>

              {isOpen && (
                <div className="rd-bar-card__reveal">
                  <div className="rd-bar-card__tagline">{CLUSTER_DESCRIPTIONS[cluster]}</div>
                  <div className="rd-aspect-list">
                    {topSupport && (
                      <AspectLine description={topSupport.description} polarity={topSupport.clusterScore} />
                    )}
                    {topChallenge && (
                      <AspectLine description={topChallenge.description} polarity={topChallenge.clusterScore} />
                    )}
                    {!topSupport && !topChallenge && (
                      <div className="rd-bar-card__tagline" style={{ padding: 0 }}>
                        No contributing aspects available yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!hasAnalysis && onNavigateToAnalysis && (
        <div style={{ marginTop: 18 }}>
          <AnalysisPromptCard
            message="Unlock detailed relationship interpretations across all compatibility dimensions."
            onNavigate={onNavigateToAnalysis}
            creditCost={creditCost}
            creditsRemaining={creditsRemaining}
          />
        </div>
      )}

      {!isCelebrity && (
        <div style={{ marginTop: 18 }}>
          <AskStelliumCta
            hasFullAccess={canUseAskStellium}
            onActivate={() => setChatOpen(prev => !prev)}
            label="Ask Stellium about this relationship"
          />
        </div>
      )}

      {chatPanel}
    </div>
  );
}

export default ScoresTab;
