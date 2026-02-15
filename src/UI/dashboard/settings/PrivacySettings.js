import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { deleteSubject } from '../../../Utilities/api';
import './PrivacySettings.css';

function PrivacySettings({ userId, user }) {
  const navigate = useNavigate();
  const { firebaseUser, signOut } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const email = firebaseUser?.email || user?.email || '';

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
    setConfirmEmail('');
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setConfirmEmail('');
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (confirmEmail.toLowerCase() !== email.toLowerCase()) {
      setDeleteError('Email does not match');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteSubject(userId);
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      setDeleteError(err.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="privacy-settings">
      <div className="settings-section-header">
        <h3 className="settings-section-title">Privacy & Data</h3>
      </div>

      <p className="privacy-settings__description">
        Manage your data and privacy settings.
      </p>

      <div className="privacy-settings__section">
        <h4 className="privacy-settings__section-title">Your Data</h4>
        <p className="privacy-settings__section-description">
          Your birth chart data and analysis results are stored securely. We use this data
          to provide you with personalized astrological insights.
        </p>
      </div>

      <div className="privacy-settings__section privacy-settings__section--danger">
        <h4 className="privacy-settings__section-title privacy-settings__section-title--danger">
          Delete Account
        </h4>
        <p className="privacy-settings__section-description">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        <button
          className="privacy-settings__delete-btn"
          onClick={handleDeleteClick}
        >
          Delete Account
        </button>
        <p className="privacy-settings__reassurance">
          You'll be asked to confirm before anything is deleted
        </p>
      </div>

      {showConfirmModal && (
        <div className="privacy-settings__modal-overlay" onClick={handleCancelDelete}>
          <div className="privacy-settings__modal" onClick={(e) => e.stopPropagation()}>
            <div className="privacy-settings__modal-header">
              <h3 className="privacy-settings__modal-title">Delete Account</h3>
              <button
                className="privacy-settings__modal-close"
                onClick={handleCancelDelete}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="privacy-settings__modal-body">
              <div className="privacy-settings__warning">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>This action is permanent and cannot be undone.</span>
              </div>

              <p className="privacy-settings__modal-text">
                All your data will be permanently deleted, including:
              </p>
              <ul className="privacy-settings__delete-list">
                <li>Your birth chart and analysis</li>
                <li>All saved relationships</li>
                <li>Horoscope history</li>
                <li>Chat history</li>
                <li>Subscription (if any)</li>
              </ul>

              <div className="privacy-settings__confirm-field">
                <label className="privacy-settings__confirm-label">
                  Type your email to confirm: <strong>{email}</strong>
                </label>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="privacy-settings__confirm-input"
                  placeholder="Enter your email"
                  autoComplete="off"
                />
              </div>

              {deleteError && (
                <div className="privacy-settings__modal-error">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="privacy-settings__modal-footer">
              <button
                className="privacy-settings__modal-cancel"
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="privacy-settings__modal-confirm"
                onClick={handleConfirmDelete}
                disabled={deleteLoading || confirmEmail.toLowerCase() !== email.toLowerCase()}
              >
                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivacySettings;
