import React, { useState } from 'react';
import SimpleForm from './UI/SimpleForm';
import RawBirthDataComponent from './UI/RawBirthDataComponent';
import TabbedBigFourMenu from './UI/TabbedBigFourComponent';
import useStore from './Utilities/store'; // Import the store

import './App.css';
import PromptComponent from './UI/PromptComponent';

function App() {
 

  return (
    <div className="App">
      <header className="App-header">
        StelliumAI
      </header>
      <SimpleForm />
      <RawBirthDataComponent />  
      <TabbedBigFourMenu/>


      
      
    </div>
  );
}

export default App;
