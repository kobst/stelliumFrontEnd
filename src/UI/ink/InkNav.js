import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEntitlements } from '../../hooks/useEntitlements';
import './InkNav.css';

const DEFAULT_MARKETING_LINKS = [
  { label: 'How it works', href: '#how' },
  { label: 'Features', href: '#ways' },
  { label: 'Examples', href: '#examples' },
  { label: 'About', href: '#about' },
  { label: 'Pricing', href: '#pricing' },
];

const APP_SEGMENTS = [
  { id: 'home', label: 'Horoscope' },
  { id: 'charts', label: 'Charts' },
  { id: 'relationships', label: 'Relationships' },
];

function getDisplayName(user) {
  return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You';
}

function getInitials(user) {
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;
  return initials.toUpperCase() || '?';
}

function MarketingNav({ marketingLinks = DEFAULT_MARKETING_LINKS, className = '' }) {
  return (
    <nav className={`ink-nav ink-nav--marketing ${className}`.trim()} aria-label="Main navigation">
      <div className="ink-nav__inner">
        <Link className="ink-nav__wordmark" to="/">
          Astral Gravity <span className="ink-nav__mark" aria-hidden="true">✳</span>
        </Link>

        <div className="ink-nav__marketing-links">
          {marketingLinks.map(({ label, href }) => (
            <a className="ink-nav__link" href={href} key={`${label}-${href}`}>
              {label}
            </a>
          ))}
        </div>

        <Link className="ink-nav__cta" to="/signUp">Get started</Link>
      </div>
    </nav>
  );
}

function AppNav({ activeSegment = 'home', onSegmentChange, user: userOverride, className = '' }) {
  const { stelliumUser, signOut } = useAuth();
  const navigate = useNavigate();
  const user = userOverride || stelliumUser;
  const entitlements = useEntitlements(user);
  const dashboardPath = user?._id ? `/dashboard/${user._id}` : '/';
  const displayName = getDisplayName(user);
  const creditTotal = Number(entitlements?.credits?.total);
  const credits = Number.isFinite(creditTotal) ? creditTotal : 0;
  const tier = (entitlements?.plan || entitlements?.tier || 'free').toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // the chip's menu closes on outside click and Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const handleSegmentClick = (event, segment) => {
    if (!onSegmentChange) return;
    event.preventDefault();
    onSegmentChange(segment);
  };

  return (
    <nav className={`ink-nav ink-nav--app ${className}`.trim()} aria-label="Dashboard navigation">
      <div className="ink-nav__inner">
        <Link className="ink-nav__wordmark" to="/">
          Astral Gravity <span className="ink-nav__mark" aria-hidden="true">✳</span>
        </Link>

        <div className="ink-nav__segments" aria-label="Dashboard sections">
          {APP_SEGMENTS.map((segment) => {
            const isActive = activeSegment === segment.id;
            const segmentPath =
              segment.id === 'charts'
                ? `${dashboardPath}/charts`
                : segment.id === 'relationships'
                  ? `${dashboardPath}/relationships`
                  : dashboardPath;
            return (
              <Link
                className={`ink-nav__segment${isActive ? ' on' : ''}`}
                to={segmentPath}
                state={{ section: segment.id }}
                aria-current={isActive ? 'page' : undefined}
                onClick={(event) => handleSegmentClick(event, segment.id)}
                key={segment.id}
              >
                {segment.label}
              </Link>
            );
          })}
        </div>

        <span className="ink-nav__credits">✳ {credits} credits</span>

        <div className="ink-nav__user-wrap" ref={menuRef}>
          <button
            type="button"
            className="ink-nav__user"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="ink-nav__user-meta">
              <b>{displayName}</b>
              <span>{tier}</span>
            </span>
            <span className="ink-nav__avatar">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt={displayName} />
              ) : (
                getInitials(user)
              )}
            </span>
          </button>
          {menuOpen && (
            <div className="ink-nav__menu" role="menu">
              <Link
                className="ink-nav__menu-item"
                role="menuitem"
                to={`${dashboardPath}/legacy`}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                type="button"
                className="ink-nav__menu-item"
                role="menuitem"
                onClick={handleSignOut}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * Ink theme navigation.
 *
 * Marketing: <InkNav variant="marketing" />
 * App: <InkNav variant="app" activeSegment="charts" onSegmentChange={setSection} />
 */
function InkNav({ variant = 'marketing', ...props }) {
  if (variant === 'app') return <AppNav {...props} />;
  return <MarketingNav {...props} />;
}

export { APP_SEGMENTS, DEFAULT_MARKETING_LINKS };
export default InkNav;
