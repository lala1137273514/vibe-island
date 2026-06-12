import { describe, expect, it, vi } from 'vitest'
import {
  getIslandProps,
  getIslandSprite,
  getLocalDecorSprite,
  loadLocalAssetPack,
  normalizeLocalAssetPack,
  normalizeLocalIslandProps,
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

  it('允许 manifest 把本地素材作为岛面装饰挂件', () => {
    const pack = normalizeLocalAssetPack({
      sprites: {
        props: {
          themes: {
            origin: [
              { id: 'tree', src: 'props/tree.png', position: [1, 4.8, -2], width: 72 },
              { src: '/bad.png', position: [0, 0, 0], width: 72 },
            ],
          },
          islands: {
            origin: [
              { id: 'barn', src: 'props/barn.png', position: [-2, 5.2, 0], width: 92 },
            ],
          },
        },
      },
    })
    expect(getIslandProps(pack, 'origin', 'origin')).toEqual([
      { id: 'barn', src: '/local-assets/props/barn.png', position: [-2, 5.2, 0], width: 92 },
    ])
    expect(getIslandProps(pack, 'sea2-island1', 'origin')).toEqual([
      { id: 'tree', src: '/local-assets/props/tree.png', position: [1, 4.8, -2], width: 72 },
    ])
  })

  it('过滤尺寸或坐标不合法的岛面装饰挂件', () => {
    expect(normalizeLocalIslandProps([
      { src: 'props/too-big.png', position: [0, 0, 0], width: 260 },
      { src: 'props/no-position.png', width: 72 },
      { src: 'props/good.png', position: [0, 4, 1], width: 72 },
    ])).toEqual([
      { id: 'prop-3', src: '/local-assets/props/good.png', position: [0, 4, 1], width: 72 },
    ])
  })

  it('把 Vite HTML 回退识别为未启用', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<!doctype html>', { status: 200 })))
    await expect(loadLocalAssetPack()).resolves.toMatchObject({ status: 'missing' })
    vi.unstubAllGlobals()
  })
})
