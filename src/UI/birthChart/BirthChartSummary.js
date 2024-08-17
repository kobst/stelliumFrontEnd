import React from "react";

function BirthChartSummary({ summary }) {
    return (
      <div className="birth-chart-summary">
        <h3>Birth Chart Summary</h3>
        <ul className="summary-list">
          {summary.map((item, index) => (
            <li key={index} className="summary-item">{item}</li>
          ))}
        </ul>
      </div>
    );
  }
  
  export default BirthChartSummary;