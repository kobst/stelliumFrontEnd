import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './AccountSettings.css';

function AccountSettings({ userId, user }) {
  const navigate = useNavigate();
  const { firebaseUser, signOut, sendPasswordReset } = useAuth();
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const email = firebaseUser?.email || user?.email || '';

  const handlePasswordReset = async () => {
    if (!email) {
      setResetError('No email address found');
      return;
    }

    setResetLoading(true);
    setResetError(null);
    setResetSuccess(false);

    try {
      const result = await sendPasswordReset(email);
      if (result.success) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 5000);
      } else {
        setResetError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Error sending password reset:', err);
      setResetError('Failed to send password reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      const result = await signOut();
      if (result.success) {
        navigate('/login');
      }
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setSignOutLoading(false);
    }
  };

  return (
    <div className="account-settings">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Account</h3>
      </div>

      <p className="account-settings__description">
        Manage your account settings.
      </p>

      <div className="account-settings__section">
        <div className="account-settings__field">
          <label className="account-settings__label">Email Address</label>
          <div className="account-settings__email">
            {email || 'No email found'}
          </div>
          <p className="account-settings__email-note">To change your email, contact support</p>
        </div>
      </div>

      <div className="account-settings__section">
        <h4 className="account-settings__section-title">Password</h4>
        <p className="account-settings__section-description">
          Reset your password via email.
        </p>

        {resetError && (
          <div className="account-settings__error">
            {resetError}
          </div>
        )}

        {resetSuccess && (
          <div className="account-settings__success">
            Password reset email sent! Check your inbox.
          </div>
        )}

        <button
          className="account-settings__reset-btn"
          onClick={handlePasswordReset}
          disabled={resetLoading || !email}
        >
          {resetLoading ? 'Sending...' : 'Reset Password'}
        </button>
      </div>

      <div className="account-settings__section">
        <h4 className="account-settings__section-title">Sign Out</h4>
        <p className="account-settings__section-description">
          Sign out of your account on this device.
        </p>

        <button
          className="account-settings__signout-btn"
          onClick={handleSignOut}
          disabled={signOutLoading}
        >
          {signOutLoading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

export default AccountSettings;
