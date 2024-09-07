import React, { useEffect, useState } from 'react';
import { generateWeeklyTransitDescriptions, generateHouseTransitStringComplete } from '../../Utilities/generateUserTranstiDescriptions';
import { postGptPromptsForWeeklyTransits, postGptResponseForFormattedTransits } from '../../Utilities/api';
import { HeadingTransitEnum } from '../../Utilities/constants';
import { checkResponseAgainstEverything } from '../../Utilities/checkResponses';
import WeeklyTransitInterpretationsTable from './WeeklyTransitInterpretations';
const WeeklyTransitDescriptions = ({ userPeriodTransits, userPeriodHouseTransits, userPlanets }) => {
  const [weeklyTransitsComplete, setWeeklyTransitsComplete] = useState(null);
  const [weeklyTransitPrompts, setWeeklyTransitPrompts] = useState({});
  const [weeklyTransitInterpretations, setWeeklyTransitInterpretations] = useState({});

  const [expandedSections, setExpandedSections] = useState({
    transitsWithinNextSevenDays: true,
    transitsWithinCurrentDateRange: true,
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
        // console.log('userPeriodTransits:', userPeriodTransits);
        const weeklyTransits = generateWeeklyTransitDescriptions(userPeriodTransits, userPeriodHouseTransits);
        // console.log('weeklyTransits:', weeklyTransits.transitsWithinNextSevenDays);
        // console.log('also in effectTransits:', weeklyTransits.transitsWithinCurrentDateRange);
        // console.log('userPeriodHouseTransits:', userPeriodHouseTransits);
        const flattenedWeeklyTransits = userPeriodHouseTransits.flatMap(transitData => {
          return generateHouseTransitStringComplete(transitData, userPlanets);
        });
        // console.log('weeklyTransitsHouses:', flattenedWeeklyTransits);
        const weeklyTransitsComplete = {
          transitsWithinNextSevenDays: weeklyTransits.transitsWithinNextSevenDays,
          transitsWithinCurrentDateRange: weeklyTransits.transitsWithinCurrentDateRange,
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
          prompt = await postGptPromptsForWeeklyTransits(heading, weeklyTransitsComplete.transitsWithinNextSevenDays.join(', '));
          isValidPrompt = checkResponseAgainstEverything(prompt, weeklyTransitsComplete.transitsWithinNextSevenDays);
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
              onClick={() => toggleSection('transitsWithinNextSevenDays')}
              style={{ cursor: 'pointer' }}
            >
              Weekly Transits {expandedSections.transitsWithinNextSevenDays ? '▼' : '▶'}
            </h2>
            {expandedSections.transitsWithinNextSevenDays && (
              <table>
                <tbody>
                  {weeklyTransitsComplete.transitsWithinNextSevenDays.map((transit, index) => (
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
              onClick={() => toggleSection('transitsWithinCurrentDateRange')}
              style={{ cursor: 'pointer' }}
            >
              Transits Also in Effect {expandedSections.transitsWithinCurrentDateRange ? '▼' : '▶'}
            </h2>
            {expandedSections.transitsWithinCurrentDateRange && (
              <table>
                <tbody>
                  {weeklyTransitsComplete.transitsWithinCurrentDateRange.map((transit, index) => (
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