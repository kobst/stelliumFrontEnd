import React from 'react';
import { RelationshipCategoriesEnum, orderedCategoryKeys } from '../../Utilities/constants';
import ScoredItemsTable from './ScoredItemsTable';

function RelationshipAnalysis({ analysis, userAName, userBName, scoreAnalysis }) {
    if (!analysis || !analysis.analysis || Object.keys(analysis.analysis).length === 0) {
      return <p>No relationship analysis data available to display.</p>;
    }
  
    // Use the predefined order of keys from the enum
    const categoriesToDisplay = orderedCategoryKeys.filter(key => analysis.analysis[key]);
  
    return (
      <div className="relationship-analysis-display" style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h3>Relationship Analysis Details for {userAName} and {userBName}</h3>
        {categoriesToDisplay.map(categoryKey => {
          const categoryData = analysis.analysis[categoryKey];
          
          // Check if categoryData and its panels exist
          if (categoryData && categoryData.panels) {
            const categoryLabel = RelationshipCategoriesEnum[categoryKey]?.label || categoryKey.replace(/_/g, ' ');
            const { composite, fullAnalysis, synastry } = categoryData.panels;
  
            return (
              <div key={categoryKey} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ color: '#333' }}>{categoryLabel}</h4>
                
                {synastry && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#555' }}>Synopsis:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px', margin: '5px 0 0 0' }}>
                      {synastry}
                    </p>
                  </div>
                )}

                {composite && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#555' }}>Composite Analysis:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px', margin: '5px 0 0 0' }}>
                      {composite}
                    </p>
                  </div>
                )}

                {fullAnalysis && (
                  <div style={{ marginTop: '5px' }}>
                    <strong style={{ color: '#555' }}>Detailed Analysis:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', margin: '5px 0 0 0', lineHeight: '1.6' }}>
                      {fullAnalysis}
                    </p>
                  </div>
                )}

                {scoreAnalysis?.[categoryKey]?.scoredItems && (
                  <ScoredItemsTable 
                    scoredItems={scoreAnalysis[categoryKey].scoredItems} 
                    categoryName={categoryLabel}
                  />
                )}
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