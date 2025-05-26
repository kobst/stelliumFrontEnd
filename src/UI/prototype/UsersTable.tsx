import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { fetchUsers } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function UsersTable({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const selectedUser = useStore(state => state.selectedUser);
  const navigate = useNavigate();


  useEffect(() => {
    async function loadUsers() {
        if (users.length === 0) {   
          try {
            const fetchedUsers = await fetchUsers();
            setUsers(fetchedUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    }

    // async function getTodaysData() {
    //   if (dailyTransits.length === 0) {
    //     const currentDateISO = new Date().toISOString();
    //     const cleanedTransits = await handleFetchDailyTransits(currentDateISO);
    //     setDailyTransits(cleanedTransits)
    //   }
    // }

    // async function getRetrogradeTransits() {
    //     if (retrogradeTransits.length === 0) {
    //     // set date range to 30 days from today
    //     const startDate = new Date().toISOString();
    //     const endDate = new Date(startDate);
    //     endDate.setDate(endDate.getDate() + 30);
    //     const retrogradeTransits = await handleFetchRetrogradeTransits(startDate, endDate);
    //     console.log("retrogradeTransits")
    //     console.log(retrogradeTransits)
    //     setRetrogradeTransits(retrogradeTransits)
    //   }
    // }

    loadUsers();
    // getTodaysData()
    // getRetrogradeTransits()
  }, []);


  const handleUserSelect = (user) => {
    onUserSelect(user);
  };



  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>User List</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ color: 'orange' }}>First Name</th>
              <th style={{ color: 'orange' }}>Last Name</th>
              <th style={{ color: 'orange' }}>Email</th>
              <th style={{ color: 'orange' }}>Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className={selectedUser && selectedUser._id === user._id ? 'selected-row' : ''}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: selectedUser && selectedUser._id === user._id ? 'rgba(128, 0, 128, 0.3)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.dateOfBirth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;