import { it, expect } from 'vitest'
import { generateIsland } from './voxelGen'

it('确定性:同 seed 同输出;不同 seed 不同', () => {
  const a = generateIsland({ seed: 42, radius: 8 })
  expect(generateIsland({ seed: 42, radius: 8 }).voxels).toEqual(a.voxels)
  expect(generateIsland({ seed: 7, radius: 8 }).voxels).not.toEqual(a.voxels)
})

it('结构:体素够多;顶层为草色;底部有倒锥(y<0);surfaceY 返回岛面高度', () => {
  const isle = generateIsland({ seed: 1, radius: 8 })
  expect(isle.voxels.length).toBeGreaterThan(100)
  expect(isle.voxels.some(v => v.y < 0)).toBe(true)
  const top = isle.voxels.filter(v => v.x === 0 && v.z === 0).sort((p, q) => q.y - p.y)[0]
  expect(top.color).toBe('#5fa64d')
  expect(isle.surfaceY(0, 0)).toBe(top.y)
})

it('decor 开启时长出树叶等装饰(体素数变多)', () => {
  const plain = generateIsland({ seed: 5, radius: 8 })
  const lush = generateIsland({ seed: 5, radius: 8, decor: true })
  expect(lush.voxels.length).toBeGreaterThan(plain.voxels.length)
})

it('palette 可换岛面顶色', () => {
  const snow = generateIsland({ seed: 5, radius: 8, topColor: '#f4ecd6' })
  const top = snow.voxels.filter(v => v.x === 0 && v.z === 0).sort((p, q) => q.y - p.y)[0]
  expect(top.color).toBe('#f4ecd6')
})
