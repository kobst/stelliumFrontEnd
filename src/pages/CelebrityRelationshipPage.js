import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { fetchCelebritiesPaginated, createRelationshipDirect } from '../Utilities/api';
import { useAuth } from '../context/AuthContext';
import useEntitlementsStore from '../Utilities/entitlementsStore';
import { CREDIT_COSTS } from '../Utilities/creditCosts';
import DashboardLayout from '../UI/layout/DashboardLayout';
import InsufficientCreditsModal from '../UI/entitlements/InsufficientCreditsModal';
import './CelebrityRelationshipPage.css';

function CelebrityRelationshipPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { stelliumUser } = useAuth();

  // Entitlements store
  const canCreateRelationship = useEntitlementsStore((state) => state.canCreateRelationship);
  const credits = useEntitlementsStore((state) => state.credits);

  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  // Selected celebrity
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);

  // Fetch celebrities with pagination and search
  useEffect(() => {
    const fetchCelebs = async () => {
      try {
        setLoading(true);
        const response = await fetchCelebritiesPaginated({
          page,
          limit,
          search: searchTerm || undefined,
          usePagination: true
        });
        
        if (response.success) {
          setCelebrities(response.data || []);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalCount(response.pagination?.total || 0);
        } else {
          // Fallback to non-paginated
          setCelebrities(response || []);
        }
      } catch (err) {
        console.error('Error fetching celebrities:', err);
        setError('Failed to load celebrities');
      } finally {
        setLoading(false);
      }
    };

    fetchCelebs();
  }, [page, searchTerm]);

  // Filter celebrities by gender (client-side filter on top of search)
  const filteredCelebrities = useMemo(() => {
    if (genderFilter === 'all') return celebrities;
    return celebrities.filter(c => c.gender === genderFilter);
  }, [celebrities, genderFilter]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleBackClick = () => {
    navigate(`/dashboard/${userId}`);
  };

  const handleCelebritySelect = (celebrity) => {
    setSelectedCelebrity(celebrity);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedCelebrity(null); // Clear selection on new search
  };

  const handleCreateCelebrityRelationship = async () => {
    if (!stelliumUser || !selectedCelebrity) return;

    const cost = CREDIT_COSTS.RELATIONSHIP_OVERVIEW;
    if (credits.total < cost) {
      setShowPaywall(true);
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Create relationship: User (Person A) + Celebrity (Person B)
      const response = await createRelationshipDirect(
        stelliumUser._id,
        selectedCelebrity._id,
        userId,
        true // celebRelationship flag
      );

      if (response && response.compositeChartId) {
        navigate(`/dashboard/${userId}/relationship/${response.compositeChartId}`);
      } else {
        throw new Error('Failed to create celebrity relationship');
      }
    } catch (err) {
      console.error('Error creating celebrity relationship:', err);

      if (err?.statusCode === 402) {
        setShowPaywall(true);
      } else {
        setError(err.message || 'Failed to create relationship');
      }

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

  const getCelebrityProfession = (celebrity) => {
    // Try to extract profession from metadata or name
    return celebrity.profession || null;
  };

  // Security check: Redirect if user tries to access a different user's data
  if (stelliumUser && userId !== stelliumUser._id) {
    return <Navigate to={`/dashboard/${stelliumUser._id}`} replace />;
  }

  if (loading && celebrities.length === 0) {
    return (
      <DashboardLayout user={stelliumUser} defaultSection="relationships">
        {() => (
          <div className="celebrity-relationship-page">
            <div className="celebrity-loading">
              <div className="loading-spinner"></div>
              <p>Loading celebrities...</p>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={stelliumUser} defaultSection="relationships">
      {() => (
        <div className="celebrity-relationship-page">
          <div className="celebrity-header">
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Dashboard
            </button>
            <h1>Celebrity Compatibility</h1>
            <p className="header-subtitle">
              Discover your cosmic compatibility with famous personalities
            </p>
          </div>

          {error && (
            <div className="celebrity-error">
              {error}
            </div>
          )}

          <div className="celebrity-content">
            {/* Your Chart (Person A - fixed) */}
            <div className="your-chart-section">
              <h2 className="section-title">
                <span className="section-label">You</span>
              </h2>
              <div className="your-card">
                <div className="person-name">{getPersonName(stelliumUser)}</div>
                {getPersonSign(stelliumUser) && (
                  <div className="person-sign">{getPersonSign(stelliumUser)} Sun</div>
                )}
              </div>
            </div>

            {/* Connector */}
            <div className="selection-connector">
              <span className="connector-star">★</span>
            </div>

            {/* Celebrity Selection */}
            <div className="celebrity-selection-section">
              <h2 className="section-title">
                <span className="section-label">Select a Celebrity</span>
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

              {/* Results count */}
              <div className="results-info">
                {totalCount > 0 ? (
                  <span>Showing {filteredCelebrities.length} of {totalCount} celebrities</span>
                ) : (
                  <span>No celebrities found</span>
                )}
              </div>

              {/* Celebrity Grid */}
              <div className="celebrity-grid">
                {loading ? (
                  <div className="grid-loading">
                    <div className="loading-spinner small"></div>
                    <span>Loading...</span>
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
                        {getCelebrityProfession(celebrity) && (
                          <div className="celebrity-profession">{getCelebrityProfession(celebrity)}</div>
                        )}
                      </div>
                      {selectedCelebrity?._id === celebrity._id && (
                        <div className="selected-badge">✓</div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Previous
                  </button>
                  <span className="page-info">Page {page} of {totalPages}</span>
                  <button 
                    className="pagination-btn"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>

            {/* Create Button */}
            <div className="create-button-container">
              <button
                className="create-celebrity-button"
                onClick={handleCreateCelebrityRelationship}
                disabled={!selectedCelebrity || creating || !canCreateRelationship()}
              >
                {creating ? (
                  <>
                    <span className="button-spinner"></span>
                    Analyzing Compatibility...
                  </>
                ) : selectedCelebrity ? (
                  `Analyze with ${getPersonName(selectedCelebrity)}`
                ) : (
                  'Select a Celebrity'
                )}
              </button>
              <p className="create-credit-note">Costs {CREDIT_COSTS.RELATIONSHIP_OVERVIEW} credits</p>
              {selectedCelebrity && (
                <p className="create-preview">
                  {getPersonName(stelliumUser)} ★ {getPersonName(selectedCelebrity)}
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

export default CelebrityRelationshipPage;
