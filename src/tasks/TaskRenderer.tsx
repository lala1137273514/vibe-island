import { useRef } from 'react'
import type { NodeTask } from '../content/types'
import { QuizTask } from './QuizTask'
import { TrueFalseTask } from './TrueFalseTask'
import { MatchTask } from './MatchTask'
import { FillPromptTask } from './FillPromptTask'

// 按 task.type 分发;跟踪「首次尝试是否就对」决定 star
export function TaskRenderer({ task, onPass }: { task: NodeTask; onPass: (star: boolean) => void }) {
  const firstTry = useRef(true)
  const handleResult = (correct: boolean) => {
    if (correct) onPass(firstTry.current)
    else firstTry.current = false
  }
  switch (task.type) {
    case 'quiz': return <QuizTask task={task} onResult={handleResult} />
    case 'truefalse': return <TrueFalseTask task={task} onResult={handleResult} />
    case 'match': return <MatchTask task={task} onResult={handleResult} />
    case 'fill-prompt': return <FillPromptTask task={task} onResult={handleResult} />
  }
}
