import React, { memo } from 'react';

const PlanetCard = memo(({ planet, interpretation, description }) => (
  <div style={{ 
    backgroundColor: 'rgba(139, 92, 246, 0.1)', 
    padding: '20px', 
    borderRadius: '8px',
    border: '1px solid rgba(139, 92, 246, 0.3)',
    marginBottom: '20px'
  }}>
    <h3 style={{ 
      color: '#a78bfa', 
      margin: '0 0 15px 0',
      fontSize: '1.3rem'
    }}>
      {planet === 'Node' ? '☊ ' : ''}
      {planet === 'Sun' ? '☉ ' : ''}
      {planet === 'Moon' ? '☽ ' : ''}
      {planet === 'Mercury' ? '☿ ' : ''}
      {planet === 'Venus' ? '♀ ' : ''}
      {planet === 'Mars' ? '♂ ' : ''}
      {planet === 'Jupiter' ? '♃ ' : ''}
      {planet === 'Saturn' ? '♄ ' : ''}
      {planet === 'Uranus' ? '♅ ' : ''}
      {planet === 'Neptune' ? '♆ ' : ''}
      {planet === 'Pluto' ? '♇ ' : ''}
      {planet === 'Ascendant' ? '↑ ' : ''}
      {planet === 'Midheaven' ? '⟂ ' : ''}
      {planet}
    </h3>
    {description && (
      <div style={{ 
        backgroundColor: 'rgba(59, 130, 246, 0.1)', 
        padding: '15px', 
        borderRadius: '6px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        marginBottom: '15px'
      }}>
        <p style={{ 
          color: 'white', 
          margin: '0',
          fontSize: '14px',
          lineHeight: '1.5',
          opacity: '0.9'
        }}>
          {description}
        </p>
      </div>
    )}
    {interpretation && (
      <p style={{ 
        color: 'white', 
        lineHeight: '1.6', 
        margin: '0',
        fontSize: '16px',
        whiteSpace: 'pre-wrap'
      }}>
        {interpretation}
      </p>
    )}
  </div>
));

export default PlanetCard;
