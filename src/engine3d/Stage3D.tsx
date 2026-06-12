// 3D 舞台:单 Canvas 壳(光照/雾/像素化后处理/轨道控制),world/island 两场景切换 + 镜头飞行。
// 整个文件经 React.lazy 引入 —— 不支持 WebGL 的环境(含 jsdom)由 App 在外层拦截,不会加载本模块。
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Pixelation } from '@react-three/postprocessing'
import * as THREE from 'three'
import { WorldScene, type WorldIslandSpec } from './WorldScene'
import { IslandScene, type IslandSceneProps } from './IslandScene'
import { PixelSky, CloudSea, PixelSun } from './Atmosphere'

export interface Stage3DProps {
  mode: 'world' | 'island'
  world?: {
    islands: WorldIslandSpec[]
    onEnter: (id: string) => void
    onLockedClick: () => void
  }
  island?: IslandSceneProps | null
}

// 切场景时把相机飞到预设位,抵达后交还轨道控制
function CameraLerp({ to }: { to: [number, number, number] }) {
  const { camera } = useThree()
  const target = useMemo(() => new THREE.Vector3(...to), [to])
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    camera.position.lerp(target, 0.08)
    if (camera.position.distanceTo(target) < 0.4) done.current = true
  })
  return null
}

export default function Stage3D({ mode, world, island }: Stage3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 22, 38], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      className="stage3d-canvas"
    >
      <fog attach="fog" args={['#9cc4e4', 90, 240]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[24, 32, 12]} intensity={2.2} color="#fff4d6" />
      <PixelSky />
      <CloudSea />
      <PixelSun />
      {mode === 'world' && world
        ? <WorldScene islands={world.islands} onEnter={world.onEnter} onLockedClick={world.onLockedClick} />
        : island && <IslandScene {...island} />}
      <CameraLerp key={`cam-${mode}-${island?.def.id ?? ''}`} to={mode === 'world' ? [0, 22, 38] : [0, 24, 27]} />
      <EffectComposer>
        <Pixelation granularity={2} />
      </EffectComposer>
      <OrbitControls
        key={`orbit-${mode}`}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        minDistance={mode === 'world' ? 14 : 10}
        maxDistance={mode === 'world' ? 80 : 50}
        enablePan={false}
      />
    </Canvas>
  )
}
