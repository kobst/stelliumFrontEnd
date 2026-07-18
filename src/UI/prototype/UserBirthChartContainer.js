import React, { useState, useEffect } from 'react';
import BirthChartSummaryTable from '../birthChart/tables/BirthChartSummaryTable'
import Ephemeris from '../shared/Ephemeris';
import ProfilePhotoManager from '../admin/ProfilePhotoManager';

const UserBirthChartContainer= ({ selectedUser, isDataPopulated, userPlanets, userHouses, userAspects, onUserUpdate, adminTheme = false }) => {
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
    <section className={adminTheme ? 'admin-card subject-chart-card' : 'horoscope-container'}>
      {currentUser && (
        <div className={adminTheme ? 'user-info subject-user-info' : 'user-info'} style={adminTheme ? undefined : { color: 'white' }}>
          {/* Profile Photo Manager with upload/delete controls */}
          <ProfilePhotoManager
            subject={currentUser}
            onPhotoUpdated={handlePhotoUpdated}
            isAdmin={true}
            size={120}
          />

          <div className={adminTheme ? 'subject-user-meta' : undefined} style={adminTheme ? undefined : { marginTop: '10px', padding: '10px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p className={adminTheme ? 'admin-muted admin-id' : undefined} style={adminTheme ? undefined : { margin: '5px 0', fontSize: '14px', color: '#9ca3af' }}>
              <strong style={adminTheme ? undefined : { color: '#a78bfa' }}>User ID:</strong> {currentUser._id}
            </p>
          </div>
        </div>
      )}

      {isDataPopulated ? (
        <div className={adminTheme ? 'subject-chart-content' : undefined}>
          <BirthChartSummaryTable planets={userPlanets} houses={userHouses} aspects={userAspects} adminTheme={adminTheme} />
        </div>
      ) : (
        <Ephemeris adminTheme={adminTheme} />
      )}
    </section>
  );
};

export default UserBirthChartContainer;
