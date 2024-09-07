import React, { useState } from 'react';
import { formatTransitDataDescriptionsForTableWeekly } from '../../Utilities/generateUserTranstiDescriptions';

function WeeklyTransitsTableAdmin({ transits, startDate, onSaveTransits }) {
  const [selectedTransitIds, setSelectedTransitIds] = useState([]);

  const handleRowClick = (transitId) => {
    setSelectedTransitIds(prevSelected => {
      if (prevSelected.includes(transitId)) {
        return prevSelected.filter(id => id !== transitId);
      } else {
        return [...prevSelected, transitId];
      }
    });
  };

  const handleSaveClick = () => {
    const selectedTransits = flattenedTransits.filter(transit => 
      selectedTransitIds.includes(transit.id)
    );
    const formattedTransits = selectedTransits.map(transit => formatTransitDataDescriptionsForTableWeekly(transit));
    // onSaveTransits(formattedTransits);
    onSaveTransits(selectedTransits);
  };

  const getSignChangeStatus = (transit, periodStart) => {
    const periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 7 days
    const startDate = new Date(transit.dateRange[0]);
    const endDate = new Date(transit.dateRange[1]);

    if (startDate >= periodStart && startDate <= periodEnd) {
      return 'entering';
    } else if (endDate >= periodStart && endDate <= periodEnd) {
      return 'exiting';
    } else {
      return 'transiting';
    }
  };

  // Check if transits is valid before processing
  if (!transits || typeof transits !== 'object' || Object.keys(transits).length === 0) {
    return <div>No transit data available</div>;
  }

  const flattenedTransits = Object.entries(transits).flatMap(([planet, data], planetIndex) =>
    (data.transitSigns || []).map((transit, transitIndex) => ({
      id: `${planetIndex}-${transitIndex}`, // Create a unique id
      planet,
      ...transit,
      signChange: getSignChangeStatus(transit, new Date(startDate))
    }))
  );

  if (flattenedTransits.length === 0) {
    return <div>No transit data available</div>;
  }

  return (
    <div>
      <h2>Weekly Transits Table</h2>
      <table>
        <thead>
          <tr>
            <th>Planet</th>
            <th>Transiting Sign</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Sign Change</th>
          </tr>
        </thead>
        <tbody>
          {flattenedTransits.map((transit) => (
            <tr 
              key={transit.id}
              onClick={() => handleRowClick(transit.id)}
              style={{
                backgroundColor: selectedTransitIds.includes(transit.id) ? '#e0e0e0' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <td>{transit.planet}</td>
              <td>{transit.transitingSign}</td>
              <td>{new Date(transit.dateRange[0]).toLocaleDateString()}</td>
              <td>{new Date(transit.dateRange[1]).toLocaleDateString()}</td>
              <td>{transit.signChange}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSaveClick}>Save Selected Transits</button>
    </div>
  );
}

export default WeeklyTransitsTableAdmin;