import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { getUserSubjects, deleteSubject } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function GuestSubjectsTable({ onGuestSelect, selectedForRelationship, showViewOption = false, showDeleteOption = false, genderFilter = 'all' }) {
  const [guestSubjects, setGuestSubjects] = useState([]);
  const [deletingSubject, setDeletingSubject] = useState(null);
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

  const handleDeleteGuest = async (guest) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${guest.firstName} ${guest.lastName}?\n\n` +
      `This will permanently remove:\n` +
      `• The subject data\n` +
      `• All associated analyses\n` +
      `• Chat history\n` +
      `• Horoscopes\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingSubject(guest._id);
    try {
      const result = await deleteSubject(guest._id, ownerId);
      
      // Remove deleted guest from local state
      setGuestSubjects(prevGuests => 
        prevGuests.filter(g => g._id !== guest._id)
      );

      // Show success message
      const deletedCount = result.deletionResults;
      const details = [];
      if (deletedCount.horoscopes > 0) details.push(`${deletedCount.horoscopes} horoscopes`);
      if (deletedCount.chatThreads > 0) details.push(`${deletedCount.chatThreads} conversations`);
      if (deletedCount.analysis > 0) details.push('analysis data');
      
      const message = details.length > 0 
        ? `Guest deleted successfully. Also removed: ${details.join(', ')}.`
        : 'Guest deleted successfully.';
      
      alert(message);
    } catch (error) {
      let errorMessage = 'Failed to delete guest.';
      
      if (error.message.includes('relationship')) {
        const relationshipCount = error.message.match(/\d+/)?.[0] || 'some';
        errorMessage = `Cannot delete this guest because they're part of ${relationshipCount} relationship(s). Please delete those relationships first.`;
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'You do not have permission to delete this guest.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'This guest may have already been deleted.';
      }
      
      alert(errorMessage);
    } finally {
      setDeletingSubject(null);
    }
  };

  // Filter guest subjects based on gender
  const filteredGuestSubjects = guestSubjects.filter(guest => {
    if (genderFilter === 'all') return true;
    return guest.gender === genderFilter;
  });

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
              {(showViewOption || showDeleteOption || onGuestSelect) && <th style={{ color: 'orange' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredGuestSubjects.map((guest) => (
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
                {(showViewOption || showDeleteOption || onGuestSelect) && (
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
                      {showViewOption && (
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
                      )}
                      {showDeleteOption && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGuest(guest);
                          }}
                          disabled={deletingSubject === guest._id}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: deletingSubject === guest._id ? '#6c757d' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: deletingSubject === guest._id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: deletingSubject === guest._id ? 0.6 : 1
                          }}
                        >
                          {deletingSubject === guest._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
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