import React, { useEffect, useState } from 'react';
import { orbDegrees, aspects, moonPhases } from '../../Utilities/constants';
import { formatTransits, formatTransitData, formatTransitDataForTable, findMostRelevantAspects } from '../../Utilities/generateUserTranstiDescriptions';
import { postGptResponse } from '../../Utilities/api';
import TodaysAspectsTable from './TodaysAspectsTable';
// const signOrder = [
//     "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
//     "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
//   ];
  
//   const getHouseNumber = (risingSign, planetSign) => {
//     const risingIndex = signOrder.indexOf(risingSign);
//     const planetIndex = signOrder.indexOf(planetSign);
//     if (risingIndex === -1 || planetIndex === -1) return -1; // Error handling if sign not found
//     return ((planetIndex - risingIndex + 12) % 12) + 1;
//   };
  

// const calculateAspect = (degree1, degree2, isRetro, transitName) => {
//     let diff = Math.abs(degree1 - degree2);
//     diff = diff > 180 ? 360 - diff : diff;
//     const maxOrb = orbDegrees[transitName];
  
//     for (let aspect of aspects) {
//       let orbDiff = Math.abs(diff - aspect.orb);
//       if (orbDiff <= maxOrb) {
//         return { aspectType: aspect.name, orb: orbDiff.toFixed(1) };
//       }
//     }
//     return { aspectType: '', orb: 0 };
//   };

const DailyReading = ({ transitAspectObjects, transits, risingSign = null }) => {
  const [dailyTransitDescriptionsGeneral, setDailyTransitDescriptionsGeneral] = useState('')

    const [dailyTransitDescriptionsForSign, setDailyTransitDescriptionsForSign] = useState('')
    const [dailyTransitDescriptionsForTable, setDailyTransitDescriptionsForTable] = useState([])
    const [dailyTransitInterpretation, setDailyTransitInterpretation] = useState('');
    const [mostRelevantAspect, setMostRelevantAspect] = useState(null)

    useEffect(() => {
      const descriptions = transitAspectObjects.map(aspect => 
          formatTransitData(aspect, transits, risingSign)
      );
      const descriptionsGeneral = transitAspectObjects.map(aspect => 
        formatTransitData(aspect, transits, null)
      );
      const descriptionsForTable = transitAspectObjects.map(aspect => 
        formatTransitDataForTable(aspect, transits)
      );
      const combinedDescriptions = descriptions.join('\n');
      const combinedDescriptionsGeneral = descriptionsGeneral.join('\n');
      console.log(combinedDescriptions)
      setDailyTransitDescriptionsForSign(combinedDescriptions);
      setDailyTransitDescriptionsGeneral(combinedDescriptionsGeneral);
      setDailyTransitDescriptionsForTable(descriptionsForTable);
  }, [transitAspectObjects, transits, risingSign]);

    useEffect(() => {
      if (mostRelevantAspect) {
          generateResponse(mostRelevantAspect);
      }
  }, [mostRelevantAspect]);


  useEffect(() => {
    if (dailyTransitDescriptionsForTable.length > 0) {
      const result = findMostRelevantAspects(dailyTransitDescriptionsForTable, transits);
      console.log(result)
      const relevantAspect = result.mostRelevantAspect;
      // console.log('Most relevant aspect:', relevantAspect);
      // setMostRelevantAspect(relevantAspect);

      if (relevantAspect) {
        const formattedRelevantAspect = formatTransitData(relevantAspect, transits, null);
        console.log("Formatted most relevant aspect:", formattedRelevantAspect);
        setMostRelevantAspect(formattedRelevantAspect)
      }
    }
  }, [dailyTransitDescriptionsForTable, transits]);


    async function generateResponse(descriptions) {
      console.log(descriptions)
      const prompt = "Above are today's transits. Please provide me a short descriptoin of this transit that is occuring today. Please make it applicable generally to all signs and people. "
       const modifiedInput = `${descriptions}\n: ${prompt}`;
        const response = await postGptResponse(modifiedInput);
        setDailyTransitInterpretation(response)
    }

    // useEffect(() => {

    // }, [dailyTransitDescriptions])

    return (
        <div style={{ color: 'white' }}>
            <div style={{ marginBottom: '20px' }}>
            {/* <h4>Today's Aspects</h4> */}
            {/* {transitAspectObjects.map((aspect, index) => (
              <div key={index}>{formatTransitData(aspect, transits, null)}</div>
            ))} */}
           {mostRelevantAspect && (
            <div>
              <h4>Most Relevant Aspect</h4>
              <p>{mostRelevantAspect}</p>
            </div>
            )}
            {/* {dailyTransitDescriptionsForTable.length > 0 && (
              <TodaysAspectsTable aspectsArray={dailyTransitDescriptionsForTable} />
            )} */}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Today's Reading</h4>
            {dailyTransitInterpretation && <p>{dailyTransitInterpretation}</p>}
            <button onClick={() => generateResponse(mostRelevantAspect)}>Generate Response</button>          
          </div>
        </div>
      );


};

export default DailyReading;

