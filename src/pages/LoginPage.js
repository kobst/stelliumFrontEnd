import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function GoogleMark() {
  return (
    <svg className="oauth-btn__icon" width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.45 3.43 1.34l2.55-2.55C13.46.96 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.97 2.31C4.63 5.17 6.62 3.6 9 3.6z" />
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z" />
      <path fill="#FBBC05" d="M3.93 10.73a5.4 5.4 0 0 1 0-3.46L.96 4.96a9 9 0 0 0 0 8.08l2.97-2.31z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.38 0-4.37-1.57-5.07-3.69L.96 13.04C2.44 15.98 5.48 18 9 18z" />
    </svg>
  );
}

const SIGNUP_BENEFITS = [
  {
    glyph: '✦',
    title: 'Your full birth-chart reading',
    sub: 'A plain-language interpretation of your placements, houses, and aspects.'
  },
  {
    glyph: '☾',
    title: 'Weekly horoscopes, tuned to your chart',
    sub: 'Not your sign — your actual sky, read for the week ahead.'
  },
  {
    glyph: '♥',
    title: 'Compatibility with anyone',
    sub: 'Compare synastry and chemistry with a partner, a crush, or a celebrity.'
  },
  {
    glyph: '✶',
    title: 'Ask Stellium, your AI astrologer',
    sub: 'Real answers from your real chart data — 1 credit per question.'
  }
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    firebaseUser,
    stelliumUser,
    needsOnboarding,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    loading
  } = useAuth();

  // Default to the create-account view; honor an explicit sign-in entry.
  const [isSignUp, setIsSignUp] = useState(location.state?.mode !== 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
    setResetMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetMessage('');

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError('Enter your email first, then click Forgot password.');
      return;
    }

    setIsResetting(true);
    const result = await sendPasswordReset(normalizedEmail);

    if (result.success) {
      setResetMessage('If an account exists for this email, a reset link has been sent.');
    } else {
      setError(result.error || 'Unable to send password reset email right now.');
    }

    setIsResetting(false);
  };

  const renderValuePanel = () => (
    <div className="login-val">
      <div className="login-val__eyebrow">
        <span className="login-val__bar" aria-hidden="true" />
        <span className="login-val__eyebrow-text">
          {isSignUp ? 'Create your free account' : 'Welcome back'}
        </span>
      </div>

      {isSignUp ? (
        <>
          <h1 className="login-val__title">
            Read your own sky, <span className="login-val__accent">free.</span>
          </h1>
          <p className="login-val__lede">
            The same depth you just read about the stars — turned on your own chart, and anyone
            you're curious about.
          </p>

          <div className="login-credits">
            <div className="login-credits__num">25</div>
            <div className="login-credits__copy">
              <div className="login-credits__title">Free credits, the moment you sign up</div>
              <div className="login-credits__sub">
                Spend them asking Stellium anything — about your chart, your horoscope, or any
                celebrity in the database.
              </div>
            </div>
          </div>

          <div className="login-benefits">
            {SIGNUP_BENEFITS.map((b) => (
              <div className="login-benefit" key={b.title}>
                <div className="login-benefit__ck" aria-hidden="true">{b.glyph}</div>
                <div className="login-benefit__copy">
                  <div className="login-benefit__title">{b.title}</div>
                  <div className="login-benefit__sub">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="login-val__title">
            Welcome back to <span className="login-val__accent">your sky.</span>
          </h1>
          <p className="login-val__lede">
            Sign in to pick up your readings, horoscopes, and Ask Stellium credits right where you
            left them.
          </p>
        </>
      )}
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-page__halo login-page__halo--c" aria-hidden="true" />
      <div className="login-page__halo login-page__halo--l" aria-hidden="true" />
      <div className="login-page__halo login-page__halo--r" aria-hidden="true" />

      <div className="login-wrap">
        <div className="login-top">
          <button type="button" className="login-top__back" onClick={() => navigate('/')}>
            <span className="login-top__arrow">←</span> Back to home
          </button>
          <span className="login-top__right">
            <span className="login-top__dot" aria-hidden="true" /> Free to start · no credit card
          </span>
        </div>

        <div className="login-grid">
          {renderValuePanel()}

          <div className="login-card" aria-busy={loading ? 'true' : undefined}>
            <div className="login-card__thread" aria-hidden="true" />
            <div className="login-card__head">
              <h2 className="login-card__title">
                {isSignUp ? 'Start free in seconds' : 'Sign in'}
              </h2>
              <div className="login-card__sub">
                {isSignUp ? '25 credits included — no credit card.' : 'Good to see you again.'}
              </div>
            </div>

            {loading ? (
              <div className="login-card__body" aria-hidden="true">
                <span className="login-skel" style={{ height: 48 }} />
                <div className="login-divider"><span>or with email</span></div>
                <span className="login-skel" style={{ height: 68 }} />
                <span className="login-skel" style={{ height: 68 }} />
                <span className="login-skel" style={{ height: 50, marginTop: 8 }} />
                <span className="login-skel" style={{ width: '60%', height: 14, margin: '14px auto 0' }} />
              </div>
            ) : (
              <div className="login-card__body">
                <div className="login-oauth">
                  <button
                    type="button"
                    className="oauth-btn"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                  >
                    <GoogleMark />
                    Continue with Google
                  </button>
                </div>

                <div className="login-divider"><span>or with email</span></div>

                <form onSubmit={handleEmailSubmit} className="login-form">
                  <div className="login-field">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {!isSignUp && (
                    <div className="login-forgot-row">
                      <button
                        type="button"
                        className="login-forgot-btn"
                        onClick={handleForgotPassword}
                        disabled={isSubmitting || isResetting}
                      >
                        {isResetting ? 'Sending...' : 'Forgot password?'}
                      </button>
                    </div>
                  )}

                  {isSignUp && (
                    <div className="login-field">
                      <label htmlFor="confirmPassword">Confirm password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  )}

                  {error && <div className="login-error">{error}</div>}
                  {resetMessage && <div className="login-success">{resetMessage}</div>}

                  <button type="submit" className="login-submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Please wait...'
                      : isSignUp
                        ? 'Create account & claim 25 credits →'
                        : 'Sign in →'}
                  </button>
                </form>

                {isSignUp && (
                  <div className="login-reassure">
                    <span className="login-reassure__sp" aria-hidden="true">✦</span> No credit card · Cancel anytime
                  </div>
                )}

                <div className="login-terms">
                  By creating an account you agree to Stellium's{' '}
                  <a href="/terms-of-service">Terms</a> and{' '}
                  <a href="/privacy-policy">Privacy Policy</a>.
                </div>

                <div className="login-signin">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button type="button" onClick={toggleMode} className="login-signin__btn" disabled={isSubmitting}>
                    {isSignUp ? 'Sign in' : 'Create one free'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
