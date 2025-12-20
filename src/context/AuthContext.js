import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getIdToken,
  getAuthErrorMessage
} from '../firebase/auth';
import { getUserByFirebaseUid } from '../Utilities/api';

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

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      setFirebaseUser(user);

      if (user) {
        // User is signed in, check if they exist in backend
        try {
          const token = await user.getIdToken();
          console.log('Checking backend for Firebase UID:', user.uid);
          const response = await getUserByFirebaseUid(user.uid, token);
          console.log('Backend response:', response);

          // Check if we got a valid user back
          // Response format: {success: true, user: {...}} or direct user object
          const userData = response?.user || response;
          if (userData && userData._id) {
            console.log('User found in backend:', userData._id);
            setStelliumUser(userData);
          } else {
            // User authenticated but not in backend (new user)
            console.log('User not found in backend, needs onboarding');
            setStelliumUser(null);
          }
        } catch (error) {
          console.error('Error checking user in backend:', error);
          setStelliumUser(null);
        }
      } else {
        // User is signed out
        setStelliumUser(null);
      }

      setLoading(false);
      setInitialCheckDone(true);
    });

    return () => unsubscribe();
  }, []);

  // Check if user needs onboarding (authenticated but no Stellium profile)
  const needsOnboarding = firebaseUser && !stelliumUser && initialCheckDone;

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
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
    return null;
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
    isFullyAuthenticated,

    // Actions
    signInWithGoogle: handleGoogleSignIn,
    signInWithEmail: handleEmailSignIn,
    signUpWithEmail: handleEmailSignUp,
    signOut: handleSignOut,
    getToken,
    refreshStelliumUser,
    setStelliumUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
