import React from 'react';
import SimpleForm from '../UI/SimpleForm';
import RawBirthDataComponent from '../UI/RawBirthDataComponent';
import TabbedBigFourMenu from '../UI/TabbedBigFourComponent';
import Emphemeris from '../UI/Ephemeris';

function PrototypePage() {
  return (
    <div className="App">
    <header className="App-header">
      StelliumAI
    </header>
    <div className="container">
      <SimpleForm />
      <Emphemeris />
      <RawBirthDataComponent />
      <TabbedBigFourMenu />
    </div>
    </div>
  );
}

export default PrototypePage;