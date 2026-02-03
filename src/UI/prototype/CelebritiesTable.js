import React, { useState, useEffect, useMemo } from 'react';
import './UsersTable.css';
import { fetchCelebrities, fetchCelebritiesPaginated } from '../../Utilities/api'
import { usePaginatedData } from '../../hooks/usePaginatedData';

const formatDateOfBirth = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

function CelebritiesTable({ onCelebritySelect, selectedForRelationship, genderFilter = 'all', usePagination = false }) {
  const [celebrities, setCelebrities] = useState([]);

  // Create a wrapper function for the paginated API
  const fetchCelebritiesWrapper = useMemo(() => {
    return (options) => fetchCelebritiesPaginated(options);
  }, []);

  // Use the paginated data hook when pagination is enabled
  const paginatedData = usePaginatedData(
    fetchCelebritiesWrapper,
    { page: 1, limit: 50, sortBy: 'name', sortOrder: 'asc' }
  );

  // Legacy data loading for backward compatibility
  useEffect(() => {
    if (!usePagination) {
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
    }
  }, [usePagination, celebrities.length]);

  const handleCelebritySelect = (celebrity) => {
    if (onCelebritySelect) {
      onCelebritySelect(celebrity);
    }
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

  // Get the data source based on pagination mode
  const dataSource = usePagination ? paginatedData.data : celebrities;

  // Filter celebrities based on gender (client-side filtering for backward compatibility)
  const filteredCelebrities = dataSource.filter(celebrity => {
    if (genderFilter === 'all') return true;
    return celebrity.gender === genderFilter;
  });

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Celebrity Charts</h2>
      
      {/* Search and pagination controls - only show when usePagination is true */}
      {usePagination && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search celebrities..."
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
            <option value={200}>200 per page</option>
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
            </tr>
          </thead>
          <tbody>
            {filteredCelebrities.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'grey' }}>
                  {usePagination && paginatedData.loading ? 'Loading...' : 'No celebrities found'}
                </td>
              </tr>
            ) : (
              filteredCelebrities.map((celebrity) => (
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
                  <td>{formatDateOfBirth(celebrity.dateOfBirth)}</td>
                  <td>{celebrity.placeOfBirth}</td>
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
            Showing {filteredCelebrities.length} of {paginatedData.pagination.totalItems} celebrities
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

export default CelebritiesTable;