import { useState } from 'react'
import { Html } from '@react-three/drei'
import { VoxelIsland } from './VoxelIsland'

export interface WorldIslandSpec {
  id: string
  name: string
  seed: number
  locked: boolean
  playable: boolean
  kind: 'official' | 'creator' | 'custom'
  topColor?: string
  position: [number, number, number]
}

function CloudLock() {
  // 锁定岛上空的体素云团 + 🔒
  const puffs: [number, number, number, number][] = [
    [0, 7, 0, 3.2], [-2.4, 6.4, 1.2, 2.2], [2.2, 6.6, -1, 2.4], [0.6, 6.2, 2.2, 1.8],
  ]
  return (
    <group>
      {puffs.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[s, s * 0.55, s]} />
          <meshLambertMaterial color="#f4ecd6" transparent opacity={0.85} flatShading />
        </mesh>
      ))}
      <Html center position={[0, 7.2, 0]} distanceFactor={30}>
        <div className="island-3d-lock">🔒</div>
      </Html>
    </group>
  )
}

export function WorldScene({ islands, onEnter, onLockedClick }: {
  islands: WorldIslandSpec[]
  onEnter: (id: string) => void
  onLockedClick: () => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <group>
      {islands.map(isle => (
        <group key={isle.id} position={isle.position}>
          <VoxelIsland
            seed={isle.seed}
            radius={isle.kind === 'official' ? 7 : 5}
            topColor={isle.topColor}
            decor={!isle.locked}
            spin={isle.locked ? 0.03 : 0.1}
            scale={hovered === isle.id ? 1.07 : 1}
            onClick={e => {
              e.stopPropagation()
              if (isle.locked) onLockedClick()
              else onEnter(isle.id)
            }}
            onPointerOver={() => { setHovered(isle.id); document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { setHovered(null); document.body.style.cursor = 'auto' }}
          >
            {isle.locked && <CloudLock />}
            <Html center position={[0, -9, 0]} distanceFactor={36}>
              <div className={`island-3d-label${isle.locked ? ' locked' : ''}`}>
                {isle.kind === 'creator' ? '⚓ ' : isle.kind === 'custom' ? '🏝 ' : ''}{isle.name}
                {isle.playable && !isle.locked && <span className="island-3d-play"> ▶</span>}
              </div>
            </Html>
          </VoxelIsland>
        </group>
      ))}
    </group>
  )
}
