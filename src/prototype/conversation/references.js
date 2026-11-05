// UI references wrap existing Ask payloads; they do not redefine API contracts.
export const ENTITY_LIMIT = 3;
export const referenceKey = ref => `${ref.serviceId}|${ref.kind}|${ref.sourceId}`;
export const textVersion = text => {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `text-v1-${(hash >>> 0).toString(16)}`;
};
export function selectReference(current, reference, serviceId, toggle = false) {
  if (reference.serviceId !== serviceId) return { references: current, error: 'This reference belongs to another service.' };
  const items = current.filter(ref => ref.serviceId === serviceId);
  const key = referenceKey(reference);
  const exists = items.some(ref => referenceKey(ref) === key);
  if (toggle && exists) return { references: items.filter(ref => referenceKey(ref) !== key), error: '' };
  if (reference.kind === 'passage') return { references: [...items.filter(ref => ref.kind !== 'passage'), reference], error: '' };
  if (exists) return { references: items.map(ref => referenceKey(ref) === key ? reference : ref), error: '' };
  if (items.filter(ref => ref.kind !== 'passage').length >= ENTITY_LIMIT) return { references: items, error: `Select up to ${ENTITY_LIMIT} chart elements alongside one passage.` };
  return { references: [...items, reference], error: '' };
}
export function anchorMatches(reference, text, version) {
  const { start, end } = reference.anchor || {};
  return reference.sourceVersion === version && Number.isInteger(start) && Number.isInteger(end)
    && start >= 0 && end > start && end <= text.length && text.slice(start, end) === reference.excerpt;
}
export function referenceExchanges(messages, reference) {
  return messages.filter(message => message.type === 'user' && message.references?.some(ref => referenceKey(ref) === referenceKey(reference)))
    .map(message => ({ message, reply: messages.find(item => item.inReplyTo === message.id) }));
}
export function passageSegments(text, version, source, messages) {
  const anchors = messages.flatMap(message => message.type === 'user' ? (message.references || []).filter(ref =>
    ref.kind === 'passage' && referenceKey(ref) === referenceKey(source) && anchorMatches(ref, text, version)) : []);
  const boundaries = [...new Set([0, text.length, ...anchors.flatMap(ref => [ref.anchor.start, ref.anchor.end])])].sort((a, b) => a - b);
  return boundaries.slice(0, -1).map((start, index) => ({ start, end: boundaries[index + 1],
    marked: anchors.some(ref => ref.anchor.start <= start && ref.anchor.end >= boundaries[index + 1]) }));
}
export function askEntityContext(serviceId, references) {
  const entities = references.filter(ref => ref.serviceId === serviceId && ref.kind !== 'passage');
  const payloads = entities.map(ref => ref.data);
  if (serviceId?.startsWith('relationship:')) return { scoredItems: entities.filter(ref => ref.kind === 'aspect').map(ref => ref.data) };
  if (serviceId?.startsWith('horoscope:')) return { selectedTransits: entities.filter(ref => ref.kind === 'transit').map(ref => ref.data) };
  return { selectedAspects: payloads };
}
