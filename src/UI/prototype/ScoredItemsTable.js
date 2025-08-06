import React from 'react';
import './ScoredItemsTable.css';

function ScoredItemsTable({ scoredItems, categoryName, isV2 = false }) {
  if (!scoredItems || scoredItems.length === 0) {
    return null;
  }

  // Sort items by score (descending)
  const sortedItems = [...scoredItems].sort((a, b) => b.score - a.score);

  // Group items by type for better organization
  const aspectItems = sortedItems.filter(item => item.type === 'aspect');
  const housePlacementItems = sortedItems.filter(item => item.type === 'housePlacement');

  // Helper function to get valence indicator for V2 items
  const getValenceIndicator = (valence, spark) => {
    let indicator = '';
    if (valence === 1) indicator += '✅';
    else if (valence === -1) indicator += '⚠️';
    else indicator += '⚪';
    
    if (spark) indicator += '✨';
    
    return indicator;
  };

  return (
    <div className="scored-items-table">
      <h5>Astrological Factors</h5>
      
      {aspectItems.length > 0 && (
        <div className="table-section">
          <h6>Aspects</h6>
          <table>
            <thead>
              <tr>
                {isV2 && <th>Type</th>}
                <th>Aspect</th>
                <th>Description</th>
                {isV2 && <th>Details</th>}
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {aspectItems.map((item, index) => (
                <tr key={`aspect-${index}`} className={item.score < 0 ? 'negative-score' : 'positive-score'}>
                  {isV2 && (
                    <td className="valence-indicator">
                      {getValenceIndicator(item.valence, item.spark)}
                    </td>
                  )}
                  <td className="aspect-type">{item.aspect}</td>
                  <td className="description">{item.description}</td>
                  {isV2 && (
                    <td className="v2-details">
                      {item.orb && <div>Orb: {item.orb.toFixed(1)}°</div>}
                      {item.intensity && <div>Intensity: {item.intensity.toFixed(1)}</div>}
                      {item.weight && <div>Weight: {item.weight.toFixed(1)}</div>}
                      {item.centrality && <div>Centrality: {item.centrality}/10</div>}
                      {item.isKeystoneAspect && <div className="keystone-badge">🌟 Keystone</div>}
                    </td>
                  )}
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
                {isV2 && <th>Type</th>}
                <th>Planet</th>
                <th>House</th>
                <th>Description</th>
                {isV2 && <th>Details</th>}
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {housePlacementItems.map((item, index) => (
                <tr key={`house-${index}`} className={item.score < 0 ? 'negative-score' : 'positive-score'}>
                  {isV2 && (
                    <td className="valence-indicator">
                      {getValenceIndicator(item.valence, item.spark)}
                    </td>
                  )}
                  <td className="planet">{item.planet}</td>
                  <td className="house">House {item.house}</td>
                  <td className="description">{item.description}</td>
                  {isV2 && (
                    <td className="v2-details">
                      {item.planetSign && <div>Sign: {item.planetSign}</div>}
                      {item.direction && <div>Direction: {item.direction}</div>}
                      {item.weight && <div>Weight: {item.weight.toFixed(1)}</div>}
                      {item.intensity && <div>Intensity: {item.intensity.toFixed(1)}</div>}
                    </td>
                  )}
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