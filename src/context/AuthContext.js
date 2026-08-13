import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getIdToken,
  getAuthErrorMessage,
  sendPasswordReset
} from '../firebase/auth';
import { getUserByFirebaseUid } from '../Utilities/api';
import { initializeEntitlements } from '../Utilities/entitlementsApi';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import { identifyUser, resetUser } from '../Utilities/analytics';
import { clearTrialSession } from '../Utilities/trialApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [stelliumUser, setStelliumUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  // True when the profile lookup failed for a reason OTHER than 404 (network,
  // CORS, 5xx). Distinct from "no account" so a transient error never routes an
  // existing user into onboarding/re-creation.
  const [lookupError, setLookupError] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      setFirebaseUser(user);

      if (user) {
        // User is signed in, check if they exist in backend
        try {
          const token = await user.getIdToken();
          const response = await getUserByFirebaseUid(user.uid, token);

          // Check if we got a valid user back
          // Response format: {success: true, user: {...}} or direct user object
          const userData = response?.user || response;
          if (userData && userData._id) {
            console.log('User found in backend:', userData._id);
            setStelliumUser(userData);
            setLookupError(false);
            // An account with a profile makes any unclaimed anonymous trial
            // session obsolete — discard it so it can't resurface later
            // (e.g. "Welcome back, Arlo" on the landing page after logout).
            // New signups aren't affected: their claim/start-fresh choice
            // happens on the onboarding page before a profile exists.
            clearTrialSession();
            identifyUser(userData._id, {
              email: userData.email,
              name: [userData.firstName, userData.lastName].filter(Boolean).join(' '),
            });

            // Initialize and fetch entitlements
            try {
              await initializeEntitlements(userData._id);
              await useEntitlementsStore.getState().fetchEntitlements(userData._id);
            } catch (entErr) {
              console.warn('Could not initialize entitlements:', entErr);
            }
          } else {
            // 404 → genuinely no account for this Firebase UID: onboard.
            console.log('User not found in backend, needs onboarding');
            setStelliumUser(null);
            setLookupError(false);
          }
        } catch (error) {
          // Network/CORS/5xx: the lookup failed, but that does NOT mean the user
          // has no account. Flag the error so needsOnboarding stays false and the
          // UI can offer a retry instead of forcing re-creation.
          console.error('Error checking user in backend:', error);
          setStelliumUser(null);
          setLookupError(true);
        }
      } else {
        // User is signed out
        resetUser();
        setStelliumUser(null);
        setLookupError(false);
      }

      setLoading(false);
      setInitialCheckDone(true);
    });

    return () => unsubscribe();
  }, []);

  // Needs onboarding only when the lookup succeeded AND returned no account.
  // A failed lookup (lookupError) must never route an existing user to create.
  const needsOnboarding =
    firebaseUser && !stelliumUser && initialCheckDone && !lookupError;

  // Check if user is fully authenticated (Firebase + Stellium profile)
  const isFullyAuthenticated = firebaseUser && stelliumUser;

  // Get fresh ID token for API calls
  const getToken = async () => {
    if (!firebaseUser) return null;
    return getIdToken();
  };

  // Refresh Stellium user data from backend
  const refreshStelliumUser = async () => {
    if (!firebaseUser) return null;

    try {
      const token = await firebaseUser.getIdToken();
      const response = await getUserByFirebaseUid(firebaseUser.uid, token);

      // Response format: {success: true, user: {...}} or direct user object
      const userData = response?.user || response;
      if (userData && userData._id) {
        setStelliumUser(userData);
        setLookupError(false);
        return userData;
      }
      // 404 → no account.
      setLookupError(false);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setLookupError(true);
    }
    return null;
  };

  // Retry the profile lookup after a failed (non-404) attempt. Lets a UI show
  // "couldn't reach the server — retry" instead of dropping into onboarding.
  const retryUserLookup = async () => {
    return refreshStelliumUser();
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  // Handle email sign in
  const handleEmailSignIn = async (email, password) => {
    try {
      const result = await signInWithEmail(email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  // Handle email sign up
  const handleEmailSignUp = async (email, password, displayName) => {
    try {
      const result = await signUpWithEmail(email, password, displayName);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setStelliumUser(null);
      // Reset entitlements store on logout
      useEntitlementsStore.getState().reset();
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  // Handle password reset
  const handlePasswordReset = async (email) => {
    try {
      await sendPasswordReset(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error) };
    }
  };

  const value = {
    // State
    firebaseUser,
    stelliumUser,
    loading,
    needsOnboarding,
    lookupError,
    isFullyAuthenticated,

    // Actions
    signInWithGoogle: handleGoogleSignIn,
    signInWithEmail: handleEmailSignIn,
    signUpWithEmail: handleEmailSignUp,
    signOut: handleSignOut,
    sendPasswordReset: handlePasswordReset,
    getToken,
    refreshStelliumUser,
    retryUserLookup,
    setStelliumUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
