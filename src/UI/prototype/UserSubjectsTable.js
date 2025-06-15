import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersTable.css';
import { getUserSubjects } from '../../Utilities/api'
import useStore from '../../Utilities/store';

function UserSubjectsTable({ onSubjectSelect, selectedForRelationship }) {
  const [userSubjects, setUserSubjects] = useState([]);
  const userId = useStore(state => state.userId);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUserSubjects() {
      if (userId && userSubjects.length === 0) {   
        try {
          const fetchedUserSubjects = await getUserSubjects(userId);
          setUserSubjects(fetchedUserSubjects);
        } catch (error) {
          console.error('Error fetching user subjects:', error);
        }
      }
    }

    loadUserSubjects();
  }, [userId]);

  const handleSubjectSelect = (subject) => {
    if (onSubjectSelect) {
      onSubjectSelect(subject);
    }
  };

  return (
    <div className="user-table-container">
      <h2 style={{ color: 'grey' }}>Your Added Subjects</h2>
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
            {userSubjects.map((subject) => (
              <tr
                key={subject._id}
                onClick={() => handleSubjectSelect(subject)}
                className={selectedForRelationship && selectedForRelationship._id === subject._id ? 'selected-row' : ''}
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: selectedForRelationship && selectedForRelationship._id === subject._id ? 'rgba(128, 0, 128, 0.3)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <td>{subject.firstName}</td>
                <td>{subject.lastName}</td>
                <td>{subject.dateOfBirth}</td>
                <td>{subject.placeOfBirth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserSubjectsTable;