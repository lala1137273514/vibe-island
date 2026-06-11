import { it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreatorBay } from './CreatorBay'
import { saveService } from '../services/saveService'

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

beforeEach(() => localStorage.clear())

it('对话 → 生成 → 预览 → 保存上岛全流程(stub AI)', async () => {
  const chatFn = vi.fn()
    .mockResolvedValueOnce('信息够了,点「开始生成」吧!')
    .mockResolvedValueOnce('```json\n' + JSON.stringify(good) + '\n```')
  const onSaved = vi.fn()
  render(<CreatorBay onClose={vi.fn()} onSaved={onSaved} chatFn={chatFn} />)

  await userEvent.type(screen.getByLabelText('建岛需求'), '给铲屎官造一座猫猫照护入门岛')
  await userEvent.click(screen.getByRole('button', { name: '发送' }))
  expect(await screen.findByText(/信息够了/)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: '⚒️ 开始生成' }))
  expect(await screen.findByText(/猫猫岛/)).toBeInTheDocument()
  expect(screen.getByText('AI 生成')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: '⚓ 保存上岛' }))
  expect(onSaved).toHaveBeenCalled()
  const list = saveService.listCustomIslands()
  expect(list).toHaveLength(1)
  expect(list[0].def.id).toBe('custom-cat')
})

it('生成失败(两次坏输出)如实报错', async () => {
  const chatFn = vi.fn().mockResolvedValue('我拒绝输出 JSON')
  render(<CreatorBay onClose={vi.fn()} onSaved={vi.fn()} chatFn={chatFn} />)
  await userEvent.type(screen.getByLabelText('建岛需求'), '随便')
  await userEvent.click(screen.getByRole('button', { name: '⚒️ 开始生成' }))
  expect(await screen.findByText(/两次生成都未通过校验/)).toBeInTheDocument()
})
