export function getRelationshipSummary(overall) {
  const structuredSummary =
    overall?.summary && typeof overall.summary === 'object' ? overall.summary : null;
  const resolvedLabel = structuredSummary?.resolvedLabel || '';
  const rawLabel = structuredSummary?.label || '';

  return {
    summary: structuredSummary,
    label: resolvedLabel || rawLabel || overall?.profile || '',
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
