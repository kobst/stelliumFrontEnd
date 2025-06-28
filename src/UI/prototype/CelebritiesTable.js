import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { fetchCelebrities } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function CelebritiesTable({ onCelebritySelect, selectedForRelationship, genderFilter = 'all' }) {
  const [celebrities, setCelebrities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCelebrities() {
        if (celebrities.length === 0) {   
          try {
            const fetchedCelebrities = await fetchCelebrities();
            setCelebrities(fetchedCelebrities);
        } catch (error) {
          console.error('Error fetching celebrities:', error);
        }
      }
    }

    loadCelebrities();
  }, []);

  const handleCelebritySelect = (celebrity) => {
    if (onCelebritySelect) {
      onCelebritySelect(celebrity);
    }
  };

  // Filter celebrities based on gender
  const filteredCelebrities = celebrities.filter(celebrity => {
    if (genderFilter === 'all') return true;
    return celebrity.gender === genderFilter;
  });

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Celebrity Charts</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ color: 'orange' }}>First Name</th>
              <th style={{ color: 'orange' }}>Last Name</th>
              <th style={{ color: 'orange' }}>Date of Birth</th>
              <th style={{ color: 'orange' }}>Place of Birth</th>
            </tr>
          </thead>
          <tbody>
            {filteredCelebrities.map((celebrity) => (
              <tr
                key={celebrity._id}
                onClick={() => handleCelebritySelect(celebrity)}
                className={selectedForRelationship && selectedForRelationship._id === celebrity._id ? 'selected-row' : ''}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: selectedForRelationship && selectedForRelationship._id === celebrity._id ? 'rgba(128, 0, 128, 0.3)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <td>{celebrity.firstName}</td>
                <td>{celebrity.lastName}</td>
                <td>{celebrity.dateOfBirth}</td>
                <td>{celebrity.placeOfBirth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CelebritiesTable;