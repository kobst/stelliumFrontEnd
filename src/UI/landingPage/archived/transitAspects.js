export const TransitAspects = ({ transits }) => {
    const formatTransitData = (transit) => {
        const normalTransit = `${transit.transitingPlanet} forming a ${transit.aspectType} to ${transit.aspectingPlanet} from ${transit.date_range[0]} to ${transit.date_range[1]}`
        return normalTransit
    };


    return (
        <div style={{ display: 'flex', color: 'white'}}>
            <div>
                {transits.map((planet, index) => (
                    <div key={index}>{formatTransitData(planet)}</div>
                ))}
            </div>
        </div>
    );
};
