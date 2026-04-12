import React from 'react';
import { planetIconPaths, signIconPaths } from '../../Utilities/constants';

/**
 * Inline icon for a planet name.
 * Falls back to a two-letter abbreviation when no SVG exists.
 */
export function PlanetIcon({ name, size = 18, className = '', style = {} }) {
  const src = planetIconPaths[name];
  if (!src) {
    return <span className={className} style={style}>{name ? name.substring(0, 2) : '??'}</span>;
  }
  return (
    <img
      src={src}
      alt={name}
      className={className}
      style={{ width: size, height: size, verticalAlign: 'middle', ...style }}
    />
  );
}

/**
 * Inline icon for a zodiac sign name (e.g. "Aries").
 * Falls back to a two-letter abbreviation when no SVG exists.
 */
export function SignIcon({ name, size = 18, className = '', style = {} }) {
  const src = signIconPaths[name];
  if (!src) {
    return <span className={className} style={style}>{name ? name.substring(0, 2) : '??'}</span>;
  }
  return (
    <img
      src={src}
      alt={name}
      className={className}
      style={{ width: size, height: size, verticalAlign: 'middle', ...style }}
    />
  );
}
