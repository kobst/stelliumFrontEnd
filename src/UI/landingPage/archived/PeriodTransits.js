export const PeriodTransits = ({ periodTransits }) => {
    const formatTransit = (planet, transit) => {
        const { dateRange, transitingSign } = transit;
        return `${planet} transiting ${transitingSign} from ${dateRange[0]} to ${dateRange[1]}`;
    };

    return (
        <div style={{ color: 'white' }}>
            {Object.entries(periodTransits).map(([planet, data]) => (
                <div key={planet}>
                    <h3>{planet}</h3>
                    {data.transitSigns.map((transit, index) => (
                        <div key={index}>{formatTransit(planet, transit)}</div>
                    ))}
                </div>
            ))}
        </div>
    );
};