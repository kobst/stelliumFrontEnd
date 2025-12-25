import React, { useState, useCallback, useRef, useEffect } from 'react';
import { startRelationshipWorkflow, getRelationshipWorkflowStatus } from '../../../Utilities/api';
import './RelationshipTabs.css';

function AnalysisTab({ relationship, compositeId, onAnalysisComplete }) {
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const pollingRef = useRef(null);

  const completeAnalysis = relationship?.completeAnalysis;
  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;

  const orderedClusters = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

  const clusterIcons = {
    Harmony: "💕",
    Passion: "🔥",
    Connection: "🧠",
    Stability: "💎",
    Growth: "🌱"
  };

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

  const handleStartAnalysis = async () => {
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
      <div className="relationship-tab-content analysis-tab">
        <div className="analysis-progress">
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
      <div className="relationship-tab-content analysis-tab">
        <div className="analysis-empty">
          <div className="empty-icon">🔮</div>
          <h3>360° Analysis</h3>
          <p>Get a deep dive into your relationship dynamics across all five clusters.</p>
          <p className="analysis-description">
            The full analysis examines synastry and composite aspects, revealing support patterns,
            challenges, and keystone aspects that define your unique connection.
          </p>
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
              'Start 360° Analysis'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full analysis complete - show cluster panels
  return (
    <div className="relationship-tab-content analysis-tab">
      <h3 className="analysis-title">360° Analysis</h3>
      <p className="analysis-subtitle">Tap a cluster to explore detailed insights</p>

      <div className="analysis-clusters-grid">
        {orderedClusters.map(cluster => {
          const score = clusters?.[cluster]?.score || 0;
          const clusterData = clusters?.[cluster];
          const analysisData = getClusterAnalysisData(cluster);
          const isSelected = selectedCluster === cluster;

          return (
            <div
              key={cluster}
              className={`analysis-cluster-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedCluster(isSelected ? null : cluster)}
            >
              <div className="cluster-header">
                <span className="cluster-icon">{clusterIcons[cluster]}</span>
                <span className="cluster-name">{cluster}</span>
                <span className="cluster-score">{Math.round(score)}%</span>
              </div>

              {isSelected && (
                <div className="cluster-analysis-content">
                  {clusterData && (
                    <div className="cluster-metrics-panel">
                      <div className="metric-row">
                        <span className="metric-label">Support:</span>
                        <span className="metric-value positive">{clusterData.supportPct || 0}%</span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Challenge:</span>
                        <span className="metric-value negative">{clusterData.challengePct || 0}%</span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Heat:</span>
                        <span className="metric-value">{clusterData.heatPct || 0}%</span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Quadrant:</span>
                        <span className="metric-value">{clusterData.quadrant || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {clusterData?.keystoneAspects && clusterData.keystoneAspects.length > 0 && (
                    <div className="keystone-aspects-panel">
                      <h4>Key Factors</h4>
                      {clusterData.keystoneAspects.slice(0, 3).map((aspect, index) => (
                        <div key={index} className="keystone-aspect">
                          <span className="aspect-description">{aspect.description}</span>
                          <span className={`aspect-score ${aspect.score > 0 ? 'positive' : 'negative'}`}>
                            {aspect.score > 0 ? '+' : ''}{aspect.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Synastry Analysis Panels */}
                  {analysisData?.synastry && (
                    <div className="analysis-section">
                      <h4 className="section-title">Synastry Analysis</h4>

                      {analysisData.synastry.supportPanel && (
                        <div className="analysis-text-panel support">
                          <h5>Support Patterns</h5>
                          {analysisData.synastry.supportPanel.split('\n').map((p, i) => (
                            p.trim() && <p key={i}>{p}</p>
                          ))}
                        </div>
                      )}

                      {analysisData.synastry.challengePanel && (
                        <div className="analysis-text-panel challenge">
                          <h5>Growth Challenges</h5>
                          {analysisData.synastry.challengePanel.split('\n').map((p, i) => (
                            p.trim() && <p key={i}>{p}</p>
                          ))}
                        </div>
                      )}

                      {analysisData.synastry.synthesisPanel && (
                        <div className="analysis-text-panel synthesis">
                          <h5>Synthesis</h5>
                          {analysisData.synastry.synthesisPanel.split('\n').map((p, i) => (
                            p.trim() && <p key={i}>{p}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Composite Analysis Panels */}
                  {analysisData?.composite && (
                    <div className="analysis-section">
                      <h4 className="section-title">Composite Analysis</h4>

                      {analysisData.composite.supportPanel && (
                        <div className="analysis-text-panel support">
                          <h5>Support Patterns</h5>
                          {analysisData.composite.supportPanel.split('\n').map((p, i) => (
                            p.trim() && <p key={i}>{p}</p>
                          ))}
                        </div>
                      )}

                      {analysisData.composite.challengePanel && (
                        <div className="analysis-text-panel challenge">
                          <h5>Growth Challenges</h5>
                          {analysisData.composite.challengePanel.split('\n').map((p, i) => (
                            p.trim() && <p key={i}>{p}</p>
                          ))}
                        </div>
                      )}

                      {analysisData.composite.synthesisPanel && (
                        <div className="analysis-text-panel synthesis">
                          <h5>Synthesis</h5>
                          {analysisData.composite.synthesisPanel.split('\n').map((p, i) => (
                            p.trim() && <p key={i}>{p}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AnalysisTab;
