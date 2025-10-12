import React, { useState, useEffect } from 'react';
import BirthChartSummaryTable from '../birthChart/tables/BirthChartSummaryTable'
import Ephemeris from '../shared/Ephemeris';
import ProfilePhotoManager from '../admin/ProfilePhotoManager';

const UserBirthChartContainer= ({ selectedUser, isDataPopulated, userPlanets, userHouses, userAspects, onUserUpdate }) => {
  const [currentUser, setCurrentUser] = useState(selectedUser);

  // Update currentUser when selectedUser changes
  useEffect(() => {
    setCurrentUser(selectedUser);
  }, [selectedUser]);

  const handlePhotoUpdated = (updatedSubject) => {
    console.log('Photo updated for user:', updatedSubject);
    setCurrentUser(updatedSubject);

    // Notify parent component if callback provided
    if (onUserUpdate) {
      onUserUpdate(updatedSubject);
    }
  };

  return (
    <div className="horoscope-container">
      {currentUser && (
        <div className="user-info" style={{ color: 'white' }}>
          {/* Profile Photo Manager with upload/delete controls */}
          <ProfilePhotoManager
            subject={currentUser}
            onPhotoUpdated={handlePhotoUpdated}
            isAdmin={true}
            size={120}
          />

          <div style={{ marginTop: '10px', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', color: '#9ca3af' }}>
              <strong style={{ color: '#a78bfa' }}>User ID:</strong> {currentUser._id}
            </p>
          </div>
        </div>
      )}

      {isDataPopulated ? (
        <div>
          <BirthChartSummaryTable planets={userPlanets} houses={userHouses} aspects={userAspects} />
        </div>
      ) : (
        <Ephemeris />
      )}
    </div>
  );
};

export default UserBirthChartContainer;