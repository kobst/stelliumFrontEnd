export function getRelationshipSummary(overall) {
  const structuredSummary =
    overall?.summary && typeof overall.summary === 'object' ? overall.summary : null;
  const detailArchetype =
    structuredSummary?.detailArchetype && typeof structuredSummary.detailArchetype === 'object'
      ? structuredSummary.detailArchetype
      : null;
  const resolvedLabel = structuredSummary?.resolvedLabel || '';
  const rawLabel = structuredSummary?.label || '';
  const detailLabel = detailArchetype
    ? detailArchetype.suppressed
      ? ''
      : detailArchetype.label || ''
    : rawLabel;
  const headline =
    structuredSummary?.headline && typeof structuredSummary.headline === 'object'
      ? structuredSummary.headline
      : null;

  return {
    summary: structuredSummary,
    detailArchetype,
    headline,
    label: detailLabel || (!detailArchetype ? overall?.profile || '' : ''),
    rawLabel,
    detailLabel,
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

export function getRelationshipCardSummary(overall) {
  const summary = getRelationshipSummary(overall);
  const rawLabel = summary.rawLabel || '';
  const resolvedLevel = summary.resolvedLevel;
  const detailRoute = summary.detailArchetype?.route || null;
  const showDetailLeaf = detailRoute === 'cluster_leaf';
  const showLegacyLeafOrFamily = !summary.detailArchetype && (resolvedLevel === 'leaf' || resolvedLevel === 'family');
  const cardLabel = showDetailLeaf ? summary.label : showLegacyLeafOrFamily ? rawLabel : '';

  return {
    ...summary,
    cardLabel,
    cardHeadline: cardLabel || summary.resolvedLabel || summary.label || ''
  };
}
