import React from 'react';
import { AspectTypes } from '../../utils/patternHelpers';

const PatternWheel = ({ planets = [], lines = [], size = 200 }) => {
  // Calculate the center and radius
  const center = size / 2;
  const outerRadius = center - 15;
  const planetRadius = outerRadius - 15;

  // Aspect color and style mapping
  const aspectStyles = {
    [AspectTypes.TRINE]: { 
      color: '#88e1ff', 
      strokeWidth: 2, 
      strokeDasharray: 'none' 
    },
    [AspectTypes.SEXTILE]: { 
      color: '#4f63ff', 
      strokeWidth: 2, 
      strokeDasharray: 'none' 
    },
    [AspectTypes.SQUARE]: { 
      color: '#ff7c7c', 
      strokeWidth: 2, 
      strokeDasharray: 'none' 
    },
    [AspectTypes.OPPOSITION]: { 
      color: '#ff7c7c', 
      strokeWidth: 2, 
      strokeDasharray: 'none' 
    },
    [AspectTypes.QUINCUNX]: { 
      color: '#fcd34d', 
      strokeWidth: 2, 
      strokeDasharray: '4,3' 
    },
    [AspectTypes.CONJUNCTION]: { 
      color: '#ffffff', 
      strokeWidth: 3, 
      strokeDasharray: 'none' 
    }
  };

  // Helper function to convert degrees to radians
  const degToRad = (degrees) => (degrees * Math.PI) / 180;

  // Helper function to convert degrees to SVG coordinates
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = degToRad(angleInDegrees - 90); // Subtract 90 to start from top
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Position planets around the circle
  // If planets have degrees, use them; otherwise distribute evenly
  const positionPlanets = () => {
    if (planets.length === 0) return [];

    const positioned = planets.map((planet, index) => {
      let degree;
      
      if (planet.degree !== undefined) {
        degree = planet.degree;
      } else {
        // Distribute evenly around the circle
        degree = (360 / planets.length) * index;
      }

      const position = polarToCartesian(center, center, planetRadius, degree);
      return {
        ...planet,
        degree,
        x: position.x,
        y: position.y
      };
    });

    return positioned;
  };

  const positionedPlanets = positionPlanets();

  // Find planet position by name
  const findPlanet = (planetName) => {
    return positionedPlanets.find(p => 
      p.name === planetName || 
      p.name.toLowerCase() === planetName.toLowerCase()
    );
  };

  // Generate aspect lines
  const aspectLines = lines.map((line, index) => {
    const fromPlanet = findPlanet(line.from);
    const toPlanet = findPlanet(line.to);
    
    if (!fromPlanet || !toPlanet) {
      return null;
    }

    const style = aspectStyles[line.type] || aspectStyles[AspectTypes.CONJUNCTION];
    
    return (
      <line
        key={index}
        x1={fromPlanet.x}
        y1={fromPlanet.y}
        x2={toPlanet.x}
        y2={toPlanet.y}
        stroke={style.color}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
        opacity="0.8"
      />
    );
  }).filter(Boolean);

  return (
    <div className="pattern-wheel" style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
        />

        {/* 12 zodiac divisions (30° each) - faint guides */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = i * 30;
          const start = polarToCartesian(center, center, outerRadius - 10, angle);
          const end = polarToCartesian(center, center, outerRadius, angle);
          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          );
        })}

        {/* Aspect lines - render behind planets */}
        <g className="aspect-lines">
          {aspectLines}
        </g>

        {/* Planet dots and labels */}
        <g className="planets">
          {positionedPlanets.map((planet, index) => (
            <g key={index}>
              <circle
                cx={planet.x}
                cy={planet.y}
                r="4"
                fill="#d0a8ff"
                stroke="#8b5cf6"
                strokeWidth="1"
              />
              {/* Planet name label */}
              <text
                x={planet.x}
                y={planet.y - 10}
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="bold"
              >
                {planet.name}
              </text>
            </g>
          ))}
        </g>

        {/* Legend for aspect types (if multiple types present) */}
        {lines.length > 0 && (
          <g className="legend" transform={`translate(10, ${size - 50})`}>
            {Object.entries(AspectTypes).map(([name, type], index) => {
              const hasThisType = lines.some(line => line.type === type);
              if (!hasThisType) return null;
              
              const style = aspectStyles[type];
              const y = index * 12;
              
              return (
                <g key={type}>
                  <line
                    x1="0"
                    y1={y}
                    x2="15"
                    y2={y}
                    stroke={style.color}
                    strokeWidth={style.strokeWidth}
                    strokeDasharray={style.strokeDasharray}
                  />
                  <text
                    x="20"
                    y={y + 3}
                    fill="white"
                    fontSize="8"
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
};

export default PatternWheel;