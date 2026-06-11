import { useState } from 'react'
import type { FillPromptTask as FillT } from '../../content/types'
import { scoreTask } from '../../game/gameLogic'
import { PixelButton } from '../../ui'

export function FillPromptTask({ task, onResult }: { task: FillT; onResult: (correct: boolean) => void }) {
  const parts = task.template.split('___')
  const [values, setValues] = useState<string[]>(Array(task.blanks.length).fill(''))
  const [result, setResult] = useState<boolean | null>(null)
  const submit = () => {
    const ok = scoreTask(task, { type: 'fill-prompt', values })
    setResult(ok)
    onResult(ok)
  }
  return (
    <div className="task fill-task">
      <p className="body-text task-question">把提示词补充完整:</p>
      <p className="body-text fill-template">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < task.blanks.length && (
              <input
                className="fill-input"
                aria-label={`空${i + 1}`}
                value={values[i]}
                onChange={e => { setValues(v => v.map((x, j) => (j === i ? e.target.value : x))); setResult(null) }}
              />
            )}
          </span>
        ))}
      </p>
      <ul className="body-text fill-hints">
        {task.blanks.map((b, i) => <li key={i}>空{i + 1} 提示:{b.hint}</li>)}
      </ul>
      <div className="panel-actions">
        <PixelButton disabled={result === true} onClick={submit}>提交</PixelButton>
      </div>
      {result === true && <p className="feedback-ok">✔ 答对了!{task.explain}</p>}
      {result === false && <p className="feedback-bad">✘ 还差一点,看看提示再试试。</p>}
    </div>
  )
}
