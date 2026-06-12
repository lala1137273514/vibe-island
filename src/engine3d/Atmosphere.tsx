// 天空氛围:像素分带渐变天球 + 漂移云海 + 像素太阳(两种场景共用)
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 视觉随机(确定性,按下标取):云朵布阵用
const h = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function PixelSky() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1
    c.height = 64
    const g = c.getContext('2d')!
    const bands: [string, number][] = [
      ['#1d3a6e', 0.22],
      ['#2e5a8a', 0.42],
      ['#4a82b4', 0.58],
      ['#5b9bd5', 0.72],
      ['#9cc4e4', 0.84],
      ['#f4e4c2', 0.93],
      ['#e6c47a', 1.0],
    ]
    let prev = 0
    for (const [color, stop] of bands) {
      g.fillStyle = color
      g.fillRect(0, Math.floor(prev * 64), 1, Math.ceil((stop - prev) * 64) + 1)
      prev = stop
    }
    const t = new THREE.CanvasTexture(c)
    t.magFilter = THREE.NearestFilter
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <mesh>
      <sphereGeometry args={[380, 24, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} />
    </mesh>
  )
}

const CLOUD_COUNT = 44
const WRAP = 110

export function CloudSea() {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const clouds = useMemo(() => Array.from({ length: CLOUD_COUNT }, (_, i) => ({
    x: (h(i, 1) - 0.5) * 2 * WRAP,
    y: -9 - h(i, 2) * 9,
    z: (h(i, 3) - 0.5) * 2 * WRAP,
    sx: 7 + h(i, 4) * 16,
    sy: 1.2 + h(i, 5) * 1.4,
    sz: 5 + h(i, 6) * 9,
    speed: 0.6 + h(i, 7) * 1.2,
  })), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    clouds.forEach((c, i) => {
      c.x += c.speed * dt
      if (c.x > WRAP) c.x = -WRAP
      dummy.position.set(c.x, c.y, c.z)
      dummy.scale.set(c.sx, c.sy, c.sz)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CLOUD_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.88} />
    </instancedMesh>
  )
}

export function PixelSun() {
  return (
    <group position={[70, 58, -110]}>
      <mesh>
        <boxGeometry args={[12, 12, 12]} />
        <meshBasicMaterial color="#fff3c4" fog={false} />
      </mesh>
      <mesh>
        <boxGeometry args={[18, 18, 18]} />
        <meshBasicMaterial color="#f2c14e" transparent opacity={0.35} fog={false} />
      </mesh>
    </group>
  )
}
