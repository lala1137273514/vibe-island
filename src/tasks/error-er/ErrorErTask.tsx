import { useState } from 'react'
import type { ErrorErTask as ErrorErT } from '../../content/types'
import { scoreErrorRun } from './scoring'
import { PixelButton } from '../../ui'

const countMistakes = (task: ErrorErT, picks: number[][]) =>
  picks.reduce((n, cp, ci) =>
    n + cp.filter((p, si) => !task.cases[ci].steps[si].options[p].correct).length, 0)

export function ErrorErTask({ task, onResult }: { task: ErrorErT; onResult: (correct: boolean) => void }) {
  const [caseIdx, setCaseIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [picks, setPicks] = useState<number[][]>(task.cases.map(() => []))
  const [feedback, setFeedback] = useState<string | null>(null)
  const [cured, setCured] = useState(false)
  const [failed, setFailed] = useState(false)

  const curCase = task.cases[caseIdx]
  const curStep = curCase.steps[stepIdx]
  const mistakes = countMistakes(task, picks)
  const hearts = '❤️'.repeat(Math.max(0, 3 - mistakes)) + '🖤'.repeat(Math.min(3, mistakes))

  const reset = () => {
    setCaseIdx(0); setStepIdx(0)
    setPicks(task.cases.map(() => []))
    setFeedback(null); setFailed(false); setCured(false)
  }

  const choose = (i: number) => {
    if (cured || failed) return
    const opt = curStep.options[i]
    let newPicks = picks
    if (picks[caseIdx][stepIdx] === undefined) {
      newPicks = picks.map((cp, ci) => (ci === caseIdx ? [...cp, i] : cp))
      setPicks(newPicks)
    }
    if (!opt.correct) {
      setFeedback(opt.feedback || '不对,再想想。')
      if (countMistakes(task, newPicks) >= 3) { setFailed(true); onResult(false) }
      return
    }
    setFeedback(null)
    if (stepIdx + 1 < curCase.steps.length) {
      setStepIdx(stepIdx + 1)
    } else if (caseIdx + 1 < task.cases.length) {
      setCaseIdx(caseIdx + 1)
      setStepIdx(0)
    } else {
      setCured(true)
      onResult(scoreErrorRun(task, newPicks).pass)
    }
  }

  return (
    <div className="task error-er-task">
      <p className="body-text task-question">🏥 报错急诊室 {hearts}</p>
      <p className="body-text">{task.intro}</p>
      {failed ? (
        <div>
          <p className="feedback-bad">✘ 误诊太多,病人病情加重了!复习方法论再来。</p>
          <PixelButton onClick={reset}>重新会诊</PixelButton>
        </div>
      ) : cured ? (
        <p className="feedback-ok">✔ 全部病人治愈出院!</p>
      ) : (
        <div>
          <div className="er-bed pixel-panel">
            <span className="er-patient">🤒🤖</span>
            <span className="body-text">病例 {caseIdx + 1}/{task.cases.length}:{curCase.symptom}</span>
          </div>
          <p className="body-text task-question">{curStep.prompt}</p>
          {curStep.options.map((o, i) => (
            <PixelButton key={i} className="option-btn body-text" onClick={() => choose(i)}>{o.text}</PixelButton>
          ))}
          {feedback && <p className="feedback-bad">✘ {feedback}</p>}
        </div>
      )}
    </div>
  )
}
