import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUserCompositeCharts,
  deleteRelationship
} from '../../Utilities/api';
import RelationshipsList from './relationships/RelationshipsList';
import './RelationshipsSection.css';

function RelationshipsSection({ userId }) {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRelationships = useCallback(async () => {
    try {
      setLoading(true);
      const composites = await getUserCompositeCharts(userId);
      setRelationships(composites || []);
    } catch (err) {
      console.error('Error fetching relationships:', err);
      setError('Failed to load relationships');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadRelationships();
    }
  }, [userId, loadRelationships]);

  const handleRelationshipClick = (compositeId) => {
    navigate(`/dashboard/${userId}/relationship/${compositeId}`);
  };

  const handleAddRelationship = () => {
    navigate(`/dashboard/${userId}/relationship/create`);
  };

  const handleDeleteRelationship = async (relationshipId, relationshipName) => {
    const confirmed = window.confirm(
      `Delete ${relationshipName || 'this relationship'}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRelationship(relationshipId, userId);
      setRelationships((currentRelationships) =>
        currentRelationships.filter((relationship) => relationship._id !== relationshipId)
      );
    } catch (err) {
      console.error('Error deleting relationship:', err);
      setError(`Failed to delete ${relationshipName || 'relationship'}. Please try again.`);
    }
  };

  return (
    <div className="relationships-section">
      <div className="relationships-section__header">
        <h3 className="relationships-section__title">My Relationships</h3>
        <div className="relationships-section__actions">
          <button className="relationships-section__add-btn" onClick={handleAddRelationship}>
            Add New Relationship
          </button>
        </div>
      </div>
      <RelationshipsList
        relationships={relationships}
        onRelationshipClick={handleRelationshipClick}
        onDeleteRelationship={handleDeleteRelationship}
        onAddRelationship={handleAddRelationship}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default RelationshipsSection;
