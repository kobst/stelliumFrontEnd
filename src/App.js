import React, { useState } from 'react';
import SimpleForm from './UI/SimpleForm';
import RawBirthDataComponent from './UI/RawBirthDataComponent';
import TabbedBigFourMenu from './UI/TabbedBigFourComponent';
import Emphemeris from './UI/Ephemeris';
import useStore from './Utilities/store'; // Import the store

import './App.css';

function App() {
 

  return (
    <div className="App">
      <header className="App-header">
        StelliumAI
      </header>
      <Emphemeris/>
      <SimpleForm />
      <RawBirthDataComponent />  
      <TabbedBigFourMenu/>
      
    </div>
  );
}

export default App;
