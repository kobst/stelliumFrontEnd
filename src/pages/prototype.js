import React from 'react';
import SimpleForm from '../UI/birthChart/SimpleForm';
import RawBirthDataComponent from '../UI/birthChart/RawBirthDataComponent';
import TabbedBigFourMenu from '../UI/birthChart/TabbedBigFourComponent';
import Emphemeris from '../UI/shared/Ephemeris';

function PrototypePage() {
  return (
    // <div className="App">
    <div>
            <div className="maintxt mont-font">
                <h1 className="logotxt">STELLIUM</h1>
            </div>
    <div className="horoscope-container">
      <SimpleForm />
      <Emphemeris />
      <RawBirthDataComponent />
      <TabbedBigFourMenu />
    </div>
    </div>
  );
}

export default PrototypePage;