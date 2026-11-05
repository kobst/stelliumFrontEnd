// Shared birth-detail steps. Trial/account APIs stay outside this module.
export const BIRTH_DETAIL_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'birthDate', label: 'Birth date', type: 'date' },
  { key: 'place', label: 'Birthplace', type: 'text' },
  { key: 'birthTime', label: 'Birth time', type: 'time' },
];
export const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
export function birthDetailError(field, value) {
  if (field === 'name' && !value?.name?.trim()) return 'Enter a name.';
  if (field === 'birthDate') {
    const date = value.birthDate || '', parsed = new Date(`${date}T12:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date > todayKey()) return 'Enter a valid birth date that is not in the future.';
  }
  if (field === 'place' && !value.place?.trim()) return 'Enter a birthplace.';
  if (field === 'birthTime' && !value.unknownTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.birthTime || '')) return 'Enter a birth time or choose “Birth time unknown”.';
  return '';
}
export function birthDetailPrompt(field, { name, self = false } = {}) {
  if (field === 'name') return self ? 'Start by telling me your name.' : 'Whose birth chart would you like to add?';
  if (field === 'birthDate') return self ? `Lovely to meet you, ${name}. What’s your birth date?` : `What’s ${name?.trim() ? `${name.trim()}’s` : 'their'} birth date?`;
  if (field === 'place') return self ? 'And where were you born? City and country is perfect.' : `Where was ${name?.trim() || 'this person'} born? City and country is perfect.`;
  return self ? 'Last one — what time were you born? If you don’t know, that’s completely fine.' : `Last one — what time was ${name?.trim() || 'this person'} born? It’s fine if you don’t know.`;
}
export function formatBirthDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${day} ${months[month - 1]} ${year}`;
}
export function formatBirthTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'pm' : 'am'}`;
}
export function birthDetailAnswer(field, value) {
  if (field === 'birthDate') return formatBirthDate(value.birthDate);
  if (field === 'birthTime') return value.unknownTime ? 'Birth time unknown' : formatBirthTime(value.birthTime);
  return value[field]?.trim() || '';
}
