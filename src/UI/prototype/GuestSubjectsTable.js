import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { getUserSubjects } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function GuestSubjectsTable() {
  const [guestSubjects, setGuestSubjects] = useState([]);
  const userId = useStore(state => state.userId);
  const setSelectedUser = useStore(state => state.setSelectedUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setUserElements = useStore(state => state.setUserElements);
  const setUserModalities = useStore(state => state.setUserModalities);
  const setUserQuadrants = useStore(state => state.setUserQuadrants);
  const setUserPatterns = useStore(state => state.setUserPatterns);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGuestSubjects() {
      if (userId) {   
        try {
          const fetchedGuestSubjects = await getUserSubjects(userId);
          setGuestSubjects(fetchedGuestSubjects);
        } catch (error) {
          console.error('Error fetching guest subjects:', error);
        }
      }
    }

    loadGuestSubjects();
  }, [userId]); // This will re-run when component remounts due to key change

  const handleGuestSelect = (guest) => {
    // Set all the guest's data in the store similar to adminPage.js
    setSelectedUser(guest);
    setUserId(guest._id);
    setUserPlanets(guest.birthChart.planets);
    setUserHouses(guest.birthChart.houses);
    setUserAspects(guest.birthChart.aspects);
    setUserElements(guest.birthChart.elements);
    setUserModalities(guest.birthChart.modalities);
    setUserQuadrants(guest.birthChart.quadrants);
    setUserPatterns(guest.birthChart.patterns);

    // Navigate to userDashboard
    navigate('/userDashboard');
  };

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Your Guest Subjects</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ color: 'orange' }}>First Name</th>
              <th style={{ color: 'orange' }}>Last Name</th>
              <th style={{ color: 'orange' }}>Date of Birth</th>
              <th style={{ color: 'orange' }}>Place of Birth</th>
            </tr>
          </thead>
          <tbody>
            {guestSubjects.map((guest) => (
              <tr
                key={guest._id}
                onClick={() => handleGuestSelect(guest)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = 'rgba(128, 0, 128, 0.1)'}
                onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
              >
                <td>{guest.firstName}</td>
                <td>{guest.lastName}</td>
                <td>{guest.dateOfBirth}</td>
                <td>{guest.placeOfBirth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GuestSubjectsTable;