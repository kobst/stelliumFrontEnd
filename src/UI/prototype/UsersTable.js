import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { fetchUsers, deleteSubject } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function UsersTable({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const [deletingUser, setDeletingUser] = useState(null);
  const selectedUser = useStore(state => state.selectedUser);
  const currentUserId = useStore(state => state.userId);
  const navigate = useNavigate();


  useEffect(() => {
    async function loadUsers() {
        if (users.length === 0) {   
          try {
            const fetchedUsers = await fetchUsers();
            // Filter to only show account owners (accountSelf), not guests
            const accountOwners = fetchedUsers.filter(user => user.kind === 'accountSelf');
            setUsers(accountOwners);
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

  const handleDeleteUser = async (user) => {
    // Prevent users from deleting themselves
    if (user._id === currentUserId) {
      alert('You cannot delete your own account while logged in.');
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}'s account?\n\n` +
      `This will permanently remove:\n` +
      `• The user account and all data\n` +
      `• All associated analyses\n` +
      `• Chat history\n` +
      `• Horoscopes\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingUser(user._id);
    try {
      const result = await deleteSubject(user._id);
      
      // Remove deleted user from local state
      setUsers(prevUsers => 
        prevUsers.filter(u => u._id !== user._id)
      );

      // Show success message
      const deletedCount = result.deletionResults;
      const details = [];
      if (deletedCount.horoscopes > 0) details.push(`${deletedCount.horoscopes} horoscopes`);
      if (deletedCount.chatThreads > 0) details.push(`${deletedCount.chatThreads} conversations`);
      if (deletedCount.analysis > 0) details.push('analysis data');
      
      const message = details.length > 0 
        ? `User account deleted successfully. Also removed: ${details.join(', ')}.`
        : 'User account deleted successfully.';
      
      alert(message);
    } catch (error) {
      let errorMessage = 'Failed to delete user account.';
      
      if (error.message.includes('relationship')) {
        const relationshipCount = error.message.match(/\d+/)?.[0] || 'some';
        errorMessage = `Cannot delete this user because they're part of ${relationshipCount} relationship(s). Please delete those relationships first.`;
      } else if (error.message.includes('not found')) {
        errorMessage = 'This user may have already been deleted.';
      }
      
      alert(errorMessage);
    } finally {
      setDeletingUser(null);
    }
  };



  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Account Owners</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ color: 'orange' }}>First Name</th>
              <th style={{ color: 'orange' }}>Last Name</th>
              <th style={{ color: 'orange' }}>Email</th>
              <th style={{ color: 'orange' }}>Date of Birth</th>
              <th style={{ color: 'orange' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className={selectedUser && selectedUser._id === user._id ? 'selected-row' : ''}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: selectedUser && selectedUser._id === user._id ? 'rgba(128, 0, 128, 0.3)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <td onClick={() => handleUserSelect(user)}>{user.firstName}</td>
                <td onClick={() => handleUserSelect(user)}>{user.lastName}</td>
                <td onClick={() => handleUserSelect(user)}>{user.email}</td>
                <td onClick={() => handleUserSelect(user)}>{user.dateOfBirth}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserSelect(user);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: selectedUser && selectedUser._id === user._id ? '#28a745' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {selectedUser && selectedUser._id === user._id ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user);
                      }}
                      disabled={deletingUser === user._id || user._id === currentUserId}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: user._id === currentUserId ? '#6c757d' : 
                                        deletingUser === user._id ? '#6c757d' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: user._id === currentUserId ? 'not-allowed' : 
                               deletingUser === user._id ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        opacity: (deletingUser === user._id || user._id === currentUserId) ? 0.6 : 1
                      }}
                      title={user._id === currentUserId ? 'Cannot delete your own account' : ''}
                    >
                      {user._id === currentUserId ? 'Self' : 
                       deletingUser === user._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;