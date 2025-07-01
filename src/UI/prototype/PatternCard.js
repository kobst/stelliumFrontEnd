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
          color: 'white'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    }
  };

  const renderChart = () => {
    const chartData = getChartData();
    if (!chartData) return null;

    if (type === 'quadrants') {
      return (
        <div style={{ height: '200px', marginBottom: '20px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      );
    }

    return (
      <div style={{ height: '200px', marginBottom: '20px' }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
    );
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
    <div style={{ 
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