import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startRelationshipWorkflow, getRelationshipWorkflowStatus } from '../../../Utilities/api';
import InsufficientCreditsModal from '../../entitlements/InsufficientCreditsModal';
import useEntitlementsStore from '../../../Utilities/entitlementsStore';
import { CREDIT_COSTS } from '../../../Utilities/creditCosts';
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

// Format category key for display: OVERALL_ATTRACTION_CHEMISTRY → "Overall Attraction & Chemistry"
const formatCategoryLabel = (key) => {
  return key
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/ And /g, ' & ');
};

function AnalysisTab({ relationship, compositeId, onAnalysisComplete, userId }) {
  const [selectedCluster, setSelectedCluster] = useState('Harmony');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('synastry');
  const [selectedPanel, setSelectedPanel] = useState('support');
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [aspectPanel, setAspectPanel] = useState('support');
  const [sourceFilter, setSourceFilter] = useState('all');
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

  // scoreAnalysis from the relationship (populated by fetchRelationshipAnalysis)
  const scoreAnalysis = relationship?.scoreAnalysis;
  const scoreAnalysisCategories = scoreAnalysis ? Object.keys(scoreAnalysis) : [];

  // Auto-select first category when scoreAnalysis becomes available
  useEffect(() => {
    if (scoreAnalysisCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(scoreAnalysisCategories[0]);
    }
  }, [scoreAnalysisCategories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get filtered scored items for the selected category
  const getFilteredItems = (panel) => {
    if (!scoreAnalysis || !selectedCategory) return [];
    const category = scoreAnalysis[selectedCategory];
    if (!category?.scoredItems) return [];

    let items = panel === 'support'
      ? category.scoredItems.filter(i => i.score > 0)
      : category.scoredItems.filter(i => i.score < 0);

    // Apply source filter
    if (sourceFilter === 'synastry') {
      items = items.filter(i => i.source === 'synastry');
    } else if (sourceFilter === 'composite') {
      items = items.filter(i => i.source === 'composite');
    } else if (sourceFilter === 'housePlacement') {
      items = items.filter(i => i.type === 'housePlacement');
    }

    // Sort by absolute score descending
    return items.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  };

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

  // If analysis is in progress
  if (analysisStatus && !analysisStatus.completed && analysisStatus.status !== 'failed') {
    return (
      <div className="analysis-tab-redesign">
        <div className="analysis-header">
          <h2 className="analysis-header__title">360° Analysis</h2>
          <div className="analysis-header__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="url(#analysisGradient)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="24" cy="24" r="12" stroke="url(#analysisGradient)" strokeWidth="1.5" opacity="0.6" />
              <defs>
                <linearGradient id="analysisGradient" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div className="analysis-progress-card">
          <div className="progress-spinner"></div>
          <h3>Analysis in Progress</h3>
          <p>We're analyzing your relationship in depth...</p>
          <p className="progress-note">This may take a few minutes</p>
        </div>
      </div>
    );
  }

  // If no analysis yet
  if (!isAnalysisComplete) {
    return (
      <div className="analysis-tab-redesign">
        <div className="analysis-header">
          <h2 className="analysis-header__title">360° Analysis</h2>
          <div className="analysis-header__icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="url(#analysisGradient2)" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="24" cy="24" r="12" stroke="url(#analysisGradient2)" strokeWidth="1.5" opacity="0.6" />
              <defs>
                <linearGradient id="analysisGradient2" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
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
        <div className="analysis-header__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="url(#analysisGradient3)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="24" cy="24" r="12" stroke="url(#analysisGradient3)" strokeWidth="1.5" opacity="0.6" />
            <defs>
              <linearGradient id="analysisGradient3" x1="0" y1="0" x2="48" y2="48">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>
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

          {/* Metrics Row */}
          <div className="cluster-metrics-row">
            <div className="cluster-metric-box">
              <span className="metric-box-label">Support</span>
              <span className="metric-box-value">{currentClusterData?.supportPct || 0}%</span>
            </div>
            <div className="cluster-metric-box">
              <span className="metric-box-label">Challenge</span>
              <span className="metric-box-value">{currentClusterData?.challengePct || 0}%</span>
            </div>
            <div className="cluster-metric-box">
              <span className="metric-box-label">Heat</span>
              <span className="metric-box-value">{currentClusterData?.heatPct || 0}%</span>
            </div>
            <div className="cluster-metric-box">
              <span className="metric-box-label">Quadrant</span>
              <span className="metric-box-value quadrant">{getQuadrantLabel(currentClusterData?.quadrant)}</span>
            </div>
          </div>

          {/* Key Factors */}
          {currentClusterData?.keystoneAspects && currentClusterData.keystoneAspects.length > 0 && (
            <div className="key-factors-section">
              <h4 className="key-factors-title">KEY FACTORS</h4>
              <div className="key-factors-list">
                {currentClusterData.keystoneAspects.slice(0, 3).map((aspect, index) => (
                  <div key={index} className="key-factor-item">
                    {aspect.description}
                  </div>
                ))}
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

      {/* Scored Items Section — from scoreAnalysis */}
      {scoreAnalysis && scoreAnalysisCategories.length > 0 && (
        <div className="scored-items-section">
          <h3 className="scored-items-section__title">Aspect Breakdown</h3>

          {/* Category tabs */}
          <div className="scored-items-section__categories">
            {scoreAnalysisCategories.map(catKey => (
              <button
                key={catKey}
                className={`scored-items-section__cat-btn ${selectedCategory === catKey ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(catKey); setAspectPanel('support'); }}
              >
                {formatCategoryLabel(catKey)}
              </button>
            ))}
          </div>

          {selectedCategory && scoreAnalysis[selectedCategory] && (
            <>
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

              {/* Source filter */}
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

              {/* Items list */}
              {(() => {
                const items = getFilteredItems(aspectPanel);
                if (items.length === 0) {
                  return (
                    <p className="panel-aspects__empty">
                      {aspectPanel === 'support'
                        ? 'No supportive items found.'
                        : 'No challenging items found.'}
                    </p>
                  );
                }
                return (
                  <ul className="panel-aspects__list">
                    {items.map((item, index) => (
                      <li key={`${item.code || item.id || 'item'}-${index}`} className="panel-aspects__item">
                        <div className="panel-aspects__item-main">
                          <span className="panel-aspects__description">{item.description}</span>
                          <span className={`panel-aspects__score ${aspectPanel === 'support' ? 'panel-aspects__score--support' : 'panel-aspects__score--challenge'}`}>
                            {Math.abs(Math.round(item.score))}
                          </span>
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
                          {item.starRating != null && item.starRating > 0 && (
                            <span className="panel-aspects__stars">{'★'.repeat(item.starRating)}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                );
              })()}

              {/* Category analysis narrative */}
              {scoreAnalysis[selectedCategory]?.analysis && (
                <div className="scored-items-section__narrative">
                  <h5 className="scored-items-section__narrative-title">Analysis</h5>
                  <p>{scoreAnalysis[selectedCategory].analysis}</p>
                </div>
              )}
            </>
          )}

          {!selectedCategory && (
            <p className="panel-aspects__empty">Select a category above to view scored aspects.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalysisTab;
