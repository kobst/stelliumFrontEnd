import React, { useState, useRef } from 'react';
import {
  getProfilePhotoPresignedUrl,
  uploadProfilePhotoToS3,
  confirmProfilePhotoUpload
} from '../../../Utilities/api';
import './SectionNav.css';

const SECTIONS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="7" cy="7" r="5.6" />
        <path d="M7 1.4 V12.6 M1.4 7 H12.6" />
      </svg>
    )
  },
  {
    id: 'chart',
    label: 'Chart',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="7" cy="7" r="5.6" />
        <circle cx="7" cy="7" r="2.8" />
      </svg>
    )
  },
  {
    id: 'dominance',
    label: 'Patterns',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="3.5" cy="3.5" r="1.6" />
        <circle cx="10.5" cy="3.5" r="1.6" />
        <circle cx="7" cy="10.5" r="1.6" />
        <path d="M3.5 3.5 L10.5 3.5 L7 10.5 Z" />
      </svg>
    )
  },
  {
    id: 'planets',
    label: 'Planets',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="7" cy="7" r="2" />
        <ellipse cx="7" cy="7" rx="6" ry="2" transform="rotate(-30 7 7)" />
      </svg>
    )
  },
  {
    id: 'analysis',
    label: '360 Analysis',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M3 11 L7 4 L11 11 M4.5 8.5 H9.5" />
      </svg>
    )
  }
];

const SIGN_FILE = {
  aries: 'aries',
  taurus: 'taurus',
  gemini: 'gemini',
  cancer: 'cancer',
  leo: 'leo',
  virgo: 'virgo',
  libra: 'libra',
  scorpio: 'scorpio',
  sagittarius: 'sagittarius',
  capricorn: 'capricorn',
  aquarius: 'aquarius',
  pisces: 'pisces'
};

function signFilePath(sign) {
  if (!sign) return null;
  const key = String(sign).trim().toLowerCase();
  return SIGN_FILE[key] ? `/assets/signs/${SIGN_FILE[key]}.svg` : null;
}

function getPlanetSign(chart, name) {
  return chart?.birthChart?.planets?.find((p) => p?.name === name)?.sign || null;
}

function getAscendant(chart) {
  const direct = chart?.birthChart?.ascendant?.sign;
  if (direct) return direct;
  const firstHouse = chart?.birthChart?.houses?.find((h) => h?.house === 1);
  return firstHouse?.sign || null;
}

function getFullName(chart) {
  return `${chart?.firstName || ''} ${chart?.lastName || ''}`.trim() || 'Unknown';
}

function getInitial(chart) {
  const first = chart?.firstName?.[0] || '';
  const last = chart?.lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
}

