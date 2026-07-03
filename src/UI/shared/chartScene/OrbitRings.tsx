import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { circlePoints, dampFactor } from './utils'

const RING_COLOR = '#5a5aa8'
const RING_OPACITY = 0.28

interface OrbitRingsProps {
  radii: number[]
  visible: boolean
}

/**
 * Faint concentric orbit rings for "orbits" mode. Kept mounted in both
 * modes and cross-faded, so toggling animates instead of popping.
 */
export function OrbitRings({ radii, visible }: OrbitRingsProps) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null)

  const geometry = useMemo(() => {
    const positions: number[] = []
    for (const radius of radii) {
      const pts = circlePoints(radius, 96)
      for (let i = 0; i < pts.length - 1; i++) {
        positions.push(pts[i].x, pts[i].y, pts[i].z)
        positions.push(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [radii])

  useFrame((_, delta) => {
    const mat = materialRef.current
    if (!mat) return
    const targetOpacity = visible ? RING_OPACITY : 0
    mat.opacity += (targetOpacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color={RING_COLOR}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </lineSegments>
  )
}
