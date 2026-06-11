import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { GameNode } from './content/types'
import { ORIGIN_ISLAND } from './content/stage1'
import { ISLANDS } from './content/islands'
import { ACHIEVEMENTS } from './game/achievements'
import { useGameState } from './state/useGameState'
import { supportsWebGL } from './engine3d/webgl'
import type { WorldIslandSpec } from './engine3d/WorldScene'
import { Island } from './components/Island'
import { NodePanel } from './components/NodePanel'
import { HUD } from './components/HUD'
import { AchievementShelf } from './components/AchievementShelf'
import { AiSettings } from './components/AiSettings'
import { Celebration } from './components/Celebration'
import { IslandDock, type DockItem } from './components/IslandDock'
import { PixelToast, PixelPanel } from './ui'

const Stage3D = lazy(() => import('./engine3d/Stage3D'))

const ISLAND_LAYOUT: Record<string, { seed: number; position: [number, number, number]; topColor?: string }> = {
  'origin': { seed: 1001, position: [-18, 0, 0] },
  'sea2-island1': { seed: 2002, position: [0, 0, -8], topColor: '#e6c47a' },
  'sea3-island1': { seed: 3003, position: [18, 0, 0], topColor: '#f4ecd6' },
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
  const webgl = useMemo(() => supportsWebGL(), [])

  // 新成就 toast;拿到「起源岛主」时触发通关烟花
  useEffect(() => {
    if (!justEarned.length) return
    const names = justEarned.map(id => ACHIEVEMENTS.find(a => a.id === id)?.name ?? id)
    setToast(`🏆 解锁成就:${names.join('、')}`)
    if (justEarned.includes('origin-master')) {
      setActiveNode(null)
      setCelebrating(true)
    }
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [justEarned])

  const island = ISLANDS.find(i => i.id === islandId) ?? ORIGIN_ISLAND
  const enterIsland = (id: string) => { setIslandId(id); setScene('island') }
  const lockedTip = () => setTip('完成上一海域后解锁')

  const worldIslands: WorldIslandSpec[] = ISLANDS.map(isle => ({
    id: isle.id,
    name: isle.name,
    seed: ISLAND_LAYOUT[isle.id]?.seed ?? 7777,
    locked: !save.unlockedIslands.includes(isle.id),
    playable: isle.nodes.length > 0,
    kind: 'official' as const,
    topColor: ISLAND_LAYOUT[isle.id]?.topColor,
    position: ISLAND_LAYOUT[isle.id]?.position ?? [0, 0, 16],
  }))
  const dockItems: DockItem[] = ISLANDS.map(isle => ({
    id: isle.id,
    name: isle.name,
    status: save.unlockedIslands.includes(isle.id) ? 'playable' as const : 'locked' as const,
  }))

  const handlePass = (star: boolean) => {
    if (!activeNode) return
    if (activeNode.kind === 'treasure') openChest(activeNode.id)
    else finishNode(activeNode.id, star)
  }

  return (
    <>
      <HUD save={save} onToggleShelf={() => setShelfOpen(o => !o)} onOpenSettings={() => setSettingsOpen(true)} />
      <div className="app-scene">
        {scene === 'map' ? (
          <div className="scene sea-bg world3d-wrap">
            {webgl ? (
              <Suspense fallback={<PixelPanel className="loading-note">⛵ 群岛装载中…</PixelPanel>}>
                <Stage3D islands={worldIslands} onEnter={enterIsland} onLockedClick={lockedTip} />
              </Suspense>
            ) : (
              <PixelPanel className="webgl-note">🕹️ 当前环境不支持 WebGL,3D 群岛无法显示;下方码头依然可以通航全部岛屿。</PixelPanel>
            )}
            <h1 className="map-title">Vibe Coding 群岛</h1>
            <div className="map-coins">🪙 {save.coins}</div>
            <IslandDock items={dockItems} onSelect={enterIsland} onLockedClick={lockedTip} />
          </div>
        ) : (
          <Island
            island={island}
            nodeStatus={save.nodeStatus}
            activeNodeId={activeNode?.id ?? null}
            onOpenNode={setActiveNode}
            onBack={() => setScene('map')}
          />
        )}
      </div>
      {activeNode && (
        <NodePanel node={activeNode} onPass={handlePass} onClose={() => setActiveNode(null)} />
      )}
      {shelfOpen && <AchievementShelf save={save} onClose={() => setShelfOpen(false)} />}
      {settingsOpen && <AiSettings onClose={() => setSettingsOpen(false)} />}
      <Celebration show={celebrating} onDone={() => { setCelebrating(false); setScene('map') }} />
      {toast && <PixelToast>{toast}</PixelToast>}
      {tip && <PixelToast onClick={() => setTip(null)}>{tip}</PixelToast>}
    </>
  )
}
