import { useState } from 'react'
import type { MatchTask as MatchT } from '../content/types'
import { scoreTask } from '../state/gameLogic'

// 右列乱序展示,value 仍是原始下标,判分用 scoreTask(mapping[i]===i)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function MatchTask({ task, onResult }: { task: MatchT; onResult: (correct: boolean) => void }) {
  const [mapping, setMapping] = useState<number[]>(Array(task.pairs.length).fill(-1))
  const [result, setResult] = useState<boolean | null>(null)
  const [options] = useState(() => shuffle(task.pairs.map((p, i) => ({ text: p.right, idx: i }))))
  const allPicked = mapping.every(m => m >= 0)
  const submit = () => {
    const ok = scoreTask(task, { type: 'match', mapping })
    setResult(ok)
    onResult(ok)
  }
  return (
    <div className="task match-task">
      <p className="body-text task-question">把左边的概念和右边的解释连起来:</p>
      {task.pairs.map((p, i) => (
        <div key={i} className="match-row">
          <span className="body-text match-left">{p.left}</span>
          <select
            className="fill-input body-text"
            aria-label={`配对-${p.left}`}
            value={mapping[i]}
            onChange={e => { setMapping(m => m.map((x, j) => (j === i ? Number(e.target.value) : x))); setResult(null) }}
          >
            <option value={-1}>—— 选择 ——</option>
            {options.map(o => <option key={o.idx} value={o.idx}>{o.text}</option>)}
          </select>
        </div>
      ))}
      <div className="panel-actions">
        <button className="pixel-btn" disabled={!allPicked || result === true} onClick={submit}>提交</button>
      </div>
      {result === true && <p className="feedback-ok">✔ 全部配对正确!</p>}
      {result === false && <p className="feedback-bad">✘ 有配对不对,调整后再提交。</p>}
    </div>
  )
}
