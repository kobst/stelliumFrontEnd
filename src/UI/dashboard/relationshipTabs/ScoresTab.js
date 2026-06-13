import React, { useState, useMemo } from 'react';
import AnalysisPromptCard from '../../shared/AnalysisPromptCard';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import AskStelliumCta from '../chartTabs/AskStelliumCta';
import { getRelationshipSummary } from '../../../Utilities/relationshipSummary';
import './RelationshipTabs.css';

const CLUSTER_ICONS = {
  Harmony: '\u{1F495}',
  Passion: '\u{1F525}',
  Connection: '\u{1F9E0}',
  Stability: '\u{1F48E}',
  Growth: '\u{1F331}'
};

const CLUSTER_DESCRIPTIONS = {
  Harmony: 'Overall compatibility and ease in the relationship',
  Passion: 'Sexual chemistry and physical attraction',
  Connection: 'Emotional and mental bonding',
  Stability: 'Long-term potential and commitment',
  Growth: 'Transformative potential and personal evolution'
};

const ORDERED_CLUSTERS = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];

function scoreBand(score) {
  if (typeof score !== 'number') return 'gold';
  if (score >= 80) return 'green';
  if (score >= 50) return 'gold';
  return 'orange';
}

function generateStardustCircles(count, seed) {
  const rng = (i, s) => {
    const x = Math.sin((i + s) * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  const circles = [];
  for (let i = 0; i < count; i += 1) {
    const cx = rng(i * 2, seed) * 100;
    const cy = rng(i * 2 + 1, seed) * 100;
    const r = rng(i * 3 + 5, seed) * 0.18 + 0.06;
    const o = rng(i * 4 + 11, seed) * 0.6 + 0.1;
    circles.push(
      <circle key={i} cx={cx.toFixed(2)} cy={cy.toFixed(2)} r={r.toFixed(2)} fill="#cabeff" opacity={o.toFixed(2)} />
    );
  }
  return circles;
}

function PentagonRadar({ scores }) {
  const cx = 300;
  const cy = 270;
  const rMax = 220;
  const offsets = [-90, -18, 54, 126, 198];

  const ringPoints = (pct) => {
    const r = (pct / 100) * rMax;
    return offsets
      .map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const dataPoints = ORDERED_CLUSTERS.map((cluster, i) => {
    const val = scores?.[cluster] ?? 0;
    const r = (val / 100) * rMax;
    const rad = (offsets[i] * Math.PI) / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    return [x, y];
  });

  const dataPolygonStr = dataPoints
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');

  const axisLabels = [
    { cluster: 'Harmony',    x: 300, y: 36,  anchor: 'middle', color: '#ff8aae', emoji: '\u{1F495}' },
    { cluster: 'Passion',    x: 535, y: 200, anchor: 'start',  color: '#ff9d6a', emoji: '\u{1F525}' },
    { cluster: 'Connection', x: 455, y: 478, anchor: 'middle', color: '#ffa6a6', emoji: '\u{1F9E0}' },
    { cluster: 'Stability',  x: 146, y: 478, anchor: 'middle', color: '#7ec9e0', emoji: '\u{1F48E}' },
    { cluster: 'Growth',     x: 65,  y: 200, anchor: 'end',    color: '#5dd6a0', emoji: '\u{1F331}' }
  ];

  return (
    <svg viewBox="0 0 600 540" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="rdRadarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#cabeff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#cabeff" stopOpacity="0.18" />
        </radialGradient>
      </defs>

      <g fill="none" stroke="rgba(202,190,255,0.18)" strokeWidth="0.8">
        <polygon points={ringPoints(25)} />
        <polygon points={ringPoints(50)} />
        <polygon points={ringPoints(75)} />
        <polygon points={ringPoints(100)} />
      </g>

      <g stroke="rgba(202,190,255,0.12)" strokeWidth="0.7">
        {offsets.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = cx + rMax * Math.cos(rad);
          const y = cy + rMax * Math.sin(rad);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} />;
        })}
      </g>

      <g fontFamily="Manrope, sans-serif" fontSize="11" fill="rgba(236,232,255,0.35)" letterSpacing="0.08em">
        <text x={cx + 6} y={cy - 50}>75%</text>
        <text x={cx + 6} y={cy - 105}>50%</text>
        <text x={cx + 6} y={cy - 160}>25%</text>
      </g>

      <polygon
        points={dataPolygonStr}
        fill="url(#rdRadarFill)"
        stroke="#cabeff"
        strokeWidth="2"
        strokeLinejoin="round"
        filter="drop-shadow(0 0 12px rgba(202,190,255,0.45))"
      />

      <g fill="#ffffff" stroke="#cabeff" strokeWidth="2">
        {dataPoints.map(([x, y], i) => (
          <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="5" />
        ))}
      </g>

      <g fontFamily="Manrope, sans-serif" fontSize="15" fill="#ece8ff">
        {axisLabels.map(({ cluster, x, y, anchor, color, emoji }) => (
          <text key={cluster} x={x} y={y} textAnchor={anchor}>
            <tspan fill={color}>{emoji} </tspan>
            {cluster}
          </text>
        ))}
      </g>
    </svg>
  );
}

function AspectLine({ description, polarity }) {
  const tone = polarity > 0 ? 'flowing' : polarity < 0 ? 'tension' : 'moon';
  if (!description) return null;
  return (
    <div className={`rd-aspect-line ${tone}`}>
      <span className="rd-aspect-line__dot" />
      <span>{description}</span>
    </div>
  );
}

