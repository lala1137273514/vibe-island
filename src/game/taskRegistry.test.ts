import { it, expect, beforeEach } from 'vitest'
import { registerTask, getTaskPlugin, listTaskTypes, resetRegistry } from './taskRegistry'

const Dummy = () => null

beforeEach(() => resetRegistry())

it('注册后可按 type 取回,并出现在类型列表', () => {
  registerTask({ type: 'quiz', Component: Dummy })
  expect(getTaskPlugin('quiz').Component).toBe(Dummy)
  expect(listTaskTypes()).toContain('quiz')
})

it('重复注册同 type 报错', () => {
  registerTask({ type: 'quiz', Component: Dummy })
  expect(() => registerTask({ type: 'quiz', Component: Dummy })).toThrow(/已注册/)
})

it('取用未注册 type 报错', () => {
  expect(() => getTaskPlugin('match')).toThrow(/未注册/)
})
