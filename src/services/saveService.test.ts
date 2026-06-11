import { it, expect, beforeEach } from 'vitest'
import { LocalSaveService } from './saveService'
import type { IslandDef, SaveState } from '../content/types'

const save: SaveState = { version: 1, nodeStatus: { a: 'done' }, achievements: [],
  coins: 42, stars: 1, unlockedIslands: ['origin'], openedTreasures: [] }

const def: IslandDef = { id: 'custom-cat', name: '猫猫岛', region: 'stage-1',
  lockedByDefault: false, nodes: [] }

beforeEach(() => localStorage.clear())

it('origin 用 legacy key(兼容 1.0 存档),其他岛用带 id 的 key', () => {
  const svc = new LocalSaveService()
  localStorage.setItem('vibe-islands-save', JSON.stringify(save))
  expect(svc.loadSave('origin')!.coins).toBe(42)
  svc.persistSave('origin', { ...save, coins: 50 })
  expect(JSON.parse(localStorage.getItem('vibe-islands-save')!).coins).toBe(50)

  svc.persistSave('custom-cat', save)
  expect(localStorage.getItem('vibe-islands-save:custom-cat')).toBeTruthy()
  expect(svc.loadSave('custom-cat')!.coins).toBe(42)
  expect(svc.loadSave('unknown')).toBeNull()
})

it('自建岛:保存/列出/按 id 覆盖/删除(删除连带进度)', () => {
  const svc = new LocalSaveService()
  const item = { def, seed: 7, palette: 'grass', createdAt: '2026-06-12' }
  svc.saveCustomIsland(item)
  expect(svc.listCustomIslands()).toHaveLength(1)
  svc.saveCustomIsland({ ...item, seed: 9 })
  expect(svc.listCustomIslands()).toHaveLength(1)
  expect(svc.listCustomIslands()[0].seed).toBe(9)
  svc.persistSave('custom-cat', save)
  svc.deleteCustomIsland('custom-cat')
  expect(svc.listCustomIslands()).toHaveLength(0)
  expect(svc.loadSave('custom-cat')).toBeNull()
})
