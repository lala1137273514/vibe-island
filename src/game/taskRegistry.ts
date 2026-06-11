import type { ComponentType } from 'react'
import type { TaskType } from '../content/types'

// 玩法插件:Component 的 task prop 由各插件内部窄化,这里用 never 占位避免協变问题
export interface TaskPlugin {
  type: TaskType
  Component: ComponentType<{ task: never; onResult: (correct: boolean) => void }>
}

const plugins = new Map<TaskType, TaskPlugin>()

export function registerTask(p: TaskPlugin) {
  if (plugins.has(p.type)) throw new Error(`任务类型已注册: ${p.type}`)
  plugins.set(p.type, p)
}

export function getTaskPlugin(type: TaskType): TaskPlugin {
  const p = plugins.get(type)
  if (!p) throw new Error(`任务类型未注册: ${type}`)
  return p
}

export function listTaskTypes(): TaskType[] {
  return [...plugins.keys()]
}

// 仅测试用
export function resetRegistry() {
  plugins.clear()
}
