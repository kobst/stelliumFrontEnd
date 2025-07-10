import React from 'react';
import './TensionFlowAnalysis.css';

const TensionFlowAnalysis = ({ tensionFlowAnalysis }) => {
  if (!tensionFlowAnalysis) {
    return (
      <div className="tension-flow-placeholder">
        <h3>Tension Flow Analysis</h3>
        <p>Analysis not available yet.</p>
      </div>
    );
  }

  const {
    supportDensity,
    challengeDensity,
    polarityRatio,
    quadrant,
    totalAspects,
    supportAspects,
    challengeAspects,
    keystoneAspects,
    networkMetrics,
    insight
  } = tensionFlowAnalysis;

  // Get quadrant color and icon
  const getQuadrantStyle = (quadrant) => {
    switch (quadrant) {
      case 'Easy-going':
        return { color: '#10b981', icon: '🌊', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'Dynamic':
        return { color: '#f59e0b', icon: '⚡', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'Hot-button':
        return { color: '#ef4444', icon: '🔥', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'Flat':
        return { color: '#6b7280', icon: '🌫️', bg: 'rgba(107, 114, 128, 0.1)' };
      default:
        return { color: '#8b5cf6', icon: '❓', bg: 'rgba(139, 92, 246, 0.1)' };
    }
  };

  const quadrantStyle = getQuadrantStyle(quadrant);

  return (
    <div className="tension-flow-analysis">
      <h3 className="tension-flow-title">⚖️ Tension Flow Analysis</h3>
      
      {/* Quadrant Profile Section */}
      <div className="quadrant-profile" style={{ backgroundColor: quadrantStyle.bg, borderColor: quadrantStyle.color }}>
        <div className="quadrant-header">
          <span className="quadrant-icon">{quadrantStyle.icon}</span>
          <h4 className="quadrant-name" style={{ color: quadrantStyle.color }}>
            {quadrant} Relationship
          </h4>
        </div>
        
        <div className="quadrant-description">
          <p>{insight?.description}</p>
        </div>

        <div className="quadrant-metrics">
          <div className="metric-item">
            <span className="metric-label">Support Density</span>
            <span className="metric-value support">{supportDensity?.toFixed(2)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Challenge Density</span>
            <span className="metric-value challenge">{challengeDensity?.toFixed(2)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Polarity Ratio</span>
            <span className="metric-value ratio">{polarityRatio?.toFixed(1)}</span>
          </div>
        </div>

        {/* Recommendations */}
        {insight?.recommendations && (
          <div className="quadrant-recommendations">
            <h5>💡 Recommendations</h5>
            <ul>
              {insight.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Network Overview */}
      <div className="network-overview">
        <h4>🔗 Network Overview</h4>
        <div className="network-stats">
          <div className="stat-card">
            <div className="stat-number">{totalAspects}</div>
            <div className="stat-label">Total Aspects</div>
          </div>
          <div className="stat-card support">
            <div className="stat-number">{supportAspects}</div>
            <div className="stat-label">Support Aspects</div>
          </div>
          <div className="stat-card challenge">
            <div className="stat-number">{challengeAspects}</div>
            <div className="stat-label">Challenge Aspects</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{(networkMetrics?.connectionDensity * 100)?.toFixed(1)}%</div>
            <div className="stat-label">Connection Density</div>
          </div>
        </div>
      </div>

      {/* Keystone Aspects */}
      {keystoneAspects && keystoneAspects.length > 0 && (
        <div className="keystone-aspects">
          <h4>🔑 Keystone Aspects</h4>
          <p className="keystone-description">
            These are the most influential connections in your relationship network, 
            acting as central bridges that define your dynamic together.
          </p>
          
          <div className="keystone-list">
            {keystoneAspects.slice(0, 5).map((aspect, index) => (
              <div key={index} className="keystone-aspect">
                <div className="keystone-header">
                  <span className="keystone-rank">#{index + 1}</span>
                  <span className="keystone-type">{aspect.aspectType}</span>
                  <span className={`keystone-edge ${aspect.edgeType}`}>
                    {aspect.edgeType === 'support' ? '💚' : '🔥'}
                  </span>
                </div>
                
                <div className="keystone-details">
                  <div className="keystone-description">
                    {aspect.description}
                  </div>
                  
                  <div className="keystone-metrics">
                    <span className="keystone-metric">
                      <strong>Centrality:</strong> {aspect.betweenness?.toFixed(1)}
                    </span>
                    <span className="keystone-metric">
                      <strong>Score:</strong> {aspect.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Balance Bar */}
      <div className="balance-visualization">
        <h4>⚖️ Support vs Challenge Balance</h4>
        <div className="balance-bar">
          <div className="balance-segment support" style={{ width: `${(supportAspects / totalAspects) * 100}%` }}>
            <span className="balance-label">Support ({supportAspects})</span>
          </div>
          <div className="balance-segment challenge" style={{ width: `${(challengeAspects / totalAspects) * 100}%` }}>
            <span className="balance-label">Challenge ({challengeAspects})</span>
          </div>
          <div className="balance-segment neutral" style={{ width: `${((totalAspects - supportAspects - challengeAspects) / totalAspects) * 100}%` }}>
            <span className="balance-label">Neutral ({totalAspects - supportAspects - challengeAspects})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TensionFlowAnalysis;