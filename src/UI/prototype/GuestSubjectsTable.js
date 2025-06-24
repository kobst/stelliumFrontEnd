import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { getUserSubjects } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function GuestSubjectsTable({ onGuestSelect, selectedForRelationship, showViewOption = false }) {
  const [guestSubjects, setGuestSubjects] = useState([]);
  const currentUserContext = useStore(state => state.currentUserContext);
  const activeUserContext = useStore(state => state.activeUserContext);
  const switchUserContext = useStore(state => state.switchUserContext);
  const userId = useStore(state => state.userId);
  const navigate = useNavigate();
  
  // Use currentUserContext (dashboard owner) for fetching guests
  const ownerId = currentUserContext?._id || userId;

  useEffect(() => {
    async function loadGuestSubjects() {
      if (ownerId) {   
        try {
          const fetchedGuestSubjects = await getUserSubjects(ownerId);
          setGuestSubjects(fetchedGuestSubjects);
        } catch (error) {
          console.error('Error fetching guest subjects:', error);
        }
      }
    }

    loadGuestSubjects();
  }, [ownerId]); // This will re-run when component remounts due to key change

  const handleGuestSelect = (guest) => {
    if (onGuestSelect) {
      onGuestSelect(guest);
    }
  };

  const handleViewGuestDashboard = (guest) => {
    // Switch to guest context and navigate to user dashboard
    switchUserContext(guest);
    navigate(`/userDashboard/${guest._id}`);
  };

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Your Added People</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ color: 'orange' }}>First Name</th>
              <th style={{ color: 'orange' }}>Last Name</th>
              <th style={{ color: 'orange' }}>Date of Birth</th>
              <th style={{ color: 'orange' }}>Place of Birth</th>
              {showViewOption && <th style={{ color: 'orange' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {guestSubjects.map((guest) => (
              <tr
                key={guest._id}
                onClick={onGuestSelect ? () => handleGuestSelect(guest) : undefined}
                className={selectedForRelationship && selectedForRelationship._id === guest._id ? 'selected-row' : ''}
                style={{ 
                  cursor: onGuestSelect ? 'pointer' : 'default',
                  backgroundColor: selectedForRelationship && selectedForRelationship._id === guest._id ? 'rgba(128, 0, 128, 0.3)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <td>{guest.firstName}</td>
                <td>{guest.lastName}</td>
                <td>{guest.dateOfBirth}</td>
                <td>{guest.placeOfBirth}</td>
                {showViewOption && (
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {onGuestSelect && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGuestSelect(guest);
                          }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: selectedForRelationship && selectedForRelationship._id === guest._id ? '#28a745' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {selectedForRelationship && selectedForRelationship._id === guest._id ? 'Selected' : 'Select'}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewGuestDashboard(guest);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        View
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GuestSubjectsTable;