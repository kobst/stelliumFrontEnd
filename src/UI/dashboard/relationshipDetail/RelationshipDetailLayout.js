import React, { useState } from 'react';
import RelationshipDetailHeader from './RelationshipDetailHeader';
import RelationshipSectionNav from './RelationshipSectionNav';
import RelationshipQuickFacts from './RelationshipQuickFacts';
import './RelationshipDetailLayout.css';

function RelationshipDetailLayout({
  relationship,
  onBackClick,
  sections,
  lockedSections = [],
  defaultSection = 'scores'
}) {
  const [activeSection, setActiveSection] = useState(defaultSection);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Find the current section's content
  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="relationship-detail-layout">
      <RelationshipDetailHeader
        relationship={relationship}
        onBackClick={onBackClick}
      />

      <div className="relationship-detail-layout__body">
        <div className="relationship-detail-layout__grid">
          {/* Left: Section Navigation */}
          <div className="relationship-detail-layout__nav">
            <RelationshipSectionNav
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              lockedSections={lockedSections}
            />
          </div>

          {/* Center: Main Content */}
          <main className="relationship-detail-layout__content">
            {currentSection?.content || (
              <div className="relationship-detail-layout__empty">
                Select a section to view
              </div>
            )}
          </main>

          {/* Right: Quick Facts Sidebar */}
          <div className="relationship-detail-layout__sidebar">
            <RelationshipQuickFacts relationship={relationship} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelationshipDetailLayout;
