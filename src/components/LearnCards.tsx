import { useState } from 'react'
import type { LearnCard } from '../content/types'
import { PixelButton } from '../ui'

export function LearnCards({ cards, onAllRead }: { cards: LearnCard[]; onAllRead: () => void }) {
  const [idx, setIdx] = useState(0)
  const card = cards[idx]
  const last = idx === cards.length - 1
  return (
    <div className="learn-cards">
      <div className="learn-card">
        <h3 className="learn-card-title">📖 {card.title}</h3>
        <p className="body-text">{card.body}</p>
      </div>
      <div className="panel-actions">
        <span className="page-indicator">{idx + 1} / {cards.length}</span>
        <PixelButton disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>上一页</PixelButton>
        {last
          ? <PixelButton onClick={onAllRead}>开始挑战</PixelButton>
          : <PixelButton onClick={() => setIdx(i => i + 1)}>下一页</PixelButton>}
      </div>
    </div>
  )
}
