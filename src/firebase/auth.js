import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google popup
 * @returns {Promise<UserCredential>}
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 * @param {string} email
 * @param {string} password
 * @param {string} displayName - Optional display name
 * @returns {Promise<UserCredential>}
 */
export const signUpWithEmail = async (email, password, displayName = '') => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name if provided
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }

    return result;
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get the current Firebase user
 * @returns {User|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get the ID token for the current user
 * @param {boolean} forceRefresh - Force refresh the token
 * @returns {Promise<string|null>}
 */
export const getIdToken = async (forceRefresh = false) => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error) {
    console.error('Get ID token error:', error);
    throw error;
  }
};

/**
 * Subscribe to auth state changes
 * @param {function} callback - Callback function (user) => void
 * @returns {function} Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Get Firebase error message for display
 * @param {Error} error - Firebase error
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Please allow popups and try again.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

/**
 * Send password reset email
 * @param {string} email - The email address to send reset link to
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};
