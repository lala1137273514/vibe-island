// 程序化体素浮空岛生成器:纯函数、确定性(同 seed 同输出)、零素材依赖。
// 配色取自设计系统 tokens(星露谷暖调),保证 2D/3D 同一色温。
import { createNoise2D } from 'simplex-noise'

export interface Voxel { x: number; y: number; z: number; color: string }
export interface IslandMesh {
  voxels: Voxel[]
  surfaceY: (x: number, z: number) => number
  radius: number
}
export interface IslandGenOptions {
  seed: number
  radius?: number
  decor?: boolean
  topColor?: string     // palette:岛面顶色(默认草绿)
}

const C = {
  grass: '#5fa64d', grassDark: '#3a7a2c', dirt: '#8a5a3c',
  stone: '#7a7a72', sand: '#e6c47a', wood: '#6b4226', flower: '#f2c14e',
}

// 确定性 PRNG
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateIsland(opts: IslandGenOptions): IslandMesh {
  const radius = opts.radius ?? 8
  const topColor = opts.topColor ?? C.grass
  const rng = mulberry32(opts.seed)
  const noise2D = createNoise2D(rng)
  const voxels: Voxel[] = []
  const surface = new Map<string, number>()
  const grassCols: { x: number; z: number; y: number }[] = []

  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      const r = Math.hypot(x, z)
      const falloff = 1 - (r / radius) ** 2
      if (falloff <= 0) continue
      const n = noise2D(x * 0.18, z * 0.18)
      const h = Math.max(1, Math.round((1.6 + n * 1.1) * falloff * 1.8))
      const sandy = r / radius > 0.72 && rng() < 0.55
      for (let y = 0; y <= h; y++) {
        let color = C.stone
        if (y === h) color = sandy ? C.sand : topColor
        else if (y >= h - 2) color = C.dirt
        voxels.push({ x, y, z, color })
      }
      surface.set(`${x},${z}`, h)
      if (!sandy) grassCols.push({ x, z, y: h })
      // 浮空岛底部倒锥(岩石,向中心越深)
      const depth = Math.round(falloff * radius * 0.85)
      for (let y = -1; y >= -depth; y--) voxels.push({ x, y, z, color: C.stone })
    }
  }

  if (opts.decor) {
    const decorRng = mulberry32(opts.seed ^ 0x9e3779b9)
    // 树:挑非边缘草地列,树干 2 格 + 3×3×2 树冠
    const treeCols = grassCols.filter(c => Math.hypot(c.x, c.z) < radius * 0.6)
    const treeCount = Math.max(1, Math.round(radius / 3))
    for (let t = 0; t < treeCount && treeCols.length; t++) {
      const col = treeCols.splice(Math.floor(decorRng() * treeCols.length), 1)[0]
      const base = col.y + 1
      voxels.push({ x: col.x, y: base, z: col.z, color: C.wood })
      voxels.push({ x: col.x, y: base + 1, z: col.z, color: C.wood })
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (let dy = 0; dy <= 1; dy++) {
            if (dy === 1 && Math.abs(dx) + Math.abs(dz) === 2) continue
            voxels.push({ x: col.x + dx, y: base + 2 + dy, z: col.z + dz, color: C.grassDark })
          }
        }
      }
    }
    // 花/小石头点缀
    for (const col of grassCols) {
      const roll = decorRng()
      if (roll < 0.05) voxels.push({ x: col.x, y: col.y + 1, z: col.z, color: C.flower })
      else if (roll < 0.08) voxels.push({ x: col.x, y: col.y + 1, z: col.z, color: C.stone })
    }
  }

  return { voxels, surfaceY: (x, z) => surface.get(`${x},${z}`) ?? 0, radius }
}
