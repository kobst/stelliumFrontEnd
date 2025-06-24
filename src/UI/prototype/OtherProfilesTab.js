import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { getUserSubjects } from '../../Utilities/api';
import useStore from '../../Utilities/store';
import AddGuestForm from './AddGuestForm';

function OtherProfilesTab() {
  const [profiles, setProfiles] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const currentUserContext = useStore(state => state.currentUserContext);
  const userId = useStore(state => state.userId);
  const switchUserContext = useStore(state => state.switchUserContext);
  const navigate = useNavigate();
  
  // Use currentUserContext (dashboard owner) for fetching profiles
  const ownerId = currentUserContext?._id || userId;

  useEffect(() => {
    async function loadProfiles() {
      if (ownerId) {   
        try {
          const fetchedProfiles = await getUserSubjects(ownerId);
          setProfiles(fetchedProfiles);
        } catch (error) {
          console.error('Error fetching profiles:', error);
        }
      }
    }

    loadProfiles();
  }, [ownerId, refreshKey]); // refreshKey will trigger reload when new profile is added

  const handleViewProfile = (profile) => {
    // Switch to profile context and navigate to user dashboard
    switchUserContext(profile);
    navigate(`/userDashboard/${profile._id}`);
  };

  const handleProfileAdded = () => {
    // Trigger refresh of the profiles table
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="other-profiles-tab">
      <div className="user-table-container">
        <h2 style={{ color: 'grey' }}>Other Profiles</h2>
        <div className="user-table-scroll">
          <table className="user-table">
            <thead>
              <tr>
                <th style={{ color: 'orange' }}>First Name</th>
                <th style={{ color: 'orange' }}>Last Name</th>
                <th style={{ color: 'orange' }}>Date of Birth</th>
                <th style={{ color: 'orange' }}>Place of Birth</th>
                <th style={{ color: 'orange' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                    No other profiles added yet. Add a profile below to get started.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr key={profile._id}>
                    <td>{profile.firstName}</td>
                    <td>{profile.lastName}</td>
                    <td>{profile.dateOfBirth}</td>
                    <td>{profile.placeOfBirth}</td>
                    <td>
                      <button
                        onClick={() => handleViewProfile(profile)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Profile Form */}
      <AddGuestForm onGuestAdded={handleProfileAdded} />
    </div>
  );
}

export default OtherProfilesTab;