import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCompositeCharts } from '../../Utilities/api';
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
      const response = await getUserCompositeCharts(userId);
      setRelationships(response || []);
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

  return (
    <div className="relationships-section">
      <h3 className="relationships-section__title">Your Relationships</h3>
      <RelationshipsList
        relationships={relationships}
        onRelationshipClick={handleRelationshipClick}
        onAddRelationship={handleAddRelationship}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default RelationshipsSection;