function ScoresTab({
  relationship,
  hasAnalysis,
  onNavigateToAnalysis,
  creditCost,
  creditsRemaining,
  compositeId,
  isCelebrity = false,
  canUseAskStellium = false
}) {
  const [openCluster, setOpenCluster] = useState('Harmony');
  const [chatOpen, setChatOpen] = useState(false);

  const clusterAnalysis = relationship?.clusterScoring || relationship?.clusterAnalysis;
  const clusters = clusterAnalysis?.clusters;
  const overall = clusterAnalysis?.overall;
  const allScoredItems = clusterAnalysis?.scoredItems || [];
  const { label, blurb } = getRelationshipSummary(overall);

  const scoreMap = useMemo(() => {
    const out = {};
    ORDERED_CLUSTERS.forEach((c) => {
      out[c] = clusters?.[c]?.score || 0;
    });
    return out;
  }, [clusters]);

  const relationshipScoredItems =
    relationship?.scoredItems ||
    relationship?.clusterAnalysis?.scoredItems ||
    relationship?.clusterScoring?.scoredItems ||
    [];

  const chatPanel = !isCelebrity && canUseAskStellium ? (
    <AskStelliumPanel
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
      contentType="relationship"
      contentId={compositeId}
      relationshipScoredItems={relationshipScoredItems}
      contextLabel="About your relationship"
      placeholderText="Ask about your relationship..."
      suggestedQuestions={[
        'What are our relationship strengths?',
        'How can we improve our communication?',
        'What challenges should we be aware of?'
      ]}
    />
  ) : null;

  if (!clusters) {
    return (
      <div className="scores-tab-redesign">
        <div className="rd-section-head">
          <h2>Compatibility</h2>
        </div>
        <div className="rd-empty">
          Compatibility scores are not yet available for this relationship.
        </div>
        {chatPanel}
      </div>
    );
  }

  const stardust = generateStardustCircles(60, 11);

  return (
    <div className="scores-tab-redesign">
      <div className="rd-section-head">
        <h2>{label || 'Relationship Pattern'}</h2>
      </div>

      {blurb && (
        <div className="rd-score-summary">
          <div className="rd-score-summary__label">Relationship Summary</div>
          <p>{blurb}</p>
        </div>
      )}

      <div className="rd-radar-card">
        <svg className="rd-stardust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {stardust}
        </svg>
        <div className="rd-radar-wrap">
          <div className="rd-radar-wrap__halo" />
          <PentagonRadar scores={scoreMap} />
        </div>
      </div>

      <div className="rd-bars-stack">
        {ORDERED_CLUSTERS.map((cluster) => {
          const score = scoreMap[cluster];
          const band = scoreBand(score);
          const isOpen = openCluster === cluster;
          const clusterItems = allScoredItems
            .map((item) => {
              const contribution = item.clusterContributions?.find((c) => c.cluster === cluster);
              if (!contribution || contribution.score === 0) return null;
              return { ...item, clusterScore: contribution.score };
            })
            .filter(Boolean)
            .sort((a, b) => Math.abs(b.clusterScore) - Math.abs(a.clusterScore));
          const topSupport = clusterItems.find((i) => i.clusterScore > 0);
          const topChallenge = clusterItems.find((i) => i.clusterScore < 0);

          return (
            <div key={cluster} className={`rd-bar-card rd-bar-row ${band}${isOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="rd-bar-card__summary"
                onClick={() => setOpenCluster(isOpen ? null : cluster)}
                aria-expanded={isOpen}
              >
                <div className="rd-bar-row__nm">
                  <div className="rd-bar-row__ic">{CLUSTER_ICONS[cluster]}</div>
                  {cluster}
                </div>
                <div className="rd-bar-row__track">
                  <div
                    className="rd-bar-row__fill"
                    style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                  />
                </div>
                <div className="rd-bar-row__pct">{Math.round(score)}%</div>
                <div className="rd-bar-card__chev">▾</div>
              </button>

              {isOpen && (
                <div className="rd-bar-card__reveal">
                  <div className="rd-bar-card__tagline">{CLUSTER_DESCRIPTIONS[cluster]}</div>
                  <div className="rd-aspect-list">
                    {topSupport && (
                      <AspectLine description={topSupport.description} polarity={topSupport.clusterScore} />
                    )}
                    {topChallenge && (
                      <AspectLine description={topChallenge.description} polarity={topChallenge.clusterScore} />
                    )}
                    {!topSupport && !topChallenge && (
                      <div className="rd-bar-card__tagline" style={{ padding: 0 }}>
                        No contributing aspects available yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!hasAnalysis && onNavigateToAnalysis && (
        <div style={{ marginTop: 18 }}>
          <AnalysisPromptCard
            message="Unlock detailed relationship interpretations across all compatibility dimensions."
            onNavigate={onNavigateToAnalysis}
            creditCost={creditCost}
            creditsRemaining={creditsRemaining}
          />
        </div>
      )}

      {!isCelebrity && (
        <div style={{ marginTop: 18 }}>
          <AskStelliumCta
            hasFullAccess={canUseAskStellium}
            onActivate={() => setChatOpen(prev => !prev)}
            label="Ask Stellium about this relationship"
          />
        </div>
      )}

      {chatPanel}
    </div>
  );
}

export default ScoresTab;
