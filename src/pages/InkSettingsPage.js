import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { fetchUser } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import { useEntitlements } from '../hooks/useEntitlements';
import InkNav from '../UI/ink/InkNav';
import ProfileSettings from '../UI/dashboard/settings/ProfileSettings';
import SubscriptionSettings from '../UI/dashboard/settings/SubscriptionSettings';
import AccountSettings from '../UI/dashboard/settings/AccountSettings';
import PrivacySettings from '../UI/dashboard/settings/PrivacySettings';
import '../styles/ink.css';
import './InkSettingsPage.css';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'subscription', label: 'Subscription' },
  { id: 'account', label: 'Account' },
  { id: 'privacy', label: 'Privacy & Data' },
];

/**
 * Ink-themed account settings. Replaces the old dark dashboard shell that the
 * nav's "Settings" link used to open. Reuses the existing settings panels
 * (their logic is unchanged); all styling comes from InkSettingsPage.css.
 */
function InkSettingsPage() {
  const { userId } = useParams();
  const { stelliumUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const entitlements = useEntitlements(user);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Settings | Astral Gravity';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setError('Missing dashboard profile.');
      setLoading(false);
      return undefined;
    }
    if (stelliumUser && userId !== stelliumUser._id) {
      setLoading(false);
      return undefined;
    }

    (async () => {
      setLoading(true);
      setError('');
      try {
        const loadedUser = await fetchUser(userId);
        if (cancelled) return;
        if (!loadedUser?._id) throw new Error('User data unavailable');
        setUser(loadedUser);
      } catch (loadError) {
        console.error('Error loading settings:', loadError);
        if (!cancelled) setError('We couldn’t load your settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [stelliumUser, userId]);

  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}/settings`} replace />;
  }

  const renderPanel = () => {
    switch (activeTab) {
      case 'subscription':
        return <SubscriptionSettings userId={userId} user={user} entitlements={entitlements} />;
      case 'account':
        return <AccountSettings userId={userId} user={user} />;
      case 'privacy':
        return <PrivacySettings userId={userId} user={user} />;
      case 'profile':
      default:
        return <ProfileSettings userId={userId} user={user} />;
    }
  };

  return (
    <div className="ink-page ink-settings-page">
      <InkNav variant="app" user={user || stelliumUser} />
      <main className="ink-wrap ink-settings">
        <header className="ink-settings__head">
          <h1 className="ink-settings__title">Settings</h1>
          <p className="ink-settings__sub">Manage your profile, plan, and account.</p>
        </header>

        {loading ? (
          <p className="ink-settings__state">Loading your settings…</p>
        ) : error || !user ? (
          <p className="ink-settings__state ink-settings__state--error">{error || 'Settings unavailable.'}</p>
        ) : (
          <div className="ink-settings__grid">
            <nav className="ink-settings__nav" aria-label="Settings sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`ink-settings__tab${activeTab === tab.id ? ' is-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <section className="ink-settings__panel">
              {renderPanel()}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default InkSettingsPage;
