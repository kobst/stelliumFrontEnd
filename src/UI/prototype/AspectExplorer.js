import React, { useState } from 'react';
import { generateCustomBirthChartAnalysis } from '../../Utilities/api';
import { 
  formatAspectData, 
  formatPositionData, 
  findPlanetData 
} from '../../Utilities/aspectExplorerHelpers';
import PreviousAnalysisCard from './PreviousAnalysisCard';
import './AspectExplorer.css';

const AspectExplorer = ({ userId, userPlanets, userAspects, customAnalyses = [], onAnalysisGenerated }) => {
  const [selectedElements, setSelectedElements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Handle selection of an element
  const handleSelectElement = (element) => {
    setError(null);
    
    if (selectedElements.some(el => el.code === element.code)) {
      // Deselect if already selected
      setSelectedElements(selectedElements.filter(el => el.code !== element.code));
    } else if (selectedElements.length < 4) {
      // Add if under limit
      setSelectedElements([...selectedElements, element]);
    } else {
      // Show error if at limit
      setError('Maximum 4 selections allowed. Please deselect an item first.');
    }
  };

  // Generate analysis
  const handleGenerateAnalysis = async () => {
    if (selectedElements.length === 0) {
      setError('Please select at least one aspect or position');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await generateCustomBirthChartAnalysis(userId, selectedElements);
      
      if (response.success) {
        setAnalysis(response.analysis);
        // Clear selection after successful generation
        setSelectedElements([]);
        // Trigger refresh of data in parent component
        if (onAnalysisGenerated) {
          onAnalysisGenerated();
        }
      } else {
        throw new Error(response.error || 'Failed to generate analysis');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedElements([]);
    setError(null);
  };

  // Prepare aspects data
  const aspectsData = userAspects.map(aspect => {
    const planet1Data = findPlanetData(aspect.aspectedPlanet, userPlanets);
    const planet2Data = findPlanetData(aspect.aspectingPlanet, userPlanets);
    
    if (planet1Data && planet2Data) {
      return formatAspectData(aspect, planet1Data, planet2Data);
    }
    return null;
  }).filter(Boolean);

  // Prepare positions data
  const positionsData = userPlanets
    .filter(planet => !['South Node', 'Part of Fortune'].includes(planet.name))
    .map(planet => formatPositionData(planet));

  // Check if element is selected
  const isSelected = (code) => selectedElements.some(el => el.code === code);

  return (
    <div className="aspect-explorer">
      <div className="aspect-explorer-header">
        <h3>Aspect Explorer</h3>
        <p className="description">
          Select up to 4 aspects or planetary positions to receive a personalized psychological interpretation 
          that explores how these elements work together in your birth chart.
        </p>
      </div>

      {/* Previous Custom Analyses Section */}
      <div className="previous-analyses-section">
        <h4>Previous Custom Analyses</h4>
        {customAnalyses && customAnalyses.length > 0 ? (
          <div className="previous-analyses-list">
            {customAnalyses.map((analysis, index) => (
              <PreviousAnalysisCard 
                key={analysis.generatedAt || index} 
                analysis={analysis} 
              />
            ))}
          </div>
        ) : (
          <div className="no-previous-analyses">
            <p>No previous custom analyses found. Generate your first analysis below!</p>
          </div>
        )}
      </div>

      {/* Section Divider */}
      <div className="section-divider">
        <hr />
        <span>Generate New Analysis</span>
        <hr />
      </div>

      {/* New Analysis Generation Section */}
      <div className="new-analysis-section">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

      <div className="selection-controls">
        <div className="selection-info">
          <span className="selection-count">
            {selectedElements.length} of 4 selected
          </span>
          {selectedElements.length > 0 && (
            <button 
              onClick={handleClearSelection}
              className="clear-button"
            >
              Clear Selection
            </button>
          )}
        </div>
        <button
          onClick={handleGenerateAnalysis}
          disabled={selectedElements.length === 0 || isLoading}
          className="generate-button"
        >
          {isLoading ? 'Generating...' : 'Generate Analysis'}
        </button>
      </div>

      <div className="elements-grid">
        <div className="positions-section">
          <h4>Planetary Positions</h4>
          <div className="elements-list">
            {positionsData.map(position => (
              <div
                key={position.code}
                className={`element-card position-card ${isSelected(position.code) ? 'selected' : ''}`}
                onClick={() => handleSelectElement(position)}
              >
                <div className="element-header">
                  <span className="element-type">Position</span>
                  {isSelected(position.code) && <span className="selected-badge">✓</span>}
                </div>
                <div className="element-content">
                  <div className="element-main">{position.planet}</div>
                  <div className="element-details">
                    in {position.sign}
                    {position.house && ` • House ${position.house}`}
                    {position.isRetrograde && ' ℞'}
                  </div>
                </div>
                <div className="element-code">{position.code}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="aspects-section">
          <h4>Aspects</h4>
          <div className="elements-list">
            {aspectsData.map(aspect => (
              <div
                key={aspect.code}
                className={`element-card aspect-card ${isSelected(aspect.code) ? 'selected' : ''}`}
                onClick={() => handleSelectElement(aspect)}
              >
                <div className="element-header">
                  <span className="element-type">Aspect</span>
                  {isSelected(aspect.code) && <span className="selected-badge">✓</span>}
                </div>
                <div className="element-content">
                  <div className="element-main">
                    {aspect.planet1} {aspect.aspectType} {aspect.planet2}
                  </div>
                  <div className="element-details">
                    {aspect.planet1} in {aspect.planet1Sign}
                    {aspect.planet1House && ` H${aspect.planet1House}`}
                    {' → '}
                    {aspect.planet2} in {aspect.planet2Sign}
                    {aspect.planet2House && ` H${aspect.planet2House}`}
                  </div>
                  <div className="element-orb">Orb: {aspect.orb.toFixed(2)}°</div>
                </div>
                <div className="element-code">{aspect.code}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {analysis && (
          <div className="analysis-result">
            <h3>Your Latest Analysis</h3>
            <div className="analysis-content">
              <p>{analysis.interpretation}</p>
            </div>
            <div className="analysis-meta">
              <small>Generated: {new Date(analysis.generatedAt).toLocaleString()}</small>
              <small style={{display: 'block', marginTop: '8px', color: '#10b981'}}>
                ✓ This analysis has been saved and will appear in your previous analyses after refresh.
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AspectExplorer;