import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { fetchUsers, postPeriodTransit } from '../../Utilities/api'
import useStore from '../../Utilities/store';
import { 
  fetchBirthChartInterpretation, 
  postPeriodHouseTransitsForUserChart, 
  postPeriodAspectsForUserChart, 
  postPeriodTransits
 } from '../../Utilities/api';
import { 
  formatTransitDataForUser, 
  handleFetchDailyTransits, 
  handleFetchRetrogradeTransits } from '../../Utilities/generateUserTranstiDescriptions';
import { HeadingEnum } from '../../Utilities/constants';


function UsersTable({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const selectedUser = useStore(state => state.selectedUser);
  const setSelectedUser = useStore(state => state.setSelectedUser);
  const setUserId = useStore(state => state.setUserId);
  const setUserPlanets = useStore(state => state.setUserPlanets);
  const setUserHouses = useStore(state => state.setUserHouses);
  const setUserAspects = useStore(state => state.setUserAspects);
  const setDailyTransits = useStore(state => state.setDailyTransits);
  const dailyTransits = useStore(state => state.dailyTransits);
  const setRetrogradeTransits = useStore(state => state.setRetrogradeTransits);
  const retrogradeTransits = useStore(state => state.retrogradeTransits);
  const setUserPeriodTransits = useStore(state => state.setUserPeriodTransits);
  const setUserPeriodHouseTransits = useStore(state => state.setUserPeriodHouseTransits);
  const setHeadingInterpretationMap = useStore(state => state.setHeadingInterpretationMap)
  const setSubHeadingsPromptDescriptionsMap = useStore(state => state.setSubHeadingsPromptDescriptionsMap)

  const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
  const subHeadingsPromptDescriptionsMap = useStore(state => state.subHeadingsPromptDescriptionsMap)
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

// // maybe move this to the prototype page
//   const handleUserSelect = async (user) => {
//     setSelectedUser(user);
//     setUserId(user._id);
//     setUserPlanets(user.birthChart.planets  );
//     setUserHouses(user.birthChart.houses);
//     setUserAspects(user.birthChart.aspectsComputed);
//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setDate(endDate.getDate() + 30);
//     fetchUserBirthChartInterpretation(user._id);
//     fetchUserPeriodTransits(user, startDate, endDate)

//     navigate(`/userDashboard`);

//   };

//   const fetchUserBirthChartInterpretation = async (userId) => {
//     try {
//       const fetchedInterpretation = await fetchBirthChartInterpretation(userId);
//       console.log('fetchedInterpretation');
//       console.log(fetchedInterpretation);
  
//       const validHeadings = Object.values(HeadingEnum);
  
//       // Clear previous interpretation data for all headings
//       validHeadings.forEach(heading => {
//         setHeadingInterpretationMap(heading, '');
//         setSubHeadingsPromptDescriptionsMap(heading, '');
//       });
  
//       Object.entries(fetchedInterpretation).forEach(([heading, data]) => {
//         if (validHeadings.includes(heading) && typeof data === 'object') {
//           setHeadingInterpretationMap(heading, data.interpretation || '');
//           setSubHeadingsPromptDescriptionsMap(heading, data.promptDescription || '');
//         } else {
//           console.warn(`Invalid or unexpected data for heading: ${heading}`);
//         }
//       });
//     } catch (error) {
//       console.error('Error fetching birth chart interpretation:', error);
//     }
//   };

//   const fetchUserPeriodTransits = async (user, startDate, endDate) => {
//     const birthChartPlanets = user.birthChart.planets
//     const birthChartHouses = user.birthChart.houses
//     const periodTransitsTest = await postPeriodAspectsForUserChart(startDate, endDate, birthChartPlanets)
//     const periodHouseTransitsTest = await postPeriodHouseTransitsForUserChart(startDate, endDate, birthChartHouses)
//     // remove transits with Moon as transitingPlanet
//     const filteredTransits = periodTransitsTest.filter(transit => transit.transitingPlanet !== 'Moon');
//     console.log(" period transits")
//     console.log(filteredTransits)
//     console.log(" period house transits")
//     console.log(periodHouseTransitsTest)
//     // setUserPeriodHouseTransits(periodHouseTransitsTest)
//     const formattedTransits = await formatUserPeriodTransits(filteredTransits, birthChartPlanets)
//     setUserPeriodTransits(formattedTransits)
//     setUserPeriodHouseTransits(periodHouseTransitsTest)

//   }

//   const formatUserPeriodTransits = async (userPeriodTransits, userPlanets) => {
//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setDate(endDate.getDate() + 30);
//     const periodTransits = await postPeriodTransits(startDate, endDate);
//     const formattedTransits = userPeriodTransits.map(transit => {
//       return formatTransitDataForUser(transit, periodTransits, userPlanets)
//     })
//     console.log("formattedTransits")
//     console.log(formattedTransits)
//     return formattedTransits
//     // setUserPeriodTransits(formattedTransits)
//     // setUserPeriodTransits(formattedTransits)
//   }






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