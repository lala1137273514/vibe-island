import { ACHIEVEMENTS } from '../content/achievements'
import type { SaveState } from '../content/types'

export function AchievementShelf({ save, onClose }: { save: SaveState; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pixel-panel shelf-panel" onClick={e => e.stopPropagation()}>
        <h2 className="shelf-title">🏆 成就墙</h2>
        <div className="shelf">
          {ACHIEVEMENTS.map(a => {
            const unlocked = save.achievements.includes(a.id)
            return (
              <div key={a.id} className={`trophy${unlocked ? '' : ' locked'}`}>
                <div className="trophy-icon">{unlocked ? '🏆' : '🔒'}</div>
                <div className="trophy-name">{unlocked ? a.name : '???'}</div>
                <div className="trophy-desc body-text">{a.desc}</div>
              </div>
            )
          })}
        </div>
        <div className="panel-actions">
          <button className="pixel-btn" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}
