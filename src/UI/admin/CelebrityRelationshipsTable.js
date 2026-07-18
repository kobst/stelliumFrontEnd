import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../prototype/UsersTable.css';
import { getCelebrityRelationships, deleteRelationship } from '../../Utilities/adminApi';
import useStore from '../../Utilities/store';

function CelebrityRelationshipsTable() {
  const [celebrityRelationships, setCelebrityRelationships] = useState([]);
  const [deletingRelationship, setDeletingRelationship] = useState(null);
  const [loading, setLoading] = useState(true);
  const setCompositeChart = useStore(state => state.setCompositeChart);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCelebrityRelationships() {
      try {
        const relationships = await getCelebrityRelationships();
        setCelebrityRelationships(relationships);
      } catch (error) {
        console.error('Error loading celebrity relationships:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCelebrityRelationships();
  }, []);

  const handleRelationshipSelect = (relationship) => {
    setCompositeChart(relationship);
    navigate('/compositeDashboard');
  };

  const handleDeleteRelationship = async (relationship) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the celebrity relationship between ${relationship.userA_name} and ${relationship.userB_name}?\n\n` +
      `This will permanently remove:\n` +
      `• The relationship data\n` +
      `• All compatibility analyses\n` +
      `• Chat history\n` +
      `• Associated data\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingRelationship(relationship._id);
    try {
      const result = await deleteRelationship(relationship._id, relationship.userA_id);
      
      setCelebrityRelationships(prevRelationships => 
        prevRelationships.filter(r => r._id !== relationship._id)
      );

      const deletedCount = result.deletionResults;
      const details = [];
      if (deletedCount.chatThreads > 0) details.push(`${deletedCount.chatThreads} conversations`);
      if (deletedCount.analysis > 0) details.push('analysis data');
      
      const message = details.length > 0 
        ? `Celebrity relationship deleted successfully. Also removed: ${details.join(', ')}.`
        : 'Celebrity relationship deleted successfully.';
      
      alert(message);
    } catch (error) {
      let errorMessage = 'Failed to delete celebrity relationship.';
      
      if (error.message.includes('Unauthorized')) {
        errorMessage = 'You do not have permission to delete this relationship.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'This relationship may have already been deleted.';
      }
      
      alert(errorMessage);
    } finally {
      setDeletingRelationship(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="admin-section-title">Celebrity Relationships</h2>
        <div className="admin-empty">
          <p>Loading celebrity relationships...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="admin-section-title">Celebrity Relationships</h2>
      {celebrityRelationships.length === 0 ? (
        <div className="admin-empty">
          <p style={{ margin: 0, fontSize: '16px' }}>
            No celebrity relationships found.
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
            Create celebrity relationships in the "Potential Celebrity Matches" tab above.
          </p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Celebrity A</th>
                <th>Celebrity B</th>
                <th>Celebrity A DOB</th>
                <th>Celebrity B DOB</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {celebrityRelationships.map((relationship) => (
                <tr
                  key={relationship._id}
                  style={{ cursor: 'pointer' }}
                >
                  <td onClick={() => handleRelationshipSelect(relationship)}>{relationship.userA_firstName} {relationship.userA_lastName}</td>
                  <td onClick={() => handleRelationshipSelect(relationship)}>{relationship.userB_firstName} {relationship.userB_lastName}</td>
                  <td onClick={() => handleRelationshipSelect(relationship)}>{new Date(relationship.userA_dateOfBirth).toLocaleDateString()}</td>
                  <td onClick={() => handleRelationshipSelect(relationship)}>{new Date(relationship.userB_dateOfBirth).toLocaleDateString()}</td>
                  <td onClick={() => handleRelationshipSelect(relationship)}>{new Date(relationship.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRelationshipSelect(relationship);
                        }}
                        className="admin-btn admin-btn--primary"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRelationship(relationship);
                        }}
                        disabled={deletingRelationship === relationship._id}
                        className="admin-btn admin-btn--danger"
                      >
                        {deletingRelationship === relationship._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CelebrityRelationshipsTable;
