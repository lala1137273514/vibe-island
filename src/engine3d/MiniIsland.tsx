// 创岛预览用的小画布:单岛快速展示,无后处理
import { Canvas } from '@react-three/fiber'
import { VoxelIsland } from './VoxelIsland'

export default function MiniIsland({ seed, topColor }: { seed: number; topColor?: string }) {
  return (
    <Canvas camera={{ position: [0, 9, 15], fov: 45 }} dpr={[1, 1.5]}>
      <color attach="background" args={['#2e5a8a']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[10, 16, 8]} intensity={2} color="#fff4d6" />
      <VoxelIsland seed={seed} radius={6} decor topColor={topColor} spin={0.3} />
    </Canvas>
  )
}
