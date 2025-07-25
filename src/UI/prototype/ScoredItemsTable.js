import React from 'react';
import './ScoredItemsTable.css';

function ScoredItemsTable({ scoredItems, categoryName }) {
  if (!scoredItems || scoredItems.length === 0) {
    return null;
  }

  // Sort items by score (descending)
  const sortedItems = [...scoredItems].sort((a, b) => b.score - a.score);

  // Group items by type for better organization
  const aspectItems = sortedItems.filter(item => item.type === 'aspect');
  const housePlacementItems = sortedItems.filter(item => item.type === 'housePlacement');

  return (
    <div className="scored-items-table">
      <h5>Astrological Factors</h5>
      
      {aspectItems.length > 0 && (
        <div className="table-section">
          <h6>Aspects</h6>
          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Description</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {aspectItems.map((item, index) => (
                <tr key={`aspect-${index}`} className={item.score < 0 ? 'negative-score' : 'positive-score'}>
                  <td className="aspect-type">{item.aspect}</td>
                  <td className="description">{item.description}</td>
                  <td className="score">{item.score > 0 ? '+' : ''}{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {housePlacementItems.length > 0 && (
        <div className="table-section">
          <h6>House Placements</h6>
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>House</th>
                <th>Description</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {housePlacementItems.map((item, index) => (
                <tr key={`house-${index}`} className={item.score < 0 ? 'negative-score' : 'positive-score'}>
                  <td className="planet">{item.planet}</td>
                  <td className="house">House {item.house}</td>
                  <td className="description">{item.description}</td>
                  <td className="score">{item.score > 0 ? '+' : ''}{item.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="total-score">
        <strong>Total Score: </strong>
        <span className="total-value">
          {sortedItems.reduce((sum, item) => sum + item.score, 0)}
        </span>
      </div>
    </div>
  );
}

export default ScoredItemsTable;