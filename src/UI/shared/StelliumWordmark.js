import React from 'react';
import './StelliumWordmark.css';

/**
 * The Stellium wordmark used across the redesigned surfaces:
 * a small ringed-dot SVG glyph in a soft lilac-on-deep-purple square
 * followed by an italic-serif "Stellium" name on a single line.
 *
 * Use this anywhere the old `<img src={stelliumIcon} /> + STELLIUM` pair
 * appeared so the brand reads consistently across pages.
 */
function StelliumWordmark({
  href,
  onClick,
  size = 'md',
  className = '',
  ariaLabel = 'Stellium home'
}) {
  const sizeClass = `stellium-wordmark--${size}`;
  const classes = `stellium-wordmark ${sizeClass} ${className}`.trim();

  const inner = (
    <>
      <span className="stellium-wordmark__glyph" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 22 22" fill="none">
          <circle cx="15" cy="6" r="2.2" fill="#cabeff" />
          <ellipse cx="15" cy="6" rx="3.4" ry="0.9" stroke="#cabeff" strokeOpacity="0.55" strokeWidth="0.6" fill="none" transform="rotate(-18 15 6)" />
          <circle cx="11" cy="12" r="3.2" fill="#cabeff" />
          <circle cx="9" cy="17" r="1.1" fill="#cabeff" opacity="0.7" />
          <path d="M3 19 Q11 22 19 19" stroke="#cabeff" strokeWidth="0.6" fill="none" opacity="0.6" />
        </svg>
      </span>
      <span className="stellium-wordmark__name">Stellium</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} aria-label={ariaLabel}>
        {inner}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-label={ariaLabel}>
        {inner}
      </button>
    );
  }

  return (
    <span className={classes} role="img" aria-label={ariaLabel}>
      {inner}
    </span>
  );
}

export default StelliumWordmark;
