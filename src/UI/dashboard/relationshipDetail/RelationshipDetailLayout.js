import React, { useState } from 'react';
import RelationshipSidebar from './RelationshipSidebar';
import './RelationshipDetailLayout.css';

function RelationshipDetailLayout({
  relationship,
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
    <div className="relationship-detail-layout">
      <div className="relationship-detail-layout__grid">
        {/* Left: Combined Sidebar (Profile, Stats, Nav) */}
        <div className="relationship-detail-layout__sidebar">
          <RelationshipSidebar
            relationship={relationship}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            lockedSections={lockedSections}
          />
        </div>

        {/* Right: Main Content */}
        <main className="relationship-detail-layout__content">
          {currentSection?.content || (
            <div className="relationship-detail-layout__empty">
              Select a section to view
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default RelationshipDetailLayout;
