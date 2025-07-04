// Helper functions for generating aspect pattern lines

// Aspect types and their properties
export const AspectTypes = {
  TRINE: 'trine',
  SEXTILE: 'sextile', 
  SQUARE: 'square',
  OPPOSITION: 'opposition',
  QUINCUNX: 'quincunx',
  CONJUNCTION: 'conjunction'
};

// Aspect angle mappings (for validation)
export const AspectAngles = {
  [AspectTypes.CONJUNCTION]: 0,
  [AspectTypes.SEXTILE]: 60,
  [AspectTypes.SQUARE]: 90,
  [AspectTypes.TRINE]: 120,
  [AspectTypes.OPPOSITION]: 180,
  [AspectTypes.QUINCUNX]: 150
};

// Generate lines for Grand Trine pattern
export const grandTrineLines = (planets) => {
  if (!planets || planets.length !== 3) {
    return [];
  }
  
  const [planet1, planet2, planet3] = planets;
  return [
    { from: planet1, to: planet2, type: AspectTypes.TRINE },
    { from: planet2, to: planet3, type: AspectTypes.TRINE },
    { from: planet3, to: planet1, type: AspectTypes.TRINE }
  ];
};

// Generate lines for T-Square pattern
export const tSquareLines = (apex, opp1, opp2) => {
  if (!apex || !opp1 || !opp2) {
    return [];
  }
  
  return [
    { from: opp1, to: opp2, type: AspectTypes.OPPOSITION },
    { from: apex, to: opp1, type: AspectTypes.SQUARE },
    { from: apex, to: opp2, type: AspectTypes.SQUARE }
  ];
};

// Generate lines for Grand Cross pattern
export const grandCrossLines = (planets) => {
  if (!planets || planets.length !== 4) {
    return [];
  }
  
  const [p1, p2, p3, p4] = planets;
  return [
    { from: p1, to: p3, type: AspectTypes.OPPOSITION },
    { from: p2, to: p4, type: AspectTypes.OPPOSITION },
    { from: p1, to: p2, type: AspectTypes.SQUARE },
    { from: p2, to: p3, type: AspectTypes.SQUARE },
    { from: p3, to: p4, type: AspectTypes.SQUARE },
    { from: p4, to: p1, type: AspectTypes.SQUARE }
  ];
};

// Generate lines for Yod pattern
export const yodLines = (apex, base1, base2) => {
  if (!apex || !base1 || !base2) {
    return [];
  }
  
  return [
    { from: base1, to: base2, type: AspectTypes.SEXTILE },
    { from: apex, to: base1, type: AspectTypes.QUINCUNX },
    { from: apex, to: base2, type: AspectTypes.QUINCUNX }
  ];
};

// Generate lines for Kite pattern
export const kiteLines = (planets) => {
  if (!planets || planets.length !== 4) {
    return [];
  }
  
  // Kite = Grand Trine + one planet opposite one of the trine planets
  const [trine1, trine2, trine3, opposite] = planets;
  return [
    // Grand Trine
    { from: trine1, to: trine2, type: AspectTypes.TRINE },
    { from: trine2, to: trine3, type: AspectTypes.TRINE },
    { from: trine3, to: trine1, type: AspectTypes.TRINE },
    // Opposition and sextiles
    { from: trine1, to: opposite, type: AspectTypes.OPPOSITION },
    { from: trine2, to: opposite, type: AspectTypes.SEXTILE },
    { from: trine3, to: opposite, type: AspectTypes.SEXTILE }
  ];
};

// Generate lines for Mystic Rectangle pattern
export const mysticRectangleLines = (planets) => {
  if (!planets || planets.length !== 4) {
    return [];
  }
  
  const [p1, p2, p3, p4] = planets;
  return [
    { from: p1, to: p3, type: AspectTypes.OPPOSITION },
    { from: p2, to: p4, type: AspectTypes.OPPOSITION },
    { from: p1, to: p2, type: AspectTypes.TRINE },
    { from: p2, to: p3, type: AspectTypes.SEXTILE },
    { from: p3, to: p4, type: AspectTypes.TRINE },
    { from: p4, to: p1, type: AspectTypes.SEXTILE }
  ];
};

