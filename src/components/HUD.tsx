import type { SaveState } from '../content/types'
import { ORIGIN_ISLAND } from '../content/stage1'
import { PixelButton, ProgressBar } from '../ui'

export function HUD({ save, onToggleShelf, onOpenSettings }:
    { save: SaveState; onToggleShelf: () => void; onOpenSettings: () => void }) {
  const mains = ORIGIN_ISLAND.nodes.filter(n => n.kind === 'main')
  const done = mains.filter(n => save.nodeStatus[n.id] === 'done').length
  return (
    <div className="hud">
      <span>🪙 {save.coins}</span>
      <span>⭐ {save.stars}</span>
      <span>起源岛 {done}/{mains.length}</span>
      <ProgressBar ratio={done / mains.length} label="起源岛进度" />
      <div className="spacer" />
      <PixelButton className="hud-btn" onClick={onOpenSettings}>⚙️ 设置</PixelButton>
      <PixelButton className="hud-btn" onClick={onToggleShelf}>🏆 成就</PixelButton>
    </div>
  )
}
