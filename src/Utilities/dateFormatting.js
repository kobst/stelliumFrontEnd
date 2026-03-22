const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseDatePreservingCalendarDay = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const match = value.match(DATE_ONLY_PATTERN);
    if (match) {
      const [, year, month, day] = match;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatCalendarDate = (value, locale = 'en-US', options = {}) => {
  const parsed = parseDatePreservingCalendarDay(value);
  if (!parsed) {
    return value || '';
  }

  return parsed.toLocaleDateString(locale, options);
};
