// Illustrative content only. No account data, forecasts, or purchases are fetched.
import { normalizeServiceReading } from './serviceReadingData';
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

// Fictional profile copy and illustrative sky fixtures, not calculated natal data.
export const SAMPLE_PEOPLE = {
  Maya: { birthDate: 'Oct 2, 1990', birthTime: '7:42 AM', place: 'Washington Grove, MD', planets: SAMPLE_PLANETS },
  Theo: { birthDate: 'Mar 14, 1988', birthTime: null, place: 'Austin, TX', planets: samplePositions([354, 312, 340, 321, 110, 15, 272]) },
  Alex: { birthDate: 'Jun 8, 1992', birthTime: '2:15 PM', place: 'Brooklyn, NY', planets: samplePositions([77, 312, 82, 41, 110, 157, 318]) },
};
function samplePositions(longitudes) {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return SAMPLE_PLANETS.map((planet, index) => ({ name: planet.name, full_degree: longitudes[index], norm_degree: longitudes[index] % 30, sign: signs[Math.floor(longitudes[index] / 30)] }));
}

// Geometry derived only from the illustrative fixtures above, never birth data.
export function getRelationshipCharts(subjectId) {
  const partner = SUBJECTS.find(subject => subject.id === subjectId)?.partner;
  if (!partner) return null;
  const inner = SAMPLE_PLANETS, outer = SAMPLE_PEOPLE[partner].planets;
  const composite = samplePositions(inner.map((planet, index) => {
    const delta = ((outer[index].full_degree - planet.full_degree + 540) % 360) - 180;
    return (planet.full_degree + delta / 2 + 360) % 360;
  }));
  const types = [['conjunction', 0], ['sextile', 60], ['square', 90], ['trine', 120], ['opposition', 180]];
  const aspects = (first, second, source) => first.flatMap((a, i) => second.flatMap((b, j) => {
    if (source === 'composite' && j <= i) return [];
    const separation = Math.abs(((b.full_degree - a.full_degree + 540) % 360) - 180);
    const match = types.find(([, angle]) => Math.abs(separation - angle) <= 6);
    if (!match) return [];
    const [aspect, angle] = match;
    const known = source === 'synastry' && a.name === 'Sun' && b.name === 'Moon' && aspect === 'trine' ? 'connection'
      : source === 'synastry' && a.name === 'Venus' && b.name === 'Mars' && aspect === 'square' ? 'attraction' : null;
    return [{ id: known || `${source}-${a.name}-${aspect}-${b.name}`, source, type: 'aspect',
      label: source === 'synastry' ? `Maya’s ${a.name} ${aspect} ${partner}’s ${b.name}` : `Composite ${a.name} ${aspect} ${b.name}`,
      planet1: a.name, planet2: b.name, aspect, orb: Math.abs(separation - angle),
      aspectedPlanet: a.name, aspectingPlanet: b.name, aspectType: aspect,
      aspectedPlanetDegree: a.full_degree, aspectingPlanetDegree: b.full_degree,
      ...(known ? { starRating: known === 'connection' ? 3 : 4 } : {}) }];
  }));
  return {
    synastry: { planets: inner, outerPlanets: outer, aspects: aspects(inner, outer, 'synastry') },
    composite: { planets: composite, outerPlanets: [], aspects: aspects(composite, composite, 'composite') },
  };
}

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
  if (subjectId === 'maya') return getServiceReading(subjectId).report;
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

