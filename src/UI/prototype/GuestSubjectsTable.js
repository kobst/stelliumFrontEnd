import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { getUserSubjects, getUserSubjectsPaginated, deleteSubject } from '../../Utilities/api'
import useStore from '../../Utilities/store';
import { usePaginatedData } from '../../hooks/usePaginatedData';

function GuestSubjectsTable({ onGuestSelect, selectedForRelationship, showViewOption = false, showDeleteOption = false, genderFilter = 'all', usePagination = false }) {
  const [guestSubjects, setGuestSubjects] = useState([]);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const currentUserContext = useStore(state => state.currentUserContext);
  const switchUserContext = useStore(state => state.switchUserContext);
  const userId = useStore(state => state.userId);
  const navigate = useNavigate();
  
  // Use currentUserContext (dashboard owner) for fetching guests
  const ownerId = currentUserContext?._id || userId;

  // Create a wrapper function for the paginated API
  const fetchUserSubjectsWrapper = useMemo(() => {
    return (options) => getUserSubjectsPaginated(ownerId, options);
  }, [ownerId]);

  // Use the paginated data hook when pagination is enabled
  const paginatedData = usePaginatedData(
    fetchUserSubjectsWrapper,
    { page: 1, limit: 20, sortBy: 'name', sortOrder: 'asc' }
  );

  // Legacy data loading for backward compatibility
  useEffect(() => {
    if (!usePagination && ownerId) {
      async function loadGuestSubjects() {
        try {
          const fetchedGuestSubjects = await getUserSubjects(ownerId);
          setGuestSubjects(fetchedGuestSubjects);
        } catch (error) {
          console.error('Error fetching guest subjects:', error);
        }
      }
      loadGuestSubjects();
    }
  }, [ownerId, usePagination]); // This will re-run when component remounts due to key change

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

  // Sorting functionality - only available when using pagination
  const handleSort = (field) => {
    if (!usePagination) return;
    
    if (paginatedData.sortBy === field) {
      // Toggle sort order if same field
      const newOrder = paginatedData.sortOrder === 'asc' ? 'desc' : 'asc';
      paginatedData.changeSort(field, newOrder);
    } else {
      // Sort by new field, default to ascending
      paginatedData.changeSort(field, 'asc');
    }
  };

  const getSortIcon = (field) => {
    if (!usePagination || paginatedData.sortBy !== field) return '';
    return paginatedData.sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const getSortableHeaderStyle = (field) => ({
    color: 'orange',
    cursor: usePagination ? 'pointer' : 'default',
    userSelect: 'none',
    padding: '8px',
    borderBottom: usePagination && paginatedData.sortBy === field ? '2px solid orange' : 'none'
  });

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
      
      if (usePagination) {
        // Refresh paginated data
        paginatedData.refresh();
      } else {
        // Remove deleted guest from local state
        setGuestSubjects(prevGuests => 
          prevGuests.filter(g => g._id !== guest._id)
        );
      }

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

  // Get the data source based on pagination mode
  const dataSource = usePagination ? paginatedData.data : guestSubjects;

  // Filter guest subjects based on gender (client-side filtering for backward compatibility)
  const filteredGuestSubjects = dataSource.filter(guest => {
    if (genderFilter === 'all') return true;
    return guest.gender === genderFilter;
  });

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Your Added People</h2>
      
      {/* Search and pagination controls - only show when usePagination is true */}
      {usePagination && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search your people..."
            value={paginatedData.search.searchTerm}
            onChange={(e) => paginatedData.search.updateSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minWidth: '200px'
            }}
          />
          
          <select
            value={paginatedData.pagination.itemsPerPage}
            onChange={(e) => paginatedData.pagination.changeItemsPerPage(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          {paginatedData.loading && <span style={{ color: 'orange' }}>Loading...</span>}
        </div>
      )}

      {/* Error message */}
      {usePagination && paginatedData.error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {paginatedData.error}
        </div>
      )}

      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th 
                style={getSortableHeaderStyle('firstName')}
                onClick={() => handleSort('firstName')}
                title={usePagination ? 'Click to sort by first name' : ''}
              >
                First Name{getSortIcon('firstName')}
              </th>
              <th 
                style={getSortableHeaderStyle('lastName')}
                onClick={() => handleSort('lastName')}
                title={usePagination ? 'Click to sort by last name' : ''}
              >
                Last Name{getSortIcon('lastName')}
              </th>
              <th 
                style={getSortableHeaderStyle('dateOfBirth')}
                onClick={() => handleSort('dateOfBirth')}
                title={usePagination ? 'Click to sort by date of birth' : ''}
              >
                Date of Birth{getSortIcon('dateOfBirth')}
              </th>
              <th 
                style={getSortableHeaderStyle('placeOfBirth')}
                onClick={() => handleSort('placeOfBirth')}
                title={usePagination ? 'Click to sort by place of birth' : ''}
              >
                Place of Birth{getSortIcon('placeOfBirth')}
              </th>
              {(showViewOption || showDeleteOption || onGuestSelect) && <th style={{ color: 'orange' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredGuestSubjects.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'grey' }}>
                  {usePagination && paginatedData.loading ? 'Loading...' : 'No people found'}
                </td>
              </tr>
            ) : (
              filteredGuestSubjects.map((guest) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls - only show when usePagination is true */}
      {usePagination && (
        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ color: 'grey', fontSize: '14px' }}>
            Showing {filteredGuestSubjects.length} of {paginatedData.pagination.totalItems} people
            {paginatedData.search.debouncedSearchTerm && (
              <span> (filtered by "{paginatedData.search.debouncedSearchTerm}")</span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button
              onClick={paginatedData.pagination.goToPrev}
              disabled={!paginatedData.pagination.hasPrev || paginatedData.loading}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: paginatedData.pagination.hasPrev ? '#f8f9fa' : '#e9ecef',
                cursor: paginatedData.pagination.hasPrev ? 'pointer' : 'not-allowed'
              }}
            >
              Previous
            </button>
            
            <span style={{ margin: '0 10px', color: 'grey' }}>
              Page {paginatedData.pagination.currentPage} of {paginatedData.pagination.totalPages}
            </span>
            
            <button
              onClick={paginatedData.pagination.goToNext}
              disabled={!paginatedData.pagination.hasNext || paginatedData.loading}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: paginatedData.pagination.hasNext ? '#f8f9fa' : '#e9ecef',
                cursor: paginatedData.pagination.hasNext ? 'pointer' : 'not-allowed'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestSubjectsTable;