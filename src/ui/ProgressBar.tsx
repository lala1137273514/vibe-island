export function ProgressBar({ ratio, label }: { ratio: number; label?: string }) {
  const pct = Math.min(100, Math.max(0, ratio * 100))
  return (
    <div className="progressbar" aria-label={label}>
      <div style={{ width: `${pct}%` }} />
    </div>
  )
}
