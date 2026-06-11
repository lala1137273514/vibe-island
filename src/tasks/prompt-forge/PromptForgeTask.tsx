import { useState } from 'react'
import type { PromptForgeTask as ForgeT } from '../../content/types'
import { scoreForge } from './scoring'
import { hasAiConfig, chat } from '../../services/aiGateway'
import { PixelButton } from '../../ui'

const FIRE = ['🕯️ 生铁', '🔥 粗坯', '🔥🔥 精铁', '🔥🔥🔥 神器'] as const

const judgePrompt = (task: ForgeT) => `你是提示词评分员。任务背景:${task.brief}。
请按以下要点逐条检查用户提交的提示词:
${task.rubric.map((r, i) => `${i + 1}. ${r}`).join('\n')}
先给 2~3 句中文点评(哪些要点命中/缺失),最后另起一行输出总分,格式严格为「SCORE: n/5」(n 为 0 到 5 的整数,要点覆盖越全分越高,全部覆盖且表述清晰给 5)。`

export function PromptForgeTask({ task, onResult }: { task: ForgeT; onResult: (correct: boolean) => void }) {
  const [picks, setPicks] = useState<number[]>([])
  const [lastWhy, setLastWhy] = useState<string | null>(null)
  const [mode, setMode] = useState<'basic' | 'live'>('basic')
  const [livePrompt, setLivePrompt] = useState('')
  const [liveResult, setLiveResult] = useState<{ score: number; comment: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const ai = hasAiConfig()

  const submitLive = async () => {
    if (!livePrompt.trim() || busy) return
    setBusy(true)
    setAiError(null)
    try {
      const text = await chat([
        { role: 'system', content: judgePrompt(task) },
        { role: 'user', content: livePrompt },
      ], { temperature: 0.2 })
      const m = text.match(/SCORE:\s*([0-5])\s*\/\s*5/i)
      if (!m) {
        setAiError(`AI 返回缺少 SCORE 行,原始输出:${text.slice(0, 200)} ——请重试。`)
        return
      }
      const score = Number(m[1])
      setLiveResult({ score, comment: text.replace(/SCORE:[\s\S]*/i, '').trim() })
      onResult(score >= 3)
    } catch (e) {
      setAiError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

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

  if (mode === 'live') {
    return (
      <div className="task prompt-forge-task">
        <p className="body-text task-question">⚒️ 提示词锻造铺 · 实战模式:{task.brief}</p>
        <p className="body-text">亲手写一条完整提示词,AI 师傅按原文要点验货打分(≥3/5 出师):</p>
        <textarea className="fill-input forge-live-input" aria-label="实战提示词"
          rows={5} value={livePrompt} onChange={e => setLivePrompt(e.target.value)}
          placeholder="把你的点子写成一条完整的提示词…" disabled={busy} />
        <div className="panel-actions">
          <PixelButton onClick={() => setMode('basic')}>← 卡牌锻打</PixelButton>
          <PixelButton onClick={submitLive} disabled={busy || !livePrompt.trim()}>{busy ? 'AI 验货中…' : '交给 AI 评分'}</PixelButton>
        </div>
        {aiError && <p className="feedback-bad">✘ {aiError}</p>}
        {liveResult && (
          <div>
            <p className={liveResult.score >= 3 ? 'feedback-ok' : 'feedback-bad'}>
              {liveResult.score >= 3 ? '✔' : '✘'} 评分 {liveResult.score}/5 {liveResult.score === 5 ? '——满分神器!' : ''}
            </p>
            <p className="body-text">{liveResult.comment}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="task prompt-forge-task">
      <p className="body-text task-question">⚒️ 提示词锻造铺:{task.brief}</p>
      {ai && <PixelButton className="hud-btn" onClick={() => setMode('live')}>⚒️ 实战模式(真打一发 AI)</PixelButton>}
      {!ai && <p className="body-text ai-hint">💡 到顶栏 ⚙️ 设置接入 AI,解锁「实战模式」:亲手写提示词让 AI 评分。</p>}
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