// Parse pattern strings to extract planet names and generate lines
export const parsePatternString = (patternString, patternType) => {
  if (!patternString || typeof patternString !== 'string') {
    return [];
  }

  // Extract planet names from pattern string
  // Examples:
  // "T-Square: Mercury (Taurus, house 11) opposite Pluto (Scorpio, house 5), both square Moon (Aquarius, house 9)"
  // "Grand Trine: Sun (Leo), Moon (Sagittarius), Jupiter (Aries)"
  // "Yod: Pluto (Libra, house 8) sextile Neptune (Sagittarius, house 11), both quincunx Mercury (Taurus, house 3) (apex)"

  const planetMatches = patternString.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|Midheaven|Node)\b/g);
  
  if (!planetMatches) {
    return [];
  }

  // Remove duplicates while preserving order
  const planets = [...new Set(planetMatches)];

  switch (patternType?.toLowerCase()) {
    case 'grand trine':
    case 'grandtrine':
      return grandTrineLines(planets);
    
    case 't-square':
    case 'tsquare':
    case 't-squares':
    case 'tsquares':
      if (planets.length >= 3) {
        // For T-Square pattern: "Planet1 opposite Planet2, both square Planet3"
        // Planet3 is the apex (the one being squared by both)
        const squareMatch = patternString.match(/both\s+square\s+(\w+)/);
        if (squareMatch) {
          const apex = squareMatch[1];
          const others = planets.filter(p => p !== apex);
          if (others.length >= 2) {
            return tSquareLines(apex, others[0], others[1]);
          }
        }
        // Fallback: assume last planet is apex
        return tSquareLines(planets[2], planets[0], planets[1]);
      }
      return [];
    
    case 'grand cross':
    case 'grandcross':
      return grandCrossLines(planets);
    
    case 'yod':
      if (planets.length >= 3) {
        // For Yod, apex is mentioned after "quincunx" or marked with "(apex)"
        const apexMatch = patternString.match(/(\w+).*\(apex\)/);
        const apex = apexMatch ? apexMatch[1] : planets[planets.length - 1];
        const others = planets.filter(p => p !== apex);
        return yodLines(apex, others[0], others[1]);
      }
      return [];
    
    case 'kite':
      return kiteLines(planets);
    
    case 'mystic rectangle':
    case 'mysticrectangle':
      return mysticRectangleLines(planets);
    
    default:
      return [];
  }
};

// Extract planets with positions from pattern strings
export const extractPlanetsFromPattern = (patternString, allPlanets) => {
  if (!patternString || !allPlanets || !Array.isArray(allPlanets)) {
    return [];
  }

  // Extract planet names from the pattern string
  const planetMatches = patternString.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|Midheaven|Node)\b/g);
  
  if (!planetMatches) {
    return [];
  }

  // Remove duplicates and find corresponding planet data
  const uniquePlanetNames = [...new Set(planetMatches)];
  
  return uniquePlanetNames.map(planetName => {
    const planetData = allPlanets.find(p => p.name === planetName);
    return {
      name: planetName,
      degree: planetData ? planetData.full_degree : 0
    };
  }).filter(planet => planet.degree !== undefined);
};

// Generate T-Square lines for SimplifiedPatternWheel
export const generateTSquareLines = (patternString) => {
  // Parse T-Square pattern: "Planet1 opposite Planet2, both square Planet3"
  const squareMatch = patternString.match(/both\s+square\s+(\w+)/);
  if (!squareMatch) return [];
  
  const apex = squareMatch[1];
  const planetMatches = patternString.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|Midheaven|Node)\b/g);
  
  if (!planetMatches || planetMatches.length < 3) return [];
  
  const others = planetMatches.filter(p => p !== apex);
  
  return [
    { from: others[0], to: others[1], type: 'opposition' },
    { from: apex, to: others[0], type: 'square' },
    { from: apex, to: others[1], type: 'square' }
  ];
};

// Generate Yod lines for SimplifiedPatternWheel
export const generateYodLines = (patternString) => {
  // Parse Yod pattern: "Planet1 sextile Planet2, both quincunx Planet3 (apex)"
  const apexMatch = patternString.match(/(\w+).*\(apex\)/);
  if (!apexMatch) return [];
  
  const apex = apexMatch[1];
  const planetMatches = patternString.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|Midheaven|Node)\b/g);
  
  if (!planetMatches || planetMatches.length < 3) return [];
  
  const others = planetMatches.filter(p => p !== apex);
  
  return [
    { from: others[0], to: others[1], type: 'sextile' },
    { from: apex, to: others[0], type: 'quincunx' },
    { from: apex, to: others[1], type: 'quincunx' }
  ];
};

// Generate Grand Trine lines for SimplifiedPatternWheel
export const generateGrandTrineLines = (patternString) => {
  const planetMatches = patternString.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|Midheaven|Node)\b/g);
  
  if (!planetMatches || planetMatches.length < 3) return [];
  
  const planets = [...new Set(planetMatches)].slice(0, 3);
  
  return [
    { from: planets[0], to: planets[1], type: 'trine' },
    { from: planets[1], to: planets[2], type: 'trine' },
    { from: planets[2], to: planets[0], type: 'trine' }
  ];
};

