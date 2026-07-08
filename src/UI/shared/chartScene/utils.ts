import * as THREE from 'three'

/**
 * Map an ecliptic longitude to an angle on the wheel.
 * 0° Aries sits at +X; longitude increases counterclockwise
 * when viewed from above (+Y), matching a standard chart wheel.
 */
export function longitudeToAngle(longitude: number): number {
  return THREE.MathUtils.degToRad(longitude)
}

/** Position on the wheel (ecliptic = XZ plane, +Y up). */
export function longitudeToPosition(
  longitude: number,
  radius: number,
  y = 0,
): THREE.Vector3 {
  const theta = longitudeToAngle(longitude)
  return new THREE.Vector3(
    Math.cos(theta) * radius,
    y,
    -Math.sin(theta) * radius,
  )
}

/**
 * Frame-rate-independent smoothing factor for `a += (target - a) * f`.
 * Converges on wall-clock time, so a tab that was backgrounded (rAF
 * paused) snaps to its settled state on the next frame instead of
 * resuming a half-finished transition.
 */
export function dampFactor(delta: number, lambda = 5): number {
  return 1 - Math.exp(-lambda * delta)
}

/**
 * Interpolate between two longitudes along the shorter arc, so a body
 * crossing 360°→0° animates through the boundary instead of sweeping
 * backwards around the whole wheel.
 */
export function lerpAngle(a: number, b: number, t: number): number {
  const delta = ((b - a + 540) % 360) - 180
  return (((a + delta * t) % 360) + 360) % 360
}

/**
 * Locate `timeMs` inside an ascending list of frame timestamps.
 * Returns the lower frame index and the 0–1 fraction toward the next;
 * clamps outside the range.
 */
export function frameSpan(
  times: number[],
  timeMs: number,
): { index: number; frac: number } {
  if (times.length < 2 || timeMs <= times[0]) return { index: 0, frac: 0 }
  const last = times.length - 1
  if (timeMs >= times[last]) return { index: last - 1, frac: 1 }
  let lo = 0
  let hi = last
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (times[mid] <= timeMs) lo = mid
    else hi = mid
  }
  return { index: lo, frac: (timeMs - times[lo]) / (times[hi] - times[lo]) }
}

/**
 * De-clutter clustered placements (a stellium) for display: bodies
 * closer together than `minSepDeg` fan out evenly around their
 * cluster's center, preserving zodiacal order. Returns new placements
 * with adjusted longitudes — display-only; callers keep the true
 * longitudes for anything semantic.
 */
export function spreadPlacements<T extends { longitude: number }>(
  placements: T[],
  minSepDeg = 5,
): T[] {
  if (placements.length < 2) return placements
  const norm = (d: number) => ((d % 360) + 360) % 360
  const sorted = placements
    .map((p, i) => ({ p, i, lon: norm(p.longitude) }))
    .sort((a, b) => a.lon - b.lon)

  // group consecutive bodies with gaps under minSep (wrap-aware)
  const clusters: (typeof sorted)[] = [[sorted[0]]]
  for (let k = 1; k < sorted.length; k++) {
    const prev = sorted[k - 1]
    if (sorted[k].lon - prev.lon < minSepDeg) {
      clusters[clusters.length - 1].push(sorted[k])
    } else {
      clusters.push([sorted[k]])
    }
  }
  // wrap-around: last cluster may continue into the first
  if (clusters.length > 1) {
    const first = clusters[0]
    const last = clusters[clusters.length - 1]
    const wrapGap = first[0].lon + 360 - last[last.length - 1].lon
    if (wrapGap < minSepDeg) {
      clusters.pop()
      clusters[0] = [...last, ...first]
    }
  }

  const out = placements.slice()
  clusters.forEach((cluster) => {
    if (cluster.length < 2) return
    // circular mean of the cluster, unwrapped relative to its first member
    const base = cluster[0].lon
    const unwrapped = cluster.map((m) => base + norm(m.lon - base))
    const center = unwrapped.reduce((s, v) => s + v, 0) / cluster.length
    cluster.forEach((m, idx) => {
      const display = center + (idx - (cluster.length - 1) / 2) * minSepDeg
      out[m.i] = { ...m.p, longitude: norm(display) }
    })
  })
  return out
}

/** Points approximating a circle of `radius` on the ecliptic plane. */
export function circlePoints(radius: number, segments = 128): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, -Math.sin(theta) * radius))
  }
  return pts
}
