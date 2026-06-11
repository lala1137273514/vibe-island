import { useEffect, useState } from 'react'
import type { GameNode } from './content/types'
import { ORIGIN_ISLAND } from './content/stage1'
import { ISLANDS } from './content/islands'
import { ACHIEVEMENTS } from './content/achievements'
import { useGameState } from './state/useGameState'
import { WorldMap } from './components/WorldMap'
import { Island } from './components/Island'
import { NodePanel } from './components/NodePanel'
import { HUD } from './components/HUD'
import { AchievementShelf } from './components/AchievementShelf'
import { Celebration } from './components/Celebration'

export default function App() {
  const { save, justEarned, finishNode, openChest } = useGameState(ORIGIN_ISLAND)
  const [scene, setScene] = useState<'map' | 'island'>('map')
  const [islandId, setIslandId] = useState('origin')
  const [activeNode, setActiveNode] = useState<GameNode | null>(null)
  const [shelfOpen, setShelfOpen] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

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
  const handlePass = (star: boolean) => {
    if (!activeNode) return
    if (activeNode.kind === 'treasure') openChest(activeNode.id)
    else finishNode(activeNode.id, star)
  }

  return (
    <>
      <HUD save={save} onToggleShelf={() => setShelfOpen(o => !o)} />
      <div className="app-scene">
        {scene === 'map'
          ? <WorldMap
              islands={ISLANDS}
              unlockedIslands={save.unlockedIslands}
              coins={save.coins}
              onEnter={id => { setIslandId(id); setScene('island') }}
            />
          : <Island
              island={island}
              nodeStatus={save.nodeStatus}
              activeNodeId={activeNode?.id ?? null}
              onOpenNode={setActiveNode}
              onBack={() => setScene('map')}
            />}
      </div>
      {activeNode && (
        <NodePanel node={activeNode} onPass={handlePass} onClose={() => setActiveNode(null)} />
      )}
      {shelfOpen && <AchievementShelf save={save} onClose={() => setShelfOpen(false)} />}
      <Celebration show={celebrating} onDone={() => { setCelebrating(false); setScene('map') }} />
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
