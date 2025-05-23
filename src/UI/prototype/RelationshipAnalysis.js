import React from 'react';

const RelationshipAnalysis = ({ analysis, userAName, userBName }) => {
    if (!analysis) {
        return <p>No detailed analysis available.</p>;
      }
    
      // Helper function to format category titles
      const formatCategoryTitle = (title) => {
        return title
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());
      };
    
      return (
        <div className="relationship-analysis-container">
          <h2>Relationship Analysis: {userAName} & {userBName}</h2>
          
          {Object.entries(analysis).map(([category, text]) => (
            <div key={category} className="analysis-category-section">
              <h3>{formatCategoryTitle(category)}</h3>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{text}</div>
            </div>
          ))}
        </div>
      );
    };
    
export default RelationshipAnalysis;