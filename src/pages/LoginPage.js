import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import stelliumIcon from '../assets/StelliumIcon.svg';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { firebaseUser, stelliumUser, needsOnboarding, signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && firebaseUser) {
      if (stelliumUser) {
        // Fully authenticated - go to dashboard
        navigate(`/dashboard/${stelliumUser._id}`, { replace: true });
      } else if (needsOnboarding) {
        // Authenticated but needs onboarding
        navigate('/onboarding', { replace: true });
      }
    }
  }, [firebaseUser, stelliumUser, needsOnboarding, loading, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error);
    }
    // Navigation handled by useEffect

    setIsSubmitting(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setIsSubmitting(true);

    let result;
    if (isSignUp) {
      result = await signUpWithEmail(email, password);
    } else {
      result = await signInWithEmail(email, password);
    }

    if (!result.success) {
      setError(result.error);
    }
    // Navigation handled by useEffect

    setIsSubmitting(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img className="login-logo" src={stelliumIcon} alt="Stellium logo" />
          <h1 className="login-title">STELLIUM</h1>
          <p className="login-subtitle">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {isSignUp && (
          <div className="signup-benefits">
            <p className="benefits-title">Start your free trial</p>
            <ul className="benefits-list">
              <li>Your personalized birth chart</li>
              <li>Daily &amp; monthly horoscopes</li>
              <li>7 days of expanded insights</li>
            </ul>
          </div>
        )}

        <div className="login-form-container">
          {/* Google Sign In */}
          <button
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="login-divider">
            <span>or</span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
              />
            </div>

            {!isSignUp && (
              <div className="forgot-password-row">
                <button type="button" className="forgot-password-btn" disabled={isSubmitting}>
                  Forgot password?
                </button>
              </div>
            )}

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="login-toggle">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button onClick={toggleMode} className="toggle-btn" disabled={isSubmitting}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        <div className="login-footer">
          <a href="/">Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
