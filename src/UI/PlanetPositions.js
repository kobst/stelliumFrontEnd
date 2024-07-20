export const PlanetPositions = ({ planets }) => {
    const formatPlanetData = (planet) => {

        let normalTransit = ''

        if (planet.norm_degree) {
            normalTransit = `${planet.name}: ${planet.norm_degree.toFixed(2)} degrees ${planet.sign}, ${planet.house}th house`
        } else if (planet.normDegree) {
            normalTransit = `${planet.name}: ${planet.normDegree.toFixed(2)} degrees ${planet.sign}, ${planet.house}th house`

        }
        
        if (planet.is_retro === "true") {
           return  "retrograde " + normalTransit 
        } else {
            return normalTransit
        }
    };

    const halfIndex = Math.ceil(planets.length / 2);
    const firstColumn = planets.slice(0, halfIndex);
    const secondColumn = planets.slice(halfIndex);

    return (
        <div style={{ display: 'flex', color: 'white'}}>
            <div>
                {firstColumn.map((planet, index) => (
                    <div key={index}>{formatPlanetData(planet)}</div>
                ))}
            </div>
            <div>
                {secondColumn.map((planet, index) => (
                    <div key={index}>{formatPlanetData(planet)}</div>
                ))}
            </div>
        </div>
    );
};
