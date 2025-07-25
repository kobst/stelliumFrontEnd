import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { getUserSubjects, getUserSubjectsPaginated, deleteSubject } from '../../Utilities/api';
import useStore from '../../Utilities/store';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import AddGuestForm from './AddGuestForm';

function OtherProfilesTab({ usePagination = false }) {
  const [profiles, setProfiles] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const currentUserContext = useStore(state => state.currentUserContext);
  const userId = useStore(state => state.userId);
  const switchUserContext = useStore(state => state.switchUserContext);
  const navigate = useNavigate();
  
  // Use currentUserContext (dashboard owner) for fetching profiles
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
      async function loadProfiles() {
        try {
          const fetchedProfiles = await getUserSubjects(ownerId);
          setProfiles(fetchedProfiles);
        } catch (error) {
          console.error('Error fetching profiles:', error);
        }
      }
      loadProfiles();
    }
  }, [ownerId, refreshKey, usePagination]); // refreshKey will trigger reload when new profile is added

  // Refresh paginated data when refreshKey changes (new profile added)
  useEffect(() => {
    if (usePagination && refreshKey > 0) {
      paginatedData.refresh();
    }
  }, [refreshKey, usePagination, paginatedData]);

  const handleViewProfile = (profile) => {
    // Switch to profile context and navigate to user dashboard
    switchUserContext(profile);
    navigate(`/userDashboard/${profile._id}`);
  };

  const handleProfileAdded = () => {
    // Trigger refresh of the profiles table
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteProfile = async (profile) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${profile.firstName} ${profile.lastName}?\n\n` +
      `This will permanently remove:\n` +
      `• The profile data\n` +
      `• All associated analyses\n` +
      `• Chat history\n` +
      `• Horoscopes\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingProfile(profile._id);
    try {
      const result = await deleteSubject(profile._id, ownerId);
      
      if (usePagination) {
        // Refresh paginated data
        paginatedData.refresh();
      } else {
        // Remove deleted profile from local state
        setProfiles(prevProfiles => 
          prevProfiles.filter(p => p._id !== profile._id)
        );
      }

      // Show success message
      const deletedCount = result.deletionResults;
      const details = [];
      if (deletedCount.horoscopes > 0) details.push(`${deletedCount.horoscopes} horoscopes`);
      if (deletedCount.chatThreads > 0) details.push(`${deletedCount.chatThreads} conversations`);
      if (deletedCount.analysis > 0) details.push('analysis data');
      
      const message = details.length > 0 
        ? `Profile deleted successfully. Also removed: ${details.join(', ')}.`
        : 'Profile deleted successfully.';
      
      alert(message);
    } catch (error) {
      let errorMessage = 'Failed to delete profile.';
      
      if (error.message.includes('relationship')) {
        const relationshipCount = error.message.match(/\d+/)?.[0] || 'some';
        errorMessage = `Cannot delete this profile because they're part of ${relationshipCount} relationship(s). Please delete those relationships first.`;
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'You do not have permission to delete this profile.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'This profile may have already been deleted.';
      }
      
      alert(errorMessage);
    } finally {
      setDeletingProfile(null);
    }
  };

  // Get the data source based on pagination mode
  const dataSource = usePagination ? paginatedData.data : profiles;

  return (
    <div className="other-profiles-tab">
      <div className="user-table-container">
        <h2 style={{ color: 'grey' }}>Other Profiles</h2>
        
        {/* Search and pagination controls - only show when usePagination is true */}
        {usePagination && (
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search profiles..."
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
                <th style={{ color: 'orange' }}>First Name</th>
                <th style={{ color: 'orange' }}>Last Name</th>
                <th style={{ color: 'orange' }}>Date of Birth</th>
                <th style={{ color: 'orange' }}>Place of Birth</th>
                <th style={{ color: 'orange' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataSource.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '20px' }}>
                    {usePagination && paginatedData.loading ? 'Loading...' : 'No other profiles added yet. Add a profile below to get started.'}
                  </td>
                </tr>
              ) : (
                dataSource.map((profile) => (
                  <tr key={profile._id}>
                    <td>{profile.firstName}</td>
                    <td>{profile.lastName}</td>
                    <td>{profile.dateOfBirth}</td>
                    <td>{profile.placeOfBirth}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleViewProfile(profile)}
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
                        <button
                          onClick={() => handleDeleteProfile(profile)}
                          disabled={deletingProfile === profile._id}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: deletingProfile === profile._id ? '#6c757d' : '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: deletingProfile === profile._id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: deletingProfile === profile._id ? 0.6 : 1
                          }}
                        >
                          {deletingProfile === profile._id ? 'Deleting...' : 'Delete'}
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
              Showing {dataSource.length} of {paginatedData.pagination.totalItems} profiles
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

      {/* Add Profile Form */}
      <AddGuestForm onGuestAdded={handleProfileAdded} />
    </div>
  );
}

export default OtherProfilesTab;