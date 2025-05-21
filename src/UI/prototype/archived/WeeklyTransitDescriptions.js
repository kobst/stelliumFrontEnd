import React, { useEffect, useState } from 'react';
import { 
    generateWeeklyTransitDescriptions, 
    generateWeeklyTransitDescriptionsWithRetrograde,
    generateHouseTransitStringCompleteWithRetrograde,
    generateHouseTransitStringComplete } from '../../../Utilities/generateUserTranstiDescriptions';
import { postGptPromptsForWeeklyTransits, postGptResponseForFormattedTransits } from '../../../Utilities/api';
import { HeadingTransitEnum } from '../../../Utilities/constants';
import { checkResponseAgainstEverything } from '../../../Utilities/checkResponses';
import WeeklyTransitInterpretationsTable from './WeeklyTransitInterpretations';

const WeeklyTransitDescriptions = ({ userPeriodTransits, userPeriodHouseTransits, userPlanets, retrogradeTransits }) => {
  const [weeklyTransitsComplete, setWeeklyTransitsComplete] = useState(null);
  const [weeklyTransitPrompts, setWeeklyTransitPrompts] = useState({});
  const [weeklyTransitInterpretations, setWeeklyTransitInterpretations] = useState({});

  const [expandedSections, setExpandedSections] = useState({
    transitsExactWithinDateRange: true,
    transitsInEffectWithinDateRange: true,
    weeklyHouseTransits: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  useEffect(() => {
    const generateWeeklyTransitsAsync = async () => {
      if (userPeriodTransits.length > 0 && userPeriodHouseTransits.length > 0) {

        console.log('userPeriodTransits:', userPeriodTransits);
        const weeklyTransits = generateWeeklyTransitDescriptionsWithRetrograde(userPeriodTransits, userPeriodHouseTransits, 30, retrogradeTransits);
        // console.log('weeklyTransits:', weeklyTransits.transitsExactWithinDateRange);
        // console.log('also in effectTransits:', weeklyTransits.transitsInEffectWithinDateRange);
        // console.log('userPeriodHouseTransits:', userPeriodHouseTransits);
        const flattenedWeeklyTransits = userPeriodHouseTransits.flatMap(transitData => {
          return generateHouseTransitStringCompleteWithRetrograde(transitData, retrogradeTransits);
        });
        // console.log('weeklyTransitsHouses:', flattenedWeeklyTransits);
        const weeklyTransitsComplete = {
          transitsExactWithinDateRange: weeklyTransits.transitsExactWithinDateRange,
          transitsInEffectWithinDateRange: weeklyTransits.transitsInEffectWithinDateRange,
          weeklyHouseTransits: flattenedWeeklyTransits
        };

        setWeeklyTransitsComplete(weeklyTransitsComplete);
        fetchWeeklyTransitInterpretations(weeklyTransitsComplete);
      }
    };

    generateWeeklyTransitsAsync();
  }, [userPeriodTransits, userPeriodHouseTransits, userPlanets]);


  const fetchWeeklyTransitInterpretations = async (weeklyTransitsComplete) => {
    try {
      const interpretationPromises = Object.values(HeadingTransitEnum).map(async (heading) => {
        let prompt = '';
        let isValidPrompt = false;

        while (!isValidPrompt) {
          prompt = await postGptPromptsForWeeklyTransits(heading, weeklyTransitsComplete.transitsExactWithinDateRange.join(', '));
          isValidPrompt = checkResponseAgainstEverything(prompt, weeklyTransitsComplete.transitsExactWithinDateRange);
        }

        const interpretation = await postGptResponseForFormattedTransits(heading, prompt);
        return { heading, interpretation };
      });

      const interpretations = await Promise.all(interpretationPromises);
      const interpretationMap = interpretations.reduce((map, { heading, interpretation }) => {
        map[heading] = interpretation;
        return map;
      }, {});

      console.log('interpretationMap:', interpretationMap);

      setWeeklyTransitInterpretations(interpretationMap);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      {weeklyTransitsComplete && (
        <div>
          <div>
            <h2
              onClick={() => toggleSection('transitsExactWithinDateRange')}
              style={{ cursor: 'pointer' }}
            >
              Weekly Transits {expandedSections.transitsExactWithinDateRange ? '▼' : '▶'}
            </h2>
            {expandedSections.transitsExactWithinDateRange && (
              <table>
                <tbody>
                  {weeklyTransitsComplete.transitsExactWithinDateRange.map((transit, index) => (
                    <tr key={index}>
                      <td>{transit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h2
              onClick={() => toggleSection('transitsInEffectWithinDateRange')}
              style={{ cursor: 'pointer' }}
            >
              Transits Also in Effect {expandedSections.transitsInEffectWithinDateRange ? '▼' : '▶'}
            </h2>
            {expandedSections.transitsInEffectWithinDateRange && (
              <table>
                <tbody>
                  {weeklyTransitsComplete.transitsInEffectWithinDateRange.map((transit, index) => (
                    <tr key={index}>
                      <td>{transit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h2
              onClick={() => toggleSection('weeklyHouseTransits')}
              style={{ cursor: 'pointer' }}
            >
              Weekly House Transits {expandedSections.weeklyHouseTransits ? '▼' : '▶'}
            </h2>
            {expandedSections.weeklyHouseTransits && (
              <table>
                <tbody>
                  {weeklyTransitsComplete.weeklyHouseTransits.map((transit, index) => (
                    <tr key={index}>
                      <td>{transit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {weeklyTransitInterpretations && (
        <WeeklyTransitInterpretationsTable weeklyTransitInterpretations={weeklyTransitInterpretations} />
      )}
    </div>
  );
};

export default WeeklyTransitDescriptions;