// Maps backend birth-chart data to the props contract of the 3D
// <ChartScene /> component (src/UI/shared/chartScene). The component is
// calculation-free and portable; this adapter is the only place that
// knows about backend field names.

const BODY_NAME_MAP = {
  Sun: 'sun',
  Moon: 'moon',
  Mercury: 'mercury',
  Venus: 'venus',
  Mars: 'mars',
  Jupiter: 'jupiter',
  Saturn: 'saturn',
  Uranus: 'uranus',
  Neptune: 'neptune',
  Pluto: 'pluto',
  Ascendant: 'asc',
  Midheaven: 'mc',
  // Node / Chiron / South Node have no marker in the 3D scene (yet) and
  // are intentionally dropped here.
};

const SUPPORTED_ASPECT_TYPES = new Set([
  'conjunction',
  'sextile',
  'square',
  'trine',
  'opposition',
]);

/** backend body names ("Sun", "Ascendant"…) → scene names; unmapped dropped */
export function toSceneBodyNames(names) {
  if (!names || !names.length) return undefined;
  const mapped = names.map((n) => BODY_NAME_MAP[n]).filter(Boolean);
  return mapped.length ? mapped : undefined;
}

/** birthChart.planets → Placement[] ({ body, longitude, retrograde }) */
export function toChartScenePlacements(planets = []) {
  return planets
    .map((p) => {
      const body = BODY_NAME_MAP[p.name];
      const longitude = Number(p.full_degree);
      if (!body || !Number.isFinite(longitude)) return null;
      return {
        body,
        longitude,
        // backend serializes is_retro as the string "true"/"false"
        retrograde: p.is_retro === true || p.is_retro === 'true',
      };
    })
    .filter(Boolean);
}

/** birthChart.aspects → Aspect[] ({ bodyA, bodyB, type, orb }) */
export function toChartSceneAspects(aspects = []) {
  return aspects
    .map((a) => {
      const bodyA = BODY_NAME_MAP[a.aspectingPlanet];
      const bodyB = BODY_NAME_MAP[a.aspectedPlanet];
      const type = String(a.aspectType || '').toLowerCase();
      const orb = Number(a.orb);
      // quincunx & friends aren't drawn by the scene; drop them here
      if (!bodyA || !bodyB || !SUPPORTED_ASPECT_TYPES.has(type) || !Number.isFinite(orb)) {
        return null;
      }
      return { bodyA, bodyB, type, orb };
    })
    .filter(Boolean);
}
