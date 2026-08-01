/**
 * Shared zodiac display copy: glyphs, elements, per-sign one-liners for the
 * big three, and the computed handwritten note. Used by the Gravity Chat
 * intake result and the free-reading page so the copy never drifts.
 */

export const SIGN_GLYPHS = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export const SIGN_ELEMENTS = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water',
};

export const SUN_LINES = {
  Aries: 'You lead with ignition. Waiting is the one thing your chart never learned to do.',
  Taurus: 'You build slowly and keep what you build. Rushing you has never once worked.',
  Gemini: 'You think in questions. A day without something new to turn over is a wasted day.',
  Cancer: 'You protect what you love before you even decide to. Home is a verb for you.',
  Leo: 'You warm whatever room you’re in — and you know it, which is part of the charm.',
  Virgo: 'You show love by noticing. Nothing gets past you, especially the fixable things.',
  Libra: 'You weigh everything twice. Fairness isn’t a preference for you — it’s a reflex.',
  Scorpio: 'You don’t do surfaces. Meaning has to be earned, and you’d rather know the difficult truth.',
  Sagittarius: 'You need a horizon. Any life that’s only logistics starts to itch quickly.',
  Capricorn: 'You play the long game on instinct. Effort is your native love language.',
  Aquarius: 'You see the pattern before the crowd does — and you’re fine standing apart from it.',
  Pisces: 'You feel the room before you enter it. Boundaries are your life’s homework.',
};

export const MOON_LINES = {
  Aries: 'Feelings arrive fast and honest. You’d rather flare than simmer.',
  Taurus: 'You steady yourself through the senses — comfort is how you come back to earth.',
  Gemini: 'You process by talking it through. Silence is where your worries breed.',
  Cancer: 'You feel in tides. The people you let close get the fiercest loyalty there is.',
  Leo: 'Your heart wants witnesses. Being celebrated isn’t vanity — it’s fuel.',
  Virgo: 'You manage feelings by being useful. Sometimes the task is a hiding place.',
  Libra: 'You settle when things are even. Conflict sits in your body until it’s repaired.',
  Scorpio: 'You feel everything at full depth and show almost none of it. Trust changes that.',
  Sagittarius: 'You metabolize feelings by moving. Stuck emotions are just unwalked miles.',
  Capricorn: 'You feel deeply but privately, and you’d rather be relied on than looked after.',
  Aquarius: 'You feel deeply but step back to process. Distance is how you keep your footing.',
  Pisces: 'You absorb what others feel like weather. Solitude is how you wring yourself out.',
};

export const RISING_LINES = {
  Aries: 'You arrive like a decision. People sense the momentum before you say a word.',
  Taurus: 'You read as calm and unhurried — the person who won’t be rushed or rattled.',
  Gemini: 'You arrive curious, quick, already mid-conversation with the world.',
  Cancer: 'You come across gentler than your spine actually is. It disarms people.',
  Leo: 'You’re noticed before you try to be. Presence is your first language.',
  Virgo: 'You arrive observant, precise, taking quiet inventory of everything.',
  Libra: 'You put rooms at ease. People assume you agree more than you do.',
  Scorpio: 'You arrive contained. People find you magnetic first and unreadable second.',
  Sagittarius: 'You show up open and a little unfiltered — people trust it instantly.',
  Capricorn: 'You read as capable before you say anything. People hand you the plan.',
  Aquarius: 'You come across friendly and slightly elsewhere — one step outside the frame.',
  Pisces: 'People find you softer than you are. You arrive gentle, then prove unmovable.',
};

export const ordinal = (n) => {
  if (!n) return '';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

export const buildMastNote = (bigThree) => {
  const sunEl = SIGN_ELEMENTS[bigThree?.sun?.sign];
  const moonEl = SIGN_ELEMENTS[bigThree?.moon?.sign];
  if (sunEl && moonEl && sunEl === moonEl) {
    return `Both luminaries in ${sunEl}. It explains more than you'd think.`;
  }
  if (sunEl && moonEl) {
    return `Luminaries in ${sunEl} & ${moonEl}. No wonder you feel everything twice.`;
  }
  return 'The sky kept the receipts. Here they are.';
};
