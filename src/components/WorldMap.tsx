import { useState } from 'react'
import type { IslandDef } from '../content/types'
import { REGIONS } from '../content/islands'

interface Props {
  islands: IslandDef[]
  unlockedIslands: string[]
  onEnter: (islandId: string) => void
  coins: number
}

export function WorldMap({ islands, unlockedIslands, onEnter, coins }: Props) {
  const [tip, setTip] = useState<string | null>(null)
  return (
    <div className="scene sea-bg world-map">
      <h1 className="map-title">Vibe Coding 群岛</h1>
      <div className="map-coins">🪙 {coins}</div>
      <div className="regions">
        {REGIONS.map(r => (
          <section key={r.id} className="region">
            <h2 className="region-name">{r.name}</h2>
            {islands.filter(i => i.region === r.id).map(island => {
              const unlocked = unlockedIslands.includes(island.id)
              return (
                <div
                  key={island.id}
                  role="button"
                  aria-label={island.name}
                  className={`island-card ${unlocked ? '' : 'locked'}`}
                  onClick={() => unlocked ? onEnter(island.id) : setTip('完成上一海域后解锁')}
                >
                  <div className="island-emoji">🏝️</div>
                  <div className="island-name">{island.name}</div>
                  {unlocked && island.nodes.length > 0 && <div className="playable-badge">▶ 可玩</div>}
                  {!unlocked && <div className="cloud-mask">🔒</div>}
                </div>
              )
            })}
          </section>
        ))}
      </div>
      {tip && <div className="toast" onClick={() => setTip(null)}>{tip}</div>}
    </div>
  )
}