function formatBirthDate(chart) {
  const value = chart?.dateOfBirth || chart?.birthDate;
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.getUTCDate();
  const month = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function formatBirthTime(chart) {
  return chart?.timeOfBirth || chart?.birthTime || '';
}

function formatBirthPlace(chart) {
  const place = chart?.placeOfBirth || chart?.birthPlace;
  if (!place) return '';
  const parts = place.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]} · ${parts[parts.length - 1]}`;
  return place;
}

function SectionNav({
  chart,
  activeSection,
  onSectionChange,
  lockedSections = [],
  isGuest = false,
  onPhotoUpdated,
  hasAnalysis = false
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const fullName = getFullName(chart);
  const initial = getInitial(chart);
  const sunSign = getPlanetSign(chart, 'Sun');
  const moonSign = getPlanetSign(chart, 'Moon');
  const ascendant = getAscendant(chart);
  const birthDate = formatBirthDate(chart);
  const birthTime = formatBirthTime(chart);
  const birthPlace = formatBirthPlace(chart);

  const sunFile = signFilePath(sunSign);
  const moonFile = signFilePath(moonSign);
  const ascFile = signFilePath(ascendant);

  const handleAvatarClick = () => {
    if (isGuest && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      const { uploadUrl, photoKey } = await getProfilePhotoPresignedUrl(chart._id, file.type);
      await uploadProfilePhotoToS3(uploadUrl, file);
      const { profilePhotoUrl } = await confirmProfilePhotoUpload(chart._id, photoKey);
      onPhotoUpdated?.(profilePhotoUrl);
    } catch (err) {
      console.error('Photo upload failed:', err);
      setUploadError('Upload failed');
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <nav className="bcd-section-nav" aria-label="Birth chart sections">
      {/* Profile card */}
      <div className="bcd-profile">
        <div className="bcd-avatar-wrap">
          <div className="bcd-avatar-wrap__halo" />
          <button
            type="button"
            className="bcd-avatar"
            onClick={handleAvatarClick}
            aria-label={isGuest ? `Update photo for ${fullName}` : fullName}
          >
            {chart?.profilePhotoUrl ? (
              <img className="bcd-avatar__img" src={chart.profilePhotoUrl} alt={fullName} />
            ) : (
              <>
                <svg
                  className="bcd-avatar__silhouette"
                  viewBox="0 0 92 92"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="bcdSilAv" cx="50%" cy="48%" r="55%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                      <stop offset="60%" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="46" cy="46" rx="32" ry="38" fill="url(#bcdSilAv)" />
                  <ellipse cx="46" cy="34" rx="14" ry="18" fill="rgba(0,0,0,0.18)" />
                  <ellipse cx="46" cy="78" rx="30" ry="14" fill="rgba(0,0,0,0.22)" />
                </svg>
                <span className="bcd-avatar__initial">{initial}</span>
              </>
            )}
            {sunFile && (
              <span className="bcd-avatar__sign-mini" aria-hidden="true">
                <img src={sunFile} alt="" />
              </span>
            )}
            {uploading && (
              <span className="bcd-avatar__upload-overlay">
                <span className="bcd-avatar__spinner" />
              </span>
            )}
            {isGuest && !uploading && (
              <span className="bcd-avatar__upload-overlay" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                </svg>
              </span>
            )}
          </button>
          {isGuest && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          )}
        </div>
        {uploadError && <div className="bcd-profile__error">{uploadError}</div>}

        <div className="bcd-profile__name">{fullName}</div>
        {(birthDate || birthPlace) && (
          <div className="bcd-profile__sub">
            {[birthDate, birthPlace].filter(Boolean).join(' · ')}
          </div>
        )}

        <div className="bcd-placements">
          <div className="bcd-placement">
            {sunFile && <img className="bcd-placement__icon gold" src={sunFile} alt="" aria-hidden="true" />}
            <div className="bcd-placement__label">Sun</div>
            <div className="bcd-placement__sign">{sunSign || '—'}</div>
          </div>
          <div className="bcd-placement">
            {moonFile && <img className="bcd-placement__icon" src={moonFile} alt="" aria-hidden="true" />}
            <div className="bcd-placement__label">Moon</div>
            <div className="bcd-placement__sign">{moonSign || '—'}</div>
          </div>
          <div className="bcd-placement">
            {ascFile && <img className="bcd-placement__icon" src={ascFile} alt="" aria-hidden="true" />}
            <div className="bcd-placement__label">Rising</div>
            <div className="bcd-placement__sign">{ascendant || '—'}</div>
          </div>
        </div>

        <div className="bcd-birth-data">
          {birthDate && (
            <div className="bcd-birth-row">
              <span className="bcd-birth-row__k">Date of Birth</span>
              <span className="bcd-birth-row__v">{birthDate}</span>
            </div>
          )}
          {birthTime && (
            <div className="bcd-birth-row">
              <span className="bcd-birth-row__k">Birth Time</span>
              <span className="bcd-birth-row__v">{birthTime}</span>
            </div>
          )}
          {birthPlace && (
            <div className="bcd-birth-row">
              <span className="bcd-birth-row__k">Place</span>
              <span className="bcd-birth-row__v">{birthPlace}</span>
            </div>
          )}
        </div>
      </div>

      {/* Vertical tab list */}
      <div className="bcd-tabs" role="tablist">
        {SECTIONS.map((section) => {
          const isLocked = lockedSections.includes(section.id);
          const isActive = activeSection === section.id;
          const showSparkle = !isLocked && !hasAnalysis && (section.id === 'dominance' || section.id === 'planets');
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`bcd-tab${isActive ? ' active' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <span className="bcd-tab__icon">{section.icon}</span>
              <span>{section.label}</span>
              {isLocked ? (
                <span className="bcd-tab__lock" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                  </svg>
                </span>
              ) : showSparkle ? (
                <span className="bcd-tab__sparkle" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0L9.2 5.3L14.5 4L10.6 8L14.5 12L9.2 10.7L8 16L6.8 10.7L1.5 12L5.4 8L1.5 4L6.8 5.3L8 0Z" />
                  </svg>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default SectionNav;
