import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import type { Line2 } from 'three-stdlib'
import { dampFactor, longitudeToPosition } from './utils'
import { ASPECT_MAX_ORB } from './constants'
import { useScenePalette } from './sceneTheme'
import type {
  Aspect,
  BodySelection,
  ChartLayer,
  Placement,
} from './types'

/** 0 (at max orb) → 1 (exact); drives opacity and thickness */
function orbStrength(aspect: Aspect): number {
  const maxOrb = ASPECT_MAX_ORB[aspect.type]
  return Math.min(1, Math.max(0, 1 - aspect.orb / maxOrb))
}

function aspectTargetOpacity(
  aspect: Aspect,
  visible: boolean,
  emphasized: boolean,
  focusMode: boolean,
  involved: boolean,
  highlightMode: boolean,
  highlighted: boolean,
): number {
  const strength = orbStrength(aspect)
  const baseOpacity = emphasized ? 0.35 + strength * 0.6 : 0.12 + strength * 0.55
  return !visible
    ? 0
    : focusMode
      ? involved
        ? Math.min(0.95, baseOpacity + 0.3)
        : 0.04
      : highlightMode
        ? highlighted
          ? Math.min(0.95, baseOpacity + 0.3)
          : 0.05
        : baseOpacity
}

interface Endpoint {
  placement: Placement
  radius: number
}

interface AspectLineProps {
  aspect: Aspect
  from: Endpoint
  to: Endpoint
  visible: boolean
  /** inter-chart (synastry) lines render brighter with additive glow */
  emphasized: boolean
  /** a selection exists somewhere in the scene */
  focusMode: boolean
  /** this line touches the selected body */
  involved: boolean
  /** external highlight set exists (chapter emphasis) */
  highlightMode: boolean
  /** both endpoints are in the external highlight set */
  highlighted: boolean
  onSelect?: (aspect: Aspect) => void
  onHover?: (aspect: Aspect | null) => void
}

