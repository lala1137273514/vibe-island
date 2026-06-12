import { Suspense, useEffect, useMemo, useState } from 'react'
import type { GameNode } from './content/types'
import { ORIGIN_ISLAND } from './content/stage1'
import { ISLANDS } from './content/islands'
import { ACHIEVEMENTS } from './game/achievements'
import { useGameState } from './state/useGameState'
import { saveService } from './services/saveService'
import { supportsWebGL } from './engine3d/webgl'
import { Stage3D } from './engine3d/lazyStage'
import type { WorldIslandSpec } from './engine3d/WorldScene'
import type { IslandTheme } from './engine3d/islandThemes'
import { NodePanel } from './components/NodePanel'
import { HUD } from './components/HUD'
import { AchievementShelf } from './components/AchievementShelf'
import { AiSettings } from './components/AiSettings'
import { Celebration } from './components/Celebration'
import { IslandDock, type DockItem } from './components/IslandDock'
import { NodeDrawer } from './components/NodeDrawer'
import { CreatorBay } from './components/CreatorBay'
import { CustomIslandSession } from './components/CustomIslandSession'
import { PALETTES } from './components/islandPalettes'
import { PixelToast, PixelPanel, PixelButton } from './ui'

const ISLAND_LAYOUT: Record<string, { seed: number; position: [number, number, number]; topColor?: string; theme: IslandTheme }> = {
  'origin': { seed: 1001, position: [-15.5, 0, 0], theme: 'origin' },
  'sea2-island1': { seed: 2002, position: [0, 0, -9], topColor: '#e6c47a', theme: 'desert' },
  'sea3-island1': { seed: 3003, position: [15.5, 0, 0], topColor: '#f4ecd6', theme: 'snow' },
}

