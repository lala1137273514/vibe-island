import { useMemo, useRef, useLayoutEffect } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { generateIsland } from './voxelGen'

interface Props {
  seed: number
  radius?: number
  decor?: boolean
  topColor?: string
  spin?: number          // rad/s,0 表示不自转
  scale?: number
  voxelSize?: number
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerOver?: () => void
  onPointerOut?: () => void
  children?: React.ReactNode
}

export function VoxelIsland({
  seed, radius = 8, decor = true, topColor, spin = 0.08,
  scale = 1, voxelSize = 1, onClick, onPointerOver, onPointerOut, children,
}: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const isle = useMemo(() => generateIsland({ seed, radius, decor, topColor }), [seed, radius, decor, topColor])

  useLayoutEffect(() => {
    const m = meshRef.current
    if (!m) return
    const dummy = new THREE.Object3D()
    isle.voxels.forEach((v, i) => {
      dummy.position.set(v.x * voxelSize, v.y * voxelSize, v.z * voxelSize)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, new THREE.Color(v.color))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [isle, voxelSize])

  useFrame((_, dt) => {
    if (groupRef.current && spin) groupRef.current.rotation.y += spin * dt
  })

  return (
    <Float speed={1} floatIntensity={0.35} rotationIntensity={0}>
      <group
        ref={groupRef}
        scale={scale}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <instancedMesh
          key={`${seed}-${isle.voxels.length}`}
          ref={meshRef}
          args={[undefined, undefined, isle.voxels.length]}
        >
          <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
          <meshLambertMaterial flatShading />
        </instancedMesh>
        {children}
      </group>
    </Float>
  )
}
