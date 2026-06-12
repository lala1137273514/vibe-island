import type { SaveState } from '../content/types'
import { ORIGIN_ISLAND } from '../content/stage1'
import { getOriginalUiSprite } from '../services/originalAssets'
import { PixelButton, ProgressBar } from '../ui'

export function HUD({ save, onToggleShelf, onOpenSettings }:
    { save: SaveState; onToggleShelf: () => void; onOpenSettings: () => void }) {
  const mains = ORIGIN_ISLAND.nodes.filter(n => n.kind === 'main')
  const done = mains.filter(n => save.nodeStatus[n.id] === 'done').length
  return (
    <div className="hud">
      <span className="hud-stat">
        <img className="hud-icon" src={getOriginalUiSprite('coin')} alt="" aria-hidden="true" draggable={false} />
        <span className="hud-value" aria-hidden="true">{save.coins}</span>
        <span className="sr-only-text">🪙 {save.coins}</span>
      </span>
      <span className="hud-stat">
        <img className="hud-icon" src={getOriginalUiSprite('star')} alt="" aria-hidden="true" draggable={false} />
        <span className="hud-value" aria-hidden="true">{save.stars}</span>
        <span className="sr-only-text">⭐ {save.stars}</span>
      </span>
      <span>起源岛 {done}/{mains.length}</span>
      <ProgressBar ratio={done / mains.length} label="起源岛进度" />
      <div className="spacer" />
      <PixelButton className="hud-btn icon-btn" onClick={onOpenSettings}>
        <img className="hud-btn-icon" src={getOriginalUiSprite('gear')} alt="" aria-hidden="true" draggable={false} />
        <span aria-hidden="true">设置</span>
        <span className="sr-only-text">⚙️ 设置</span>
      </PixelButton>
      <PixelButton className="hud-btn icon-btn" onClick={onToggleShelf}>
        <img className="hud-btn-icon" src={getOriginalUiSprite('trophy')} alt="" aria-hidden="true" draggable={false} />
        <span aria-hidden="true">成就</span>
        <span className="sr-only-text">🏆 成就</span>
      </PixelButton>
    </div>
  )
}
