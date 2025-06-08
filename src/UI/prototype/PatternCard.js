import React from 'react';
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

const PatternCard = ({ title, data, type }) => {
  console.log('PatternCard props:', { title, type, data });

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
          padding: 15
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
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
      );
    }

    return (
      <div className="chart-container">
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

    const patternTypes = {
      'Stelliums': data.patterns.stelliums,
      'T-Squares': data.patterns.tSquares,
      'Grand Trines': data.patterns.grandTrines,
      'Grand Crosses': data.patterns.grandCrosses
    };

    console.log('Pattern types:', patternTypes);

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
    <div className="pattern-card">
      <h4>{title}</h4>
      {type === 'patterns' ? (
        <>
          {renderPatterns()}
          {data.interpretation && (
            <div className="interpretation">
              <p>{data.interpretation}</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card-content">
            {renderChart()}
            {renderPlanetDistribution()}
          </div>
          {data.interpretation && (
            <div className="interpretation">
              <p>{data.interpretation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatternCard; 