import React, { useState } from 'react';

const WeeklyTransitInterpretationsTable = ({ weeklyTransitInterpretations }) => {
  const [selectedHeading, setSelectedHeading] = useState(null);

  const handleHeadingClick = (heading) => {
    setSelectedHeading(heading === selectedHeading ? null : heading);
  };

  return (
    <div>
      <h2>Weekly Transit Interpretations</h2>
      <table>
        <thead>
          <tr>
            {Object.keys(weeklyTransitInterpretations).map((heading) => (
              <th
                key={heading}
                onClick={() => handleHeadingClick(heading)}
                style={{ cursor: 'pointer' }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={Object.keys(weeklyTransitInterpretations).length}>
              {selectedHeading && (
                <p>{weeklyTransitInterpretations[selectedHeading]}</p>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyTransitInterpretationsTable;