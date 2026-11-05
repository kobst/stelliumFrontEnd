import React, { useState } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import ContextRail from './ContextRail';
import { ReferenceProvider } from './ReferenceLayer';
import { initialHoroscope, sampleHoroscopeData } from './horoscopeData';
import { SERVICES } from './model';
import { placementReference, positionLabel, relationshipAspectReference, stepSkyDay, transitReference } from './contextData';
import { selectReference } from './references';
import { SAMPLE_PLANETS, SAMPLE_PEOPLE, getRelationshipCharts, getServiceReading } from './fixtures';

jest.mock('../../UI/shared/Ephemeris', () => ({ onPlanetSelect, planets, transits, aspects }) => <div data-testid="context-wheel" data-chart={JSON.stringify({ planets, transits, aspects })}><button onClick={() => onPlanetSelect('Sun', 'natal')}>Natal Sun glyph</button><button onClick={() => onPlanetSelect('Venus', 'transit')}>Transit Venus glyph</button></div>);
const originalWidth = window.innerWidth;
const width = value => Object.defineProperty(window, 'innerWidth', { configurable: true, value });
afterEach(() => width(originalWidth));
function Harness({ serviceId = 'birthchart:maya', request, onExplore = jest.fn() }) {
  const [mount, setMount] = useState(null), [refs, setRefs] = useState([]), [horoscope, setHoroscope] = useState(initialHoroscope);
  const service = SERVICES.find(item => item.id === serviceId);
  return <ReferenceProvider serviceId={serviceId} references={refs} messages={[]} onSelect={(ref, toggle) => setRefs(current => selectReference(current, ref, serviceId, toggle).references)} onOpenExchange={jest.fn()} returnRequest={request}>
    <ContextRail service={service} mount={mount} horoscope={horoscope} onHoroscopeChange={value => setHoroscope(current => ({ ...current, ...value }))} referenceRequest={request} onExplore={onExplore} />
    <div ref={setMount} /><output data-testid="refs">{JSON.stringify(refs)}</output>
  </ReferenceProvider>;
}

