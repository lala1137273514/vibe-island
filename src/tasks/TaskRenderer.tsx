import { useRef } from 'react'
import type { NodeTask } from '../content/types'
import { getTaskPlugin } from '../game/taskRegistry'

// 经注册表分发玩法组件;跟踪「首次尝试是否就对」决定 star
export function TaskRenderer({ task, onPass }: { task: NodeTask; onPass: (star: boolean) => void }) {
  const firstTry = useRef(true)
  const handleResult = (correct: boolean) => {
    if (correct) onPass(firstTry.current)
    else firstTry.current = false
  }
  const plugin = getTaskPlugin(task.type)
  return <plugin.Component task={task as never} onResult={handleResult} />
}
