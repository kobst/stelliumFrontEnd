import React from 'react';

const ChartShapeWheel = ({ startDeg, endDeg, planets = [], size = 200 }) => {
  // Calculate the center and radius
  const center = size / 2;
  const outerRadius = center - 10;
  const innerRadius = outerRadius - 20;
  const planetRadius = outerRadius - 10;

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

  // Create path for the occupied arc
  const createArcPath = (centerX, centerY, radius, startAngle, endAngle) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // Generate planet positions
  const planetPositions = planets.map(planet => {
    const position = polarToCartesian(center, center, planetRadius, planet.degree);
    return {
      ...planet,
      x: position.x,
      y: position.y
    };
  });

  return (
    <div className="chart-shape-wheel" style={{ display: 'flex', justifyContent: 'center' }}>
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
        
        {/* Inner ring */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />

        {/* Occupied arc - highlight the span where planets are concentrated */}
        {startDeg !== undefined && endDeg !== undefined && (
          <path
            d={createArcPath(center, center, (outerRadius + innerRadius) / 2, startDeg, endDeg)}
            fill="none"
            stroke="rgba(139, 92, 246, 0.8)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}

        {/* 12 zodiac divisions (30° each) */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = i * 30;
          const start = polarToCartesian(center, center, innerRadius, angle);
          const end = polarToCartesian(center, center, outerRadius, angle);
          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Planet dots */}
        {planetPositions.map((planet, index) => (
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
              fontSize="10"
              fontWeight="bold"
            >
              {planet.name}
            </text>
          </g>
        ))}

        {/* Center label showing chart shape */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          fill="rgba(139, 92, 246, 0.9)"
          fontSize="12"
          fontWeight="bold"
        >
          Chart Shape
        </text>
      </svg>
    </div>
  );
};

export default ChartShapeWheel;