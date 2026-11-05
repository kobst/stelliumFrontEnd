// UI adapter for existing report shapes. Missing text stays missing; this never
// generates an interpretation or derives a public compatibility score.
export const splitReading = (text) => typeof text === 'string' ? text.split(/\n\s*\n|\n/).map((part) => part.trim()).filter(Boolean) : [];
const labelFor = (key) => key.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const themes = [
  ['Harmony', 'connection', 'The connection'], ['Connection', 'communication', 'How you talk'],
  ['Passion', 'attraction', 'Attraction'], ['Stability', 'repair', 'Friction & repair'], ['Growth', 'longrun', 'The long run'],
];
const domainLabels = { PERSONALITY_IDENTITY: 'Identity', EMOTIONAL_FOUNDATIONS_HOME: 'Emotional foundation', COMMUNICATION_BELIEFS: 'Communication', CAREER_PURPOSE_PUBLIC_IMAGE: 'Career & ambition', RELATIONSHIPS_SOCIAL: 'Partnerships', UNCONSCIOUS_SPIRITUALITY: 'Spiritual life' };

export function normalizeServiceReading({ subjectId, label, kind, source, note }) {
  const relationship = kind === 'relationship';
  const chapters = relationship ? themes.map(([theme, id, title]) => {
    const raw = source.completeAnalysis?.[theme];
    const panels = (value) => [
      ['Support patterns', value?.supportPanel], ['Points of friction', value?.challengePanel], ['Putting it together', typeof value === 'string' ? value : value?.synthesisPanel],
    ].filter(([, text]) => splitReading(text).length).map(([heading, text]) => ({ heading, paragraphs: splitReading(text) }));
    const synastry = panels(raw?.synastry || raw);
    const composite = panels(raw?.composite);
    return { id, title, eyebrow: theme, paragraphs: synastry.flatMap((section) => section.paragraphs), lenses: { synastry, composite } };
  }).filter((chapter) => chapter.paragraphs.length || chapter.lenses.composite.length)
    : Object.entries(source.broadCategoryAnalyses || {}).map(([id, data]) => {
      if (!data || typeof data !== 'object') return null;
      const original = data.subtopics || {};
      const edited = data.editedSubtopics || {};
      const keys = [...new Set([...Object.keys(original), ...Object.keys(edited)])];
      const sections = keys.map((key) => ({ heading: labelFor(key), paragraphs: splitReading(typeof edited[key] === 'string' ? edited[key] : typeof original[key] === 'string' ? original[key] : original[key]?.analysis) })).filter((section) => section.paragraphs.length);
      return { id, title: domainLabels[id] || labelFor(id), eyebrow: '360 analysis', paragraphs: [...splitReading(data.overview), ...sections.flatMap((section) => section.paragraphs), ...splitReading(data.synthesis)], sections };
    }).filter((chapter) => chapter?.paragraphs.length);
  const title = relationship ? `${label} · A relationship reading` : `${label} · A birth chart reading`;
  return {
    subjectId, label, kind, note,
    overview: splitReading(relationship ? source.completeAnalysis?.holisticOverview || source.initialOverview : source.basicAnalysis?.overview),
    placements: relationship ? [] : (source.birthChart?.planets || []).filter((planet) => ['Sun', 'Moon', 'Venus', 'Ascendant'].includes(planet.name)),
    aspects: relationship ? [] : source.birthChart?.aspects || [],
    factors: relationship ? (source.clusterScoring?.scoredItems || source.clusterAnalysis?.scoredItems || []).map((item) => ({
      id: item.id, label: item.label, source: item.source, payload: item,
      stars: Number.isInteger(item.starRating) && item.starRating > 0 && item.starRating <= 5 ? item.starRating : null,
    })).filter((item) => item.label) : [],
    report: { id: `${subjectId}-report-v1`, subjectId, kind, title, note, chapters },
  };
}
