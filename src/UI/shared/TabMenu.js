import React, { useState } from 'react';

function TabMenu({ tabs, onTabChange }) {
  const [activeTab, setActiveTab] = useState(tabs && tabs.length > 0 ? tabs[0].id : null);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const getButtonClass = (id) => `tab-button ${activeTab === id ? 'active' : ''} button-white-text`;

  return (
    <div>
      <div className="tab-menu">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={getButtonClass(tab.id)}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs.map(tab => (
          activeTab === tab.id ? (
            <div key={tab.id}>{tab.content}</div>
          ) : null
        ))}
      </div>
    </div>
  );
}

export default TabMenu;
