import React, { useState } from 'react';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import AskStelliumCta from './AskStelliumCta';
import './ChartTabs.css';

function OverviewTab({ basicAnalysis, chartId, birthChart, isCelebrity, canUseAskStellium = false }) {
  const [chatOpen, setChatOpen] = useState(false);

  const overview = basicAnalysis?.overview;

  if (!overview) {
    return (
      <div className="chart-tab-content overview-tab">
        <div className="bcd-empty">No overview reading available yet.</div>
      </div>
    );
  }

  const paragraphs = overview
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="chart-tab-content overview-tab">
      <article className="bcd-reading">
        <div className="bcd-reading__quote">“</div>
        <div className="bcd-reading__label-row">
          <div className="bcd-eyebrow gold">The Reading</div>
          <div className="bcd-reading__minutes">
            {Math.max(1, Math.ceil(overview.split(/\s+/).length / 200))} MIN READ
          </div>
        </div>
        <div className="bcd-reading__body">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>

      {!isCelebrity && (
        <div style={{ marginTop: 24 }}>
          <AskStelliumCta
            hasFullAccess={canUseAskStellium}
            onActivate={() => setChatOpen(prev => !prev)}
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

export default OverviewTab;
