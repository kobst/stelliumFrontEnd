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

function AnalysisTab({ relationship, compositeId, onAnalysisComplete, userId }) {
  const [selectedCluster, setSelectedCluster] = useState('Harmony');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('synastry');
  const [selectedPanel, setSelectedPanel] = useState('support');
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const pollingRef = useRef(null);
  const navigate = useNavigate();
  const credits = useEntitlementsStore((state) => state.credits);
  const isAnalysisUnlocked = useEntitlementsStore((state) => state.isAnalysisUnlocked);
  const hasEnoughCredits = useEntitlementsStore((state) => state.hasEnoughCredits);
  const checkAndUseAnalysis = useEntitlementsStore((state) => state.checkAndUseAnalysis);

  const completeAnalysis = relationship?.completeAnalysis;
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;

  const orderedClusters = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

  // Check if full analysis is complete
  const isAnalysisComplete = completeAnalysis && Object.keys(completeAnalysis).length > 0;

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

  const handleConfirmStart = async () => {
    setIsConfirming(true);
    const result = await checkAndUseAnalysis(userId, 'RELATIONSHIP', compositeId);
    setIsConfirming(false);
    setShowConfirm(false);
    if (result.success) {
      proceedWithAnalysis();
    }
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
                  disabled={isConfirming}
                >
                  {isConfirming ? 'Unlocking...' : 'Confirm'}
                </button>
                <button
                  className="locked-content__confirm-cancel"
                  onClick={() => setShowConfirm(false)}
                  disabled={isConfirming}
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
    </div>
  );
}

export default AnalysisTab;
