import React, { useState } from 'react';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './ChartTabs.css';

function OverviewTab({ basicAnalysis, chartId, birthChart }) {
  const [chatOpen, setChatOpen] = useState(false);
  // If no overview data
  if (!basicAnalysis?.overview) {
    return (
      <div className="chart-tab-empty">
        <h3>Overview</h3>
        <p>No overview data available yet.</p>
      </div>
    );
  }

  return (
    <div className="chart-tab-content overview-tab">
      <div className="overview-section">
        <div className="overview-section-header">
          <h3 className="overview-section-title">Overview</h3>
          <div
            className="overview-gradient-icon overview-gradient-icon--clickable"
            onClick={() => setChatOpen(true)}
            title="Ask Stellium"
          />
        </div>
        <div className="overview-text">
          {basicAnalysis.overview.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <AskStelliumPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        contentType="birthchart"
        contentId={chartId}
        birthChart={birthChart}
        contextLabel="About your birth chart"
        placeholderText="Ask about your birth chart..."
        suggestedQuestions={[
          "What are my greatest strengths?",
          "How does my Moon sign affect my emotions?",
          "What should I focus on for personal growth?"
        ]}
      />
    </div>
  );
}

export default OverviewTab;
