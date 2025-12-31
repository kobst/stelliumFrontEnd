import React from 'react';
import RelationshipCard from './RelationshipCard';
import './RelationshipsGrid.css';

function RelationshipsGrid({ relationships, onRelationshipClick }) {
  return (
    <div className="relationships-grid">
      {relationships.map(relationship => (
        <RelationshipCard
          key={relationship._id}
          relationship={relationship}
          onClick={() => onRelationshipClick(relationship._id)}
        />
      ))}
    </div>
  );
}

export default RelationshipsGrid;
