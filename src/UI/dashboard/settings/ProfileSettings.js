import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../../../Utilities/api';
import { useAuth } from '../../../context/AuthContext';
import './ProfileSettings.css';

function ProfileSettings({ userId, user }) {
  const { refreshStelliumUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  useEffect(() => {
    const originalFirst = user?.firstName || '';
    const originalLast = user?.lastName || '';
    setHasChanges(firstName !== originalFirst || lastName !== originalLast);
  }, [firstName, lastName, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUserProfile(userId, { firstName, lastName });
      await refreshStelliumUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Profile</h3>
        <div className="settings-gradient-icon" />
      </div>

      <p className="profile-settings__description">
        Update your display name.
      </p>

      <form onSubmit={handleSubmit} className="profile-settings__form">
        <div className="profile-settings__field">
          <label htmlFor="firstName" className="profile-settings__label">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="profile-settings__input"
            placeholder="Enter your first name"
          />
        </div>

        <div className="profile-settings__field">
          <label htmlFor="lastName" className="profile-settings__label">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="profile-settings__input"
            placeholder="Enter your last name"
          />
        </div>

        {error && (
          <div className="profile-settings__error">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-settings__success">
            Profile updated successfully!
          </div>
        )}

        <button
          type="submit"
          className="profile-settings__submit"
          disabled={loading || !hasChanges}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default ProfileSettings;
