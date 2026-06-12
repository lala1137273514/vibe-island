import type { IslandTheme } from './islandThemes'

function Cube({ position, scale, color, opacity = 1 }: {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
  opacity?: number
}) {
  return (
    <mesh position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      {opacity < 1
        ? <meshBasicMaterial color={color} transparent opacity={opacity} />
        : <meshLambertMaterial color={color} flatShading />}
    </mesh>
  )
}

function Beam({ position, color, height = 7, width = 0.55 }: {
  position: [number, number, number]
  color: string
  height?: number
  width?: number
}) {
  return (
    <group position={position}>
      <Cube position={[0, height / 2, 0]} scale={[width, height, width]} color={color} opacity={0.18} />
      <Cube position={[0, height + 0.18, 0]} scale={[width * 1.8, 0.35, width * 1.8]} color={color} opacity={0.45} />
    </group>
  )
}

function StackedPyramid({ baseY = 3.1 }: { baseY?: number }) {
  return (
    <group position={[0, baseY, 0]}>
      <Cube position={[0, 0, 0]} scale={[6.2, 0.7, 6.2]} color="#c9963f" />
      <Cube position={[0, 0.7, 0]} scale={[4.8, 0.7, 4.8]} color="#d8aa4f" />
      <Cube position={[0, 1.4, 0]} scale={[3.4, 0.7, 3.4]} color="#e6c47a" />
      <Cube position={[0, 2.1, 0]} scale={[2, 0.7, 2]} color="#f2c14e" />
      <Cube position={[0, 2.9, 0]} scale={[0.8, 0.8, 0.8]} color="#fff3c4" />
    </group>
  )
}

function Cactus({ x, z, h = 2.2 }: { x: number; z: number; h?: number }) {
  return (
    <group position={[x, 3.3, z]}>
      <Cube position={[0, h / 2, 0]} scale={[0.45, h, 0.45]} color="#3a7a2c" />
      <Cube position={[-0.55, h * 0.72, 0]} scale={[0.55, 0.35, 0.4]} color="#3a7a2c" />
      <Cube position={[-0.78, h * 0.92, 0]} scale={[0.35, 0.9, 0.35]} color="#3a7a2c" />
      <Cube position={[0.55, h * 0.5, 0]} scale={[0.55, 0.35, 0.4]} color="#3a7a2c" />
      <Cube position={[0.78, h * 0.7, 0]} scale={[0.35, 0.8, 0.35]} color="#3a7a2c" />
    </group>
  )
}

function Pine({ x, z, snow = false, h = 2.4 }: { x: number; z: number; snow?: boolean; h?: number }) {
  const leaf = snow ? '#f4ecd6' : '#245d26'
  return (
    <group position={[x, 3.1, z]}>
      <Cube position={[0, 0.6, 0]} scale={[0.45, 1.2, 0.45]} color="#6b4226" />
      <Cube position={[0, h, 0]} scale={[1.9, 0.8, 1.9]} color={leaf} />
      <Cube position={[0, h + 0.65, 0]} scale={[1.35, 0.7, 1.35]} color={leaf} />
      <Cube position={[0, h + 1.2, 0]} scale={[0.75, 0.55, 0.75]} color={leaf} />
    </group>
  )
}

function Crystal({ x, z, h, color }: { x: number; z: number; h: number; color: string }) {
  return (
    <group position={[x, 3.2, z]} rotation={[0, Math.PI / 4, 0]}>
      <Cube position={[0, h / 2, 0]} scale={[0.65, h, 0.65]} color={color} opacity={0.78} />
      <Cube position={[0, h + 0.28, 0]} scale={[0.42, 0.55, 0.42]} color="#ffffff" opacity={0.7} />
    </group>
  )
}

function OriginLandmark() {
  return (
    <group>
      <pointLight position={[0, 7, 2]} intensity={0.6} color="#f2c14e" distance={16} />
      <Cube position={[-1.7, 3.8, -1.2]} scale={[2.5, 1.5, 2]} color="#8a5a3c" />
      <Cube position={[-1.7, 4.85, -1.2]} scale={[3, 0.45, 2.5]} color="#c0392b" />
      <Cube position={[-1.7, 5.35, -1.2]} scale={[2.1, 0.45, 1.8]} color="#f2c14e" />
      <Cube position={[-1.7, 3.9, -2.25]} scale={[0.65, 0.8, 0.12]} color="#f4ecd6" />
      <Cube position={[2.8, 3.9, 0.5]} scale={[0.5, 1.4, 0.5]} color="#6b4226" />
      <Cube position={[2.8, 4.95, 0.5]} scale={[2.8, 0.35, 0.35]} color="#f4ecd6" />
      <Cube position={[2.8, 4.95, 0.5]} scale={[0.35, 0.35, 2.8]} color="#f4ecd6" />
      <Cube position={[4.25, 2.25, -2.5]} scale={[1.1, 3.8, 1.1]} color="#5b9bd5" opacity={0.72} />
      <Cube position={[4.25, 0.15, -2.5]} scale={[1.2, 0.45, 1.2]} color="#9cc4e4" opacity={0.75} />
      <Beam position={[0.8, 3.2, 2.5]} color="#f2c14e" height={5.8} width={0.45} />
      <Pine x={-4.2} z={1.8} />
      <Pine x={1.2} z={3.4} h={2} />
    </group>
  )
}

