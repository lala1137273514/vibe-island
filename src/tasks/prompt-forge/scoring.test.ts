import { it, expect } from 'vitest'
import { scoreForge } from './scoring'
import type { PromptForgeTask } from '../../content/types'

const opt = (effective: boolean) => ({ text: 'o', effective, why: 'w', fragment: effective ? 'f' : '' })
const t: PromptForgeTask = {
  type: 'prompt-forge', brief: 'b', basePrompt: 'p',
  forgeRounds: [
    { options: [opt(true), opt(false)] },
    { options: [opt(true), opt(false)] },
    { options: [opt(true), opt(false)] },
  ],
  rubric: [], exampleGood: 'g',
}

it('3 轮全有效 → level 3, pass+perfect', () => {
  expect(scoreForge(t, [0, 0, 0])).toEqual({ level: 3, pass: true, perfect: true })
})
it('2 轮有效 → level 2, pass 非 perfect', () => {
  expect(scoreForge(t, [0, 1, 0])).toEqual({ level: 2, pass: true, perfect: false })
})
it('仅 1 轮有效 → 不过关', () => {
  expect(scoreForge(t, [0, 1, 1])).toEqual({ level: 1, pass: false, perfect: false })
})
