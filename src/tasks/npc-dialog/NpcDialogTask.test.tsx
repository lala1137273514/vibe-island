import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NpcDialogTask } from './NpcDialogTask'
import type { NpcDialogTask as NpcT } from '../../content/types'

const t: NpcT = {
  type: 'npc-dialog', npcName: '老妈', scenario: '验证你的产品点子',
  rounds: [
    { cards: [
      { question: '你最近一次遇到这个问题是什么时候?', valid: true, reply: '上周就遇到了', lesson: '问过去=有效' },
      { question: '你觉得我的点子怎么样?', valid: false, reply: '挺好的呀!', lesson: '夸奖不是数据' }] },
    { cards: [
      { question: '你现在怎么解决的?', valid: true, reply: '用 Excel 硬撑', lesson: '现状=有效' },
      { question: '如果有你会用吗?', valid: false, reply: '应该会吧', lesson: '未来不可信' }] },
    { cards: [
      { question: '你为此花过钱吗?', valid: true, reply: '上月买过课', lesson: '成本=有效' },
      { question: '你愿意付费吗?', valid: false, reply: '看情况啦', lesson: '假设性付费不可信' }] },
  ],
  goal: { validNeeded: 3, maxViolations: 3 },
}

it('渲染场景,连选 3 张有效卡 → onResult(true)', async () => {
  const onResult = vi.fn()
  render(<NpcDialogTask task={t} onResult={onResult} />)
  expect(screen.getByText(/验证你的产品点子/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /最近一次遇到这个问题/ }))
  expect(screen.getByText(/有效情报 1\/3/)).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /你现在怎么解决的/ }))
  await userEvent.click(screen.getByRole('button', { name: /你为此花过钱吗/ }))
  expect(onResult).toHaveBeenCalledWith(true)
  expect(screen.getByText(/情报集齐/)).toBeInTheDocument()
})

it('选违规卡显示问废反馈', async () => {
  const onResult = vi.fn()
  render(<NpcDialogTask task={t} onResult={onResult} />)
  await userEvent.click(screen.getByRole('button', { name: /你觉得我的点子怎么样/ }))
  expect(screen.getByText(/问废了/)).toBeInTheDocument()
  expect(onResult).not.toHaveBeenCalled()
})
