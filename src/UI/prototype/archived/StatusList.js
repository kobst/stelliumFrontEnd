import React, { useState } from 'react';
import useStore from '../../../Utilities/store';
import { heading_map, planet_headings, dominance_headings } from '../../../Utilities/constants';
import './StatusList.css';
import { generateInterpretation } from '../../../Utilities/generateInterpretationsGlobal';

const StatusList = () => {
  const headingInterpretationMap = useStore(state => state.headingInterpretationMap);
  const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap);
  const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap);
  const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap);
  const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap);
  const userId = useStore(state => state.userId);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInterpretation = async (heading) => {
    setIsGenerating(true);
    try {
      let componentType;
      if (dominance_headings.includes(heading)) {
        console.log("dominance_headings.includes", `${heading}`);
        componentType = 'dominance';
      } else if (planet_headings.includes(heading)) {
        console.log("planet_headings.includes", `${heading}`);
        componentType = 'planet';
      } else {
        console.log("bigFourPromptDescriptions", `${heading}`);
        componentType = 'bigFour';
      }

      await generateInterpretation(
        userId,
        heading,
        componentType,
        subHeadingsPromptDescriptionsMap,
        promptDescriptionsMap,
        setHeadingInterpretationMap,
        setSubHeadingsPromptDescriptionsMap
      );
      // Update the state or trigger a re-fetch of the interpretations
    } catch (error) {
      console.error('Error generating interpretation:', error);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleGenerateAllInterpretations = async () => {
    setIsGenerating(true);
    try {
      for (const heading of Object.keys(headingInterpretationMap)) {
        if (!headingInterpretationMap[heading] || headingInterpretationMap[heading] === '') {
            console.log("heading", `${heading}`);
          await handleGenerateInterpretation(heading);
        }
      }
    } catch (error) {
      console.error('Error generating interpretations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="status-list">
      <h3>Interpretation Status</h3>
      <button
        className="generate-all-button"
        onClick={handleGenerateAllInterpretations}
        disabled={isGenerating}
      >
        Generate All Interpretations
      </button>
      <div className="row">
        <h4>Dominance</h4>
        <ul>
          {dominance_headings.map(dominance => (
            <li key={dominance}>
              <button
                className={`subheading-button ${headingInterpretationMap[dominance] ? 'generated' : ''}`}
                onClick={() => handleGenerateInterpretation(dominance)}
                disabled={headingInterpretationMap[dominance] || isGenerating}
              >
                {dominance}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="row">
        <h4>Planets</h4>
        <ul>
          {planet_headings.map(planet => (
            <li key={planet}>
              <button
                className={`subheading-button ${headingInterpretationMap[planet] ? 'generated' : ''}`}
                onClick={() => handleGenerateInterpretation(planet)}
                disabled={headingInterpretationMap[planet] || isGenerating}
              >
                {planet}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="row">
        {['Personality', 'Home', 'Relationships'].map(heading => (
          <div key={heading}>
            <ul>
              {heading_map[heading] && heading_map[heading].map(subHeading => (
                <li key={subHeading}>
                  <button
                    className={`subheading-button ${headingInterpretationMap[subHeading] ? 'generated' : ''}`}
                    onClick={() => handleGenerateInterpretation(subHeading)}
                    disabled={headingInterpretationMap[subHeading] || isGenerating}
                  >
                    {subHeading}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="row">
        {Object.entries(heading_map)
          .map(([heading, subHeadings]) => (
            <div key={heading}>
              <h4>{heading}</h4>
              <ul>
                {subHeadings && subHeadings.map(subHeading => (
                  <li key={subHeading}>
                    <button
                      className={`subheading-button ${headingInterpretationMap[subHeading] ? 'generated' : ''}`}
                      onClick={() => handleGenerateInterpretation(subHeading)}
                      disabled={headingInterpretationMap[subHeading] || isGenerating}
                    >
                      {subHeading}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StatusList;