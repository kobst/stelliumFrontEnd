import React from 'react';
import './PlanetPositionsTable.css';
import { zodiacIcons, planetIcons } from '../../../Utilities/constants';

const PlanetPositionsTable = ({ planetsArray }) => {

  const excludedPlanets = ["South Node", "Part of Fortune"];
  // Function to get the correct image path for planets and signs
  const getImagePath = (type, name) => {
    const formattedName = name.toLowerCase();
    const icons = type === 'planet' ? planetIcons : zodiacIcons;
    return icons.find(path => path.toLowerCase().includes(formattedName)) || '';
  };

  return (
    <table className="planet-positions-table">
      <tbody>
          {planetsArray
            .filter(planet => !excludedPlanets.includes(planet.name))
            .map((planet, index) => (
              <tr key={index}>
                <td>
                  <img 
                    src={getImagePath('planet', planet.name)} 
                    alt={planet.name} 
                    className="symbol-img"
                  />
                </td>
                <td>{planet.name}</td>
                <td>{planet.norm_degree.toFixed(2)}°</td>
                <td>
                  <img 
                    src={getImagePath('sign', planet.sign)} 
                    alt={planet.sign} 
                    className="symbol-img"
                  />
                </td>
                <td>{planet.sign}</td>
                <td>{planet.is_retro == "true" ? "Retro" : ""}</td>
              </tr>
          ))}
      </tbody>
    </table>
  );
};

export default PlanetPositionsTable;

// 
