import type { ReactNode } from 'react'

// 模态:点遮罩关闭,内容区阻断冒泡
export function PixelDialog({ onClose, children, className = '' }:
    { onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`pixel-panel ${className}`} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}
