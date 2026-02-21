import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCompositeCharts, getUserSubjects, fetchCelebrities } from '../../Utilities/api';
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
      const [composites, subjects, celebrities] = await Promise.all([
        getUserCompositeCharts(userId),
        getUserSubjects(userId).catch(() => []),
        fetchCelebrities().catch(() => [])
      ]);

      // Build photo lookup from subjects and celebrities
      const photoMap = {};
      [subjects, celebrities].forEach(list => {
        if (Array.isArray(list)) {
          list.forEach(s => {
            const id = s._id || s.id;
            if (id && s.profilePhotoUrl) {
              photoMap[id] = s.profilePhotoUrl;
            }
          });
        }
      });

      // Enrich relationships with photos from subjects
      const enriched = (composites || []).map(rel => {
        if (!rel.userB_profilePhotoUrl && !rel.userB_photoUrl && rel.userB_id) {
          const photo = photoMap[rel.userB_id];
          if (photo) {
            return { ...rel, userB_profilePhotoUrl: photo };
          }
        }
        return rel;
      });

      setRelationships(enriched);
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
        onAddRelationship={handleAddRelationship}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default RelationshipsSection;
