import React, { useState, useEffect, useMemo } from 'react';
import { fetchCelebrities, fetchCelebritiesPaginated } from '../../Utilities/api';
import { usePaginatedData } from '../../hooks/usePaginatedData';
import './CelebrityRelationshipSelector.css';

function CelebrityRelationshipSelector({ 
  selectedCelebrityA, 
  selectedCelebrityB, 
  onCelebrityASelect, 
  onCelebrityBSelect,
  genderFilterA,
  genderFilterB,
  setGenderFilterA,
  setGenderFilterB,
  usePagination = false
}) {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create wrapper functions for paginated API
  const fetchCelebritiesWrapperA = useMemo(() => {
    return (options) => fetchCelebritiesPaginated(options);
  }, []);

  const fetchCelebritiesWrapperB = useMemo(() => {
    return (options) => fetchCelebritiesPaginated(options);
  }, []);

  // Use paginated data hooks for both tables when pagination is enabled
  const paginatedDataA = usePaginatedData(
    fetchCelebritiesWrapperA,
    { page: 1, limit: 10, sortBy: 'name', sortOrder: 'asc' }
  );

  const paginatedDataB = usePaginatedData(
    fetchCelebritiesWrapperB,
    { page: 1, limit: 10, sortBy: 'name', sortOrder: 'asc' }
  );

  // Legacy data loading for backward compatibility
  useEffect(() => {
    if (!usePagination) {
      async function loadCelebrities() {
        try {
          const fetchedCelebrities = await fetchCelebrities();
          setCelebrities(fetchedCelebrities);
        } catch (error) {
          console.error('Error fetching celebrities:', error);
        } finally {
          setLoading(false);
        }
      }
      loadCelebrities();
    } else {
      setLoading(false);
    }
  }, [usePagination]);

  const filterCelebrities = (genderFilter, dataSource) => {
    return dataSource.filter(celebrity => {
      if (genderFilter === 'all') return true;
      return celebrity.gender === genderFilter;
    });
  };

  // Sorting functionality - only available when using pagination
  const handleSort = (field, paginatedData) => {
    if (!usePagination || !paginatedData) return;
    
    if (paginatedData.sortBy === field) {
      // Toggle sort order if same field
      const newOrder = paginatedData.sortOrder === 'asc' ? 'desc' : 'asc';
      paginatedData.changeSort(field, newOrder);
    } else {
      // Sort by new field, default to ascending
      paginatedData.changeSort(field, 'asc');
    }
  };

  const getSortIcon = (field, paginatedData) => {
    if (!usePagination || !paginatedData || paginatedData.sortBy !== field) return '';
    return paginatedData.sortOrder === 'asc' ? ' ▲' : ' ▼';
  };

  const getSortableHeaderStyle = (field, paginatedData) => ({
    color: 'orange',
    cursor: usePagination && paginatedData ? 'pointer' : 'default',
    userSelect: 'none',
    padding: '8px',
    borderBottom: usePagination && paginatedData && paginatedData.sortBy === field ? '2px solid orange' : 'none'
  });

  const CelebrityTable = ({ 
    title, 
    celebrities, 
    selectedCelebrity, 
    onSelect, 
    genderFilter, 
    setGenderFilter,
    otherSelectedCelebrity,
    paginatedData = null,
    tableId
  }) => (
    <div className="celebrity-table-container">
      <h3 style={{ color: 'grey', marginBottom: '15px' }}>{title}</h3>
      
      {/* Search and pagination controls - only show when usePagination is true */}
      {usePagination && paginatedData && (
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search celebrities..."
            value={paginatedData.search.searchTerm}
            onChange={(e) => paginatedData.search.updateSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />
          
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            <select
              value={paginatedData.pagination.itemsPerPage}
              onChange={(e) => paginatedData.pagination.changeItemsPerPage(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
            
            {paginatedData.loading && <span style={{ color: 'orange' }}>Loading...</span>}
          </div>
        </div>
      )}
      
      <div style={{ 
        marginBottom: '15px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px', 
        border: '1px solid #dee2e6',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <label style={{ 
          color: '#495057', 
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          Filter by Gender:
        </label>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            backgroundColor: 'white',
            color: '#495057',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: '120px'
          }}
        >
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="nonbinary">Non-binary</option>
        </select>
      </div>

      {/* Error message */}
      {usePagination && paginatedData && paginatedData.error && (
        <div style={{ color: 'red', marginBottom: '10px', fontSize: '12px' }}>
          Error: {paginatedData.error}
        </div>
      )}

      <div className="celebrity-table-scroll">
        <table className="celebrity-table">
          <thead>
            <tr>
              <th 
                style={getSortableHeaderStyle('firstName', paginatedData)}
                onClick={() => handleSort('firstName', paginatedData)}
                title={usePagination && paginatedData ? 'Click to sort by first name' : ''}
              >
                First Name{getSortIcon('firstName', paginatedData)}
              </th>
              <th 
                style={getSortableHeaderStyle('lastName', paginatedData)}
                onClick={() => handleSort('lastName', paginatedData)}
                title={usePagination && paginatedData ? 'Click to sort by last name' : ''}
              >
                Last Name{getSortIcon('lastName', paginatedData)}
              </th>
              <th 
                style={getSortableHeaderStyle('dateOfBirth', paginatedData)}
                onClick={() => handleSort('dateOfBirth', paginatedData)}
                title={usePagination && paginatedData ? 'Click to sort by date of birth' : ''}
              >
                Date of Birth{getSortIcon('dateOfBirth', paginatedData)}
              </th>
              <th 
                style={getSortableHeaderStyle('placeOfBirth', paginatedData)}
                onClick={() => handleSort('placeOfBirth', paginatedData)}
                title={usePagination && paginatedData ? 'Click to sort by place of birth' : ''}
              >
                Place of Birth{getSortIcon('placeOfBirth', paginatedData)}
              </th>
            </tr>
          </thead>
          <tbody>
            {celebrities.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'grey' }}>
                  {usePagination && paginatedData && paginatedData.loading ? 'Loading...' : 'No celebrities found'}
                </td>
              </tr>
            ) : (
              celebrities.map((celebrity) => {
                const isSelected = selectedCelebrity && selectedCelebrity._id === celebrity._id;
                const isOtherSelected = otherSelectedCelebrity && otherSelectedCelebrity._id === celebrity._id;
                
                return (
                  <tr
                    key={celebrity._id}
                    onClick={() => !isOtherSelected && onSelect(celebrity)}
                    className={isSelected ? 'selected-row' : ''}
                    style={{ 
                      cursor: isOtherSelected ? 'not-allowed' : 'pointer',
                      backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.3)' : 
                                     isOtherSelected ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
                      transition: 'background-color 0.2s ease',
                      opacity: isOtherSelected ? 0.5 : 1
                    }}
                  >
                    <td>{celebrity.firstName}</td>
                    <td>{celebrity.lastName}</td>
                    <td>{celebrity.dateOfBirth}</td>
                    <td>{celebrity.placeOfBirth}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls - only show when usePagination is true */}
      {usePagination && paginatedData && (
        <div style={{ 
          marginTop: '15px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '12px',
          gap: '10px'
        }}>
          <div style={{ color: 'grey' }}>
            Showing {celebrities.length} of {paginatedData.pagination.totalItems} celebrities
          </div>
          
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button
              onClick={paginatedData.pagination.goToPrev}
              disabled={!paginatedData.pagination.hasPrev || paginatedData.loading}
              style={{
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: paginatedData.pagination.hasPrev ? '#f8f9fa' : '#e9ecef',
                cursor: paginatedData.pagination.hasPrev ? 'pointer' : 'not-allowed',
                fontSize: '11px'
              }}
            >
              Prev
            </button>
            
            <span style={{ margin: '0 5px', color: 'grey' }}>
              {paginatedData.pagination.currentPage}/{paginatedData.pagination.totalPages}
            </span>
            
            <button
              onClick={paginatedData.pagination.goToNext}
              disabled={!paginatedData.pagination.hasNext || paginatedData.loading}
              style={{
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: paginatedData.pagination.hasNext ? '#f8f9fa' : '#e9ecef',
                cursor: paginatedData.pagination.hasNext ? 'pointer' : 'not-allowed',
                fontSize: '11px'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading celebrities...</p>
      </div>
    );
  }

  // Get data sources based on pagination mode
  const dataSourceA = usePagination ? paginatedDataA.data : celebrities;
  const dataSourceB = usePagination ? paginatedDataB.data : celebrities;

  return (
    <div className="celebrity-relationship-selector">
      <div className="celebrity-tables-container">
        <div className="celebrity-table-column">
          <CelebrityTable
            title="Select Celebrity A"
            celebrities={filterCelebrities(genderFilterA, dataSourceA)}
            selectedCelebrity={selectedCelebrityA}
            onSelect={onCelebrityASelect}
            genderFilter={genderFilterA}
            setGenderFilter={setGenderFilterA}
            otherSelectedCelebrity={selectedCelebrityB}
            paginatedData={usePagination ? paginatedDataA : null}
            tableId="A"
          />
        </div>
        
        <div className="celebrity-table-column">
          <CelebrityTable
            title="Select Celebrity B"
            celebrities={filterCelebrities(genderFilterB, dataSourceB)}
            selectedCelebrity={selectedCelebrityB}
            onSelect={onCelebrityBSelect}
            genderFilter={genderFilterB}
            setGenderFilter={setGenderFilterB}
            otherSelectedCelebrity={selectedCelebrityA}
            paginatedData={usePagination ? paginatedDataB : null}
            tableId="B"
          />
        </div>
      </div>
    </div>
  );
}

export default CelebrityRelationshipSelector;