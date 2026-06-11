import { PixelButton } from '../ui'

export interface DockItem {
  id: string
  name: string
  status: 'playable' | 'locked' | 'creator' | 'custom'
}

const ICON: Record<DockItem['status'], string> = {
  playable: '🏝️', locked: '🔒', creator: '⚓', custom: '✨',
}

// 大地图的 2D 等价入口:键盘可达、无 WebGL/测试环境也能完整导航
export function IslandDock({ items, onSelect, onLockedClick }: {
  items: DockItem[]
  onSelect: (id: string) => void
  onLockedClick: () => void
}) {
  return (
    <div className="island-dock">
      {items.map(i => (
        <PixelButton
          key={i.id}
          aria-label={i.name}
          className={`dock-btn${i.status === 'locked' ? ' locked' : ''}`}
          onClick={() => (i.status === 'locked' ? onLockedClick() : onSelect(i.id))}
        >
          {ICON[i.status]} {i.name}{i.status === 'playable' ? ' ▶' : ''}
        </PixelButton>
      ))}
    </div>
  )
}
