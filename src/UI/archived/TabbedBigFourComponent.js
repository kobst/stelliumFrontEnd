import React, { useState } from 'react';
import { heading_map, transitTopics, dominance_headings, planet_headings } from '../../Utilities/constants';

import BigFourComponent from './BigFourComponent';
import PlanetComponent from './PlanetComponent'
import DominanceComponent from './DominanceComponent';
import ProgressedTransitComponent from './ProgressedTransitComponent';
 

const TabbedBigFourMenu = () => {
  const [activeTab, setActiveTab] = useState('personality');

   const headings = Object.keys(heading_map)
 
const getTabButtonClass = (tabName) => (
    `tab-button ${activeTab === tabName ? 'active' : ''}`
  );

  return (
    <div>

        <div className="planet-menu">
        {dominance_headings.map(topic => (
            <button
                key={topic}
                className={`${getTabButtonClass(topic)} button-white-text`}
                onClick={() => setActiveTab(topic)}
            >
                {topic}
            </button>
            ))}
        </div>

        {/* Planet Tabs */}
       <div className="planet-menu">
        {planet_headings.map(planet => (
          <button
            key={planet}
            className={`${getTabButtonClass(planet)} button-white-text`}
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
            className={`${getTabButtonClass(tab)} button-white-text`}
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
            className={`${getTabButtonClass(tab)} button-white-text`}
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
        {planet_headings.includes(activeTab) && (
          <PlanetComponent planet={activeTab} />
        )}
        {dominance_headings.includes(activeTab) && (
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
