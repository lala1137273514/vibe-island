import { describe, expect, it } from 'vitest'
import { getOriginalThemeSprite, getOriginalUiSprite, ORIGINAL_THEME_SPRITES } from './originalAssets'

describe('originalAssets', () => {
  it('为每种岛屿主题提供可提交的原创像素素材', () => {
    expect(Object.keys(ORIGINAL_THEME_SPRITES).sort()).toEqual(['creator', 'custom', 'desert', 'origin', 'snow'])
    expect(getOriginalThemeSprite('desert')).toBe('/original-assets/sprites/desert-emblem.svg')
    expect(getOriginalThemeSprite('custom')).toBe('/original-assets/sprites/custom-emblem.svg')
  })

  it('提供 HUD 与面板使用的原创 UI 图标', () => {
    expect(getOriginalUiSprite('coin')).toBe('/original-assets/sprites/coin.svg')
    expect(getOriginalUiSprite('trophy')).toBe('/original-assets/sprites/trophy.svg')
  })
})
