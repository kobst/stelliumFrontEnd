import React, { useState, useCallback } from 'react';
// import { useStore } from '../../Utilities/store';
import useStore from '../../Utilities/store';
import TransitsTable from './TransitsTable';
import HouseTransitsTable from './HouseTransitsTable';
import { generateHouseTransitStringComplete, generateTransitString } from '../../Utilities/generateUserTranstiDescriptions';
import { postGptResponseForFormattedTransits } from '../../Utilities/api';


const CombinedTransitsTables = ({ userPeriodTransits, userPeriodHouseTransits, userHouses }) => {
    const promptDescriptionsMap = useStore(state => state.promptDescriptionsMap)
    const [selectedTransits, setSelectedTransits] = useState([]);
    const [selectedHouseTransits, setSelectedHouseTransits] = useState([]);
    const [transitResponse, setTransitResponse] = useState('');

  const handleSaveSelected = async () => {
    const formattedTransits = selectedTransits.map(transit => generateTransitString(transit, userPeriodTransits));
    const formattedHouseTransits = selectedHouseTransits.map(transit => generateHouseTransitStringComplete(transit, userPeriodHouseTransits));
    const combinedTransits = [...formattedTransits, ...formattedHouseTransits];
    console.log('Combined Transits:', combinedTransits);
    try {
        const response = await postGptResponseForFormattedTransits(promptDescriptionsMap['everything'], formattedTransits)
        console.log(response)
        setTransitResponse(response)
      } catch (error) {
        console.log(error.message);
    }
  };

  const handleSelectTransit = useCallback((selectedTransits) => {
    setSelectedTransits(selectedTransits);
  }, []);

  const handleSelectHouseTransit = useCallback((selectedHouseTransits) => {
    setSelectedHouseTransits(selectedHouseTransits);
  }, []);


  return (
    <div>
        <h2>Combined Transits XXXX</h2>
      <TransitsTable
        transits={userPeriodTransits}
        onSelectTransit={handleSelectTransit}
      />
      <HouseTransitsTable
        houseTransits={userPeriodHouseTransits}
        userHouses={userHouses}
        onSelectHouseTransit={handleSelectHouseTransit}
      />
      <button onClick={handleSaveSelected} disabled={selectedTransits.length === 0 && selectedHouseTransits.length === 0}>
        Save Selected Aspects
      </button>
      <div>
          <h2>Transit Response</h2>
          {transitResponse != '' && (
            <p>{transitResponse}</p>
          )}
      </div>
    </div>
  );
};

export default CombinedTransitsTables;