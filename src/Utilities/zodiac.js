export const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries' },
  { value: 'taurus', label: 'Taurus' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'cancer', label: 'Cancer' },
  { value: 'leo', label: 'Leo' },
  { value: 'virgo', label: 'Virgo' },
  { value: 'libra', label: 'Libra' },
  { value: 'scorpio', label: 'Scorpio' },
  { value: 'sagittarius', label: 'Sagittarius' },
  { value: 'capricorn', label: 'Capricorn' },
  { value: 'aquarius', label: 'Aquarius' },
  { value: 'pisces', label: 'Pisces' }
];

const SIGN_MAP = new Map(ZODIAC_SIGNS.map((sign) => [sign.value, sign]));

export const DEFAULT_ZODIAC_SIGN = 'aries';

export const normalizeZodiacSign = (value) => {
  if (!value) return DEFAULT_ZODIAC_SIGN;
  const normalized = String(value).trim().toLowerCase();
  return SIGN_MAP.has(normalized) ? normalized : null;
};

export const getZodiacLabel = (value) => {
  const normalized = normalizeZodiacSign(value);
  return normalized ? SIGN_MAP.get(normalized).label : '';
};
