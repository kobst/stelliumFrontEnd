import React, { useEffect, useState } from 'react';
import UsersTable from '../UI/prototype/UsersTable';
import useStore from '../Utilities/store';
import SynastryAspectsTable from '../UI/birthChart/tables/SynastryAspectsTable'
import SynastryAspectsDescriptionsTable from '../UI/birthChart/tables/SynastryAspectsDescriptionsTable'
import SynastryBirthChartComparison from '../UI/birthChart/tables/SynastryBirthChartComparison'
import SynastryHousePositionsTable from '../UI/birthChart/tables/SynastryHousePositionsTable'
import { postSynastryAspects, postCompositeChart, createCompositeChartProfile, postCreateRelationshipProfile } from '../Utilities/api';
import CompositesTable from '../UI/prototype/CompositesTable'

function SynastryPage() {
  const [userA, setUserA] = useState(null);
  const [userB, setUserB] = useState(null);
  const [synastryAspects, setSynastryAspects] = useState([]);
  const [compositeChart, setCompositeChart] = useState(null);
  const [compositeChartDescription, setCompositeChartDescription] = useState([])
  const [compositeChartPlanetDescriptions, setCompositeChartPlanetDescriptions] = useState([])

  const handleUserASelect = (user) => {
    console.log("userA", user)
    setUserA(user);
  }

  const handleUserBSelect = (user) => {
    console.log("userB", user)
    setUserB(user);
  } 

  const createRelationshipProfile = async () => {
    console.log("userA", userA)
    console.log("userB", userB)
    if (userA && userB) {
      console.log("userA", userA.firstName)
      console.log("userB", userB.firstName)
      const response = await postCreateRelationshipProfile(userA, userB)
      console.log("response", response)
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
        {/* {synastryAspects.length > 0 && compositeChart &&
        <SynastryBirthChartComparison 
            birthChartA={userA.birthChart} 
            birthChartB={userB.birthChart} 
            compositeChart={compositeChart} 
            userAName={userA.firstName} 
            userBName={userB.firstName} 
            compositeChartDescription={compositeChartDescription}
            compositeChartPlanetDescriptions={compositeChartPlanetDescriptions}
        />
        } */}

        {userA && userB && synastryAspects && compositeChart && (
        <button onClick={saveCompositeChartProfile}>Save Composite Chart Profile</button>
        )}
        {/* {userA && userB && (
        <>
        <SynastryHousePositionsTable birthChartA={userA.birthChart} birthChartB={userB.birthChart} userAName={userA.firstName} userBName={userB.firstName} />
        </>
        )} */}

        {/* {synastryAspects.length > 0 && compositeChart && compositeChartDescription &&
        <SynastryAspectsDescriptionsTable 
            synastryAspects={synastryAspects} 
            birthchartA={userA.birthChart} 
            birthchartB={userB.birthChart} 
            userAName={userA.firstName} 
            userBName={userB.firstName} 
        />
        } */}

    </div>
  );
}

export default SynastryPage;