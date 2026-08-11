import React, { useEffect, useRef, useState } from 'react';
import {
  getProfilePhotoPresignedUrl,
  uploadProfilePhotoToS3,
  confirmProfilePhotoUpload
} from '../../Utilities/api';
import './InkSubjectAvatar.css';

const MAX_BYTES = 5 * 1024 * 1024;

function getInitials(firstName, lastName) {
  const first = (firstName || '').trim()[0] || '';
  const last = (lastName || '').trim()[0] || '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Circular subject avatar. Shows the profile photo when one exists, otherwise a
 * ✳ mark over the subject's initials. When `editable`, the avatar is a button
 * that runs the existing presign → S3 → confirm upload flow and swaps in the
 * new photo immediately.
 */
function InkSubjectAvatar({ subjectId, photoUrl, firstName, lastName, editable = false, onPhotoUpdated }) {
  const [currentUrl, setCurrentUrl] = useState(photoUrl || null);
  const [imageFailed, setImageFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentUrl(photoUrl || null);
    setImageFailed(false);
  }, [photoUrl]);

  const hasPhoto = Boolean(currentUrl) && !imageFailed;
  const label = `${firstName || ''} ${lastName || ''}`.trim() || 'Subject';

  const handleFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file || !subjectId) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be under 5MB.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { uploadUrl, photoKey } = await getProfilePhotoPresignedUrl(subjectId, file.type);
      await uploadProfilePhotoToS3(uploadUrl, file);
      const result = await confirmProfilePhotoUpload(subjectId, photoKey);
      const newUrl = result && result.profilePhotoUrl;
      if (newUrl) {
        setCurrentUrl(newUrl);
        setImageFailed(false);
        if (onPhotoUpdated) onPhotoUpdated(newUrl);
      }
    } catch (err) {
      console.error('Profile photo upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const media = hasPhoto ? (
    <img
      className="ink-subject-avatar__img"
      src={currentUrl}
      alt={`${label} portrait`}
      onError={() => setImageFailed(true)}
    />
  ) : (
    <span className="ink-subject-avatar__fallback" aria-hidden="true">
      <span className="ink-subject-avatar__mark">✳</span>
      <span className="ink-subject-avatar__initials">{getInitials(firstName, lastName) || '✦'}</span>
    </span>
  );

  if (!editable) {
    return (
      <span className="ink-subject-avatar" role="img" aria-label={`${label} portrait`}>
        {media}
      </span>
    );
  }

  return (
    <span className="ink-subject-avatar ink-subject-avatar--editable">
      <button
        type="button"
        className="ink-subject-avatar__btn"
        onClick={() => !uploading && inputRef.current && inputRef.current.click()}
        disabled={uploading}
        aria-label={hasPhoto ? `Change ${label}'s photo` : `Add a photo for ${label}`}
        title={hasPhoto ? 'Change photo' : 'Add photo'}
      >
        {media}
      </button>
      <span className="ink-subject-avatar__edit" aria-hidden="true">
        {uploading ? '…' : hasPhoto ? '✎' : '＋'}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="ink-subject-avatar__input"
        onChange={handleFile}
      />
      {error && <span className="ink-subject-avatar__error" role="alert">{error}</span>}
    </span>
  );
}

export default InkSubjectAvatar;
