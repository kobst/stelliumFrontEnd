import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  onAdminAuthStateChanged,
  signInAdminWithEmail,
  signOutAdmin,
  sendAdminPasswordReset,
} from '../firebase/adminAuth';
import './passwordProtection.css';

const AdminPasswordProtection = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAdminAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser || null);
      if (firebaseUser?.email && !email) {
        setEmail(firebaseUser.email);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [email]);

  const signedInLabel = useMemo(() => {
    if (!user?.email) return 'Signed in';
    return `Signed in as ${user.email}`;
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setSubmitting(true);
      await signInAdminWithEmail(email.trim(), password);
      setPassword('');
    } catch (loginError) {
      setError(loginError?.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setResetMessage('');

    if (!email) {
      setError('Enter your email first to reset password.');
      return;
    }

    try {
      await sendAdminPasswordReset(email.trim());
      setResetMessage('If an account exists, a password reset link was sent.');
    } catch (resetError) {
      setError(resetError?.message || 'Unable to send reset email.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
    } catch (signOutError) {
      setError(signOutError?.message || 'Unable to sign out.');
    }
  };

  if (authLoading) {
    return (
      <div className="password-protection">
        <div className="password-container">
          <h2>Checking admin session...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="password-protection">
        <div className="password-container">
          <h2>Admin Login</h2>
          <p>Sign in with your Firebase admin account.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            {resetMessage && <div className="success-message">{resetMessage}</div>}
            <button type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <button className="back-button" onClick={handleResetPassword} style={{ marginTop: '1rem' }}>
            Forgot password?
          </button>
          <button className="back-button" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
            Back to Main Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: '#0f1025',
        color: '#d7d7e6',
        borderBottom: '1px solid #2d2f52'
      }}>
        <span style={{ fontSize: '13px' }}>{signedInLabel}</span>
        <button
          onClick={handleSignOut}
          style={{
            background: '#2b2e5e',
            color: '#fff',
            border: '1px solid #4a4f89',
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: 'pointer'
          }}
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
};

export default AdminPasswordProtection;
