import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Shown when a signed-in user's profile lookup failed for a non-404 reason
 * (network, CORS, 5xx). It must NOT drop the user into onboarding/re-creation —
 * their account may well exist. Offer a retry and a sign-out escape hatch.
 */
const AuthRetryScreen = () => {
  const { retryUserLookup, signOut } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retryUserLookup();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: 'white',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: 420 }}>
        <h2 style={{ marginBottom: 12 }}>We couldn't reach your account</h2>
        <p style={{ opacity: 0.8, marginBottom: 24 }}>
          Your sign-in worked, but we couldn't load your profile. This is a
          connection problem, not a missing account. Please try again.
        </p>
        <button
          onClick={handleRetry}
          disabled={retrying}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: '#d138d4',
            color: 'white',
            cursor: retrying ? 'default' : 'pointer',
            marginRight: 12
          }}
        >
          {retrying ? 'Retrying…' : 'Try again'}
        </button>
        <button
          onClick={() => signOut()}
          disabled={retrying}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default AuthRetryScreen;
