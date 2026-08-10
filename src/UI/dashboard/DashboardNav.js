import React, { useEffect, useRef, useState } from 'react';
import BalanceChip from './BalanceChip';
import './DashboardNav.css';

const TABS = [
  { id: 'home', label: 'Horoscope' },
  { id: 'charts', label: 'Charts' },
  { id: 'relationships', label: 'Relationships' }
];

function WordmarkGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" fill="#cabeff" aria-hidden="true">
      <path transform="rotate(0 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(45 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(90 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(135 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(180 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(225 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(270 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
      <path transform="rotate(315 50 50)" d="M50 7 L51.7 50 L50 54 L48.3 50 Z" />
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
            <button type="button" className="md-wordmark" onClick={onNavigateHome} aria-label="Go to Horoscope">
              <span className="md-wordmark__glyph"><WordmarkGlyph /></span>
              <span className="md-wordmark__name">Astral Gravity</span>
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
