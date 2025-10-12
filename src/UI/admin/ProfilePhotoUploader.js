import React, { useState } from 'react';
import {
  getProfilePhotoPresignedUrl,
  uploadProfilePhotoToS3,
  confirmProfilePhotoUpload,
  uploadProfilePhotoDirect
} from '../../Utilities/api';

/**
 * ProfilePhotoUploader - Admin component for uploading profile photos
 * Uses presigned URL strategy with fallback to direct upload
 *
 * @param {Object} props
 * @param {string} props.subjectId - ID of the subject to upload photo for
 * @param {string} props.currentPhotoUrl - Current photo URL (if exists)
 * @param {Function} props.onUploadComplete - Callback when upload completes successfully
 * @param {Function} props.onCancel - Callback when user cancels upload
 */
function ProfilePhotoUploader({ subjectId, currentPhotoUrl, onUploadComplete, onCancel }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);
  const [useDirectUpload, setUseDirectUpload] = useState(false);

  // Validation constants
  const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset error state
    setError(null);

    // Validate file type
    if (!VALID_TYPES.includes(selectedFile.type)) {
      setError('Please upload a JPEG, PNG, GIF, or WebP image');
      setFile(null);
      setPreview(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_SIZE_BYTES) {
      setError(`File size must be less than ${MAX_SIZE_MB}MB (current: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`);
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUploadWithPresignedUrl = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Step 1: Get presigned URL
      setProgress('Preparing upload...');
      console.log('Step 1: Getting presigned URL');
      const { uploadUrl, photoKey } = await getProfilePhotoPresignedUrl(subjectId, file.type);

      // Step 2: Upload to S3
      setProgress('Uploading to S3...');
      console.log('Step 2: Uploading to S3');
      await uploadProfilePhotoToS3(uploadUrl, file);

      // Step 3: Confirm with backend
      setProgress('Finalizing...');
      console.log('Step 3: Confirming upload');
      const result = await confirmProfilePhotoUpload(subjectId, photoKey);

      setProgress('');
      console.log('Upload complete:', result);
      onUploadComplete(result.profilePhotoUrl);
    } catch (err) {
      console.error('Error with presigned URL upload:', err);
      setError(err.message || 'Upload failed. Trying direct upload method...');

      // Fallback to direct upload
      setTimeout(() => {
        setUseDirectUpload(true);
        handleUploadDirect();
      }, 1000);
    } finally {
      if (!useDirectUpload) {
        setUploading(false);
      }
    }
  };

  const handleUploadDirect = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      setProgress('Uploading...');
      console.log('Using direct upload method');
      const result = await uploadProfilePhotoDirect(subjectId, file);

      setProgress('');
      console.log('Direct upload complete:', result);
      onUploadComplete(result.profilePhotoUrl);
    } catch (err) {
      console.error('Error with direct upload:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUseDirectUpload(false);
    }
  };

  const handleUpload = () => {
    if (useDirectUpload) {
      handleUploadDirect();
    } else {
      handleUploadWithPresignedUrl();
    }
  };

  const handleCancelUpload = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress('');
    setUseDirectUpload(false);
    if (onCancel) onCancel();
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      borderRadius: '8px',
      marginTop: '15px'
    }}>
      <h3 style={{ color: '#a78bfa', marginBottom: '15px', fontSize: '16px' }}>
        Upload Profile Photo
      </h3>

      {/* Preview */}
      {preview && (
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #8b5cf6'
            }}
          />
          <p style={{ color: '#d1d5db', fontSize: '12px', marginTop: '8px' }}>
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        </div>
      )}

      {/* File input */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{
            padding: '8px',
            border: '1px solid #374151',
            borderRadius: '4px',
            backgroundColor: '#1f2937',
            color: 'white',
            width: '100%',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        />
        <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '5px' }}>
          Accepted formats: JPEG, PNG, GIF, WebP (max {MAX_SIZE_MB}MB)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '4px',
          color: '#f87171',
          fontSize: '14px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div style={{
          padding: '10px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '4px',
          color: '#60a5fa',
          fontSize: '14px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          {progress}
        </div>
      )}

      {/* Action buttons */}
      {preview && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            style={{
              padding: '10px 20px',
              backgroundColor: uploading ? '#6b7280' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1
            }}
          >
            {uploading ? `${progress || 'Uploading...'}` : 'Upload Photo'}
          </button>
          <button
            onClick={handleCancelUpload}
            disabled={uploading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#374151',
              color: 'white',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Upload method toggle (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#1f2937', borderRadius: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useDirectUpload}
              onChange={(e) => setUseDirectUpload(e.target.checked)}
              disabled={uploading}
            />
            Use direct upload method (debugging)
          </label>
        </div>
      )}
    </div>
  );
}

export default ProfilePhotoUploader;
