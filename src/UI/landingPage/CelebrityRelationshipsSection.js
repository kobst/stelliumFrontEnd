import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCelebrityRelationships, fetchCelebrities } from '../../Utilities/api';
import CelebrityRelationshipCard from './CelebrityRelationshipCard';
import './CelebrityRelationshipsSection.css';

function CelebrityRelationshipsSection() {
  const navigate = useNavigate();
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRelationships() {
      try {
        setLoading(true);
        const [fetchedRelationships, celebrities] = await Promise.all([
          getCelebrityRelationships(6),
          fetchCelebrities()
        ]);

        // Build photo lookup map from celebrities
        const photoMap = {};
        if (celebrities && Array.isArray(celebrities)) {
          celebrities.forEach(celeb => {
            if (celeb._id && celeb.profilePhotoUrl) {
              photoMap[celeb._id] = celeb.profilePhotoUrl;
            }
          });
        }

        // Enrich relationships with photos
        const enriched = (fetchedRelationships || []).map(rel => ({
          ...rel,
          userA_profilePhotoUrl: rel.userA_profilePhotoUrl || photoMap[rel.userA_id] || null,
          userB_profilePhotoUrl: rel.userB_profilePhotoUrl || photoMap[rel.userB_id] || null,
        }));

        setRelationships(enriched);
      } catch (err) {
        console.error('Error fetching celebrity relationships:', err);
        setError('Unable to load celebrity relationships');
      } finally {
        setLoading(false);
      }
    }
    loadRelationships();
  }, []);

  const handleRelationshipClick = (relationship) => {
    navigate(`/celebrity-relationships/${relationship._id}`);
  };

  if (!loading && relationships.length === 0) {
    return null;
  }

  return (
    <section className="celeb-relationships-section">
      <div className="celeb-relationships-content">
        <div className="celeb-relationships-header">
          <span className="celeb-relationships-pretitle">EXPLORE CELEBRITY RELATIONSHIPS</span>
          <h2 className="celeb-relationships-title">Discover the cosmic chemistry between famous couples</h2>
        </div>

        {loading ? (
          <div className="celeb-relationships-loading">Loading celebrity relationships...</div>
        ) : error ? (
          <div className="celeb-relationships-error">{error}</div>
        ) : (
          <div className="celeb-relationships-cards">
            {relationships.map((rel) => (
              <CelebrityRelationshipCard
                key={rel._id}
                relationship={rel}
                onClick={() => handleRelationshipClick(rel)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default CelebrityRelationshipsSection;
