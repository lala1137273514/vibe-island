import type { IslandTheme } from '../engine3d/islandThemes'

const BASE = '/original-assets/'

const asset = (path: string) => `${BASE}${path}`

export const ORIGINAL_THEME_SPRITES: Record<IslandTheme, string> = {
  origin: asset('sprites/origin-emblem.svg'),
  desert: asset('sprites/desert-emblem.svg'),
  snow: asset('sprites/snow-emblem.svg'),
  creator: asset('sprites/creator-emblem.svg'),
  custom: asset('sprites/custom-emblem.svg'),
}

export const ORIGINAL_UI_SPRITES = {
  coin: asset('sprites/coin.svg'),
  star: asset('sprites/starfruit.svg'),
  trophy: asset('sprites/trophy.svg'),
  gear: asset('sprites/gear.svg'),
  panelCorner: asset('sprites/wood-panel-corner.svg'),
} as const

export type OriginalUiSprite = keyof typeof ORIGINAL_UI_SPRITES

export function getOriginalThemeSprite(theme: IslandTheme) {
  return ORIGINAL_THEME_SPRITES[theme]
}

export function getOriginalUiSprite(sprite: OriginalUiSprite) {
  return ORIGINAL_UI_SPRITES[sprite]
}