// Calculate span for stellium planets
export const calculateStelliumSpan = (stelliumString, allPlanets) => {
  if (!stelliumString || !allPlanets || !Array.isArray(allPlanets)) {
    return null;
  }

  // Extract planet names from stellium string
  const planetMatches = stelliumString.match(/\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|Midheaven|Node)\b/g);
  
  if (!planetMatches || planetMatches.length < 2) {
    return null;
  }

  // Get degrees for stellium planets
  const stelliumPlanets = [...new Set(planetMatches)].map(planetName => {
    const planetData = allPlanets.find(p => p.name === planetName);
    return planetData ? planetData.full_degree : null;
  }).filter(degree => degree !== null);

  if (stelliumPlanets.length < 2) {
    return null;
  }

  // Sort degrees
  const sortedDegrees = [...stelliumPlanets].sort((a, b) => a - b);
  
  // For stelliums, simply use first to last - let drawStelliumArc handle the logic
  return {
    startDeg: sortedDegrees[0],
    endDeg: sortedDegrees[sortedDegrees.length - 1]
  };
};

// Calculate stellium span directly from planet objects
export const calculateStelliumSpanFromPlanets = (planets) => {
  if (!planets || planets.length < 2) {
    return null;
  }

  // Get degrees from planet objects
  const degrees = planets.map(p => p.degree || p.full_degree).filter(d => d !== undefined);
  if (degrees.length < 2) {
    return null;
  }

  // Sort degrees
  const sortedDegrees = [...degrees].sort((a, b) => a - b);
  
  // For stelliums, simply use first to last - let drawStelliumArc handle the logic
  return {
    startDeg: sortedDegrees[0],
    endDeg: sortedDegrees[sortedDegrees.length - 1]
  };
};

// Generate T-Square lines from structured pattern data
export const generateTSquareLinesFromStructured = (pattern) => {
  const oppositionPlanets1 = pattern.opposition?.vertex1?.planets || [];
  const oppositionPlanets2 = pattern.opposition?.vertex2?.planets || [];
  const apexPlanets = pattern.apex?.planets || [];

  const lines = [];

  // Opposition line
  if (oppositionPlanets1.length > 0 && oppositionPlanets2.length > 0) {
    lines.push({
      from: oppositionPlanets1[0].name,
      to: oppositionPlanets2[0].name,
      type: 'opposition'
    });
  }

  // Square lines from apex to opposition planets
  if (apexPlanets.length > 0) {
    if (oppositionPlanets1.length > 0) {
      lines.push({
        from: apexPlanets[0].name,
        to: oppositionPlanets1[0].name,
        type: 'square'
      });
    }
    if (oppositionPlanets2.length > 0) {
      lines.push({
        from: apexPlanets[0].name,
        to: oppositionPlanets2[0].name,
        type: 'square'
      });
    }
  }

  return lines;
};

// Generate Yod lines from structured pattern data
export const generateYodLinesFromStructured = (pattern) => {
  const basePlanets1 = pattern.base?.vertex1?.planets || [];
  const basePlanets2 = pattern.base?.vertex2?.planets || [];
  const apexPlanets = pattern.apex?.planets || [];

  const lines = [];

  // Sextile line between base planets
  if (basePlanets1.length > 0 && basePlanets2.length > 0) {
    lines.push({
      from: basePlanets1[0].name,
      to: basePlanets2[0].name,
      type: 'sextile'
    });
  }

  // Quincunx lines from apex to base planets
  if (apexPlanets.length > 0) {
    if (basePlanets1.length > 0) {
      lines.push({
        from: apexPlanets[0].name,
        to: basePlanets1[0].name,
        type: 'quincunx'
      });
    }
    if (basePlanets2.length > 0) {
      lines.push({
        from: apexPlanets[0].name,
        to: basePlanets2[0].name,
        type: 'quincunx'
      });
    }
  }

  return lines;
};

// Generate Grand Trine lines from structured pattern data
export const generateGrandTrineLinesFromStructured = (pattern) => {
  const vertices = pattern.vertices || [];
  if (vertices.length < 3) return [];

  const lines = [];

  // Trine lines between all three vertices
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const currentPlanets = vertices[i].planets || [];
    const nextPlanets = vertices[nextIndex].planets || [];

    if (currentPlanets.length > 0 && nextPlanets.length > 0) {
      lines.push({
        from: currentPlanets[0].name,
        to: nextPlanets[0].name,
        type: 'trine'
      });
    }
  }

  return lines;
};

