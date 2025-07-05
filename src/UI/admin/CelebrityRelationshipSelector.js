import React, { useState, useEffect } from 'react';
import { fetchCelebrities } from '../../Utilities/api';
import './CelebrityRelationshipSelector.css';

function CelebrityRelationshipSelector({ 
  selectedCelebrityA, 
  selectedCelebrityB, 
  onCelebrityASelect, 
  onCelebrityBSelect,
  genderFilterA,
  genderFilterB,
  setGenderFilterA,
  setGenderFilterB
}) {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const filterCelebrities = (genderFilter) => {
    return celebrities.filter(celebrity => {
      if (genderFilter === 'all') return true;
      return celebrity.gender === genderFilter;
    });
  };

  const CelebrityTable = ({ 
    title, 
    celebrities, 
    selectedCelebrity, 
    onSelect, 
    genderFilter, 
    setGenderFilter,
    otherSelectedCelebrity 
  }) => (
    <div className="celebrity-table-container">
      <h3 style={{ color: 'grey', marginBottom: '15px' }}>{title}</h3>
      
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

      <div className="celebrity-table-scroll">
        <table className="celebrity-table">
          <thead>
            <tr>
              <th style={{ color: 'orange' }}>First Name</th>
              <th style={{ color: 'orange' }}>Last Name</th>
              <th style={{ color: 'orange' }}>Date of Birth</th>
              <th style={{ color: 'orange' }}>Place of Birth</th>
            </tr>
          </thead>
          <tbody>
            {celebrities.map((celebrity) => {
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading celebrities...</p>
      </div>
    );
  }

  return (
    <div className="celebrity-relationship-selector">
      <div className="celebrity-tables-container">
        <div className="celebrity-table-column">
          <CelebrityTable
            title="Select Celebrity A"
            celebrities={filterCelebrities(genderFilterA)}
            selectedCelebrity={selectedCelebrityA}
            onSelect={onCelebrityASelect}
            genderFilter={genderFilterA}
            setGenderFilter={setGenderFilterA}
            otherSelectedCelebrity={selectedCelebrityB}
          />
        </div>
        
        <div className="celebrity-table-column">
          <CelebrityTable
            title="Select Celebrity B"
            celebrities={filterCelebrities(genderFilterB)}
            selectedCelebrity={selectedCelebrityB}
            onSelect={onCelebrityBSelect}
            genderFilter={genderFilterB}
            setGenderFilter={setGenderFilterB}
            otherSelectedCelebrity={selectedCelebrityA}
          />
        </div>
      </div>
    </div>
  );
}

export default CelebrityRelationshipSelector;