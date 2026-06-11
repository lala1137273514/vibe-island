import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { GameNode, NodeStatus } from '../content/types'

interface Props {
  node: GameNode
  status: NodeStatus
  active: boolean
  position: [number, number, number]
  onOpen: (node: GameNode) => void
}

export function NodeObject({ node, status, active, position, onOpen }: Props) {
  const ref = useRef<THREE.Group>(null)
  const clickable = node.kind === 'treasure' ? status !== 'done' : status === 'available'
  const flagColor = status === 'done' ? '#5fa64d' : status === 'available' ? '#f2c14e' : '#9a9a8e'

  useFrame(state => {
    if (ref.current && status === 'available') {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.25
    }
  })

  const icon = node.kind === 'treasure'
    ? (status === 'done' ? '✅' : '💎')
    : status === 'locked' ? '🔒' : status === 'done' ? '✅' : String(node.order)

  return (
    <group
      ref={ref}
      position={position}
      onClick={e => { e.stopPropagation(); if (clickable) onOpen(node) }}
      onPointerOver={() => { if (clickable) document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {node.kind === 'treasure' ? (
        <group>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.4, 0.8, 1]} />
            <meshLambertMaterial color="#8a5a3c" flatShading />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[1.5, 0.35, 1.1]} />
            <meshLambertMaterial color="#6b4226" flatShading />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.25, 1.8, 0.25]} />
            <meshLambertMaterial color="#6b4226" flatShading />
          </mesh>
          <mesh position={[0.5, 1.45, 0]}>
            <boxGeometry args={[1, 0.6, 0.12]} />
            <meshLambertMaterial color={flagColor} flatShading />
          </mesh>
        </group>
      )}
      {status === 'available' && (
        <mesh position={[0, 3.2, 0]}>
          <boxGeometry args={[0.9, 5.5, 0.9]} />
          <meshLambertMaterial color="#f2c14e" transparent opacity={0.22} />
        </mesh>
      )}
      <Html center position={[0, 2.8, 0]} distanceFactor={20}>
        <div className={`node-3d-label ${status}${active ? ' active' : ''}`}>{icon} {node.title}</div>
      </Html>
    </group>
  )
}
