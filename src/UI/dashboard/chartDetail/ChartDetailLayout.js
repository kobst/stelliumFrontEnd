import React, { useMemo } from 'react';
import ChartDetailHeader from './ChartDetailHeader';
import SectionNav from './SectionNav';
import './ChartDetailLayout.css';
import './BirthChartDashboardTheme.css';

const SECTION_LABEL = {
  overview: 'Overview',
  chart: 'Chart',
  dominance: 'Patterns',
  planets: 'Planets',
  analysis: '360 Analysis'
};

const SECTION_HEADLINE = {
  overview: (
    <>
      The chart, <span className="italic">in plain language.</span>
    </>
  ),
  chart: (
    <>
      The sky, <span className="italic">read from the wheel.</span>
    </>
  ),
  dominance: (
    <>
      The <span className="italic">weather system</span> of the chart.
    </>
  ),
  planets: (
    <>
      One body, <span className="italic">at a time.</span>
    </>
  ),
  analysis: (
    <>
      Six lenses, <span className="italic">one chart.</span>
    </>
  )
};

const SECTION_META = {
  overview: 'Plain-language reading',
  chart: 'Positions · Houses · Aspects',
  dominance: '5 lenses on the same sky',
  planets: 'Body-by-body breakdown',
  analysis: 'Twelve life areas, clustered'
};

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
      <circle
        key={i}
        cx={cx.toFixed(2)}
        cy={cy.toFixed(2)}
        r={r.toFixed(2)}
        fill="#cabeff"
        opacity={o.toFixed(2)}
      />
    );
  }
  return circles;
}

function Stardust({ seed = 1, density = 80 }) {
  const circles = useMemo(() => generateStardustCircles(density, seed), [density, seed]);
  return (
    <svg className="bcd-stardust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {circles}
    </svg>
  );
}

function ChartDetailLayout({
  chart,
  onBackClick,
  sections,
  lockedSections = [],
  activeSection,
  onSectionChange,
  isGuest = false,
  onPhotoUpdated,
  hasAnalysis = false,
  credits = null
}) {
  const currentSection = sections.find((s) => s.id === activeSection);
  const sectionLabel = SECTION_LABEL[activeSection] || '';
  const headline = SECTION_HEADLINE[activeSection];
  const meta = SECTION_META[activeSection];

  return (
    <div className="bcd-page">
      <div className="bcd-halo lilac bcd-page__halo-c" />
      <div className="bcd-halo gold bcd-page__halo-l" />
      <div className="bcd-halo lilac bcd-page__halo-r" />
      <Stardust seed={5} density={70} />

      <div className="bcd-wrap">
        <ChartDetailHeader onBackClick={onBackClick} credits={credits} />

        <div className="bcd-grid">
          <aside className="bcd-sidebar">
            <SectionNav
              chart={chart}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              lockedSections={lockedSections}
              isGuest={isGuest}
              onPhotoUpdated={onPhotoUpdated}
              hasAnalysis={hasAnalysis}
            />
          </aside>

          <main className="bcd-main">
            {(sectionLabel || headline) && (
              <div className="bcd-tab-header">
                <div>
                  <div className="bcd-eyebrow gold">{sectionLabel}</div>
                  <h1>{headline}</h1>
                </div>
                {meta && <div className="bcd-tab-header__meta">{meta}</div>}
              </div>
            )}

            {currentSection?.content || (
              <div className="bcd-empty">Select a section to view.</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ChartDetailLayout;