function DesertLandmark() {
  return (
    <group>
      <pointLight position={[0, 8, 0]} intensity={0.75} color="#f2c14e" distance={18} />
      <StackedPyramid />
      <Cube position={[4.2, 4.6, -2.4]} scale={[0.9, 3.2, 0.9]} color="#8a5a3c" />
      <Cube position={[4.2, 6.45, -2.4]} scale={[1.3, 0.5, 1.3]} color="#f2c14e" />
      <Beam position={[0, 5.7, 0]} color="#fff3c4" height={6.8} width={0.62} />
      <Cactus x={-4.7} z={-2.8} h={2.4} />
      <Cactus x={3.8} z={3.1} h={1.9} />
      <Cube position={[-2.9, 3.25, 4.1]} scale={[2.2, 0.25, 0.5]} color="#5b9bd5" opacity={0.7} />
    </group>
  )
}

function SnowLandmark() {
  return (
    <group>
      <pointLight position={[0, 8, 0]} intensity={0.65} color="#9cc4e4" distance={18} />
      <Crystal x={-1.2} z={-2.4} h={5.2} color="#80d8ff" />
      <Crystal x={-3.4} z={0.5} h={3.4} color="#5b9bd5" />
      <Crystal x={2.6} z={-3.1} h={3.8} color="#c7f2ff" />
      <Beam position={[-1.2, 6.6, -2.4]} color="#9cc4e4" height={5.6} width={0.5} />
      <Cube position={[3.8, 3.55, 2.6]} scale={[2.4, 0.75, 2.4]} color="#f4ecd6" />
      <Cube position={[3.8, 4.1, 2.6]} scale={[1.6, 0.75, 1.6]} color="#ffffff" />
      <Cube position={[3.8, 3.35, 1.3]} scale={[0.7, 0.45, 0.3]} color="#2e5a8a" />
      <Pine x={-4.3} z={-2.4} snow />
      <Pine x={-3.1} z={3.3} snow h={2} />
    </group>
  )
}

function CreatorLandmark() {
  return (
    <group>
      <pointLight position={[0, 7, 0]} intensity={0.75} color="#f2c14e" distance={16} />
      <Cube position={[0, 3.45, 0]} scale={[4.8, 0.35, 2.4]} color="#8a5a3c" />
      <Cube position={[0, 3.2, -2.4]} scale={[6.2, 0.3, 0.7]} color="#6b4226" />
      <Cube position={[-1.5, 4.4, 0]} scale={[0.45, 2.3, 0.45]} color="#6b4226" />
      <Cube position={[-0.55, 4.7, 0]} scale={[1.9, 1.55, 0.18]} color="#f4ecd6" />
      <Cube position={[1.8, 4.05, 0]} scale={[1.2, 0.45, 2.2]} color="#e6c47a" />
      <Cube position={[2.7, 4.3, 0]} scale={[0.3, 1.6, 0.3]} color="#3a2a1a" />
      <Cube position={[2.7, 5.2, 0.7]} scale={[0.25, 0.25, 1.4]} color="#f2c14e" />
      <Cube position={[2.7, 4.35, 1.5]} scale={[0.7, 0.7, 0.7]} color="#f2c14e" />
      <Beam position={[0, 4.5, 0]} color="#f2c14e" height={5.2} width={0.45} />
      <Cube position={[-3.5, 3.45, 2.2]} scale={[1, 0.5, 1]} color="#5b9bd5" />
    </group>
  )
}

function CustomLandmark() {
  return (
    <group>
      <pointLight position={[0, 7, 0]} intensity={0.55} color="#f2c14e" distance={14} />
      <Cube position={[0, 3.6, 0]} scale={[1.2, 1.2, 1.2]} color="#f2c14e" />
      <Cube position={[0, 4.65, 0]} scale={[0.45, 2, 0.45]} color="#6b4226" />
      <Cube position={[0.8, 5.05, 0]} scale={[1.5, 0.8, 0.15]} color="#5b9bd5" />
      <Pine x={-2.8} z={1.7} h={1.8} />
    </group>
  )
}

export function IslandLandmark({ theme }: { theme: IslandTheme }) {
  if (theme === 'desert') return <DesertLandmark />
  if (theme === 'snow') return <SnowLandmark />
  if (theme === 'creator') return <CreatorLandmark />
  if (theme === 'custom') return <CustomLandmark />
  return <OriginLandmark />
}