function AspectLine({
  aspect,
  from,
  to,
  visible,
  emphasized,
  focusMode,
  involved,
  highlightMode,
  highlighted,
  onSelect,
  onHover,
}: AspectLineProps) {
  const palette = useScenePalette()
  const lineRef = useRef<Line2>(null)

  const strength = orbStrength(aspect)
  const targetOpacity = aspectTargetOpacity(
    aspect,
    visible,
    emphasized,
    focusMode,
    involved,
    highlightMode,
    highlighted,
  )

  const points = useMemo(
    () => [
      longitudeToPosition(from.placement.longitude, from.radius),
      longitudeToPosition(to.placement.longitude, to.radius),
    ],
    [from.placement.longitude, from.radius, to.placement.longitude, to.radius],
  )

  // opacity is animated here, so mode toggles fade rather than pop
  const initialOpacity = useRef(targetOpacity)
  useFrame((_, delta) => {
    const mat = lineRef.current?.material
    if (mat) mat.opacity += (targetOpacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <Line
      ref={lineRef}
      points={points}
      color={palette.aspectColor(aspect.type)}
      lineWidth={(emphasized ? 1.5 : 1) + strength * (emphasized ? 2.5 : 2)}
      transparent
      opacity={initialOpacity.current}
      depthWrite={false}
      blending={THREE.NormalBlending}
      onClick={onSelect ? (event) => {
        event.stopPropagation()
        onSelect(aspect)
      } : undefined}
      onPointerOver={onHover ? () => onHover(aspect) : undefined}
      onPointerOut={onHover ? () => onHover(null) : undefined}
    />
  )
}

interface AspectLeaderLineProps {
  from: THREE.Vector3
  to: THREE.Vector3
  targetOpacity: number
}

/** Dashed radial connector from an outer body to the shared aspect circle. */
function AspectLeaderLine({ from, to, targetOpacity }: AspectLeaderLineProps) {
  const palette = useScenePalette()
  const lineRef = useRef<Line2>(null)
  const initialOpacity = useRef(0)

  useFrame((_, delta) => {
    const mat = lineRef.current?.material
    if (mat) mat.opacity += (targetOpacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={palette.leader}
      lineWidth={1}
      dashed
      dashSize={0.12}
      gapSize={0.09}
      transparent
      opacity={initialOpacity.current}
      depthWrite={false}
    />
  )
}

interface AspectEndpointDotProps {
  position: THREE.Vector3
  targetOpacity: number
}

/** Small filled dot anchoring a chord endpoint on the shared aspect circle. */
function AspectEndpointDot({ position, targetOpacity }: AspectEndpointDotProps) {
  const palette = useScenePalette()
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((_, delta) => {
    const mat = materialRef.current
    if (mat) mat.opacity += (targetOpacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[palette.endpointDotRadius, 20]} />
      <meshBasicMaterial
        ref={materialRef}
        color={palette.endpointDot}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  )
}

interface ResolvedAspect {
  aspect: Aspect
  layerA: ChartLayer
  layerB: ChartLayer
  from: Endpoint
  to: Endpoint
  involved: boolean
  highlighted: boolean
  key: string
}

interface LayerDef {
  placements: Placement[]
  radius: number
}

interface AspectLinesProps {
  aspects: Aspect[]
  natal: LayerDef
  secondary?: LayerDef
  /** layer assumed when an aspect omits layerA/layerB */
  defaultLayers?: [ChartLayer, ChartLayer]
  visible: boolean
  emphasized?: boolean
  /** project secondary endpoints onto natal's aspect circle and connect them */
  projectSecondaryOntoNatal?: boolean
  /** selected body; lines touching it boost, the rest fade back */
  focus?: BodySelection | null
  /** external emphasis set; lines between highlighted bodies boost */
  highlightBodies?: string[]
  /** only render aspects touching one body, or connecting a supplied pair */
  isolateBodies?: string[]
  onSelectAspect?: (aspect: Aspect) => void
  onHoverAspect?: (aspect: Aspect | null) => void
}

/**
 * Aspect lines: color-coded by type, opacity/thickness scaled by orb
 * tightness. Endpoints resolve through chart layers so the same
 * component draws natal-only webs and inter-chart (synastry) lines.
 * Faded out in heliocentric mode — these are geocentric angles.
 */
export function AspectLines({
  aspects,
  natal,
  secondary,
  defaultLayers = ['natal', 'natal'],
  visible,
  emphasized = false,
  projectSecondaryOntoNatal = false,
  focus = null,
  highlightBodies,
  isolateBodies,
  onSelectAspect,
  onHoverAspect,
}: AspectLinesProps) {
  const palette = useScenePalette()
  const highlightSet = useMemo(
    () => (highlightBodies?.length ? new Set(highlightBodies) : null),
    [highlightBodies],
  )

  const isolateSet = useMemo(
    () => (isolateBodies?.length ? new Set(isolateBodies) : null),
    [isolateBodies],
  )

  const byLayer = useMemo(() => {
    const index = (layer?: LayerDef) =>
      new Map((layer?.placements ?? []).map((p) => [p.body, p]))
    return {
      natal: { byBody: index(natal), radius: natal.radius },
      secondary: { byBody: index(secondary), radius: secondary?.radius ?? 0 },
    }
  }, [natal, secondary])

  const resolve = (body: string, layer: ChartLayer): Endpoint | null => {
    const { byBody, radius } = byLayer[layer]
    const placement = byBody.get(body)
    return placement ? { placement, radius } : null
  }

  const resolvedAspects: ResolvedAspect[] = []
  for (const aspect of aspects) {
    if (
      isolateSet &&
      (isolateSet.size === 1
        ? !isolateSet.has(aspect.bodyA) && !isolateSet.has(aspect.bodyB)
        : !isolateSet.has(aspect.bodyA) || !isolateSet.has(aspect.bodyB))
    ) {
      continue
    }
    const layerA = aspect.layerA ?? defaultLayers[0]
    const layerB = aspect.layerB ?? defaultLayers[1]
    const resolvedFrom = resolve(aspect.bodyA, layerA)
    const resolvedTo = resolve(aspect.bodyB, layerB)
    if (!resolvedFrom || !resolvedTo) continue
    const involved =
      !!focus &&
      ((focus.layer === layerA && focus.body === aspect.bodyA) ||
        (focus.layer === layerB && focus.body === aspect.bodyB))
    // group emphasis boosts lines *within* the group; a single-body
    // emphasis boosts that body's whole web
    const highlighted =
      !!highlightSet &&
      (highlightSet.size === 1
        ? highlightSet.has(aspect.bodyA) || highlightSet.has(aspect.bodyB)
        : highlightSet.has(aspect.bodyA) && highlightSet.has(aspect.bodyB))
    const project = (endpoint: Endpoint, layer: ChartLayer): Endpoint =>
      projectSecondaryOntoNatal && layer === 'secondary'
        ? { ...endpoint, radius: natal.radius }
        : endpoint
    resolvedAspects.push({
      aspect,
      layerA,
      layerB,
      from: project(resolvedFrom, layerA),
      to: project(resolvedTo, layerB),
      involved,
      highlighted,
      key: `${layerA}:${aspect.bodyA}-${aspect.type}-${layerB}:${aspect.bodyB}`,
    })
  }

  const leaderByBody = new Map<string, { longitude: number; opacity: number }>()
  const dotByBody = new Map<string, { longitude: number; opacity: number }>()
  if (projectSecondaryOntoNatal) {
    for (const line of resolvedAspects) {
      const targetOpacity = aspectTargetOpacity(
        line.aspect,
        visible,
        emphasized,
        !!focus,
        line.involved,
        !!highlightSet,
        line.highlighted,
      )
      const endpoints: Array<[string, ChartLayer, Endpoint]> = [
        [line.aspect.bodyA, line.layerA, line.from],
        [line.aspect.bodyB, line.layerB, line.to],
      ]
      for (const [body, layer, endpoint] of endpoints) {
        const dotKey = `${layer}:${body}`
        const dot = dotByBody.get(dotKey)
        if (!dot || targetOpacity > dot.opacity) {
          dotByBody.set(dotKey, {
            longitude: endpoint.placement.longitude,
            opacity: targetOpacity,
          })
        }
        if (layer === 'secondary') {
          const leader = leaderByBody.get(body)
          if (!leader || targetOpacity > leader.opacity) {
            leaderByBody.set(body, {
              longitude: endpoint.placement.longitude,
              opacity: targetOpacity,
            })
          }
        }
      }
    }
  }

  return (
    <group>
      {resolvedAspects.map((line) => (
        <AspectLine
          key={line.key}
          aspect={line.aspect}
          from={line.from}
          to={line.to}
          visible={visible}
          emphasized={emphasized}
          focusMode={!!focus}
          involved={line.involved}
          highlightMode={!!highlightSet}
          highlighted={line.highlighted}
          onSelect={onSelectAspect}
          onHover={onHoverAspect}
        />
      ))}
      {secondary && [...leaderByBody.entries()].map(([body, leader]) => (
        <AspectLeaderLine
          key={`leader-${body}`}
          from={longitudeToPosition(leader.longitude, secondary.radius - 0.15)}
          to={longitudeToPosition(leader.longitude, natal.radius)}
          targetOpacity={leader.opacity * palette.leaderOpacity}
        />
      ))}
      {[...dotByBody.entries()].map(([key, dot]) => (
        <AspectEndpointDot
          key={`dot-${key}`}
          position={longitudeToPosition(dot.longitude, natal.radius, 0.02)}
          targetOpacity={Math.min(1, dot.opacity * 1.1)}
        />
      ))}
    </group>
  )
}
