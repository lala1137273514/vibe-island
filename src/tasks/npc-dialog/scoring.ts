import type { NpcDialogTask } from '../../content/types'

export interface DialogProgress {
  collected: number
  violations: number
  done: 'pass' | 'fail' | 'ongoing'
}

// 顺序结算每轮选卡:有效卡集情报,违规卡记违规;
// 达到 validNeeded → pass;违规满 maxViolations 或轮次用尽未达标 → fail;否则 ongoing
export function evalDialogPicks(task: NpcDialogTask, picks: number[]): DialogProgress {
  let collected = 0
  let violations = 0
  for (let i = 0; i < picks.length; i++) {
    const cardPick = task.rounds[i]?.cards[picks[i]]
    if (!cardPick) continue
    if (cardPick.valid) collected++
    else violations++
    if (collected >= task.goal.validNeeded) return { collected, violations, done: 'pass' }
    if (violations >= task.goal.maxViolations) return { collected, violations, done: 'fail' }
  }
  const done = picks.length >= task.rounds.length ? 'fail' : 'ongoing'
  return { collected, violations, done }
}
