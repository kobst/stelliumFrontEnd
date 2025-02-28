import React from 'react';

const PlanetHousePositionsTable = ({ birthChartA, birthChartB, userAName, userBName }) => {
  // Function to find the house a planet falls into based on its degree

  console.log(birthChartA)
  console.log(birthChartB)
  const findHouse = (planetDegree, houses) => {
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[(i + 1) % houses.length];
      
      if (planetDegree >= currentHouse.degree && planetDegree < nextHouse.degree) {
        return currentHouse.house;
      }
    }
    return null;
  };

  return (
    <div className="planet-house-positions-container">
      <table className="planet-house-positions-table">
        <thead>
          <tr>
            <th>{userAName}'s Planet</th>
            <th>House in {userBName}'s Chart</th>
          </tr>
        </thead>
        <tbody>
          {birthChartA.planets.map((planet, index) => {
            const house = findHouse(planet.full_degree, birthChartB.houses);
            return (
              <tr key={index}>
                <td>{planet.name}</td>
                <td>{house ? `${house}th House` : 'Not Found'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <table className="planet-house-positions-table">
        <thead>
          <tr>
            <th>{userBName}'s Planet</th>
            <th>House in {userAName}'s Chart</th>
          </tr>
        </thead>
        <tbody>
          {birthChartB.planets.map((planet, index) => {
            const house = findHouse(planet.full_degree, birthChartA.houses);
            return (
              <tr key={index}>
                <td>{planet.name}</td>
                <td>{house ? `${house}th House` : 'Not Found'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlanetHousePositionsTable;