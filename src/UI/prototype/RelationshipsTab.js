import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CelebritiesTable from './CelebritiesTable';
import GuestSubjectsTable from './GuestSubjectsTable';
import ExistingRelationshipsTable from './ExistingRelationshipsTable';
import TabMenu from '../shared/TabMenu';
import useStore from '../../Utilities/store';
import { createRelationshipDirect, getUserCompositeCharts } from '../../Utilities/api';

function RelationshipsTab() {
  const navigate = useNavigate();
  const userData = useStore(state => state.userData);
  const selectedUser = useStore(state => state.selectedUser);
  const userId = useStore(state => state.userId);
  const currentUserContext = useStore(state => state.currentUserContext);
  const setCompositeChart = useStore(state => state.setCompositeChart);
  const [selectedForRelationship, setSelectedForRelationship] = useState(null);
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  const [relationshipMessage, setRelationshipMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh of relationships table

  // Use currentUserContext (dashboard owner) for relationship creation
  const dashboardOwner = currentUserContext || userData || selectedUser;

  const handleCelebritySelect = (celebrity) => {
    setSelectedForRelationship(celebrity);
  };

  const handleGuestSelect = (guest) => {
    setSelectedForRelationship(guest);
  };

  const handleRelationshipSelect = (relationship) => {
    // ExistingRelationshipsTable handles navigation internally
  };

  const handleCreateRelationship = async () => {
    console.log('Debug - selectedForRelationship:', selectedForRelationship);
    console.log('Debug - dashboardOwner:', dashboardOwner);
    console.log('Debug - currentUserContext:', currentUserContext);
    console.log('Debug - userData:', userData);
    console.log('Debug - selectedUser:', selectedUser);
    console.log('Debug - userId:', userId);
    
    if (!selectedForRelationship) {
      setRelationshipMessage('Please select a user to create a relationship with.');
      return;
    }
    
    if (!dashboardOwner) {
      setRelationshipMessage('Dashboard owner data not available. Please refresh the page.');
      return;
    }

    setIsCreatingRelationship(true);
    setRelationshipMessage('Creating relationship and generating compatibility scores...');

    try {
      // Get user IDs for direct API
      const userIdA = dashboardOwner._id || dashboardOwner.id;
      const userIdB = selectedForRelationship._id || selectedForRelationship.id;
      
      console.log('Creating relationship with direct API:', { userIdA, userIdB });
      const result = await createRelationshipDirect(userIdA, userIdB);
      
      console.log('🎉 Relationship created successfully with direct API:', result);
      
      if (result.success) {
        // Show success message
        const partnerName = `${selectedForRelationship.firstName} ${selectedForRelationship.lastName}`;
        setRelationshipMessage(`✨ Relationship with ${partnerName} created successfully!`);
        
        // Clear selection and refresh table
        setSelectedForRelationship(null);
        setIsCreatingRelationship(false);
        setRefreshKey(prev => prev + 1);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setRelationshipMessage('');
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to create relationship');
      }
    } catch (error) {
      console.error('Error creating relationship:', error);
      setRelationshipMessage(error.message || 'Error creating relationship. Please try again.');
      setIsCreatingRelationship(false);
    }
    // Note: Don't set isCreatingRelationship(false) here when navigating successfully, 
    // let the new page handle the state
  };

  const relationshipTabs = [
    {
      id: 'potentialPartners',
      label: 'Potential Partners',
      content: (
        <div>
          <CelebritiesTable onCelebritySelect={handleCelebritySelect} selectedForRelationship={selectedForRelationship} />
          <div style={{ marginTop: '20px' }}>
            <GuestSubjectsTable onGuestSelect={handleGuestSelect} selectedForRelationship={selectedForRelationship} showViewOption={false} />
          </div>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <p style={{ margin: '0', color: '#6c757d', fontStyle: 'italic' }}>
              💡 <strong>Tip:</strong> You can also manage and view all your added people in the "Other Profiles" tab.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'existingRelationships',
      label: 'Existing Relationships',
      content: <ExistingRelationshipsTable onRelationshipSelect={handleRelationshipSelect} key={refreshKey} />
    }
  ];

  return (
    <div className="relationships-tab">
      {/* Success/Error Message - Always visible */}
      {relationshipMessage && !selectedForRelationship && (
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
              View your new relationship in the "Existing Relationships" tab below.
            </p>
          )}
        </div>
      )}
      
      {/* Selection Box - Only visible when someone is selected */}
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