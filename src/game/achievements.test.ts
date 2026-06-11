import { it, expect } from 'vitest'
import { earnedAchievements } from './gameLogic'
import { ACHIEVEMENTS } from './achievements'
import type { SaveState } from '../content/types'

const base: SaveState = { version:1, nodeStatus:{}, achievements:[], coins:0, stars:0,
  unlockedIslands:['origin'], openedTreasures:[] }

it('开1宝箱 → 寻宝者;新解锁不含已有', () => {
  const s = { ...base, openedTreasures:['t1'] }
  const ids = earnedAchievements(s, ACHIEVEMENTS)
  expect(ids).toContain('treasure-hunter')
})
it('3关满分 → 满分学霸', () => {
  const s = { ...base, stars:3 }
  expect(earnedAchievements(s, ACHIEVEMENTS)).toContain('perfect-scholar')
})
it('已在 achievements 里的不再返回', () => {
  const s = { ...base, stars:3, achievements:['perfect-scholar'] }
  expect(earnedAchievements(s, ACHIEVEMENTS)).not.toContain('perfect-scholar')
})
