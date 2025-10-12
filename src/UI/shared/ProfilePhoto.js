import React, { useState } from 'react';

/**
 * ProfilePhoto component displays a user's profile photo with loading states and fallback
 *
 * @param {Object} props
 * @param {Object} props.subject - Subject object with profilePhotoUrl and profilePhotoUpdatedAt
 * @param {number} props.size - Size of the photo in pixels (default: 100)
 * @param {string} props.alt - Alt text for the image
 * @param {Object} props.style - Additional styles to apply
 */
function ProfilePhoto({ subject, size = 100, alt, style = {} }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Default avatar - using a simple SVG placeholder
  const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23374151"/%3E%3Cpath d="M50 45c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15zm0 5c-13.807 0-25 11.193-25 25v10h50V75c0-13.807-11.193-25-25-25z" fill="%239CA3AF"/%3E%3C/svg%3E';

  // Build photo URL with cache busting if updated timestamp is available
  let photoUrl = subject?.profilePhotoUrl;
  if (photoUrl && subject?.profilePhotoUpdatedAt) {
    const timestamp = new Date(subject.profilePhotoUpdatedAt).getTime();
    photoUrl = `${photoUrl}?t=${timestamp}`;
  }

  const displayUrl = (imageError || !photoUrl) ? defaultAvatar : photoUrl;
  const altText = alt || `${subject?.firstName || ''} ${subject?.lastName || ''}`.trim() || 'Profile photo';

  const containerStyle = {
    position: 'relative',
    width: size,
    height: size,
    ...style
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    display: imageLoaded || imageError || !photoUrl ? 'block' : 'none',
    backgroundColor: '#374151'
  };

  const skeletonStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: imageLoaded || imageError || !photoUrl ? 'none' : 'block',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  };

  return (
    <div style={containerStyle}>
      {/* Loading skeleton */}
      <div style={skeletonStyle}></div>

      {/* Profile image */}
      <img
        src={displayUrl}
        alt={altText}
        style={imageStyle}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.error('Failed to load profile photo:', photoUrl);
          setImageError(true);
          setImageLoaded(true);
        }}
      />

      {/* Add keyframes animation for pulse effect */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
}

export default ProfilePhoto;
