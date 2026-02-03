import React, { useState } from 'react';
import ProfileSettings from './settings/ProfileSettings';
import SubscriptionSettings from './settings/SubscriptionSettings';
import AccountSettings from './settings/AccountSettings';
import PrivacySettings from './settings/PrivacySettings';
import './SettingsSection.css';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'account', label: 'Account' },
  { id: 'privacy', label: 'Privacy & Data' }
];

function SettingsSection({ userId, user, entitlements }) {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings userId={userId} user={user} />;
      case 'subscription':
        return <SubscriptionSettings userId={userId} user={user} entitlements={entitlements} />;
      case 'account':
        return <AccountSettings userId={userId} user={user} />;
      case 'privacy':
        return <PrivacySettings userId={userId} user={user} />;
      default:
        return <ProfileSettings userId={userId} user={user} />;
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section__grid">
        {/* Left: Vertical Navigation */}
        <nav className="settings-section__nav">
          <div className="settings-section__nav-list">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`settings-section__nav-btn ${activeTab === tab.id ? 'settings-section__nav-btn--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="settings-section__nav-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Right: Content Area */}
        <main className="settings-section__content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default SettingsSection;
