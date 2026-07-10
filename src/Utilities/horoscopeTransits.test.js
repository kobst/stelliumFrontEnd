import { formatTransitTitle, groupTransitInfluences } from './horoscopeTransits';

describe('horoscope transit presentation', () => {
  test('makes transiting and natal roles explicit', () => {
    expect(formatTransitTitle({
      transitingPlanet: 'Sun',
      aspect: 'trine',
      targetPlanet: 'Sun',
    })).toBe('Transiting Sun trine Natal Sun');
  });

  test('merges repeated transit snapshots into one dated influence', () => {
    const influences = groupTransitInfluences([
      {
        id: 'first',
        transitingPlanet: 'Jupiter',
        aspect: 'square',
        targetPlanet: 'Moon',
        exact: '2026-07-08T12:00:00.000Z',
      },
      {
        id: 'second',
        transitingPlanet: 'Jupiter',
        aspect: 'square',
        targetPlanet: 'Moon',
        exact: '2026-07-09T12:00:00.000Z',
      },
    ]);

    expect(influences).toHaveLength(1);
    expect(influences[0]).toMatchObject({
      title: 'Transiting Jupiter square Natal Moon',
      dateLabel: 'Jul 8–Jul 9',
    });
  });

  test('does not merge unrelated title-only records', () => {
    const influences = groupTransitInfluences([
      { id: 'a', title: 'First influence' },
      { id: 'b', title: 'Second influence' },
    ]);
    expect(influences).toHaveLength(2);
  });
});
