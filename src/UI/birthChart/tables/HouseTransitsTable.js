const HouseTransitsTable = ({ houseTransits, userHouses = [] }) => {
    const getHouseSign = (houseNumber) => {
      const house = userHouses.find((house) => house.house === houseNumber);
      return house ? house.sign : '';
    };
  
    return (
      <div>
        <h2>House Transits</h2>
        <table>
          <thead>
            <tr>
              <th>Planet</th>
              <th>Transiting House</th>
              <th>House Sign</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {houseTransits.flatMap((transitData) => (
              transitData.transitHouses.map((transit, index) => (
                <tr key={`${transitData.planet}-${index}`}>
                  <td>{transitData.planet}</td>
                  <td>{transit.transitingHouse}</td>
                  <td>{getHouseSign(transit.transitingHouse)}</td>
                  <td>{new Date(transit.dateRange[0]).toLocaleDateString()}</td>
                  <td>{new Date(transit.dateRange[1]).toLocaleDateString()}</td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default HouseTransitsTable;