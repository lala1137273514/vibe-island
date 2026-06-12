import { ACHIEVEMENTS } from '../game/achievements'
import type { SaveState } from '../content/types'
import { getOriginalUiSprite } from '../services/originalAssets'
import { PixelDialog, PixelButton } from '../ui'

export function AchievementShelf({ save, onClose }: { save: SaveState; onClose: () => void }) {
  return (
    <PixelDialog onClose={onClose} className="shelf-panel">
      <h2 className="shelf-title">🏆 成就墙</h2>
      <div className="shelf">
        {ACHIEVEMENTS.map(a => {
          const unlocked = save.achievements.includes(a.id)
          return (
            <div key={a.id} className={`trophy${unlocked ? '' : ' locked'}`}>
              <div className="trophy-icon">
                {unlocked && (
                  <img className="trophy-sprite" src={getOriginalUiSprite('trophy')} alt="" aria-hidden="true" draggable={false} />
                )}
                <span>{unlocked ? '🏆' : '🔒'}</span>
              </div>
              <div className="trophy-name">{unlocked ? a.name : '???'}</div>
              <div className="trophy-desc body-text">{a.desc}</div>
            </div>
          )
        })}
      </div>
      <div className="panel-actions">
        <PixelButton onClick={onClose}>关闭</PixelButton>
      </div>
    </PixelDialog>
  )
}
