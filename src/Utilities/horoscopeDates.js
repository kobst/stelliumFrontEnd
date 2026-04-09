const pad = (value) => String(value).padStart(2, '0');

export const formatLocalDateParam = (date = new Date()) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

export const parseDateInput = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return utcDate;
};

export const getUtcWeekStartDateString = (dateString) => {
  const parsed = parseDateInput(dateString) || parseDateInput(formatLocalDateParam());
  const day = parsed.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(parsed);
  monday.setUTCDate(parsed.getUTCDate() + diffToMonday);

  return [
    monday.getUTCFullYear(),
    pad(monday.getUTCMonth() + 1),
    pad(monday.getUTCDate())
  ].join('-');
};

export const getUtcMonthStartDateString = (dateString) => {
  const parsed = parseDateInput(dateString) || parseDateInput(formatLocalDateParam());

  return [
    parsed.getUTCFullYear(),
    pad(parsed.getUTCMonth() + 1),
    '01'
  ].join('-');
};

export const isCurrentHoroscopeForPeriod = (period, horoscope, referenceDate = new Date()) => {
  if (!horoscope?.startDate || !horoscope?.endDate) {
    return false;
  }

  const currentDateParam = formatLocalDateParam(referenceDate);
  const expectedStartByPeriod = {
    today: currentDateParam,
    week: getUtcWeekStartDateString(currentDateParam),
    month: getUtcMonthStartDateString(currentDateParam)
  };

  const expectedStart = expectedStartByPeriod[period];
  if (!expectedStart) {
    return true;
  }

  const actualStart = horoscope.startDate.slice(0, 10);
  return actualStart === expectedStart;
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });

  const start = new Date(startDate);
  const end = new Date(endDate);

  return `${formatter.format(start)} - ${formatter.format(end)}`;
};
