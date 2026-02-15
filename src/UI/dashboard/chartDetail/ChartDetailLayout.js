import React from 'react';
import ChartDetailHeader from './ChartDetailHeader';
import SectionNav from './SectionNav';
import './ChartDetailLayout.css';

function ChartDetailLayout({
  chart,
  onBackClick,
  sections,
  lockedSections = [],
  activeSection,
  onSectionChange,
  isGuest = false,
  onPhotoUpdated,
  hasAnalysis = false
}) {
  // Find the current section's content
  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="chart-detail-layout">
      <ChartDetailHeader chart={chart} onBackClick={onBackClick} />

      <div className="chart-detail-layout__body">
        <div className="chart-detail-layout__grid">
          {/* Left: Section Navigation */}
          <div className="chart-detail-layout__nav">
            <SectionNav
              chart={chart}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              lockedSections={lockedSections}
              isGuest={isGuest}
              onPhotoUpdated={onPhotoUpdated}
              hasAnalysis={hasAnalysis}
            />
          </div>

          {/* Main Content */}
          <main className="chart-detail-layout__content">
            {currentSection?.content || (
              <div className="chart-detail-layout__empty">
                Select a section to view
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ChartDetailLayout;
