import { it, expect, vi } from 'vitest'
import { generateIslandDef, extractJson, hashSeed } from './createIslandFlow'

const validNode = (id: string, order: number) => ({
  id, title: `关卡${order}`, chapterSlug: 'cat', kind: 'main', order,
  learn: [
    { title: '卡一', body: '这是一段不少于二十个字的正经教学内容,讲清楚一个知识点。' },
    { title: '卡二', body: '这也是一段不少于二十个字的正经教学内容,再讲一个知识点。' },
  ],
  task: { type: 'quiz', question: '猫有几条腿?', options: ['一', '二', '三', '四'], answerIndex: 3, explain: '四条。' },
  coins: 10,
  position: { x: 20 * order, y: 60 },
})
const good = {
  id: 'custom-cat', name: '猫猫岛', region: 'stage-1', lockedByDefault: false,
  nodes: [validNode('custom-cat-1', 1), validNode('custom-cat-2', 2), validNode('custom-cat-3', 3)],
}

it('extractJson 提取 ```json 围栏;无围栏报错', () => {
  expect(extractJson('前言 ```json\n{"a":1}\n``` 后语')).toBe('{"a":1}')
  expect(() => extractJson('裸文本没有围栏')).toThrow(/围栏/)
})

it('首次输出坏 JSON → 回喂错误重试一次成功', async () => {
  const chatFn = vi.fn()
    .mockResolvedValueOnce('好的!```json\n{"id":"custom-x"}\n```')
    .mockResolvedValueOnce('```json\n' + JSON.stringify(good) + '\n```')
  const def = await generateIslandDef('做一座猫猫岛', chatFn)
  expect(def.id).toBe('custom-cat')
  expect(chatFn).toHaveBeenCalledTimes(2)
  // 第二次调用应包含错误回喂
  const retryMessages = chatFn.mock.calls[1][0] as { role: string; content: string }[]
  expect(retryMessages.at(-1)!.content).toMatch(/没有通过校验/)
})

it('两次都坏 → 如实抛错(不静默修补)', async () => {
  const chatFn = vi.fn().mockResolvedValue('我拒绝输出 JSON')
  await expect(generateIslandDef('猫', chatFn)).rejects.toThrow(/两次/)
})

it('hashSeed 确定性', () => {
  expect(hashSeed('猫猫岛')).toBe(hashSeed('猫猫岛'))
  expect(hashSeed('猫猫岛')).not.toBe(hashSeed('狗狗岛'))
})
