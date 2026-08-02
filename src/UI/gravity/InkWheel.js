import React from 'react';
import Ephemeris from '../shared/Ephemeris';
import './InkWheel.css';

/**
 * The real chart wheel (the shared dashboard Ephemeris) seated on an
 * ink-navy disk, so its light-on-dark drawing reads on the paper-toned
 * marketing pages. Without a chart it renders the bare zodiac ring —
 * used while a trial reading is still casting.
 *
 * `chart` is the slim shape saved in the trial session by
 * slimChartForWheel: { planets, houses, aspects }.
 */
const InkWheel = ({ chart, instanceId, spinning = false }) => {
  const houses = chart?.houses || [];
  return (
    <div className={`ink-wheel${spinning ? ' ink-wheel--spin' : ''}`}>
      <div className="ink-wheel-disk">
        <Ephemeris
          planets={chart?.planets || []}
          houses={houses.length === 12 ? houses : []}
          aspects={chart?.aspects || []}
          transits={[]}
          instanceId={instanceId}
        />
      </div>
    </div>
  );
};

export default InkWheel;
