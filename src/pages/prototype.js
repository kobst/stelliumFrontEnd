import React from 'react';
import SimpleForm from '../UI/SimpleForm';
import RawBirthDataComponent from '../UI/RawBirthDataComponent';
import TabbedBigFourMenu from '../UI/TabbedBigFourComponent';
import Emphemeris from '../UI/Ephemeris';

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