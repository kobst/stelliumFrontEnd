import React from 'react';
import BirthChartSummaryTable from '../birthChart/tables/BirthChartSummaryTable'
import Ephemeris from '../shared/Ephemeris';

const UserBirthChartContainer= ({ selectedUser, isDataPopulated, userPlanets, userHouses, userAspects }) => {
  return (
    <div className="horoscope-container">
      {selectedUser && (
        <div className="user-info" style={{ color: 'white' }}>
          <h2>Selected User: {selectedUser.firstName} {selectedUser.lastName}</h2>
          <h2>Selected UserID: {selectedUser._id}</h2>
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