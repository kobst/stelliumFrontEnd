import React, { useState } from 'react';
import './TopicTensionFlowAnalysis.css';

const TopicTensionFlowAnalysis = ({ topicData, topicTitle }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [hoveredQuadrant, setHoveredQuadrant] = useState(null);

  if (!topicData?.tensionFlow) {
    return null;
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
    description
  } = topicData.tensionFlow;

  // Get quadrant info for individual topics
  const getTopicQuadrantInfo = (quadrant) => {
    switch (quadrant) {
      case 'Easy-going':
        return { 
          color: '#10b981', 
          icon: '✨', 
          bg: 'rgba(16, 185, 129, 0.1)',
          emotionalTitle: 'This life area flows with natural ease and grace',
          description: 'Your planetary energies work harmoniously in this area with minimal internal conflict'
        };
      case 'Dynamic':
        return { 
          color: '#f59e0b', 
          icon: '⚡', 
          bg: 'rgba(245, 158, 11, 0.1)',
          emotionalTitle: 'This life area pulses with transformative energy',
          description: 'You have both supportive flow and constructive tension that drives personal growth'
        };
      case 'Hot-button':
        return { 
          color: '#ef4444', 
          icon: '🔥', 
          bg: 'rgba(239, 68, 68, 0.1)',
          emotionalTitle: 'This life area burns with intense personal transformation',
          description: 'Significant challenges create opportunities for breakthrough achievements through conscious effort'
        };
      case 'Flat':
        return { 
          color: '#6b7280', 
          icon: '🌊', 
          bg: 'rgba(107, 114, 128, 0.1)',
          emotionalTitle: 'This life area flows with steady, quiet energy',
          description: 'Your planetary influences are gentle and balanced, though may need activation for growth'
        };
      default:
        return { 
          color: '#8b5cf6', 
          icon: '💫', 
          bg: 'rgba(139, 92, 246, 0.1)',
          emotionalTitle: 'This life area has a unique energetic pattern',
          description: 'Your planetary dynamics create a distinctive flow in this area'
        };
    }
  };

  const quadrantInfo = getTopicQuadrantInfo(quadrant);

  // Calculate normalized positions for mini quadrant display
  // Ensure we have valid density values and normalize them properly
  const validSD = Math.max(0, supportDensity || 0);
  const validCD = Math.max(0, challengeDensity || 0);
  
  // Use dynamic scaling based on actual data range for better positioning
  const maxSD = Math.max(1.5, validSD); // Ensure minimum scale for visibility
  const maxCD = Math.max(1.0, validCD); // Ensure minimum scale for visibility
  
  let normalizedSD = Math.min(validSD / maxSD, 1);
  let normalizedCD = Math.min(validCD / maxCD, 1);
  
  // Use quadrant-based positioning for visual clarity, with some data influence
  let finalSD, finalCD;
  
  switch (quadrant) {
    case 'Easy-going':
      finalSD = 0.75 + (normalizedSD * 0.15); // 75-90% range
      finalCD = 0.15 + (normalizedCD * 0.15); // 15-30% range
      break;
    case 'Dynamic':
      finalSD = 0.75 + (normalizedSD * 0.15); // 75-90% range
      finalCD = 0.75 + (normalizedCD * 0.15); // 75-90% range
      break;
    case 'Hot-button':
      finalSD = 0.15 + (normalizedSD * 0.15); // 15-30% range
      finalCD = 0.75 + (normalizedCD * 0.15); // 75-90% range
      break;
    case 'Flat':
      finalSD = 0.15 + (normalizedSD * 0.15); // 15-30% range
      finalCD = 0.15 + (normalizedCD * 0.15); // 15-30% range
      break;
    default:
      finalSD = 0.4 + (normalizedSD * 0.2); // 40-60% range
      finalCD = 0.4 + (normalizedCD * 0.2); // 40-60% range
  }
  
  // Add some randomization based on topic title for visual separation
  const topicHash = topicTitle.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const randomOffsetX = ((topicHash % 200) - 100) / 2000; // -0.05 to +0.05
  const randomOffsetY = (((topicHash * 7) % 200) - 100) / 2000; // -0.05 to +0.05
  
  normalizedSD = Math.max(0.1, Math.min(0.9, finalSD + randomOffsetX));
  normalizedCD = Math.max(0.1, Math.min(0.9, finalCD + randomOffsetY));
  
  console.log('Topic positioning debug:', {
    topicTitle,
    quadrant,
    supportDensity,
    challengeDensity,
    finalSD: normalizedSD,
    finalCD: normalizedCD
  });

  // Get user-friendly descriptions
  const getSupportLevel = (density) => {
    if (density >= 1.5) return { level: 'Very High', desc: 'Exceptional natural flow' };
    if (density >= 1.0) return { level: 'High', desc: 'Strong supportive energy' };
    if (density >= 0.5) return { level: 'Moderate', desc: 'Balanced supportive flow' };
    if (density >= 0.2) return { level: 'Low', desc: 'Gentle supportive energy' };
    return { level: 'Very Low', desc: 'Minimal supportive activation' };
  };

  const getTensionLevel = (density) => {
    if (density >= 1.5) return { level: 'Very High', desc: 'Intense transformation pressure' };
    if (density >= 1.0) return { level: 'High', desc: 'Strong growth activation' };
    if (density >= 0.5) return { level: 'Moderate', desc: 'Healthy transformative tension' };
    if (density >= 0.2) return { level: 'Low', desc: 'Gentle growth challenges' };
    return { level: 'Very Low', desc: 'Minimal tension or pressure' };
  };

  const getBalanceDescription = (ratio) => {
    if (ratio >= 5) return 'Overwhelmingly supportive';
    if (ratio >= 2) return 'Predominantly supportive';
    if (ratio >= 1) return 'Balanced dynamics';
    if (ratio >= 0.5) return 'More challenging than supportive';
    return 'Predominantly challenging';
  };

  const supportLevel = getSupportLevel(supportDensity);
  const tensionLevel = getTensionLevel(challengeDensity);
  const balanceDesc = getBalanceDescription(polarityRatio);

  // Format aspect codes for display
  const formatAspectCode = (code) => {
    // Extract planet names and aspect type from codes like 'A-SasTa09EaSqUrsAq06'
    const match = code.match(/A-(\w{3})(\w{2})(\d{2})(\w{2})(\w{2})(\w{3})(\w{2})(\d{2})/);
    if (match) {
      const [, planet1, sign1, house1, orb, aspect, planet2, sign2, house2] = match;
      
      const planetNames = {
        'Sus': 'Sun', 'Mos': 'Moon', 'Mes': 'Mercury', 'Ves': 'Venus', 'Mas': 'Mars',
        'Jus': 'Jupiter', 'Sas': 'Saturn', 'Urs': 'Uranus', 'Nes': 'Neptune', 'Pls': 'Pluto'
      };
      
      const aspectNames = {
        'Co': 'conjunction', 'Op': 'opposition', 'Tr': 'trine', 'Sq': 'square', 
        'Sx': 'sextile', 'Qu': 'quincunx'
      };
      
      const p1 = planetNames[planet1] || planet1;
      const p2 = planetNames[planet2] || planet2;
      const aspectName = aspectNames[aspect] || aspect;
      
      return `${p1} ${aspectName} ${p2}`;
    }
    return code;
  };

  const getAspectInsight = (aspectType, score) => {
    const isSupport = score > 0;
    const insights = {
      'Sq': isSupport ? 'creates dynamic tension that builds inner strength' : 'brings intense friction requiring conscious integration',
      'Co': isSupport ? 'creates powerful unified energy' : 'can create overwhelming intensity',
      'Op': isSupport ? 'offers balancing awareness and perspective' : 'creates internal polarization requiring integration',
      'Tr': isSupport ? 'flows effortlessly with natural harmony' : 'may create complacency without growth',
      'Sx': isSupport ? 'brings easy opportunities for growth' : 'offers gentle challenges for development',
      'Qu': isSupport ? 'creates unique creative solutions' : 'brings subtle but persistent adjustment needs'
    };
    
    return insights[aspectType] || (isSupport ? 'supports your growth in this area' : 'challenges you to grow in this area');
  };

  return (
    <div className="topic-tension-flow">
      <div className="topic-header">
        <h4>⚡ Energy Pattern: {topicTitle}</h4>
        <div className="topic-quadrant-badge" style={{ backgroundColor: quadrantInfo.bg, borderColor: quadrantInfo.color }}>
          <span className="quadrant-icon">{quadrantInfo.icon}</span>
          <span className="quadrant-name" style={{ color: quadrantInfo.color }}>{quadrant}</span>
        </div>
      </div>

      {/* Mini Quadrant Matrix */}
      <div className="mini-quadrant-matrix">
        <div className="mini-matrix-container">
          <div className="mini-matrix-plot">
            <div className="mini-matrix-grid">
              {/* Quadrant backgrounds */}
              <div className="mini-quadrant-bg easy-going" 
                   onMouseEnter={() => setHoveredQuadrant('Easy-going')}
                   onMouseLeave={() => setHoveredQuadrant(null)}>
                <span className="mini-quadrant-label">✨</span>
              </div>
              <div className="mini-quadrant-bg dynamic" 
                   onMouseEnter={() => setHoveredQuadrant('Dynamic')}
                   onMouseLeave={() => setHoveredQuadrant(null)}>
                <span className="mini-quadrant-label">⚡</span>
              </div>
              <div className="mini-quadrant-bg flat" 
                   onMouseEnter={() => setHoveredQuadrant('Flat')}
                   onMouseLeave={() => setHoveredQuadrant(null)}>
                <span className="mini-quadrant-label">🌊</span>
              </div>
              <div className="mini-quadrant-bg hot-button" 
                   onMouseEnter={() => setHoveredQuadrant('Hot-button')}
                   onMouseLeave={() => setHoveredQuadrant(null)}>
                <span className="mini-quadrant-label">🔥</span>
              </div>
              
              {/* Topic marker */}
              <div 
                className="topic-marker" 
                style={{ 
                  left: `${normalizedSD * 100}%`, 
                  top: `${(1 - normalizedCD) * 100}%`, // Invert CD so high challenge is at top
                  backgroundColor: quadrantInfo.color
                }}
                title={`${topicTitle} is in the ${quadrant} quadrant (SD: ${normalizedSD.toFixed(2)}, CD: ${normalizedCD.toFixed(2)})`}
              >
                <span className="topic-marker-icon">{quadrantInfo.icon}</span>
              </div>
            </div>
          </div>
          
          {hoveredQuadrant && (
            <div className="mini-quadrant-tooltip">
              <strong>{hoveredQuadrant}</strong>: {getTopicQuadrantInfo(hoveredQuadrant).description}
            </div>
          )}
        </div>
      </div>

      {/* Emotional Description */}
      <div className="topic-emotional-description">
        <p style={{ color: quadrantInfo.color }}>
          <strong>{quadrantInfo.emotionalTitle}</strong>
        </p>
        <p>{description}</p>
      </div>

      {/* Compact Metrics */}
      <div className="topic-metrics">
        <div className="topic-metric-item">
          <span className="metric-icon">🌿</span>
          <span className="metric-text">
            <strong>Support:</strong> {supportLevel.level}
            {showTechnicalDetails && <span className="tech-detail"> ({supportDensity?.toFixed(2)})</span>}
          </span>
        </div>
        
        <div className="topic-metric-item">
          <span className="metric-icon">🔥</span>
          <span className="metric-text">
            <strong>Tension:</strong> {tensionLevel.level}
            {showTechnicalDetails && <span className="tech-detail"> ({challengeDensity?.toFixed(2)})</span>}
          </span>
        </div>
        
        <div className="topic-metric-item">
          <span className="metric-icon">⚖️</span>
          <span className="metric-text">
            <strong>Balance:</strong> {balanceDesc}
            {showTechnicalDetails && <span className="tech-detail"> ({polarityRatio?.toFixed(1)})</span>}
          </span>
        </div>
      </div>

      {/* Compact Aspect Breakdown */}
      <div className="topic-aspect-breakdown">
        <div className="aspect-summary">
          <span className="aspect-count total">{totalAspects}</span>
          <span className="aspect-label">Total Aspects</span>
        </div>
        <div className="aspect-bars">
          <div className="aspect-bar support" style={{ width: `${(supportAspects / totalAspects) * 100}%` }}>
            <span className="aspect-bar-label">🌱 {supportAspects}</span>
          </div>
          <div className="aspect-bar challenge" style={{ width: `${(challengeAspects / totalAspects) * 100}%` }}>
            <span className="aspect-bar-label">🔥 {challengeAspects}</span>
          </div>
        </div>
      </div>

      {/* Keystone Aspects */}
      {keystoneAspects && keystoneAspects.length > 0 && (
        <div className="topic-keystone-aspects">
          <h5>🔑 Key Planetary Influences</h5>
          <div className="keystone-compact-list">
            {keystoneAspects.slice(0, 3).map((aspect, index) => (
              <div key={index} className="keystone-compact-item">
                <div className="keystone-compact-header">
                  <span className={`keystone-compact-icon ${aspect.score > 0 ? 'support' : 'challenge'}`}>
                    {aspect.score > 0 ? '💚' : '🔥'}
                  </span>
                  <span className="keystone-compact-title">
                    {formatAspectCode(aspect.code)}
                  </span>
                </div>
                <div className="keystone-compact-insight">
                  This {getAspectInsight(aspect.aspectType, aspect.score)}.
                </div>
                {showTechnicalDetails && (
                  <div className="keystone-compact-tech">
                    <span>Score: {aspect.score}</span> | <span>Type: {aspect.aspectType}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Toggle */}
      <button 
        className="topic-technical-toggle"
        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
      >
        {showTechnicalDetails ? '📊 Hide Details' : '📊 Show Details'}
      </button>
    </div>
  );
};

export default TopicTensionFlowAnalysis;