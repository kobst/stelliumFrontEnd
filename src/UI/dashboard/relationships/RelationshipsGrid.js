import React from 'react';
import RelationshipCard from './RelationshipCard';
import './RelationshipsGrid.css';

function RelationshipsGrid({ relationships, onRelationshipClick, onDeleteRelationship }) {
  return (
    <div className="relationships-grid">
      {relationships.map(relationship => (
        <RelationshipCard
          key={relationship._id}
          relationship={relationship}
          onClick={() => onRelationshipClick(relationship._id)}
          onDelete={onDeleteRelationship}
        />
      ))}
    </div>
  );
}

export default RelationshipsGrid;
