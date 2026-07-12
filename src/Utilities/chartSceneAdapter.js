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
  Node: 'node',
  'North Node': 'node',
  'True Node': 'node',
  Ascendant: 'asc',
  Midheaven: 'mc',
  // Chiron / South Node have no marker in the 3D scene yet.
};

const SUPPORTED_ASPECT_TYPES = new Set([
  'conjunction',
  'sextile',
  'square',
  'trine',
  'opposition',
]);

// Transit orbs run tighter than natal ones (matches backend practice).
const TRANSIT_ASPECTS = [
  { type: 'conjunction', angle: 0, maxOrb: 6 },
  { type: 'sextile', angle: 60, maxOrb: 3 },
  { type: 'square', angle: 90, maxOrb: 5 },
  { type: 'trine', angle: 120, maxOrb: 5 },
  { type: 'opposition', angle: 180, maxOrb: 6 },
];

/**
 * /getTransitFrames snapshots + natal planets → TransitFrame[] for the
 * 3D scene. Per-frame transit→natal aspect matching happens here (plain
 * arithmetic on supplied longitudes, same as utils/patternHelpers) so
 * the scene component stays calculation-free.
 */
export function toTransitFrames(frameDocs = [], natalPlanets = []) {
  const natal = (natalPlanets || [])
    .map((p) => ({ body: BODY_NAME_MAP[p.name], lon: Number(p.full_degree) }))
    .filter(
      (n) => n.body && n.body !== 'asc' && n.body !== 'mc' && Number.isFinite(n.lon)
    );

  return frameDocs
    .map((doc) => {
      const placements = (doc.planets || [])
        .map((t) => {
          const body = BODY_NAME_MAP[t.name];
          const longitude = Number(t.lon);
          if (!body || !Number.isFinite(longitude)) return null;
          return { body, longitude, retrograde: Number(t.speed) < 0 };
        })
        .filter(Boolean);

      const aspects = [];
      placements.forEach((t) => {
        natal.forEach((n) => {
          let sep = Math.abs(t.longitude - n.lon) % 360;
          if (sep > 180) sep = 360 - sep;
          let best = null;
          for (const a of TRANSIT_ASPECTS) {
            const orb = Math.abs(sep - a.angle);
            if (orb <= a.maxOrb && (!best || orb < best.orb)) {
              best = { type: a.type, orb };
            }
          }
          if (best) {
            aspects.push({
              bodyA: t.body,
              bodyB: n.body,
              type: best.type,
              orb: best.orb,
              layerA: 'secondary',
              layerB: 'natal',
            });
          }
        });
      });

      const date = new Date(doc.date);
      if (Number.isNaN(date.getTime()) || placements.length === 0) return null;
      return { date: date.toISOString(), placements, aspects };
    })
    .filter(Boolean);
}



/**
 * relationship.synastryAspects → cross-chart Aspect[] for the scene.
 * planet1/aspectedPlanet side = user A (natal layer, outer ring);
 * planet2/aspectingPlanet side = user B (secondary layer, inner ring).
 */
export function toSynastrySceneAspects(synastryAspects = []) {
  return (synastryAspects || [])
    .map((a) => {
      const nameA = a.transitingPlanet || a.aspectedPlanet || a.planet1;
      const nameB = a.aspectingPlanet || a.planet2;
      const bodyA = BODY_NAME_MAP[nameA];
      const bodyB = BODY_NAME_MAP[nameB];
      const type = String(a.aspectType || '').toLowerCase();
      const orb = Number(a.orb);
      if (!bodyA || !bodyB || !SUPPORTED_ASPECT_TYPES.has(type) || !Number.isFinite(orb)) {
        return null;
      }
      return { bodyA, bodyB, type, orb, layerA: 'natal', layerB: 'secondary' };
    })
    .filter(Boolean);
}

/** scene body name ("sun") → backend name ("Sun"); null if unmapped */
export function fromSceneBodyName(sceneName) {
  for (const [backend, scene] of Object.entries(BODY_NAME_MAP)) {
    if (scene === sceneName) return backend;
  }
  return null;
}

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
