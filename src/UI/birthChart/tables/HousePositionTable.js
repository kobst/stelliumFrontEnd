import React from 'react';
import './HousePositionTable.css';
import { zodiacIcons } from '../../../Utilities/constants';

const HousePositionTable = ({ houseArray }) => {
  // Function to get the correct image path for signs
  const getSignImagePath = (signName) => {
    const formattedName = signName.toLowerCase();
    return zodiacIcons.find(path => path.toLowerCase().includes(formattedName)) || '';
  };

  // Function to calculate the remainder of degree divided by 30
  const calculateRemainder = (degree) => {
    return (degree % 30).toFixed(2);
  };

  return (
    <table className="house-position-table">
      <tbody>
        {houseArray
          .filter(house => house.house !== "South Node" && house.house !== "Part of Fortune")
          .map((house, index) => (
            <tr key={index}>
              <td>{house.house}</td>
              <td>
                <img 
                  src={getSignImagePath(house.sign)} 
                  alt={house.sign} 
                  className="symbol-img"
                />
              </td>
              <td>{house.sign}</td>
              <td>{calculateRemainder(house.degree)}°</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default HousePositionTable;