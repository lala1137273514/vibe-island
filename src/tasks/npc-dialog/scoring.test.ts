import { it, expect } from 'vitest'
import { evalDialogPicks, evalDialogEvents } from './scoring'
import type { NpcDialogTask } from '../../content/types'

const card = (valid: boolean) => ({ question: 'q', valid, reply: 'r', lesson: 'l' })
const t: NpcDialogTask = {
  type: 'npc-dialog', npcName: '老妈', scenario: 's',
  rounds: [
    { cards: [card(true), card(false)] },
    { cards: [card(true), card(false)] },
    { cards: [card(true), card(false)] },
    { cards: [card(true), card(false)] },
  ],
  goal: { validNeeded: 3, maxViolations: 3 },
}

it('集满 3 张有效情报 → pass', () => {
  expect(evalDialogPicks(t, [0, 0, 0])).toEqual({ collected: 3, violations: 0, done: 'pass' })
})

it('违规 3 次 → fail', () => {
  expect(evalDialogPicks(t, [1, 1, 1])).toEqual({ collected: 0, violations: 3, done: 'fail' })
})

it('中途 → ongoing', () => {
  expect(evalDialogPicks(t, [0])).toEqual({ collected: 1, violations: 0, done: 'ongoing' })
})

it('轮次用尽仍不达标 → fail', () => {
  expect(evalDialogPicks(t, [0, 1, 0, 1]).done).toBe('fail')
})

it('evalDialogEvents:卡牌+自由提问的综合事件流判定', () => {
  const goal = { validNeeded: 2, maxViolations: 2 }
  expect(evalDialogEvents(goal, [true, true])).toEqual({ collected: 2, violations: 0, done: 'pass' })
  expect(evalDialogEvents(goal, [false, false])).toEqual({ collected: 0, violations: 2, done: 'fail' })
  expect(evalDialogEvents(goal, [true])).toEqual({ collected: 1, violations: 0, done: 'ongoing' })
})
