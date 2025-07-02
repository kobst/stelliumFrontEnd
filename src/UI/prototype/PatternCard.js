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

const PatternCard = memo(({ title, data, type }) => {
  useEffect(() => {
    console.log('PatternCard mounted/updated:', { title, type, data });
  }, [title, type, data]);

  const getChartData = () => {
    switch (type) {
      case 'elements':
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
    switch (type) {
      case 'elements':
        return (
          <div className="planet-distribution">
            {data.elements.map((element, index) => (
              <div key={element.name} className="distribution-item">
                <span className="category-name">{element.name}</span>
                <div className="planet-list">
                  {element.planets.map(planet => (
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
        return (
          <div className="planet-distribution">
            {data.modalities.map((modality, index) => (
              <div key={modality.name} className="distribution-item">
                <span className="category-name">{modality.name}</span>
                <div className="planet-list">
                  {modality.planets.map(planet => (
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
        return (
          <div className="planet-distribution">
            {data.quadrants.map((quadrant, index) => (
              <div key={quadrant.name} className="distribution-item">
                <span className="category-name">{quadrant.name}</span>
                <div className="planet-list">
                  {quadrant.planets.map(planet => (
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
        // Find the maximum percentage to scale all bars relative to it
        const maxPercentage = Math.max(...data.planets.map(p => p.percentage));
        
        return (
          <div className="planet-distribution">
            {data.planets.map((planet, index) => {
              // Calculate the relative width based on the max percentage
              const relativeWidth = (planet.percentage / maxPercentage) * 100;
              
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
                  }}>{planet.name}</span>
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
                  }}>{planet.percentage}%</span>
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
    console.log('renderPatterns data:', data);
    if (!data.patterns) {
      console.log('No patterns data found');
      return null;
    }

    // Handle new backend format with descriptions array
    if (data.patterns.descriptions && Array.isArray(data.patterns.descriptions)) {
      console.log('Using new descriptions format:', data.patterns.descriptions);
      return (
        <div className="patterns-content">
          <div className="pattern-section">
            <h5>Chart Patterns</h5>
            <ul>
              {data.patterns.descriptions.map((pattern, index) => (
                <li key={index}>{pattern}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    // Legacy format support
    const patternTypes = {
      'Stelliums': data.patterns.stelliums,
      'T-Squares': data.patterns.tSquares,
      'Grand Trines': data.patterns.grandTrines,
      'Grand Crosses': data.patterns.grandCrosses
    };

    console.log('Pattern types (legacy format):', patternTypes);

    return (
      <div className="patterns-content">
        {Object.entries(patternTypes).map(([type, patterns]) => (
          patterns && patterns.length > 0 && (
            <div key={type} className="pattern-section">
              <h5>{type}</h5>
              <ul>
                {patterns.map((pattern, index) => (
                  <li key={index}>{pattern}</li>
                ))}
              </ul>
            </div>
          )
        ))}
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
});

export default PatternCard; 