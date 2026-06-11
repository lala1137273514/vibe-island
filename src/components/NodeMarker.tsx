import type { GameNode, NodeStatus } from '../content/types'

interface Props {
  node: GameNode
  status: NodeStatus
  active?: boolean
  onOpen: (node: GameNode) => void
}

export function NodeMarker({ node, status, active, onOpen }: Props) {
  // 主线只有 available 可点;宝箱未开都可点
  const clickable = node.kind === 'treasure' ? status !== 'done' : status === 'available'
  const icon = node.kind === 'treasure'
    ? (status === 'done' ? '✅' : '💎')
    : status === 'locked' ? '🔒' : status === 'done' ? '✅' : String(node.order)
  return (
    <div
      role="button"
      aria-label={node.title}
      aria-disabled={!clickable}
      className={`node-marker ${status}${node.kind === 'treasure' ? ' treasure' : ''}${active ? ' active' : ''}`}
      style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
      onClick={() => clickable && onOpen(node)}
    >
      {icon}
      <span className="node-label">{node.title}</span>
    </div>
  )
}
