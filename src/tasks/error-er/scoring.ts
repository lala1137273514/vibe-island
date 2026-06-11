import type { ErrorErTask } from '../../content/types'

export interface ErrorRunResult { pass: boolean; perfect: boolean; mistakes: number }

// picks[case][step] = 该步首次选择的下标;选错计 1 mistake(组件会强制重选直到正确)
// pass = mistakes < 3;perfect = 零失误
export function scoreErrorRun(task: ErrorErTask, picks: number[][]): ErrorRunResult {
  let mistakes = 0
  task.cases.forEach((c, ci) => {
    c.steps.forEach((s, si) => {
      const pick = picks[ci]?.[si]
      if (pick === undefined || !s.options[pick]?.correct) mistakes++
    })
  })
  return { pass: mistakes < 3, perfect: mistakes === 0, mistakes }
}
