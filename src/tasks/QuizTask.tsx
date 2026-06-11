import { useState } from 'react'
import type { QuizTask as QuizT } from '../content/types'
import { scoreTask } from '../state/gameLogic'

export function QuizTask({ task, onResult }: { task: QuizT; onResult: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const pick = (i: number) => {
    setPicked(i)
    onResult(scoreTask(task, { type: 'quiz', choice: i }))
  }
  const correct = picked !== null && picked === task.answerIndex
  return (
    <div className="task quiz-task">
      <p className="body-text task-question">{task.question}</p>
      {task.options.map((o, i) => (
        <button
          key={i}
          className={`pixel-btn option-btn body-text${picked === i ? (i === task.answerIndex ? ' correct' : ' wrong') : ''}`}
          disabled={correct}
          onClick={() => pick(i)}
        >{o}</button>
      ))}
      {picked !== null && (correct
        ? <p className="feedback-ok">✔ 答对了!{task.explain}</p>
        : <p className="feedback-bad">✘ 不对,再想想。</p>)}
    </div>
  )
}
