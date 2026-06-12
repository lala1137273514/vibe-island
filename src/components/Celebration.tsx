import { useEffect, useMemo } from 'react'
import { PixelPanel } from '../ui'

const COLORS = ['#f2c14e', '#e6c47a', '#5fa64d', '#5b9bd5', '#c0392b', '#f4ecd6']
const sparkValue = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function Celebration({ show, onDone }: { show: boolean; onDone: () => void }) {
  const sparks = useMemo(() => show
    ? Array.from({ length: 36 }, (_, i) => ({
        left: 15 + sparkValue(i, 1) * 70,
        top: 20 + sparkValue(i, 2) * 50,
        dx: (sparkValue(i, 3) - 0.5) * 180,
        dy: (sparkValue(i, 4) - 0.5) * 180,
        color: COLORS[i % COLORS.length],
        delay: sparkValue(i, 5) * 0.8,
      }))
    : [], [show])
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [show, onDone])
  if (!show) return null
  return (
    <div className="celebration" data-testid="celebration">
      <PixelPanel className="celebration-banner">🎉 起源岛通关!进阶之海的云雾散开了!</PixelPanel>
      {sparks.map((s, i) => (
        <span
          key={i}
          className="firework"
          style={{
            left: `${s.left}%`, top: `${s.top}%`, background: s.color,
            animationDelay: `${s.delay}s`,
            ['--dx' as string]: `${s.dx}px`,
            ['--dy' as string]: `${s.dy}px`,
          }}
        />
      ))}
    </div>
  )
}
