import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 体素小人:位置变化时抛物线跳跃过去
export function VoxelCharacter({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const from = useRef(new THREE.Vector3(...position))
  const to = useRef(new THREE.Vector3(...position))
  const t = useRef(1)

  useEffect(() => {
    if (ref.current) from.current.copy(ref.current.position)
    to.current.set(position[0], position[1], position[2])
    t.current = 0
  }, [position[0], position[1], position[2]]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    if (!ref.current || t.current >= 1) return
    t.current = Math.min(1, t.current + dt / 0.8)
    const p = from.current.clone().lerp(to.current, t.current)
    p.y += Math.sin(t.current * Math.PI) * 2
    ref.current.position.copy(p)
  })

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshLambertMaterial color="#e8b88a" flatShading />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.9, 0.8, 0.5]} />
        <meshLambertMaterial color="#c0392b" flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.5]} />
        <meshLambertMaterial color="#2d4a7a" flatShading />
      </mesh>
    </group>
  )
}