// Generate Grand Cross lines from structured pattern data
export const generateGrandCrossLinesFromStructured = (pattern) => {
  const vertices = pattern.vertices || [];
  if (vertices.length < 4) return [];

  const lines = [];

  // Add opposition lines (opposite vertices)
  for (let i = 0; i < 2; i++) {
    const vertex1 = vertices[i];
    const vertex2 = vertices[i + 2]; // Opposite vertex
    const planets1 = vertex1.planets || [];
    const planets2 = vertex2.planets || [];

    if (planets1.length > 0 && planets2.length > 0) {
      lines.push({
        from: planets1[0].name,
        to: planets2[0].name,
        type: 'opposition'
      });
    }
  }

  // Add square lines (adjacent vertices)
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const currentPlanets = vertices[i].planets || [];
    const nextPlanets = vertices[nextIndex].planets || [];

    if (currentPlanets.length > 0 && nextPlanets.length > 0) {
      lines.push({
        from: currentPlanets[0].name,
        to: nextPlanets[0].name,
        type: 'square'
      });
    }
  }

  return lines;
};

// Generate Kite lines from structured pattern data
export const generateKiteLinesFromStructured = (pattern) => {
  const trineVertices = pattern.grandTrine?.vertices || [];
  const apexPlanets = pattern.apex?.planets || [];

  if (trineVertices.length < 3 || apexPlanets.length === 0) return [];

  const lines = [];

  // Grand Trine lines
  for (let i = 0; i < trineVertices.length; i++) {
    const nextIndex = (i + 1) % trineVertices.length;
    const currentPlanets = trineVertices[i].planets || [];
    const nextPlanets = trineVertices[nextIndex].planets || [];

    if (currentPlanets.length > 0 && nextPlanets.length > 0) {
      lines.push({
        from: currentPlanets[0].name,
        to: nextPlanets[0].name,
        type: 'trine'
      });
    }
  }

  // Lines from apex to trine vertices
  trineVertices.forEach(vertex => {
    const vertexPlanets = vertex.planets || [];
    if (vertexPlanets.length > 0) {
      lines.push({
        from: apexPlanets[0].name,
        to: vertexPlanets[0].name,
        type: 'sextile' // Kites typically have sextiles from apex to two vertices, opposition to one
      });
    }
  });

  return lines;
};

// Generate Mystic Rectangle lines from structured pattern data
export const generateMysticRectangleLinesFromStructured = (pattern) => {
  const vertices = pattern.vertices || [];
  if (vertices.length < 4) return [];

  const lines = [];

  // Opposition lines (opposite vertices)
  for (let i = 0; i < 2; i++) {
    const vertex1 = vertices[i];
    const vertex2 = vertices[i + 2]; // Opposite vertex
    const planets1 = vertex1.planets || [];
    const planets2 = vertex2.planets || [];

    if (planets1.length > 0 && planets2.length > 0) {
      lines.push({
        from: planets1[0].name,
        to: planets2[0].name,
        type: 'opposition'
      });
    }
  }

  // Sextile and trine lines (adjacent vertices)
  for (let i = 0; i < vertices.length; i++) {
    const nextIndex = (i + 1) % vertices.length;
    const currentPlanets = vertices[i].planets || [];
    const nextPlanets = vertices[nextIndex].planets || [];

    if (currentPlanets.length > 0 && nextPlanets.length > 0) {
      // Alternate between sextile and trine for mystic rectangle
      const aspectType = i % 2 === 0 ? 'sextile' : 'trine';
      lines.push({
        from: currentPlanets[0].name,
        to: nextPlanets[0].name,
        type: aspectType
      });
    }
  }

  return lines;
};

// Extract all patterns from userPatterns object and generate lines
export const extractPatternLines = (userPatterns) => {
  const allLines = [];
  
  if (!userPatterns || typeof userPatterns !== 'object') {
    return allLines;
  }

  // Process each pattern type with proper type mapping
  const patternTypeMap = {
    'grandTrines': 'grand trine',
    'tSquares': 't-square',
    'grandCrosses': 'grand cross',
    'yods': 'yod',
    'kites': 'kite',
    'mysticRectangles': 'mystic rectangle'
  };

  Object.entries(patternTypeMap).forEach(([key, type]) => {
    const patterns = userPatterns[key];
    if (Array.isArray(patterns) && patterns.length > 0) {
      patterns.forEach(patternString => {
        const lines = parsePatternString(patternString, type);
        if (lines.length > 0) {
          allLines.push(...lines);
        }
      });
    }
  });

  return allLines;
};