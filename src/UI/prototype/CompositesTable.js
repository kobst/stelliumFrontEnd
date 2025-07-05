import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { fetchComposites, deleteRelationship } from '../../Utilities/api'
import useStore from '../../Utilities/store';


function CompositesTable({ onCompositeChartSelect }) {
  const [composites, setComposites] = useState([]);
  const [deletingComposite, setDeletingComposite] = useState(null);
  const selectedCompositeChart = useStore(state => state.selectedCompositeChart);
  const userId = useStore(state => state.userId);
  const navigate = useNavigate();


  useEffect(() => {
    async function loadComposites() {
        if (composites.length === 0) {   
          try {
            const fetchedComposites = await fetchComposites();
            console.log("fetchedComposites")
            console.log(fetchedComposites)
            setComposites(fetchedComposites);
        } catch (error) {
          console.error('Error fetching composites:', error);
        }
      }
    }

    loadComposites();
    // getTodaysData()
    // getRetrogradeTransits()
  }, []);


  const handleCompositeChartSelect = (compositeChart) => {
    onCompositeChartSelect(compositeChart);
  };

  const handleDeleteComposite = async (compositeChart) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the relationship between ${compositeChart.userA_name} and ${compositeChart.userB_name}?\n\n` +
      `This will permanently remove:\n` +
      `• The relationship data\n` +
      `• All compatibility analyses\n` +
      `• Chat history\n` +
      `• Associated data\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingComposite(compositeChart._id);
    try {
      const result = await deleteRelationship(compositeChart._id, userId);
      
      // Remove deleted composite from local state
      setComposites(prevComposites => 
        prevComposites.filter(c => c._id !== compositeChart._id)
      );

      // Show success message
      const deletedCount = result.deletionResults;
      const details = [];
      if (deletedCount.chatThreads > 0) details.push(`${deletedCount.chatThreads} conversations`);
      if (deletedCount.analysis > 0) details.push('analysis data');
      
      const message = details.length > 0 
        ? `Relationship deleted successfully. Also removed: ${details.join(', ')}.`
        : 'Relationship deleted successfully.';
      
      alert(message);
    } catch (error) {
      let errorMessage = 'Failed to delete relationship.';
      
      if (error.message.includes('Unauthorized')) {
        errorMessage = 'You do not have permission to delete this relationship.';
      } else if (error.message.includes('not found')) {
        errorMessage = 'This relationship may have already been deleted.';
      }
      
      alert(errorMessage);
    } finally {
      setDeletingComposite(null);
    }
  };

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>User List</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
            <th style={{ color: 'orange' }}>Partner A</th>
            <th style={{ color: 'orange' }}>Date of Birth</th>
            <th style={{ color: 'orange' }}>Partner B</th>
            <th style={{ color: 'orange' }}>Date of Birth</th>
            <th style={{ color: 'orange' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
          {composites.map((compositeChart) => (
              <tr
                key={compositeChart._id}
                className={selectedCompositeChart && selectedCompositeChart._id === compositeChart._id ? 'selected' : ''}
                style={{ 
                  color: selectedCompositeChart && selectedCompositeChart._id === compositeChart._id ? 'purple' : 'white',
                  cursor: 'pointer'
                }}
            >
                <td onClick={() => handleCompositeChartSelect(compositeChart)}>{compositeChart.userA_name}</td>
                <td onClick={() => handleCompositeChartSelect(compositeChart)}>{compositeChart.userA_dateOfBirth}</td>
                <td onClick={() => handleCompositeChartSelect(compositeChart)}>{compositeChart.userB_name}</td>
                <td onClick={() => handleCompositeChartSelect(compositeChart)}>{compositeChart.userB_dateOfBirth}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompositeChartSelect(compositeChart);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: selectedCompositeChart && selectedCompositeChart._id === compositeChart._id ? '#28a745' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {selectedCompositeChart && selectedCompositeChart._id === compositeChart._id ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComposite(compositeChart);
                      }}
                      disabled={deletingComposite === compositeChart._id}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: deletingComposite === compositeChart._id ? '#6c757d' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deletingComposite === compositeChart._id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        opacity: deletingComposite === compositeChart._id ? 0.6 : 1
                      }}
                    >
                      {deletingComposite === compositeChart._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
        ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompositesTable;