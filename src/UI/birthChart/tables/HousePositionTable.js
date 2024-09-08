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

  // Filter out "South Node" and "Part of Fortune"
  const filteredHouses = houseArray.filter(house => house.house !== "South Node" && house.house !== "Part of Fortune");

  // Create an array of 3 columns, each containing 4 houses
  const columns = [
    filteredHouses.slice(0, 4),
    filteredHouses.slice(4, 8),
    filteredHouses.slice(8, 12)
  ];

  return (
    <div className="house-position-table">
      {columns.map((column, columnIndex) => (
        <table key={columnIndex} className="house-column">
          <tbody>
            {column.map((house, index) => (
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
      ))}
    </div>
  );
};

export default HousePositionTable;