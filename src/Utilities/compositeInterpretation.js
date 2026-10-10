const text = (value) => typeof value === 'string' ? value.trim() : '';

const synthesis = (value) => text(value)
  || text(value?.synthesisPanel)
  || text(value?.analysis)
  || text(value?.interpretation);

// Both personal and public relationships receive this summary from the API.
// Older reports may instead hold a composite synthesis in completeAnalysis.
export function getCompositeInterpretation(relationship) {
  const summary = text(relationship?.compositeSummary?.summary)
    || text(relationship?.compositeSummary);
  if (summary) return summary;

  const analysis = relationship?.completeAnalysis;
  if (!analysis || typeof analysis !== 'object') return '';

  const dedicated = Object.entries(analysis).find(([key]) => /composite/i.test(key))?.[1];
  const dedicatedText = synthesis(dedicated?.composite) || synthesis(dedicated);
  if (dedicatedText) return dedicatedText;

  const clusters = (relationship?.clusterScoring || relationship?.clusterAnalysis)?.clusters || {};
  const dimensions = ['Harmony', 'Passion', 'Connection', 'Stability', 'Growth'];
  const entries = Object.entries(analysis)
    .filter(([key]) => dimensions.some((name) => key.toLowerCase().includes(name.toLowerCase())))
    .sort(([a], [b]) => {
      const score = (key) => {
        const name = dimensions.find((dimension) => key.toLowerCase().includes(dimension.toLowerCase()));
        return Number(clusters[name]?.score) || 0;
      };
      return score(b) - score(a);
    });
  for (const [, value] of entries) {
    const compositeText = synthesis(value?.composite);
    if (compositeText) return compositeText;
  }
  return '';
}
