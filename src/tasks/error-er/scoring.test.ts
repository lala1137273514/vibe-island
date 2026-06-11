import { it, expect } from 'vitest'
import { scoreErrorRun } from './scoring'
import type { ErrorErTask } from '../../content/types'

const t: ErrorErTask = { type: 'error-er', intro: '', cases: [{ symptom: '白屏', steps: [
  { prompt: '第一步?', options: [
    { text: '先截图问AI', correct: true, feedback: '' },
    { text: '先开F12', correct: false, feedback: '原文:不要急着打开F12' }] },
  { prompt: 'AI要更多信息,看哪?', options: [
    { text: 'Console', correct: true, feedback: '' },
    { text: 'Network', correct: false, feedback: '' }] },
]}]}

it('全对 pass+perfect', () => {
  expect(scoreErrorRun(t, [[0, 0]])).toEqual({ pass: true, perfect: true, mistakes: 0 })
})

it('错 1 步仍可过(mistakes<3)但非 perfect', () => {
  expect(scoreErrorRun(t, [[1, 0]])).toEqual({ pass: true, perfect: false, mistakes: 1 })
})

it('错满 3 步判失败', () => {
  const t3: ErrorErTask = { ...t, cases: [{ ...t.cases[0],
    steps: [...t.cases[0].steps, ...t.cases[0].steps, ...t.cases[0].steps] }] }
  expect(scoreErrorRun(t3, [[1, 1, 1, 0, 0, 0]]).pass).toBe(false)
  expect(scoreErrorRun(t3, [[1, 1, 1, 0, 0, 0]]).mistakes).toBe(3)
})
