import { describe, expect, it, vi } from 'vitest'
import {
  getIslandSprite,
  getLocalDecorSprite,
  loadLocalAssetPack,
  normalizeLocalAssetPack,
  toLocalAssetUrl,
} from './localAssetPack'

describe('localAssetPack', () => {
  it('只允许 local-assets 下的相对路径', () => {
    expect(toLocalAssetUrl('sprites/origin.png')).toBe('/local-assets/sprites/origin.png')
    expect(toLocalAssetUrl('sprites\\origin.png')).toBe('/local-assets/sprites/origin.png')
    expect(toLocalAssetUrl('../secret.png')).toBeNull()
    expect(toLocalAssetUrl('/absolute.png')).toBeNull()
    expect(toLocalAssetUrl('https://example.com/a.png')).toBeNull()
  })

  it('按 island 覆盖 theme 映射', () => {
    const pack = normalizeLocalAssetPack({
      name: '本机包',
      sprites: {
        themes: { origin: 'themes/origin.png' },
        islands: { origin: 'islands/origin-special.png' },
      },
    })
    expect(getIslandSprite(pack, 'origin', 'origin')).toBe('/local-assets/islands/origin-special.png')
    expect(getIslandSprite(pack, 'sea2-island1', 'origin')).toBe('/local-assets/themes/origin.png')
  })

  it('允许 manifest 提供页面装饰图', () => {
    const pack = normalizeLocalAssetPack({
      sprites: {
        decor: {
          day: 'decor/day.png',
          lantern: '../bad.png',
        },
      },
    })
    expect(getLocalDecorSprite(pack, 'day')).toBe('/local-assets/decor/day.png')
    expect(getLocalDecorSprite(pack, 'lantern')).toBeNull()
  })

  it('把 Vite HTML 回退识别为未启用', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<!doctype html>', { status: 200 })))
    await expect(loadLocalAssetPack()).resolves.toMatchObject({ status: 'missing' })
    vi.unstubAllGlobals()
  })
})
