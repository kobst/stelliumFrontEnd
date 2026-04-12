import React from 'react';
import { PlanetIcon, SignIcon } from '../../shared/AstroIcon';
import './PlanetPositionsTable.css';

const PlanetPositionsTable = ({ planetsArray }) => {

  const excludedPlanets = ["South Node", "Part of Fortune"];

  return (
    <table className="planet-positions-table">
      <tbody>
          {planetsArray
            .filter(planet => !excludedPlanets.includes(planet.name))
            .map((planet, index) => (
              <tr key={index}>
                <td>
                  <PlanetIcon name={planet.name} size={20} />
                </td>
                <td>{planet.name}</td>
                <td>{planet.norm_degree.toFixed(2)}°</td>
                <td>
                  <SignIcon name={planet.sign} size={20} />
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
