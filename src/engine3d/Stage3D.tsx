// 3D 舞台:单 Canvas 壳(光照/雾/像素化后处理/轨道控制),内容由 props 决定。
// 整个文件经 React.lazy 引入 —— 不支持 WebGL 的环境(含 jsdom)由 App 在外层拦截,不会加载本模块。
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Pixelation } from '@react-three/postprocessing'
import { WorldScene, type WorldIslandSpec } from './WorldScene'

export interface Stage3DProps {
  islands: WorldIslandSpec[]
  onEnter: (id: string) => void
  onLockedClick: () => void
}

export default function Stage3D({ islands, onEnter, onLockedClick }: Stage3DProps) {
  return (
    <Canvas camera={{ position: [0, 20, 34], fov: 45 }} dpr={[1, 1.5]} className="stage3d-canvas">
      <color attach="background" args={['#2e5a8a']} />
      <fog attach="fog" args={['#2e5a8a', 70, 150]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[24, 32, 12]} intensity={2.2} color="#fff4d6" />
      <WorldScene islands={islands} onEnter={onEnter} onLockedClick={onLockedClick} />
      <EffectComposer>
        <Pixelation granularity={5} />
      </EffectComposer>
      <OrbitControls
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        minDistance={14}
        maxDistance={80}
        enablePan={false}
      />
    </Canvas>
  )
}
