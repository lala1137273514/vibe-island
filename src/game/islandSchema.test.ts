import { it, expect } from 'vitest'
import { validateGeneratedIsland } from './islandSchema'

const validNode = (id: string, order: number) => ({
  id, title: `关卡${order}`, chapterSlug: 'cat-basics', kind: 'main', order,
  learn: [
    { title: '卡一', body: '这是一段不少于二十个字的正经教学内容,讲清楚一个知识点。' },
    { title: '卡二', body: '这也是一段不少于二十个字的正经教学内容,再讲一个知识点。' },
  ],
  task: { type: 'quiz', question: '猫有几条腿?', options: ['一', '二', '三', '四'], answerIndex: 3, explain: '四条。' },
  coins: 10,
  position: { x: 20 * order, y: 60 },
})

const validIsland = () => ({
  id: 'custom-cat',
  name: '猫猫岛',
  region: 'stage-1',
  lockedByDefault: false,
  nodes: [validNode('custom-cat-1', 1), validNode('custom-cat-2', 2), validNode('custom-cat-3', 3)],
})

it('合法生成岛通过校验', () => {
  const def = validateGeneratedIsland(validIsland())
  expect(def.id).toBe('custom-cat')
  expect(def.nodes).toHaveLength(3)
})

it('learn 卡不足 2 张拒绝,错误含字段路径', () => {
  const bad = validIsland()
  bad.nodes[0].learn = [bad.nodes[0].learn[0]]
  expect(() => validateGeneratedIsland(bad)).toThrow(/nodes\.0\.learn/)
})

it('quiz answerIndex 越界拒绝', () => {
  const bad = validIsland()
  bad.nodes[1].task.answerIndex = 7
  expect(() => validateGeneratedIsland(bad)).toThrow(/answerIndex/)
})

it('未知任务类型拒绝', () => {
  const bad = validIsland()
  ;(bad.nodes[2].task as { type: string }).type = 'boss-fight'
  expect(() => validateGeneratedIsland(bad)).toThrow(/task/)
})

it('节点少于 3 个拒绝', () => {
  const bad = validIsland()
  bad.nodes = bad.nodes.slice(0, 2)
  expect(() => validateGeneratedIsland(bad)).toThrow(/nodes/)
})

it('主线 order 不连续拒绝;岛 id 不带 custom- 前缀拒绝', () => {
  const gap = validIsland()
  gap.nodes[2].order = 5
  expect(() => validateGeneratedIsland(gap)).toThrow(/order/)
  const badId = validIsland()
  badId.id = 'cat'
  expect(() => validateGeneratedIsland(badId)).toThrow(/custom-/)
})
