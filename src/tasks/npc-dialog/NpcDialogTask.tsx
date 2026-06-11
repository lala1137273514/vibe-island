import { useState } from 'react'
import type { DialogCard, NpcDialogTask as NpcT } from '../../content/types'
import { evalDialogPicks } from './scoring'
import { PixelButton } from '../../ui'

export function NpcDialogTask({ task, onResult }: { task: NpcT; onResult: (correct: boolean) => void }) {
  const [picks, setPicks] = useState<number[]>([])
  const [lastCard, setLastCard] = useState<DialogCard | null>(null)

  const progress = evalDialogPicks(task, picks)
  const roundIdx = picks.length
  const cards = progress.done === 'ongoing' ? task.rounds[roundIdx]?.cards ?? [] : []

  const pick = (i: number) => {
    if (progress.done !== 'ongoing') return
    const newPicks = [...picks, i]
    setLastCard(task.rounds[roundIdx].cards[i])
    setPicks(newPicks)
    const p = evalDialogPicks(task, newPicks)
    if (p.done === 'pass') onResult(true)
    if (p.done === 'fail') onResult(false)
  }

  const reset = () => { setPicks([]); setLastCard(null) }

  return (
    <div className="task npc-dialog-task">
      <p className="body-text task-question">🏠 访谈屋:{task.scenario}</p>
      <p className="body-text dialog-progress">📋 有效情报 {progress.collected}/{task.goal.validNeeded} ⚠️ 违规提问 {progress.violations}/{task.goal.maxViolations}</p>
      <div className="dialog-npc pixel-panel">
        <span className="npc-face">👵</span>
        <div className="body-text">
          <b>{task.npcName}:</b>{lastCard ? lastCard.reply : '哎呀来啦,想问妈什么呀?'}
          {lastCard && (
            <p className={lastCard.valid ? 'feedback-ok' : 'feedback-bad'}>
              {lastCard.valid ? '✅ 有效情报!' : '⚠️ 问废了!'}{lastCard.lesson}
            </p>
          )}
        </div>
      </div>
      {progress.done === 'ongoing' && (
        <div className="dialog-cards">
          <p className="body-text">选一张问题卡提问(第 {roundIdx + 1}/{task.rounds.length} 轮):</p>
          {cards.map((c, i) => (
            <PixelButton key={i} className="option-btn body-text" onClick={() => pick(i)}>🗨️ {c.question}</PixelButton>
          ))}
        </div>
      )}
      {progress.done === 'pass' && <p className="feedback-ok">✔ 情报集齐!你学会了用过去和事实验证需求。</p>}
      {progress.done === 'fail' && (
        <div>
          <p className="feedback-bad">✘ 全是礼貌性回答,这次访谈白做了。回想:问过去,别问未来。</p>
          <PixelButton onClick={reset}>重新拜访</PixelButton>
        </div>
      )}
    </div>
  )
}
