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

  // Calculate multi-section chart patterns (bucket, seesaw, splay, splash)
  const calculatePatternSections = (planetsToShow, patternType, patternDescription = '') => {
    if (planetsToShow.length < 2) return [];
    
    // Filter to only include traditional planets
    const traditionalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const filteredPlanets = planetsToShow.filter(p => traditionalPlanets.includes(p.name));
    
    const degrees = filteredPlanets.map(p => ({
      name: p.name,
      degree: p.degree || p.full_degree
    })).filter(p => p.degree !== undefined);
    
    if (degrees.length < 2) return [];
    
    // Sort by degree
    const sortedPlanets = [...degrees].sort((a, b) => a.degree - b.degree);
    
    // Calculate gaps between consecutive planets
    const gaps = [];
    for (let i = 0; i < sortedPlanets.length - 1; i++) {
      gaps.push({
        start: sortedPlanets[i].degree,
        end: sortedPlanets[i + 1].degree,
        size: sortedPlanets[i + 1].degree - sortedPlanets[i].degree,
        afterPlanet: sortedPlanets[i].name,
        beforePlanet: sortedPlanets[i + 1].name
      });
    }
    
    // Add wrap-around gap
    const wrapGap = {
      start: sortedPlanets[sortedPlanets.length - 1].degree,
      end: sortedPlanets[0].degree + 360,
      size: 360 - sortedPlanets[sortedPlanets.length - 1].degree + sortedPlanets[0].degree,
      afterPlanet: sortedPlanets[sortedPlanets.length - 1].name,
      beforePlanet: sortedPlanets[0].name
    };
    gaps.push(wrapGap);
    
    // Sort gaps by size (largest first)
    gaps.sort((a, b) => b.size - a.size);
    
    const sections = [];
    
    switch (patternType) {
      case 'bucket':
        // Bucket: all planets in one hemisphere except for one "handle" on the opposite side
        // First, find if there's a planet that's roughly opposite to all others
        
        // Calculate the center of mass for all planets
        let sumX = 0, sumY = 0;
        sortedPlanets.forEach(planet => {
          const rad = planet.degree * Math.PI / 180;
          sumX += Math.cos(rad);
          sumY += Math.sin(rad);
        });
        const centerX = sumX / sortedPlanets.length;
        const centerY = sumY / sortedPlanets.length;
        const centerDegree = Math.atan2(centerY, centerX) * 180 / Math.PI;
        const normalizedCenter = centerDegree < 0 ? centerDegree + 360 : centerDegree;
        
        // Find the planet that's furthest from the center of mass
        let bestHandle = null;
        let maxDistance = 0;
        
        sortedPlanets.forEach(planet => {
          // Calculate angular distance from center
          let distance = Math.abs(planet.degree - normalizedCenter);
          if (distance > 180) distance = 360 - distance;
          
          // Also check if this planet is isolated (has large gaps on both sides)
          const planetIndex = sortedPlanets.indexOf(planet);
          const prevIndex = (planetIndex - 1 + sortedPlanets.length) % sortedPlanets.length;
          const nextIndex = (planetIndex + 1) % sortedPlanets.length;
          
          let gapBefore = planet.degree - sortedPlanets[prevIndex].degree;
          if (gapBefore <= 0) gapBefore += 360;
          
          let gapAfter = sortedPlanets[nextIndex].degree - planet.degree;
          if (gapAfter <= 0) gapAfter += 360;
          
          const minGap = Math.min(gapBefore, gapAfter);
          
          // Prioritize planets that are both far from center AND isolated
          if (distance > 120 && minGap > 30 && distance > maxDistance) {
            maxDistance = distance;
            bestHandle = planet;
          }
        });
        
        // If no clear handle found, try finding the most isolated planet
        if (!bestHandle) {
          let bestIsolation = 0;
          sortedPlanets.forEach((planet, index) => {
            const prevIndex = (index - 1 + sortedPlanets.length) % sortedPlanets.length;
            const nextIndex = (index + 1) % sortedPlanets.length;
            
            let gapBefore = planet.degree - sortedPlanets[prevIndex].degree;
            if (gapBefore <= 0) gapBefore += 360;
            
            let gapAfter = sortedPlanets[nextIndex].degree - planet.degree;
            if (gapAfter <= 0) gapAfter += 360;
            
            const isolation = Math.min(gapBefore, gapAfter);
            
            if (isolation > bestIsolation && isolation > 60) {
              bestIsolation = isolation;
              bestHandle = planet;
            }
          });
        }
        
        // If pattern description mentions a specific planet as handle, use that
        if (!bestHandle && patternDescription) {
          const desc = patternDescription.toLowerCase();
          // Check for planet names in the description
          const planetMentions = sortedPlanets.filter(p => 
            desc.includes(p.name.toLowerCase())
          );
          if (planetMentions.length === 1) {
            bestHandle = planetMentions[0];
          }
        }
        
        // If we found an isolated planet, create bucket visualization
        if (bestHandle) {
          const bowlPlanets = sortedPlanets.filter(p => p !== bestHandle);
          
          // Bowl section (remaining planets) - create lines like Yod pattern
          if (bowlPlanets.length > 1) {
            const sortedBowlDegrees = bowlPlanets.map(p => p.degree).sort((a, b) => a - b);
            const bowlStart = bowlPlanets.find(p => p.degree === sortedBowlDegrees[0]);
            const bowlEnd = bowlPlanets.find(p => p.degree === sortedBowlDegrees[sortedBowlDegrees.length - 1]);
            
            // Create lines from handle to both ends of the bowl
            const lines = [];
            if (bowlStart) {
              lines.push({
                from: bestHandle.name,
                to: bowlStart.name,
                type: 'bucket_line'
              });
            }
            if (bowlEnd && bowlEnd !== bowlStart) {
              lines.push({
                from: bestHandle.name,
                to: bowlEnd.name,
                type: 'bucket_line'
              });
            }
            
            sections.push({
              type: 'bucket_lines',
              lines: lines,
              color: '#f59e0b',
              width: 3
            });
            
            // Also add the bowl arc
            sections.push({
              type: 'bowl',
              bowlPlanets: bowlPlanets,
              color: '#8b5cf6',
              width: 6
            });
          }
        }
        break;
        
      case 'seesaw':
        // Seesaw: two groups separated by large gaps
        if (gaps.length >= 2 && gaps[0].size > 60 && gaps[1].size > 60) {
          // Find the two largest gaps and split planets into two groups
          const gap1 = gaps[0];
          const gap2 = gaps[1];
          
          // Create sections for each group
          let currentGroup = [];
          let groups = [];
          
          for (let i = 0; i < sortedPlanets.length; i++) {
            const planet = sortedPlanets[i];
            const nextPlanet = sortedPlanets[(i + 1) % sortedPlanets.length];
            
            currentGroup.push(planet);
            
            // Check if there's a large gap after this planet
            const gapAfter = gaps.find(g => g.afterPlanet === planet.name);
            if (gapAfter && (gapAfter === gap1 || gapAfter === gap2)) {
              groups.push([...currentGroup]);
              currentGroup = [];
            }
          }
          
          if (currentGroup.length > 0) {
            groups.push(currentGroup);
          }
          
          // Draw sections for each group
          groups.forEach((group, index) => {
            if (group.length > 0) {
              const startDeg = Math.min(...group.map(p => p.degree));
              const endDeg = Math.max(...group.map(p => p.degree));
              sections.push({
                type: `group${index + 1}`,
                startDeg,
                endDeg,
                color: index === 0 ? '#8b5cf6' : '#f59e0b',
                width: 5
              });
            }
          });
        }
        break;
        
      case 'splay':
      case 'splash':
        // Splay/Splash: multiple small groups scattered around
        // Group planets that are close together (within 30-40 degrees)
        const threshold = patternType === 'splay' ? 40 : 30;
        let groups = [];
        let currentGroup = [sortedPlanets[0]];
        
        for (let i = 1; i < sortedPlanets.length; i++) {
          const prevPlanet = sortedPlanets[i - 1];
          const currPlanet = sortedPlanets[i];
          const gap = currPlanet.degree - prevPlanet.degree;
          
          if (gap <= threshold) {
            currentGroup.push(currPlanet);
          } else {
            groups.push([...currentGroup]);
            currentGroup = [currPlanet];
          }
        }
        groups.push(currentGroup);
        
        // Check wrap-around for last and first planet
        const wrapGap = 360 - sortedPlanets[sortedPlanets.length - 1].degree + sortedPlanets[0].degree;
        if (wrapGap <= threshold && groups.length > 1) {
          // Merge first and last groups
          const lastGroup = groups.pop();
          groups[0] = [...lastGroup, ...groups[0]];
        }
        
        // Create sections for each group
        groups.forEach((group, index) => {
          if (group.length > 0) {
            const degrees = group.map(p => p.degree);
            const startDeg = Math.min(...degrees);
            const endDeg = Math.max(...degrees);
            
            // For single planets, show a small arc
            const adjustedStart = group.length === 1 ? startDeg - 5 : startDeg;
            const adjustedEnd = group.length === 1 ? endDeg + 5 : endDeg;
            
            sections.push({
              type: `cluster${index + 1}`,
              startDeg: adjustedStart,
              endDeg: adjustedEnd,
              color: `hsl(${(index * 60) % 360}, 70%, 60%)`,
              width: 4
            });
          }
        });
        break;
    }
    
    return sections;
  };

  // Draw arc specifically for bucket bowl pattern
  const drawBucketBowlArc = (ctx, bowlPlanets, color, width = 6) => {
    if (bowlPlanets.length < 2) return;
    
    // Get all bowl planet degrees and sort them
    const degrees = bowlPlanets.map(p => p.degree).sort((a, b) => a - b);
    
    // Find the smallest arc that contains all bowl planets
    // Try each planet as a starting point and find the shortest span
    let bestStart = 0;
    let bestEnd = 0;
    let bestSpan = 360;
    
    for (let i = 0; i < degrees.length; i++) {
      const start = degrees[i];
      // Find the span to reach all other planets going clockwise
      let maxSpan = 0;
      
      for (let j = 0; j < degrees.length; j++) {
        if (i === j) continue;
        let span = degrees[j] - start;
        if (span < 0) span += 360;
        if (span > maxSpan) maxSpan = span;
      }
      
      if (maxSpan < bestSpan) {
        bestSpan = maxSpan;
        bestStart = start;
        bestEnd = start + maxSpan;
      }
    }
    
    // Use the stellium arc drawing which handles short arcs correctly
    drawStelliumArc(ctx, bestStart, bestEnd, color, width);
  };

  // Draw multiple pattern sections
  const drawPatternSections = (ctx, sections, bowlPlanets = null) => {
    sections.forEach(section => {
      if (section.type === 'bucket_lines') {
        // Draw lines like Yod pattern
        if (section.lines) {
          section.lines.forEach(line => {
            const planet1 = planets.find(p => p.name === line.from);
            const planet2 = planets.find(p => p.name === line.to);
            
            if (!planet1 || !planet2) return;
            
            const pos1 = degreeToPosition(planet1.degree || planet1.full_degree);
            const pos2 = degreeToPosition(planet2.degree || planet2.full_degree);
            
            ctx.beginPath();
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
            
            // Orange lines for bucket pattern
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.stroke();
          });
        }
      } else if (section.type === 'handle') {
        // Draw around the actual handle planet
        drawArc(ctx, section.startDeg, section.endDeg, section.color, section.width);
      } else if (section.type === 'bowl' && bowlPlanets) {
        // Use special bucket bowl drawing
        drawBucketBowlArc(ctx, bowlPlanets, section.color, section.width);
      } else if (section.type === 'bowl' && section.bowlPlanets) {
        // Use special bucket bowl drawing
        drawBucketBowlArc(ctx, section.bowlPlanets, section.color, section.width);
      } else {
        // Use standard arc drawing
        drawArc(ctx, section.startDeg, section.endDeg, section.color, section.width);
      }
    });
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
        
        // Check if patternData specifies a multi-section pattern type
        const patternType = patternData.patternType || patternData.name?.toLowerCase();
        if (patternType && ['bucket', 'seesaw', 'splay', 'splash'].includes(patternType)) {
          const sections = calculatePatternSections(filteredPlanets, patternType, patternData.description || '');
          // For bucket pattern, we need to pass bowl planets info
          const bowlSection = sections.find(s => s.type === 'bowl');
          drawPatternSections(ctx, sections, bowlSection?.bowlPlanets);
          // Don't draw anything else for multi-section patterns
        } else {
          // Default single-section chart shape
          const span = calculateChartShapeSpan(filteredPlanets);
          if (span) {
            drawArc(ctx, span.startDeg, span.endDeg, '#8b5cf6', 6);
          }
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