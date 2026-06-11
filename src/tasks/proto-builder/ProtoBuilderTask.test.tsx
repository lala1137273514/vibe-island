import { it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProtoBuilderTask } from './ProtoBuilderTask'
import type { ProtoBuilderTask as ProtoT } from '../../content/types'

const t: ProtoT = {
  type: 'proto-builder', brief: '按需求拼出原型',
  slots: [
    { id: 'top', label: '顶栏', accepts: ['title'] },
    { id: 'main', label: '主区', accepts: ['form'] },
  ],
  blocks: [
    { id: 'title', label: '标题栏', emoji: '🏷️' },
    { id: 'form', label: '商品表单', emoji: '📋' },
    { id: 'vip', label: '会员弹窗', emoji: '💰', distractor: true },
  ],
}

it('放对全部必选块后检查 → onResult(true)', async () => {
  const onResult = vi.fn()
  render(<ProtoBuilderTask task={t} onResult={onResult} />)
  await userEvent.click(screen.getByRole('button', { name: /标题栏/ }))
  await userEvent.click(screen.getByRole('button', { name: '槽-顶栏' }))
  await userEvent.click(screen.getByRole('button', { name: /商品表单/ }))
  await userEvent.click(screen.getByRole('button', { name: '槽-主区' }))
  await userEvent.click(screen.getByRole('button', { name: '检查原型' }))
  expect(onResult).toHaveBeenCalledWith(true)
  expect(screen.getByText(/原型结构达标/)).toBeInTheDocument()
})

it('缺块检查 → onResult(false) 且指出缺什么', async () => {
  const onResult = vi.fn()
  render(<ProtoBuilderTask task={t} onResult={onResult} />)
  await userEvent.click(screen.getByRole('button', { name: /标题栏/ }))
  await userEvent.click(screen.getByRole('button', { name: '槽-顶栏' }))
  await userEvent.click(screen.getByRole('button', { name: '检查原型' }))
  expect(onResult).toHaveBeenCalledWith(false)
  expect(screen.getByText(/缺:.*商品表单/)).toBeInTheDocument()
})
