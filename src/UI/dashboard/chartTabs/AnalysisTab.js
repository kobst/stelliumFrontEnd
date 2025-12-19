import React, { useState } from 'react';
import './ChartTabs.css';

// Category display names and icons
const categoryMeta = {
  'PERSONALITY_IDENTITY': { name: 'Personality & Identity', icon: '👤' },
  'EMOTIONAL_FOUNDATIONS_HOME': { name: 'Emotional Foundations & Home', icon: '🏠' },
  'RELATIONSHIPS_SOCIAL': { name: 'Relationships & Social', icon: '💞' },
  'CAREER_PURPOSE_PUBLIC_IMAGE': { name: 'Career, Purpose & Public Image', icon: '🎯' },
  'UNCONSCIOUS_SPIRITUALITY': { name: 'Unconscious & Spirituality', icon: '🔮' },
  'COMMUNICATION_BELIEFS': { name: 'Communication & Beliefs', icon: '💬' }
};

function AnalysisTab({ broadCategoryAnalyses, analysisStatus, onStartAnalysis }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubtopic, setExpandedSubtopic] = useState(null);

  const isAnalysisComplete = analysisStatus?.completed ||
    (broadCategoryAnalyses && Object.keys(broadCategoryAnalyses).length > 0);

  const isAnalysisInProgress = analysisStatus?.status === 'in_progress';
  const completedTasks = analysisStatus?.failures?.completedTasks || 0;
  const totalTasks = analysisStatus?.failures?.totalTasks || 86;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const toggleCategory = (categoryKey) => {
    setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
    setExpandedSubtopic(null);
  };

  const toggleSubtopic = (subtopicKey, e) => {
    e.stopPropagation();
    setExpandedSubtopic(expandedSubtopic === subtopicKey ? null : subtopicKey);
  };

  // Render subtopics for a category
  const renderSubtopics = (category, categoryKey) => {
    // Prefer editedSubtopics over subtopics
    const subtopics = category.editedSubtopics || category.subtopics || {};
    const subtopicKeys = Object.keys(subtopics);

    if (subtopicKeys.length === 0) return null;

    return (
      <div className="category-subtopics">
        {subtopicKeys.map((subtopicKey) => {
          const subtopic = subtopics[subtopicKey];
          const fullKey = `${categoryKey}-${subtopicKey}`;
          const isSubExpanded = expandedSubtopic === fullKey;

          // Handle both string and object subtopic values
          const content = typeof subtopic === 'string'
            ? subtopic
            : subtopic?.analysis || subtopic?.text || '';

          return (
            <div
              key={subtopicKey}
              className={`subtopic-item ${isSubExpanded ? 'expanded' : ''}`}
              onClick={(e) => toggleSubtopic(fullKey, e)}
            >
              <div className="subtopic-header">
                <span className="subtopic-name">{formatSubtopicName(subtopicKey)}</span>
                <span className={`expand-icon ${isSubExpanded ? 'expanded' : ''}`}>▼</span>
              </div>
              {isSubExpanded && content && (
                <div className="subtopic-content">
                  {content.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Format subtopic name from key
  const formatSubtopicName = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Render the start analysis prompt
  if (!isAnalysisComplete && !isAnalysisInProgress) {
    return (
      <div className="chart-tab-content analysis-tab">
        <div className="analysis-prompt">
          <div className="prompt-icon">◎</div>
          <h3>360° Analysis</h3>
          <p>Generate a comprehensive AI-powered analysis of your birth chart across 6 life categories.</p>
          <p className="prompt-note">This analysis includes ~86 detailed interpretations and may take a few minutes.</p>
          <button className="start-analysis-button" onClick={onStartAnalysis}>
            Start 360° Analysis
          </button>
        </div>
      </div>
    );
  }

  // Render progress if analysis is in progress
  if (isAnalysisInProgress && !isAnalysisComplete) {
    return (
      <div className="chart-tab-content analysis-tab">
        <div className="analysis-progress">
          <div className="progress-spinner"></div>
          <h3>Generating Analysis...</h3>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="progress-text">{completedTasks} of {totalTasks} tasks completed ({progressPercent}%)</p>
          <p className="progress-note">This may take a few minutes. Please don't close this page.</p>
        </div>
      </div>
    );
  }

  // Render categories
  const categories = broadCategoryAnalyses || {};
  const categoryKeys = Object.keys(categories);

  if (categoryKeys.length === 0) {
    return (
      <div className="chart-tab-empty">
        <h3>360° Analysis</h3>
        <p>No analysis data available yet.</p>
      </div>
    );
  }

  return (
    <div className="chart-tab-content analysis-tab">
      <div className="categories-list">
        {categoryKeys.map((categoryKey) => {
          const category = categories[categoryKey];
          const meta = categoryMeta[categoryKey] || { name: formatSubtopicName(categoryKey), icon: '📊' };
          const isExpanded = expandedCategory === categoryKey;

          return (
            <div
              key={categoryKey}
              className={`category-card ${isExpanded ? 'expanded' : ''}`}
            >
              <div
                className="category-header"
                onClick={() => toggleCategory(categoryKey)}
              >
                <span className="category-icon">{meta.icon}</span>
                <span className="category-name">{meta.name}</span>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
              </div>

              {isExpanded && (
                <div className="category-content">
                  {category.overview && (
                    <div className="category-overview">
                      {category.overview.split('\n').map((paragraph, idx) => (
                        paragraph.trim() && <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {renderSubtopics(category, categoryKey)}

                  {category.synthesis && (
                    <div className="category-synthesis">
                      <h4>Synthesis</h4>
                      {category.synthesis.split('\n').map((paragraph, idx) => (
                        paragraph.trim() && <p key={idx}>{paragraph}</p>
                      ))}
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
