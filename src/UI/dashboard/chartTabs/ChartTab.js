import React, { useState } from 'react';
import BirthChartSummaryTable from '../../birthChart/tables/BirthChartSummaryTable';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import './ChartTab.css';

function ChartTab({ birthChart, chartId }) {
  const [chatOpen, setChatOpen] = useState(false);
  const planets = birthChart?.planets || [];
  const houses = birthChart?.houses || [];
  const aspects = birthChart?.aspects || [];

  if (!planets.length) {
    return (
      <div className="chart-tab">
        <div className="chart-tab-empty">
          <p>Birth chart data not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-tab">
      <div className="chart-section-header">
        <h2 className="chart-section-title">Chart</h2>
        <button
          className="ask-stellium-trigger"
          onClick={() => setChatOpen(true)}
        >
          <span className="ask-stellium-trigger__icon">&#10024;</span>
          Ask Stellium
        </button>
      </div>
      <BirthChartSummaryTable
        planets={planets}
        houses={houses}
        aspects={aspects}
      />
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

export default ChartTab;
