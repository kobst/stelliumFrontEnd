import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRelationshipWorkflow, getRelationshipWorkflowStatus } from '../../../Utilities/api';
import InsufficientCreditsModal from '../../entitlements/InsufficientCreditsModal';
import useEntitlementsStore from '../../../Utilities/entitlementsStore';
import { CREDIT_COSTS } from '../../../Utilities/creditCosts';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './RelationshipTabs.css';

const CLUSTER_ICONS = {
  Harmony: "💕",
  Passion: "🔥",
  Connection: "🧠",
  Stability: "💎",
  Growth: "🌱"
};

// Get quadrant label
const getQuadrantLabel = (quadrant) => {
  if (!quadrant) return 'N/A';
  const q = quadrant.toLowerCase();
  if (q.includes('easy') || q.includes('thriving')) return 'Easy-Going';
  if (q.includes('dynamic') || q.includes('passion')) return 'Dynamic';
  if (q.includes('growth') || q.includes('challenge')) return 'Growth Edge';
  if (q.includes('stable') || q.includes('steady')) return 'Steady';
  return quadrant;
};

function AnalysisTab({ relationship, compositeId, onAnalysisComplete, userId }) {
  const [selectedCluster, setSelectedCluster] = useState('Harmony');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('synastry');
  const [selectedPanel, setSelectedPanel] = useState('support');
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [aspectPanel, setAspectPanel] = useState('support');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showAllAspects, setShowAllAspects] = useState(false);
  const [showSourceFilters, setShowSourceFilters] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const pollingRef = useRef(null);
  const navigate = useNavigate();
  const credits = useEntitlementsStore((state) => state.credits);
  const isAnalysisUnlocked = useEntitlementsStore((state) => state.isAnalysisUnlocked);
  const hasEnoughCredits = useEntitlementsStore((state) => state.hasEnoughCredits);

  const completeAnalysis = relationship?.completeAnalysis;
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;

  const orderedClusters = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

  // Check if full analysis is complete
  const isAnalysisComplete = completeAnalysis && Object.keys(completeAnalysis).length > 0;

  // Scored items from clusterScoring (flat array with per-cluster contributions)
  const allScoredItems = clusterAnalysis?.scoredItems || [];

  // Get scored items for a specific cluster, filtered into support/challenge
  const getClusterScoredItems = (clusterName, panel) => {
    let items = allScoredItems
      .map(item => {
        const contribution = item.clusterContributions?.find(
          c => c.cluster === clusterName
        );
        if (!contribution || contribution.score === 0) return null;
        return { ...item, clusterScore: contribution.score, starRating: contribution.starRating };
      })
      .filter(Boolean);

    // Filter by support/challenge
    items = panel === 'support'
      ? items.filter(i => i.clusterScore > 0)
      : items.filter(i => i.clusterScore < 0);

    // Apply source filter
    if (sourceFilter === 'synastry') {
      items = items.filter(i => i.source === 'synastry');
    } else if (sourceFilter === 'composite') {
      items = items.filter(i => i.source === 'composite');
    } else if (sourceFilter === 'housePlacement') {
      items = items.filter(i => i.type === 'housePlacement');
    }

    // Sort by absolute score descending
    return items.sort((a, b) => Math.abs(b.clusterScore) - Math.abs(a.clusterScore));
  };

  // Reset showAllAspects when cluster or panel changes
  useEffect(() => {
    setShowAllAspects(false);
  }, [selectedCluster, aspectPanel]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const startPolling = useCallback((workflowId) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const poll = async () => {
      try {
        const response = await getRelationshipWorkflowStatus(compositeId);
        setAnalysisStatus(response);

        // Check workflow status - API returns status at response.status and response.completed
        const workflowStatus = response?.status;
        const isComplete = response?.completed === true;

        if (isComplete || workflowStatus === 'completed' || workflowStatus === 'completed_with_failures') {
          console.log('Workflow completed, stopping polling and refreshing data');
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          if (onAnalysisComplete) {
            onAnalysisComplete();
          }
        } else if (workflowStatus === 'failed' || workflowStatus === 'error' || workflowStatus === 'unknown') {
          console.log('Workflow failed/error, stopping polling');
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [compositeId, onAnalysisComplete]);

  const proceedWithAnalysis = async () => {
    try {
      setIsStarting(true);
      const response = await startRelationshipWorkflow(null, null, compositeId, true);

      if (response?.success && response?.workflowId) {
        setAnalysisStatus(response);
        startPolling(response.workflowId);
      }
    } catch (err) {
      console.error('Error starting analysis:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartAnalysis = () => {
    if (isAnalysisUnlocked('RELATIONSHIP', compositeId)) {
      proceedWithAnalysis();
      return;
    }
    if (!hasEnoughCredits(CREDIT_COSTS.FULL_RELATIONSHIP)) {
      setShowInsufficientModal(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmStart = () => {
    setShowConfirm(false);
    proceedWithAnalysis();
  };

  const getClusterAnalysisData = (clusterKey) => {
    // Try to find cluster analysis in completeAnalysis
    if (completeAnalysis) {
      const clusterKeyLower = clusterKey.toLowerCase();
      const analysis = Object.entries(completeAnalysis).find(([key]) =>
        key.toLowerCase().includes(clusterKeyLower)
      );
      if (analysis) return analysis[1];
    }
    return null;
  };

  const relationshipScoredItems =
    relationship?.scoredItems ||
    relationship?.clusterAnalysis?.scoredItems ||
    relationship?.clusterScoring?.scoredItems ||
    [];

  const chatPanel = (
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

  // If analysis is in progress
  if (analysisStatus && !analysisStatus.completed && analysisStatus.status !== 'failed') {
    return (
      <div className="analysis-tab-redesign">
        <div className="analysis-header">
          <h2 className="analysis-header__title">360° Analysis</h2>
          <button className="ask-stellium-trigger" onClick={() => setChatOpen(true)}>
            <span className="ask-stellium-trigger__icon">&#10024;</span>
            Ask Stellium
          </button>
        </div>
        <div className="analysis-progress-card">
          <div className="progress-spinner"></div>
          <h3>Analysis in Progress</h3>
          <p>We're analyzing your relationship in depth...</p>
          <p className="progress-note">This may take a few minutes</p>
        </div>
        {chatPanel}
      </div>
    );
  }

  // If no analysis yet
  if (!isAnalysisComplete) {
    return (
      <div className="analysis-tab-redesign">
        <div className="analysis-header">
          <h2 className="analysis-header__title">360° Analysis</h2>
          <button className="ask-stellium-trigger" onClick={() => setChatOpen(true)}>
            <span className="ask-stellium-trigger__icon">&#10024;</span>
            Ask Stellium
          </button>
        </div>
        <div className="analysis-empty-card">
          <div className="empty-icon">🔮</div>
          <h3>360° Analysis</h3>
          <p>Get a deep dive into your relationship dynamics across all five clusters.</p>
          <p className="analysis-description">
            The full analysis examines synastry and composite aspects, revealing support patterns,
            challenges, and keystone aspects that define your unique connection.
          </p>

          {!showConfirm ? (
            <button
              className="start-analysis-button"
              onClick={handleStartAnalysis}
              disabled={isStarting}
            >
              {isStarting ? (
                <>
                  <span className="button-spinner"></span>
                  Starting Analysis...
                </>
              ) : (
                `Start 360° Analysis (${CREDIT_COSTS.FULL_RELATIONSHIP} credits)`
              )}
            </button>
          ) : (
            <div className="locked-content__confirm">
              <p className="locked-content__confirm-text">
                This will use {CREDIT_COSTS.FULL_RELATIONSHIP} credits. You'll have {credits.total - CREDIT_COSTS.FULL_RELATIONSHIP} remaining.
              </p>
              <div className="locked-content__confirm-actions">
                <button
                  className="locked-content__confirm-btn"
                  onClick={handleConfirmStart}
                >
                  Confirm
                </button>
                <button
                  className="locked-content__confirm-cancel"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <p className="prompt-credit-balance">You have {credits.total} credits</p>
        </div>

        <InsufficientCreditsModal
          isOpen={showInsufficientModal}
          onClose={() => setShowInsufficientModal(false)}
          creditsNeeded={CREDIT_COSTS.FULL_RELATIONSHIP}
          creditsAvailable={credits.total}
          onBuyCredits={() => { setShowInsufficientModal(false); navigate('/pricingTable'); }}
          onSubscribe={() => { setShowInsufficientModal(false); navigate('/pricingTable'); }}
        />
        {chatPanel}
      </div>
    );
  }

  // Get current cluster data
  const currentClusterData = clusters?.[selectedCluster];
  const currentAnalysisData = getClusterAnalysisData(selectedCluster);
  const currentScore = currentClusterData?.score || 0;

  // Get the panel content based on selection
  const getPanelContent = () => {
    const analysisData = selectedAnalysisType === 'synastry'
      ? currentAnalysisData?.synastry
      : currentAnalysisData?.composite;

    if (!analysisData) return null;

    switch (selectedPanel) {
      case 'support':
        return analysisData.supportPanel;
      case 'challenge':
        return analysisData.challengePanel;
      case 'synthesis':
        return analysisData.synthesisPanel;
      default:
        return analysisData.supportPanel;
    }
  };

  const panelContent = getPanelContent();
  const panelTitle = selectedPanel === 'support' ? 'SUPPORT PATTERNS'
    : selectedPanel === 'challenge' ? 'GROWTH CHALLENGES'
    : 'SYNTHESIS';

  // Full analysis complete - show redesigned layout
  return (
    <div className="analysis-tab-redesign">
      {/* Header */}
      <div className="analysis-header">
        <h2 className="analysis-header__title">360° Analysis</h2>
        <button className="ask-stellium-trigger" onClick={() => setChatOpen(true)}>
          <span className="ask-stellium-trigger__icon">&#10024;</span>
          Ask Stellium
        </button>
      </div>

      {/* Main Content Card */}
      <div className="analysis-content-card">
        {/* Cluster Tabs */}
        <div className="analysis-cluster-tabs">
          {orderedClusters.map(cluster => {
            const score = clusters?.[cluster]?.score || 0;
            const isActive = selectedCluster === cluster;
            return (
              <button
                key={cluster}
                className={`analysis-cluster-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCluster(cluster)}
              >
                <span className="tab-name">{cluster}</span>
                <span className="tab-score">{Math.round(score)}%</span>
              </button>
            );
          })}
        </div>

        {/* Selected Cluster Content */}
        <div className="analysis-cluster-content">
          {/* Cluster Header */}
          <div className="cluster-content-header">
            <div className="cluster-content-header__left">
              <span className="cluster-content-icon">{CLUSTER_ICONS[selectedCluster]}</span>
              <span className="cluster-content-name">{selectedCluster}</span>
            </div>
            <span className="cluster-content-score">{Math.round(currentScore)}%</span>
          </div>


          {/* Key Factors */}
          {currentClusterData?.keystoneAspects && currentClusterData.keystoneAspects.length > 0 && (
            <div className="key-factors-section">
              <h4 className="key-factors-title">KEY FACTORS</h4>
              <div className="key-factors-list">
                {currentClusterData.keystoneAspects.slice(0, 4).map((aspect, index) => {
                  // Find star rating from scoredItems cluster contribution
                  const scoredItem = allScoredItems.find(si => si.description === aspect.description || si.item === aspect.item);
                  const contribution = scoredItem?.clusterContributions?.find(c => c.cluster === selectedCluster);
                  const starRating = contribution?.starRating || 0;
                  const contributionScore = contribution?.score || 0;
                  const isSupport = contributionScore > 0;
                  return (
                    <div key={index} className={`key-factor-item ${isSupport ? 'key-factor-item--support' : 'key-factor-item--challenge'}`}>
                      <div className="key-factor-item__header">
                        <span className="key-factor-item__description">{aspect.description}</span>
                        {starRating > 0 && (
                          <span className="key-factor-item__stars" title={`Score: ${contributionScore.toFixed(1)}`}>{'★'.repeat(starRating)}</span>
                        )}
                      </div>
                      {aspect.impact && (
                        <span className="key-factor-item__impact">{aspect.impact}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analysis Section */}
          {(currentAnalysisData?.synastry || currentAnalysisData?.composite) && (
            <div className="analysis-panels-section">
              {/* Analysis Type Dropdown */}
              <div className="analysis-type-selector">
                <select
                  value={selectedAnalysisType}
                  onChange={(e) => setSelectedAnalysisType(e.target.value)}
                  className="analysis-type-dropdown"
                >
                  <option value="synastry">SYNASTRY ANALYSIS</option>
                  <option value="composite">COMPOSITE ANALYSIS</option>
                </select>
              </div>

              {/* Two Column Layout: Navigation + Content */}
              <div className="analysis-panels-layout">
                {/* Left Navigation */}
                <div className="analysis-panels-nav">
                  <button
                    className={`panel-nav-item ${selectedPanel === 'support' ? 'active' : ''}`}
                    onClick={() => setSelectedPanel('support')}
                  >
                    Support Patterns
                  </button>
                  <button
                    className={`panel-nav-item ${selectedPanel === 'challenge' ? 'active' : ''}`}
                    onClick={() => setSelectedPanel('challenge')}
                  >
                    Growth Challenges
                  </button>
                  <button
                    className={`panel-nav-item ${selectedPanel === 'synthesis' ? 'active' : ''}`}
                    onClick={() => setSelectedPanel('synthesis')}
                  >
                    Synthesis
                  </button>
                </div>

                {/* Right Content */}
                <div className="analysis-panel-content">
                  <h4 className="panel-content-title">{panelTitle}</h4>
                  <div className="panel-content-text">
                    {panelContent && panelContent.split('\n').map((p, i) => (
                      p.trim() && <p key={i}>{p}</p>
                    ))}
                    {!panelContent && (
                      <p className="no-content">No analysis content available for this section.</p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scored Items — from clusterScoring.scoredItems, filtered by selected cluster */}
      {allScoredItems.length > 0 && (
        <div className="scored-items-section">
          <h3 className="scored-items-section__title">
            Aspect Breakdown
          </h3>

          {/* Support / Challenge toggle */}
          <div className="scored-items-section__panel-toggle">
            <button
              className={`scored-items-section__toggle-btn ${aspectPanel === 'support' ? 'active' : ''}`}
              onClick={() => setAspectPanel('support')}
            >
              Support
            </button>
            <button
              className={`scored-items-section__toggle-btn ${aspectPanel === 'challenge' ? 'active' : ''}`}
              onClick={() => setAspectPanel('challenge')}
            >
              Challenge
            </button>
          </div>

          {/* Filter toggle + source filters */}
          <div className="scored-items-section__filter-toggle-row">
            <button
              className={`scored-items-section__filter-toggle-btn ${showSourceFilters ? 'active' : ''}`}
              onClick={() => setShowSourceFilters(prev => !prev)}
              title="Filter by source"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
            </button>
          </div>
          {showSourceFilters && (
            <div className="scored-items-section__source-filter">
              {['all', 'synastry', 'composite', 'housePlacement'].map(f => (
                <button
                  key={f}
                  className={`scored-items-section__filter-btn ${sourceFilter === f ? 'active' : ''}`}
                  onClick={() => setSourceFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'housePlacement' ? 'House Placements' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Items list */}
          {(() => {
            const items = getClusterScoredItems(selectedCluster, aspectPanel);
            if (items.length === 0) {
              return (
                <p className="panel-aspects__empty">
                  {aspectPanel === 'support'
                    ? 'No supportive aspects found for this cluster.'
                    : 'No challenging aspects found for this cluster.'}
                </p>
              );
            }
            const maxScore = Math.max(...items.map(i => Math.abs(i.clusterScore)));
            const visibleItems = showAllAspects ? items : items.slice(0, 5);
            return (
              <>
                <ul className="panel-aspects__list">
                  {visibleItems.map((item, index) => (
                    <li key={`${item.id || 'item'}-${index}`} className="panel-aspects__item">
                      <div className="panel-aspects__item-main">
                        <span className="panel-aspects__description">{item.description}</span>
                        {item.starRating != null && item.starRating > 0 ? (
                          <span
                            className="panel-aspects__stars panel-aspects__stars--prominent"
                            title={`Score: ${Math.abs(item.clusterScore).toFixed(1)}`}
                          >
                            {'★'.repeat(item.starRating)}
                          </span>
                        ) : (
                          <span
                            className="panel-aspects__strength-bar-wrap"
                            title={`Score: ${Math.abs(item.clusterScore).toFixed(1)}`}
                          >
                            <span
                              className={`panel-aspects__strength-bar ${aspectPanel === 'support' ? 'panel-aspects__strength-bar--support' : 'panel-aspects__strength-bar--challenge'}`}
                              style={{ width: `${maxScore > 0 ? (Math.abs(item.clusterScore) / maxScore) * 100 : 0}%` }}
                            />
                          </span>
                        )}
                      </div>
                      <div className="panel-aspects__meta">
                        <span className="panel-aspects__source">{item.source}</span>
                        {item.type === 'aspect' && item.aspect && (
                          <span className="panel-aspects__detail">{item.aspect}{item.orb != null ? ` (${item.orb.toFixed(1)}°)` : ''}</span>
                        )}
                        {item.type === 'housePlacement' && (
                          <span className="panel-aspects__detail">
                            {item.planet && `${item.planet} `}
                            {item.house != null && `House ${item.house}`}
                            {item.direction && ` (${item.direction})`}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {items.length > 5 && !showAllAspects && (
                  <button
                    className="panel-aspects__show-all"
                    onClick={() => setShowAllAspects(true)}
                  >
                    Show all {items.length} aspects
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}
      {chatPanel}
    </div>
  );
}

export default AnalysisTab;
