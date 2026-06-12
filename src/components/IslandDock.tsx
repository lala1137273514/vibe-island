import { PixelButton } from '../ui'
import type { IslandTheme } from '../engine3d/islandThemes'
import { getOriginalThemeSprite } from '../services/originalAssets'
import { getIslandSprite, type LocalAssetPack } from '../services/localAssetPack'

export interface DockItem {
  id: string
  name: string
  theme: IslandTheme
  status: 'playable' | 'locked' | 'creator' | 'custom'
}

const ICON: Record<DockItem['status'], string> = {
  playable: '🏝️', locked: '🔒', creator: '⚓', custom: '✨',
}

// 大地图的 2D 等价入口:键盘可达、无 WebGL/测试环境也能完整导航
export function IslandDock({ items, assetPack, onSelect, onLockedClick }: {
  items: DockItem[]
  assetPack: LocalAssetPack | null
  onSelect: (id: string) => void
  onLockedClick: () => void
}) {
  return (
    <div className="island-dock">
      {items.map(i => {
        const sprite = getIslandSprite(assetPack, i.id, i.theme) ?? getOriginalThemeSprite(i.theme)
        return (
          <PixelButton
            key={i.id}
            aria-label={i.name}
            className={`dock-btn${i.status === 'locked' ? ' locked' : ''}`}
            onClick={() => (i.status === 'locked' ? onLockedClick() : onSelect(i.id))}
          >
            <span className="dock-icon-stack" aria-hidden="true">
              <img className="dock-sprite" src={sprite} alt="" draggable={false} />
              <span className="dock-emoji">{ICON[i.status]}</span>
            </span>
            <span className="dock-label">{i.name}{i.status === 'playable' ? ' ▶' : ''}</span>
          </PixelButton>
        )
      })}
    </div>
  )
}