export function getServiceReading(subjectId) {
  const subject = SUBJECTS.find((item) => item.id === subjectId);
  if (!subject) return null;
  if (subject.kind === 'relationship') {
    const report = makeReport(subjectId);
    const keys = ['Harmony', 'Connection', 'Passion', 'Stability', 'Growth'];
    const completeAnalysis = Object.fromEntries(report.chapters.map((chapter, index) => [keys[index], {
      synastry: { supportPanel: chapter.paragraphs[0], challengePanel: chapter.paragraphs[1], synthesisPanel: chapter.paragraphs[2] },
      ...(subjectId === 'maya-alex' ? { composite: { synthesisPanel: `For Maya and Alex, the composite ${keys[index].toLowerCase()} theme describes the relationship as its own pattern, rather than comparing two people. This illustrative interpretation invites you to notice the habits you create together.\n\nA shared routine can support the connection without asking either person to give up their individuality.` } } : {}),
    }]));
    return normalizeServiceReading({ subjectId, label: subject.label, kind: 'relationship', note: report.note, source: {
      initialOverview: `For ${subject.label}, closeness grows through everyday attention: the questions you ask, the space you give, and the care you make visible. Your differences can offer perspective without needing to become a contest.\n\nThis reading is a starting point for understanding your patterns together, not a verdict on compatibility. Notice which themes help you have a more generous conversation.`,
      completeAnalysis,
      clusterScoring: { scoredItems: Object.values(getRelationshipCharts(subjectId)).flatMap(chart => chart.aspects) },
    } });
  }
  return normalizeServiceReading({ subjectId, label: subject.label, kind: 'birthchart', note: 'Illustrative sample positions and interpretations. Houses and rising sign are not included in this sample.', source: {
    birthChart: { planets: SAMPLE_PLANETS, aspects: [{ aspectedPlanet: 'Venus', aspectingPlanet: 'Mars', aspectType: 'square', orb: 1 }] },
    basicAnalysis: { overview: 'You can be generous with your attention without giving away the space you need for yourself. In this illustrative chart, the Libra Sun brings curiosity about other people, while the Leo Moon asks for warmth that feels personal and unmistakable.\n\nVenus in Aries adds a directness to the way you connect. Saying what you enjoy, want, or need can be more helpful than waiting for someone else to read the room perfectly.' },
    broadCategoryAnalyses: {
      PERSONALITY_IDENTITY: { overview: 'Your Libra Sun describes an interest in perspective: understanding another person does not have to mean agreeing with them.', subtopics: { self_expression: { analysis: 'You may discover what you think through conversation. Give yourself permission to form a view before making it pleasing to everyone else.' } }, synthesis: 'Begin with one decision that feels recognizably yours. You can remain open to other people without making their approval the measure of your choice.' },
      EMOTIONAL_FOUNDATIONS_HOME: { overview: 'The Leo Moon gives this sample reading a theme of emotional warmth and visible appreciation.', subtopics: { emotional_needs: { analysis: 'Being noticed is not the same as needing an audience. A small gesture from someone close to you can matter more than general praise.' } }, synthesis: 'Try naming the kind of reassurance that actually helps. Specificity makes care easier to offer and receive.' },
      COMMUNICATION_BELIEFS: { overview: 'Mercury in Libra offers a language for balancing honesty with consideration.', editedSubtopics: { difficult_conversations: 'Taking time to find a fair expression can be useful. Notice when careful wording becomes a way of postponing the conversation itself.' }, synthesis: 'Ask a question that could change your mind, and make a request clear enough that someone can answer it.' },
      CAREER_PURPOSE_PUBLIC_IMAGE: { overview: 'This sample chapter explores how collaboration and independent judgment can support meaningful work.', subtopics: { working_with_others: 'You do not need to take responsibility for every perspective in a group. Offer what you see, then leave room for other people to do the same.' }, synthesis: 'Choose one contribution you can make well, rather than trying to make yourself indispensable everywhere.' },
      RELATIONSHIPS_SOCIAL: { overview: 'Venus in Aries brings a direct, exploratory quality to connection in this illustrative reading.', subtopics: { closeness_and_space: 'Honesty can be an act of care. Let someone know what you would enjoy without turning the invitation into an obligation.' }, synthesis: 'A relationship can make room for two distinct lives. Curiosity is often a better bridge than trying to become more alike.' },
      UNCONSCIOUS_SPIRITUALITY: { overview: 'Reflection gives you room to notice which expectations you have quietly adopted from other people.', subtopics: { inner_practice: 'A useful practice does not need to look impressive. An unhurried walk, a page of writing, or a little silence may be enough to hear yourself more clearly.' }, synthesis: 'Return to what helps you feel present, rather than measuring your inner life against an ideal.' },
    },
  } });
}
