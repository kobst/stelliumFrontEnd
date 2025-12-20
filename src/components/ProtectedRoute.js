import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * Behavior:
 * - If not authenticated: redirect to /login
 * - If authenticated but needs onboarding: redirect to /onboarding
 * - If fully authenticated: render children
 *
 * @param {boolean} requireProfile - If true, user must have a Stellium profile (default: true)
 */
const ProtectedRoute = ({ children, requireProfile = true }) => {
    const { firebaseUser, needsOnboarding, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255, 255, 255, 0.2)',
                        borderTopColor: '#d138d4',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p>Loading...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!firebaseUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated but needs onboarding (no Stellium profile yet)
    if (requireProfile && needsOnboarding) {
        // Don't redirect if already on onboarding pages
        if (location.pathname.startsWith('/onboarding')) {
            return children;
        }
        return <Navigate to="/onboarding" replace />;
    }

    // Fully authenticated - render the protected content
    return children;
};

/**
 * OnboardingRoute - For onboarding pages (authenticated but no profile required)
 *
 * Behavior:
 * - If not authenticated: redirect to /login
 * - If already has profile: redirect to dashboard
 * - If needs onboarding: render children
 */
export const OnboardingRoute = ({ children }) => {
    const { firebaseUser, stelliumUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255, 255, 255, 0.2)',
                        borderTopColor: '#d138d4',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p>Loading...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!firebaseUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Already has profile - redirect to dashboard
    if (stelliumUser && stelliumUser._id) {
        return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
    }

    // Needs onboarding - render the onboarding content
    return children;
};

export default ProtectedRoute;
