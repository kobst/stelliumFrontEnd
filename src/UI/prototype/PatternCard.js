import React, { useEffect, memo } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import SimplifiedPatternWheel from '../astrology/SimplifiedPatternWheel';
import { 
  extractPlanetsFromPattern, 
  generateTSquareLines, 
  generateYodLines, 
  generateGrandTrineLines,
  calculateStelliumSpan,
  calculateStelliumSpanFromPlanets,
  generateTSquareLinesFromStructured,
  generateYodLinesFromStructured,
  generateGrandTrineLinesFromStructured,
  generateGrandCrossLinesFromStructured,
  generateKiteLinesFromStructured,
  generateMysticRectangleLinesFromStructured
} from '../../utils/patternHelpers';
import useStore from '../../Utilities/store';
import '../astrology/astrology.css';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const PatternCard = ({ title, data, type }) => {
  const userPlanets = useStore(state => state.userPlanets);
  
  useEffect(() => {
    // Component will re-render when any of these dependencies change
  }, [title, type, data, userPlanets]);

  const getChartData = () => {
    // Add null checks to prevent crashes
    if (!data) return null;

    switch (type) {
      case 'elements':
        if (!data.elements || !Array.isArray(data.elements)) return null;
        return {
          labels: data.elements.map(e => e.name),
          datasets: [{
            data: data.elements.map(e => e.percentage),
            backgroundColor: [
              '#FF6384', // Fire
              '#36A2EB', // Air
              '#FFCE56', // Earth
              '#4BC0C0'  // Water
            ],
            borderWidth: 1
          }]
        };
      case 'modalities':
        if (!data.modalities || !Array.isArray(data.modalities)) return null;
        return {
          labels: data.modalities.map(m => m.name),
          datasets: [{
            data: data.modalities.map(m => m.percentage),
            backgroundColor: [
              '#FF6384', // Cardinal
              '#36A2EB', // Fixed
              '#FFCE56'  // Mutable
            ],
            borderWidth: 1
          }]
        };
      case 'quadrants':
        if (!data.quadrants || !Array.isArray(data.quadrants)) return null;
        return {
          labels: data.quadrants.map(q => q.name),
          datasets: [{
            label: 'Planet Distribution',
            data: data.quadrants.map(q => q.percentage),
            backgroundColor: '#36A2EB',
            borderWidth: 1
          }]
        };
      case 'planetary':
        if (!data.planets || !Array.isArray(data.planets)) return null;
        return {
          labels: data.planets.map(p => p.name),
          datasets: [{
            label: 'Planetary Dominance',
            data: data.planets.map(p => p.percentage),
            backgroundColor: [
              '#FFD700', // Sun - Gold
              '#C0C0C0', // Moon - Silver
              '#FF4500', // Mars - Red
              '#32CD32', // Mercury - Green
              '#FF69B4', // Venus - Pink
              '#4169E1', // Jupiter - Royal Blue
              '#8B4513', // Saturn - Saddle Brown
              '#00FFFF', // Uranus - Cyan
              '#4B0082', // Neptune - Indigo
              '#800080', // Pluto - Purple
              '#FF6347', // Ascendant - Tomato
              '#20B2AA', // Midheaven - Light Sea Green
              '#9ACD32'  // Node - Yellow Green
            ],
            borderWidth: 1
          }]
        };
      default:
        return null;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: 'white',
          font: {
            weight: 'bold'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    scales: type === 'quadrants' ? {
      x: {
        ticks: {
          color: 'white',
          font: {
            weight: 'bold',
            size: 12
          }
        }
      },
      y: {
        ticks: {
          color: 'white',
          font: {
            weight: 'bold'
          }
        }
      }
    } : {}
  };

  const renderChart = () => {
    const chartData = getChartData();
    if (!chartData) return null;

    // Only render chart for quadrants, not for planetary dominance
    if (type === 'quadrants') {
      return (
        <div style={{ height: '200px', marginBottom: '20px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      );
    }
    
    // For other types (elements, modalities), render pie chart
    if (type === 'elements' || type === 'modalities') {
      return (
        <div style={{ height: '200px', marginBottom: '20px' }}>
          <Pie data={chartData} options={chartOptions} />
        </div>
      );
    }

    // For planetary dominance, don't render a chart here
    return null;
  };

  const renderPlanetDistribution = () => {
    // Add null checks to prevent crashes
    if (!data) return null;

    switch (type) {
      case 'elements':
        if (!data.elements || !Array.isArray(data.elements)) return null;
        return (
          <div className="planet-distribution">
            {data.elements.map((element, index) => (
              <div key={element.name} className="distribution-item">
                <span className="category-name">{element.name}</span>
                <div className="planet-list">
                  {(element.planets || []).map(planet => (
                    <span key={planet} className="planet-tag">
                      {planet}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'modalities':
        if (!data.modalities || !Array.isArray(data.modalities)) return null;
        return (
          <div className="planet-distribution">
            {data.modalities.map((modality, index) => (
              <div key={modality.name} className="distribution-item">
                <span className="category-name">{modality.name}</span>
                <div className="planet-list">
                  {(modality.planets || []).map(planet => (
                    <span key={planet} className="planet-tag">
                      {planet}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'quadrants':
        if (!data.quadrants || !Array.isArray(data.quadrants)) return null;
        return (
          <div className="planet-distribution">
            {data.quadrants.map((quadrant, index) => (
              <div key={quadrant.name} className="distribution-item">
                <span className="category-name">{quadrant.name}</span>
                <div className="planet-list">
                  {(quadrant.planets || []).map(planet => (
                    <span key={planet} className="planet-tag">
                      {planet}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 'planetary':
        if (!data.planets || !Array.isArray(data.planets) || data.planets.length === 0) return null;
        
        // Find the maximum percentage to scale all bars relative to it
        const maxPercentage = Math.max(...data.planets.map(p => p.percentage || 0));
        
        return (
          <div className="planet-distribution">
            {data.planets.map((planet, index) => {
              // Calculate the relative width based on the max percentage
              const relativeWidth = maxPercentage > 0 ? (planet.percentage / maxPercentage) * 100 : 0;
              
              return (
                <div key={planet.name} className="distribution-item" style={{ 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px'
                }}>
                  <span className="category-name" style={{
                    fontWeight: 'bold',
                    color: '#ffffff',
                    fontSize: '0.95em',
                    minWidth: '120px'
                  }}>{planet.name || 'Unknown'}</span>
                  <div style={{
                    flex: 1,
                    margin: '0 15px',
                    background: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: '4px',
                    height: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${relativeWidth}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span className="percentage-display" style={{
                    fontWeight: 'bold',
                    color: '#ffffff',
                    fontSize: '0.9em',
                    minWidth: '45px',
                    textAlign: 'right'
                  }}>{planet.percentage || 0}%</span>
                </div>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  const renderPatterns = () => {
    if (!data.patterns) {
      return null;
    }

    // Handle the nested structure: data.patterns.patterns
    const patternsData = data.patterns.patterns || data.patterns;

    // Handle new JSON format - array of pattern objects
    if (Array.isArray(patternsData)) {
      return renderNewFormatPatterns(patternsData);
    }

    // Handle legacy backend format with descriptions array
    if (patternsData.descriptions && Array.isArray(patternsData.descriptions)) {
      return (
        <div className="patterns-content">
          <div className="pattern-section">
            <h5>Chart Patterns</h5>
            <ul>
              {patternsData.descriptions.map((pattern, index) => (
                <li key={index}>{pattern}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    // Handle old text-based format
    return renderLegacyFormatPatterns(patternsData);
  };

  const renderNewFormatPatterns = (patterns) => {
    // Collect all patterns from the new JSON structure
    const allPatterns = [];

    patterns.forEach((pattern, index) => {
      switch (pattern.type) {
        case 'chart_shape':
          if (userPlanets && userPlanets.length > 0) {
            allPatterns.push({
              key: `chartShape-${pattern.id || index}`,
              type: 'chartShape',
              label: 'Chart Shape',
              description: pattern.description,
              component: (
                <SimplifiedPatternWheel
                  planets={userPlanets}
                  pattern="chartShape"
                  patternData={{
                    label: 'Chart Shape'
                  }}
                  size={140}
                />
              )
            });
          }
          break;

        case 'stellium':
          // Extract planets from the structured data
          const stelliumPlanets = pattern.vertex?.planets || [];
          const stelliumPlanetsForViz = stelliumPlanets.map(p => ({
            name: p.name,
            degree: p.degree,
            full_degree: p.degree
          }));
          
          if (stelliumPlanetsForViz.length > 0) {
            const stelliumSpan = calculateStelliumSpanFromPlanets(stelliumPlanetsForViz);
            allPatterns.push({
              key: `stellium-${pattern.id || index}`,
              type: 'stellium',
              label: `Stellium`,
              description: pattern.description,
              component: (
                <SimplifiedPatternWheel
                  planets={stelliumPlanetsForViz}
                  pattern="stellium"
                  patternData={{
                    startDeg: stelliumSpan?.startDeg,
                    endDeg: stelliumSpan?.endDeg,
                    label: 'Stellium'
                  }}
                  size={140}
                />
              )
            });
          }
          break;

        case 't_square':
          // Extract planets from opposition vertices and apex
          const tSquarePlanets = [
            ...(pattern.opposition?.vertex1?.planets || []),
            ...(pattern.opposition?.vertex2?.planets || []),
            ...(pattern.apex?.planets || [])
          ].map(p => ({
            name: p.name,
            degree: p.degree,
            full_degree: p.degree
          }));

          if (tSquarePlanets.length >= 3) {
            const lines = generateTSquareLinesFromStructured(pattern);
            allPatterns.push({
              key: `tSquare-${pattern.id || index}`,
              type: 'tSquare',
              label: 'T-Square',
              description: pattern.description,
              component: (
                <SimplifiedPatternWheel
                  planets={tSquarePlanets}
                  pattern="tSquare"
                  patternData={{
                    lines,
                    label: 'T-Square'
                  }}
                  size={140}
                />
              )
            });
          }
          break;

        case 'yod':
          // Extract planets from yod structure
          const yodPlanets = [
            ...(pattern.base?.vertex1?.planets || []),
            ...(pattern.base?.vertex2?.planets || []),
            ...(pattern.apex?.planets || [])
          ].map(p => ({
            name: p.name,
            degree: p.degree,
            full_degree: p.degree
          }));

          if (yodPlanets.length >= 3) {
            const lines = generateYodLinesFromStructured(pattern);
            allPatterns.push({
              key: `yod-${pattern.id || index}`,
              type: 'yod',
              label: 'Yod',
              description: pattern.description,
              component: (
                <SimplifiedPatternWheel
                  planets={yodPlanets}
                  pattern="yod"
                  patternData={{
                    lines,
                    label: 'Yod'
                  }}
                  size={140}
                />
              )
            });
          }
          break;

        case 'grand_trine':
          // Extract planets from grand trine vertices
          const grandTrinePlanets = (pattern.vertices || []).flatMap(vertex => 
            vertex.planets || []
          ).map(p => ({
            name: p.name,
            degree: p.degree,
            full_degree: p.degree
          }));

          if (grandTrinePlanets.length >= 3) {
            const lines = generateGrandTrineLinesFromStructured(pattern);
            allPatterns.push({
              key: `grandTrine-${pattern.id || index}`,
              type: 'grandTrine',
              label: 'Grand Trine',
              description: pattern.description,
              component: (
                <SimplifiedPatternWheel
                  planets={grandTrinePlanets}
                  pattern="grandTrine"
                  patternData={{
                    lines,
                    label: 'Grand Trine'
                  }}
                  size={140}
                />
              )
            });
          }
          break;

        case 'grand_cross':
          // Extract planets from grand cross vertices
          const grandCrossPlanets = (pattern.vertices || []).flatMap(vertex => 
            vertex.planets || []
          ).map(p => ({
            name: p.name,
            degree: p.degree,
            full_degree: p.degree
          }));

          if (grandCrossPlanets.length >= 4) {
            const lines = generateGrandCrossLinesFromStructured(pattern);
            allPatterns.push({
              key: `grandCross-${pattern.id || index}`,
              type: 'grandCross',
              label: 'Grand Cross',
              description: pattern.description,
              component: (
                <SimplifiedPatternWheel
                  planets={grandCrossPlanets}
                  pattern="grandCross"
                  patternData={{
                    lines,
                    label: 'Grand Cross'
                  }}
                  size={140}
                />
              )
            });
          }
          break;

        case 'kite':
          // Extract planets from kite pattern (grand trine + apex)
          const kitePlanets = [
            ...(pattern.grandTrine?.vertices || []).flatMap(vertex => vertex.planets || []),
            ...(pattern.apex?.planets || [])
          ].map(p => ({
            name: p.name,
            degree: p.degree,
            full_degree: p.degree
          }));

          if (kitePlanets.length >= 4) {
            const lines = generateKiteLinesFromStructured(pattern);
            allPatterns.push({
              key: `kite-${pattern.id || index}`,
              type: 'kite',
              label: 'Kite',
              description: pattern.description,
              component: (
                <SimplifiedPatternWheel
                  planets={kitePlanets}
                  pattern="kite"
                  patternData={{
                    lines,
                    label: 'Kite'
                  }}
                  size={140}
                />
              )
            });
          }
          break;

        case 'mystic_rectangle':
          // Extract planets from mystic rectangle vertices
          const mysticRectanglePlanets = (pattern.vertices || []).flatMap(vertex => 
            vertex.planets || []
          ).map(p => ({
            name: p.name,
            degree: p.degree,
            full_degree: p.degree
          }));

          if (mysticRectanglePlanets.length >= 4) {
            const lines = generateMysticRectangleLinesFromStructured(pattern);
            allPatterns.push({
              key: `mysticRectangle-${pattern.id || index}`,
              type: 'mysticRectangle',
              label: 'Mystic Rectangle',
              description: pattern.description,
              component: (
                <SimplifiedPatternWheel
                  planets={mysticRectanglePlanets}
                  pattern="mysticRectangle"
                  patternData={{
                    lines,
                    label: 'Mystic Rectangle'
                  }}
                  size={140}
                />
              )
            });
          }
          break;

        default:
          // Handle any other pattern types with fallback
          console.log(`Unknown pattern type: ${pattern.type}`);
          break;
      }
    });

    return renderPatternGrid(allPatterns);
  };

  const renderLegacyFormatPatterns = (patternsData) => {
    // Collect all patterns into a single array for unified grid display (legacy format)
    const allPatterns = [];

    // Chart Shape
    if (patternsData.chartShape && userPlanets && userPlanets.length > 0) {
      allPatterns.push({
        key: 'chartShape',
        type: 'chartShape',
        label: 'Chart Shape',
        description: patternsData.chartShape,
        component: (
          <SimplifiedPatternWheel
            planets={userPlanets}
            pattern="chartShape"
            patternData={{
              label: 'Chart Shape'
            }}
            size={140}
          />
        )
      });
    }

    // Stelliums
    const stelliumsData = patternsData.stelliums || [];
    stelliumsData.forEach((stellium, index) => {
      const planets = extractPlanetsFromPattern(stellium, userPlanets);
      const stelliumSpan = calculateStelliumSpan(stellium, userPlanets);
      allPatterns.push({
        key: `stellium-${index}`,
        type: 'stellium',
        label: `Stellium ${index + 1}`,
        description: stellium,
        component: (
          <SimplifiedPatternWheel
            planets={planets}
            pattern="stellium"
            patternData={{
              startDeg: stelliumSpan?.startDeg,
              endDeg: stelliumSpan?.endDeg,
              label: `Stellium ${index + 1}`
            }}
            size={140}
          />
        )
      });
    });

    // T-Squares
    const tSquares = patternsData.tSquares || [];
    tSquares.forEach((tSquare, index) => {
      const planets = extractPlanetsFromPattern(tSquare, userPlanets);
      const lines = generateTSquareLines(tSquare);
      allPatterns.push({
        key: `tSquare-${index}`,
        type: 'tSquare',
        label: `T-Square ${index + 1}`,
        description: tSquare,
        component: (
          <SimplifiedPatternWheel
            planets={planets}
            pattern="tSquare"
            patternData={{
              lines,
              label: `T-Square ${index + 1}`
            }}
            size={140}
          />
        )
      });
    });

    // Yods
    const yods = patternsData.yods || [];
    yods.forEach((yod, index) => {
      const planets = extractPlanetsFromPattern(yod, userPlanets);
      const lines = generateYodLines(yod);
      allPatterns.push({
        key: `yod-${index}`,
        type: 'yod',
        label: `Yod ${index + 1}`,
        description: yod,
        component: (
          <SimplifiedPatternWheel
            planets={planets}
            pattern="yod"
            patternData={{
              lines,
              label: `Yod ${index + 1}`
            }}
            size={140}
          />
        )
      });
    });

    // Grand Trines
    const grandTrines = patternsData.grandTrines || [];
    grandTrines.forEach((grandTrine, index) => {
      const planets = extractPlanetsFromPattern(grandTrine, userPlanets);
      const lines = generateGrandTrineLines(grandTrine);
      allPatterns.push({
        key: `grandTrine-${index}`,
        type: 'grandTrine',
        label: `Grand Trine ${index + 1}`,
        description: grandTrine,
        component: (
          <SimplifiedPatternWheel
            planets={planets}
            pattern="grandTrine"
            patternData={{
              lines,
              label: `Grand Trine ${index + 1}`
            }}
            size={140}
          />
        )
      });
    });

    return renderPatternGrid(allPatterns);
  };

  const renderPatternGrid = (allPatterns) => {
    // Show message if no patterns found
    if (allPatterns.length === 0) {
      return (
        <div className="patterns-content">
          <div className="no-patterns">
            <p>No significant patterns detected in this chart.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="patterns-content">
        {/* Grid layout - 3 patterns per row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '20px',
          justifyItems: 'center'
        }}>
          {allPatterns.map((pattern) => (
            <div key={pattern.key} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '200px'
            }}>
              <h6 style={{
                margin: '0 0 10px 0',
                fontSize: '0.9em',
                fontWeight: 'bold',
                color: '#a78bfa'
              }}>
                {pattern.label}
              </h6>
              {pattern.component}
              <p style={{ 
                fontSize: '0.8em', 
                color: 'rgba(255, 255, 255, 0.7)', 
                margin: '10px 0 0 0',
                lineHeight: '1.3',
                maxWidth: '180px'
              }}>
                {pattern.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      data-pattern-type={type}
      style={{ 
        backgroundColor: 'rgba(139, 92, 246, 0.1)', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        marginBottom: '20px'
      }}>
      <h3 style={{ 
        color: '#a78bfa', 
        margin: '0 0 20px 0',
        fontSize: '1.3rem'
      }}>
        {type === 'elements' ? '🔥💨🌍💧 ' : ''}
        {type === 'modalities' ? '♈♉♊ ' : ''}
        {type === 'quadrants' ? '🧭 ' : ''}
        {type === 'patterns' ? '✨ ' : ''}
        {type === 'planetary' ? '🪐 ' : ''}
        {title}
      </h3>
      {type === 'patterns' ? (
        <>
          {renderPatterns()}
          {data.interpretation && (
            <p style={{ 
              color: 'white', 
              lineHeight: '1.6', 
              margin: '20px 0 0 0',
              fontSize: '16px',
              whiteSpace: 'pre-wrap',
              paddingTop: '20px',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              {data.interpretation}
            </p>
          )}
        </>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            {renderChart()}
            {renderPlanetDistribution()}
          </div>
          {data.interpretation && (
            <p style={{ 
              color: 'white', 
              lineHeight: '1.6', 
              margin: '0',
              fontSize: '16px',
              whiteSpace: 'pre-wrap',
              paddingTop: '20px',
              borderTop: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              {data.interpretation}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default PatternCard; 