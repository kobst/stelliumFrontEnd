import React, { useMemo } from 'react';
import RelationshipSidebar from './RelationshipSidebar';
import './RelationshipDetailLayout.css';
import './RelationshipDashboardTheme.css';

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

function Stardust({ seed = 1, density = 70 }) {
  const circles = useMemo(() => generateStardustCircles(density, seed), [density, seed]);
  return (
    <svg className="rd-stardust" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {circles}
    </svg>
  );
}

function RelationshipDetailLayout({
  relationship,
  onBackClick,
  sections,
  lockedSections = [],
  activeSection,
  onSectionChange,
  credits = null
}) {
  const currentSection = sections.find((s) => s.id === activeSection);
  const totalCredits = credits?.total;
  const showCredits = typeof totalCredits === 'number' && Number.isFinite(totalCredits);

  return (
    <div className="rd-page">
      <div className="rd-halo lilac rd-page__halo-c" />
      <div className="rd-halo gold rd-page__halo-l" />
      <div className="rd-halo lilac rd-page__halo-r" />
      <Stardust seed={5} density={70} />

      <div className="rd-wrap">
        <div className="rd-page-top">
          <button type="button" className="rd-back-link" onClick={onBackClick}>
            <span className="rd-back-link__arrow">←</span> Back to Dashboard
          </button>
          {showCredits && (
            <span className="rd-credit-pill" title="Credits remaining">
              <svg width="9" height="9" viewBox="0 0 11 11" aria-hidden="true">
                <path d="M5.5 0.5 L10.5 5.5 L5.5 10.5 L0.5 5.5 Z" fill="#e9c349" />
              </svg>
              {totalCredits.toLocaleString()} {totalCredits === 1 ? 'credit' : 'credits'}
            </span>
          )}
        </div>

        <div className="rd-grid">
          <aside className="rd-sidebar">
            <RelationshipSidebar
              relationship={relationship}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              lockedSections={lockedSections}
            />
          </aside>

          <main className="rd-main">
            {currentSection?.content || (
              <div className="rd-empty">Select a section to view.</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default RelationshipDetailLayout;
