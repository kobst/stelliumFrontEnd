// Illustrative content only. No account data, forecasts, or purchases are fetched.
export const SUBJECTS = [
  { id: 'maya', label: 'Maya', detail: 'Sample birth chart · time known', kind: 'person' },
  { id: 'maya-theo', label: 'Maya & Theo', detail: 'Sample relationship · Theo’s birth time unknown', kind: 'relationship', partner: 'Theo' },
  { id: 'maya-alex', label: 'Maya & Alex', detail: 'Sample relationship · both birth times known', kind: 'relationship', partner: 'Alex' },
];

export const MODES = [
  { id: 'birthchart', label: 'Birth chart', mark: '☉', prompt: 'Give me a short birth chart reading' },
  { id: 'relationship', label: 'Relationships', mark: '♡', prompt: 'I want a full compatibility report' },
  { id: 'horoscope', label: 'Horoscopes', mark: '☽', prompt: 'What does my week look like?' },
  { id: 'question', label: 'Ask anything', mark: '✳', prompt: 'What does my Venus sign mean?' },
];

export const SAMPLE_WEEK = {
  start: '2026-10-19', end: '2026-10-25', label: '19–25 October 2026', timezone: 'America/New_York',
  title: 'Make room for the conversation.',
  summary: 'A sample week about saying what you mean, leaving space to listen, and giving yourself time before agreeing to more.',
  days: [
    { name: 'Mon', date: 19 }, { name: 'Tue', date: 20 }, { name: 'Wed', date: 21 },
    { name: 'Thu', date: 22 }, { name: 'Fri', date: 23, event: 'A conversation' },
    { name: 'Sat', date: 24 }, { name: 'Sun', date: 25, event: 'Time to reflect' },
  ],
  events: [
    { day: 'Fri 23', title: 'Say the quiet part out loud', text: 'A useful moment to name what you need. Start with a small, specific request rather than trying to settle everything at once.' },
    { day: 'Sun 25', title: 'Leave room for a different answer', text: 'Revisit an idea after some breathing space. What felt urgent earlier in the week may become easier to describe.' },
  ],
};

export const SAMPLE_PLANETS = [
  { name: 'Sun', sign: 'Libra', norm_degree: 12, full_degree: 192 },
  { name: 'Moon', sign: 'Leo', norm_degree: 8, full_degree: 128 },
  { name: 'Mercury', sign: 'Libra', norm_degree: 18, full_degree: 198 },
  { name: 'Venus', sign: 'Aries', norm_degree: 21, full_degree: 21 },
  { name: 'Mars', sign: 'Cancer', norm_degree: 20, full_degree: 110 },
  { name: 'Jupiter', sign: 'Gemini', norm_degree: 7, full_degree: 67 },
  { name: 'Saturn', sign: 'Pisces', norm_degree: 14, full_degree: 344 },
];

export const SAMPLE_MONTH = {
  start: '2026-11-01', end: '2026-11-30', label: 'November 2026', timezone: 'America/New_York',
  title: 'A little more room to grow.',
  summary: 'An illustrative month of revisiting priorities, making time for connection, and choosing a sustainable pace.',
  events: [
    { day: 'Early month', title: 'Begin with one honest conversation', text: 'Name something you would like to make more room for, without needing to resolve it immediately.' },
    { day: 'Midmonth', title: 'Take a second look', text: 'Return to a plan after a little distance. Make a deliberate choice about what still deserves your energy.' },
    { day: 'Late month', title: 'Keep what works', text: 'Notice which small routines have made your days feel steadier, and carry them forward.' },
  ],
};

export function makeReport(subjectId) {
  const subject = SUBJECTS.find((item) => item.id === subjectId);
  if (subject?.kind !== 'relationship') return null;
  const partner = subject.partner;
  return {
    id: `${subjectId}-report-v1`, subjectId, title: `${subject.label} · A relationship reading`,
    note: subjectId === 'maya-theo'
      ? 'Theo’s birth time is unknown. This sample reading avoids his houses and angles; time-sensitive details would need qualification in a live report.'
      : 'Both sample birth times are known. All interpretations and chart positions in this prototype are illustrative.',
    chapters: [
      { id: 'connection', title: 'The connection', eyebrow: 'How you meet each other', paragraphs: [
        `With ${partner}, connection begins in the everyday: the things you notice, the questions you ask, and the attention you give without being asked. The relationship has room for both warmth and independence.`,
        'Closeness does not have to mean wanting the same thing at the same moment. One of the most useful habits is to check whether the other person wants company, reassurance, or simply a little space.',
        'Notice what makes an ordinary day feel shared. A familiar walk or an unhurried meal can tell you more about how you connect than one exceptional evening.',
      ] },
      { id: 'communication', title: 'How you talk', eyebrow: 'Understanding before agreement', paragraphs: [
        `You and ${partner} may reach the same idea by different routes. One person wants to talk while a feeling is fresh; the other may need to understand it privately first. Neither rhythm has to win.`,
        'Try naming the kind of conversation you need before beginning it. “I want to think this through with you” invites a different response from “I need us to decide tonight.”',
        'The opportunity here is to become more explicit without becoming less kind. A clear request gives the other person something they can actually respond to.',
      ] },
      { id: 'attraction', title: 'Attraction', eyebrow: 'Admiration comes first', paragraphs: [
        `What draws you toward ${partner} may be less about similarity than a quality you enjoy seeing expressed so freely. Admiration gives attraction somewhere to return after the first rush.`,
        'Enjoying that difference does not mean that you must imitate it. The connection grows when each person can remain recognizably themselves, including having separate interests and friendships.',
        'Make room to express appreciation in a form the other person can recognize. What feels obvious to you may still be something they would love to hear.',
      ] },
      { id: 'repair', title: 'Friction & repair', eyebrow: 'What happens after the difficult moment', paragraphs: [
        'Friction often begins when a practical disagreement starts carrying a larger meaning. A change of plan can feel like a lack of care; a quiet evening can be mistaken for distance.',
        `Before deciding what ${partner} intended, separate the event from the story you are telling about it. Ask one question that could genuinely change your interpretation.`,
        'Repair is easier when it is specific. Name what happened, acknowledge its effect, and agree on one thing to try differently next time.',
      ] },
      { id: 'longrun', title: 'The long run', eyebrow: 'A practice, not a verdict', paragraphs: [
        'A relationship reading offers language for patterns. It cannot decide the future of a relationship, or replace what you learn by living it together.',
        'Return to the themes that feel useful and leave the ones that do not fit. The most valuable insight is one that makes a real conversation easier to have.',
        `For you and ${partner}, begin with a question: what would make our everyday life feel more generous to both of us?`,
      ] },
    ],
  };
}
