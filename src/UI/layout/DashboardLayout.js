import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useEntitlementsStore from '../../Utilities/entitlementsStore';
import { useEntitlements } from '../../hooks/useEntitlements';
import DashboardNav from '../dashboard/DashboardNav';
import Toast from '../shared/Toast';
import './DashboardLayout.css';

// Detail pages identify their section with the legacy ids; map them to the
// shared nav's tab ids so the right tab is highlighted.
const SECTION_TO_TAB = {
  horoscope: 'home',
  'birth-charts': 'charts',
  relationships: 'relationships'
};

function DashboardLayout({ children, user, defaultSection = 'horoscope' }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { signOut } = useAuth();
  const toast = useEntitlementsStore((state) => state.toast);
  const dismissToast = useEntitlementsStore((state) => state.dismissToast);
  const credits = useEntitlementsStore((state) => state.credits);
  const entitlements = useEntitlements(user);

  const activeTab = SECTION_TO_TAB[defaultSection] || defaultSection;

  // From a detail page, any nav target returns to the dashboard with the
  // requested section (also handles 'settings' / 'settings:subscription').
  const handleTabChange = useCallback((sectionId) => {
    if (userId) {
      navigate(`/dashboard/${userId}`, { state: { section: sectionId } });
    }
  }, [userId, navigate]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/login');
  }, [signOut, navigate]);

  const renderContent = () => {
    if (typeof children === 'function') {
      return children({ currentSection: defaultSection });
    }
    return children;
  };

  return (
    <div className="dashboard-layout dashboard-layout--no-sidebar">
      <DashboardNav
        user={user}
        entitlements={entitlements}
        credits={credits}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNavigateHome={() => navigate('/')}
        onSignOut={handleSignOut}
      />

      <div className="dashboard-layout__body">
        <main className="dashboard-layout__content dashboard-layout__content--full">
          {renderContent()}
        </main>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onDismiss={dismissToast}
      />
    </div>
  );
}

export default DashboardLayout;
