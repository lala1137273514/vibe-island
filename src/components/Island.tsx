import type { GameNode, IslandDef, NodeStatus } from '../content/types'
import { NodeMarker } from './NodeMarker'
import { Character } from './Character'

interface Props {
  island: IslandDef
  nodeStatus: Record<string, NodeStatus>
  onOpenNode: (node: GameNode) => void
  onBack: () => void
  activeNodeId: string | null
}

export function Island({ island, nodeStatus, onOpenNode, onBack, activeNodeId }: Props) {
  const mains = island.nodes.filter(n => n.kind === 'main').sort((a, b) => a.order - b.order)
  // 小人站位:第一个 available 主线节点;全完成则最后一个 done;兜底起点
  const standing = mains.find(n => nodeStatus[n.id] === 'available')
    ?? [...mains].reverse().find(n => nodeStatus[n.id] === 'done')
    ?? mains[0]
  return (
    <div className="scene grass-bg island-scene">
      <button className="pixel-btn back-btn" onClick={onBack}>← 返回大地图</button>
      <h1 className="island-title">{island.name}</h1>
      <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points={mains.map(n => `${n.position.x},${n.position.y}`).join(' ')}
          fill="none" stroke="rgba(58,42,26,.45)" strokeWidth="0.8" strokeDasharray="2 1.5"
        />
      </svg>
      {island.nodes.length === 0 && (
        <div className="pixel-panel empty-island-note">🚧 新海域已解锁,教学内容即将到来</div>
      )}
      {island.nodes.map(n => (
        <NodeMarker
          key={n.id}
          node={n}
          status={nodeStatus[n.id] ?? 'locked'}
          active={activeNodeId === n.id}
          onOpen={onOpenNode}
        />
      ))}
      {standing && <Character x={standing.position.x} y={standing.position.y} />}
    </div>
  )
}
