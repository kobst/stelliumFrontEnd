import React, { useState } from 'react';
import ChartDetailHeader from './ChartDetailHeader';
import SectionNav from './SectionNav';
import QuickFactsSidebar from './QuickFactsSidebar';
import './ChartDetailLayout.css';

function ChartDetailLayout({
  chart,
  onBackClick,
  sections,
  lockedSections = [],
  defaultSection = 'overview'
}) {
  const [activeSection, setActiveSection] = useState(defaultSection);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

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
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              lockedSections={lockedSections}
            />
          </div>

          {/* Center: Main Content */}
          <main className="chart-detail-layout__content">
            {currentSection?.content || (
              <div className="chart-detail-layout__empty">
                Select a section to view
              </div>
            )}
          </main>

          {/* Right: Quick Facts Sidebar */}
          <div className="chart-detail-layout__sidebar">
            <QuickFactsSidebar chart={chart} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartDetailLayout;
