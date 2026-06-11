import { useState } from 'react'
import type { IslandDef } from '../content/types'
import { chat, hasAiConfig } from '../services/aiGateway'
import { generateIslandDef, type ChatFn } from '../creator/createIslandFlow'
import { IslandPreview } from './IslandPreview'
import { PixelDialog, PixelButton } from '../ui'

const CAPTAIN_PROMPT = '你是「创造湾」的造岛船长,正帮用户把想法整理成一座教学岛。就用户的主题追问 1~2 个关键缺口(给谁学/想要几关/口味偏好),口语化,不超过 3 句。如果信息已经够了,就说:信息够了,点「开始生成」吧!'

interface Msg { role: 'user' | 'assistant'; content: string }

export function CreatorBay({ onClose, onSaved, chatFn = chat }: {
  onClose: () => void
  onSaved: () => void
  chatFn?: ChatFn
}) {
  const aiReady = hasAiConfig() || chatFn !== chat
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: '⚓ 欢迎来到创造湾!想造一座教什么的岛?主题不限——Python 入门、咖啡拉花、吉他和弦都行。说说你的想法,顺带讲讲给谁学。' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<IslandDef | null>(null)
  const userSaid = msgs.some(m => m.role === 'user')

  const send = async () => {
    if (!input.trim() || busy) return
    const newMsgs: Msg[] = [...msgs, { role: 'user', content: input.trim() }]
    setMsgs(newMsgs)
    setInput('')
    setBusy(true)
    setError(null)
    try {
      const reply = await chatFn([
        { role: 'system', content: CAPTAIN_PROMPT },
        ...newMsgs,
      ])
      setMsgs(ms => [...ms, { role: 'assistant', content: reply }])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const generate = async () => {
    // 没点「发送」直接生成也行:把输入框里的内容一并计入简报
    const pending = input.trim()
    const briefParts = [...msgs.filter(m => m.role === 'user').map(m => m.content), ...(pending ? [pending] : [])]
    if (!briefParts.length) return
    if (pending) {
      setMsgs(ms => [...ms, { role: 'user', content: pending }])
      setInput('')
    }
    setGenerating(true)
    setError(null)
    try {
      setDraft(await generateIslandDef(briefParts.join('\n'), chatFn))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <PixelDialog onClose={onClose} className="creator-bay">
      {draft ? (
        <IslandPreview
          def={draft}
          onBack={() => setDraft(null)}
          onRegenerate={() => { setDraft(null); generate() }}
          onSaved={onSaved}
        />
      ) : (
        <>
          <h2 className="shelf-title">⚓ 创造湾 · 和 AI 一起造你的岛</h2>
          {!aiReady ? (
            <p className="body-text">💡 造岛需要 AI。先到顶栏 ⚙️ 设置接入(免费 DeepSeek Key 也行),再回来开工。</p>
          ) : (
            <>
              <div className="creator-chat">
                {msgs.map((m, i) => (
                  <p key={i} className={`body-text chat-${m.role}`}>
                    {m.role === 'assistant' ? '🧭 ' : '🙋 '}{m.content}
                  </p>
                ))}
                {generating && <p className="body-text">⚒️ 正在铸造岛屿(生成 + 校验,约半分钟)…</p>}
              </div>
              <div className="creator-input">
                <input className="fill-input" aria-label="建岛需求" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="比如:给完全没学过编程的设计师造一座 Python 入门岛"
                  disabled={busy || generating} />
                <PixelButton onClick={send} disabled={busy || generating || !input.trim()}>{busy ? '…' : '发送'}</PixelButton>
                <PixelButton onClick={generate} disabled={(!userSaid && !input.trim()) || busy || generating}>⚒️ 开始生成</PixelButton>
              </div>
            </>
          )}
          {error && <p className="feedback-bad">✘ {error}</p>}
          <div className="panel-actions">
            <PixelButton onClick={onClose}>关闭</PixelButton>
          </div>
        </>
      )}
    </PixelDialog>
  )
}
