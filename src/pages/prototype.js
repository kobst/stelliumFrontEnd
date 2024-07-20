import React from 'react';
import SimpleForm from '../UI/birthChart/SimpleForm';
import RawBirthDataComponent from '../UI/birthChart/RawBirthDataComponent';
import TabbedBigFourMenu from '../UI/birthChart/TabbedBigFourComponent';
import Emphemeris from '../UI/shared/Ephemeris';
import useStore from '../Utilities/store';

function PrototypePage() {



  const rawBirthData = useStore(state => state.rawBirthData)

  const ascendantDegree = useStore(state => state.ascendantDegree)


  return (
    <div>
      <div className="maintxt mont-font">
        <h1 className="logotxt">STELLIUM</h1>
      </div>
      <div className="horoscope-container">
        <SimpleForm />
        {rawBirthData.planets && rawBirthData.houses && ascendantDegree ? (
          <Emphemeris planets={rawBirthData.planets} houses={rawBirthData.houses} transits={[]} ascendantDegree={ascendantDegree} />
        ) : (
          <Emphemeris />
        )}
        <RawBirthDataComponent />
        <TabbedBigFourMenu />
      </div>
    </div>
  );
}

export default PrototypePage;