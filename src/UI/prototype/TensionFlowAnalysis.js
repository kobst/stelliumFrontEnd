import React, { useState } from 'react';
import './TensionFlowAnalysis.css';

const TensionFlowAnalysis = ({ tensionFlowAnalysis }) => {
  const [hoveredQuadrant, setHoveredQuadrant] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

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

  // Get quadrant styles and emotional descriptions
  const getQuadrantInfo = (quadrant) => {
    switch (quadrant) {
      case 'Easy-going':
        return { 
          color: '#10b981', 
          icon: '😌', 
          bg: 'rgba(16, 185, 129, 0.1)',
          emotionalTitle: 'This relationship flows with ease and emotional comfort',
          description: 'Your connection naturally supports each other with minimal conflict'
        };
      case 'Dynamic':
        return { 
          color: '#f59e0b', 
          icon: '⚡', 
          bg: 'rgba(245, 158, 11, 0.1)',
          emotionalTitle: 'This relationship sparkles with passionate energy and growth',
          description: 'You have both strong support and constructive tension that drives evolution'
        };
      case 'Hot-button':
        return { 
          color: '#ef4444', 
          icon: '🔥', 
          bg: 'rgba(239, 68, 68, 0.1)',
          emotionalTitle: 'This relationship burns with intense emotions and transformation',
          description: 'Your connection brings significant challenges that require conscious effort to harmonize'
        };
      case 'Flat':
        return { 
          color: '#6b7280', 
          icon: '😐', 
          bg: 'rgba(107, 114, 128, 0.1)',
          emotionalTitle: 'This relationship feels calm and steady with gentle energy',
          description: 'Your connection is peaceful but may lack deep emotional activation'
        };
      default:
        return { 
          color: '#8b5cf6', 
          icon: '❓', 
          bg: 'rgba(139, 92, 246, 0.1)',
          emotionalTitle: 'Your relationship dynamic is unique',
          description: 'Analyzing your connection pattern...'
        };
    }
  };

  const quadrantInfo = getQuadrantInfo(quadrant);

  // Calculate normalized positions for quadrant matrix (0-1 scale)
  const normalizedSD = Math.min(supportDensity / 5, 1); // Normalize assuming max 5
  const normalizedCD = Math.min(challengeDensity / 2, 1); // Normalize assuming max 2

  // Get user-friendly metric descriptions
  const getSupportLevel = (density) => {
    if (density >= 2.5) return { level: 'Very High', desc: 'Exceptional mutual flow' };
    if (density >= 1.5) return { level: 'High', desc: 'Strong mutual flow' };
    if (density >= 0.8) return { level: 'Moderate', desc: 'Balanced connection' };
    if (density >= 0.3) return { level: 'Low', desc: 'Gentle connection' };
    return { level: 'Very Low', desc: 'Minimal activation' };
  };

  const getTensionLevel = (density) => {
    if (density >= 1.5) return { level: 'Very High', desc: 'Intense transformation' };
    if (density >= 1.0) return { level: 'High', desc: 'Strong activation' };
    if (density >= 0.5) return { level: 'Moderate', desc: 'Healthy tension' };
    if (density >= 0.1) return { level: 'Low', desc: 'Minimal conflict' };
    return { level: 'Very Low', desc: 'Extremely peaceful' };
  };

  const getBalanceDescription = (ratio) => {
    if (ratio >= 20) return 'Overwhelmingly supportive';
    if (ratio >= 10) return 'Very supportive overall';
    if (ratio >= 5) return 'Predominantly supportive';
    if (ratio >= 2) return 'More supportive than challenging';
    if (ratio >= 1) return 'Balanced dynamics';
    return 'More challenging than supportive';
  };

  const supportLevel = getSupportLevel(supportDensity);
  const tensionLevel = getTensionLevel(challengeDensity);
  const balanceDesc = getBalanceDescription(polarityRatio);

  // Simplify keystone aspect descriptions
  const simplifyAspectDescription = (description) => {
    // Extract names and aspect type
    const match = description.match(/(\w+)'s (\w+).*?is.*?(\w+)\s+(\w+)'s (\w+)/);
    if (match) {
      const [, name1, planet1, aspectType, name2, planet2] = match;
      return `${name1}'s ${planet1} ${aspectType}s ${name2}'s ${planet2}`;
    }
    return description;
  };

  const getAspectInsight = (aspectType, edgeType) => {
    const insights = {
      conjunction: {
        support: 'creates powerful unity and shared energy',
        challenge: 'can be overwhelming but transformative'
      },
      sextile: {
        support: 'brings easy harmony and natural flow',
        challenge: 'offers gentle growth opportunities'
      },
      trine: {
        support: 'flows effortlessly with natural understanding',
        challenge: 'can become too comfortable without growth'
      },
      square: {
        support: 'creates dynamic tension that builds strength',
        challenge: 'brings intense friction that demands growth'
      },
      opposition: {
        support: 'offers complementary balance and awareness',
        challenge: 'creates polarizing tension requiring integration'
      }
    };
    
    return insights[aspectType.toLowerCase()]?.[edgeType] || 'influences your connection in unique ways';
  };

  return (
    <div className="tension-flow-analysis">
      <h3 className="tension-flow-title">⚖️ Your Relationship Dynamic</h3>
      
      {/* Quadrant Matrix Visualization */}
      <div className="quadrant-matrix">
        <h4>💞 {quadrantInfo.emotionalTitle}</h4>
        <div className="matrix-container">
          <div className="matrix-plot">
            <div className="matrix-axes">
              <div className="y-axis-label">Challenge Density</div>
              <div className="x-axis-label">Support Density</div>
            </div>
            <div className="matrix-grid">
              {/* Quadrant backgrounds */}
              <div className="quadrant-bg easy-going" 
                   onMouseEnter={() => setHoveredQuadrant('Easy-going')}
                   onMouseLeave={() => setHoveredQuadrant(null)}>
                <span className="quadrant-label">😌 Easy-going</span>
              </div>
              <div className="quadrant-bg dynamic" 
                   onMouseEnter={() => setHoveredQuadrant('Dynamic')}
                   onMouseLeave={() => setHoveredQuadrant(null)}>
                <span className="quadrant-label">⚡ Dynamic</span>
              </div>
              <div className="quadrant-bg flat" 
                   onMouseEnter={() => setHoveredQuadrant('Flat')}
                   onMouseLeave={() => setHoveredQuadrant(null)}>
                <span className="quadrant-label">😐 Flat</span>
              </div>
              <div className="quadrant-bg hot-button" 
                   onMouseEnter={() => setHoveredQuadrant('Hot-button')}
                   onMouseLeave={() => setHoveredQuadrant(null)}>
                <span className="quadrant-label">🔥 Hot-button</span>
              </div>
              
              {/* Relationship marker */}
              <div 
                className="relationship-marker" 
                style={{ 
                  left: `${normalizedSD * 100}%`, 
                  bottom: `${normalizedCD * 100}%`,
                  backgroundColor: quadrantInfo.color
                }}
                title={`This relationship is in the ${quadrant} quadrant: ${quadrantInfo.description}`}
              >
                <span className="marker-icon">{quadrantInfo.icon}</span>
              </div>
            </div>
          </div>
          
          {hoveredQuadrant && (
            <div className="quadrant-tooltip">
              <strong>{hoveredQuadrant}</strong>: {getQuadrantInfo(hoveredQuadrant).description}
            </div>
          )}
        </div>
      </div>

      {/* Emotional Description */}
      <div className="emotional-description" style={{ backgroundColor: quadrantInfo.bg, borderColor: quadrantInfo.color }}>
        <p>{quadrantInfo.description}</p>
      </div>

      {/* User-Friendly Metrics */}
      <div className="friendly-metrics">
        <div className="metric-card">
          <div className="metric-icon">🌿</div>
          <div className="metric-content">
            <div className="metric-title">Support Level: {supportLevel.level}</div>
            <div className="metric-description">{supportLevel.desc}</div>
            {showTechnicalDetails && (
              <div className="technical-detail">Density: {supportDensity?.toFixed(2)}</div>
            )}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <div className="metric-title">Tension Level: {tensionLevel.level}</div>
            <div className="metric-description">{tensionLevel.desc}</div>
            {showTechnicalDetails && (
              <div className="technical-detail">Density: {challengeDensity?.toFixed(2)}</div>
            )}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">⚖️</div>
          <div className="metric-content">
            <div className="metric-title">Balance: {balanceDesc}</div>
            <div className="metric-description">{Math.round(polarityRatio)}× more supportive than challenging</div>
            {showTechnicalDetails && (
              <div className="technical-detail">Ratio: {polarityRatio?.toFixed(1)}</div>
            )}
          </div>
        </div>
        
        <button 
          className="technical-toggle"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        >
          {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
        </button>
      </div>

      {/* Recommendations */}
      {insight?.recommendations && (
        <div className="quadrant-recommendations">
          <h5>💡 Guidance for Your Connection</h5>
          <ul>
            {insight.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Humanized Network Overview */}
      <div className="network-overview">
        <h4>🧩 Your Planetary Connection Map</h4>
        <div className="network-summary">
          <p>You share <strong>{totalAspects} planetary connections</strong> —</p>
          <div className="connection-breakdown">
            <div className="connection-item">
              <span className="connection-icon">🌱</span>
              <span className="connection-text">
                <strong>{supportAspects}</strong> support your flow together
              </span>
            </div>
            <div className="connection-item">
              <span className="connection-icon">🔥</span>
              <span className="connection-text">
                <strong>{challengeAspects}</strong> bring healthy tension
              </span>
            </div>
            <div className="connection-item">
              <span className="connection-icon">🌘</span>
              <span className="connection-text">
                <strong>{totalAspects - supportAspects - challengeAspects}</strong> are neutral or subtle influences
              </span>
            </div>
          </div>
          <div className="connection-density">
            <div className="density-bar">
              <div className="density-fill" style={{ width: `${(networkMetrics?.connectionDensity * 100) || 0}%` }}></div>
            </div>
            <span className="density-label">
              {(networkMetrics?.connectionDensity * 100)?.toFixed(1)}% of all possible connections are active
            </span>
          </div>
        </div>
      </div>

      {/* Narrative Keystone Aspects */}
      {keystoneAspects && keystoneAspects.length > 0 && (
        <div className="keystone-aspects">
          <h4>🌟 Your Most Influential Connections</h4>
          <p className="keystone-description">
            These planetary connections have the strongest influence on your relationship dynamic:
          </p>
          
          <div className="keystone-list">
            {keystoneAspects.slice(0, 5).map((aspect, index) => (
              <div key={index} className="keystone-aspect">
                <div className="keystone-header">
                  <span className="keystone-rank">#{index + 1}</span>
                  <span className={`keystone-edge ${aspect.edgeType}`}>
                    {aspect.edgeType === 'support' ? '💚' : '🔥'}
                  </span>
                  <div className="influence-bar">
                    <div 
                      className="influence-fill" 
                      style={{ width: `${Math.min((aspect.betweenness / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="keystone-details">
                  <div className="keystone-title">
                    {simplifyAspectDescription(aspect.description)}
                  </div>
                  <div className="keystone-insight">
                    This {getAspectInsight(aspect.aspectType, aspect.edgeType)}.
                  </div>
                  
                  {showTechnicalDetails && (
                    <div className="technical-details">
                      <span className="technical-metric">
                        <strong>Centrality:</strong> {aspect.betweenness?.toFixed(1)}
                      </span>
                      <span className="technical-metric">
                        <strong>Score:</strong> {aspect.score}
                      </span>
                      <span className="technical-metric">
                        <strong>Type:</strong> {aspect.aspectType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Balance Bar */}
      <div className="balance-visualization">
        <h4>⚖️ Your Energy Balance</h4>
        <div className="balance-container">
          <div className="balance-bar">
            <div 
              className="balance-segment support" 
              style={{ width: `${(supportAspects / totalAspects) * 100}%` }}
              title="Supportive aspects like trines and sextiles create easy flow and harmony"
            >
              <span className="balance-label">🌱 Support ({supportAspects})</span>
            </div>
            <div 
              className="balance-segment challenge" 
              style={{ width: `${(challengeAspects / totalAspects) * 100}%` }}
              title="Challenge aspects like squares and oppositions bring growth through tension"
            >
              <span className="balance-label">🔥 Challenge ({challengeAspects})</span>
            </div>
            <div 
              className="balance-segment neutral" 
              style={{ width: `${((totalAspects - supportAspects - challengeAspects) / totalAspects) * 100}%` }}
              title="Neutral aspects provide subtle background influences"
            >
              <span className="balance-label">🌘 Neutral ({totalAspects - supportAspects - challengeAspects})</span>
            </div>
          </div>
          <div className="balance-legend">
            <div className="legend-item">
              <span className="legend-color support"></span>
              <span className="legend-text">🌱 Support aspects create natural flow and ease</span>
            </div>
            <div className="legend-item">
              <span className="legend-color challenge"></span>
              <span className="legend-text">🔥 Challenge aspects spark growth and transformation</span>
            </div>
            <div className="legend-item">
              <span className="legend-color neutral"></span>
              <span className="legend-text">🌘 Neutral aspects provide subtle background energy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TensionFlowAnalysis;