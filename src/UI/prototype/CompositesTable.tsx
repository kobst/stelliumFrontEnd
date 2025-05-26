import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchComposites } from '../../Utilities/api'
import useStore from '../../Utilities/store';


function CompositesTable({ onCompositeChartSelect }) {
  const [composites, setComposites] = useState([]);
  const selectedCompositeChart = useStore(state => state.selectedCompositeChart);
  const navigate = useNavigate();


  useEffect(() => {
    async function loadComposites() {
        if (composites.length === 0) {   
          try {
            const fetchedComposites = await fetchComposites();
            console.log("fetchedComposites")
            console.log(fetchedComposites)
            setComposites(fetchedComposites);
        } catch (error) {
          console.error('Error fetching composites:', error);
        }
      }
    }

    loadComposites();
    // getTodaysData()
    // getRetrogradeTransits()
  }, []);


  const handleCompositeChartSelect = (compositeChart) => {
    onCompositeChartSelect(compositeChart);
  };

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>User List</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
            <th style={{ color: 'orange' }}>Partner A</th>
            <th style={{ color: 'orange' }}>Date of Birth</th>
            <th style={{ color: 'orange' }}>Partner B</th>
            <th style={{ color: 'orange' }}>Date of Birth</th>
            </tr>
          </thead>
          <tbody>
          {composites.map((compositeChart) => (
              <tr
                key={compositeChart._id}
                onClick={() => handleCompositeChartSelect(compositeChart)}
                className={selectedCompositeChart && selectedCompositeChart._id === compositeChart._id ? 'selected' : ''}
                style={{ 
                  color: selectedCompositeChart && selectedCompositeChart._id === compositeChart._id ? 'purple' : 'white'
                }}
            >
                <td>{compositeChart.userA_name}</td>
                <td>{compositeChart.userA_dateOfBirth}</td>
                <td>{compositeChart.userB_name}</td>
                <td>{compositeChart.userB_dateOfBirth}</td>
              </tr>
        ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompositesTable;