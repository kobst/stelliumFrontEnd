import { getCompositeInterpretation } from './compositeInterpretation';

it('prefers the composite summary over a single dimension synthesis', () => {
  expect(getCompositeInterpretation({
    compositeSummary: { summary: 'Whole relationship interpretation.' },
    completeAnalysis: { Harmony: { composite: { synthesisPanel: 'Harmony only.' } } },
  })).toBe('Whole relationship interpretation.');
});

it('uses a dedicated older composite interpretation when the summary is blank', () => {
  expect(getCompositeInterpretation({
    compositeSummary: { summary: '  ' },
    completeAnalysis: { composite: { interpretation: 'Older composite reading.' } },
  })).toBe('Older composite reading.');
});

it('falls back to the highest scoring dimension with a composite synthesis', () => {
  expect(getCompositeInterpretation({
    clusterScoring: { clusters: { Harmony: { score: 40 }, Passion: { score: 70 }, Growth: { score: 90 } } },
    completeAnalysis: {
      Harmony: { composite: { synthesisPanel: 'Harmony composite.' } },
      Passion: { composite: { synthesisPanel: 'Passion composite.' } },
      Growth: { synastry: { synthesisPanel: 'Growth synastry.' } },
    },
  })).toBe('Passion composite.');
});

it('does not substitute a synastry narrative when composite text is absent', () => {
  expect(getCompositeInterpretation({ completeAnalysis: {
    Harmony: { synastry: { synthesisPanel: 'Synastry only.' } },
  } })).toBe('');
  expect(getCompositeInterpretation(null)).toBe('');
});
