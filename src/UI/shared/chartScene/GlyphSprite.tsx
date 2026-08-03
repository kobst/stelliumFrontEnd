import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { dampFactor } from './utils'

/**
 * Astrological glyphs (♈ ☉ ♄ …) aren't in the fonts drei's <Text> ships
 * with, so glyphs are rasterized to a canvas texture using system fonts and
 * rendered as sprites — which also gives billboarding for free.
 */

const textureCache = new Map<string, THREE.CanvasTexture>()

function getGlyphTexture(char: string, color: string): THREE.CanvasTexture {
  const key = `${char}|${color}`
  const cached = textureCache.get(key)
  if (cached) return cached

  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('GlyphSprite: could not acquire 2d canvas context')

  // U+FE0E forces text presentation — without it macOS falls back to
  // Apple Color Emoji for zodiac/planet symbols
  const text = char.length === 1 ? char + '\uFE0E' : char
  const family = `"Helvetica Neue", "Segoe UI Symbol", sans-serif`
  ctx.font = `84px ${family}`
  // shrink to fit multi-character labels like "AC" / "MC"
  const width = ctx.measureText(text).width
  if (width > size * 0.85) {
    ctx.font = `${Math.floor(84 * (size * 0.85) / width)}px ${family}`
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, size / 2, size / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  textureCache.set(key, texture)
  return texture
}

interface GlyphSpriteProps {
  char: string
  color: string
  position?: [number, number, number]
  scale?: number
  opacity?: number
}

export function GlyphSprite({
  char,
  color,
  position = [0, 0, 0],
  scale = 0.5,
  opacity = 1,
}: GlyphSpriteProps) {
  const texture = useMemo(() => getGlyphTexture(char, color), [char, color])
  const materialRef = useRef<THREE.SpriteMaterial>(null)

  // mount opacity stays fixed; the lerp below owns it afterwards, so the
  // `opacity` prop acts as an animation target rather than snapping
  const initialOpacity = useRef(opacity)
  useFrame((_, delta) => {
    const mat = materialRef.current
    if (mat) mat.opacity += (opacity - mat.opacity) * dampFactor(delta)
  })

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        ref={materialRef}
        map={texture}
        transparent
        opacity={initialOpacity.current}
        depthWrite={false}
      />
    </sprite>
  )
}
