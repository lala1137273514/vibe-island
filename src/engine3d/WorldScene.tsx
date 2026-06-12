import { useState } from 'react'
import { Html } from '@react-three/drei'
import { VoxelIsland } from './VoxelIsland'
import { IslandLandmark } from './IslandLandmark'
import { themeRadius, themeTopColor, type IslandTheme } from './islandThemes'
import {
  getIslandProps,
  getIslandSprite,
  type LocalAssetPack,
  type LocalIslandProp,
} from '../services/localAssetPack'
import { getOriginalThemeSprite } from '../services/originalAssets'

export interface WorldIslandSpec {
  id: string
  name: string
  seed: number
  locked: boolean
  playable: boolean
  kind: 'official' | 'creator' | 'custom'
  theme: IslandTheme
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
      <Html center position={[0, 7.2, 0]} distanceFactor={30} zIndexRange={[12, 0]}>
        <div className="island-3d-lock">🔒</div>
      </Html>
    </group>
  )
}

function ThemeSprite({ src, name, local }: { src: string; name: string; local: boolean }) {
  return (
    <Html center position={[0, 9.6, 0]} distanceFactor={28} zIndexRange={[12, 0]}>
      <div className={`theme-asset-sprite${local ? ' local' : ''}`}>
        <img src={src} alt={`${name} 主题徽章`} draggable={false} />
      </div>
    </Html>
  )
}

function IslandPropSprite({ prop }: { prop: LocalIslandProp }) {
  return (
    <Html center position={prop.position} distanceFactor={28} zIndexRange={[16, 0]}>
      <img
        className="island-prop-sprite"
        src={prop.src}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ width: `${prop.width}px` }}
      />
    </Html>
  )
}

export function WorldScene({ islands, assetPack, onEnter, onLockedClick }: {
  islands: WorldIslandSpec[]
  assetPack: LocalAssetPack | null
  onEnter: (id: string) => void
  onLockedClick: () => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <group>
      {islands.map(isle => {
        const localSprite = getIslandSprite(assetPack, isle.id, isle.theme)
        const sprite = localSprite ?? getOriginalThemeSprite(isle.theme)
        const props = getIslandProps(assetPack, isle.id, isle.theme)
        const hasLocalProps = props.length > 0
        const labelPosition: [number, number, number] = [0, isle.kind === 'creator' ? -4.8 : -9, 0]
        return (
          <group key={isle.id} position={isle.position}>
            <VoxelIsland
              seed={isle.seed}
              radius={themeRadius[isle.theme]}
              topColor={isle.topColor ?? themeTopColor[isle.theme]}
              decor={isle.theme === 'origin' || isle.theme === 'custom'}
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
              {hasLocalProps
                ? props.map(prop => <IslandPropSprite key={prop.id} prop={prop} />)
                : <ThemeSprite src={sprite} name={isle.name} local={Boolean(localSprite)} />}
              {!hasLocalProps && <IslandLandmark theme={isle.theme} />}
              {isle.locked && <CloudLock />}
              <Html center position={labelPosition} distanceFactor={36} zIndexRange={[12, 0]}>
                <div className={`island-3d-label${isle.locked ? ' locked' : ''}`}>
                  {isle.kind === 'creator' ? '⚓ ' : isle.kind === 'custom' ? '🏝 ' : ''}{isle.name}
                  {isle.playable && !isle.locked && <span className="island-3d-play"> ▶</span>}
                </div>
              </Html>
            </VoxelIsland>
          </group>
        )
      })}
    </group>
  )
}
