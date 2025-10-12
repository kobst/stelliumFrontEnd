import React, { useState } from 'react';
import ProfilePhoto from '../shared/ProfilePhoto';
import ProfilePhotoUploader from './ProfilePhotoUploader';
import { deleteProfilePhoto, fetchUser } from '../../Utilities/api';

/**
 * ProfilePhotoManager - Complete profile photo management component
 * Displays photo with admin controls for upload and delete
 *
 * @param {Object} props
 * @param {Object} props.subject - Subject object with photo data
 * @param {Function} props.onPhotoUpdated - Callback when photo is updated or deleted
 * @param {boolean} props.isAdmin - Whether current user is admin (controls edit access)
 * @param {number} props.size - Size of displayed photo (default: 100)
 */
function ProfilePhotoManager({ subject, onPhotoUpdated, isAdmin = true, size = 100 }) {
  const [showUploader, setShowUploader] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadComplete = async (newPhotoUrl) => {
    console.log('Upload complete, new photo URL:', newPhotoUrl);
    setShowUploader(false);
    setError(null);

    // Fetch fresh user data from backend to get updated photo info
    try {
      const updatedSubject = await fetchUser(subject._id);
      console.log('Updated subject data:', updatedSubject);
      onPhotoUpdated(updatedSubject);
    } catch (err) {
      console.error('Error fetching updated subject:', err);
      // Fallback: manually update the photo URL
      onPhotoUpdated({
        ...subject,
        profilePhotoUrl: newPhotoUrl,
        profilePhotoUpdatedAt: new Date().toISOString()
      });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the profile photo for ${subject.firstName} ${subject.lastName}?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    setError(null);

    try {
      console.log('Deleting profile photo for subjectId:', subject._id);
      await deleteProfilePhoto(subject._id);
      console.log('Profile photo deleted successfully');

      // Fetch fresh user data to confirm deletion
      try {
        const updatedSubject = await fetchUser(subject._id);
        console.log('Updated subject data after delete:', updatedSubject);
        onPhotoUpdated(updatedSubject);
      } catch (err) {
        console.error('Error fetching updated subject:', err);
        // Fallback: manually clear the photo fields
        onPhotoUpdated({
          ...subject,
          profilePhotoUrl: null,
          profilePhotoKey: null,
          profilePhotoUpdatedAt: null
        });
      }
    } catch (err) {
      console.error('Error deleting profile photo:', err);
      setError(err.message || 'Failed to delete profile photo');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploader(false);
    setError(null);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Display current photo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
        <ProfilePhoto subject={subject} size={size} />

        <div>
          <h3 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '18px' }}>
            {subject.firstName} {subject.lastName}
          </h3>
          {subject.profilePhotoUrl && subject.profilePhotoUpdatedAt && (
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0' }}>
              Photo updated: {new Date(subject.profilePhotoUpdatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Admin controls */}
      {isAdmin && !showUploader && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowUploader(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {subject.profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}
          </button>

          {subject.profilePhotoUrl && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '8px 16px',
                backgroundColor: deleting ? '#6b7280' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.6 : 1
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Photo'}
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '4px',
          color: '#f87171',
          fontSize: '14px',
          marginTop: '10px'
        }}>
          {error}
        </div>
      )}

      {/* Upload interface */}
      {isAdmin && showUploader && (
        <ProfilePhotoUploader
          subjectId={subject._id}
          currentPhotoUrl={subject.profilePhotoUrl}
          onUploadComplete={handleUploadComplete}
          onCancel={handleCancelUpload}
        />
      )}

      {/* Non-admin message */}
      {!isAdmin && (
        <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '10px' }}>
          Only administrators can manage profile photos.
        </p>
      )}
    </div>
  );
}

export default ProfilePhotoManager;
