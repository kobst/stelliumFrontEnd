import React, { useState } from 'react';
import { planets, heading_map, dominanceTopics, transitTopics } from '../Utilities/constants';

import BigFourComponent from './BigFourComponent';
import PlanetComponent from './PlanetComponent'
import DominanceComponent from './DominanceComponent';
import ProgressedTransitComponent from './ProgressedTransitComponent';
 

const TabbedBigFourMenu = () => {
  const [activeTab, setActiveTab] = useState('personality');

   const headings = Object.keys(heading_map)
 
//    const setEverythingPromptDescription = useStore(state => state.setEverythingPromptDescriptions)
 
const getTabButtonClass = (tabName) => (
    `tab-button ${activeTab === tabName ? 'active' : ''}`
  );    

  return (
    <div className="prompt-container">

        <div className="planet-menu">
        {dominanceTopics.map(topic => (
            <button
                key={topic}
                className={getTabButtonClass(topic)}
                onClick={() => setActiveTab(topic)}
            >
                {topic}
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
      <div className="tab-menu">
        {transitTopics.map(tab => (
          <button
            key={tab}
            className={getTabButtonClass(tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>


    {/* Tab Content */}
    <div className="tab-content">
        {headings.includes(activeTab) && (
          <BigFourComponent
            className="prompt-component"
            bigFourType={activeTab}
          />
        )}
        {planets.includes(activeTab) && (
          <PlanetComponent planet={activeTab} />
        )}
        {dominanceTopics.includes(activeTab) && (
          <DominanceComponent dominanceTopic={activeTab} />
        )}
        {transitTopics.includes(activeTab) && (
          <ProgressedTransitComponent transitType={activeTab}/>
        )}
      </div>
    </div>
  );
};

export default TabbedBigFourMenu;
