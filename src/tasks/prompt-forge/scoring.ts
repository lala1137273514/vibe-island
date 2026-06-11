import type { PromptForgeTask } from '../../content/types'

export interface ForgeResult { level: number; pass: boolean; perfect: boolean }

// level = 选中的有效锻打项数;≥2 过关,3 为神器(perfect)
export function scoreForge(task: PromptForgeTask, picks: number[]): ForgeResult {
  const level = picks.reduce((n, p, i) =>
    n + (task.forgeRounds[i]?.options[p]?.effective ? 1 : 0), 0)
  return { level, pass: level >= 2, perfect: level === task.forgeRounds.length }
}
