import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { getUserCompositeCharts } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function ExistingRelationshipsTable({ onRelationshipSelect }) {
  const [relationships, setRelationships] = useState([]);
  const userId = useStore(state => state.userId);
  const setCompositeChart = useStore(state => state.setCompositeChart);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUserCompositeCharts() {
      if (userId) {   
        try {
          const fetchedRelationships = await getUserCompositeCharts(userId);
          setRelationships(fetchedRelationships);
        } catch (error) {
          console.error('Error fetching user composite charts:', error);
        }
      }
    }

    loadUserCompositeCharts();
  }, [userId]); // This will re-run when component remounts due to key change

  const handleRelationshipSelect = (relationship) => {
    onRelationshipSelect(relationship);
    // Set the composite chart data in the store before navigating
    setCompositeChart(relationship);
    // Navigate to composite dashboard
    navigate('/compositeDashboard');
  };

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Your Existing Relationships</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ color: 'orange' }}>User A</th>
              <th style={{ color: 'orange' }}>User B</th>
              <th style={{ color: 'orange' }}>User A DOB</th>
              <th style={{ color: 'orange' }}>User B DOB</th>
              <th style={{ color: 'orange' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {relationships.map((relationship) => (
              <tr
                key={relationship._id}
                onClick={() => handleRelationshipSelect(relationship)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = 'rgba(128, 0, 128, 0.1)'}
                onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
              >
                <td>{relationship.userA_name}</td>
                <td>{relationship.userB_name}</td>
                <td>{new Date(relationship.userA_dateOfBirth).toLocaleDateString()}</td>
                <td>{new Date(relationship.userB_dateOfBirth).toLocaleDateString()}</td>
                <td>{new Date(relationship.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExistingRelationshipsTable;