import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setAscendantDegree = useStore(state => state.setAscendantDegree);

  useEffect(() => {
    async function loadUsers() {
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    loadUsers();
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserPlanets(user.birthChart.planets  );
    setUserHouses(user.birthChart.houses);
    setUserAspects(user.birthChart.aspectsComputed);
    const ascendant = user.birthChart.planets.find(planet => planet.name === 'Ascendant');
    if (ascendant) {
      setAscendantDegree(ascendant.full_degree);
    } else {
      console.warn('Ascendant not found in birth chart');
    }
  };

  return (
    <div className="user-table-container">
      <h2>User List</h2>
      <div className="user-table-scroll">
        <table className="user-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className={selectedUser && selectedUser._id === user._id ? 'selected' : ''}
              >
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersTable;