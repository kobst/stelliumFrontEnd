import React, { useState } from 'react';
import { formatAspecttDataDescriptionForTableDataWeekly } from '../../Utilities/generateUserTranstiDescriptions';



function WeeklyAspectsTableAdmin({ aspectsArray, onSaveAspects }) {
    const [selectedAspects, setSelectedAspects] = useState([]);
  
    const handleRowClick = (aspect) => {
      setSelectedAspects(prevSelected => {
        if (prevSelected.includes(aspect)) {
          return prevSelected.filter(a => a !== aspect);
        } else {
          return [...prevSelected, aspect];
        }
      });
    };
  
    const handleSaveClick = () => {
    //   const formattedAspects = selectedAspects.map(aspect => formatAspecttDataDescriptionForTableDataWeekly(aspect));
    //   onSaveAspects(formattedAspects);
      onSaveAspects(selectedAspects);
    };
  
    return (
      <div>
        <h2>Weekly Aspects Table</h2>
        <table>
          <thead>
            <tr>
              <th>Aspect Type</th>
              <th>Transiting Planet</th>
              <th>Aspecting Planet</th>
              <th>Closest Orb Date</th>
              <th>Transiting Planet Sign</th>
              <th>Aspecting Planet Sign</th>
            </tr>
          </thead>
          <tbody>
            {aspectsArray.map((aspect, index) => (
              <tr 
                key={index}
                onClick={() => handleRowClick(aspect)}
                style={{
                  backgroundColor: selectedAspects.includes(aspect) ? '#e0e0e0' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <td>{aspect.aspectType}</td>
                <td>{aspect.transitingPlanet}</td>
                <td>{aspect.aspectingPlanet}</td>
                <td>{new Date(aspect.closestOrbDate).toLocaleDateString()}</td>
                <td>{aspect.transitingPlanetSignAtOrb}</td>
                <td>{aspect.aspectingPlanetSignAtOrb}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleSaveClick}>Save Selected Aspects</button>
      </div>
    );
  }
  
  export default WeeklyAspectsTableAdmin;