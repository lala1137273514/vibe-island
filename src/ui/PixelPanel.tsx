import type { HTMLAttributes } from 'react'

export function PixelPanel({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`pixel-panel ${className}`} {...rest}>{children}</div>
}