export default function App() {
  const { save, justEarned, finishNode, openChest } = useGameState(ORIGIN_ISLAND)
  const [scene, setScene] = useState<'map' | 'island'>('map')
  const [islandId, setIslandId] = useState('origin')
  const [activeNode, setActiveNode] = useState<GameNode | null>(null)
  const [shelfOpen, setShelfOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [tip, setTip] = useState<string | null>(null)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [customIslands, setCustomIslands] = useState(() => saveService.listCustomIslands())
  const webgl = useMemo(() => supportsWebGL(), [])

  // 新成就 toast;拿到「起源岛主」时触发通关烟花
  useEffect(() => {
    if (!justEarned.length) return
    const names = justEarned.map(id => ACHIEVEMENTS.find(a => a.id === id)?.name ?? id)
    const show = window.setTimeout(() => {
      setToast(`🏆 解锁成就:${names.join('、')}`)
      if (justEarned.includes('origin-master')) {
        setActiveNode(null)
        setCelebrating(true)
      }
    }, 0)
    const hide = window.setTimeout(() => setToast(null), 3500)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [justEarned])

  const island = ISLANDS.find(i => i.id === islandId) ?? ORIGIN_ISLAND
  const layout = ISLAND_LAYOUT[island.id] ?? { seed: 7777, position: [0, 0, 16] as [number, number, number], theme: 'custom' as const }
  const customItem = customIslands.find(c => c.def.id === islandId)
  const enterIsland = (id: string) => {
    if (id === 'creator-bay') { setCreatorOpen(true); return }
    setIslandId(id)
    setScene('island')
  }
  const lockedTip = () => setTip('完成上一海域后解锁')

  // 小人站位:第一个 available 主线;全完成则最后一个 done;兜底起点
  const mains = island.nodes.filter(n => n.kind === 'main').sort((a, b) => a.order - b.order)
  const standing = mains.find(n => save.nodeStatus[n.id] === 'available')
    ?? [...mains].reverse().find(n => save.nodeStatus[n.id] === 'done')
    ?? mains[0]

  const worldIslands: WorldIslandSpec[] = [
    ...ISLANDS.map(isle => ({
      id: isle.id,
      name: isle.name,
      seed: ISLAND_LAYOUT[isle.id]?.seed ?? 7777,
      locked: !save.unlockedIslands.includes(isle.id),
      playable: isle.nodes.length > 0,
      kind: 'official' as const,
      theme: ISLAND_LAYOUT[isle.id]?.theme ?? 'custom',
      topColor: ISLAND_LAYOUT[isle.id]?.topColor,
      position: ISLAND_LAYOUT[isle.id]?.position ?? [0, 0, 16] as [number, number, number],
    })),
    {
      id: 'creator-bay', name: '创造湾', seed: 4004, locked: false, playable: false,
      kind: 'creator' as const, theme: 'creator' as const, topColor: '#e6c47a', position: [0, -2, 8],
    },
    ...customIslands.map((c, i) => ({
      id: c.def.id,
      name: c.def.name,
      seed: c.seed,
      locked: false,
      playable: true,
      kind: 'custom' as const,
      theme: 'custom' as const,
      topColor: PALETTES.find(p => p.id === c.palette)?.topColor,
      position: [(i - (customIslands.length - 1) / 2) * 14, 1, 28] as [number, number, number],
    })),
  ]
  const dockItems: DockItem[] = [
    ...ISLANDS.map(isle => ({
      id: isle.id,
      name: isle.name,
      status: save.unlockedIslands.includes(isle.id) ? 'playable' as const : 'locked' as const,
    })),
    { id: 'creator-bay', name: '创造湾', status: 'creator' as const },
    ...customIslands.map(c => ({ id: c.def.id, name: c.def.name, status: 'custom' as const })),
  ]

  const handlePass = (star: boolean) => {
    if (!activeNode) return
    if (activeNode.kind === 'treasure') openChest(activeNode.id)
    else finishNode(activeNode.id, star)
  }

  // 用户自建岛走独立会话(自己的存档,不影响起源岛全局进度)
  if (scene === 'island' && customItem) {
    return (
      <>
        <HUD save={save} onToggleShelf={() => setShelfOpen(o => !o)} onOpenSettings={() => setSettingsOpen(true)} />
        <div className="app-scene">
          <CustomIslandSession key={customItem.def.id} item={customItem} webgl={webgl} onBack={() => setScene('map')} />
        </div>
        {shelfOpen && <AchievementShelf save={save} onClose={() => setShelfOpen(false)} />}
        {settingsOpen && <AiSettings onClose={() => setSettingsOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <HUD save={save} onToggleShelf={() => setShelfOpen(o => !o)} onOpenSettings={() => setSettingsOpen(true)} />
      <div className="app-scene">
        <div className={`scene ${scene === 'map' ? 'sea-bg' : 'grass-bg'} world3d-wrap`}>
          {webgl ? (
            <Suspense fallback={<PixelPanel className="loading-note">⛵ 群岛装载中…</PixelPanel>}>
              <Stage3D
                mode={scene === 'map' ? 'world' : 'island'}
                world={{ islands: worldIslands, onEnter: enterIsland, onLockedClick: lockedTip }}
                island={scene === 'island' ? {
                  def: island,
                  seed: layout.seed,
                  topColor: layout.topColor,
                  nodeStatus: save.nodeStatus,
                  activeNodeId: activeNode?.id ?? null,
                  standingId: standing?.id ?? null,
                  onOpenNode: setActiveNode,
                } : null}
              />
            </Suspense>
          ) : (
            <PixelPanel className="webgl-note">🕹️ 当前环境不支持 WebGL,3D 世界无法显示;侧边卷轴与码头依然可以完整游玩。</PixelPanel>
          )}
          {scene === 'map' ? (
            <>
              <h1 className="map-title">Vibe Coding 群岛</h1>
              <div className="map-coins">🪙 {save.coins}</div>
              <IslandDock items={dockItems} onSelect={enterIsland} onLockedClick={lockedTip} />
            </>
          ) : (
            <>
              <PixelButton className="back-btn" onClick={() => setScene('map')}>← 返回大地图</PixelButton>
              <h1 className="island-title">{island.name}</h1>
              {island.nodes.length === 0 && (
                <PixelPanel className="empty-island-note">🚧 新海域已解锁,教学内容即将到来</PixelPanel>
              )}
              <NodeDrawer
                nodes={island.nodes}
                nodeStatus={save.nodeStatus}
                standingId={standing?.id ?? null}
                onOpen={setActiveNode}
              />
            </>
          )}
        </div>
      </div>
      {activeNode && (
        <NodePanel node={activeNode} onPass={handlePass} onClose={() => setActiveNode(null)} />
      )}
      {shelfOpen && <AchievementShelf save={save} onClose={() => setShelfOpen(false)} />}
      {settingsOpen && <AiSettings onClose={() => setSettingsOpen(false)} />}
      {creatorOpen && (
        <CreatorBay
          onClose={() => setCreatorOpen(false)}
          onSaved={() => {
            setCustomIslands(saveService.listCustomIslands())
            setCreatorOpen(false)
            setToast('🏝 新岛落成!已停泊在群岛南侧。')
          }}
        />
      )}
      <Celebration show={celebrating} onDone={() => { setCelebrating(false); setScene('map') }} />
      {toast && <PixelToast>{toast}</PixelToast>}
      {tip && <PixelToast onClick={() => setTip(null)}>{tip}</PixelToast>}
    </>
  )
}
