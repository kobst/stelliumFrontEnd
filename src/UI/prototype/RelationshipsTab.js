import React, { useState } from 'react';
import CelebritiesTable from './CelebritiesTable';
import UserSubjectsTable from './UserSubjectsTable';
import ExistingRelationshipsTable from './ExistingRelationshipsTable';
import TabMenu from '../shared/TabMenu';
import useStore from '../../Utilities/store';
import { postCreateRelationshipProfile } from '../../Utilities/api';

function RelationshipsTab() {
  const userData = useStore(state => state.userData);
  const selectedUser = useStore(state => state.selectedUser);
  const userId = useStore(state => state.userId);
  const [selectedForRelationship, setSelectedForRelationship] = useState(null);
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  const [relationshipMessage, setRelationshipMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh of relationships table

  // Use selectedUser if userData is not available (selectedUser should be the current account user)
  const currentUser = userData || selectedUser;

  const handleCelebritySelect = (celebrity) => {
    setSelectedForRelationship(celebrity);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedForRelationship(subject);
  };

  const handleRelationshipSelect = (relationship) => {
    // ExistingRelationshipsTable handles navigation internally
  };

  const handleCreateRelationship = async () => {
    console.log('Debug - selectedForRelationship:', selectedForRelationship);
    console.log('Debug - currentUser:', currentUser);
    console.log('Debug - userData:', userData);
    console.log('Debug - selectedUser:', selectedUser);
    console.log('Debug - userId:', userId);
    
    if (!selectedForRelationship) {
      setRelationshipMessage('Please select a user to create a relationship with.');
      return;
    }
    
    if (!currentUser) {
      setRelationshipMessage('Current user data not available. Please refresh the page.');
      return;
    }

    setIsCreatingRelationship(true);
    setRelationshipMessage('');

    try {
      const result = await postCreateRelationshipProfile(currentUser, selectedForRelationship, userId);
      setRelationshipMessage('Relationship created successfully!');
      setSelectedForRelationship(null); // Clear selection
      setRefreshKey(prev => prev + 1); // Trigger refresh of relationships table
      
      // Clear the message after a delay
      setTimeout(() => {
        setRelationshipMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error creating relationship:', error);
      setRelationshipMessage('Error creating relationship. Please try again.');
    } finally {
      setIsCreatingRelationship(false);
    }
  };

  const relationshipTabs = [
    {
      id: 'celebrities',
      label: 'Celebrities',
      content: <CelebritiesTable onCelebritySelect={handleCelebritySelect} selectedForRelationship={selectedForRelationship} />
    },
    {
      id: 'userSubjects',
      label: 'Your Subjects',
      content: <UserSubjectsTable onSubjectSelect={handleSubjectSelect} selectedForRelationship={selectedForRelationship} />
    },
    {
      id: 'existingRelationships',
      label: 'Existing Relationships',
      content: <ExistingRelationshipsTable onRelationshipSelect={handleRelationshipSelect} key={refreshKey} />
    }
  ];

  return (
    <div className="relationships-tab">
      {selectedForRelationship && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          marginBottom: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3>Selected: {selectedForRelationship.firstName} {selectedForRelationship.lastName}</h3>
          <p>Born: {selectedForRelationship.dateOfBirth} in {selectedForRelationship.placeOfBirth}</p>
          <button 
            onClick={handleCreateRelationship}
            disabled={isCreatingRelationship}
            style={{
              padding: '10px 20px',
              backgroundColor: isCreatingRelationship ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isCreatingRelationship ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isCreatingRelationship ? 'Creating Relationship...' : 'Create Relationship'}
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
      <TabMenu tabs={relationshipTabs} />
    </div>
  );
}

export default RelationshipsTab;