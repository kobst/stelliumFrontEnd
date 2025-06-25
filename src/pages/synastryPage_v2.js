import React, { useState } from 'react';
import UsersTable from '../UI/prototype/UsersTable';
import { createCompositeChartProfile, postCreateRelationshipProfile, createRelationshipDirect } from '../Utilities/api';

function SynastryPage() {
  const [userA, setUserA] = useState(null);
  const [userB, setUserB] = useState(null);
  const [synastryAspects, setSynastryAspects] = useState([]);
  const [compositeChart, setCompositeChart] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUserASelect = (user) => {
    console.log("userA", user)
    setUserA(user);
  }

  const handleUserBSelect = (user) => {
    console.log("userB", user)
    setUserB(user);
  } 

  const createRelationshipProfile = async () => {
    setSuccess(false)
    console.log("userA", userA)
    console.log("userB", userB)
    if (userA && userB) {
      console.log("userA", userA.firstName)
      console.log("userB", userB.firstName)
      const response = await postCreateRelationshipProfile(userA, userB)
      console.log("response", response)
      // if response is successful, set the relationship profile to the response
      if (response && response.relationshipProfile._id) {
        setSuccess(true)
      }
    }
  }




  const saveCompositeChartProfile = async () => {
    const response = await createCompositeChartProfile(userA._id, userB._id, userA.firstName, userB.firstName, userA.dateOfBirth, userB.dateOfBirth, synastryAspects, compositeChart)
    console.log("response from createCompositeChartProfile", response)
  }

  return (
    <div className="prototype-page" style={{ marginBottom: '50px' }}>
      <div className="maintxt mont-font">
        <h1 className="logotxt">User A</h1>
      </div>
      <UsersTable onUserSelect={handleUserASelect} />
        <div className="maintxt mont-font">
            <h1 className="logotxt">User B</h1>
        </div>
        <UsersTable onUserSelect={handleUserBSelect} />
        <div className="maintxt mont-font">
            <h1 className="logotxt">Synastry Birth Chart Comparison</h1>
        </div>
        {userA && userB && (
        <>
        <h2 className="logotxt">User A: {userA.firstName} {userA.lastName}</h2>
        <h2 className="logotxt">User B: {userB.firstName} {userB.lastName}</h2>
        <button onClick={createRelationshipProfile}>Create Relationship Profile</button>
        </>
        )}

        {userA && userB && synastryAspects && compositeChart && (
        <button onClick={saveCompositeChartProfile}>Save Composite Chart Profile</button>
        )}
        {success && (
        <p>Relationship profile created successfully</p>
        )}

    </div>
  );
}

export default SynastryPage;