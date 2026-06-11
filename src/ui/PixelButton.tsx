import type { ButtonHTMLAttributes } from 'react'

export function PixelButton({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`pixel-btn ${className}`} {...rest} />
}
