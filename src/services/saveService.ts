// 存档服务接口:本期 Local 实现;Phase B 增加 Supabase 实现,UI 零改动。
import type { IslandDef, SaveState } from '../content/types'

export interface CustomIslandItem {
  def: IslandDef
  seed: number
  palette: string
  createdAt: string
}

export interface SaveService {
  loadSave(islandId: string): SaveState | null
  persistSave(islandId: string, s: SaveState): void
  clearSave(islandId: string): void
  listCustomIslands(): CustomIslandItem[]
  saveCustomIsland(item: CustomIslandItem): void
  deleteCustomIsland(islandId: string): void
}

const LEGACY_KEY = 'vibe-islands-save'      // 1.0 起源岛存档 key,保持兼容
const CUSTOM_KEY = 'vibe-islands-custom'
const keyFor = (islandId: string) =>
  islandId === 'origin' ? LEGACY_KEY : `vibe-islands-save:${islandId}`

export class LocalSaveService implements SaveService {
  loadSave(islandId: string): SaveState | null {
    try {
      const r = localStorage.getItem(keyFor(islandId))
      return r ? JSON.parse(r) as SaveState : null
    } catch { return null }
  }
  persistSave(islandId: string, s: SaveState) {
    try { localStorage.setItem(keyFor(islandId), JSON.stringify(s)) } catch { /* 存储不可用时静默跳过 */ }
  }
  clearSave(islandId: string) {
    try { localStorage.removeItem(keyFor(islandId)) } catch { /* 同上 */ }
  }
  listCustomIslands(): CustomIslandItem[] {
    try {
      const r = localStorage.getItem(CUSTOM_KEY)
      return r ? JSON.parse(r) as CustomIslandItem[] : []
    } catch { return [] }
  }
  saveCustomIsland(item: CustomIslandItem) {
    const rest = this.listCustomIslands().filter(i => i.def.id !== item.def.id)
    localStorage.setItem(CUSTOM_KEY, JSON.stringify([...rest, item]))
  }
  deleteCustomIsland(islandId: string) {
    const rest = this.listCustomIslands().filter(i => i.def.id !== islandId)
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(rest))
    this.clearSave(islandId)
  }
}

export const saveService: SaveService = new LocalSaveService()
