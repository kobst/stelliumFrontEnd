export function getRelationshipSummary(overall) {
  const structuredSummary =
    overall?.summary && typeof overall.summary === 'object' ? overall.summary : null;
  const resolvedLabel = structuredSummary?.resolvedLabel || '';
  const rawLabel = structuredSummary?.label || '';
  const headline =
    structuredSummary?.headline && typeof structuredSummary.headline === 'object'
      ? structuredSummary.headline
      : null;

  return {
    summary: structuredSummary,
    headline,
    label: rawLabel || overall?.profile || '',
    rawLabel,
    resolvedLabel,
    resolvedLevel: structuredSummary?.resolvedLevel || null,
    resolvedFamily: structuredSummary?.resolvedFamily || '',
    confidenceAxes: structuredSummary?.confidenceAxes || null,
    dominantClusters: Array.isArray(structuredSummary?.dominantClusters)
      ? structuredSummary.dominantClusters
      : [],
    blurb:
      structuredSummary?.blurb ||
      overall?.description ||
      (typeof overall?.summary === 'string' ? overall.summary : '') ||
      '',
    score: overall?.score,
    tier: overall?.tier
  };
}

export function relationshipStrengthWord(strengthScore) {
  if (typeof strengthScore !== 'number' || Number.isNaN(strengthScore)) return '';
  if (strengthScore >= 80) return 'Deep Connection';
  if (strengthScore >= 65) return 'Strong Connection';
  if (strengthScore >= 45) return 'Steady Connection';
  if (strengthScore >= 25) return 'Developing Connection';
  return 'Quiet Connection';
}

export function getRelationshipCardSummary(overall) {
  const summary = getRelationshipSummary(overall);
  const rawLabel = summary.rawLabel || '';
  const resolvedLevel = summary.resolvedLevel;
  const strengthLabel = relationshipStrengthWord(summary.headline?.strengthScore);

  return {
    ...summary,
    cardLabel:
      resolvedLevel === 'leaf' || resolvedLevel === 'family'
        ? rawLabel
        : '',
    strengthLabel,
    cardHeadline:
      resolvedLevel === 'leaf' || resolvedLevel === 'family'
        ? rawLabel
        : strengthLabel,
    showArchetypeOnCard: resolvedLevel === 'leaf' || resolvedLevel === 'family'
  };
}
