import { useState } from 'react'
import type { NpcDialogTask as NpcT } from '../../content/types'
import { evalDialogEvents } from './scoring'
import { hasAiConfig, chat } from '../../services/aiGateway'
import { PixelButton } from '../../ui'

const freeModePrompt = (task: NpcT) => `你在扮演一位中国妈妈「${task.npcName}」。你的孩子正在向你验证一个产品点子:${task.scenario}
规则:
1. 用老妈的口吻回答孩子的提问,1~3 句,口语化。
2. 如果问题在询问你过去的真实行为、具体事实、已花的钱、现有解决办法(Mom Test 的好问题),给出具体、有真实感的回答。
3. 如果问题在征求意见、谈未来假设、或诱导你认可(坏问题),给出礼貌敷衍的回答。
4. 回答之后另起一行输出审判行,格式严格为「JUDGE: valid」或「JUDGE: invalid」(valid=好问题,invalid=坏问题),不要输出其他审判值。`

interface LastReply { reply: string; lesson: string; valid: boolean }

export function NpcDialogTask({ task, onResult }: { task: NpcT; onResult: (correct: boolean) => void }) {
  const [events, setEvents] = useState<boolean[]>([])
  const [roundIdx, setRoundIdx] = useState(0)
  const [phase, setPhase] = useState<'ongoing' | 'pass' | 'fail'>('ongoing')
  const [lastReply, setLastReply] = useState<LastReply | null>(null)
  const [freeQ, setFreeQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const ai = hasAiConfig()
  const progress = evalDialogEvents(task.goal, events)
  const cardsLeft = roundIdx < task.rounds.length

  const record = (valid: boolean, reply: string, lesson: string, nextRound: number) => {
    const newEvents = [...events, valid]
    setEvents(newEvents)
    setLastReply({ reply, lesson, valid })
    const p = evalDialogEvents(task.goal, newEvents)
    if (p.done === 'pass') { setPhase('pass'); onResult(true) }
    else if (p.done === 'fail') { setPhase('fail'); onResult(false) }
    else if (nextRound >= task.rounds.length && !hasAiConfig()) { setPhase('fail'); onResult(false) }
  }

  const pickCard = (i: number) => {
    if (phase !== 'ongoing' || !cardsLeft) return
    const c = task.rounds[roundIdx].cards[i]
    setRoundIdx(roundIdx + 1)
    record(c.valid, c.reply, c.lesson, roundIdx + 1)
  }

  const askFree = async () => {
    if (!freeQ.trim() || busy || phase !== 'ongoing') return
    setBusy(true)
    setAiError(null)
    try {
      const text = await chat([
        { role: 'system', content: freeModePrompt(task) },
        { role: 'user', content: freeQ.trim() },
      ])
      const m = text.match(/JUDGE:\s*(valid|invalid)/i)
      if (!m) {
        setAiError(`AI 返回缺少审判行,原始输出:${text.slice(0, 200)} ——请再问一次。`)
        return
      }
      const valid = m[1].toLowerCase() === 'valid'
      const reply = text.replace(/JUDGE:\s*(valid|invalid)[\s\S]*/i, '').trim()
      record(valid, reply,
        valid ? '(AI 裁判)在问过去与具体事实,有效情报!' : '(AI 裁判)意见型/未来式/诱导式问题,问废了。',
        roundIdx)
      setFreeQ('')
    } catch (e) {
      setAiError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setEvents([]); setRoundIdx(0); setPhase('ongoing'); setLastReply(null); setAiError(null)
  }

  return (
    <div className="task npc-dialog-task">
      <p className="body-text task-question">🏠 访谈屋:{task.scenario}</p>
      <p className="body-text dialog-progress">📋 有效情报 {progress.collected}/{task.goal.validNeeded} ⚠️ 违规提问 {progress.violations}/{task.goal.maxViolations}</p>
      <div className="dialog-npc pixel-panel">
        <span className="npc-face">👵</span>
        <div className="body-text">
          <b>{task.npcName}:</b>{lastReply ? lastReply.reply : '哎呀来啦,想问妈什么呀?'}
          {lastReply && (
            <p className={lastReply.valid ? 'feedback-ok' : 'feedback-bad'}>
              {lastReply.valid ? '✅ 有效情报!' : '⚠️ 问废了!'}{lastReply.lesson}
            </p>
          )}
        </div>
      </div>
      {phase === 'ongoing' && cardsLeft && (
        <div className="dialog-cards">
          <p className="body-text">选一张问题卡提问(第 {roundIdx + 1}/{task.rounds.length} 轮):</p>
          {task.rounds[roundIdx].cards.map((c, i) => (
            <PixelButton key={i} className="option-btn body-text" onClick={() => pickCard(i)}>🗨️ {c.question}</PixelButton>
          ))}
        </div>
      )}
      {phase === 'ongoing' && (ai ? (
        <div className="dialog-free">
          <p className="body-text">✍️ 自由提问(AI 扮演老妈并当裁判):</p>
          <input className="fill-input dialog-free-input" aria-label="自由提问"
            value={freeQ} onChange={e => setFreeQ(e.target.value)}
            placeholder="用你自己的话问一句…" disabled={busy} />
          <PixelButton onClick={askFree} disabled={busy || !freeQ.trim()}>{busy ? '老妈思考中…' : '提问'}</PixelButton>
          {aiError && <p className="feedback-bad">✘ {aiError}</p>}
        </div>
      ) : (
        <p className="body-text ai-hint">💡 到顶栏 ⚙️ 设置接入 AI(免费 DeepSeek Key 也行),解锁「自由提问」模式。</p>
      ))}
      {phase === 'pass' && <p className="feedback-ok">✔ 情报集齐!你学会了用过去和事实验证需求。</p>}
      {phase === 'fail' && (
        <div>
          <p className="feedback-bad">✘ 这次访谈没挖到足够的真情报。回想:问过去,别问未来;要事实,不要客套。</p>
          <PixelButton onClick={reset}>重新拜访</PixelButton>
        </div>
      )}
    </div>
  )
}
