import React from "react";
import './BirthChartSummary.css';

function BirthChartSummary({ summary }) {
    return (
      <div className="birth-chart-summary">
        <h3>Birth Chart Summary</h3>
        <div className="summary-container">
          <ul className="summary-list">
            {summary.map((item, index) => (
              <li key={index} className="summary-item">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  export default BirthChartSummary;