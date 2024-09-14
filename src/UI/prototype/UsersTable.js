import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../../Utilities/api'
import useStore from '../../Utilities/store';
import { fetchBirthChartInterpretation, postPeriodHouseTransitsForUserChart, postPeriodAspectsForUserChart } from '../../Utilities/api';
import { HeadingEnum } from '../../Utilities/constants';

function UsersTable() {
  const [users, setUsers] = useState([]);
  const selectedUser = useStore(state => state.selectedUser);
  const setSelectedUser = useStore(state => state.setSelectedUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setUserPeriodTransits = useStore(state => state.setUserPeriodTransits);
  const setUserPeriodHouseTransits = useStore(state => state.setUserPeriodHouseTransits);
  const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
  const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)

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


  const fetchUserBirthChartInterpretation = async (userId) => {
    try {
      const fetchedInterpretation = await fetchBirthChartInterpretation(userId);
      console.log('fetchedInterpretation')
      console.log(fetchedInterpretation)
      const validHeadings = Object.values(HeadingEnum);
      
      // const birthChart = fetchedInterpretation.birthChartInterpretation;
      Object.entries(fetchedInterpretation).forEach(([heading, data]) => {
        if (validHeadings.includes(heading) && typeof data === 'object') {
          console.log('Heading:', heading);
          console.log('Prompt Description:', data.promptDescription);
          console.log('Interpretation:', data.interpretation);
          
          // Set the interpretation
          setHeadingInterpretationMap(heading, data.interpretation);
          
          // Set the prompt description
          setSubHeadingsPromptDescriptionsMap(heading, data.promptDescription);
        } else {
          console.warn(`Invalid or unexpected data for heading: ${heading}`);
        }
      });

    } catch (error) {
      console.error('Error fetching birth chart interpretation:', error);
    }
  };

  const fetchUserPeriodTransits = async (user, startDate, endDate) => {
    
    const birthChartPlanets = user.birthChart.planets
    const birthChartHouses = user.birthChart.houses
    const periodTransitsTest = await postPeriodAspectsForUserChart(startDate, endDate, birthChartPlanets)
    const periodHouseTransitsTest = await postPeriodHouseTransitsForUserChart(startDate, endDate, birthChartHouses)
    // remove transits with Moon as transitingPlanet
    const filteredTransits = periodTransitsTest.filter(transit => transit.transitingPlanet !== 'Moon');
    console.log(" period transits")
    console.log(filteredTransits)
    console.log(" period house transits")
    console.log(periodHouseTransitsTest)
    setUserPeriodTransits(filteredTransits)
    setUserPeriodHouseTransits(periodHouseTransitsTest)

  }

  const fetchUserPeriodHouseTransits = async (user, startDate, endDate) => {
    const birthChartHouses = user.birthChart.houses
    const periodHouseTransits = await postPeriodHouseTransitsForUserChart(startDate, endDate, birthChartHouses)
    console.log(" period house transits")
    console.log(periodHouseTransits)

  }


  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setUserId(user._id);
    fetchUserBirthChartInterpretation(user._id);
    setUserPlanets(user.birthChart.planets  );
    setUserHouses(user.birthChart.houses);
    setUserAspects(user.birthChart.aspectsComputed);


    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    fetchUserPeriodHouseTransits(user, startDate, endDate)
    fetchUserPeriodTransits(user, startDate, endDate)


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
                className={selectedUser && selectedUser._id === user._id ? 'selected' : ''}
                style={{ 
                  color: selectedUser && selectedUser._id === user._id ? 'purple' : 'white'
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