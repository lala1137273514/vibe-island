import { useState } from 'react'
import type { TrueFalseTask as TfT } from '../content/types'
import { scoreTask } from '../game/gameLogic'
import { PixelButton } from '../ui'

export function TrueFalseTask({ task, onResult }: { task: TfT; onResult: (correct: boolean) => void }) {
  const [choices, setChoices] = useState<(boolean | null)[]>(Array(task.statements.length).fill(null))
  const [result, setResult] = useState<boolean | null>(null)
  const setChoice = (i: number, v: boolean) => {
    setChoices(cs => cs.map((c, j) => (j === i ? v : c)))
    setResult(null)
  }
  const allAnswered = choices.every(c => c !== null)
  const submit = () => {
    const ok = scoreTask(task, { type: 'truefalse', choices: choices as boolean[] })
    setResult(ok)
    onResult(ok)
  }
  return (
    <div className="task truefalse-task">
      <p className="body-text task-question">判断下列说法的对错:</p>
      {task.statements.map((s, i) => (
        <div key={i} className="tf-row">
          <span className="body-text">{i + 1}. {s.text}</span>
          <span className="tf-btns">
            <PixelButton className={`tf-btn${choices[i] === true ? ' picked' : ''}`}
              aria-pressed={choices[i] === true} onClick={() => setChoice(i, true)}>对</PixelButton>
            <PixelButton className={`tf-btn${choices[i] === false ? ' picked' : ''}`}
              aria-pressed={choices[i] === false} onClick={() => setChoice(i, false)}>错</PixelButton>
          </span>
        </div>
      ))}
      <div className="panel-actions">
        <PixelButton disabled={!allAnswered || result === true} onClick={submit}>提交</PixelButton>
      </div>
      {result === true && <p className="feedback-ok">✔ 全对!{task.explain}</p>}
      {result === false && <p className="feedback-bad">✘ 有判断错的条目,调整后再提交。</p>}
    </div>
  )
}
