 
 import React, { useState } from 'react';
 import './TodaysAspectsTable.css';
 import { planetIcons } from '../../../Utilities/constants';

const TodaysAspectsTableAdmin = ({ aspectsArray, onSaveAspects  }) => {

    console.log(aspectsArray);

    const [selectedAspects, setSelectedAspects] = useState([]);


    const getPlanetImagePath = (planetName) => {
        if (typeof planetName !== 'string' || !planetName) {
          console.warn(`Invalid planet name: ${planetName}`);
          return '';
        }
    
        const formattedName = planetName.toLowerCase();
        return planetIcons.find(path => 
          typeof path === 'string' && path.toLowerCase().includes(formattedName)
        ) || '';
      };
    

    // Function to get the aspect symbol
  // Function to get the aspect symbol
  const getAspectSymbol = (aspectType) => {
    if (typeof aspectType !== 'string' || !aspectType) {
      console.warn(`Invalid aspect type: ${aspectType}`);
      return '?';
    }

    switch (aspectType.toLowerCase()) {
      case 'conjunction': return '☌';
      case 'opposition': return '☍';
      case 'trine': return '△';
      case 'square': return '□';
      case 'sextile': return '⚹';
      case 'quincunx': return '⚻';
      default: return '?';
    }
  };

    const handleRowClick = (aspect) => {
        setSelectedAspects(prevSelected => {
            if (prevSelected.some(a => a === aspect)) {
                return prevSelected.filter(a => a !== aspect);
            } else {
                return [...prevSelected, aspect];
            }
        });
    };

    const handleSaveSelected = () => {
        if (onSaveAspects) {
            onSaveAspects(selectedAspects);
        }
        setSelectedAspects([]);  // Clear selection after saving
    };


    return (
        <div>
            <table className="aspects-table">
                <tbody>
                    {aspectsArray.map((aspect, index) => (
                        <tr 
                            key={index} 
                            onClick={() => handleRowClick(aspect)}
                            className={selectedAspects.includes(aspect) ? 'selected' : ''}
                        >
                            <td>
                                <img 
                                    src={getPlanetImagePath(aspect.transitingPlanet)} 
                                    alt={aspect.transitingPlanet} 
                                    className="symbol-img"
                                />
                            </td>
                            <td>{aspect.transitingPlanet}</td>
                            <td className="aspect-symbol">{getAspectSymbol(aspect.aspectType)}</td>
                            <td>
                                <img 
                                    src={getPlanetImagePath(aspect.aspectingPlanet)} 
                                    alt={aspect.aspectingPlanet} 
                                    className="symbol-img"
                                />
                            </td>
                            <td>{aspect.aspectingPlanet}</td>
                            <td>{aspect.orb}°</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleSaveSelected} disabled={selectedAspects.length === 0}>
                Save Selected Aspects
            </button>
        </div>
    );
};

export default TodaysAspectsTableAdmin;