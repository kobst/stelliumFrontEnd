import { normalizeServiceReading } from './serviceReadingData';
import { getServiceReading, makeReport } from './fixtures';

it('uses the existing birth chart overview and edited subtopic shapes', () => {
  const data = normalizeServiceReading({ subjectId: 'p', label: 'Person', kind: 'birthchart', source: {
    basicAnalysis: { overview: 'First paragraph.\nSecond paragraph.' },
    broadCategoryAnalyses: { PERSONALITY_IDENTITY: { overview: 'Introduction.', subtopics: { first: { analysis: 'Original.' }, second: { analysis: 'Still useful.' } }, editedSubtopics: { first: 'Edited.' }, synthesis: 'Conclusion.' } },
  } });
  expect(data.overview).toEqual(['First paragraph.', 'Second paragraph.']);
  expect(data.report.chapters[0].title).toBe('Identity');
  expect(data.report.chapters[0].paragraphs).toEqual(['Introduction.', 'Edited.', 'Still useful.', 'Conclusion.']);
});

it('keeps missing composite analysis missing, and never exports cluster scores', () => {
  const data = normalizeServiceReading({ subjectId: 'pair', label: 'A & B', kind: 'relationship', source: {
    initialOverview: 'Initial.', completeAnalysis: { holisticOverview: 'Complete.', Harmony: { synastry: { supportPanel: 'Support.' } } },
    clusterScoring: { clusters: { Harmony: { score: 99 } }, scoredItems: [{ id: 'factor', label: 'A factor', source: 'synastry', starRating: 3, score: 0.9 }] },
  } });
  expect(data.overview).toEqual(['Complete.']);
  expect(data.report.chapters[0].lenses.composite).toEqual([]);
  expect(data.report.chapters[0].paragraphs).toEqual(['Support.']);
  expect(data.factors[0]).toMatchObject({ id: 'factor', label: 'A factor', source: 'synastry', stars: 3 });
  expect(data.factors[0].payload).toEqual({ id: 'factor', label: 'A factor', source: 'synastry', starRating: 3, score: 0.9 });
  expect(data).not.toHaveProperty('clusters');
  expect(normalizeServiceReading({ kind: 'birthchart', source: {} }).report.chapters).toEqual([]);
});

it('provides both report formats without inventing angles or a missing partner interpretation', () => {
  expect(makeReport('maya').chapters).toHaveLength(6);
  expect(getServiceReading('maya').placements.map((planet) => planet.name)).not.toContain('Ascendant');
  expect(getServiceReading('maya-theo').report.chapters.every((chapter) => chapter.lenses.composite.length === 0)).toBe(true);
  expect(getServiceReading('maya-alex').report.chapters.every((chapter) => chapter.lenses.composite.length > 0)).toBe(true);
});