it('shares placement IDs between glyph and row and shows labeled sample birth details', () => {
  width(1440); render(<Harness />);
  const rail = screen.getByRole('complementary', { name: 'Person and sky context' });
  expect(rail.textContent).toContain('Oct 2, 1990');
  expect(rail.textContent).toContain('7:42 AM');
  expect(rail.textContent).toContain('Washington Grove, MD');
  expect(rail.textContent).toContain('sample');
  expect(screen.queryByRole('button', { name: 'Expand chart & positions ↗' })).toBeNull();
  expect(screen.queryByRole('button', { name: /Sky ▾/ })).toBeNull();
  fireEvent.click(within(rail).getByText('Natal Sun glyph'));
  expect(JSON.parse(screen.getByTestId('refs').textContent)[0]).toEqual(placementReference('birthchart:maya', 'maya', SAMPLE_PLANETS[0]));
  const row = within(rail).getByRole('button', { name: 'Include Sun in Libra in question' });
  expect(row.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(row);
  expect(screen.getByTestId('refs').textContent).toBe('[]');
});

it('shows both partners in synastry, switches to composite with matching aspects, and retains stars', () => {
  width(1440); render(<Harness serviceId="relationship:maya-theo" />);
  expect(screen.getByRole('complementary').textContent).toContain('Birth time unknown');
  expect(screen.queryByRole('group', { name: 'Person chart' })).toBeNull();
  const charts = getRelationshipCharts('maya-theo');
  const wheel = () => JSON.parse(screen.getByTestId('context-wheel').getAttribute('data-chart'));
  expect(wheel()).toEqual({ planets: SAMPLE_PLANETS, transits: SAMPLE_PEOPLE.Theo.planets, aspects: charts.synastry.aspects });
  fireEvent.click(screen.getByRole('button', { name: 'Include Theo’s Sun in Pisces in question' }));
  expect(JSON.parse(screen.getByTestId('refs').textContent)[0]).toMatchObject({ sourceId: 'relationship:maya-theo:placement:Theo:natal:Sun', details: { personName: 'Theo', timeUnknown: true }, data: { house: null } });
  expect(screen.getByLabelText('3 stars')).toBeTruthy();
  expect(screen.getByLabelText('4 stars')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Include Maya’s Sun trine Theo’s Moon in question' }));
  expect(JSON.parse(screen.getByTestId('refs').textContent)[1]).toMatchObject({ serviceId: 'relationship:maya-theo', kind: 'aspect', sourceId: 'relationship:maya-theo:aspect:connection', target: { relationshipView: 'synastry' } });
  fireEvent.click(screen.getByRole('button', { name: 'Composite', exact: true }));
  expect(wheel()).toEqual({ planets: charts.composite.planets, transits: [], aspects: charts.composite.aspects });
  expect(screen.queryByRole('button', { name: 'Include Maya’s Sun trine Theo’s Moon in question' })).toBeNull();
  expect(screen.getByRole('heading', { name: 'Composite aspects' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Include Composite Venus trine Mars in question' }));
  expect(JSON.parse(screen.getByTestId('refs').textContent)[2]).toMatchObject({ kind: 'aspect', data: { source: 'composite', planet1: 'Venus', planet2: 'Mars' }, target: { relationshipView: 'composite' } });
  expect(screen.getByRole('button', { name: 'Include Composite Sun in Capricorn in question' }).getAttribute('aria-disabled')).toBe('true');
});

it.each(['maya-theo', 'maya-alex'])('keeps %s aspect geometry consistent with each sample chart', subjectId => {
  const charts = getRelationshipCharts(subjectId);
  for (const [mode, chart] of Object.entries(charts)) {
    expect(chart.aspects.length).toBeGreaterThan(0);
    for (const aspect of chart.aspects) {
      expect(aspect.source).toBe(mode);
      expect(chart.planets.find(planet => planet.name === aspect.planet1).full_degree).toBe(aspect.aspectedPlanetDegree);
      expect((mode === 'synastry' ? chart.outerPlanets : chart.planets).find(planet => planet.name === aspect.planet2).full_degree).toBe(aspect.aspectingPlanetDegree);
      expect(aspect.orb).toBeLessThanOrEqual(6);
    }
  }
  expect(new Set(Object.values(charts).flatMap(chart => chart.aspects.map(aspect => aspect.id))).size).toBe(Object.values(charts).flatMap(chart => chart.aspects).length);
});

it('restores a composite aspect into the mobile sheet and keeps composite placements distinct', () => {
  width(390); jest.useFakeTimers();
  const factor = getServiceReading('maya-theo').factors.find(item => item.source === 'composite');
  const reference = relationshipAspectReference('relationship:maya-theo', 'maya-theo', factor);
  render(<Harness serviceId="relationship:maya-theo" request={{ reference, visit: 1 }} />);
  act(() => jest.advanceTimersByTime(100));
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Composite', exact: true }).getAttribute('aria-pressed')).toBe('true');
  expect(document.activeElement.getAttribute('aria-label')).toBe(`Include ${factor.label} in question`);
  fireEvent.click(screen.getByText('Natal Sun glyph'));
  expect(JSON.parse(screen.getByTestId('refs').textContent)[0]).toMatchObject({ kind: 'placement', label: 'Composite Sun in Capricorn', details: { ring: 'composite', timeUnknown: true }, target: { relationshipView: 'composite' } });
  jest.clearAllTimers(); jest.useRealTimers();
});

it('selects transiting glyphs and natal rows directly, alongside unchanged transit choices', () => {
  width(1440); const onExplore = jest.fn(); render(<Harness serviceId="horoscope:maya" onExplore={onExplore} />);
  fireEvent.click(screen.getByText('Transit Venus glyph'));
  expect(JSON.parse(screen.getByTestId('refs').textContent)[0]).toMatchObject({ kind: 'placement', details: { ring: 'transit', observedAt: initialHoroscope().playhead } });
  fireEvent.click(screen.getByRole('button', { name: 'Include Maya’s Venus in Aries in question' }));
  expect(document.querySelectorAll('.cp-comparison-row:not(.cp-comparison-head)')).toHaveLength(7);
  const transit = sampleHoroscopeData(initialHoroscope()).transits[0];
  fireEvent.click(screen.getByRole('button', { name: 'Include Venus square natal Mars in question' }));
  expect(JSON.parse(screen.getByTestId('refs').textContent)[2].data).toEqual(transitReference(transit, initialHoroscope()).data);
  expect(screen.getByRole('button', { name: 'Include Maya’s Moon in Leo in question' }).getAttribute('aria-disabled')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Next sky day' }));
  expect(document.querySelector('.cp-context-date').textContent).toContain('Oct 24');
  fireEvent.click(screen.getByRole('button', { name: 'Explore transit timing ↗' }));
  expect(onExplore).toHaveBeenCalledTimes(1);
});

it('opens a narrow-screen sheet and restores a placement source that only lives there', () => {
  width(390); jest.useFakeTimers();
  const { rerender } = render(<Harness />);
  const strip = screen.getByRole('button', { name: /Maya.*Sky ▾/ });
  fireEvent.click(strip);
  expect(screen.getByRole('dialog', { name: 'Person and sky context' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Close chart context ×' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(strip);
  const reference = placementReference('birthchart:maya', 'maya', SAMPLE_PLANETS[2]);
  rerender(<Harness request={{ reference, visit: 1 }} />);
  act(() => jest.advanceTimersByTime(40));
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(document.activeElement.getAttribute('aria-label')).toBe('Include Mercury in Libra in question');
  jest.clearAllTimers(); jest.useRealTimers();
});

it('normalizes sky longitudes and steps local calendar days rather than fixed 24-hour intervals', () => {
  expect(positionLabel({ full_degree: 361 })).toEqual({ sign: 'Aries', degree: '1.0' });
  const value = initialHoroscope('2026-10-31');
  const next = stepSkyDay(value, 1);
  expect(next.anchor).toBe('2026-11-01');
  expect(new Date(next.playhead).getHours()).toBe(12);
});

it('keeps person, natal/transiting ring and observed moment distinct in placement anchors', () => {
  const planet = SAMPLE_PLANETS[0], value = initialHoroscope();
  const maya = placementReference('relationship:maya-theo', 'maya-theo', planet, { personName: 'Maya' });
  const theo = placementReference('relationship:maya-theo', 'maya-theo', planet, { personName: 'Theo', timeUnknown: true });
  expect(maya.sourceId).not.toBe(theo.sourceId);
  expect(theo.target.personName).toBe('Theo');
  const natal = placementReference('horoscope:maya', 'maya', planet, { horoscope: value });
  const transit = placementReference('horoscope:maya', 'maya', planet, { horoscope: value, ring: 'transit' });
  const tomorrow = placementReference('horoscope:maya', 'maya', planet, { horoscope: { ...value, ...stepSkyDay(value, 1) }, ring: 'transit' });
  expect(new Set([natal.sourceId, transit.sourceId, tomorrow.sourceId]).size).toBe(3);
  expect(transit.target.horoscope.playhead).toBe(value.playhead);
});
