import { useState } from 'react'
import type { PromptForgeTask as ForgeT } from '../../content/types'
import { scoreForge } from './scoring'
import { PixelButton } from '../../ui'

const FIRE = ['🕯️ 生铁', '🔥 粗坯', '🔥🔥 精铁', '🔥🔥🔥 神器'] as const

export function PromptForgeTask({ task, onResult }: { task: ForgeT; onResult: (correct: boolean) => void }) {
  const [picks, setPicks] = useState<number[]>([])
  const [lastWhy, setLastWhy] = useState<string | null>(null)

  const result = scoreForge(task, picks)
  const finished = picks.length >= task.forgeRounds.length
  const forged = task.basePrompt + picks
    .map((p, i) => task.forgeRounds[i].options[p].fragment)
    .filter(Boolean)
    .map(f => `\n${f}`)
    .join('')

  const pick = (i: number) => {
    if (finished) return
    const roundIdx = picks.length
    const opt = task.forgeRounds[roundIdx].options[i]
    const newPicks = [...picks, i]
    setLastWhy(`${opt.effective ? '✨ 锻打有效!' : '💨 这一锤打空了。'}${opt.why}`)
    setPicks(newPicks)
    if (newPicks.length >= task.forgeRounds.length) onResult(scoreForge(task, newPicks).pass)
  }

  const reset = () => { setPicks([]); setLastWhy(null) }

  return (
    <div className="task prompt-forge-task">
      <p className="body-text task-question">⚒️ 提示词锻造铺:{task.brief}</p>
      <p className="body-text forge-level">{FIRE[Math.min(result.level, FIRE.length - 1)]}</p>
      <pre className="body-text fill-template forge-prompt">{forged}</pre>
      {lastWhy && <p className="body-text forge-why">{lastWhy}</p>}
      {!finished ? (
        <div>
          <p className="body-text">选一记锻打(第 {picks.length + 1}/{task.forgeRounds.length} 锤):</p>
          {task.forgeRounds[picks.length].options.map((o, i) => (
            <PixelButton key={i} className="option-btn body-text" onClick={() => pick(i)}>⚒️ {o.text}</PixelButton>
          ))}
        </div>
      ) : result.pass ? (
        <div>
          <p className="feedback-ok">✔ 出炉!{result.perfect ? '三锤全中,锻出神器!' : '能用的好铁,还能更锋利。'}</p>
          <p className="body-text">原文参考模板:</p>
          <pre className="body-text fill-template">{task.exampleGood}</pre>
        </div>
      ) : (
        <div>
          <p className="feedback-bad">✘ 火候不够,这块铁还是废料。想想原文方法论,重打!</p>
          <PixelButton onClick={reset}>重新锻造</PixelButton>
        </div>
      )}
    </div>
  )
}
