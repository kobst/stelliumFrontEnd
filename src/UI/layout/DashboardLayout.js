import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

function DashboardLayout({
  children,
  user,
  defaultSection = 'horoscope',
  showSidebar = true
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const { signOut } = useAuth();

  const [currentSection, setCurrentSection] = useState(defaultSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update currentSection when defaultSection changes (e.g., when navigating from detail pages)
  useEffect(() => {
    setCurrentSection(defaultSection);
  }, [defaultSection]);

  const handleNavClick = useCallback((sectionId) => {
    // Check if we're on a detail page (chart detail or relationship detail)
    const isOnDetailPage = location.pathname.includes('/chart/') ||
                           location.pathname.includes('/relationship/');

    if (isOnDetailPage && userId) {
      // Navigate back to dashboard with the selected section
      navigate(`/dashboard/${userId}`, { state: { section: sectionId } });
    }

    setCurrentSection(sectionId);
    // Close mobile sidebar
    setSidebarOpen(false);
  }, [location.pathname, userId, navigate]);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/login');
  }, [signOut, navigate]);

  // Render children with props if it's a function (render prop pattern)
  const renderContent = () => {
    if (typeof children === 'function') {
      return children({ currentSection, setCurrentSection });
    }
    return children;
  };

  return (
    <div className="dashboard-layout">
      <TopHeader
        user={user}
        onMenuToggle={handleMenuToggle}
      />

      <div className="dashboard-layout__body">
        {showSidebar && (
          <Sidebar
            user={user}
            currentSection={currentSection}
            onNavClick={handleNavClick}
            isOpen={sidebarOpen}
            onClose={handleCloseSidebar}
            onLogout={handleLogout}
          />
        )}

        <main className={`dashboard-layout__content ${!showSidebar ? 'dashboard-layout__content--full' : ''}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
