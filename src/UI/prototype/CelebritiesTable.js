import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { fetchCelebrities } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function CelebritiesTable({ onCelebritySelect }) {
  const [celebrities, setCelebrities] = useState([]);
  const selectedUser = useStore(state => state.selectedUser);
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
    onCelebritySelect(celebrity);
  };

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
            {celebrities.map((celebrity) => (
              <tr
                key={celebrity._id}
                onClick={() => handleCelebritySelect(celebrity)}
                className={selectedUser && selectedUser._id === celebrity._id ? 'selected-row' : ''}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: selectedUser && selectedUser._id === celebrity._id ? 'rgba(128, 0, 128, 0.3)' : 'transparent',
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