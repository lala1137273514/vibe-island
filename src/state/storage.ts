import type { SaveState } from '../content/types'
const KEY = 'vibe-islands-save'
export function loadSave(): SaveState | null {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) as SaveState : null }
  catch { return null }
}
export function persist(s: SaveState) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* 存储不可用时静默跳过 */ } }
export function clearSave() { try { localStorage.removeItem(KEY) } catch { /* 同上 */ } }
