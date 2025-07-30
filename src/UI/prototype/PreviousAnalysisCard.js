import React, { useState } from 'react';

const PreviousAnalysisCard = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to format selected elements preview
  const formatElementsPreview = (selectedElements) => {
    if (!selectedElements || selectedElements.length === 0) return 'No elements selected';
    
    const preview = selectedElements.slice(0, 2).map(element => {
      if (element.type === 'aspect') {
        return `${element.planet1} ${element.aspectType} ${element.planet2}`;
      } else {
        return `${element.planet} in ${element.sign}`;
      }
    });

    if (selectedElements.length > 2) {
      preview.push(`and ${selectedElements.length - 2} more`);
    }

    return preview.join(', ');
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="previous-analysis-card">
      <div className="analysis-card-header">
        <div className="analysis-info">
          <span className="analysis-date">
            {formatDate(analysis.generatedAt)}
          </span>
          <span className="elements-count">
            {analysis.metadata?.elementCount || analysis.selectedElements?.length || 0} elements
          </span>
        </div>
        <button 
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      <div className="analysis-card-content">
        <div className="elements-preview">
          <strong>Selected Elements:</strong> {formatElementsPreview(analysis.selectedElements)}
        </div>
        
        <div className="interpretation-preview">
          <strong>Analysis:</strong> {truncateText(analysis.interpretation)}
        </div>
        
        {isExpanded && (
          <div className="full-analysis">
            <div className="selected-elements-full">
              <h4>Selected Elements:</h4>
              <div className="elements-list-full">
                {analysis.selectedElements?.map((element, index) => (
                  <div key={index} className="element-item">
                    <span className="element-type-badge">
                      {element.type === 'aspect' ? 'Aspect' : 'Position'}
                    </span>
                    <span className="element-description">
                      {element.description || 'No description available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="full-interpretation">
              <h4>Full Analysis:</h4>
              <p>{analysis.interpretation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousAnalysisCard;