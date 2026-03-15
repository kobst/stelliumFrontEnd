export const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries', glyph: '♈' },
  { value: 'taurus', label: 'Taurus', glyph: '♉' },
  { value: 'gemini', label: 'Gemini', glyph: '♊' },
  { value: 'cancer', label: 'Cancer', glyph: '♋' },
  { value: 'leo', label: 'Leo', glyph: '♌' },
  { value: 'virgo', label: 'Virgo', glyph: '♍' },
  { value: 'libra', label: 'Libra', glyph: '♎' },
  { value: 'scorpio', label: 'Scorpio', glyph: '♏' },
  { value: 'sagittarius', label: 'Sagittarius', glyph: '♐' },
  { value: 'capricorn', label: 'Capricorn', glyph: '♑' },
  { value: 'aquarius', label: 'Aquarius', glyph: '♒' },
  { value: 'pisces', label: 'Pisces', glyph: '♓' }
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
