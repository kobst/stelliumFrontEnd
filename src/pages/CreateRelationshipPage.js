import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { getUserSubjects, createRelationshipDirect } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import './CreateRelationshipPage.css';

function CreateRelationshipPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  const [selectedPersonA, setSelectedPersonA] = useState(null);
  const [selectedPersonB, setSelectedPersonB] = useState(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setLoading(true);
        const response = await getUserSubjects(userId);
        setGuests(response || []);
      } catch (err) {
        console.error('Error fetching guests:', err);
        setError('Failed to load guest charts');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchGuests();
    }
  }, [userId]);

  const handleBackClick = () => {
    navigate(`/dashboard/${userId}`);
  };

  const handlePersonSelect = (person, slot) => {
    if (slot === 'A') {
      // If selecting the same person that's in B, clear B
      if (selectedPersonB && selectedPersonB._id === person._id) {
        setSelectedPersonB(null);
      }
      setSelectedPersonA(person);
    } else {
      // If selecting the same person that's in A, clear A
      if (selectedPersonA && selectedPersonA._id === person._id) {
        setSelectedPersonA(null);
      }
      setSelectedPersonB(person);
    }
  };

  const handleCreateRelationship = async () => {
    if (!selectedPersonA || !selectedPersonB) return;

    try {
      setCreating(true);
      setError(null);

      const response = await createRelationshipDirect(
        selectedPersonA._id,
        selectedPersonB._id,
        userId
      );

      if (response && response.compositeChartId) {
        navigate(`/dashboard/${userId}/relationship/${response.compositeChartId}`);
      } else {
        throw new Error('Failed to create relationship');
      }
    } catch (err) {
      console.error('Error creating relationship:', err);
      setError(err.message || 'Failed to create relationship');
      setCreating(false);
    }
  };

  const getPersonName = (person) => {
    return `${person.firstName || ''} ${person.lastName || ''}`.trim() || 'Unknown';
  };

  const getPersonSign = (person) => {
    const sun = person?.birthChart?.planets?.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  const isPersonSelected = (person, slot) => {
    if (slot === 'A') {
      return selectedPersonA?._id === person._id;
    }
    return selectedPersonB?._id === person._id;
  };

  const isPersonDisabled = (person, slot) => {
    // A person is disabled if they're already selected in the other slot
    if (slot === 'A') {
      return selectedPersonB?._id === person._id;
    }
    return selectedPersonA?._id === person._id;
  };

  // Security check: Redirect if user tries to access a different user's data
  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading) {
    return (
      <div className="create-relationship-page">
        <div className="create-relationship-loading">
          <div className="loading-spinner"></div>
          <p>Loading charts...</p>
        </div>
      </div>
    );
  }

  const hasEnoughGuests = guests.length >= 2;

  return (
    <div className="create-relationship-page">
      <div className="create-relationship-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back to Dashboard
        </button>
        <h1>Create Relationship</h1>
        <p className="header-subtitle">Select two people to analyze their compatibility</p>
      </div>

      {error && (
        <div className="create-relationship-error">
          {error}
        </div>
      )}

      {!hasEnoughGuests ? (
        <div className="not-enough-guests">
          <div className="not-enough-icon">♡</div>
          <h3>Not Enough Charts</h3>
          <p>You need at least 2 guest charts to create a relationship.</p>
          <p className="not-enough-hint">Add more birth charts from the Birth Charts section.</p>
          <button className="back-to-dashboard-button" onClick={handleBackClick}>
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="create-relationship-content">
          {/* Person A Selection */}
          <div className="selection-section">
            <h2 className="selection-title">
              <span className="selection-label">Person A</span>
              {selectedPersonA && (
                <span className="selected-name">{getPersonName(selectedPersonA)}</span>
              )}
            </h2>
            <div className="person-grid">
              {guests.map(guest => (
                <div
                  key={guest._id}
                  className={`person-card ${isPersonSelected(guest, 'A') ? 'selected' : ''} ${isPersonDisabled(guest, 'A') ? 'disabled' : ''}`}
                  onClick={() => !isPersonDisabled(guest, 'A') && handlePersonSelect(guest, 'A')}
                >
                  <div className="person-name">{getPersonName(guest)}</div>
                  {getPersonSign(guest) && (
                    <div className="person-sign">{getPersonSign(guest)} Sun</div>
                  )}
                  {isPersonSelected(guest, 'A') && (
                    <div className="selected-badge">A</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Connector */}
          <div className="selection-connector">
            <span className="connector-heart">♡</span>
          </div>

          {/* Person B Selection */}
          <div className="selection-section">
            <h2 className="selection-title">
              <span className="selection-label">Person B</span>
              {selectedPersonB && (
                <span className="selected-name">{getPersonName(selectedPersonB)}</span>
              )}
            </h2>
            <div className="person-grid">
              {guests.map(guest => (
                <div
                  key={guest._id}
                  className={`person-card ${isPersonSelected(guest, 'B') ? 'selected' : ''} ${isPersonDisabled(guest, 'B') ? 'disabled' : ''}`}
                  onClick={() => !isPersonDisabled(guest, 'B') && handlePersonSelect(guest, 'B')}
                >
                  <div className="person-name">{getPersonName(guest)}</div>
                  {getPersonSign(guest) && (
                    <div className="person-sign">{getPersonSign(guest)} Sun</div>
                  )}
                  {isPersonSelected(guest, 'B') && (
                    <div className="selected-badge">B</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <div className="create-button-container">
            <button
              className="create-relationship-button"
              onClick={handleCreateRelationship}
              disabled={!selectedPersonA || !selectedPersonB || creating}
            >
              {creating ? (
                <>
                  <span className="button-spinner"></span>
                  Creating Relationship...
                </>
              ) : (
                'Create Relationship'
              )}
            </button>
            {selectedPersonA && selectedPersonB && (
              <p className="create-preview">
                {getPersonName(selectedPersonA)} ♡ {getPersonName(selectedPersonB)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateRelationshipPage;
