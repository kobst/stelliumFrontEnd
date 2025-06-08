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
        <div style={{ height: '200px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      );
    }

    return (
      <div style={{ height: '200px' }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
    );
  };

  return (
    <div className="pattern-card">
      <h4>{title}</h4>
      {renderChart()}
      {data.interpretation && (
        <div className="interpretation">
          <p>{data.interpretation}</p>
        </div>
      )}
    </div>
  );
};

export default PatternCard; 