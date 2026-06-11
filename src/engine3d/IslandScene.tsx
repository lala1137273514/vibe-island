import { useMemo } from 'react'
import type { GameNode, IslandDef, NodeStatus } from '../content/types'
import { VoxelIsland } from './VoxelIsland'
import { NodeObject } from './NodeObject'
import { VoxelCharacter } from './VoxelCharacter'
import { generateIsland } from './voxelGen'

const RADIUS = 14

export interface IslandSceneProps {
  def: IslandDef
  seed: number
  topColor?: string
  nodeStatus: Record<string, NodeStatus>
  activeNodeId: string | null
  standingId: string | null
  onOpenNode: (node: GameNode) => void
}

export function IslandScene({ def, seed, topColor, nodeStatus, activeNodeId, standingId, onOpenNode }: IslandSceneProps) {
  // 与 VoxelIsland 同参生成,仅为查询岛面高度(确定性保证一致)
  const isle = useMemo(() => generateIsland({ seed, radius: RADIUS, decor: true, topColor }), [seed, topColor])

  const toWorld = (p: { x: number; y: number }): [number, number, number] => {
    const gx = Math.round(((p.x / 100) * 2 - 1) * (RADIUS - 3))
    const gz = Math.round(((p.y / 100) * 2 - 1) * (RADIUS - 3))
    return [gx, isle.surfaceY(gx, gz) + 0.5, gz]
  }

  const standing = def.nodes.find(n => n.id === standingId)

  return (
    <VoxelIsland seed={seed} radius={RADIUS} decor topColor={topColor} spin={0.015}>
      {def.nodes.map(n => (
        <NodeObject
          key={n.id}
          node={n}
          status={nodeStatus[n.id] ?? 'locked'}
          active={activeNodeId === n.id}
          position={toWorld(n.position)}
          onOpen={onOpenNode}
        />
      ))}
      {standing && <VoxelCharacter position={toWorld(standing.position)} />}
    </VoxelIsland>
  )
}
