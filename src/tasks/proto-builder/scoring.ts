import type { ProtoBuilderTask } from '../../content/types'

export interface ProtoResult {
  pass: boolean       // 每个槽的 accepts 全部命中
  perfect: boolean    // pass 且没放任何干扰块
  missing: string[]   // 'slotId:blockId' 形式列出缺口
  extras: string[]    // 被放置的干扰块 id
}

export function scoreProto(task: ProtoBuilderTask, placement: Record<string, string[]>): ProtoResult {
  const missing: string[] = []
  for (const slot of task.slots) {
    const placed = placement[slot.id] ?? []
    for (const need of slot.accepts) {
      if (!placed.includes(need)) missing.push(`${slot.id}:${need}`)
    }
  }
  const distractorIds = new Set(task.blocks.filter(b => b.distractor).map(b => b.id))
  const placedAll = Object.values(placement).flat()
  const extras = [...new Set(placedAll.filter(id => distractorIds.has(id)))]
  const pass = missing.length === 0
  return { pass, perfect: pass && extras.length === 0, missing, extras }
}
