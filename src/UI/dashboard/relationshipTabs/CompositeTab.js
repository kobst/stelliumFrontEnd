import React, { useMemo, useState } from 'react';
import BirthChartSummaryTable from '../../birthChart/tables/BirthChartSummaryTable';
import AskStelliumPanel from '../../askStellium/AskStelliumPanel';
import AskStelliumCta from '../chartTabs/AskStelliumCta';
import { SignIcon } from '../../shared/AstroIcon';
import './RelationshipTabs.css';

// The composite summary is plain text (no markdown); blank lines separate
// paragraphs. Split on /\n\n+/ and render each block as a <p>.
const toParagraphs = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);
};

const roundSignDegree = (deg) => {
  if (typeof deg !== 'number' || Number.isNaN(deg)) return null;
  return Math.round(((deg % 30) + 30) % 30);
};

// Derive the headline composite placements (Sun / Moon / Rising) from the
// existing composite chart data so we reuse the existing sign symbols.
const buildPlacements = (chart) => {
  const planets = chart?.planets || [];
  const houses = chart?.houses || [];
  const findPlanet = (name) => planets.find((p) => p?.name === name);
  const placements = [];

  const sun = findPlanet('Sun');
  if (sun?.sign) {
    placements.push({ label: 'Composite Sun', sign: sun.sign, deg: roundSignDegree(sun.norm_degree) });
  }

  const moon = findPlanet('Moon');
  if (moon?.sign) {
    placements.push({ label: 'Composite Moon', sign: moon.sign, deg: roundSignDegree(moon.norm_degree) });
  }

  const ascPlanet = findPlanet('Ascendant');
  const firstHouse = houses.find((h) => h?.house === 1 || h?.house === '1');
  if (ascPlanet?.sign) {
    placements.push({ label: 'Composite Rising', sign: ascPlanet.sign, deg: roundSignDegree(ascPlanet.norm_degree) });
  } else if (firstHouse?.sign) {
    placements.push({ label: 'Composite Rising', sign: firstHouse.sign, deg: roundSignDegree(firstHouse.degree) });
  }

  return placements;
};

function CompositeTab({ relationship, compositeId, isCelebrity = false, canUseAskStellium = false }) {
  const [chatOpen, setChatOpen] = useState(false);

  const compositeChart = useMemo(() => relationship?.compositeChart || {}, [relationship]);
  const compositeSummary = relationship?.compositeSummary;

  const paragraphs = useMemo(() => toParagraphs(compositeSummary?.summary), [compositeSummary]);
  const placements = useMemo(() => buildPlacements(compositeChart), [compositeChart]);
  const hasCompositeData = compositeChart?.planets && compositeChart.planets.length > 0;

  const relationshipScoredItems =
    relationship?.scoredItems ||
    relationship?.clusterAnalysis?.scoredItems ||
    relationship?.clusterScoring?.scoredItems ||
    [];

  return (
    <div className="composite-tab-redesign">
      <div className="rd-section-head">
        <h2>Composite Chart</h2>
      </div>

      {placements.length > 0 && (
        <div className="comp-glance">
          <div className="comp-glance__eyebrow">The relationship as a single chart</div>
          <div className="comp-glance__placements">
            {placements.map((pl) => (
              <div className="comp-pl" key={pl.label}>
                <div className="comp-pl__glyph">
                  <SignIcon name={pl.sign} size={22} />
                </div>
                <div className="comp-pl__meta">
                  <div className="comp-pl__name">{pl.label}</div>
                  <div className="comp-pl__sign">
                    {pl.sign}{pl.deg != null ? ` · ${pl.deg}°` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {paragraphs.length > 0 ? (
        <article className="rd-overview-reading">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>
      ) : (
        <div className="rd-empty">
          The composite reading isn&apos;t available yet. It&apos;s generated the first
          time this relationship is analyzed.
        </div>
      )}

      {hasCompositeData && (
        <>
          <div className="charts-section-header">
            <h3>The Chart Behind the Reading</h3>
            <p>Both birth charts folded into a single wheel of midpoints &mdash; the relationship&apos;s own sky.</p>
          </div>
          <BirthChartSummaryTable
            planets={compositeChart.planets || []}
            houses={compositeChart.houses || []}
            aspects={compositeChart.aspects || []}
          />
        </>
      )}

      {!isCelebrity && (
        <div style={{ padding: '24px 30px 0' }}>
          <AskStelliumCta
            hasFullAccess={canUseAskStellium}
            onActivate={() => setChatOpen((prev) => !prev)}
            label="Ask Stellium about this relationship"
          />
        </div>
      )}

      {!isCelebrity && canUseAskStellium && (
        <AskStelliumPanel
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          contentType="relationship"
          contentId={compositeId}
          relationshipScoredItems={relationshipScoredItems}
          contextLabel="About your relationship"
          placeholderText="Ask about your relationship..."
          suggestedQuestions={[
            'What is the core purpose of our relationship?',
            'What does our composite Sun mean?',
            'What holds this relationship together?'
          ]}
        />
      )}
    </div>
  );
}

export default CompositeTab;
