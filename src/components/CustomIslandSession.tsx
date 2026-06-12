import { Suspense, useState } from 'react'
import type { GameNode } from '../content/types'
import type { CustomIslandItem } from '../services/saveService'
import { useGameState } from '../state/useGameState'
import { Stage3D } from '../engine3d/lazyStage'
import { NodePanel } from './NodePanel'
import { NodeDrawer } from './NodeDrawer'
import { PALETTES } from './islandPalettes'
import { PixelButton, PixelPanel } from '../ui'

// 用户自建岛的独立游玩会话:进度走自己的存档,与起源岛全局进度互不影响
export function CustomIslandSession({ item, webgl, onBack }: {
  item: CustomIslandItem
  webgl: boolean
  onBack: () => void
}) {
  const { save, finishNode, openChest } = useGameState(item.def)
  const [activeNode, setActiveNode] = useState<GameNode | null>(null)

  const mains = item.def.nodes.filter(n => n.kind === 'main').sort((a, b) => a.order - b.order)
  const standing = mains.find(n => save.nodeStatus[n.id] === 'available')
    ?? [...mains].reverse().find(n => save.nodeStatus[n.id] === 'done')
    ?? mains[0]
  const topColor = PALETTES.find(p => p.id === item.palette)?.topColor

  const handlePass = (star: boolean) => {
    if (!activeNode) return
    if (activeNode.kind === 'treasure') openChest(activeNode.id)
    else finishNode(activeNode.id, star)
  }

  return (
    <>
      <div className="scene grass-bg world3d-wrap">
        {webgl ? (
          <Suspense fallback={<PixelPanel className="loading-note">⛵ 海岛装载中…</PixelPanel>}>
            <Stage3D
              mode="island"
              island={{
                def: item.def,
                seed: item.seed,
                topColor,
                nodeStatus: save.nodeStatus,
                activeNodeId: activeNode?.id ?? null,
                standingId: standing?.id ?? null,
                onOpenNode: setActiveNode,
              }}
            />
          </Suspense>
        ) : (
          <PixelPanel className="webgl-note">🕹️ 当前环境不支持 WebGL;右侧卷轴依然可以完整游玩。</PixelPanel>
        )}
        <PixelButton className="back-btn" onClick={onBack}>← 返回大地图</PixelButton>
        <h1 className="island-title">{item.def.name} <span className="ai-badge">AI 生成</span></h1>
        <NodeDrawer
          nodes={item.def.nodes}
          nodeStatus={save.nodeStatus}
          standingId={standing?.id ?? null}
          onOpen={setActiveNode}
        />
      </div>
      {activeNode && (
        <NodePanel node={activeNode} onPass={handlePass} onClose={() => setActiveNode(null)} />
      )}
    </>
  )
}
