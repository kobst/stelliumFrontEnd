import React, { memo, useMemo } from 'react';
import './SynastryBirthChartComparison.css';
import Ephemeris from '../../shared/Ephemeris';
import BirthChartSummaryTable from './BirthChartSummaryTable';
import { addAspectDescriptionComputed } from '../../../Utilities/generateBirthDataDescriptions';

const SynastryBirthChartComparison = memo(({ birthChartA, birthChartB, compositeChart, userAName, userBName, compositeChartDescription, compositeChartPlanetDescriptions }) => {
    // console.log("birthChartA:", birthChartA)
    // console.log("birthChartB:", birthChartB)
    // console.log("compositeChart:", compositeChart)
    // console.log("userAName:", userAName)
    // console.log("userBName:", userBName)
    // console.log("compositeChartDescription:", compositeChartDescription)
    // console.log("compositeChartPlanetDescriptions:", compositeChartPlanetDescriptions)
    
    // Create stable keys for each chart
    const chartAKey = useMemo(() => {
        return JSON.stringify({
            planets: birthChartA.planets.map(p => p.name + p.full_degree),
            houses: birthChartA.houses.map(h => h.house + h.degree),
            aspects: birthChartA.aspects.map(a => a.transitingPlanet + a.aspectingPlanet)
        });
    }, [birthChartA]);

    const chartBKey = useMemo(() => {
        return JSON.stringify({
            planets: birthChartB.planets.map(p => p.name + p.full_degree),
            houses: birthChartB.houses.map(h => h.house + h.degree),
            aspects: birthChartB.aspects.map(a => a.transitingPlanet + a.aspectingPlanet)
        });
    }, [birthChartB]);

    return (
    <div className="synastry-birth-chart-comparison">
      <div className="user-a-chart">
        <h3>{userAName}'s Birth Chart</h3>
        <div className="ephemeris-container">
          <Ephemeris
            key={chartAKey}
            planets={birthChartA.planets}
            houses={birthChartA.houses}
            aspects={birthChartA.aspects}
            transits={birthChartB.planets}
            instanceId="chart-a"
          />
        </div>
      </div>
      <div className="user-b-chart">
        <h3>{userBName}'s Birth Chart</h3>
        <div className="ephemeris-container">
          <Ephemeris
            key={chartBKey}
            planets={birthChartB.planets}
            houses={birthChartB.houses}
            aspects={birthChartB.aspects}
            transits={birthChartA.planets}
            instanceId="chart-b"
          />
        </div>
      </div>
      <div className="composite-chart">
        <h3>Composite Chart</h3>
        <BirthChartSummaryTable planets={compositeChart.planets} houses={compositeChart.houses} aspects={compositeChart.aspects} />
        <div className="composite-chart-description">
            <h3>Composite Chart Description</h3>
            <table className="composite-chart-description-table">
                <thead>
                    <tr>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {compositeChartDescription.map((description, index) => (
                        <tr key={index}>
                            <td>{description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="composite-chart-planet-descriptions">
                <h3>Composite Chart Planet Descriptions</h3>
                {compositeChartPlanetDescriptions.map((description, index) => (
                    <p key={index}>{description}</p>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
});

export default SynastryBirthChartComparison;