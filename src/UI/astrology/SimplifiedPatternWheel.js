import React, { useRef, useEffect, memo } from 'react';
import useStore from '../../Utilities/store';

// Planet colors from ephemeris
const PLANET_COLORS = {
  Sun: '#FFD700',     // gold
  Moon: '#A9A9A9',    // grey
  Mercury: '#FFA500', // orange
  Venus: '#FF69B4',   // hot pink
  Mars: '#FF4500',    // red
  Jupiter: '#0000FF', // blue
  Saturn: '#800080',  // purple
  Uranus: '#00FFFF',  // cyan
  Neptune: '#4B0082', // indigo
  Pluto: '#8B4513',   // saddle brown
  Ascendant: '#32CD32', // lime green
  Midheaven: '#20B2AA', // light sea green
  Node: '#9ACD32'     // yellow green
};

// Planet Unicode symbols
const PLANET_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Ascendant: 'AC',
  Midheaven: 'MC',
  Node: '☊'
};

const SimplifiedPatternWheel = memo(({ 
  planets = [], 
  pattern = 'basic', 
  patternData = {}, 
  size = 150 
}) => {
  const canvasRef = useRef(null);
  const userPlanets = useStore(state => state.userPlanets);

  // Canvas dimensions
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = (size / 2) - 20;
  const planetRadius = outerRadius - 10;

  // Convert degree to canvas position - copied exactly from Ephemeris
  const degreeToPosition = (degree) => {
    // Find ascendant degree from ALL user planets, not just the pattern planets
    const ascendantPlanet = userPlanets.find(p => p.name === 'Ascendant');
    const currentAscendantDegree = ascendantPlanet ? (ascendantPlanet.degree || ascendantPlanet.full_degree || 0) : 0;
    
    // Use the EXACT same logic as Ephemeris
    const rotationRadians = ((270 + currentAscendantDegree) % 360) * Math.PI / 180;
    const truePlanetRadians = ((270 - degree) % 360) * Math.PI / 180 + rotationRadians;
    
    const position = {
      x: centerX + planetRadius * Math.cos(truePlanetRadians),
      y: centerY + planetRadius * Math.sin(truePlanetRadians)
    };
    return position;
  };

  // Draw the base wheel
  const drawBaseWheel = (ctx) => {
    ctx.clearRect(0, 0, size, size);
    
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Draw planets as simple dots
  const drawPlanets = (ctx, planetsToShow) => {
    planetsToShow.forEach(planet => {
      // Handle different property names: degree, full_degree
      const degree = planet.degree || planet.full_degree;
      if (degree === undefined) {
        return;
      }
      
      const position = degreeToPosition(degree);
      const color = PLANET_COLORS[planet.name] || '#ffffff';
      
      // Draw planet dot
      ctx.beginPath();
      ctx.arc(position.x, position.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw planet label using Unicode symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
      ctx.fillText(symbol, position.x, position.y - 8);
    });
  };

  // Draw arc for chart shape
  const drawArc = (ctx, startDeg, endDeg, color, width = 4) => {
    if (startDeg === undefined || endDeg === undefined) return;
    
    // Use the same coordinate system as degreeToPosition (with ascendant rotation)
    const ascendantPlanet = userPlanets.find(p => p.name === 'Ascendant');
    const currentAscendantDegree = ascendantPlanet ? (ascendantPlanet.degree || ascendantPlanet.full_degree || 0) : 0;
    const rotationRadians = ((270 + currentAscendantDegree) % 360) * Math.PI / 180;
    
    const startRadians = ((270 - startDeg) % 360) * Math.PI / 180 + rotationRadians;
    const endRadians = ((270 - endDeg) % 360) * Math.PI / 180 + rotationRadians;
    
    ctx.beginPath();
    
    // Calculate span
    let span = endDeg - startDeg;
    if (span < 0) span += 360;
    
    // Draw arc clockwise from start to end
    if (span > 180) {
      // For spans > 180°, we need to draw the long way around
      ctx.arc(centerX, centerY, outerRadius + 8, startRadians, endRadians, true);
    } else {
      // For spans <= 180°, draw the short way
      ctx.arc(centerX, centerY, outerRadius + 8, startRadians, endRadians, false);
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  // Draw arc for stellium - draw the SHORTEST path between start and end
  const drawStelliumArc = (ctx, startDeg, endDeg, color, width = 4) => {
    if (startDeg === undefined || endDeg === undefined) return;
    
    // Always draw the shorter arc between the two points
    // Calculate which direction gives us the shorter arc
    let span1 = endDeg - startDeg;
    if (span1 < 0) span1 += 360;
    
    let span2 = startDeg - endDeg;
    if (span2 < 0) span2 += 360;
    
    // Use whichever span is smaller
    let actualStart, actualEnd;
    
    if (span1 <= span2) {
      // Go from start to end (clockwise or short way)
      actualStart = startDeg;
      actualEnd = endDeg;
    } else {
      // Go from end to start (the shorter way around)
      actualStart = endDeg;
      actualEnd = startDeg;
    }
    
    // Use the same coordinate system as degreeToPosition (with ascendant rotation)
    const ascendantPlanet = userPlanets.find(p => p.name === 'Ascendant');
    const currentAscendantDegree = ascendantPlanet ? (ascendantPlanet.degree || ascendantPlanet.full_degree || 0) : 0;
    const rotationRadians = ((270 + currentAscendantDegree) % 360) * Math.PI / 180;
    
    // Ensure positive radians
    let startRadians = ((270 - actualStart) % 360) * Math.PI / 180 + rotationRadians;
    let endRadians = ((270 - actualEnd) % 360) * Math.PI / 180 + rotationRadians;
    
    if (startRadians < 0) startRadians += 2 * Math.PI;
    if (endRadians < 0) endRadians += 2 * Math.PI;
    
    // For clockwise drawing (counterclockwise=false), start should be < end
    // If start > end, we need to adjust to draw the shorter arc
    if (startRadians > endRadians) {
      // Swap them and draw the other direction
      const temp = startRadians;
      startRadians = endRadians;
      endRadians = temp;
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 8, startRadians, endRadians, false);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  // Draw aspect lines
  const drawAspectLines = (ctx, lines) => {
    lines.forEach(line => {
      const planet1 = planets.find(p => p.name === line.from);
      const planet2 = planets.find(p => p.name === line.to);
      
      if (!planet1 || !planet2) return;
      
      const pos1 = degreeToPosition(planet1.degree);
      const pos2 = degreeToPosition(planet2.degree);
      
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(pos2.x, pos2.y);
      
      // Set line style based on aspect type
      switch (line.type) {
        case 'square':
        case 'opposition':
          ctx.strokeStyle = 'rgba(255, 124, 124, 0.8)'; // red
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          break;
        case 'trine':
          ctx.strokeStyle = 'rgba(136, 225, 255, 0.8)'; // blue
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          break;
        case 'sextile':
          ctx.strokeStyle = 'rgba(79, 99, 255, 0.8)'; // indigo
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          break;
        case 'quincunx':
          ctx.strokeStyle = 'rgba(252, 211, 77, 0.8)'; // gold
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          break;
        default:
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
      }
      
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash
    });
  };

  // Calculate chart shape span - proper algorithm for finding largest empty gap
  const calculateChartShapeSpan = (planetsToShow) => {
    if (planetsToShow.length < 2) return null;
    
    // Filter to only include traditional planets (exclude Ascendant, Midheaven, Node)
    const traditionalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const filteredPlanets = planetsToShow.filter(p => traditionalPlanets.includes(p.name));
    
    // Handle both property names: degree and full_degree
    const degrees = filteredPlanets.map(p => p.degree || p.full_degree).filter(d => d !== undefined);
    if (degrees.length < 2) return null;
    
    // Sort degrees
    const sortedDegrees = [...degrees].sort((a, b) => a - b);
    
    // Calculate gaps between consecutive planets
    const gaps = [];
    for (let i = 0; i < sortedDegrees.length - 1; i++) {
      gaps.push({
        start: sortedDegrees[i],
        end: sortedDegrees[i + 1],
        size: sortedDegrees[i + 1] - sortedDegrees[i]
      });
    }
    
    // Add the wrap-around gap (from last planet to first planet)
    const wrapGap = {
      start: sortedDegrees[sortedDegrees.length - 1],
      end: sortedDegrees[0] + 360,
      size: 360 - sortedDegrees[sortedDegrees.length - 1] + sortedDegrees[0]
    };
    gaps.push(wrapGap);
    
    // Find the largest gap
    const largestGap = gaps.reduce((max, gap) => gap.size > max.size ? gap : max);
    
    // The occupied span is everything EXCEPT the largest gap
    if (largestGap === wrapGap) {
      // If largest gap wraps around 0°, occupied span is continuous
      return { 
        startDeg: sortedDegrees[0], 
        endDeg: sortedDegrees[sortedDegrees.length - 1] 
      };
    } else {
      // If largest gap is in the middle, occupied span wraps around
      return { 
        startDeg: largestGap.end % 360, 
        endDeg: largestGap.start + 360 
      };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    drawBaseWheel(ctx);
    
    switch (pattern) {
      case 'chartShape':
        // Filter to only show traditional planets for chart shape
        const traditionalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
        const filteredPlanets = planets.filter(p => traditionalPlanets.includes(p.name));
        drawPlanets(ctx, filteredPlanets);
        const span = calculateChartShapeSpan(filteredPlanets);
        if (span) {
          drawArc(ctx, span.startDeg, span.endDeg, '#8b5cf6', 6);
        }
        break;
        
      case 'stellium':
        drawPlanets(ctx, planets);
        if (patternData.startDeg !== undefined && patternData.endDeg !== undefined) {
          drawStelliumArc(ctx, patternData.startDeg, patternData.endDeg, '#f59e0b', 5);
        }
        break;
        
      case 'tSquare':
        drawPlanets(ctx, planets);
        if (patternData.lines) {
          drawAspectLines(ctx, patternData.lines);
        }
        break;
        
      case 'yod':
        drawPlanets(ctx, planets);
        if (patternData.lines) {
          drawAspectLines(ctx, patternData.lines);
        }
        break;
        
      case 'grandTrine':
        drawPlanets(ctx, planets);
        if (patternData.lines) {
          drawAspectLines(ctx, patternData.lines);
        }
        break;
        
      case 'grandCross':
        drawPlanets(ctx, planets);
        if (patternData.lines) {
          drawAspectLines(ctx, patternData.lines);
        }
        break;
        
      case 'kite':
        drawPlanets(ctx, planets);
        if (patternData.lines) {
          drawAspectLines(ctx, patternData.lines);
        }
        break;
        
      case 'mysticRectangle':
        drawPlanets(ctx, planets);
        if (patternData.lines) {
          drawAspectLines(ctx, patternData.lines);
        }
        break;
        
      default:
        drawPlanets(ctx, planets);
        break;
    }
  }, [planets, pattern, patternData, size]);

  return (
    <div className="simplified-pattern-wheel" style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.2)'
        }}
      />
      {patternData.label && (
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: '500'
        }}>
          {patternData.label}
        </div>
      )}
    </div>
  );
});

export default SimplifiedPatternWheel;