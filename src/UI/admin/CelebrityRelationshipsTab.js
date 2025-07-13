import React, { useState } from 'react';
import CelebrityRelationshipSelector from './CelebrityRelationshipSelector';
import CelebrityRelationshipsTable from './CelebrityRelationshipsTable';
import TabMenu from '../shared/TabMenu';
import { createRelationshipDirect } from '../../Utilities/api';

function CelebrityRelationshipsTab() {
  const [selectedCelebrityA, setSelectedCelebrityA] = useState(null);
  const [selectedCelebrityB, setSelectedCelebrityB] = useState(null);
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  const [relationshipMessage, setRelationshipMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [genderFilterA, setGenderFilterA] = useState('all');
  const [genderFilterB, setGenderFilterB] = useState('all');

  const handleCelebrityASelect = (celebrity) => {
    setSelectedCelebrityA(celebrity);
    if (selectedCelebrityB && selectedCelebrityB._id === celebrity._id) {
      setSelectedCelebrityB(null);
    }
  };

  const handleCelebrityBSelect = (celebrity) => {
    setSelectedCelebrityB(celebrity);
    if (selectedCelebrityA && selectedCelebrityA._id === celebrity._id) {
      setSelectedCelebrityA(null);
    }
  };

  const handleCreateCelebrityRelationship = async () => {
    if (!selectedCelebrityA || !selectedCelebrityB) {
      setRelationshipMessage('Please select both celebrities to create a relationship.');
      return;
    }

    if (selectedCelebrityA._id === selectedCelebrityB._id) {
      setRelationshipMessage('Cannot create a relationship between the same celebrity.');
      return;
    }

    setIsCreatingRelationship(true);
    setRelationshipMessage('Creating celebrity relationship and generating compatibility scores...');

    try {
      const userIdA = selectedCelebrityA._id || selectedCelebrityA.id;
      const userIdB = selectedCelebrityB._id || selectedCelebrityB.id;
      
      console.log('Creating celebrity relationship:', { userIdA, userIdB });
      const result = await createRelationshipDirect(userIdA, userIdB, null, true);
      
      if (result.success) {
        const celebrityAName = `${selectedCelebrityA.firstName} ${selectedCelebrityA.lastName}`;
        const celebrityBName = `${selectedCelebrityB.firstName} ${selectedCelebrityB.lastName}`;
        setRelationshipMessage(`✨ Celebrity relationship between ${celebrityAName} and ${celebrityBName} created successfully!`);
        
        setSelectedCelebrityA(null);
        setSelectedCelebrityB(null);
        setIsCreatingRelationship(false);
        setRefreshKey(prev => prev + 1);
        
        setTimeout(() => {
          setRelationshipMessage('');
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to create celebrity relationship');
      }
    } catch (error) {
      console.error('Error creating celebrity relationship:', error);
      setRelationshipMessage(error.message || 'Error creating celebrity relationship. Please try again.');
      setIsCreatingRelationship(false);
    }
  };

  const celebrityRelationshipTabs = [
    {
      id: 'potentialCelebrityMatches',
      label: 'Potential Celebrity Matches',
      content: (
        <div>
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            border: '1px solid #dee2e6' 
          }}>
            <p style={{ margin: '0', color: '#6c757d', fontStyle: 'italic' }}>
              💡 <strong>Tip:</strong> Select one celebrity from each table below to create a relationship between them.
            </p>
          </div>
          
          <CelebrityRelationshipSelector
            selectedCelebrityA={selectedCelebrityA}
            selectedCelebrityB={selectedCelebrityB}
            onCelebrityASelect={handleCelebrityASelect}
            onCelebrityBSelect={handleCelebrityBSelect}
            genderFilterA={genderFilterA}
            genderFilterB={genderFilterB}
            setGenderFilterA={setGenderFilterA}
            setGenderFilterB={setGenderFilterB}
            usePagination={true}
          />
        </div>
      )
    },
    {
      id: 'existingCelebrityRelationships',
      label: 'Existing Celebrity Relationships',
      content: <CelebrityRelationshipsTable key={refreshKey} />
    }
  ];

  return (
    <div className="celebrity-relationships-tab">
      <div className="maintxt mont-font">
        <h2 style={{ color: 'grey', marginBottom: '20px' }}>Celebrity Relationships</h2>
      </div>

      {relationshipMessage && !selectedCelebrityA && !selectedCelebrityB && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: relationshipMessage.includes('Error') ? '#f8d7da' : '#d4edda', 
          color: relationshipMessage.includes('Error') ? '#721c24' : '#155724',
          marginBottom: '20px', 
          borderRadius: '8px',
          border: `1px solid ${relationshipMessage.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`,
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            {relationshipMessage}
          </p>
          {relationshipMessage.includes('successfully') && (
            <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
              View your new celebrity relationship in the "Existing Celebrity Relationships" tab below.
            </p>
          )}
        </div>
      )}
      
      {(selectedCelebrityA || selectedCelebrityB) && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          marginBottom: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>Selected Celebrities</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '15px' }}>
            <div>
              <strong>Celebrity A:</strong> {selectedCelebrityA ? 
                `${selectedCelebrityA.firstName} ${selectedCelebrityA.lastName}` : 
                'Not selected'
              }
            </div>
            <div>
              <strong>Celebrity B:</strong> {selectedCelebrityB ? 
                `${selectedCelebrityB.firstName} ${selectedCelebrityB.lastName}` : 
                'Not selected'
              }
            </div>
          </div>
          <button 
            onClick={handleCreateCelebrityRelationship}
            disabled={isCreatingRelationship || !selectedCelebrityA || !selectedCelebrityB}
            style={{
              padding: '10px 20px',
              backgroundColor: (isCreatingRelationship || !selectedCelebrityA || !selectedCelebrityB) ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isCreatingRelationship || !selectedCelebrityA || !selectedCelebrityB) ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isCreatingRelationship ? 'Creating Relationship...' : 'Create Celebrity Relationship'}
          </button>
          {relationshipMessage && (
            <p style={{ 
              marginTop: '10px', 
              color: relationshipMessage.includes('Error') ? 'red' : 'green',
              fontWeight: 'bold'
            }}>
              {relationshipMessage}
            </p>
          )}
        </div>
      )}
      
      <TabMenu tabs={celebrityRelationshipTabs} />
    </div>
  );
}

export default CelebrityRelationshipsTab;