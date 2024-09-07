import React, { useState, useEffect } from 'react';
import './TransitsTable.css';
import { planetIcons } from '../../Utilities/constants';
import { formatTransitDataForUser } from '../../Utilities/generateUserTranstiDescriptions';
import { getAspectSymbol } from '../../Utilities/constants'; // Assuming you have this utility function

const TransitsTable = ({ transits, onSelectTransit }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedRows, setSelectedRows] = useState([]);


  // Function to get the correct image path for planets
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

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Function to handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Function to sort transits
  const sortedTransits = React.useMemo(() => {
    let sortableItems = [...transits];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'startDate') {
          aValue = new Date(a.dateRange[0]);
          bValue = new Date(b.dateRange[0]);
        } else if (sortConfig.key === 'endDate') {
          aValue = new Date(a.dateRange[1]);
          bValue = new Date(b.dateRange[1]);
        } else if (sortConfig.key === 'exactDate') {
          aValue = new Date(a.closestOrbDate);
          bValue = new Date(b.closestOrbDate);
        }
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transits, sortConfig]);

  const handleRowSelect = (index) => {
    setSelectedRows(prevSelected => {
      if (prevSelected.includes(index)) {
        // If already selected, remove it (deselect)
        return prevSelected.filter(i => i !== index);
      } else {
        // If not selected, add it
        return [...prevSelected, index];
      }
    });
    console.log(selectedRows)
    console.log(sortedTransits[index])
  };


  useEffect(() => {
    const selectedTransits = selectedRows.map(index => sortedTransits[index]);
    onSelectTransit(selectedTransits);
  }, [selectedRows, onSelectTransit]);



  return (
    <div className="transits-table-container">
      <h2>Upcoming Transits</h2>
      <div className="transits-table-wrapper">
      <table className="transits-table">
        <thead>
          <tr>
            <th>Transiting Planet</th>
            <th>Aspect</th>
            <th></th>
            <th>Aspecting Planet</th>
            <th>Aspecting Planet Sign</th>
            <th>Aspecting Planet House</th>
            <th onClick={() => requestSort('startDate')}>Start Date {sortConfig.key === 'startDate' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
            <th onClick={() => requestSort('endDate')}>End Date {sortConfig.key === 'endDate' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
            <th onClick={() => requestSort('exactDate')}>Date of Exact Aspect {sortConfig.key === 'exactDate' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransits.map((transit, index) => (
            <tr 
              key={index} 
              className={selectedRows.includes(index) ? 'selected' : ''}
              onClick={(e) => handleRowSelect(index, e)}
            >
              <td>
                <img 
                  src={getPlanetImagePath(transit.transitingPlanet)} 
                  alt={transit.transitingPlanet} 
                  className="symbol-img"
                />
                {transit.transitingPlanet}
              </td>
              <td className="aspect-symbol">{getAspectSymbol(transit.aspectType)}</td>
              <td>{transit.aspectType}</td>
              <td>
                <img 
                  src={getPlanetImagePath(transit.aspectingPlanet)} 
                  alt={transit.aspectingPlanet} 
                  className="symbol-img"
                />
                {transit.aspectingPlanet}
              </td>
              <td>{transit.aspectingPlanetSign}</td>
              <td>{transit.aspectPlanetHouse}</td>
              <td>{formatDate(transit.dateRange[0])}</td>
              <td>{formatDate(transit.dateRange[1])}</td>
              <td>{formatDate(transit.closestOrbDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
    </div>

  );
};

export default TransitsTable;