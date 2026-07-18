import React, { useState, useEffect, useMemo } from 'react';
import './UsersTable.css';
import { fetchCelebrities, fetchCelebritiesPaginated, deleteSubject } from '../../Utilities/adminApi'
import { usePaginatedData } from '../../hooks/usePaginatedData';

function CelebritiesTable({
  onCelebritySelect,
  onGenerateHoroscope,
  selectedForRelationship,
  genderFilter = 'all',
  usePagination = false,
  adminTheme = false,
}) {
  const [celebrities, setCelebrities] = useState([]);
  const [deletingCelebrity, setDeletingCelebrity] = useState(null);

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

  const getSortableHeaderStyle = (field) => adminTheme ? undefined : ({
    color: 'orange',
    cursor: usePagination ? 'pointer' : 'default',
    userSelect: 'none',
    padding: '8px',
    borderBottom: usePagination && paginatedData.sortBy === field ? '2px solid orange' : 'none'
  });

  const getSortableHeaderClass = (field) => {
    if (!adminTheme) return undefined;
    return `admin-table__sortable${paginatedData.sortBy === field ? ' admin-table__sortable--active' : ''}`;
  };

  const legacyStyle = (style) => adminTheme ? undefined : style;

  const handleDeleteCelebrity = async (celebrity) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${celebrity.firstName} ${celebrity.lastName}?\n\n` +
      `This will permanently remove:\n` +
      `• The celebrity profile and all data\n` +
      `• All associated analyses\n` +
      `• Chat history\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingCelebrity(celebrity._id);
    try {
      const result = await deleteSubject(celebrity._id);

      if (usePagination) {
        // Refresh paginated data
        paginatedData.refresh();
      } else {
        // Remove deleted celebrity from local state
        setCelebrities(prevCelebrities =>
          prevCelebrities.filter(c => c._id !== celebrity._id)
        );
      }

      // Show success message
      const deletedCount = result.deletionResults;
      const details = [];
      if (deletedCount.chatThreads > 0) details.push(`${deletedCount.chatThreads} conversations`);
      if (deletedCount.analysis > 0) details.push('analysis data');

      const message = details.length > 0
        ? `Celebrity deleted successfully. Also removed: ${details.join(', ')}.`
        : 'Celebrity deleted successfully.';

      alert(message);
    } catch (error) {
      let errorMessage = 'Failed to delete celebrity.';

      if (error.message.includes('relationship')) {
        const relationshipCount = error.message.match(/\d+/)?.[0] || 'some';
        errorMessage = `Cannot delete this celebrity because they're part of ${relationshipCount} relationship(s). Please delete those relationships first.`;
      } else if (error.message.includes('not found')) {
        errorMessage = 'This celebrity may have already been deleted.';
      }

      alert(errorMessage);
    } finally {
      setDeletingCelebrity(null);
    }
  };

  // Get the data source based on pagination mode
  const dataSource = usePagination ? paginatedData.data : celebrities;

  // Filter celebrities based on gender (client-side filtering for backward compatibility)
  const filteredCelebrities = dataSource.filter(celebrity => {
    if (genderFilter === 'all') return true;
    return celebrity.gender === genderFilter;
  });

  return (
    <div className={adminTheme ? 'admin-card' : 'user-table-container'}>
      <h2 className={adminTheme ? 'admin-section-title' : undefined} style={legacyStyle({ color: 'grey' })}>Celebrity Charts</h2>
      
      {/* Search and pagination controls - only show when usePagination is true */}
      {usePagination && (
        <div className={adminTheme ? 'admin-table-toolbar' : undefined} style={legacyStyle({ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' })}>
          <input
            type="text"
            placeholder="Search celebrities..."
            value={paginatedData.search.searchTerm}
            onChange={(e) => paginatedData.search.updateSearchTerm(e.target.value)}
            className={adminTheme ? 'admin-input' : undefined}
            style={legacyStyle({
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minWidth: '200px'
            })}
          />
          
          <select
            value={paginatedData.pagination.itemsPerPage}
            onChange={(e) => paginatedData.pagination.changeItemsPerPage(Number(e.target.value))}
            className={adminTheme ? 'admin-select' : undefined}
            style={legacyStyle({
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            })}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>200 per page</option>
          </select>

          {paginatedData.loading && <span className={adminTheme ? 'admin-muted' : undefined} style={legacyStyle({ color: 'orange' })}>Loading...</span>}
        </div>
      )}

      {/* Error message */}
      {usePagination && paginatedData.error && (
        <div className={adminTheme ? 'admin-status admin-status--danger' : undefined} style={legacyStyle({ color: 'red', marginBottom: '10px' })}>
          Error: {paginatedData.error}
        </div>
      )}

      <div className={adminTheme ? 'admin-table-scroll' : 'user-table-scroll'}>
        <table className={adminTheme ? 'admin-table' : 'user-table'}>
          <thead>
            <tr>
              <th 
                style={getSortableHeaderStyle('firstName')}
                className={getSortableHeaderClass('firstName')}
                onClick={() => handleSort('firstName')}
                title={usePagination ? 'Click to sort by first name' : ''}
              >
                First Name{getSortIcon('firstName')}
              </th>
              <th 
                style={getSortableHeaderStyle('lastName')}
                className={getSortableHeaderClass('lastName')}
                onClick={() => handleSort('lastName')}
                title={usePagination ? 'Click to sort by last name' : ''}
              >
                Last Name{getSortIcon('lastName')}
              </th>
              <th 
                style={getSortableHeaderStyle('dateOfBirth')}
                className={getSortableHeaderClass('dateOfBirth')}
                onClick={() => handleSort('dateOfBirth')}
                title={usePagination ? 'Click to sort by date of birth' : ''}
              >
                Date of Birth{getSortIcon('dateOfBirth')}
              </th>
              <th
                style={getSortableHeaderStyle('placeOfBirth')}
                className={getSortableHeaderClass('placeOfBirth')}
                onClick={() => handleSort('placeOfBirth')}
                title={usePagination ? 'Click to sort by place of birth' : ''}
              >
                Place of Birth{getSortIcon('placeOfBirth')}
              </th>
              <th style={legacyStyle({ color: 'orange' })}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCelebrities.length === 0 ? (
              <tr>
                <td colSpan="5" className={adminTheme ? 'admin-muted' : undefined} style={legacyStyle({ textAlign: 'center', padding: '20px', color: 'grey' })}>
                  {usePagination && paginatedData.loading ? 'Loading...' : 'No celebrities found'}
                </td>
              </tr>
            ) : (
              filteredCelebrities.map((celebrity) => (
                <tr
                  key={celebrity._id}
                  className={selectedForRelationship && selectedForRelationship._id === celebrity._id ? 'selected-row' : ''}
                  style={legacyStyle({
                    cursor: 'pointer',
                    backgroundColor: selectedForRelationship && selectedForRelationship._id === celebrity._id ? 'rgba(128, 0, 128, 0.3)' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  })}
                >
                  <td onClick={() => handleCelebritySelect(celebrity)}>{celebrity.firstName}</td>
                  <td onClick={() => handleCelebritySelect(celebrity)}>{celebrity.lastName}</td>
                  <td onClick={() => handleCelebritySelect(celebrity)}>{celebrity.dateOfBirth}</td>
                  <td onClick={() => handleCelebritySelect(celebrity)}>{celebrity.placeOfBirth}</td>
                  <td>
                    <div className={adminTheme ? 'admin-actions' : undefined} style={legacyStyle({ display: 'flex', gap: '8px' })}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCelebritySelect(celebrity);
                        }}
                        className={adminTheme ? 'admin-btn admin-btn--primary' : undefined}
                        style={legacyStyle({
                          padding: '4px 8px',
                          backgroundColor: selectedForRelationship && selectedForRelationship._id === celebrity._id ? '#28a745' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        })}
                      >
                        {selectedForRelationship && selectedForRelationship._id === celebrity._id ? 'Selected' : 'Select'}
                      </button>
                      {onGenerateHoroscope && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateHoroscope(celebrity);
                          }}
                          className={adminTheme ? 'admin-btn admin-btn--ghost' : undefined}
                          style={legacyStyle({
                            padding: '4px 8px',
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          })}
                        >
                          Horoscope
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCelebrity(celebrity);
                        }}
                        disabled={deletingCelebrity === celebrity._id}
                        className={adminTheme ? 'admin-btn admin-btn--danger' : undefined}
                        style={legacyStyle({
                          padding: '4px 8px',
                          backgroundColor: deletingCelebrity === celebrity._id ? '#6c757d' : '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: deletingCelebrity === celebrity._id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          opacity: deletingCelebrity === celebrity._id ? 0.6 : 1
                        })}
                      >
                        {deletingCelebrity === celebrity._id ? 'Deleting...' : 'Delete'}
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
        <div className={adminTheme ? 'admin-pagination' : undefined} style={legacyStyle({
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        })}>
          <div className={adminTheme ? 'admin-muted' : undefined} style={legacyStyle({ color: 'grey', fontSize: '14px' })}>
            Showing {filteredCelebrities.length} of {paginatedData.pagination.totalItems} celebrities
            {paginatedData.search.debouncedSearchTerm && (
              <span> (filtered by "{paginatedData.search.debouncedSearchTerm}")</span>
            )}
          </div>
          
          <div className={adminTheme ? 'admin-pagination__controls' : undefined} style={legacyStyle({ display: 'flex', gap: '5px', alignItems: 'center' })}>
            <button
              onClick={paginatedData.pagination.goToPrev}
              disabled={!paginatedData.pagination.hasPrev || paginatedData.loading}
              className={adminTheme ? 'admin-btn admin-btn--ghost' : undefined}
              style={legacyStyle({
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: paginatedData.pagination.hasPrev ? '#f8f9fa' : '#e9ecef',
                cursor: paginatedData.pagination.hasPrev ? 'pointer' : 'not-allowed'
              })}
            >
              Previous
            </button>
            
            <span className={adminTheme ? 'admin-muted' : undefined} style={legacyStyle({ margin: '0 10px', color: 'grey' })}>
              Page {paginatedData.pagination.currentPage} of {paginatedData.pagination.totalPages}
            </span>
            
            <button
              onClick={paginatedData.pagination.goToNext}
              disabled={!paginatedData.pagination.hasNext || paginatedData.loading}
              className={adminTheme ? 'admin-btn admin-btn--ghost' : undefined}
              style={legacyStyle({
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: paginatedData.pagination.hasNext ? '#f8f9fa' : '#e9ecef',
                cursor: paginatedData.pagination.hasNext ? 'pointer' : 'not-allowed'
              })}
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
