import React, { useEffect, useRef, useState } from 'react';
import BalanceChip from './BalanceChip';
import './DashboardNav.css';

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'charts', label: 'My Birth Chart' },
  { id: 'relationships', label: 'My Relationships' }
];

function WordmarkGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="15" cy="6" r="2.2" fill="#cabeff" />
      <ellipse cx="15" cy="6" rx="3.4" ry="0.9" stroke="#cabeff" strokeOpacity="0.55" strokeWidth="0.6" fill="none" transform="rotate(-18 15 6)" />
      <circle cx="11" cy="12" r="3.2" fill="#cabeff" />
      <circle cx="9" cy="17" r="1.1" fill="#cabeff" opacity="0.7" />
      <path d="M3 19 Q11 22 19 19" stroke="#cabeff" strokeWidth="0.6" fill="none" opacity="0.6" />
    </svg>
  );
}

function getInitial(name) {
  return (name?.trim()?.charAt(0) || '?').toUpperCase();
}

/**
 * Shared dashboard top nav (celestial theme). Used by the main dashboard and by
 * every detail page via DashboardLayout so the bar is identical everywhere.
 *
 * Self-contained: brings its own `--md-*` token scope, so it renders correctly
 * whether or not it sits inside `.md-page`.
 *
 * @param {object} props
 * @param {object} props.user
 * @param {object} props.entitlements - resolved entitlements (isPlus, credits, fullReportQuota)
 * @param {object} props.credits - live credits from the entitlements store
 * @param {string} props.activeTab - 'home' | 'charts' | 'relationships' (highlighted tab)
 * @param {(id: string) => void} props.onTabChange - tab / settings navigation
 * @param {() => void} props.onNavigateHome - wordmark click
 * @param {() => (void|Promise<void>)} props.onSignOut
 */
function DashboardNav({ user, entitlements, credits, activeTab, onTabChange, onNavigateHome, onSignOut }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const userInitial = getInitial(user?.firstName);
  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You';
  const isPlus = !!entitlements?.isPlus;

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await onSignOut?.();
  };

  return (
    <div className="dash-nav">
      <div className="md-accent-thread" />

      <nav className="md-nav">
        <div className="md-nav__inner">
          <div className="md-nav__left">
            <button type="button" className="md-wordmark" onClick={onNavigateHome} aria-label="Stellium home">
              <span className="md-wordmark__glyph"><WordmarkGlyph /></span>
              <span className="md-wordmark__name">Stellium</span>
            </button>
          </div>

          <div className="md-page-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`md-page-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="md-nav__right">
            <BalanceChip
              entitlements={entitlements}
              credits={credits}
              onManage={() => onTabChange('settings:subscription')}
              onBuyCredits={() => onTabChange('settings:subscription')}
            />

            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="md-user-cluster"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="md-user-cluster__meta">
                  <span className="md-user-cluster__nm">{displayName}</span>
                  {isPlus && <span className="md-user-cluster__plus">PLUS</span>}
                </span>
                <span className="md-user-cluster__av">
                  {user?.profilePhotoUrl ? (
                    <img src={user.profilePhotoUrl} alt={displayName} />
                  ) : (
                    <span className="md-user-cluster__av-initial">{userInitial}</span>
                  )}
                </span>
              </button>
              {userMenuOpen && (
                <div className="md-user-menu" role="menu">
                  <button
                    type="button"
                    className="md-user-menu__item"
                    onClick={() => { setUserMenuOpen(false); onTabChange('settings'); }}
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    className="md-user-menu__item"
                    onClick={() => { setUserMenuOpen(false); onTabChange('settings:subscription'); }}
                  >
                    Subscription &amp; Credits
                  </button>
                  <div className="md-user-menu__divider" />
                  <button type="button" className="md-user-menu__item" onClick={handleSignOut}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default DashboardNav;
