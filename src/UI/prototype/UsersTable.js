import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { fetchUsers, fetchUsersPaginated, deleteSubject } from '../../Utilities/api'
import useStore from '../../Utilities/store';
import { usePaginatedData } from '../../hooks/usePaginatedData';

function UsersTable({ onUserSelect, usePagination = false }) {
  const [users, setUsers] = useState([]);
  const [deletingUser, setDeletingUser] = useState(null);
  const selectedUser = useStore(state => state.selectedUser);
  const currentUserId = useStore(state => state.userId);
  const navigate = useNavigate();

  // Create a wrapper function for the paginated API
  const fetchUsersWrapper = useMemo(() => {
    return (options) => fetchUsersPaginated(options);
  }, []);

  // Use the paginated data hook when pagination is enabled
  const paginatedData = usePaginatedData(
    fetchUsersWrapper,
    { page: 1, limit: 20, sortBy: 'name', sortOrder: 'asc' }
  );

  // Legacy data loading for backward compatibility
  useEffect(() => {
    if (!usePagination) {
      async function loadUsers() {
        if (users.length === 0) {   
          try {
            const fetchedUsers = await fetchUsers();
            // Filter to only show account owners (accountSelf), not guests
            const accountOwners = fetchedUsers.filter(user => user.kind === 'accountSelf');
            setUsers(accountOwners);
          } catch (error) {
            console.error('Error fetching users:', error);
          }
        }
      }

    // async function getTodaysData() {
    //   if (dailyTransits.length === 0) {
    //     const currentDateISO = new Date().toISOString();
    //     const cleanedTransits = await handleFetchDailyTransits(currentDateISO);
    //     setDailyTransits(cleanedTransits)
    //   }
    // }

    // async function getRetrogradeTransits() {
    //     if (retrogradeTransits.length === 0) {
    //     // set date range to 30 days from today
    //     const startDate = new Date().toISOString();
    //     const endDate = new Date(startDate);
    //     endDate.setDate(endDate.getDate() + 30);
    //     const retrogradeTransits = await handleFetchRetrogradeTransits(startDate, endDate);
    //     console.log("retrogradeTransits")
    //     console.log(retrogradeTransits)
    //     setRetrogradeTransits(retrogradeTransits)
    //   }
    // }

      loadUsers();
    }
    // getTodaysData()
    // getRetrogradeTransits()
  }, [usePagination, users.length]);


  const handleUserSelect = (user) => {
    onUserSelect(user);
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

  const handleDeleteUser = async (user) => {
    // Prevent users from deleting themselves
    if (user._id === currentUserId) {
      alert('You cannot delete your own account while logged in.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}'s account?\n\n` +
      `This will permanently remove:\n` +
      `• The user account and all data\n` +
      `• All associated analyses\n` +
      `• Chat history\n` +
      `• Horoscopes\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingUser(user._id);
    try {
      const result = await deleteSubject(user._id);
      
      if (usePagination) {
        // Refresh paginated data
        paginatedData.refresh();
      } else {
        // Remove deleted user from local state
        setUsers(prevUsers => 
          prevUsers.filter(u => u._id !== user._id)
        );
      }

      // Show success message
      const deletedCount = result.deletionResults;
      const details = [];
      if (deletedCount.horoscopes > 0) details.push(`${deletedCount.horoscopes} horoscopes`);
      if (deletedCount.chatThreads > 0) details.push(`${deletedCount.chatThreads} conversations`);
      if (deletedCount.analysis > 0) details.push('analysis data');
      
      const message = details.length > 0 
        ? `User account deleted successfully. Also removed: ${details.join(', ')}.`
        : 'User account deleted successfully.';
      
      alert(message);
    } catch (error) {
      let errorMessage = 'Failed to delete user account.';
      
      if (error.message.includes('relationship')) {
        const relationshipCount = error.message.match(/\d+/)?.[0] || 'some';
        errorMessage = `Cannot delete this user because they're part of ${relationshipCount} relationship(s). Please delete those relationships first.`;
      } else if (error.message.includes('not found')) {
        errorMessage = 'This user may have already been deleted.';
      }
      
      alert(errorMessage);
    } finally {
      setDeletingUser(null);
    }
  };

  // Get the data source based on pagination mode
  const dataSource = usePagination ? paginatedData.data : users;

  // Filter to only show account owners (accountSelf), not guests - client-side filtering for backward compatibility
  const filteredUsers = dataSource.filter(user => user.kind === 'accountSelf');

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Account Owners</h2>
      
      {/* Search and pagination controls - only show when usePagination is true */}
      {usePagination && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search account owners..."
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
                style={getSortableHeaderStyle('email')}
                onClick={() => handleSort('email')}
                title={usePagination ? 'Click to sort by email' : ''}
              >
                Email{getSortIcon('email')}
              </th>
              <th 
                style={getSortableHeaderStyle('dateOfBirth')}
                onClick={() => handleSort('dateOfBirth')}
                title={usePagination ? 'Click to sort by date of birth' : ''}
              >
                Date of Birth{getSortIcon('dateOfBirth')}
              </th>
              <th style={{ color: 'orange' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'grey' }}>
                  {usePagination && paginatedData.loading ? 'Loading...' : 'No account owners found'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className={selectedUser && selectedUser._id === user._id ? 'selected-row' : ''}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedUser && selectedUser._id === user._id ? 'rgba(128, 0, 128, 0.3)' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <td onClick={() => handleUserSelect(user)}>{user.firstName}</td>
                  <td onClick={() => handleUserSelect(user)}>{user.lastName}</td>
                  <td onClick={() => handleUserSelect(user)}>{user.email}</td>
                  <td onClick={() => handleUserSelect(user)}>{user.dateOfBirth}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserSelect(user);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: selectedUser && selectedUser._id === user._id ? '#28a745' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {selectedUser && selectedUser._id === user._id ? 'Selected' : 'Select'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user);
                        }}
                        disabled={deletingUser === user._id || user._id === currentUserId}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: user._id === currentUserId ? '#6c757d' : 
                                          deletingUser === user._id ? '#6c757d' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: user._id === currentUserId ? 'not-allowed' : 
                                 deletingUser === user._id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          opacity: (deletingUser === user._id || user._id === currentUserId) ? 0.6 : 1
                        }}
                        title={user._id === currentUserId ? 'Cannot delete your own account' : ''}
                      >
                        {user._id === currentUserId ? 'Self' : 
                         deletingUser === user._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
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
            Showing {filteredUsers.length} of {paginatedData.pagination.totalItems} account owners
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

export default UsersTable;