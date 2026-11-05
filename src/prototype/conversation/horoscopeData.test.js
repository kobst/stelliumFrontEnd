import { chartAspects, dayAt, initialHoroscope, movePeriod, passageTransitKeys, sampleHoroscopeData, scopeInterval, skyAt } from './horoscopeData';

it('links explicit transit phrases without confusing separate planet mentions', () => {
  const transits = sampleHoroscopeData(initialHoroscope()).transits;
  expect(passageTransitKeys(['Venus square natal Mars asks for patience.', 'Venus and Mars both matter.', 'Venus square your natal Mars asks for patience.'], transits))
    .toEqual([['sample-venus-mars'], [], ['sample-venus-mars']]);
});

it('uses day, week and month ranges with exclusive ends and calendar-aware navigation', () => {
  const value = initialHoroscope();
  expect(new Date(scopeInterval(value).start).getDate()).toBe(19);
  expect(new Date(scopeInterval(value).end).getDate()).toBe(26);
  expect(new Date(scopeInterval({ ...value, scope: 'month' }).end).getMonth()).toBe(10);
  expect(movePeriod({ ...value, scope: 'month', anchor: '2026-01-31' }, 1).anchor).toBe('2026-02-01');
});

it('moves sample transit positions with the date and shows the selected cross-chart aspect', () => {
  const data = sampleHoroscopeData(initialHoroscope());
  const exact = dayAt('2026-10-23');
  const sky = skyAt(data, exact);
  expect(sky.map(planet => planet.name)).toEqual(data.planets.map(planet => planet.name));
  expect(skyAt(data, exact + 86400000)).not.toEqual(sky);
  const aspect = chartAspects([data.transits[0]], data.planets, sky, exact)[0];
  expect(aspect.aspectedPlanet).toBe('Venus');
  expect(aspect.aspectingPlanet).toBe('Mars');
  expect(aspect.aspectType).toBe('square');
});
