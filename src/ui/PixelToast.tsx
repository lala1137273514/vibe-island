import type { ReactNode } from 'react'

export function PixelToast({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <div className="toast" onClick={onClick}>{children}</div>
}
