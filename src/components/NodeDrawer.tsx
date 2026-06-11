import type { GameNode, NodeStatus } from '../content/types'
import { PixelButton } from '../ui'

const iconOf = (n: GameNode, s: NodeStatus) =>
  n.kind === 'treasure' ? (s === 'done' ? '✅' : '💎') : s === 'locked' ? '🔒' : s === 'done' ? '✅' : '⭐'

// 岛内节点的 2D 等价入口(任务卷轴):键盘可达、无 WebGL/测试环境也能完整游玩
export function NodeDrawer({ nodes, nodeStatus, standingId, onOpen }: {
  nodes: GameNode[]
  nodeStatus: Record<string, NodeStatus>
  standingId: string | null
  onOpen: (node: GameNode) => void
}) {
  if (!nodes.length) return null
  const mains = nodes.filter(n => n.kind === 'main').sort((a, b) => a.order - b.order)
  const treasures = nodes.filter(n => n.kind === 'treasure')

  const row = (n: GameNode) => {
    const s = nodeStatus[n.id] ?? 'locked'
    const clickable = n.kind === 'treasure' ? s !== 'done' : s === 'available'
    return (
      <PixelButton
        key={n.id}
        aria-label={n.title}
        aria-disabled={!clickable}
        className={`drawer-btn ${s}${n.kind === 'treasure' ? ' treasure' : ''}`}
        onClick={() => clickable && onOpen(n)}
      >
        {iconOf(n, s)} {n.kind === 'main' ? `${n.order}. ` : ''}{n.title}
        {standingId === n.id && <span data-testid="character" className="drawer-char"> 🧍</span>}
      </PixelButton>
    )
  }

  return (
    <div className="node-drawer">
      <div className="drawer-title">📜 任务卷轴</div>
      {mains.map(row)}
      <div className="drawer-sub">隐藏宝箱</div>
      {treasures.map(row)}
    </div>
  )
}
