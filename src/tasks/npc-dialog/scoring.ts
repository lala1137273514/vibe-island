import type { NpcDialogTask } from '../../content/types'

export interface DialogProgress {
  collected: number
  violations: number
  done: 'pass' | 'fail' | 'ongoing'
}

// 综合事件流判定(卡牌选择与 AI 自由提问共用):valids[i]=第 i 次提问是否有效
export function evalDialogEvents(
  goal: NpcDialogTask['goal'], valids: boolean[],
): DialogProgress {
  let collected = 0
  let violations = 0
  for (const v of valids) {
    if (v) collected++
    else violations++
    if (collected >= goal.validNeeded) return { collected, violations, done: 'pass' }
    if (violations >= goal.maxViolations) return { collected, violations, done: 'fail' }
  }
  return { collected, violations, done: 'ongoing' }
}

// 顺序结算每轮选卡:有效卡集情报,违规卡记违规;
// 达到 validNeeded → pass;违规满 maxViolations 或轮次用尽未达标 → fail;否则 ongoing
export function evalDialogPicks(task: NpcDialogTask, picks: number[]): DialogProgress {
  const valids = picks
    .map((p, i) => task.rounds[i]?.cards[p])
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map(c => c.valid)
  const r = evalDialogEvents(task.goal, valids)
  if (r.done === 'ongoing' && picks.length >= task.rounds.length) return { ...r, done: 'fail' }
  return r
}
