import React from 'react';
import RelationshipsGrid from './RelationshipsGrid';
import './RelationshipsList.css';

function RelationshipsList({
  relationships,
  onRelationshipClick,
  onAddRelationship,
  loading,
  error
}) {
  if (loading) {
    return (
      <div className="relationships-list">
        <div className="relationships-list__loading">
          <div className="loading-spinner"></div>
          <p>Loading relationships...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relationships-list">
        <div className="relationships-list__error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relationships-list">
      {/* Content */}
      {relationships.length === 0 ? (
        <div className="relationships-list__empty">
          <div className="empty-icon">&#x2661;</div>
          <h3>No Relationships Yet</h3>
          <p>Create a relationship to see compatibility scores</p>
          <button
            className="relationships-list__add-btn primary"
            onClick={onAddRelationship}
          >
            + Add Your First Relationship
          </button>
        </div>
      ) : (
        <RelationshipsGrid
          relationships={relationships}
          onRelationshipClick={onRelationshipClick}
        />
      )}
    </div>
  );
}

export default RelationshipsList;
