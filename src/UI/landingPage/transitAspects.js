export const TransitAspects = ({ transits, isMonthly=false }) => {
    const formatTransitData = (transit) => {
        const normalTransit = `${transit.transitingPlanet} forming a ${transit.aspectType} to ${transit.aspectingPlanet} from ${transit.date_range[0]} to ${transit.date_range[1]}`
        return normalTransit
    };

    const filteredTransits = isMonthly
        ? transits.filter(transit => transit.transitingPlanet !== "Moon")
        : transits;

    return (
        <div style={{ display: 'flex', color: 'white'}}>
            <div>
                {filteredTransits.map((planet, index) => (
                    <div key={index}>{formatTransitData(planet)}</div>
                ))}
            </div>
        </div>
    );
};
