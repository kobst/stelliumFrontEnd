import React, { useState, useEffect } from 'react';
import './HouseTransitsTable.css';

const HouseTransitsTable = ({ houseTransits, userHouses = [], onSelectHouseTransit}) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const getHouseSign = (houseNumber) => {
    const house = userHouses.find((house) => house.house === houseNumber);
    return house ? house.sign : '';
  };

  const handleRowClick = (index) => {
    const selectedIndex = selectedRows.indexOf(index);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = [...selectedRows, index];
    } else {
      newSelectedRows = selectedRows.filter((rowIndex) => rowIndex !== index);
    }

    setSelectedRows(newSelectedRows);
  };

  useEffect(() => {
    const selectedHouseTransits = selectedRows.map(index => {
      const transitData = houseTransits[index];
      return transitData;
    });
    onSelectHouseTransit(selectedHouseTransits);
  }, [selectedRows, houseTransits, onSelectHouseTransit]); // Keep the dependency array as is


  return (
    <div className="house-transits-table-container">
      <h2>House Transits</h2>
      <div className="house-transits-table-wrapper">
        <table className="house-transits-table">
          <thead>
            <tr>
              <th>Planet</th>
              <th>Transiting House</th>
              <th>House Sign</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {houseTransits.flatMap((transitData, index) =>
              transitData.transitHouses
                .filter((transit) => transit.transitingHouse !== null)
                .map((transit, subIndex) => (
                  <tr
                    key={`${transitData.planet}-${subIndex}`}
                    onClick={() => handleRowClick(index * transitData.transitHouses.length + subIndex)}
                    className={selectedRows.includes(index * transitData.transitHouses.length + subIndex) ? 'selected' : ''}
                  >
                    <td>{transitData.planet}</td>
                    <td>{transit.transitingHouse}</td>
                    <td>{getHouseSign(transit.transitingHouse)}</td>
                    <td>{new Date(transit.dateRange[0]).toLocaleDateString()}</td>
                    <td>{new Date(transit.dateRange[1]).toLocaleDateString()}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HouseTransitsTable;