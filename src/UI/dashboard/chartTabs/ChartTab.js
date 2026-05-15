import React, { useState } from 'react';
import BirthChartSummaryTable from '../../birthChart/tables/BirthChartSummaryTable';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import AskStelliumCta from './AskStelliumCta';
import './ChartTab.css';

function ChartTab({ birthChart, chartId, isCelebrity = false, canUseAskStellium = false }) {
  const [chatOpen, setChatOpen] = useState(false);
  const planets = birthChart?.planets || [];
  const houses = birthChart?.houses || [];
  const aspects = birthChart?.aspects || [];

  if (!planets.length) {
    return (
      <div className="chart-tab">
        <div className="bcd-empty">Birth chart data not available.</div>
      </div>
    );
  }

  return (
    <div className="chart-tab">
      <BirthChartSummaryTable
        planets={planets}
        houses={houses}
        aspects={aspects}
      />

      {!isCelebrity && (
        <div style={{ marginTop: 24 }}>
          <AskStelliumCta
            hasFullAccess={canUseAskStellium}
            onActivate={() => setChatOpen(true)}
          />
        </div>
      )}

      {!isCelebrity && canUseAskStellium && (
        <AskStelliumPanel
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          contentType="birthchart"
          contentId={chartId}
          birthChart={birthChart}
          contextLabel="About your birth chart"
          placeholderText="Ask about your birth chart..."
          suggestedQuestions={[
            'What are my greatest strengths?',
            'How does my Moon sign affect my emotions?',
            'What should I focus on for personal growth?'
          ]}
        />
      )}
    </div>
  );
}

export default ChartTab;
