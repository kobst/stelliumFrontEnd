import React, { useState } from 'react';
import { planets, heading_map } from '../Utilities/constants';

import PromptComponent from './PromptComponent';
import PlanetComponent from './PlanetComponent'
 

const TabbedBigFourMenu = () => {
  const [activeTab, setActiveTab] = useState('personality');

   const headings = Object.keys(heading_map)
 
//    const setEverythingPromptDescription = useStore(state => state.setEverythingPromptDescriptions)
 
const getTabButtonClass = (tabName) => (
    `tab-button ${activeTab === tabName ? 'active' : ''}`
  );    

  return (
    <div className="prompt-container">
      <div className="tab-menu">
        {headings.map(tab => (
          <button
            key={tab}
            className={getTabButtonClass(tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
       {/* Planet Tabs */}
       <div className="planet-menu">
        {planets.map(planet => (
          <button
            key={planet}
            className={getTabButtonClass(planet)}
            onClick={() => setActiveTab(planet)}
          >
            {planet}
          </button>
        ))}
      </div>

    {/* Tab Content */}
    <div className="tab-content">
        {headings.includes(activeTab) && (
          <PromptComponent
            className="prompt-component"
            bigFourType={activeTab}
          />
        )}

        {planets.includes(activeTab) && (
          <PlanetComponent planet={activeTab} />
        )}
      </div>
    </div>
  );
};

export default TabbedBigFourMenu;
