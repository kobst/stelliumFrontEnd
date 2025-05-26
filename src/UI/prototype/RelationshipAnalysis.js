import React from 'react';
import { RelationshipCategoriesEnum, orderedCategoryKeys } from '../../Utilities/constants';

function RelationshipAnalysis({ analysis, userAName, userBName }) {
    if (!analysis || Object.keys(analysis).length === 0) {
      return <p>No relationship analysis data available to display.</p>;
    }
  
    // Use the predefined order of keys from the enum
    // If you don't have/want the enum, you can use Object.keys(analysis) directly,
    // but the order might not be guaranteed or ideal.
    const categoriesToDisplay = orderedCategoryKeys.filter(key => analysis[key]);
  
    return (
      <div className="relationship-analysis-display" style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h3>Relationship Analysis Details for {userAName} and {userBName}</h3>
        {categoriesToDisplay.map(categoryKey => {
          const categoryData = analysis[categoryKey]; // This is now an object { relevantPositions, interpretation }
          
          // Check if categoryData and its properties exist
          if (categoryData && typeof categoryData === 'object' && categoryData.interpretation) {
            const categoryLabel = RelationshipCategoriesEnum[categoryKey]?.label || categoryKey.replace(/_/g, ' ');
  
            return (
              <div key={categoryKey} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ color: '#333' }}>{categoryLabel}</h4>
                {categoryData.relevantPositions && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#555' }}>Relevant Astrological Positions:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px', margin: '5px 0 0 0' }}>
                      {categoryData.relevantPositions}
                    </p>
                  </div>
                )}
                <div style={{ marginTop: '5px' }}>
                  <strong style={{ color: '#555' }}>Interpretation:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0 0', lineHeight: '1.6' }}>
                    {categoryData.interpretation}
                  </p>
                </div>
              </div>
            );
          }
          return null; // Skip rendering if data is not in the expected format
        })}
        {categoriesToDisplay.length === 0 && <p>Analysis data is present but no categories could be displayed.</p>}
      </div>
    );
  }
  
  export default RelationshipAnalysis;