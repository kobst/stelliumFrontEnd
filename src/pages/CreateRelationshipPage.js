import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { getUserSubjects, createRelationshipDirect } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import DashboardLayout from '../UI/layout/DashboardLayout';
import './CreateRelationshipPage.css';

function CreateRelationshipPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();

  // Entitlements store
  const canCreateRelationship = useEntitlementsStore((state) => state.canCreateRelationship);
  const isPlusUser = useEntitlementsStore((state) => state.isPlusUser);

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Person A is always the owner (stelliumUser)
  // Person B is selected from guests
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setLoading(true);
        const response = await getUserSubjects(userId);
        // Filter out the owner's own chart - only show guest charts
        const guestCharts = (response || []).filter(s => s.kind !== 'accountSelf');
        setGuests(guestCharts);
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

  const handlePartnerSelect = (person) => {
    setSelectedPartner(person);
  };

  const handleCreateRelationship = async () => {
    if (!stelliumUser || !selectedPartner) return;

    // Creating relationships is free in the credit system; proceed

    try {
      setCreating(true);
      setError(null);

      // Person A = owner (stelliumUser), Person B = selected partner
      const response = await createRelationshipDirect(
        stelliumUser._id,
        selectedPartner._id,
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

  // Security check: Redirect if user tries to access a different user's data
  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading) {
    return (
      <DashboardLayout user={stelliumUser} defaultSection="relationships">
        {() => (
          <div className="create-relationship-page">
            <div className="create-relationship-loading">
              <div className="loading-spinner"></div>
              <p>Loading charts...</p>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  const hasGuests = guests.length >= 1;

  return (
    <DashboardLayout user={stelliumUser} defaultSection="relationships">
      {() => (
        <div className="create-relationship-page">
          <div className="create-relationship-header">
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Dashboard
            </button>
            <h1>Create Relationship</h1>
            <p className="header-subtitle">Analyze your compatibility with someone</p>
          </div>

          {error && (
            <div className="create-relationship-error">
              {error}
            </div>
          )}

          {!hasGuests ? (
            <div className="not-enough-guests">
              <div className="not-enough-icon">♡</div>
              <h3>No Guest Charts</h3>
              <p>You need at least 1 guest chart to create a relationship.</p>
              <p className="not-enough-hint">Add a birth chart for someone from the Birth Charts section first.</p>
              <button className="back-to-dashboard-button" onClick={handleBackClick}>
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="create-relationship-content">
              {/* Your Chart (Person A - fixed) */}
              <div className="selection-section">
                <h2 className="selection-title">
                  <span className="selection-label">You</span>
                </h2>
                <div className="person-grid">
                  <div className="person-card selected owner-card">
                    <div className="person-name">{getPersonName(stelliumUser)}</div>
                    {getPersonSign(stelliumUser) && (
                      <div className="person-sign">{getPersonSign(stelliumUser)} Sun</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="selection-connector">
                <span className="connector-heart">♡</span>
              </div>

              {/* Partner Selection (Person B) */}
              <div className="selection-section">
                <h2 className="selection-title">
                  <span className="selection-label">Select Partner</span>
                  {selectedPartner && (
                    <span className="selected-name">{getPersonName(selectedPartner)}</span>
                  )}
                </h2>
                <div className="person-grid">
                  {guests.map(guest => (
                    <div
                      key={guest._id}
                      className={`person-card ${selectedPartner?._id === guest._id ? 'selected' : ''}`}
                      onClick={() => handlePartnerSelect(guest)}
                    >
                      <div className="person-name">{getPersonName(guest)}</div>
                      {getPersonSign(guest) && (
                        <div className="person-sign">{getPersonSign(guest)} Sun</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Relationships are free to create; no quota indicator needed */}

              {/* Create Button */}
              <div className="create-button-container">
                <button
                  className="create-relationship-button"
                  onClick={handleCreateRelationship}
                  disabled={!selectedPartner || creating || !canCreateRelationship()}
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
                {selectedPartner && (
                  <p className="create-preview">
                    {getPersonName(stelliumUser)} ♡ {getPersonName(selectedPartner)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default CreateRelationshipPage;
