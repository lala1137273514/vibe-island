import type { SaveState } from '../content/types'
import { ORIGIN_ISLAND } from '../content/stage1'

export function HUD({ save, onToggleShelf }: { save: SaveState; onToggleShelf: () => void }) {
  const mains = ORIGIN_ISLAND.nodes.filter(n => n.kind === 'main')
  const done = mains.filter(n => save.nodeStatus[n.id] === 'done').length
  return (
    <div className="hud">
      <span>🪙 {save.coins}</span>
      <span>⭐ {save.stars}</span>
      <span>起源岛 {done}/{mains.length}</span>
      <div className="progressbar" aria-label="起源岛进度">
        <div style={{ width: `${(done / mains.length) * 100}%` }} />
      </div>
      <div className="spacer" />
      <button className="pixel-btn hud-btn" onClick={onToggleShelf}>🏆 成就</button>
    </div>
  )
}
