import { createContext, useContext } from 'react'
import type { AspectType } from './types'

/**
 * Scene-wide ink palette. The provider must sit INSIDE the r3f <Canvas> —
 * React context does not bridge across renderers on its own.
 */
export type SceneThemeMode = 'ink'

const INK = '#39445a'

const INK_ASPECT_COLORS: Record<AspectType, string> = {
  conjunction: '#a8863c',
  opposition: '#b24a3a',
  square: '#b24a3a',
  trine: '#3437a8',
  sextile: '#3437a8',
}

export interface ScenePalette {
  mode: SceneThemeMode
  signColor: (base: string) => string
  bodyColor: (base: string) => string
  angleColor: (base: string) => string
  aspectColor: (type: AspectType) => string
  edge: string
  divider: string
  tick: string
  neutralGlyph: string
  band: string
  bandOpacity: number
  ring: string
  retro: string
  /** dashed radial connector from a transiting body to the aspect circle */
  leader: string
  leaderOpacity: number
  /** chord endpoint dots on the shared aspect circle */
  endpointDot: string
  endpointDotRadius: number
  light: string
}

export const SCENE_PALETTE: ScenePalette = {
  mode: 'ink',
  signColor: () => INK,
  bodyColor: () => INK,
  angleColor: () => INK,
  aspectColor: (type) => INK_ASPECT_COLORS[type],
  edge: '#39445a',
  divider: '#6a7183',
  tick: '#8b90a0',
  neutralGlyph: INK,
  band: '#ede4d3',
  bandOpacity: 0.9,
  ring: '#5b657d',
  retro: '#b24a3a',
  leader: '#39445a',
  leaderOpacity: 0.45,
  endpointDot: '#39445a',
  endpointDotRadius: 0.05,
  light: '#ffffff',
}

const SceneThemeContext = createContext<ScenePalette>(SCENE_PALETTE)

export const SceneThemeProvider = SceneThemeContext.Provider

export function useScenePalette(): ScenePalette {
  return useContext(SceneThemeContext)
}
