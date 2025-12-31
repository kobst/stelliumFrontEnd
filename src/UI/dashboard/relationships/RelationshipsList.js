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
        <>
          <RelationshipsGrid
            relationships={relationships}
            onRelationshipClick={onRelationshipClick}
          />
          <button className="relationships-list__add-btn" onClick={onAddRelationship}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Relationship
          </button>
        </>
      )}
    </div>
  );
}

export default RelationshipsList;
