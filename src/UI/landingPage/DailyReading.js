import React, { useEffect, useState } from 'react';
import { orbDegrees, aspects, moonPhases } from '../../Utilities/constants';
import { formatTransits, formatTransitData } from '../../Utilities/helpers';
import { postGptResponse } from '../../Utilities/api';

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
    const [dailyTransitDescriptions, setDailyTransitDescriptions] = useState('')

    const [dailyTransitInterpretation, setDailyTransitInterpretation] = useState('');

    useEffect(() => {
      const descriptions = transitAspectObjects.map(aspect => 
          formatTransitData(aspect, transits, risingSign)
      );
      const combinedDescriptions = descriptions.join('\n');
      console.log(combinedDescriptions)
      setDailyTransitDescriptions(combinedDescriptions);
  }, [transitAspectObjects, transits, risingSign]);

    useEffect(() => {
      if (dailyTransitDescriptions && dailyTransitDescriptions !== '') {
          generateResponse(dailyTransitDescriptions);
      }
  }, [dailyTransitDescriptions]);

    async function generateResponse(descriptions) {
      console.log(descriptions)
      const prompt = "Above are today's transits. Please provide me a short descriptoin of the most relevant 2 or 3 transits that are occuring today"
       const modifiedInput = `${descriptions}\n: ${prompt}`;
        const response = await postGptResponse(modifiedInput);
        setDailyTransitInterpretation(response)
    }

    // useEffect(() => {

    // }, [dailyTransitDescriptions])

    return (
        <div style={{ color: 'white' }}>
          {/* <div style={{ marginBottom: '20px' }}>
            <h4>Today's Transit Descriptions</h4>
            {transits.map((transit, index) => (
              <div key={index}>{formatTransits(transit, risingSign)}</div>
            ))}
          </div> */}
          <div style={{ marginBottom: '20px' }}>
            <h4>Today's Aspects</h4>
            {transitAspectObjects.map((aspect, index) => (
              <div key={index}>{formatTransitData(aspect, transits, risingSign)}</div>
            ))}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Today's Reading</h4>
            {dailyTransitInterpretation && <p>{dailyTransitInterpretation}</p>}          </div>
        </div>
      );


};

export default DailyReading;

