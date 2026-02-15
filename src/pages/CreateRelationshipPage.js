import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { getUserSubjects, fetchCelebritiesPaginated, createRelationshipDirect } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import DashboardLayout from '../UI/layout/DashboardLayout';
import InsufficientCreditsModal from '../UI/entitlements/InsufficientCreditsModal';
import './CreateRelationshipPage.css';

function CreateRelationshipPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();

  // Entitlements store
  const canCreateRelationship = useEntitlementsStore((state) => state.canCreateRelationship);
  const credits = useEntitlementsStore((state) => state.credits);

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Guest selection
  const [selectedPartner, setSelectedPartner] = useState(null);

  // Celebrity state
  const [celebrities, setCelebrities] = useState([]);
  const [celebLoading, setCelebLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);

  // Fetch guest charts
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setLoading(true);
        const response = await getUserSubjects(userId);
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

  // Fetch ALL celebrities (no pagination — only ~39)
  useEffect(() => {
    const fetchCelebs = async () => {
      try {
        setCelebLoading(true);
        const response = await fetchCelebritiesPaginated({ usePagination: false, limit: 100 });

        if (response.success) {
          setCelebrities(response.data || []);
        } else {
          setCelebrities(response || []);
        }
      } catch (err) {
        console.error('Error fetching celebrities:', err);
      } finally {
        setCelebLoading(false);
      }
    };

    fetchCelebs();
  }, []);

  const getPersonName = (person) => {
    return `${person.firstName || ''} ${person.lastName || ''}`.trim() || 'Unknown';
  };

  const getPersonSign = (person) => {
    const sun = person?.birthChart?.planets?.find(p => p.name === 'Sun');
    return sun?.sign || null;
  };

  // Client-side filtering fixes the broken pagination-based filter
  const filteredCelebrities = useMemo(() => {
    let result = celebrities;
    if (genderFilter !== 'all') {
      result = result.filter(c => c.gender === genderFilter);
    }
    if (searchTerm) {
      result = result.filter(c =>
        getPersonName(c).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [celebrities, genderFilter, searchTerm]);

  // Derived selected person (guest or celebrity)
  const selectedPerson = selectedPartner || selectedCelebrity;
  const isCelebrity = !!selectedCelebrity;

  const handleBackClick = () => {
    navigate(`/dashboard/${userId}`);
  };

  const handlePartnerSelect = (person) => {
    setSelectedCelebrity(null); // Clear celebrity selection
    setSelectedPartner(person);
  };

  const handleCelebritySelect = (celebrity) => {
    setSelectedPartner(null); // Clear guest selection
    setSelectedCelebrity(celebrity);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateRelationship = async () => {
    if (!stelliumUser || !selectedPerson) return;

    const cost = CREDIT_COSTS.RELATIONSHIP_OVERVIEW;
    if (credits.total < cost) {
      setShowPaywall(true);
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await createRelationshipDirect(
        stelliumUser._id,
        selectedPerson._id,
        userId,
        isCelebrity // celebRelationship flag
      );

      if (response && response.compositeChartId) {
        navigate(`/dashboard/${userId}/relationship/${response.compositeChartId}`);
      } else {
        throw new Error('Failed to create relationship');
      }
    } catch (err) {
      console.error('Error creating relationship:', err);

      if (err?.statusCode === 402) {
        setShowPaywall(true);
      } else {
        setError(err.message || 'Failed to create relationship');
      }

      setCreating(false);
    }
  };

  // Security check
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

          <div className="create-relationship-content">
            {/* Centered "You" card */}
            <div className="your-chart-section">
              <div className="your-card">
                <div className="person-name">{getPersonName(stelliumUser)}</div>
                {getPersonSign(stelliumUser) && (
                  <div className="person-sign">{getPersonSign(stelliumUser)} Sun</div>
                )}
              </div>
            </div>

            {/* Connector */}
            <div className="selection-connector">
              <span className="connector-heart">♡</span>
            </div>

            {/* Your Charts (Guest) Section */}
            {guests.length > 0 && (
              <div className="selection-section">
                <h2 className="selection-title">
                  <span className="selection-label">Your Charts</span>
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
                      {selectedPartner?._id === guest._id && (
                        <div className="selected-badge">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Celebrity Section */}
            <div className="celebrity-section">
              <h2 className="selection-title">
                <span className="selection-label">Or Choose a Celebrity</span>
                {selectedCelebrity && (
                  <span className="selected-name">{getPersonName(selectedCelebrity)}</span>
                )}
              </h2>

              {/* Search and Filters */}
              <div className="celebrity-controls">
                <input
                  type="text"
                  className="celebrity-search"
                  placeholder="Search celebrities by name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${genderFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setGenderFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${genderFilter === 'male' ? 'active' : ''}`}
                    onClick={() => setGenderFilter('male')}
                  >
                    Male
                  </button>
                  <button
                    className={`filter-btn ${genderFilter === 'female' ? 'active' : ''}`}
                    onClick={() => setGenderFilter('female')}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Celebrity Grid */}
              <div className="celebrity-grid">
                {celebLoading ? (
                  <div className="grid-loading">
                    <div className="loading-spinner small"></div>
                    <span>Loading celebrities...</span>
                  </div>
                ) : filteredCelebrities.length === 0 ? (
                  <div className="no-results">
                    <p>No celebrities match your search</p>
                  </div>
                ) : (
                  filteredCelebrities.map(celebrity => (
                    <div
                      key={celebrity._id}
                      className={`celebrity-card ${selectedCelebrity?._id === celebrity._id ? 'selected' : ''}`}
                      onClick={() => handleCelebritySelect(celebrity)}
                    >
                      {celebrity.profilePhotoUrl || celebrity.photoUrl ? (
                        <div
                          className="celebrity-photo"
                          style={{ backgroundImage: `url(${celebrity.profilePhotoUrl || celebrity.photoUrl})` }}
                        />
                      ) : (
                        <div className="celebrity-photo placeholder">
                          <span className="photo-placeholder-icon">★</span>
                        </div>
                      )}
                      <div className="celebrity-info">
                        <div className="celebrity-name">{getPersonName(celebrity)}</div>
                        {getPersonSign(celebrity) && (
                          <div className="celebrity-sign">{getPersonSign(celebrity)}</div>
                        )}
                        {celebrity.profession && (
                          <div className="celebrity-profession">{celebrity.profession}</div>
                        )}
                      </div>
                      {selectedCelebrity?._id === celebrity._id && (
                        <div className="selected-badge">✓</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Create Button */}
            <div className="create-button-container">
              <button
                className="create-relationship-button"
                onClick={handleCreateRelationship}
                disabled={!selectedPerson || creating || !canCreateRelationship()}
              >
                {creating ? (
                  <>
                    <span className="button-spinner"></span>
                    Analyzing Compatibility...
                  </>
                ) : selectedPerson ? (
                  `Analyze with ${getPersonName(selectedPerson)}`
                ) : (
                  'Select a Person'
                )}
              </button>
              <p className="create-credit-note">Costs {CREDIT_COSTS.RELATIONSHIP_OVERVIEW} credits</p>
              {selectedPerson && (
                <p className="create-preview">
                  {getPersonName(stelliumUser)} ♡ {getPersonName(selectedPerson)}
                </p>
              )}
            </div>
          </div>

          <InsufficientCreditsModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            creditsNeeded={CREDIT_COSTS.RELATIONSHIP_OVERVIEW}
            creditsAvailable={credits.total}
            onBuyCredits={() => { setShowPaywall(false); navigate('/pricingTable'); }}
            onSubscribe={() => { setShowPaywall(false); navigate('/pricingTable'); }}
          />
        </div>
      )}
    </DashboardLayout>
  );
}

export default CreateRelationshipPage;
